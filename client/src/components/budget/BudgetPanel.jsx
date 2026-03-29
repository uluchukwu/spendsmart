import { useCurrency } from '../../context/CurrencyContext.jsx';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../../utils/constants.js';
import { isCurrentMonth } from '../../utils/dates.js';
import { groupByCategory } from '../../utils/filters.js';

export default function BudgetPanel({ transactions, budgets, monthlyCap }) {
  const { fmt } = useCurrency();

  // Only count expense-type transactions in the current calendar month
  const thisMonth = (transactions || []).filter(
    t => t.type === 'expense' && isCurrentMonth(new Date(t.date).toISOString().slice(0, 10))
  );
  const spent     = groupByCategory(thisMonth);
  const totalSpent = thisMonth.reduce((s, e) => s + e.amount, 0);
  const capPct    = monthlyCap ? Math.min((totalSpent / monthlyCap.limit) * 100, 100) : 0;

  if (!monthlyCap && (!budgets || budgets.length === 0)) {
    return (
      <div className="panel">
        <div className="panel-title">Budget Goals</div>
        <p style={{ fontSize:'.82rem', color:'var(--muted)' }}>
          No budgets set. Click <strong>Budgets</strong> in the header to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-title">Budget Goals — This Month</div>

      {monthlyCap && (
        <div className="budget-cap-row">
          <div className="budget-label">
            <span>🏦 Monthly cap</span>
            <span className={capPct >= 100 ? 'budget-over' : ''}>{fmt(totalSpent)} / {fmt(monthlyCap.limit)}</span>
          </div>
          <div className="budget-bar-bg">
            <div
              className="budget-bar-fill"
              style={{
                width: `${capPct}%`,
                background: capPct >= 100 ? 'var(--danger)' : capPct >= 80 ? 'var(--warning)' : 'var(--accent)',
              }}
            />
          </div>
        </div>
      )}

      {budgets.map(b => {
        const s    = spent[b.category] || 0;
        const pct  = Math.min((s / b.monthlyLimit) * 100, 100);
        const over = s > b.monthlyLimit;
        return (
          <div key={b.category} className="budget-cat-row">
            <div className="budget-label">
              <span>{CATEGORY_ICONS[b.category]} {CATEGORY_LABELS[b.category] || b.category}</span>
              <span className={over ? 'budget-over' : ''}>{fmt(s)} / {fmt(b.monthlyLimit)}</span>
            </div>
            <div className="budget-bar-bg">
              <div
                className="budget-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: over ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--accent)',
                }}
              />
            </div>
          </div>
        );
      })}

      <style>{`
        .budget-cap-row, .budget-cat-row { margin-bottom: 12px; }
        .budget-label { display:flex; justify-content:space-between; font-size:.78rem; margin-bottom:4px; color:var(--muted); }
        .budget-label span:first-child { color:var(--text); font-weight:500; }
        .budget-over { color:var(--danger) !important; font-weight:600; }
        .budget-bar-bg { background:var(--bg3); border-radius:6px; height:6px; overflow:hidden; }
        .budget-bar-fill { height:100%; border-radius:6px; transition:width .4s ease; }
      `}</style>
    </div>
  );
}
