import { CATEGORY_ICONS } from '../../utils/constants.js';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import { formatDateLabel } from '../../utils/dates.js';

export default function ExpenseItem({ expense, onEdit, onDelete, onClick }) {
  const { fmt } = useCurrency();
  const icon    = CATEGORY_ICONS[expense.category] || '📦';

  return (
    <div className="expense-item" onClick={() => onClick(expense)}>
      <div className="exp-icon">{icon}</div>
      <div className="exp-info">
        <div className="exp-name">{expense.item}</div>
        <div className="exp-meta">
          <span className="exp-cat">{expense.category}</span>
          <span>·</span>
          <span>{formatDateLabel(expense.date)}</span>
          {expense.items?.length > 0 && (
            <span className="exp-items-badge">{expense.items.length} item{expense.items.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
      <div className="exp-amount">{fmt(expense.amount)}</div>
      <div className="exp-actions" onClick={e => e.stopPropagation()}>
        <button className="btn-icon" onClick={() => onEdit(expense)} title="Edit" aria-label="Edit expense">✏️</button>
        <button className="btn-icon" onClick={() => onDelete(expense)} title="Delete" aria-label="Delete expense">🗑️</button>
      </div>

      <style>{`
        .expense-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 10px;
          border: 1px solid transparent; cursor: pointer; transition: background .15s;
        }
        .expense-item:hover { background: var(--bg3); border-color: var(--border); }
        .exp-icon { font-size: 1.4rem; width: 36px; text-align: center; flex-shrink: 0; }
        .exp-info { flex: 1; min-width: 0; }
        .exp-name { font-weight: 600; font-size: .9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .exp-meta { display: flex; gap: 6px; font-size: .75rem; color: var(--muted); flex-wrap: wrap; margin-top: 2px; }
        .exp-cat  { background: var(--bg3); border: 1px solid var(--border); padding: 1px 7px; border-radius: 20px; }
        .exp-items-badge { background: rgba(108,99,255,.15); color: var(--accent); border-radius: 20px; padding: 1px 7px; }
        .exp-amount { font-weight: 700; color: var(--accent2); white-space: nowrap; flex-shrink: 0; }
        .exp-actions { display: flex; gap: 2px; flex-shrink: 0; opacity: 0; transition: opacity .15s; }
        .expense-item:hover .exp-actions { opacity: 1; }
      `}</style>
    </div>
  );
}
