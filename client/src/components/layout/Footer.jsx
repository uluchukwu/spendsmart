import styles from '../../styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} SpendSmart — Track every penny. Save with purpose.</span>
    </footer>
  );
}
