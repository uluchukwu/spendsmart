import { useState, useCallback } from 'react';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { getCurrencyMeta } from '../utils/currency.js';

/**
 * Hook for the quick converter widget.
 * Tracks from/to currency selections and converts a given amount.
 */
export function useExchangeRate() {
  const { rates, rateStatus, currencies, refreshRates } = useCurrency();

  const [fromCode, setFromCode] = useState('GBP');
  const [toCode,   setToCode]   = useState('NGN');
  const [amount,   setAmount]   = useState('');

  const convert = useCallback((value, from, to) => {
    const num = parseFloat(value);
    if (!num || isNaN(num) || !rates) return null;

    // Convert to GBP base, then to target
    const fromRate = rates[from] || 1;
    const toRate   = rates[to]   || 1;
    const inGBP    = num / fromRate;
    return inGBP * toRate;
  }, [rates]);

  const result = convert(amount, fromCode, toCode);

  const toMeta   = getCurrencyMeta(toCode);
  const fromMeta = getCurrencyMeta(fromCode);

  const formattedResult = result !== null
    ? `${toMeta.symbol}${result.toFixed(['JPY','KRW'].includes(toCode) ? 0 : 2)}`
    : null;

  const getRate = useCallback((from, to) => {
    const r = convert(1, from, to);
    if (r === null) return null;
    const meta = getCurrencyMeta(to);
    return `1 ${from} = ${meta.symbol}${r.toFixed(['JPY','KRW'].includes(to) ? 0 : 4)}`;
  }, [convert]);

  return {
    currencies,
    fromCode, setFromCode,
    toCode,   setToCode,
    amount,   setAmount,
    formattedResult,
    fromMeta,
    toMeta,
    rateStatus,
    refreshRates,
    getRate,
  };
}
