import axiosInstance from './axiosInstance.js';

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} data
 */
export const registerUser = async (data) => {
  const res = await axiosInstance.post('/auth/register', data);
  return res.data.data;
};

/**
 * Login with email + password. Sets HTTP-only cookie via server.
 * @param {{ email: string, password: string }} data
 */
export const loginUser = async (data) => {
  const res = await axiosInstance.post('/auth/login', data);
  return res.data.data;
};

/**
 * Logout — clears the HTTP-only cookie via server.
 */
export const logoutUser = async () => {
  await axiosInstance.post('/auth/logout');
};

/**
 * Fetch the currently authenticated user (uses cookie).
 * Throws if not authenticated.
 */
export const getMe = async () => {
  const res = await axiosInstance.get('/auth/me');
  return res.data.data;
};
