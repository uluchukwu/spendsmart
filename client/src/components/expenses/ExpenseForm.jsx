import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import ItemizedSection from './ItemizedSection.jsx';
import { CATEGORIES } from '../../utils/constants.js';
import { today } from '../../utils/dates.js';
import { useToast } from '../../context/ToastContext.jsx';

const EMPTY = { item: '', amount: '', category: 'Food', date: today(), notes: '', items: [] };

export default function ExpenseForm({ open, onClose, onSave, editing }) {
  const { showToast }             = useToast();
  const [form,       setForm]     = useState(EMPTY);
  const [useItems,   setUseItems] = useState(false);
  const [saving,     setSaving]   = useState(false);
  const [errors,     setErrors]   = useState({});

  useEffect(() => {
    if (editing) {
      setForm({ ...editing, amount: editing.amount, items: editing.items || [] });
      setUseItems((editing.items || []).length > 0);
    } else {
      setForm({ ...EMPTY, date: today() });
      setUseItems(false);
    }
    setErrors({});
  }, [editing, open]);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  // Auto-compute amount from items total
  function handleItemsChange(items) {
    set('items', items);
    const total = items.reduce((s, r) => s + (parseFloat(r.qty)||0) * (parseFloat(r.price)||0), 0);
    if (total > 0) set('amount', total.toFixed(2));
  }

  function validate() {
    const e = {};
    if (!form.item.trim())           e.item   = 'Description is required';
    if (!form.amount || form.amount <= 0) e.amount = 'Amount must be > 0';
    if (!form.date)                  e.date   = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        items:  useItems
          ? form.items.filter(r => r.name.trim()).map(r => ({
              name: r.name.trim(),
              qty:  parseFloat(r.qty) || 1,
              price: parseFloat(r.price) || 0,
            }))
          : [],
      };
      await onSave(payload);
      showToast(editing ? 'Expense updated' : 'Expense added', 'success', '✅');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Expense' : 'Add Expense'}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Description *</label>
          <input value={form.item} onChange={e => set('item', e.target.value)} placeholder="e.g. Lunch at café" maxLength={200} />
          {errors.item && <span style={{ color:'var(--danger)', fontSize:'.78rem' }}>{errors.item}</span>}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div className="form-group">
            <label>Amount (£) *</label>
            <input type="number" min="0.01" step="0.01" value={form.amount}
              onChange={e => set('amount', e.target.value)} placeholder="0.00" />
            {errors.amount && <span style={{ color:'var(--danger)', fontSize:'.78rem' }}>{errors.amount}</span>}
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            {errors.date && <span style={{ color:'var(--danger)', fontSize:'.78rem' }}>{errors.date}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Any additional notes..." maxLength={500} style={{ resize:'vertical' }} />
        </div>

        <div className="form-group">
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <input type="checkbox" checked={useItems} onChange={e => setUseItems(e.target.checked)}
              style={{ width:'auto' }} />
            Add itemized purchase list
          </label>
        </div>

        {useItems && <ItemizedSection items={form.items} onChange={handleItemsChange} />}

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:16 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : (editing ? 'Update' : 'Add Expense')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
