import { useCurrency } from '../../context/CurrencyContext.jsx';

const STATUS_LABELS = {
  live:    'Live rates',
  cached:  'Cached rates',
  offline: 'Offline — default rates',
  loading: 'Loading rates…',
};

export default function RateBar() {
  const { rates, rateStatus, displayCurrency, refreshRates } = useCurrency();

  const dotClass = `rate-dot rate-dot-${rateStatus}`;

  // Show GBP → display currency rate if not GBP
  let rateLabel = '';
  if (displayCurrency !== 'GBP' && rates[displayCurrency]) {
    rateLabel = `1 GBP = ${rates[displayCurrency].toFixed(displayCurrency === 'JPY' ? 0 : 4)} ${displayCurrency}`;
  }

  return (
    <div className="rate-bar">
      <span className={dotClass} title={STATUS_LABELS[rateStatus]} />
      <span style={{ color:'var(--muted)', fontSize:'.78rem' }}>{STATUS_LABELS[rateStatus]}</span>
      {rateLabel && <span className="rate-val">{rateLabel}</span>}
      <span className="rate-spacer" />
      {rateStatus !== 'loading' && (
        <button
          className="btn-icon"
          onClick={refreshRates}
          title="Refresh rates"
          style={{ fontSize:'.8rem', padding:'3px 6px' }}
        >
          ↻
        </button>
      )}
    </div>
  );
}
