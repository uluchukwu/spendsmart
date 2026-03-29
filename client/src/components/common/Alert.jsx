import { useState, useEffect, useRef } from 'react';
import styles from '../../styles/Alert.module.css';

const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
const AUTO_DISMISS_MS = 4000;

/**
 * @param {{ type: 'success'|'error'|'warning'|'info', message: string, onClose?: () => void }} props
 */
export default function Alert({ type = 'info', message, onClose }) {
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);
  const startRef    = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct     = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
      setProgress(pct);
      if (pct === 0) { clearInterval(intervalRef.current); onClose?.(); }
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.alert} ${styles[type]}`} role="alert">
      <span className={styles.icon}>{ICONS[type]}</span>
      <span className={styles.message}>{message}</span>
      <button className={styles.close} onClick={onClose} aria-label="Dismiss alert">×</button>
      <div
        className={styles.progressBar}
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
    </div>
  );
}
