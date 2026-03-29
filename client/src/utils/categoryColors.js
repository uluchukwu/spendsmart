export const CATEGORY_COLORS = {
  food:          '#f9ca24',
  transport:     '#6c63ff',
  housing:       '#a29bfe',
  entertainment: '#fd79a8',
  healthcare:    '#00cec9',
  shopping:      '#e17055',
  education:     '#74b9ff',
  salary:        '#43e97b',
  freelance:     '#38f9d7',
  investment:    '#4834d4',
  other:         '#8b90b8',
};

export const CATEGORY_COLORS_ARRAY = [
  '#f9ca24', '#6c63ff', '#a29bfe', '#fd79a8',
  '#00cec9', '#e17055', '#74b9ff', '#43e97b',
  '#38f9d7', '#4834d4', '#8b90b8',
];

/**
 * Returns the chart.js color config for a set of category labels.
 */
export function getCategoryChartColors(labels) {
  return labels.map(label => CATEGORY_COLORS[label] || '#8b90b8');
}
