import { useState, useEffect } from 'react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, CATEGORY_LABELS } from '../../utils/constants.js';
import { todayInputDate, toInputDate } from '../../utils/formatDate.js';
import Alert from '../common/Alert.jsx';
import Spinner from '../common/Spinner.jsx';
import styles from '../../styles/TransactionForm.module.css';

const EMPTY_FORM = { type: 'expense', amount: '', category: '', description: '', date: todayInputDate() };

/**
 * @param {{ onSubmit: (payload) => Promise<void>, editing?: object, onSuccess?: () => void }} props
 */
export default function TransactionForm({ onSubmit, editing, onSuccess }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState(null);

  useEffect(() => {
    if (editing) {
      setForm({
        type:        editing.type,
        amount:      String(editing.amount),
        category:    editing.category,
        description: editing.description || '',
        date:        toInputDate(editing.date),
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setAlert(null);
  }, [editing]);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
    // Reset category when type changes
    if (field === 'type') setForm(f => ({ ...f, type: value, category: '' }));
  };

  const validate = () => {
    const e = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || form.amount === '')      e.amount = 'Amount is required';
    else if (isNaN(amt) || amt <= 0)             e.amount = 'Amount must be a positive number';
    else if (amt > 999_999_999)                  e.amount = 'Amount cannot exceed 999,999,999';
    if (!form.category)                          e.category = 'Category is required';
    if (!form.date)                              e.date = 'Date is required';
    else if (new Date(form.date) > new Date(new Date().toDateString()))
                                                 e.date = 'Date cannot be in the future';
    if (form.description.length > 200)           e.description = 'Max 200 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    setLoading(true);
    try {
      await onSubmit({
        type:        form.type,
        amount:      parseFloat(form.amount),
        category:    form.category,
        description: form.description.trim(),
        date:        form.date,
      });
      setAlert({ type: 'success', message: editing ? 'Transaction updated!' : 'Transaction added!' });
      if (!editing) setForm(EMPTY_FORM);
      onSuccess?.();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Type toggle */}
      <div className={styles.typeToggle}>
        {['expense', 'income'].map(t => (
          <label key={t} className={`${styles.typeLabel} ${form.type === t ? styles.typeActive : ''}`}>
            <input
              type="radio" name="type" value={t}
              checked={form.type === t}
              onChange={() => set('type', t)}
            />
            {t === 'expense' ? '📉 Expense' : '📈 Income'}
          </label>
        ))}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="amount">Amount *</label>
          <input
            id="amount" type="number" min="0.01" step="0.01" max="999999999"
            value={form.amount} onChange={e => set('amount', e.target.value)}
            placeholder="0.00" className={errors.amount ? styles.inputError : ''}
          />
          {errors.amount && <span className={styles.errorMsg}>{errors.amount}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="date">Date *</label>
          <input
            id="date" type="date"
            value={form.date} onChange={e => set('date', e.target.value)}
            max={todayInputDate()}
            className={errors.date ? styles.inputError : ''}
          />
          {errors.date && <span className={styles.errorMsg}>{errors.date}</span>}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="category">Category *</label>
        <select
          id="category"
          value={form.category} onChange={e => set('category', e.target.value)}
          className={errors.category ? styles.inputError : ''}
        >
          <option value="">Select category…</option>
          {categoryOptions.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        {errors.category && <span className={styles.errorMsg}>{errors.category}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="description">
          Description <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          id="description" rows={2} maxLength={200}
          value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="What was this for?"
          className={errors.description ? styles.inputError : ''}
        />
        <span className={styles.charCount}>{form.description.length}/200</span>
        {errors.description && <span className={styles.errorMsg}>{errors.description}</span>}
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? <Spinner size="sm" /> : (editing ? 'Update Transaction' : 'Add Transaction')}
      </button>
    </form>
  );
}
