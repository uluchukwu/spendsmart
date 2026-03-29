import { useState } from 'react';
import BudgetPanel   from '../budget/BudgetPanel.jsx';
import BudgetModal   from '../budget/BudgetModal.jsx';
import QuickConverter from '../currency/QuickConverter.jsx';
import MoneyTips     from '../tips/MoneyTips.jsx';
import { useBudgets } from '../../hooks/useBudgets.js';
import styles        from '../../styles/DashboardSidebar.module.css';

/**
 * Right-hand sidebar for the Dashboard.
 * Contains: Budget Goals (with edit modal), Quick Converter, Money Tips.
 */
export default function DashboardSidebar({ transactions }) {
  const { budgets, monthlyCap, upsertBudget, deleteBudget, saveCap } = useBudgets();
  const [budgetOpen, setBudgetOpen] = useState(false);

  return (
    <aside className={styles.sidebar}>
      {/* Budget Goals panel — clicking "Edit" opens the full modal */}
      <div className={styles.budgetHeader}>
        <BudgetPanel
          transactions={transactions}
          budgets={budgets}
          monthlyCap={monthlyCap}
        />
        <button
          className={styles.editBudgetBtn}
          onClick={() => setBudgetOpen(true)}
          title="Edit budget goals"
        >
          ✏️ Edit Budgets
        </button>
      </div>

      <QuickConverter />
      <MoneyTips />

      <BudgetModal
        open={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        budgets={budgets}
        monthlyCap={monthlyCap}
        onUpsert={upsertBudget}
        onDelete={deleteBudget}
        onSaveCap={saveCap}
      />
    </aside>
  );
}
