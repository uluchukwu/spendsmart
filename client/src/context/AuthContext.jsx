import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { getMe, loginUser, registerUser, logoutUser } from '../api/authApi.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutRef = useRef(null);

  // Expose logout to the axios interceptor for 401 handling
  useEffect(() => {
    window.__authLogout = () => setUser(null);
    return () => { delete window.__authLogout; };
  }, []);

  // Restore session from cookie on mount
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const userData = await loginUser({ email, password });
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const userData = await registerUser({ name, email, password });
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    setUser(null);
  }, []);

  logoutRef.current = logout;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
