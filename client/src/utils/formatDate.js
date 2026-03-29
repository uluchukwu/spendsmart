/**
 * Format an ISO date string or Date object to a readable label.
 * @param {string|Date} date
 * @param {'short'|'medium'|'long'} style
 */
export function formatDate(date, style = 'medium') {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const options = {
    short:  { month: 'short', day: 'numeric' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long:   { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' },
  };

  return d.toLocaleDateString('en-GB', options[style] || options.medium);
}

/**
 * Returns a date string in YYYY-MM-DD format suitable for <input type="date">.
 */
export function toInputDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/**
 * Returns today's date as YYYY-MM-DD.
 */
export function todayInputDate() {
  return new Date().toISOString().slice(0, 10);
}
