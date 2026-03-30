import { useExchangeRate } from '../../hooks/useExchangeRate.js';

const STATUS_LABEL = {
  live:    'Live rate',
  cached:  'Cached rate',
  offline: 'Offline – using fallback',
  manual:  'Manual rate',
  loading: 'Loading…',
};

export default function QuickConverter() {
  const {
    currencies,
    fromCode,    setFromCode,
    toCode,      setToCode,
    amount,      setAmount,
    manualRate,  setManualRate,  clearManualRate,
    formattedResult,
    rateStatus,
    refreshRates,
    getRate,
  } = useExchangeRate();

  const liveRateStr = getRate(fromCode, toCode);

  return (
    <div className="panel">
      <div className="panel-title">Quick Converter</div>

      {/* ── Amount + from-currency ── */}
      <div className="conv-row">
        <input
          type="number" min="0" step="any"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={fromCode} onChange={e => { setFromCode(e.target.value); clearManualRate(); }} style={{ width: 'auto' }}>
          {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
        </select>
      </div>

      <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '1.2rem', margin: '6px 0' }}>↕</div>

      {/* ── Result + to-currency ── */}
      <div className="conv-row" style={{ marginBottom: 10 }}>
        <div className="conv-result">
          {formattedResult ?? <span style={{ color: 'var(--muted)' }}>—</span>}
        </div>
        <select value={toCode} onChange={e => { setToCode(e.target.value); clearManualRate(); }} style={{ width: 'auto' }}>
          {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
        </select>
      </div>

      {/* ── Rate row: editable input showing live rate, overridable ── */}
      <div className="conv-rate-row">
        <span className={`rate-dot rate-dot-${rateStatus}`} />
        <span style={{ color: 'var(--muted)', fontSize: '.75rem', whiteSpace: 'nowrap' }}>
          1 {fromCode} =
        </span>
        <input
          className="conv-rate-input"
          type="number"
          min="0"
          step="any"
          placeholder={liveRateStr ? liveRateStr.split('= ')[1] : '…'}
          value={manualRate}
          onChange={e => setManualRate(e.target.value)}
          title="Type a custom rate to override the live rate"
        />
        <span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>{toCode}</span>

        {manualRate !== '' ? (
          <button
            className="conv-rate-reset"
            onClick={clearManualRate}
            title="Reset to live rate"
          >✕</button>
        ) : (
          <button
            className="conv-rate-reset"
            onClick={refreshRates}
            title="Refresh live rates"
          >↻</button>
        )}
      </div>

      <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: 3, paddingLeft: 2 }}>
        {STATUS_LABEL[rateStatus] ?? rateStatus}
        {manualRate !== '' && (
          <span style={{ marginLeft: 6, color: 'var(--accent)' }}>— custom override active</span>
        )}
      </div>

      <style>{`
        .conv-row { display:flex; gap:8px; align-items:center; }
        .conv-row input, .conv-row select { margin-bottom:0; }
        .conv-result {
          flex:1; background:var(--bg3); border:1px solid var(--border);
          border-radius:9px; padding:10px 13px; font-size:1rem;
          font-weight:700; color:var(--accent); min-height:42px;
          display:flex; align-items:center;
        }
        .conv-rate-row {
          display:flex; align-items:center; gap:6px;
          margin-top:8px;
        }
        .conv-rate-input {
          flex:1; min-width:0;
          background:var(--bg3); border:1px solid var(--border);
          border-radius:7px; padding:5px 9px;
          font-size:.82rem; color:var(--text);
          margin-bottom:0;
        }
        .conv-rate-input:focus {
          outline:none; border-color:var(--accent);
        }
        .conv-rate-reset {
          background:none; border:none; cursor:pointer;
          color:var(--muted); font-size:.9rem; padding:2px 4px;
          line-height:1; border-radius:4px;
          transition:color .15s;
        }
        .conv-rate-reset:hover { color:var(--accent); }
      `}</style>
    </div>
  );
}
