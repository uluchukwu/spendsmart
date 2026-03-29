import { useState } from 'react';
import ExpenseItem from './ExpenseItem.jsx';
import ExpenseDetail from './ExpenseDetail.jsx';
import ConfirmModal from '../common/ConfirmModal.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function ExpenseList({ expenses, onEdit, onDelete }) {
  const { showToast }                 = useToast();
  const [detail,  setDetail]          = useState(null);
  const [confirm, setConfirm]         = useState(null);
  const [deleting, setDeleting]       = useState(false);

  async function handleDelete() {
    if (!confirm) return;
    setDeleting(true);
    try {
      await onDelete(confirm._id);
      showToast('Expense deleted', 'success', '🗑️');
      setConfirm(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  if (expenses.length === 0) {
    return <EmptyState icon="💸" message="No expenses found. Add one to get started!" />;
  }

  return (
    <>
      <div className="expense-list">
        {expenses.map(exp => (
          <ExpenseItem
            key={exp._id}
            expense={exp}
            onClick={setDetail}
            onEdit={onEdit}
            onDelete={setConfirm}
          />
        ))}
      </div>

      {detail && (
        <ExpenseDetail
          expense={detail}
          onClose={() => setDetail(null)}
          onEdit={(e) => { setDetail(null); onEdit(e); }}
          onDelete={(e) => { setDetail(null); setConfirm(e); }}
        />
      )}

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete expense"
        message={`Delete "${confirm?.item}"? This cannot be undone.`}
      />

      <style>{`
        .expense-list { display: flex; flex-direction: column; gap: 2px; }
      `}</style>
    </>
  );
}
