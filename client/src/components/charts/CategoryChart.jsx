import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import { groupByCategory } from '../../utils/filters.js';
import { CHART_COLORS, CATEGORY_ICONS } from '../../utils/constants.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryChart({ expenses }) {
  const { fmt } = useCurrency();
  const grouped = groupByCategory(expenses);
  const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <div className="panel">
        <div className="panel-title">Spending by Category</div>
        <p style={{ color:'var(--muted)', fontSize:'.82rem', textAlign:'center', padding:'16px 0' }}>No data yet</p>
      </div>
    );
  }

  const data = {
    labels: entries.map(([cat]) => `${CATEGORY_ICONS[cat] || ''} ${cat}`),
    datasets: [{
      data:            entries.map(([, v]) => v),
      backgroundColor: entries.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
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
          label: (ctx) => ` ${fmt(ctx.raw)}`,
        },
      },
    },
  };

  return (
    <div className="panel">
      <div className="panel-title">Spending by Category</div>
      <Doughnut data={data} options={options} />
    </div>
  );
}
