import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Returns the auth context value.
 * Must be used inside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
