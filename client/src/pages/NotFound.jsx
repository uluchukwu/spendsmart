import { Link } from 'react-router-dom';
import styles from '../styles/NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.message}>The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className={styles.homeLink}>← Back to Dashboard</Link>
    </div>
  );
}
