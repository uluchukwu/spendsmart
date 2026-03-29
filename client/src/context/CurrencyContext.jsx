import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CURRENCIES } from '../utils/constants.js';
import { fmtCurrency, convertFromGBP } from '../utils/currency.js';

const CurrencyContext = createContext(null);
const RATE_CACHE_KEY = 'ss_rates';
const RATE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function CurrencyProvider({ children }) {
  const [displayCurrency, setDisplayCurrency] = useState(
    () => localStorage.getItem('ss_currency') || 'GBP'
  );
  const [rates,      setRates]      = useState({ GBP: 1 });
  const [rateStatus, setRateStatus] = useState('loading'); // loading | live | cached | offline

  useEffect(() => {
    // Try cache first
    try {
      const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY));
      if (cached && Date.now() - cached.ts < RATE_CACHE_TTL) {
        setRates(cached.rates);
        setRateStatus('cached');
        return;
      }
    } catch { /* ignore */ }

    fetchRates();
  }, []);

  const fetchRates = useCallback(async () => {
    setRateStatus('loading');
    try {
      const res  = await fetch('https://open.er-api.com/v6/latest/GBP');
      const data = await res.json();
      if (data.result === 'success' && data.rates) {
        setRates(data.rates);
        setRateStatus('live');
        localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({ ts: Date.now(), rates: data.rates }));
        return;
      }
    } catch { /* fall through to backup */ }

    try {
      const res  = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/gbp.json');
      const data = await res.json();
      const raw  = data.gbp || {};
      const normalized = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toUpperCase(), v]));
      normalized.GBP   = 1;
      setRates(normalized);
      setRateStatus('live');
      localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({ ts: Date.now(), rates: normalized }));
    } catch {
      setRateStatus('offline');
    }
  }, []);

  const changeCurrency = useCallback((code) => {
    setDisplayCurrency(code);
    localStorage.setItem('ss_currency', code);
  }, []);

  const fmt = useCallback(
    (amountGBP) => fmtCurrency(amountGBP, displayCurrency, rates),
    [displayCurrency, rates]
  );

  const convert = useCallback(
    (amountGBP, targetCode) => convertFromGBP(amountGBP, targetCode || displayCurrency, rates),
    [displayCurrency, rates]
  );

  return (
    <CurrencyContext.Provider value={{
      currencies: CURRENCIES,
      displayCurrency,
      changeCurrency,
      rates,
      rateStatus,
      refreshRates: fetchRates,
      fmt,
      convert,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
