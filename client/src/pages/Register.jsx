import RegisterForm from '../components/auth/RegisterForm.jsx';
import styles from '../styles/Auth.module.css';

export default function Register() {
  return (
    <div className={styles.page}>
      <div className={styles.blobs}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>
      <RegisterForm />
    </div>
  );
}
