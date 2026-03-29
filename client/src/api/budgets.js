import axiosInstance from './axiosInstance.js';

// All budget API calls use axiosInstance (HTTP-only cookie auth via Vite proxy)

export const getAll = () =>
  axiosInstance.get('/budgets').then(r => r.data);

export const upsert = (category, monthlyLimit) =>
  axiosInstance.post('/budgets', { category, monthlyLimit }).then(r => r.data);

export const remove = (category) =>
  axiosInstance.delete(`/budgets/${category}`).then(r => r.data);

export const getCap = () =>
  axiosInstance.get('/budgets/cap').then(r => r.data);

export const saveCap = (limit) =>
  axiosInstance.post('/budgets/cap', { limit }).then(r => r.data);

export const removeCap = () =>
  axiosInstance.delete('/budgets/cap').then(r => r.data);
