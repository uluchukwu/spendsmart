const mongoose = require('mongoose');

const CATEGORIES = [
  'food', 'transport', 'housing', 'entertainment',
  'healthcare', 'shopping', 'education',
  'salary', 'freelance', 'investment', 'other',
];

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true,
  },
  type: {
    type: String, enum: ['income', 'expense'], required: [true, 'Transaction type is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    set: (v) => Math.round(v * 100) / 100, // Store to 2 decimal places
  },
  category: {
    type: String,
    enum: { values: CATEGORIES, message: 'Invalid category: {VALUE}' },
    required: [true, 'Category is required'],
  },
  description: {
    type: String, trim: true, maxlength: [200, 'Description cannot exceed 200 characters'], default: '',
  },
  date: {
    type: Date, required: [true, 'Date is required'], default: Date.now,
  },
  createdAt: { type: Date, default: Date.now },
});

// Index for efficient user-based queries sorted by date
TransactionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
module.exports.CATEGORIES = CATEGORIES;
