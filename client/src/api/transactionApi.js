import axiosInstance from './axiosInstance.js';

/**
 * Fetch paginated, filtered transactions.
 * @param {object} params - query params (type, category, startDate, endDate, search, page, limit, sort)
 * @param {AbortSignal} [signal] - optional AbortController signal to cancel the request
 */
export const fetchTransactions = async (params = {}, signal) => {
  const res = await axiosInstance.get('/transactions', { params, signal });
  return res.data; // { success, data, total, page, pages }
};

/**
 * Fetch income/expense summary totals.
 * @param {object} [params] - optional { startDate, endDate } for period filtering
 */
export const fetchSummary = async (params = {}) => {
  const res = await axiosInstance.get('/transactions/summary', { params });
  return res.data.data; // { totalIncome, totalExpenses, balance }
};

/**
 * Fetch monthly history — one row per calendar month.
 * @returns {Array<{ month: string, income: number, expenses: number, balance: number, count: number }>}
 */
export const fetchMonthlyHistory = async () => {
  const res = await axiosInstance.get('/transactions/monthly');
  return res.data.data;
};

/**
 * Download transactions as a CSV file.
 * @param {object} [params] - optional filters (startDate, endDate, type, category, etc.)
 */
export const exportCSV = async (params = {}) => {
  const res = await axiosInstance.get('/transactions/export/csv', {
    params,
    responseType: 'blob',
  });
  const url = URL.createObjectURL(res.data);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = `spendsmart-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Download transactions as a PDF file.
 * @param {object} [params] - optional filters (startDate, endDate, type, category, etc.)
 */
export const exportPDF = async (params = {}) => {
  const res = await axiosInstance.get('/transactions/export/pdf', {
    params,
    responseType: 'blob',
  });
  const url = URL.createObjectURL(res.data);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = `spendsmart-${new Date().toISOString().slice(0, 10)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Create a new transaction.
 */
export const createTransaction = async (payload) => {
  const res = await axiosInstance.post('/transactions', payload);
  return res.data.data;
};

/**
 * Update an existing transaction.
 */
export const updateTransaction = async (id, payload) => {
  const res = await axiosInstance.put(`/transactions/${id}`, payload);
  return res.data.data;
};

/**
 * Delete a transaction by ID.
 */
export const deleteTransaction = async (id) => {
  await axiosInstance.delete(`/transactions/${id}`);
};
