const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  studentCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Class', ClassSchema); 