/** Return today's date as YYYY-MM-DD */
export function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Return start of current ISO week (Monday) as YYYY-MM-DD */
export function startOfWeek() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Return start of current month as YYYY-MM-DD */
export function startOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/** Format YYYY-MM-DD to a readable label, e.g. "15 Jan 2024" */
export function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/** Current month as YYYY-MM string */
export function currentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Check if a YYYY-MM-DD date is in the current month */
export function isCurrentMonth(dateStr) {
  return dateStr && dateStr.startsWith(currentYearMonth());
}
