const token = localStorage.getItem('bootcamp_token');
const name = localStorage.getItem('bootcamp_name');

if (!token) window.location.href = './';

document.getElementById('participant-name').textContent = name || 'Participant';
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = './';
});

async function loadDashboard() {
  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    const [currRes, progRes] = await Promise.all([
      fetch(`api/curriculum`),
      fetch(`api/progress`, { headers })
    ]);

    const curriculum = await currRes.json();
    const progress = await progRes.json();

    const progressMap = {};
    progress.forEach(p => { progressMap[p.module_id] = p.status; });

    const completedCount = progress.filter(p => p.status === 'completed').length;
    document.getElementById('progress-count').textContent = completedCount;
    document.getElementById('progress-bar').style.width = `${(completedCount / curriculum.length) * 100}%`;

    const grid = document.getElementById('modules-grid');
    grid.innerHTML = '';

    curriculum.forEach((mod, index) => {
      const status = progressMap[mod.id] || 'not_started';
      const prevCompleted = index === 0 || progressMap[curriculum[index - 1].id] === 'completed';
      const isAvailable = prevCompleted && status !== 'completed';
      const isCompleted = status === 'completed';
      const isLocked = !prevCompleted && !isCompleted;

      const card = document.createElement('div');
      card.className = `module-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${isAvailable ? 'available' : ''}`;

      let statusIcon, statusText;
      if (isCompleted) {
        statusIcon = '<span class="status-icon completed-icon">&#10003;</span>';
        statusText = 'Completed';
      } else if (isAvailable) {
        statusIcon = '<span class="status-icon available-icon">&#9654;</span>';
        statusText = status === 'in_progress' ? 'In Progress' : 'Start';
      } else {
        statusIcon = '<span class="status-icon locked-icon">&#128274;</span>';
        statusText = 'Locked';
      }

      card.innerHTML = `
        <div class="module-card-header">
          <span class="module-number">Module ${mod.id}</span>
          <span class="module-duration">${mod.duration}</span>
        </div>
        <h3 class="module-title">${mod.title}</h3>
        <p class="module-desc">${mod.description}</p>
        <div class="module-card-footer">
          ${statusIcon}
          <span class="status-text">${statusText}</span>
        </div>
      `;

      if (!isLocked) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          window.location.href = `module.html?id=${mod.id}`;
        });
      }

      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
}

loadDashboard();
