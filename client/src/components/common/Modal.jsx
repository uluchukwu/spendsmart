import { useEffect, useRef } from 'react';
import styles from '../../styles/Modal.module.css';

/**
 * @param {{ open: boolean, onClose: () => void, title: string, children: React.ReactNode, width?: number }} props
 */
export default function Modal({ open, onClose, title, children, width = 500 }) {
  const firstFocusableRef = useRef(null);
  const overlayRef        = useRef(null);

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

      const focusable = overlayRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    firstFocusableRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.box} style={{ maxWidth: width }}>
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title} ref={firstFocusableRef} tabIndex={-1}>
            {title}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
