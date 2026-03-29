import Modal from '../common/Modal.jsx';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import { CATEGORY_ICONS } from '../../utils/constants.js';
import { formatDateLabel } from '../../utils/dates.js';

export default function ExpenseDetail({ expense, onClose, onEdit, onDelete }) {
  const { fmt } = useCurrency();
  if (!expense) return null;

  const icon  = CATEGORY_ICONS[expense.category] || '📦';
  const total = expense.items?.reduce((s, i) => s + (i.qty * i.price), 0) || 0;

  return (
    <Modal open={!!expense} onClose={onClose} title="Expense Detail" width={440}>
      <div className="detail-header">
        <span className="detail-icon">{icon}</span>
        <div>
          <div className="detail-name">{expense.item}</div>
          <div className="detail-meta">
            {expense.category} · {formatDateLabel(expense.date)}
          </div>
        </div>
        <div className="detail-amount">{fmt(expense.amount)}</div>
      </div>

      {expense.notes && (
        <div className="detail-notes">📝 {expense.notes}</div>
      )}

      {expense.items?.length > 0 && (
        <div className="detail-items">
          <div className="detail-items-title">🧾 Items purchased</div>
          <div className="receipt">
            {expense.items.map((item, i) => (
              <div key={i} className="receipt-row">
                <span className="receipt-name">{item.name}</span>
                <span className="receipt-qty">×{item.qty}</span>
                <span className="receipt-price">{fmt(item.price)}</span>
                <span className="receipt-sub">{fmt(item.qty * item.price)}</span>
              </div>
            ))}
            <div className="receipt-total">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:18 }}>
        <button className="btn btn-ghost" onClick={() => onDelete(expense)}>🗑️ Delete</button>
        <button className="btn btn-primary" onClick={() => onEdit(expense)}>✏️ Edit</button>
      </div>

      <style>{`
        .detail-header { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .detail-icon  { font-size:2rem; flex-shrink:0; }
        .detail-name  { font-weight:700; font-size:1rem; }
        .detail-meta  { font-size:.8rem; color:var(--muted); margin-top:2px; }
        .detail-amount { margin-left:auto; font-size:1.2rem; font-weight:700; color:var(--accent2); white-space:nowrap; }
        .detail-notes { background:var(--bg3); border:1px solid var(--border); border-radius:9px; padding:10px 14px; font-size:.85rem; color:var(--muted); margin-bottom:12px; }
        .detail-items-title { font-size:.8rem; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px; }
        .receipt { background:var(--bg3); border:1px solid var(--border); border-radius:10px; overflow:hidden; }
        .receipt-row { display:grid; grid-template-columns:1fr 50px 70px 70px; gap:6px; padding:8px 12px; border-bottom:1px solid var(--border); font-size:.84rem; }
        .receipt-row:last-child { border-bottom:none; }
        .receipt-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .receipt-qty  { color:var(--muted); text-align:center; }
        .receipt-price,.receipt-sub { text-align:right; }
        .receipt-sub  { color:var(--accent2); font-weight:600; }
        .receipt-total { display:flex; justify-content:space-between; padding:10px 12px; background:var(--bg2); font-weight:700; font-size:.9rem; }
      `}</style>
    </Modal>
  );
}
