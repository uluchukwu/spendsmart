const API = '/api/auth';

// ── If already logged in, go to app ───────────────────────
if (localStorage.getItem('ss_token')) window.location.href = '/';

// ── Tab switching ──────────────────────────────────────────
function showTab(tab) {
  document.getElementById('loginForm').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.auth-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  clearAlerts();
}
document.querySelectorAll('.auth-tab').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
document.getElementById('toRegister').addEventListener('click', e => { e.preventDefault(); showTab('register'); });
document.getElementById('toLogin').addEventListener('click',    e => { e.preventDefault(); showTab('login'); });

// ── Alert helpers ──────────────────────────────────────────
function showError(msg)   { const el = document.getElementById('authError');   el.textContent = '⚠ ' + msg; el.style.display = 'block'; }
function showSuccess(msg) { const el = document.getElementById('authSuccess'); el.textContent = '✓ ' + msg; el.style.display = 'block'; }
function clearAlerts() {
  document.getElementById('authError').style.display   = 'none';
  document.getElementById('authSuccess').style.display = 'none';
}

// ── Password toggle ────────────────────────────────────────
document.querySelectorAll('.pw-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    input.type  = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁' : '🙈';
  });
});

// ── Submit helpers ─────────────────────────────────────────
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  btn.querySelector('.btn-auth-text').style.display    = loading ? 'none'  : 'inline';
  btn.querySelector('.btn-auth-spinner').style.display = loading ? 'inline' : 'none';
  btn.disabled = loading;
}

function saveAuth(data) {
  localStorage.setItem('ss_token', data.token);
  localStorage.setItem('ss_user',  JSON.stringify(data.user));
}

// ── Login ──────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault(); clearAlerts(); setLoading('loginBtn', true);
  try {
    const res  = await fetch(`${API}/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:    document.getElementById('loginEmail').value.trim(),
        password: document.getElementById('loginPassword').value,
      }),
    });
    const data = await res.json();
    if (!data.success) { showError(data.message); setLoading('loginBtn', false); return; }
    saveAuth(data);
    window.location.href = '/';
  } catch { showError('Network error. Is the server running?'); setLoading('loginBtn', false); }
});

// ── Register ───────────────────────────────────────────────
document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault(); clearAlerts(); setLoading('registerBtn', true);
  const name    = document.getElementById('regName').value.trim();
  const email   = document.getElementById('regEmail').value.trim();
  const pw      = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;

  if (pw !== confirm) { showError('Passwords do not match'); setLoading('registerBtn', false); return; }

  try {
    const res  = await fetch(`${API}/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pw }),
    });
    const data = await res.json();
    if (!data.success) { showError(data.message); setLoading('registerBtn', false); return; }
    saveAuth(data);
    window.location.href = '/';
  } catch { showError('Network error. Is the server running?'); setLoading('registerBtn', false); }
});
