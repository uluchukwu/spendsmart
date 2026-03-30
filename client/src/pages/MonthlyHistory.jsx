import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import { fetchMonthlyHistory } from '../api/transactionApi.js';
import { formatCurrency }      from '../utils/formatCurrency.js';
import { useAuth }             from '../hooks/useAuth.js';
import Spinner                 from '../components/common/Spinner.jsx';
import styles                  from '../styles/MonthlyHistory.module.css';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function formatMonthLabel(yearMonth) {
  const [y, m] = yearMonth.split('-');
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}

export default function MonthlyHistory() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const currency   = user?.currency || 'GBP';

  const [months,  setMonths]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMonthlyHistory()
      .then(data => { setMonths(data); setError(null); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  }, []);

  // Navigate to Transactions page pre-filtered to that calendar month
  const viewMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const startDate = `${year}-${month}-01`;
    const lastDay   = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate   = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    navigate(`/transactions?startDate=${startDate}&endDate=${endDate}`);
  };

  const totalIncome   = months.reduce((s, m) => s + m.income,   0);
  const totalExpenses = months.reduce((s, m) => s + m.expenses, 0);
  const totalBalance  = totalIncome - totalExpenses;

  if (loading) return <div className={styles.page}><Spinner /></div>;

  if (error) return (
    <div className={styles.page}>
      <p className={styles.error}>⚠️ {error}</p>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Monthly History</h1>
          <p className={styles.pageSubtitle}>A breakdown of every month's activity — click any row to view its transactions</p>
        </div>
      </div>

      {months.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📅</span>
          <p>No transaction history yet.</p>
          <p>Add some transactions to see your monthly breakdown here.</p>
        </div>
      ) : (
        <>
          {/* All-time totals strip */}
          <div className={styles.totalsRow}>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>All-Time Income</span>
              <span className={`${styles.totalValue} ${styles.income}`}>
                {formatCurrency(totalIncome, currency)}
              </span>
            </div>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>All-Time Expenses</span>
              <span className={`${styles.totalValue} ${styles.expense}`}>
                {formatCurrency(totalExpenses, currency)}
              </span>
            </div>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>Net Balance</span>
              <span className={`${styles.totalValue} ${totalBalance >= 0 ? styles.income : styles.expense}`}>
                {formatCurrency(totalBalance, currency)}
              </span>
            </div>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>Months Tracked</span>
              <span className={styles.totalValue}>{months.length}</span>
            </div>
          </div>

          {/* Month-by-month table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Balance</th>
                  <th className={styles.centerCol}>Transactions</th>
                </tr>
              </thead>
              <tbody>
                {months.map(m => (
                  <tr
                    key={m.month}
                    className={styles.row}
                    onClick={() => viewMonth(m.month)}
                    title={`View transactions for ${formatMonthLabel(m.month)}`}
                  >
                    <td className={styles.monthCell}>{formatMonthLabel(m.month)}</td>
                    <td className={styles.income}>{formatCurrency(m.income,   currency)}</td>
                    <td className={styles.expense}>{formatCurrency(m.expenses, currency)}</td>
                    <td className={m.balance >= 0 ? styles.income : styles.expense}>
                      {formatCurrency(m.balance, currency)}
                    </td>
                    <td className={styles.centerCol}>{m.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
