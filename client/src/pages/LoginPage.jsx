import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/auth.css';

export default function LoginPage() {
  const { login, register }       = useAuth();
  const navigate                  = useNavigate();
  const [tab,      setTab]        = useState('login');
  const [error,    setError]      = useState('');
  const [success,  setSuccess]    = useState('');
  const [loading,  setLoading]    = useState(false);
  const [showPw,   setShowPw]     = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail]   = useState('');
  const [loginPw,    setLoginPw]      = useState('');

  // Register fields
  const [regName,    setRegName]    = useState('');
  const [regEmail,   setRegEmail]   = useState('');
  const [regPw,      setRegPw]      = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  function switchTab(t) { setTab(t); setError(''); setSuccess(''); }

  async function handleLogin(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(loginEmail.trim(), loginPw);
      navigate('/', { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault(); setError('');
    if (regPw !== regConfirm) { setError('Passwords do not match'); return; }
    if (regPw.length < 6)     { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(regName.trim(), regEmail.trim(), regPw);
      navigate('/', { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="blob blob-1" /><div className="blob blob-2" />
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-logo">💳</span><span className="auth-title">SpendSmart</span></div>
        <p className="auth-tagline">Track every penny. Save with purpose.</p>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>Login</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>Register</button>
        </div>

        {error   && <div className="auth-alert error">⚠ {error}</div>}
        {success && <div className="auth-alert success">✓ {success}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="pw-wrap">
                <input type={showPw ? 'text' : 'password'} value={loginPw} onChange={e => setLoginPw(e.target.value)}
                  placeholder="••••••" autoComplete="current-password" required />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : '→ Sign In'}
            </button>
            <p className="auth-switch">Don't have an account? <a href="#" onClick={e => { e.preventDefault(); switchTab('register'); }}>Register</a></p>
          </form>
        ) : (
          <form onSubmit={handleRegister} noValidate>
            <div className="form-group">
              <label>Name</label>
              <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Your name" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="pw-wrap">
                <input type={showPw ? 'text' : 'password'} value={regPw} onChange={e => setRegPw(e.target.value)}
                  placeholder="Min 6 characters" autoComplete="new-password" required />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
              <span className="hint">Minimum 6 characters</span>
            </div>
            <div className="form-group">
              <label>Confirm password</label>
              <input type={showPw ? 'text' : 'password'} value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                placeholder="Repeat password" autoComplete="new-password" required />
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : '→ Create Account'}
            </button>
            <p className="auth-switch">Already have an account? <a href="#" onClick={e => { e.preventDefault(); switchTab('login'); }}>Login</a></p>
          </form>
        )}
      </div>
    </div>
  );
}
