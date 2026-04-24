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
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.style.display = 'none';
  if (!username || !password) return;

  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    const res = await fetch(`api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      errorEl.textContent = data.error || 'Sign in failed.';
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Sign In';
      return;
    }
    localStorage.setItem('bootcamp_token', data.sessionToken);
    localStorage.setItem('bootcamp_name', data.name);
    window.location.href = 'dashboard.html';
  } catch (err) {
    errorEl.textContent = 'Something went wrong. Please try again.';
    errorEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});
