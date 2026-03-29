import BudgetPanel from '../budget/BudgetPanel.jsx';
import QuickConverter from '../currency/QuickConverter.jsx';
import CategoryChart from '../charts/CategoryChart.jsx';
import MoneyTips from '../tips/MoneyTips.jsx';

export default function Sidebar({ expenses, budgets, monthlyCap }) {
  return (
    <aside className="dashboard-sidebar">
      <BudgetPanel expenses={expenses} budgets={budgets} monthlyCap={monthlyCap} />
      <CategoryChart expenses={expenses} />
      <QuickConverter />
      <MoneyTips />
    </aside>
  );
}
