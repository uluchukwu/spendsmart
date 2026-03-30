import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CATEGORY_LABELS } from '../../utils/constants.js';
import { getCategoryChartColors } from '../../utils/categoryColors.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import styles from '../../styles/Dashboard.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * @param {{ transactions: Array }} props — filtered to expenses for last 30 days
 */
export default function ExpenseChart({ transactions }) {
  const { displayCurrency: currency } = useCurrency();

  const chartData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const grouped = {};
    transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
      .forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);
    return { labels, values };
  }, [transactions]);

  if (chartData.labels.length === 0) {
    return (
      <div className={styles.chartEmpty}>
        <span className={styles.emptyIcon}>📊</span>
        <p>No expense data yet</p>
        <span>Add expenses to see your breakdown</span>
      </div>
    );
  }

  const data = {
    labels: chartData.labels.map(l => CATEGORY_LABELS[l] || l),
    datasets: [{
      data:            chartData.values,
      backgroundColor: getCategoryChartColors(chartData.labels),
      borderWidth:     2,
      borderColor:     '#1a1d27',
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#8b90b8', font: { size: 11 }, padding: 10, boxWidth: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatCurrency(ctx.raw, currency)}`,
        },
      },
    },
  };

  return (
    <div className={styles.chartWrap}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
