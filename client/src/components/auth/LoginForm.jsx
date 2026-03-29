import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Alert from '../common/Alert.jsx';
import Spinner from '../common/Spinner.jsx';
import styles from '../../styles/Auth.module.css';

export default function LoginForm() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const from    = location.state?.from?.pathname || '/dashboard';
  const expired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Please fill in all fields'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in to your SpendSmart account</p>

      {expired && !error && (
        <Alert type="warning" message="Your session expired. Please sign in again." onClose={() => {}} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email" type="email" autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <div className={styles.pwWrap}>
            <input
              id="password" type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••" required
            />
            <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Sign In'}
        </button>
      </form>

      <p className={styles.switchLink}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
