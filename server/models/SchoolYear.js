const mongoose = require('mongoose');

const SchoolYearSchema = new mongoose.Schema({
  year: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('SchoolYear', SchoolYearSchema); 