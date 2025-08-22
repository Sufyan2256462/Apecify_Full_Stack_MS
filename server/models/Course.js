const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true }, // For display and filtering
  title: { type: String }, // Optional legacy
  units: { type: Number },
  semester: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Course', CourseSchema); 