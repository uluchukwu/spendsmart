import Modal from './Modal.jsx';

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirm'} width={380}>
      <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: 20 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <span className="spinner spinner-sm" /> : confirmText}
        </button>
      </div>
    </Modal>
  );
}
