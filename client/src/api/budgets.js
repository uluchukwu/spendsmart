import { apiGet, apiPost, apiDelete } from './client.js';

export const getAll   = ()                           => apiGet('/budgets');
export const upsert   = (category, monthlyLimit)     => apiPost('/budgets', { category, monthlyLimit });
export const remove   = (category)                   => apiDelete(`/budgets/${category}`);

export const getCap    = ()        => apiGet('/budgets/cap');
export const saveCap   = (limit)   => apiPost('/budgets/cap', { limit });
export const removeCap = ()        => apiDelete('/budgets/cap');
