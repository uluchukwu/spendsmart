import { apiPost, apiGet } from './client.js';

export const login    = (email, password)        => apiPost('/auth/login',    { email, password });
export const register = (name, email, password)  => apiPost('/auth/register', { name, email, password });
export const getMe    = ()                       => apiGet('/auth/me');
