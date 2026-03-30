import { useState, useCallback } from 'react';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { getCurrencyMeta } from '../utils/currency.js';

/**
 * Hook for the quick converter widget.
 * Tracks from/to currency selections and converts a given amount.
 * Supports an optional manual rate override that takes precedence over live rates.
 */
export function useExchangeRate() {
  const { rates, rateStatus, currencies, refreshRates } = useCurrency();

  const [fromCode,   setFromCode]   = useState('GBP');
  const [toCode,     setToCode]     = useState('NGN');
  const [amount,     setAmount]     = useState('');
  const [manualRate, setManualRate] = useState(''); // user-entered override

  // Returns a converted number, or null if inputs are invalid.
  // When manualRate is set it is used directly as "1 from = manualRate to".
  const convert = useCallback((value, from, to) => {
    const num = parseFloat(value);
    if (!num || isNaN(num)) return null;

    // ── Manual override takes precedence ──────────────────
    const mr = parseFloat(manualRate);
    if (manualRate !== '' && !isNaN(mr) && mr > 0) {
      return num * mr;
    }

    // ── Live / cached rates ───────────────────────────────
    if (!rates) return null;
    const fromRate = rates[from] || 1;
    const toRate   = rates[to]   || 1;
    const inGBP    = num / fromRate;
    return inGBP * toRate;
  }, [rates, manualRate]);

  const result = convert(amount, fromCode, toCode);

  const toMeta   = getCurrencyMeta(toCode);
  const fromMeta = getCurrencyMeta(fromCode);

  const formattedResult = result !== null
    ? `${toMeta.symbol}${result.toFixed(['JPY', 'KRW'].includes(toCode) ? 0 : 2)}`
    : null;

  // Returns a human-readable rate string, e.g. "1 GBP = ₦1580.0000"
  const getRate = useCallback((from, to) => {
    const r = convert(1, from, to);
    if (r === null) return null;
    const meta = getCurrencyMeta(to);
    return `1 ${from} = ${meta.symbol}${r.toFixed(['JPY', 'KRW'].includes(to) ? 0 : 4)}`;
  }, [convert]);

  // Clear the manual override and go back to live rates
  const clearManualRate = useCallback(() => setManualRate(''), []);

  // Effective status: if user has overridden the rate, show 'manual'
  const effectiveStatus = manualRate !== '' ? 'manual' : rateStatus;

  return {
    currencies,
    fromCode,    setFromCode,
    toCode,      setToCode,
    amount,      setAmount,
    manualRate,  setManualRate,  clearManualRate,
    formattedResult,
    fromMeta,
    toMeta,
    rateStatus:  effectiveStatus,
    refreshRates,
    getRate,
  };
}
