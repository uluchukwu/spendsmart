import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Alert from '../common/Alert.jsx';
import Spinner from '../common/Spinner.jsx';
import styles from '../../styles/Auth.module.css';

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const validate = () => {
    if (!name.trim())            return 'Name is required';
    if (name.trim().length < 2)  return 'Name must be at least 2 characters';
    if (!email.trim())           return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email';
    if (!password)               return 'Password is required';
    if (password.length < 6)     return 'Password must be at least 6 characters';
    if (password !== confirm)    return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h1 className={styles.title}>Create account</h1>
      <p className={styles.subtitle}>Start tracking your finances today</p>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="name">Full name</label>
          <input
            id="name" type="text" autoComplete="name"
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Jane Smith" required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email" type="email" autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="reg-password">Password</label>
          <div className={styles.pwWrap}>
            <input
              id="reg-password" type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters" required
            />
            <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm" type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat password" required
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Create Account'}
        </button>
      </form>

      <p className={styles.switchLink}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
