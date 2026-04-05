class Chatbot {
  constructor(moduleId, token) {
    this.moduleId = moduleId;
    this.token = token;
    this.messagesEl = document.getElementById('chat-messages');
    this.form = document.getElementById('chat-form');
    this.input = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('chat-send');
    this.statusEl = document.getElementById('chatbot-status');
    this.isSending = false;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });
  }

  async loadHistory() {
    try {
      const res = await fetch(`/api/chat/${this.moduleId}/history`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const messages = await res.json();
      messages.forEach(msg => this.appendMessage(msg.role, msg.content));
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }

  appendMessage(role, content) {
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = this.formatMarkdown(content);

    div.appendChild(bubble);
    this.messagesEl.appendChild(div);
    this.scrollToBottom();
  }

  createStreamingMessage() {
    const div = document.createElement('div');
    div.className = 'chat-message assistant';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble streaming';

    div.appendChild(bubble);
    this.messagesEl.appendChild(div);
    return bubble;
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message || this.isSending) return;

    this.isSending = true;
    this.input.value = '';
    this.sendBtn.disabled = true;
    this.statusEl.textContent = 'Thinking...';
    this.statusEl.className = 'chatbot-status thinking';

    // Show user message
    this.appendMessage('user', message);

    // Create streaming bubble
    const bubble = this.createStreamingMessage();

    try {
      const res = await fetch(`/api/chat/${this.moduleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ message })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);

          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              fullText = parsed.error;
              break;
            }
            fullText += parsed.text;
            bubble.innerHTML = this.formatMarkdown(fullText);
            this.scrollToBottom();
          } catch (e) {
            // Skip malformed chunks
          }
        }
      }

      bubble.classList.remove('streaming');
    } catch (err) {
      bubble.textContent = 'Sorry, I had trouble responding. Please try again.';
      bubble.classList.remove('streaming');
    }

    this.isSending = false;
    this.sendBtn.disabled = false;
    this.statusEl.textContent = 'Online';
    this.statusEl.className = 'chatbot-status';
    this.input.focus();
  }

  formatMarkdown(text) {
    // Basic markdown: code blocks, inline code, bold, italic, lists
    let html = text
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    if (!html.startsWith('<')) html = '<p>' + html + '</p>';

    return html;
  }

  scrollToBottom() {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }
}
