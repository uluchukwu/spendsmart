import { useCurrency } from '../../context/CurrencyContext.jsx';

function emptyRow() { return { name: '', qty: 1, price: '' }; }

export default function ItemizedSection({ items, onChange }) {
  const { fmt } = useCurrency();

  function update(idx, field, value) {
    const next = items.map((r, i) => i === idx ? { ...r, [field]: value } : r);
    onChange(next);
  }

  function addRow()    { onChange([...items, emptyRow()]); }
  function removeRow(idx) { onChange(items.filter((_, i) => i !== idx)); }

  const total = items.reduce((s, r) => {
    const q = parseFloat(r.qty) || 0;
    const p = parseFloat(r.price) || 0;
    return s + q * p;
  }, 0);

  return (
    <div className="itemized">
      <div className="itemized-header">
        <span>Item</span><span>Qty</span><span>Unit price</span><span>Subtotal</span><span />
      </div>

      {items.map((row, idx) => {
        const sub = (parseFloat(row.qty) || 0) * (parseFloat(row.price) || 0);
        return (
          <div key={idx} className="itemized-row">
            <input
              placeholder="Item name"
              value={row.name}
              onChange={e => update(idx, 'name', e.target.value)}
            />
            <input
              type="number" min="0" step="1" placeholder="1"
              value={row.qty}
              onChange={e => update(idx, 'qty', e.target.value)}
            />
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={row.price}
              onChange={e => update(idx, 'price', e.target.value)}
            />
            <span className="item-sub">{sub > 0 ? fmt(sub) : '—'}</span>
            <button className="btn-icon" onClick={() => removeRow(idx)} type="button" aria-label="Remove row">✕</button>
          </div>
        );
      })}

      <div className="itemized-footer">
        <button className="btn btn-ghost" type="button" onClick={addRow} style={{ fontSize: '.8rem', padding: '6px 12px' }}>
          + Add item
        </button>
        {total > 0 && (
          <span className="itemized-total">Total: <strong>{fmt(total)}</strong></span>
        )}
      </div>

      <style>{`
        .itemized { display: flex; flex-direction: column; gap: 6px; }
        .itemized-header { display: grid; grid-template-columns: 1fr 70px 100px 90px 30px; gap: 6px; font-size: .74rem; color: var(--muted); padding: 0 4px; }
        .itemized-row { display: grid; grid-template-columns: 1fr 70px 100px 90px 30px; gap: 6px; align-items: center; }
        .itemized-row input { margin-bottom: 0; }
        .item-sub { font-size: .82rem; color: var(--accent2); text-align: right; }
        .itemized-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
        .itemized-total { font-size: .85rem; color: var(--muted); }
        .itemized-total strong { color: var(--accent); }
      `}</style>
    </div>
  );
}
