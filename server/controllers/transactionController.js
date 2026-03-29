const mongoose    = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const Transaction = require('../models/Transaction');

// ── Helpers ────────────────────────────────────────────────

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function buildFilter(userId, query) {
  const { type, category, startDate, endDate, search } = query;
  const filter = { user: userId };
  if (type)     filter.type     = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate)   filter.date.$lte = new Date(endDate);
  }
  if (search) filter.description = { $regex: search.trim(), $options: 'i' };
  return filter;
}

// ── Controllers ────────────────────────────────────────────

// GET /api/transactions
const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sort = '-date' } = req.query;
  const filter   = buildFilter(req.user._id, req.query);
  const pageNum  = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip     = (pageNum - 1) * limitNum;
  const sortMap  = { date: 'date', '-date': '-date', amount: 'amount', '-amount': '-amount' };
  const sortStr  = sortMap[sort] || '-date';

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort(sortStr).skip(skip).limit(limitNum),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data:    transactions,
    total,
    page:    pageNum,
    pages:   Math.ceil(total / limitNum),
  });
});

// POST /api/transactions
const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, category, description, date } = req.body;
  const transaction = await Transaction.create({
    user: req.user._id, type, amount, category,
    description: description || '',
    date: new Date(date),
  });
  res.status(201).json({ success: true, data: transaction });
});

// GET /api/transactions/summary  (optional ?startDate=&endDate= for period filtering)
const getSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const matchFilter = { user: req.user._id };
  if (startDate || endDate) {
    matchFilter.date = {};
    if (startDate) matchFilter.date.$gte = new Date(startDate);
    if (endDate)   matchFilter.date.$lte = new Date(endDate);
  }
  const result = await Transaction.aggregate([
    { $match: matchFilter },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);

  const summary = { totalIncome: 0, totalExpenses: 0, balance: 0 };
  result.forEach(r => {
    if (r._id === 'income')  summary.totalIncome   = r.total;
    if (r._id === 'expense') summary.totalExpenses = r.total;
  });
  summary.balance = Math.round((summary.totalIncome - summary.totalExpenses) * 100) / 100;

  res.json({ success: true, data: summary });
});

// GET /api/transactions/:id
const getTransaction = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400); throw new Error('Invalid transaction ID');
  }
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!transaction) { res.status(404); throw new Error('Transaction not found'); }
  res.json({ success: true, data: transaction });
});

// PUT /api/transactions/:id
const updateTransaction = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400); throw new Error('Invalid transaction ID');
  }
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!transaction) { res.status(404); throw new Error('Transaction not found'); }

  const { type, amount, category, description, date } = req.body;
  Object.assign(transaction, {
    type, amount, category,
    description: description || '',
    date: new Date(date),
  });
  await transaction.save();
  res.json({ success: true, data: transaction });
});

// DELETE /api/transactions/:id
const deleteTransaction = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400); throw new Error('Invalid transaction ID');
  }
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!transaction) { res.status(404); throw new Error('Transaction not found'); }
  res.json({ success: true, data: {} });
});

// GET /api/transactions/monthly — spending grouped by year-month
const getMonthlyHistory = asyncHandler(async (req, res) => {
  const result = await Transaction.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id:   { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
  ]);

  // Pivot into { month:'YYYY-MM', income, expenses, balance, count }
  const map = {};
  result.forEach(r => {
    const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`;
    if (!map[key]) map[key] = { month: key, income: 0, expenses: 0, count: 0 };
    if (r._id.type === 'income')  { map[key].income   = r.total; map[key].count += r.count; }
    if (r._id.type === 'expense') { map[key].expenses = r.total; map[key].count += r.count; }
  });

  const months = Object.values(map)
    .map(m => ({ ...m, balance: Math.round((m.income - m.expenses) * 100) / 100 }))
    .sort((a, b) => b.month.localeCompare(a.month));

  res.json({ success: true, data: months });
});

module.exports = {
  getTransactions, createTransaction, getSummary,
  getTransaction, updateTransaction, deleteTransaction,
  getMonthlyHistory,
};
