import { useState, useEffect } from 'react';
import { ALL_TIPS } from '../../utils/constants.js';

export default function MoneyTips() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * ALL_TIPS.length));

  // Rotate every 15 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setIdx(i => (i + 1) % ALL_TIPS.length);
    }, 15000);
    return () => clearInterval(id);
  }, []);

  const tip = ALL_TIPS[idx];

  return (
    <div className="panel tips-panel">
      <div className="panel-title">💡 Money Tips</div>
      <div className="tip-card">
        <span className="tip-icon">{tip.icon}</span>
        <p className="tip-text">{tip.text}</p>
      </div>
      <div className="tip-nav">
        <button
          className="btn-icon"
          onClick={() => setIdx(i => (i - 1 + ALL_TIPS.length) % ALL_TIPS.length)}
          aria-label="Previous tip"
        >‹</button>
        <span style={{ fontSize:'.74rem', color:'var(--muted)' }}>{idx + 1} / {ALL_TIPS.length}</span>
        <button
          className="btn-icon"
          onClick={() => setIdx(i => (i + 1) % ALL_TIPS.length)}
          aria-label="Next tip"
        >›</button>
      </div>

      <style>{`
        .tip-card { display:flex; gap:12px; align-items:flex-start; padding:12px; background:var(--bg3); border-radius:10px; border:1px solid var(--border); margin-bottom:10px; }
        .tip-icon { font-size:1.5rem; flex-shrink:0; }
        .tip-text { font-size:.84rem; color:var(--muted); line-height:1.5; }
        .tip-nav  { display:flex; align-items:center; justify-content:center; gap:10px; }
      `}</style>
    </div>
  );
}
