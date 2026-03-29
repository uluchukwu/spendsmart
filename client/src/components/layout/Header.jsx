import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import * as expApi from '../../api/expenses.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Header({ onOpenBudget }) {
  const { user, logout }                      = useAuth();
  const { currencies, displayCurrency, changeCurrency } = useCurrency();
  const { showToast }                         = useToast();
  const [menuOpen,     setMenuOpen]           = useState(false);
  const [exporting,    setExporting]          = useState(null);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleExport(type) {
    setExporting(type);
    try {
      type === 'csv' ? await expApi.exportCsv() : await expApi.exportPdf();
      showToast(`${type.toUpperCase()} exported!`, 'success', '📥');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setExporting(null);
    }
  }

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?';

  return (
    <header className="header">
      <div className="header-brand">
        <span className="logo">💳</span>
        <span>SpendSmart</span>
      </div>

      <div className="header-spacer" />

      <div className="header-actions">
        {/* Currency selector */}
        <div className="currency-select-wrap">
          <select value={displayCurrency} onChange={e => changeCurrency(e.target.value)} aria-label="Display currency">
            {currencies.map(c => (
              <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>
            ))}
          </select>
        </div>

        {/* Budget goals */}
        <button className="btn btn-ghost" style={{ fontSize: '.82rem', padding: '6px 12px' }} onClick={onOpenBudget}>
          🎯 Budgets
        </button>

        {/* Export */}
        <button
          className="btn btn-ghost"
          style={{ fontSize: '.82rem', padding: '6px 12px' }}
          onClick={() => handleExport('csv')}
          disabled={!!exporting}
          title="Export CSV"
        >
          {exporting === 'csv' ? <span className="spinner spinner-sm" /> : '📊 CSV'}
        </button>
        <button
          className="btn btn-ghost"
          style={{ fontSize: '.82rem', padding: '6px 12px' }}
          onClick={() => handleExport('pdf')}
          disabled={!!exporting}
          title="Export PDF"
        >
          {exporting === 'pdf' ? <span className="spinner spinner-sm" /> : '📄 PDF'}
        </button>

        {/* User menu */}
        <div className="user-menu" ref={menuRef}>
          <button className="user-menu-btn" onClick={() => setMenuOpen(v => !v)}>
            <span className="avatar">{initials}</span>
            <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </span>
            <span style={{ opacity: .5, fontSize: '.7rem' }}>▾</span>
          </button>
          {menuOpen && (
            <div className="user-dropdown">
              <button onClick={() => { setMenuOpen(false); }}>
                👤 {user?.email}
              </button>
              <hr />
              <button onClick={() => { setMenuOpen(false); logout(); }}>
                🚪 Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
