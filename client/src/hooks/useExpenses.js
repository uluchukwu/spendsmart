import { useState, useEffect, useCallback } from 'react';
import * as expApi from '../api/expenses.js';

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await expApi.getAll();
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addExpense = useCallback(async (body) => {
    const { data } = await expApi.create(body);
    setExpenses(prev => [data, ...prev]);
    return data;
  }, []);

  const editExpense = useCallback(async (id, body) => {
    const { data } = await expApi.update(id, body);
    setExpenses(prev => prev.map(e => e._id === id ? data : e));
    return data;
  }, []);

  const deleteExpense = useCallback(async (id) => {
    // Optimistic remove
    setExpenses(prev => prev.filter(e => e._id !== id));
    try {
      await expApi.remove(id);
    } catch (err) {
      // Rollback by re-fetching if delete fails
      await load();
      throw err;
    }
  }, [load]);

  return { expenses, loading, error, reload: load, addExpense, editExpense, deleteExpense };
}
