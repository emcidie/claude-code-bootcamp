// Check for existing session
(async function checkSession() {
  const token = localStorage.getItem('bootcamp_token');
  if (!token) return;

  try {
    const res = await fetch(`api/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      window.location.href = 'dashboard.html';
    } else {
      localStorage.removeItem('bootcamp_token');
    }
  } catch (e) {
    // Token invalid, stay on login
  }
})();

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  if (!name) return;

  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Starting...';

  try {
    const res = await fetch(`api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (data.name.toLowerCase() !== 'mike duff') {
      localStorage.removeItem('bootcamp_token');
      localStorage.removeItem('bootcamp_name');
      window.location.href = 'coming-soon.html';
      return;
    }
    localStorage.setItem('bootcamp_token', data.sessionToken);
    localStorage.setItem('bootcamp_name', data.name);
    window.location.href = 'dashboard.html';
  } catch (err) {
    alert('Something went wrong. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Start Bootcamp';
  }
});
