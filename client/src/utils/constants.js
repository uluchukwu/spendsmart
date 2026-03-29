export const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Bills', 'Education', 'Others',
];

export const CATEGORY_ICONS = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎮',
  Health: '💊', Bills: '📄', Education: '📚', Others: '📦',
};

export const CHART_COLORS = [
  '#6c63ff', '#ff6584', '#43e97b', '#f9ca24',
  '#fd79a8', '#00cec9', '#e17055', '#a29bfe',
];

export const CURRENCIES = [
  { code: 'GBP', symbol: '£',  name: 'British Pound'  },
  { code: 'USD', symbol: '$',  name: 'US Dollar'       },
  { code: 'EUR', symbol: '€',  name: 'Euro'            },
  { code: 'NGN', symbol: '₦',  name: 'Nigerian Naira'  },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar'},
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen'    },
  { code: 'GHS', symbol: '₵',  name: 'Ghanaian Cedi'   },
];

export const PERIODS = ['today', 'week', 'month', 'all'];

export const SORT_OPTIONS = [
  { value: 'date-desc',   label: 'Newest first'   },
  { value: 'date-asc',    label: 'Oldest first'   },
  { value: 'amount-desc', label: 'Highest amount' },
  { value: 'amount-asc',  label: 'Lowest amount'  },
];

export const ALL_TIPS = [
  { icon: '💡', text: 'Track every purchase — even small ones add up fast.' },
  { icon: '🎯', text: 'Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.' },
  { icon: '🛒', text: 'Write a shopping list and stick to it — avoid impulse buys.' },
  { icon: '☕', text: 'Making coffee at home saves £60–£100 a month.' },
  { icon: '📅', text: 'Review your subscriptions monthly — cancel what you don\'t use.' },
  { icon: '🏦', text: 'Pay yourself first: automate savings before spending.' },
  { icon: '🍱', text: 'Meal prepping reduces food costs by up to 40%.' },
  { icon: '🔌', text: 'Unplug devices when not in use to cut energy bills.' },
  { icon: '🛍️', text: 'Wait 48 hours before buying non-essential items.' },
  { icon: '📊', text: 'Set category budgets and check progress weekly.' },
];
