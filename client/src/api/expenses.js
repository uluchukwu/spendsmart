import { apiGet, apiPost, apiPut, apiDelete, apiDownload } from './client.js';

export const getAll   = ()           => apiGet('/expenses');
export const create   = (body)       => apiPost('/expenses', body);
export const update   = (id, body)   => apiPut(`/expenses/${id}`, body);
export const remove   = (id)         => apiDelete(`/expenses/${id}`);

export const exportCsv = () =>
  apiDownload('/expenses/export/csv', `spendsmart-${new Date().toISOString().slice(0, 10)}.csv`);

export const exportPdf = () =>
  apiDownload('/expenses/export/pdf', `spendsmart-${new Date().toISOString().slice(0, 10)}.pdf`);
