import { useState } from 'react';
import Modal from '../common/Modal.jsx';
import { CATEGORIES, CATEGORY_ICONS } from '../../utils/constants.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function BudgetModal({ open, onClose, budgets, monthlyCap, onUpsert, onDelete, onSaveCap }) {
  const { showToast }       = useToast();
  const [catInputs, setCatInputs] = useState({});
  const [capInput,  setCapInput]  = useState('');
  const [saving,    setSaving]    = useState(null);

  function getCatVal(cat) {
    if (catInputs[cat] !== undefined) return catInputs[cat];
    const existing = budgets.find(b => b.category === cat);
    return existing ? String(existing.monthlyLimit) : '';
  }

  async function handleCatSave(cat) {
    const val = parseFloat(getCatVal(cat));
    if (!val || val <= 0) { showToast('Enter a valid amount', 'error'); return; }
    setSaving(cat);
    try {
      await onUpsert(cat, val);
      setCatInputs(p => ({ ...p, [cat]: undefined }));
      showToast(`${cat} budget saved`, 'success', '🎯');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(null); }
  }

  async function handleCatDelete(cat) {
    setSaving(`del-${cat}`);
    try {
      await onDelete(cat);
      showToast(`${cat} budget removed`, 'info');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(null); }
  }

  async function handleCapSave() {
    const val = capInput === '' ? null : parseFloat(capInput);
    if (capInput !== '' && (!val || val <= 0)) { showToast('Enter a valid cap', 'error'); return; }
    setSaving('cap');
    try {
      await onSaveCap(val);
      showToast(val ? 'Monthly cap saved' : 'Monthly cap removed', 'success', '🏦');
      setCapInput('');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(null); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Budget Goals" width={500}>
      {/* Monthly cap section */}
      <div className="budget-section">
        <div className="budget-section-title">🏦 Monthly Spending Cap</div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input
            type="number" min="0" step="0.01"
            placeholder={monthlyCap ? `Current: £${monthlyCap.limit}` : 'No cap set'}
            value={capInput}
            onChange={e => setCapInput(e.target.value)}
            style={{ flex:1 }}
          />
          <button className="btn btn-primary" onClick={handleCapSave} disabled={saving === 'cap'} style={{ whiteSpace:'nowrap' }}>
            {saving === 'cap' ? <span className="spinner spinner-sm"/> : 'Save'}
          </button>
          {monthlyCap && (
            <button className="btn btn-ghost" onClick={() => { setCapInput(''); handleCapSave(); }} disabled={saving === 'cap'}>
              Remove
            </button>
          )}
        </div>
        <p className="hint" style={{ marginTop:4 }}>Leave empty and save to remove the cap.</p>
      </div>

      <hr style={{ border:'none', borderTop:'1px solid var(--border)', margin:'16px 0' }} />

      {/* Per-category budgets */}
      <div className="budget-section-title">📊 Category Budgets (monthly)</div>
      <div className="cat-budget-list">
        {CATEGORIES.map(cat => {
          const existing = budgets.find(b => b.category === cat);
          return (
            <div key={cat} className="cat-budget-row">
              <span className="cat-budget-label">{CATEGORY_ICONS[cat]} {cat}</span>
              <input
                type="number" min="0" step="0.01"
                placeholder={existing ? `£${existing.monthlyLimit}` : 'No limit'}
                value={getCatVal(cat)}
                onChange={e => setCatInputs(p => ({ ...p, [cat]: e.target.value }))}
                style={{ width:100 }}
              />
              <button className="btn btn-primary" onClick={() => handleCatSave(cat)}
                disabled={!!saving} style={{ padding:'6px 10px', fontSize:'.78rem' }}>
                {saving === cat ? <span className="spinner spinner-sm"/> : 'Set'}
              </button>
              {existing && (
                <button className="btn btn-ghost" onClick={() => handleCatDelete(cat)}
                  disabled={!!saving} style={{ padding:'6px 8px', fontSize:'.78rem' }}>
                  {saving === `del-${cat}` ? <span className="spinner spinner-sm"/> : '✕'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .budget-section { margin-bottom:4px; }
        .budget-section-title { font-size:.8rem; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:.05em; margin-bottom:10px; }
        .cat-budget-list { display:flex; flex-direction:column; gap:8px; margin-top:10px; }
        .cat-budget-row { display:flex; align-items:center; gap:8px; }
        .cat-budget-label { flex:1; font-size:.86rem; }
        .cat-budget-row input { margin-bottom:0; }
      `}</style>
    </Modal>
  );
}
