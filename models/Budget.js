const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true,
  },
  category: {
    type: String, required: true,
    enum: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Education', 'Others'],
  },
  monthlyLimit: {
    type: Number, required: true, min: [0.01, 'Budget limit must be greater than 0'],
  },
}, { timestamps: true });

// One budget per user per category
BudgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
