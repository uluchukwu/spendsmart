const CURRENCY_LOCALES = {
  GBP: { locale: 'en-GB', currency: 'GBP' },
  USD: { locale: 'en-US', currency: 'USD' },
  EUR: { locale: 'de-DE', currency: 'EUR' },
  NGN: { locale: 'en-NG', currency: 'NGN' },
  CAD: { locale: 'en-CA', currency: 'CAD' },
  AUD: { locale: 'en-AU', currency: 'AUD' },
};

/**
 * Format a number as a currency string.
 * @param {number} amount
 * @param {string} currencyCode - e.g. 'GBP'
 * @returns {string} e.g. '£1,234.56'
 */
export function formatCurrency(amount, currencyCode = 'GBP') {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const cfg  = CURRENCY_LOCALES[currencyCode] || CURRENCY_LOCALES.GBP;

  return new Intl.NumberFormat(cfg.locale, {
    style:                 'currency',
    currency:              cfg.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Returns the currency symbol for a given code.
 */
export function getCurrencySymbol(currencyCode = 'GBP') {
  const symbols = { GBP: '£', USD: '$', EUR: '€', NGN: '₦', CAD: 'C$', AUD: 'A$' };
  return symbols[currencyCode] || currencyCode;
}
