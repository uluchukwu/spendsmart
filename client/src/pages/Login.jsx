import LoginForm from '../components/auth/LoginForm.jsx';
import styles from '../styles/Auth.module.css';

export default function Login() {
  return (
    <div className={styles.page}>
      <div className={styles.blobs}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>
      <LoginForm />
    </div>
  );
}
