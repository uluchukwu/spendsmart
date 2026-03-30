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
  // ── Major / Global ──────────────────────────────────────
  { code: 'GBP', symbol: '£',   name: 'British Pound',        flag: '🇬🇧' },
  { code: 'USD', symbol: '$',   name: 'US Dollar',            flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',   name: 'Euro',                 flag: '🇪🇺' },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen',         flag: '🇯🇵' },
  { code: 'CHF', symbol: 'Fr',  name: 'Swiss Franc',          flag: '🇨🇭' },
  { code: 'CNY', symbol: '¥',   name: 'Chinese Yuan',         flag: '🇨🇳' },
  // ── Americas ────────────────────────────────────────────
  { code: 'CAD', symbol: 'C$',  name: 'Canadian Dollar',      flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',    flag: '🇦🇺' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar',   flag: '🇳🇿' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso',         flag: '🇲🇽' },
  { code: 'BRL', symbol: 'R$',  name: 'Brazilian Real',       flag: '🇧🇷' },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso',       flag: '🇦🇷' },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso',         flag: '🇨🇱' },
  { code: 'COP', symbol: 'CO$', name: 'Colombian Peso',       flag: '🇨🇴' },
  // ── Europe ──────────────────────────────────────────────
  { code: 'SEK', symbol: 'kr',  name: 'Swedish Krona',        flag: '🇸🇪' },
  { code: 'NOK', symbol: 'kr',  name: 'Norwegian Krone',      flag: '🇳🇴' },
  { code: 'DKK', symbol: 'kr',  name: 'Danish Krone',         flag: '🇩🇰' },
  { code: 'PLN', symbol: 'zł',  name: 'Polish Złoty',         flag: '🇵🇱' },
  { code: 'CZK', symbol: 'Kč',  name: 'Czech Koruna',         flag: '🇨🇿' },
  { code: 'HUF', symbol: 'Ft',  name: 'Hungarian Forint',     flag: '🇭🇺' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu',         flag: '🇷🇴' },
  { code: 'TRY', symbol: '₺',   name: 'Turkish Lira',         flag: '🇹🇷' },
  // ── Middle East ─────────────────────────────────────────
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',           flag: '🇦🇪' },
  { code: 'SAR', symbol: '﷼',   name: 'Saudi Riyal',          flag: '🇸🇦' },
  { code: 'QAR', symbol: '﷼',   name: 'Qatari Riyal',         flag: '🇶🇦' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar',        flag: '🇰🇼' },
  { code: 'ILS', symbol: '₪',   name: 'Israeli Shekel',       flag: '🇮🇱' },
  // ── Africa ──────────────────────────────────────────────
  { code: 'NGN', symbol: '₦',   name: 'Nigerian Naira',       flag: '🇳🇬' },
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand',   flag: '🇿🇦' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling',      flag: '🇰🇪' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi',        flag: '🇬🇭' },
  { code: 'EGP', symbol: 'E£',  name: 'Egyptian Pound',       flag: '🇪🇬' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham',      flag: '🇲🇦' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling',   flag: '🇹🇿' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling',     flag: '🇺🇬' },
  { code: 'ETB', symbol: 'Br',  name: 'Ethiopian Birr',       flag: '🇪🇹' },
  // ── Asia-Pacific ────────────────────────────────────────
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee',         flag: '🇮🇳' },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar',     flag: '🇸🇬' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar',     flag: '🇭🇰' },
  { code: 'MYR', symbol: 'RM',  name: 'Malaysian Ringgit',    flag: '🇲🇾' },
  { code: 'THB', symbol: '฿',   name: 'Thai Baht',            flag: '🇹🇭' },
  { code: 'IDR', symbol: 'Rp',  name: 'Indonesian Rupiah',    flag: '🇮🇩' },
  { code: 'PHP', symbol: '₱',   name: 'Philippine Peso',      flag: '🇵🇭' },
  { code: 'PKR', symbol: '₨',   name: 'Pakistani Rupee',      flag: '🇵🇰' },
  { code: 'BDT', symbol: '৳',   name: 'Bangladeshi Taka',     flag: '🇧🇩' },
  { code: 'VND', symbol: '₫',   name: 'Vietnamese Dong',      flag: '🇻🇳' },
  { code: 'KRW', symbol: '₩',   name: 'South Korean Won',     flag: '🇰🇷' },
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
