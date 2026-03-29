import { CURRENCIES } from './constants.js';

/** Get currency meta (symbol, etc.) by code */
export function getCurrencyMeta(code) {
  return CURRENCIES.find(c => c.code === code) || { code, symbol: code, name: code };
}

/** Format a GBP amount into any display currency using rates object */
export function fmtCurrency(amountGBP, displayCode, rates) {
  if (!displayCode || !rates || displayCode === 'GBP') {
    return `£${Number(amountGBP).toFixed(2)}`;
  }
  const meta = getCurrencyMeta(displayCode);
  const rate = rates[displayCode];
  if (!rate) return `£${Number(amountGBP).toFixed(2)}`;
  const converted = amountGBP * rate;
  // JPY and similar: no decimal
  const decimals = ['JPY', 'KRW', 'IDR'].includes(displayCode) ? 0 : 2;
  return `${meta.symbol}${converted.toFixed(decimals)}`;
}

/** Format as GBP always */
export function fmtGBP(amount) {
  return `£${Number(amount).toFixed(2)}`;
}

/** Return a plain number converted from GBP */
export function convertFromGBP(amountGBP, targetCode, rates) {
  if (targetCode === 'GBP' || !rates) return Number(amountGBP);
  const rate = rates[targetCode];
  return rate ? amountGBP * rate : Number(amountGBP);
}

/** Format with currency code label, e.g. "£12.50 GBP" */
export function fmtWithCode(amountGBP, displayCode, rates) {
  const formatted = fmtCurrency(amountGBP, displayCode, rates);
  return `${formatted} ${displayCode || 'GBP'}`;
}
