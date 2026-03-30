import ForgotPasswordForm from '../components/auth/ForgotPasswordForm.jsx';
import styles from '../styles/Auth.module.css';

export default function ForgotPassword() {
  return (
    <div className={styles.page}>
      <div className={styles.blobs}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
