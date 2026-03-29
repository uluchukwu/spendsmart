import { useState, useEffect, useCallback } from 'react';
import * as budgetApi from '../api/budgets.js';

export function useBudgets() {
  const [budgets,    setBudgets]    = useState([]);
  const [monthlyCap, setMonthlyCap] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [budgetsRes, capRes] = await Promise.all([
        budgetApi.getAll(),
        budgetApi.getCap(),
      ]);
      setBudgets(budgetsRes.data);
      setMonthlyCap(capRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upsertBudget = useCallback(async (category, monthlyLimit) => {
    const { data } = await budgetApi.upsert(category, monthlyLimit);
    setBudgets(prev => {
      const exists = prev.find(b => b.category === category);
      return exists
        ? prev.map(b => b.category === category ? data : b)
        : [...prev, data];
    });
    return data;
  }, []);

  const deleteBudget = useCallback(async (category) => {
    await budgetApi.remove(category);
    setBudgets(prev => prev.filter(b => b.category !== category));
  }, []);

  const saveCap = useCallback(async (limit) => {
    if (limit === null || limit === undefined || limit === '') {
      await budgetApi.removeCap();
      setMonthlyCap(null);
    } else {
      const { data } = await budgetApi.saveCap(limit);
      setMonthlyCap(data);
    }
  }, []);

  return {
    budgets, monthlyCap, loading, error,
    reload: load, upsertBudget, deleteBudget, saveCap,
  };
}
