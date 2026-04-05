const token = localStorage.getItem('bootcamp_token');
if (!token) window.location.href = './';

const params = new URLSearchParams(window.location.search);
const moduleId = parseInt(params.get('id'));
if (!moduleId) window.location.href = 'dashboard.html';

let chatbot;

async function loadModule() {
  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    // Load module content, progress, and assessments in parallel
    const [modRes, progRes, assessRes] = await Promise.all([
      fetch(`api/curriculum/${moduleId}`),
      fetch(`api/progress`, { headers }),
      fetch(`api/assessments/${moduleId}`, { headers })
    ]);

    const mod = await modRes.json();
    const progress = await progRes.json();
    const existingAssessments = await assessRes.json();

    // Set header
    document.getElementById('module-title-header').textContent = `Module ${mod.id}: ${mod.title}`;
    document.title = `${mod.title} — Claude Code Bootcamp`;

    // Build assessment HTML
    const questions = mod.questions || [];
    let assessmentHTML = '';
    if (questions.length > 0) {
      const questionItems = questions.map((q, i) => {
        const existing = existingAssessments.find(a => a.question_index === i);
        return `
          <div class="assessment-question" id="question-${i}">
            <p class="question-text"><strong>Q${i + 1}:</strong> ${q}</p>
            <textarea class="assessment-answer" id="answer-${i}" placeholder="Type your answer here..." rows="3"${existing ? ' disabled' : ''}>${existing ? existing.answer : ''}</textarea>
            <div class="assessment-actions">
              ${existing
                ? `<div class="score-display scored">
                     <span class="score-badge score-${existing.score >= 8 ? 'high' : existing.score >= 5 ? 'mid' : 'low'}">${existing.score}/10</span>
                     <span class="score-feedback">${existing.feedback}</span>
                   </div>`
                : `<button class="btn btn-primary btn-small" onclick="submitAnswer(${i})">Submit Answer</button>
                   <div class="score-display" id="score-${i}"></div>`
              }
            </div>
          </div>`;
      }).join('');

      assessmentHTML = `
        <div class="assessment-section">
          <h4>Check Your Understanding</h4>
          <p class="assessment-intro">Answer all questions below to complete this module. Each answer is scored 1-10 by the AI tutor.</p>
          ${questionItems}
        </div>`;
    }

    // Render content — replace the static check-understanding div with the interactive assessment
    let content = mod.content;
    content = content.replace(/<div class="check-understanding">[\s\S]*?<\/div>/, '');

    document.getElementById('module-content').innerHTML = `
      <div class="module-content-inner">
        <div class="module-meta">
          <span class="module-duration-badge">${mod.duration}</span>
          <span class="module-number-badge">Module ${mod.id} of 8</span>
        </div>
        ${content}
        ${assessmentHTML}
      </div>
    `;

    // Mark as started
    const currentProgress = progress.find(p => p.module_id === moduleId);
    if (!currentProgress || currentProgress.status === 'not_started') {
      await fetch(`api/progress/${moduleId}/start`, { method: 'POST', headers });
    }

    // Show complete button only if all questions are answered
    const completeBtn = document.getElementById('complete-btn');
    const allAnswered = questions.length > 0 && existingAssessments.length >= questions.length;
    const isCompleted = currentProgress && currentProgress.status === 'completed';

    if (isCompleted) {
      completeBtn.style.display = 'block';
      completeBtn.textContent = 'Completed!';
      completeBtn.disabled = true;
      completeBtn.classList.add('btn-completed');
    } else if (allAnswered) {
      completeBtn.style.display = 'block';
      completeBtn.addEventListener('click', async () => {
        await fetch(`api/progress/${moduleId}/complete`, { method: 'POST', headers });
        completeBtn.textContent = 'Completed!';
        completeBtn.disabled = true;
        completeBtn.classList.add('btn-completed');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
      });
    } else {
      completeBtn.style.display = 'none';
    }

    // Initialize chatbot
    chatbot = new Chatbot(moduleId, token);
    chatbot.loadHistory();

  } catch (err) {
    console.error('Failed to load module:', err);
    document.getElementById('module-content').innerHTML = '<p>Failed to load module. Please try again.</p>';
  }
}

async function submitAnswer(questionIndex) {
  const textarea = document.getElementById(`answer-${questionIndex}`);
  const answer = textarea.value.trim();
  if (!answer) { alert('Please type an answer first.'); return; }

  const btn = textarea.parentElement.querySelector('button');
  const scoreEl = document.getElementById(`score-${questionIndex}`);
  btn.disabled = true;
  btn.textContent = 'Grading...';
  scoreEl.innerHTML = '<span class="grading-spinner">Evaluating your answer...</span>';

  try {
    const res = await fetch(`api/assessments/${moduleId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ questionIndex, answer })
    });

    const result = await res.json();
    if (result.error) {
      scoreEl.innerHTML = `<span class="score-error">${result.error}</span>`;
      btn.disabled = false;
      btn.textContent = 'Submit Answer';
      return;
    }

    // Show score
    const level = result.score >= 8 ? 'high' : result.score >= 5 ? 'mid' : 'low';
    scoreEl.innerHTML = `
      <span class="score-badge score-${level}">${result.score}/10</span>
      <span class="score-feedback">${result.feedback}</span>
    `;
    scoreEl.classList.add('scored');
    textarea.disabled = true;
    btn.style.display = 'none';

    // Check if all questions now answered — show complete button
    const allScored = document.querySelectorAll('.score-display.scored');
    const totalQuestions = document.querySelectorAll('.assessment-question').length;
    if (allScored.length >= totalQuestions) {
      const completeBtn = document.getElementById('complete-btn');
      completeBtn.style.display = 'block';
      completeBtn.addEventListener('click', async () => {
        const headers = { 'Authorization': `Bearer ${token}` };
        await fetch(`api/progress/${moduleId}/complete`, { method: 'POST', headers });
        completeBtn.textContent = 'Completed!';
        completeBtn.disabled = true;
        completeBtn.classList.add('btn-completed');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
      });
    }
  } catch (err) {
    scoreEl.innerHTML = '<span class="score-error">Failed to grade. Please try again.</span>';
    btn.disabled = false;
    btn.textContent = 'Submit Answer';
  }
}

// Mobile chatbot toggle
const toggle = document.getElementById('chatbot-toggle');
const panel = document.querySelector('.chatbot-panel');
if (toggle && panel) {
  toggle.addEventListener('click', () => {
    panel.classList.toggle('mobile-open');
    toggle.classList.toggle('active');
  });
}

loadModule();
