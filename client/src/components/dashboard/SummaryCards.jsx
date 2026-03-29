import { useAuth } from '../../hooks/useAuth.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import styles from '../../styles/Dashboard.module.css';

/**
 * @param {{ summary: { totalIncome: number, totalExpenses: number, balance: number } }} props
 */
export default function SummaryCards({ summary }) {
  const { user } = useAuth();
  const currency = user?.currency || 'GBP';

  const { totalIncome = 0, totalExpenses = 0, balance = 0 } = summary || {};
  const isPositive = balance >= 0;

  return (
    <div className={styles.summaryGrid}>
      <div className={`${styles.card} ${styles.incomeCard}`}>
        <div className={styles.cardIcon}>📈</div>
        <div className={styles.cardBody}>
          <span className={styles.cardLabel}>Total Income</span>
          <span className={`${styles.cardValue} ${styles.incomeValue}`}>
            {formatCurrency(totalIncome, currency)}
          </span>
        </div>
      </div>

      <div className={`${styles.card} ${styles.expenseCard}`}>
        <div className={styles.cardIcon}>📉</div>
        <div className={styles.cardBody}>
          <span className={styles.cardLabel}>Total Expenses</span>
          <span className={`${styles.cardValue} ${styles.expenseValue}`}>
            {formatCurrency(totalExpenses, currency)}
          </span>
        </div>
      </div>

      <div className={`${styles.card} ${isPositive ? styles.balancePositive : styles.balanceNegative}`}>
        <div className={styles.cardIcon}>{isPositive ? '💰' : '⚠️'}</div>
        <div className={styles.cardBody}>
          <span className={styles.cardLabel}>Balance</span>
          <span className={`${styles.cardValue} ${isPositive ? styles.incomeValue : styles.expenseValue}`}>
            {formatCurrency(balance, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
