/**
 * Format a number as a currency string using the browser's Intl API.
 * Works with any valid ISO 4217 currency code (USD, EUR, NGN, KES, etc.).
 *
 * @param {number} amount
 * @param {string} currencyCode  e.g. 'GBP', 'USD', 'NGN'
 * @returns {string}  e.g. '£1,234.56'  '₦450,000.00'
 */
export function formatCurrency(amount, currencyCode = 'GBP') {
  const num  = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const code = (currencyCode || 'GBP').toUpperCase();

  // Currencies that conventionally show 0 decimal places
  const noDecimals = ['JPY', 'KRW', 'IDR', 'VND', 'UGX', 'TZS', 'BIF', 'CLP', 'GNF', 'ISK', 'KMF', 'PYG', 'RWF'];
  const decimals   = noDecimals.includes(code) ? 0 : 2;

  try {
    return new Intl.NumberFormat(undefined, {
      style:                 'currency',
      currency:              code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  } catch {
    // Fallback for any unknown code
    return `${code} ${num.toFixed(decimals)}`;
  }
}

/**
 * Returns the currency symbol for a given code.
 * Uses Intl to derive it automatically — no hardcoded map needed.
 */
export function getCurrencySymbol(currencyCode = 'GBP') {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: 'currency', currency: currencyCode,
    }).formatToParts(0);
    const sym = parts.find(p => p.type === 'currency');
    return sym ? sym.value : currencyCode;
  } catch {
    return currencyCode;
  }
}
