import { useState }       from 'react';
import { useCurrency }   from '../context/CurrencyContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { CURRENCIES }    from '../utils/constants.js';
import styles            from '../styles/Settings.module.css';

export default function Settings() {
  const { displayCurrency, changeCurrency, rates, rateStatus, refreshRates } = useCurrency();
  const [search, setSearch] = useState('');
  const [saved,  setSaved]  = useState(false);

  const filtered = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code) => {
    changeCurrency(code);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Show how much 1 GBP is worth in each currency
  const getRate = (code) => {
    if (!rates || code === 'GBP') return null;
    const r = rates[code];
    if (!r) return null;
    return formatCurrency(r, code);
  };

  const STATUS_INFO = {
    live:    { dot: '#22c55e', text: 'Live exchange rates' },
    cached:  { dot: '#f59e0b', text: 'Cached rates (less than 1 hour old)' },
    offline: { dot: '#ef4444', text: 'Offline — using fallback rates' },
    loading: { dot: '#6c63ff', text: 'Loading rates…' },
    manual:  { dot: '#6c63ff', text: 'Manual rate' },
  };
  const statusInfo = STATUS_INFO[rateStatus] || STATUS_INFO.loading;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Choose the currency used throughout the app</p>
        </div>
      </div>

      {/* ── Current selection banner ── */}
      <div className={styles.currentBanner}>
        <div className={styles.currentLeft}>
          <span className={styles.currentFlag}>
            {CURRENCIES.find(c => c.code === displayCurrency)?.flag || '🌍'}
          </span>
          <div>
            <div className={styles.currentCode}>{displayCurrency}</div>
            <div className={styles.currentName}>
              {CURRENCIES.find(c => c.code === displayCurrency)?.name || displayCurrency}
            </div>
          </div>
        </div>
        <div className={styles.currentPreview}>
          <span className={styles.previewLabel}>Preview</span>
          <span className={styles.previewAmount}>{formatCurrency(1250, displayCurrency)}</span>
        </div>
        {saved && <span className={styles.savedBadge}>✓ Saved</span>}
      </div>

      {/* ── Rate status ── */}
      <div className={styles.rateStatus}>
        <span className={styles.rateDot} style={{ background: statusInfo.dot }} />
        <span>{statusInfo.text}</span>
        {rateStatus !== 'loading' && (
          <button className={styles.refreshBtn} onClick={refreshRates}>↻ Refresh rates</button>
        )}
      </div>

      {/* ── Search ── */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.search}
          type="text"
          placeholder="Search currency or country…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* ── Currency grid ── */}
      {filtered.length === 0 ? (
        <p className={styles.noResults}>No currencies match "{search}"</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map(c => {
            const isActive  = c.code === displayCurrency;
            const rateLabel = getRate(c.code);
            return (
              <button
                key={c.code}
                className={`${styles.card} ${isActive ? styles.activeCard : ''}`}
                onClick={() => handleSelect(c.code)}
                title={`Switch to ${c.name}`}
              >
                <span className={styles.flag}>{c.flag}</span>
                <span className={styles.code}>{c.code}</span>
                <span className={styles.name}>{c.name}</span>
                {rateLabel && (
                  <span className={styles.rate} title={`1 GBP = ${rateLabel}`}>
                    {rateLabel}
                  </span>
                )}
                {isActive && <span className={styles.check}>✓</span>}
              </button>
            );
          })}
        </div>
      )}

      <p className={styles.note}>
        ℹ️ This sets the currency symbol and formatting used throughout SpendSmart.
        Amounts are stored as-entered — switching currency changes the display only,
        not the underlying values.
      </p>
    </div>
  );
}
