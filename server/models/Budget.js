const mongoose = require('mongoose');

// Must match the EXPENSE_CATEGORIES in Transaction model
const BUDGET_CATEGORIES = [
  'food', 'transport', 'housing', 'entertainment',
  'healthcare', 'shopping', 'education', 'other',
];

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true,
  },
  category: {
    type: String, required: true,
    enum: { values: BUDGET_CATEGORIES, message: 'Invalid budget category: {VALUE}' },
  },
  monthlyLimit: {
    type: Number, required: true, min: [0.01, 'Budget limit must be greater than 0'],
  },
}, { timestamps: true });

BudgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
