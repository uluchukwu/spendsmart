export const CATEGORIES = [
  'food', 'transport', 'housing', 'entertainment',
  'healthcare', 'shopping', 'education',
  'salary', 'freelance', 'investment', 'other',
];

export const CATEGORY_LABELS = {
  food:          'Food',
  transport:     'Transport',
  housing:       'Housing',
  entertainment: 'Entertainment',
  healthcare:    'Healthcare',
  shopping:      'Shopping',
  education:     'Education',
  salary:        'Salary',
  freelance:     'Freelance',
  investment:    'Investment',
  other:         'Other',
};

export const CATEGORY_ICONS = {
  food:          '🍔',
  transport:     '🚗',
  housing:       '🏠',
  entertainment: '🎮',
  healthcare:    '💊',
  shopping:      '🛍️',
  education:     '📚',
  salary:        '💼',
  freelance:     '💻',
  investment:    '📈',
  other:         '📦',
};

export const INCOME_CATEGORIES  = ['salary', 'freelance', 'investment', 'other'];
export const EXPENSE_CATEGORIES = ['food', 'transport', 'housing', 'entertainment', 'healthcare', 'shopping', 'education', 'other'];

export const SORT_OPTIONS = [
  { value: '-date',   label: 'Newest first'   },
  { value: 'date',    label: 'Oldest first'   },
  { value: '-amount', label: 'Highest amount' },
  { value: 'amount',  label: 'Lowest amount'  },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const CURRENCIES = [
  { code: 'GBP', symbol: '£',  name: 'British Pound'     },
  { code: 'USD', symbol: '$',  name: 'US Dollar'         },
  { code: 'EUR', symbol: '€',  name: 'Euro'              },
  { code: 'NGN', symbol: '₦',  name: 'Nigerian Naira'    },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar'   },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen'      },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee'      },
  { code: 'ZAR', symbol: 'R',  name: 'South African Rand' },
];

export const ALL_TIPS = [
  { icon: '🛍️', text: 'Track itemised purchases to see exactly where money goes within each shop.' },
  { icon: '💰', text: 'Pay yourself first — automate a savings transfer on payday before you spend.' },
  { icon: '🔁', text: 'Review your subscriptions every month. Cancel any unused in 30 days.' },
  { icon: '📊', text: 'Track your net worth monthly, not just your spending.' },
  { icon: '🎯', text: 'Set a realistic budget before the month starts, not after.' },
  { icon: '☕', text: 'Small daily costs add up fast. A £5 coffee habit costs £150 a month.' },
  { icon: '🏦', text: 'Aim to keep 3–6 months of expenses in an emergency fund.' },
  { icon: '📱', text: 'Delete shopping apps to drastically reduce impulse purchases.' },
  { icon: '🍳', text: 'Meal prepping even 3 days a week can save £150–£300 per month.' },
  { icon: '💳', text: 'Pay off your highest-interest debt first — the avalanche method saves the most.' },
  { icon: '📈', text: 'Investing even £25/month consistently beats saving at low interest rates.' },
  { icon: '🎁', text: 'Plan gifts and seasonal spending in advance to avoid financial surprises.' },
];
