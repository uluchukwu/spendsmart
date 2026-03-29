import { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import { isCurrentMonth } from '../../utils/dates.js';

export default function CapBanner({ expenses, monthlyCap }) {
  const { fmt }   = useCurrency();
  const [dismissed, setDismissed] = useState(false);

  if (!monthlyCap || dismissed) return null;

  const totalSpent = expenses
    .filter(e => isCurrentMonth(e.date))
    .reduce((s, e) => s + e.amount, 0);

  const pct  = (totalSpent / monthlyCap.limit) * 100;
  if (pct < 80) return null;

  const over   = pct >= 100;
  const label  = over
    ? `⚠️ You've exceeded your monthly cap of ${fmt(monthlyCap.limit)}! (${fmt(totalSpent)} spent)`
    : `⚠️ You've used ${pct.toFixed(0)}% of your monthly cap (${fmt(totalSpent)} / ${fmt(monthlyCap.limit)})`;

  return (
    <div className="cap-banner" style={over ? { background:'rgba(255,71,87,.15)', borderColor:'rgba(255,71,87,.4)' } : {}}>
      <span>{label}</span>
      <button className="cap-close" onClick={() => setDismissed(true)} aria-label="Dismiss">×</button>
    </div>
  );
}
