import { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title, children, width = 480 }) {
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="modal-box" style={{ maxWidth: width }} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn-icon modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(0,0,0,.6); backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .modal-box {
          background: var(--bg2); border: 1px solid var(--border); border-radius: 16px;
          width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,.6);
          animation: modalIn .22s ease;
        }
        @keyframes modalIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px 0;
        }
        .modal-title { font-size: 1rem; font-weight: 700; }
        .modal-close { font-size: .9rem; }
        .modal-body  { padding: 16px 20px 20px; }
      `}</style>
    </div>
  );
}
