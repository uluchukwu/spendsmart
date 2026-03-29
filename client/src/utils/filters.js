import { today, startOfWeek, startOfMonth } from './dates.js';

/** Filter expenses by time period */
export function filterByPeriod(expenses, period) {
  if (!expenses) return [];
  if (period === 'all') return expenses;

  const bounds = {
    today: today(),
    week:  startOfWeek(),
    month: startOfMonth(),
  };
  const from = bounds[period];
  if (!from) return expenses;
  return expenses.filter(e => e.date >= from);
}

/** Filter by category */
export function filterByCategory(expenses, category) {
  if (!category || category === 'all') return expenses;
  return expenses.filter(e => e.category === category);
}

/** Sort expenses */
export function sortExpenses(expenses, sortBy) {
  const copy = [...expenses];
  switch (sortBy) {
    case 'date-asc':    return copy.sort((a, b) => a.date.localeCompare(b.date) || a.ts - b.ts);
    case 'amount-desc': return copy.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':  return copy.sort((a, b) => a.amount - b.amount);
    default:            return copy.sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts);
  }
}

/** Apply period filter + category filter + sort in one pass */
export function applyFilters(expenses, { period = 'all', category = 'all', sortBy = 'date-desc' } = {}) {
  return sortExpenses(filterByCategory(filterByPeriod(expenses, period), category), sortBy);
}

/** Total amount from an array of expenses */
export function sumExpenses(expenses) {
  return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
}

/** Group expenses by category → { Food: total, ... } */
export function groupByCategory(expenses) {
  return expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
}
