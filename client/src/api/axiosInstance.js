import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:         '/api',   // Always use Vite proxy — avoids CORS in dev
  withCredentials: true,
  headers:         { 'Content-Type': 'application/json' },
});

// Response interceptor — handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Preserve abort/cancel errors so consumers (e.g. TransactionContext) can
    // distinguish them from real network failures.  If we re-wrap them here the
    // name changes from 'CanceledError' → 'Error' and the guard in the context
    // no longer recognises them, causing a spurious "Network error" banner every
    // time React Strict Mode double-invokes an effect.
    if (axios.isCancel(error) || error.name === 'AbortError' || error.name === 'CanceledError') {
      return Promise.reject(error);
    }

    if (!error.response) {
      // Genuine network error / server unreachable
      return Promise.reject(new Error('Network error — please check your connection'));
    }

    const { status, config } = error.response;

    // Only redirect on 401 for protected routes — NOT for /auth/me (session probe)
    // and NOT for /auth/login or /auth/register (they handle errors themselves)
    const isAuthRoute = config?.url?.includes('/auth/');
    if (status === 401 && !isAuthRoute) {
      window.__authLogout?.();
      window.location.href = '/login?expired=1';
    }

    // Forward a readable error message
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
