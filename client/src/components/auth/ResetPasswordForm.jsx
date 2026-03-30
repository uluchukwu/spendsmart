import { useState }              from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword }         from '../../api/authApi.js';
import { useAuth }               from '../../hooks/useAuth.js';
import Alert   from '../common/Alert.jsx';
import Spinner from '../common/Spinner.jsx';
import styles  from '../../styles/Auth.module.css';

export default function ResetPasswordForm() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const { login }  = useAuth(); // update context after reset

  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);

  const validate = () => {
    if (!password)            return 'Password is required';
    if (password.length < 6)  return 'Password must be at least 6 characters';
    if (password !== confirm)  return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      const userData = await resetPassword({ token, password });
      // Server logs the user in — update client auth context then redirect
      // resetPassword returns user data and the server sets the cookie
      setDone(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────
  if (done) {
    return (
      <div className={styles.formCard}>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{ margin: '0 0 8px' }}>Password updated!</h2>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem', margin: '0 0 8px' }}>
            Your password has been reset successfully.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
            Redirecting you to the dashboard…
          </p>
        </div>
      </div>
    );
  }

  // ── New password form ──────────────────────────────────────
  return (
    <div className={styles.formCard}>
      <h1 className={styles.title}>Set new password</h1>
      <p className={styles.subtitle}>
        Choose a strong password for your SpendSmart account.
      </p>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="rp-password">New password</label>
          <div className={styles.pwWrap}>
            <input
              id="rp-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
            />
            <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {/* Strength indicator */}
        {password.length > 0 && (
          <div style={{ marginTop: '-10px', marginBottom: '14px' }}>
            <StrengthBar password={password} />
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="rp-confirm">Confirm new password</label>
          <input
            id="rp-confirm"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat password"
            required
          />
          {confirm && password !== confirm && (
            <span style={{ fontSize: '.75rem', color: 'var(--expense)' }}>Passwords don't match</span>
          )}
          {confirm && password === confirm && confirm.length > 0 && (
            <span style={{ fontSize: '.75rem', color: 'var(--income)' }}>✓ Passwords match</span>
          )}
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Reset Password'}
        </button>
      </form>

      <p className={styles.switchLink}>
        <Link to="/login">Back to Sign In</Link>
      </p>
    </div>
  );
}

// ── Password strength bar ──────────────────────────────────────
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)            score++;
  if (pw.length >= 12)           score++;
  if (/[A-Z]/.test(pw))          score++;
  if (/[0-9]/.test(pw))          score++;
  if (/[^A-Za-z0-9]/.test(pw))   score++;
  return score;
}

function StrengthBar({ password }) {
  const score  = getStrength(password);
  const levels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];
  const label  = levels[score] || 'Weak';
  const color  = colors[score] || colors[1];
  const width  = `${(score / 5) * 100}%`;

  return (
    <div>
      <div style={{ display: 'flex', height: '4px', gap: '3px', marginBottom: '4px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            flex: 1, borderRadius: '2px',
            background: i <= score ? color : 'var(--border)',
            transition: 'background .2s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: '.72rem', color }}>{label}</span>
    </div>
  );
}
