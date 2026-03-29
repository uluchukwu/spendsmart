import { useContext } from 'react';
import { TransactionContext } from '../context/TransactionContext.jsx';

/**
 * Returns the transaction context value.
 * Must be used inside <TransactionProvider>.
 */
export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider');
  return ctx;
}
