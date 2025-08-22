const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema); 