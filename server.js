require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Anthropic = require('@anthropic-ai/sdk').default;
const path = require('path');
const db = require('./db');
const modules = require('./curriculum');

const app = express();
const PORT = process.env.PORT || 3000;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiter: 20 messages per minute per participant
const rateLimits = {};
setInterval(() => {
  for (const key in rateLimits) delete rateLimits[key];
}, 60000);

function checkRateLimit(participantId) {
  rateLimits[participantId] = (rateLimits[participantId] || 0) + 1;
  return rateLimits[participantId] <= 20;
}

// Auth middleware
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const participant = db.prepare('SELECT * FROM participants WHERE session_token = ?').get(token);
  if (!participant) return res.status(401).json({ error: 'Invalid token' });

  db.prepare('UPDATE participants SET last_active = CURRENT_TIMESTAMP WHERE id = ?').run(participant.id);
  req.participant = participant;
  next();
}

// --- Auth routes ---

app.post('/api/login', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

  if (name.trim() !== 'Mike Duff') {
    return res.status(403).json({ error: 'Thank you for your interest. The bootcamp is officially over.' });
  }

  const sessionToken = uuidv4();
  const result = db.prepare('INSERT INTO participants (name, session_token) VALUES (?, ?)').run(name.trim(), sessionToken);

  res.json({ id: result.lastInsertRowid, name: name.trim(), sessionToken });
});

app.get('/api/me', auth, (req, res) => {
  res.json({ id: req.participant.id, name: req.participant.name });
});

// --- Curriculum routes ---

app.get('/api/curriculum', (req, res) => {
  const summary = modules.map(m => ({
    id: m.id,
    title: m.title,
    duration: m.duration,
    description: m.description
  }));
  res.json(summary);
});

app.get('/api/curriculum/:moduleId', (req, res) => {
  const mod = modules.find(m => m.id === parseInt(req.params.moduleId));
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  res.json(mod);
});

// --- Progress routes ---

app.get('/api/progress', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM progress WHERE participant_id = ?').all(req.participant.id);
  res.json(rows);
});

app.post('/api/progress/:moduleId/start', auth, (req, res) => {
  const moduleId = parseInt(req.params.moduleId);
  db.prepare(`
    INSERT INTO progress (participant_id, module_id, status, started_at)
    VALUES (?, ?, 'in_progress', CURRENT_TIMESTAMP)
    ON CONFLICT(participant_id, module_id) DO UPDATE SET status = 'in_progress', started_at = COALESCE(started_at, CURRENT_TIMESTAMP)
  `).run(req.participant.id, moduleId);
  res.json({ success: true });
});

app.post('/api/progress/:moduleId/complete', auth, (req, res) => {
  const moduleId = parseInt(req.params.moduleId);
  db.prepare(`
    INSERT INTO progress (participant_id, module_id, status, completed_at)
    VALUES (?, ?, 'completed', CURRENT_TIMESTAMP)
    ON CONFLICT(participant_id, module_id) DO UPDATE SET status = 'completed', completed_at = CURRENT_TIMESTAMP
  `).run(req.participant.id, moduleId);
  res.json({ success: true });
});

// --- Assessment routes ---

app.get('/api/assessments/:moduleId', auth, (req, res) => {
  const moduleId = parseInt(req.params.moduleId);
  const rows = db.prepare(
    'SELECT question_index, answer, score, feedback FROM assessments WHERE participant_id = ? AND module_id = ? ORDER BY question_index'
  ).all(req.participant.id, moduleId);
  res.json(rows);
});

app.post('/api/assessments/:moduleId', auth, async (req, res) => {
  const moduleId = parseInt(req.params.moduleId);
  const { questionIndex, answer } = req.body;

  if (!answer || !answer.trim()) return res.status(400).json({ error: 'Answer is required' });
  if (!checkRateLimit(req.participant.id)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const mod = modules.find(m => m.id === moduleId);
  if (!mod || !mod.questions || questionIndex >= mod.questions.length) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const question = mod.questions[questionIndex];

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `You are an assessment grader for a Claude Code bootcamp for complete beginners.
You must evaluate the student's answer and respond with ONLY valid JSON in this exact format:
{"score": <number 1-10>, "feedback": "<brief encouraging feedback, 1-2 sentences>"}

Grading guidelines:
- 8-10: Demonstrates clear understanding of the concept
- 5-7: Partially correct, shows some understanding
- 1-4: Significant misunderstanding or very incomplete
- Be encouraging even for low scores — these are beginners
- Keep feedback short and constructive

The module topic is: "${mod.title}"`,
      messages: [{
        role: 'user',
        content: `Question: ${question}\n\nStudent's answer: ${answer.trim()}`
      }]
    });

    const text = response.content[0].text.trim();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      const scoreMatch = text.match(/"score"\s*:\s*(\d+)/);
      const feedbackMatch = text.match(/"feedback"\s*:\s*"([^"]+)"/);
      result = {
        score: scoreMatch ? parseInt(scoreMatch[1]) : 5,
        feedback: feedbackMatch ? feedbackMatch[1] : 'Good effort! Keep learning.'
      };
    }

    result.score = Math.max(1, Math.min(10, result.score));

    db.prepare(`
      INSERT INTO assessments (participant_id, module_id, question_index, answer, score, feedback)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(participant_id, module_id, question_index)
      DO UPDATE SET answer = ?, score = ?, feedback = ?, created_at = CURRENT_TIMESTAMP
    `).run(req.participant.id, moduleId, questionIndex, answer.trim(), result.score, result.feedback,
           answer.trim(), result.score, result.feedback);

    res.json(result);
  } catch (err) {
    console.error('Assessment error:', err);
    res.status(500).json({ error: 'Could not grade answer. Please try again.' });
  }
});

// --- Chat routes ---

app.get('/api/chat/:moduleId/history', auth, (req, res) => {
  const moduleId = parseInt(req.params.moduleId);
  const messages = db.prepare(
    'SELECT role, content, created_at FROM chat_messages WHERE participant_id = ? AND module_id = ? ORDER BY id ASC'
  ).all(req.participant.id, moduleId);
  res.json(messages);
});

app.post('/api/chat/:moduleId', auth, async (req, res) => {
  const moduleId = parseInt(req.params.moduleId);
  const { message } = req.body;

  if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required' });
  if (!checkRateLimit(req.participant.id)) {
    return res.status(429).json({ error: 'Too many messages. Please wait a moment.' });
  }

  const mod = modules.find(m => m.id === moduleId);
  if (!mod) return res.status(404).json({ error: 'Module not found' });

  // Save user message
  db.prepare('INSERT INTO chat_messages (participant_id, module_id, role, content) VALUES (?, ?, ?, ?)')
    .run(req.participant.id, moduleId, 'user', message.trim());

  // Load conversation history (last 20 messages)
  const history = db.prepare(
    'SELECT role, content FROM chat_messages WHERE participant_id = ? AND module_id = ? ORDER BY id DESC LIMIT 20'
  ).all(req.participant.id, moduleId).reverse();

  // Build system prompt
  const systemPrompt = `You are a friendly, patient, and encouraging AI coding tutor for a Claude Code bootcamp. Your students are complete beginners who have never written code before.

Rules:
- Use simple, jargon-free language. When you must use a technical term, explain it immediately.
- Give short, focused answers (2-4 paragraphs max). Beginners get overwhelmed by walls of text.
- Use analogies from everyday life to explain concepts.
- Celebrate small wins. Say things like "Great question!" and "You're getting the hang of this!"
- If a student seems stuck, break the problem into tiny steps.
- Never write full solutions outright. Guide the student to discover the answer.
- Format code examples with markdown code blocks.
- If asked about a different module's topic, briefly acknowledge and redirect.
- If asked something unrelated to coding, gently redirect to the bootcamp material.

The student's name is ${req.participant.name}.

${mod.tutorContext}`;

  // Stream response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: history.map(m => ({ role: m.role, content: m.content }))
    });

    let fullResponse = '';

    stream.on('text', (text) => {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    stream.on('end', () => {
      // Save assistant response
      db.prepare('INSERT INTO chat_messages (participant_id, module_id, role, content) VALUES (?, ?, ?, ?)')
        .run(req.participant.id, moduleId, 'assistant', fullResponse);
      res.write('data: [DONE]\n\n');
      res.end();
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.write(`data: ${JSON.stringify({ error: 'The tutor is momentarily busy. Please try again.' })}\n\n`);
      res.end();
    });
  } catch (err) {
    console.error('Claude API error:', err);
    res.write(`data: ${JSON.stringify({ error: 'The tutor is momentarily busy. Please try again.' })}\n\n`);
    res.end();
  }
});

// --- Admin dashboard ---

app.get('/api/admin/dashboard', (req, res) => {
  const participants = db.prepare('SELECT * FROM participants ORDER BY last_active DESC').all();
  const allProgress = db.prepare('SELECT * FROM progress').all();
  const allAssessments = db.prepare('SELECT * FROM assessments').all();

  const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();

  const participantData = participants.map(p => {
    const pProgress = allProgress.filter(pr => pr.participant_id === p.id);
    const pAssessments = allAssessments.filter(a => a.participant_id === p.id);
    const moduleStatus = {};
    pProgress.forEach(pr => { moduleStatus[pr.module_id] = pr.status; });
    const moduleScores = {};
    pAssessments.forEach(a => {
      if (!moduleScores[a.module_id]) moduleScores[a.module_id] = [];
      moduleScores[a.module_id].push(a.score);
    });
    const avgScores = {};
    for (const [modId, scores] of Object.entries(moduleScores)) {
      avgScores[modId] = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    }
    const completedCount = pProgress.filter(pr => pr.status === 'completed').length;
    const allScores = pAssessments.map(a => a.score);
    const overallAvg = allScores.length > 0 ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : null;
    return {
      name: p.name,
      created_at: p.created_at,
      last_active: p.last_active,
      modules: moduleStatus,
      moduleScores: avgScores,
      overallAvg,
      completedCount
    };
  });

  const totalParticipants = participants.length;
  const activeNow = participants.filter(p => p.last_active >= fiveMinAgo).length;
  const completedCounts = participantData.map(p => p.completedCount);
  const avgCompleted = totalParticipants > 0 ? (completedCounts.reduce((a, b) => a + b, 0) / totalParticipants).toFixed(1) : 0;
  const fullyCompleted = completedCounts.filter(c => c === 8).length;

  res.json({
    totalParticipants,
    activeNow,
    avgCompleted,
    fullyCompleted,
    participants: participantData
  });
});

// --- SPA fallback ---
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/module', (req, res) => res.sendFile(path.join(__dirname, 'public', 'module.html')));

app.listen(PORT, () => {
  console.log(`Bootcamp server running on http://localhost:${PORT}`);
});
