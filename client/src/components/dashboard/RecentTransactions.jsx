import { useNavigate } from 'react-router-dom';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import styles from '../../styles/Dashboard.module.css';

/**
 * @param {{ transactions: Array, onDelete: (id: string) => void }} props
 */
export default function RecentTransactions({ transactions, onDelete }) {
  const navigate  = useNavigate();
  const { displayCurrency: currency } = useCurrency();
  const recent    = transactions.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className={styles.recentEmpty}>
        <span>💸</span>
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <ul className={styles.recentList}>
      {recent.map(t => (
        <li key={t._id} className={styles.recentItem}>
          <span className={styles.recentIcon}>
            {CATEGORY_ICONS[t.category] || '📦'}
          </span>

          <div className={styles.recentInfo}>
            <span className={styles.recentDesc}>
              {t.description || CATEGORY_LABELS[t.category] || t.category}
            </span>
            <span className={styles.recentMeta}>
              {CATEGORY_LABELS[t.category]} · {formatDate(t.date, 'short')}
            </span>
          </div>

          <span className={`${styles.recentAmount} ${t.type === 'income' ? styles.income : styles.expense}`}>
            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
          </span>

          <button
            className={styles.recentDelete}
            onClick={() => onDelete(t._id)}
            aria-label={`Delete transaction: ${t.description || t.category}`}
          >
            🗑️
          </button>
        </li>
      ))}

      {transactions.length > 5 && (
        <li className={styles.viewAll}>
          <button onClick={() => navigate('/transactions')}>
            View all {transactions.length} transactions →
          </button>
        </li>
      )}
    </ul>
  );
}
