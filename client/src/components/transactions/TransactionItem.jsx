import { CATEGORY_ICONS, CATEGORY_LABELS } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import styles from '../../styles/TransactionItem.module.css';

/**
 * @param {{
 *   transaction: object,
 *   onEdit: (t: object) => void,
 *   onDelete: (id: string) => void
 * }} props
 */
export default function TransactionItem({ transaction: t, onEdit, onDelete }) {
  const { displayCurrency: currency } = useCurrency();
  const isIncome   = t.type === 'income';
  const icon       = CATEGORY_ICONS[t.category] || '📦';
  const catLabel   = CATEGORY_LABELS[t.category] || t.category;

  // Truncate long descriptions for list display
  const displayDesc = t.description?.length > 60
    ? t.description.slice(0, 60) + '…'
    : t.description || catLabel;

  return (
    <li className={styles.item}>
      <span className={styles.icon}>{icon}</span>

      <div className={styles.info}>
        <span className={styles.desc} title={t.description}>{displayDesc}</span>
        <div className={styles.meta}>
          <span className={`${styles.badge} ${isIncome ? styles.incomeBadge : styles.expenseBadge}`}>
            {catLabel}
          </span>
          <span className={styles.date}>{formatDate(t.date, 'medium')}</span>
        </div>
      </div>

      <span className={`${styles.amount} ${isIncome ? styles.incomeAmt : styles.expenseAmt}`}>
        {isIncome ? '+' : '-'}{formatCurrency(t.amount, currency)}
      </span>

      <div className={styles.actions}>
        <button
          className={styles.editBtn}
          onClick={() => onEdit(t)}
          aria-label={`Edit: ${t.description || catLabel}`}
          title="Edit"
        >
          ✏️
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(t._id)}
          aria-label={`Delete: ${t.description || catLabel}`}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
