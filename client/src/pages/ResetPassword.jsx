import ResetPasswordForm from '../components/auth/ResetPasswordForm.jsx';
import styles from '../styles/Auth.module.css';

export default function ResetPassword() {
  return (
    <div className={styles.page}>
      <div className={styles.blobs}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>
      <ResetPasswordForm />
    </div>
  );
}
