import { useState, useMemo } from 'react';
import Header from '../components/layout/Header.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import FilterBar from '../components/expenses/FilterBar.jsx';
import ExpenseList from '../components/expenses/ExpenseList.jsx';
import ExpenseForm from '../components/expenses/ExpenseForm.jsx';
import BudgetModal from '../components/budget/BudgetModal.jsx';
import CapBanner from '../components/budget/CapBanner.jsx';
import RateBar from '../components/currency/RateBar.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { useExpenses } from '../hooks/useExpenses.js';
import { useBudgets } from '../hooks/useBudgets.js';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { applyFilters, sumExpenses } from '../utils/filters.js';

const DEFAULT_FILTERS = { period: 'month', category: 'all', sortBy: 'date-desc' };

export default function DashboardPage() {
  const { expenses, loading: expLoading, addExpense, editExpense, deleteExpense } = useExpenses();
  const { budgets, monthlyCap, loading: budLoading, upsertBudget, deleteBudget, saveCap } = useBudgets();
  const { fmt } = useCurrency();

  const [filters,       setFilters]       = useState(DEFAULT_FILTERS);
  const [formOpen,      setFormOpen]      = useState(false);
  const [editing,       setEditing]       = useState(null);
  const [budgetOpen,    setBudgetOpen]    = useState(false);

  const filtered = useMemo(() => applyFilters(expenses, filters), [expenses, filters]);
  const total    = useMemo(() => sumExpenses(filtered), [filtered]);

  function openAdd()       { setEditing(null); setFormOpen(true); }
  function openEdit(exp)   { setEditing(exp);  setFormOpen(true); }

  async function handleSave(payload) {
    if (editing) await editExpense(editing._id, payload);
    else         await addExpense(payload);
  }

  if (expLoading || budLoading) {
    return (
      <div className="app-shell">
        <Header onOpenBudget={() => setBudgetOpen(true)} />
        <Spinner style={{ marginTop: 80 }} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header onOpenBudget={() => setBudgetOpen(true)} />
      <CapBanner expenses={expenses} monthlyCap={monthlyCap} />

      <main className="main-content">
        {/* Summary row */}
        <div className="summary-row" style={{ marginBottom: 16 }}>
          <div className="summary-card">
            <span className="label">Total expenses</span>
            <span className="value value-expense">{fmt(expenses.reduce((s, e) => s + e.amount, 0))}</span>
            <span className="sub">{expenses.length} transactions</span>
          </div>
          <div className="summary-card">
            <span className="label">This period</span>
            <span className="value value-neutral">{fmt(total)}</span>
            <span className="sub">{filtered.length} shown</span>
          </div>
          <div className="summary-card">
            <span className="label">Rate feed</span>
            <RateBar />
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Main column */}
          <div className="dashboard-main">
            <div className="panel">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div className="panel-title" style={{ margin:0 }}>Expenses</div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Expense</button>
              </div>
              <FilterBar
                filters={filters}
                onChange={setFilters}
                count={filtered.length}
                total={fmt(total)}
              />
            </div>

            <div className="panel" style={{ padding: '8px 4px' }}>
              <ExpenseList
                expenses={filtered}
                onEdit={openEdit}
                onDelete={deleteExpense}
              />
            </div>
          </div>

          {/* Sidebar */}
          <Sidebar expenses={expenses} budgets={budgets} monthlyCap={monthlyCap} />
        </div>
      </main>

      <ExpenseForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        editing={editing}
      />

      <BudgetModal
        open={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        budgets={budgets}
        monthlyCap={monthlyCap}
        onUpsert={upsertBudget}
        onDelete={deleteBudget}
        onSaveCap={saveCap}
      />
    </div>
  );
}
