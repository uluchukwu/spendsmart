const mongoose = require('mongoose');

const MonthlyCapSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  limit: { type: Number, required: true, min: [0.01, 'Cap must be greater than 0'] },
}, { timestamps: true });

module.exports = mongoose.model('MonthlyCap', MonthlyCapSchema);
