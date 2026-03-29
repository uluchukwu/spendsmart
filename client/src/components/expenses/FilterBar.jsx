import { CATEGORIES, PERIODS, SORT_OPTIONS } from '../../utils/constants.js';

export default function FilterBar({ filters, onChange, total, count }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="filter-bar">
      <div className="filter-row">
        <div className="period-tabs">
          {PERIODS.map(p => (
            <button
              key={p}
              className={`period-tab ${filters.period === p ? 'active' : ''}`}
              onClick={() => set('period', p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div className="filter-controls">
          <select value={filters.category} onChange={e => set('category', e.target.value)} style={{ width: 'auto' }}>
            <option value="all">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filters.sortBy} onChange={e => set('sortBy', e.target.value)} style={{ width: 'auto' }}>
            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="filter-summary">
        <span>{count} expense{count !== 1 ? 's' : ''}</span>
        {total > 0 && <span className="filter-total">Total shown: <strong>{total}</strong></span>}
      </div>

      <style>{`
        .filter-bar { display: flex; flex-direction: column; gap: 10px; }
        .filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .period-tabs { display: flex; background: var(--bg3); border: 1px solid var(--border); border-radius: 9px; padding: 3px; gap: 2px; }
        .period-tab { background: none; border: none; color: var(--muted); font-size: .8rem; font-weight: 600; padding: 5px 12px; border-radius: 6px; transition: all .15s; }
        .period-tab.active { background: var(--accent); color: #fff; }
        .period-tab:hover:not(.active) { background: var(--bg2); color: var(--text); }
        .filter-controls { display: flex; gap: 8px; flex: 1; flex-wrap: wrap; }
        .filter-controls select { flex: 1; min-width: 130px; font-size: .82rem; padding: 7px 10px; }
        .filter-summary { display: flex; gap: 12px; font-size: .8rem; color: var(--muted); }
        .filter-total strong { color: var(--accent2); }
      `}</style>
    </div>
  );
}
