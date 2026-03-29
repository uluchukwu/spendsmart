const mongoose = require('mongoose');

const PurchasedItemSchema = new mongoose.Schema({
  name:  { type: String, default: '' },
  qty:   { type: Number, default: 1, min: 0 },
  price: { type: Number, default: 0, min: 0 },
}, { _id: false });

const ExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true,
  },
  item: {
    type: String, required: [true, 'Description is required'], trim: true, maxlength: 200,
  },
  amount: {
    type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be > 0'],
  },
  category: {
    type: String, required: true,
    enum: ['Food','Transport','Shopping','Entertainment','Health','Bills','Education','Others'],
  },
  date: {
    type: String, required: true,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'],
  },
  notes: { type: String, default: '', maxlength: 500 },
  items: { type: [PurchasedItemSchema], default: [] },
  ts:    { type: Number, default: () => Date.now() },
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
