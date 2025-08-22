const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  regNo: { type: String, required: true },
  registrationFee: { type: Number, default: 0 },
  totalFee: { type: Number, required: true },
  totalPaid: { type: Number, default: 0 },
  remainingFee: { type: Number, default: 0 },
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  date: { type: String },
  feeType: { type: String },
  voucherNo: { type: String },
  feeMonth: { type: String },
  voucherAmount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Fee', FeeSchema); 