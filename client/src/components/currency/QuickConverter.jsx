import { useExchangeRate } from '../../hooks/useExchangeRate.js';

export default function QuickConverter() {
  const {
    currencies, fromCode, setFromCode, toCode, setToCode,
    amount, setAmount, formattedResult, getRate, rateStatus,
  } = useExchangeRate();

  const rateStr = getRate(fromCode, toCode);

  return (
    <div className="panel">
      <div className="panel-title">Quick Converter</div>

      <div className="conv-row">
        <input
          type="number" min="0" step="any"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ flex:1 }}
        />
        <select value={fromCode} onChange={e => setFromCode(e.target.value)} style={{ width:'auto' }}>
          {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
        </select>
      </div>

      <div style={{ textAlign:'center', color:'var(--muted)', fontSize:'1.2rem', margin:'6px 0' }}>↕</div>

      <div className="conv-row" style={{ marginBottom:10 }}>
        <div className="conv-result">
          {formattedResult ?? <span style={{ color:'var(--muted)' }}>—</span>}
        </div>
        <select value={toCode} onChange={e => setToCode(e.target.value)} style={{ width:'auto' }}>
          {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
        </select>
      </div>

      {rateStr && (
        <div className="conv-rate">
          <span className={`rate-dot rate-dot-${rateStatus}`} style={{ display:'inline-block' }} />
          {rateStr}
        </div>
      )}

      <style>{`
        .conv-row { display:flex; gap:8px; align-items:center; }
        .conv-row input, .conv-row select { margin-bottom:0; }
        .conv-result { flex:1; background:var(--bg3); border:1px solid var(--border); border-radius:9px; padding:10px 13px; font-size:1rem; font-weight:700; color:var(--accent); min-height:42px; display:flex; align-items:center; }
        .conv-rate { font-size:.76rem; color:var(--muted); margin-top:6px; display:flex; align-items:center; gap:6px; }
      `}</style>
    </div>
  );
}
