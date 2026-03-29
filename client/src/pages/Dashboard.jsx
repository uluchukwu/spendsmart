import { useEffect, useState } from 'react';
import SummaryCards       from '../components/dashboard/SummaryCards.jsx';
import ExpenseChart       from '../components/dashboard/ExpenseChart.jsx';
import RecentTransactions from '../components/dashboard/RecentTransactions.jsx';
import DashboardSidebar   from '../components/dashboard/DashboardSidebar.jsx';
import TransactionForm    from '../components/transactions/TransactionForm.jsx';
import Modal              from '../components/common/Modal.jsx';
import Alert              from '../components/common/Alert.jsx';
import CapBanner          from '../components/budget/CapBanner.jsx';
import { useBudgets }     from '../hooks/useBudgets.js';
import { useTransactions } from '../hooks/useTransactions.js';
import { useAuth }        from '../hooks/useAuth.js';
import { exportCSV, exportPDF } from '../api/transactionApi.js';
import { today, startOfWeek, startOfMonth } from '../utils/dates.js';
import styles from '../styles/Dashboard.module.css';

const PERIODS = [
  { key: 'month', label: 'This Month' },
  { key: 'week',  label: 'This Week'  },
  { key: 'today', label: 'Today'      },
  { key: 'all',   label: 'All Time'   },
];

function getPeriodDates(key) {
  if (key === 'today') return { startDate: today(), endDate: today() };
  if (key === 'week')  return { startDate: startOfWeek() };
  if (key === 'month') return { startDate: startOfMonth() };
  return {};
}

export default function Dashboard() {
  const { user }                                              = useAuth();
  const { monthlyCap }                                       = useBudgets();
  const { transactions, summary, loading, error,
          fetchTransactions, fetchSummary,
          addTransaction, deleteTransaction }                 = useTransactions();

  const [activePeriod, setActivePeriod] = useState('month');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [alert,        setAlert]        = useState(null);
  const [exporting,    setExporting]    = useState(null);

  // Load initial data for "This Month"
  useEffect(() => {
    const dates = getPeriodDates('month');
    fetchTransactions({ page: 1, limit: 20, sort: '-date', ...dates });
    fetchSummary(dates);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const changePeriod = (key) => {
    setActivePeriod(key);
    const dates = getPeriodDates(key);
    fetchTransactions({ page: 1, limit: 20, sort: '-date', ...dates });
    fetchSummary(dates);
  };

  const handleAdd = async (payload) => {
    await addTransaction(payload);
    setModalOpen(false);
    setAlert({ type: 'success', message: 'Transaction added!' });
    fetchSummary(getPeriodDates(activePeriod));
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setAlert({ type: 'success', message: 'Transaction deleted.' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    }
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const dates = getPeriodDates(activePeriod);
      if (type === 'csv') await exportCSV(dates);
      else                await exportPDF(dates);
    } catch {
      setAlert({ type: 'error', message: 'Export failed. Please try again.' });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className={styles.page}>
      <CapBanner transactions={transactions} monthlyCap={monthlyCap} />

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Welcome back, {user?.name?.split(' ')[0]}!</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.exportBtns}>
            <button className={styles.exportBtn} onClick={() => handleExport('csv')}
              disabled={!!exporting} title="Download CSV">
              {exporting === 'csv' ? '…' : '⬇ CSV'}
            </button>
            <button className={styles.exportBtn} onClick={() => handleExport('pdf')}
              disabled={!!exporting} title="Download PDF">
              {exporting === 'pdf' ? '…' : '⬇ PDF'}
            </button>
          </div>
          <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
            + Add Transaction
          </button>
        </div>
      </div>

      <div className={styles.periodTabs} role="tablist" aria-label="Time period">
        {PERIODS.map(p => (
          <button
            key={p.key}
            role="tab"
            aria-selected={activePeriod === p.key}
            className={`${styles.periodTab} ${activePeriod === p.key ? styles.activePeriodTab : ''}`}
            onClick={() => changePeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      {error  && !loading && <Alert type="error" message={error} onClose={() => {}} />}

      <SummaryCards summary={summary} />

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <div className={styles.chartPanel}>
            <h2 className={styles.sectionTitle}>Expenses by Category</h2>
            <p className={styles.sectionSubtitle}>Based on current period</p>
            <ExpenseChart transactions={transactions} />
          </div>
          <div className={styles.recentPanel}>
            <h2 className={styles.sectionTitle}>Recent Transactions</h2>
            <RecentTransactions transactions={transactions} onDelete={handleDelete} />
          </div>
        </div>

        <DashboardSidebar transactions={transactions} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Transaction">
        <TransactionForm onSubmit={handleAdd} onSuccess={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
