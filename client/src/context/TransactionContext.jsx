import { createContext, useState, useCallback, useRef } from 'react';
import * as api from '../api/transactionApi.js';

export const TransactionContext = createContext(null);

const DEFAULT_FILTERS = {
  type: '', category: '', startDate: '', endDate: '',
  search: '', page: 1, limit: 20, sort: '-date',
};

const DEFAULT_SUMMARY = { totalIncome: 0, totalExpenses: 0, balance: 0 };

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [summary,      setSummary]      = useState(DEFAULT_SUMMARY);
  const [total,        setTotal]        = useState(0);
  const [pages,        setPages]        = useState(1);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [filters,      setFiltersState] = useState(DEFAULT_FILTERS);

  // Track the active AbortController so we can cancel stale requests
  const abortRef = useRef(null);

  const fetchTransactions = useCallback(async (overrideFilters) => {
    // Cancel any pending request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const params = { ...(overrideFilters || filters) };
    // Strip empty string params
    Object.keys(params).forEach(k => { if (params[k] === '') delete params[k]; });

    setLoading(true);
    setError(null);
    try {
      const res = await api.fetchTransactions(params, abortRef.current.signal);
      setTransactions(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSummary = useCallback(async (params) => {
    try {
      const data = await api.fetchSummary(params || {});
      setSummary(data || DEFAULT_SUMMARY);
    } catch {
      setSummary(DEFAULT_SUMMARY);
    }
  }, []);

  const addTransaction = useCallback(async (payload) => {
    const created = await api.createTransaction(payload);
    await Promise.all([fetchTransactions(), fetchSummary()]);
    return created;
  }, [fetchTransactions, fetchSummary]);

  const updateTransaction = useCallback(async (id, payload) => {
    const updated = await api.updateTransaction(id, payload);
    await Promise.all([fetchTransactions(), fetchSummary()]);
    return updated;
  }, [fetchTransactions, fetchSummary]);

  const deleteTransaction = useCallback(async (id) => {
    await api.deleteTransaction(id);
    // If we just deleted the only item on a non-first page, go back one page
    setFiltersState(prev => {
      const newPage = (transactions.length === 1 && prev.page > 1) ? prev.page - 1 : prev.page;
      return { ...prev, page: newPage };
    });
    await Promise.all([fetchTransactions(), fetchSummary()]);
  }, [fetchTransactions, fetchSummary, transactions.length]);

  const setFilters = useCallback((newFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  return (
    <TransactionContext.Provider value={{
      transactions, summary, total, pages,
      loading, error, filters,
      fetchTransactions, fetchSummary,
      addTransaction, updateTransaction, deleteTransaction,
      setFilters,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}
