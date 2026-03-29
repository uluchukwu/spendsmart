import styles from '../../styles/Spinner.module.css';

/**
 * @param {{ fullPage?: boolean, size?: 'sm'|'md'|'lg' }} props
 */
export default function Spinner({ fullPage = false, size = 'md' }) {
  const spinner = (
    <div className={`${styles.spinner} ${styles[size]}`} role="status" aria-label="Loading">
      <span className={styles.visuallyHidden}>Loading…</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className={styles.overlay}>
        {spinner}
      </div>
    );
  }

  return spinner;
}
