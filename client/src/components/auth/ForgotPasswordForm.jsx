import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { forgotPassword } from '../../api/authApi.js';
import Alert   from '../common/Alert.jsx';
import Spinner from '../common/Spinner.jsx';
import styles  from '../../styles/Auth.module.css';

export default function ForgotPasswordForm() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address'); return; }
    setError('');
    setLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────
  if (sent) {
    return (
      <div className={styles.formCard}>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📬</div>
          <h2 style={{ margin: '0 0 8px' }}>Check your inbox</h2>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem', lineHeight: 1.6, margin: '0 0 24px' }}>
            If <strong>{email}</strong> is registered, you'll receive a password
            reset link shortly. Check your spam folder if it doesn't arrive
            within a few minutes.
          </p>
          <Link to="/login" className={styles.submitBtn} style={{ display: 'inline-flex', textDecoration: 'none', width: 'auto', padding: '12px 32px' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ── Request form ───────────────────────────────────────────
  return (
    <div className={styles.formCard}>
      <h1 className={styles.title}>Forgot password?</h1>
      <p className={styles.subtitle}>
        Enter your email and we'll send you a link to reset your password.
      </p>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="fp-email">Email address</label>
          <input
            id="fp-email" type="email" autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" required
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
        </button>
      </form>

      <p className={styles.switchLink}>
        Remembered it? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
