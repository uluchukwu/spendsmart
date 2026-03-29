import { useEffect, useState, useCallback } from 'react';
import { useSearchParams }   from 'react-router-dom';
import TransactionList       from '../components/transactions/TransactionList.jsx';
import TransactionFilter     from '../components/transactions/TransactionFilter.jsx';
import TransactionForm       from '../components/transactions/TransactionForm.jsx';
import Modal                 from '../components/common/Modal.jsx';
import Alert                 from '../components/common/Alert.jsx';
import { useTransactions }   from '../hooks/useTransactions.js';
import styles                from '../styles/Transactions.module.css';

export default function Transactions() {
  const {
    transactions, loading, error, total, pages, filters,
    fetchTransactions, fetchSummary,
    addTransaction, updateTransaction, deleteTransaction, setFilters,
  } = useTransactions();

  const [searchParams]           = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [alert,     setAlert]     = useState(null);

  // Pre-populate date filters from URL (e.g. when navigating from Monthly History)
  useEffect(() => {
    const startDate = searchParams.get('startDate');
    const endDate   = searchParams.get('endDate');
    if (startDate || endDate) {
      setFilters({ startDate: startDate || '', endDate: endDate || '', page: 1 });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch whenever filters change
  useEffect(() => {
    fetchTransactions(filters);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = useCallback((partial) => {
    setFilters(partial);
  }, [setFilters]);

  const handlePageChange = (page) => setFilters({ page });

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (t) => { setEditing(t);   setModalOpen(true); };
  const closeModal = () => { setEditing(null); setModalOpen(false); };

  const handleSubmit = async (payload) => {
    if (editing) {
      await updateTransaction(editing._id, payload);
      setAlert({ type: 'success', message: 'Transaction updated!' });
    } else {
      await addTransaction(payload);
      setAlert({ type: 'success', message: 'Transaction added!' });
    }
    closeModal();
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setAlert({ type: 'success', message: 'Transaction deleted.' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Transactions</h1>
          <p className={styles.pageSubtitle}>Manage all your income and expenses</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>+ Add Transaction</button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      {error && <Alert type="error" message={error} onClose={() => {}} />}

      <TransactionFilter filters={filters} onChange={handleFilterChange} />

      <TransactionList
        transactions={transactions}
        loading={loading}
        total={total}
        pages={pages}
        currentPage={filters.page || 1}
        onPageChange={handlePageChange}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          onSubmit={handleSubmit}
          editing={editing}
          onSuccess={closeModal}
        />
      </Modal>

      {/* Floating action button */}
      <button className={styles.fab} onClick={openAdd} aria-label="Add transaction">+</button>
    </div>
  );
}
