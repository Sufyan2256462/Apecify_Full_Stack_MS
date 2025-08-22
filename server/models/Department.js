const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  department: { type: String, required: true },
  personInCharge: { type: String, required: true },
});

module.exports = mongoose.model('Department', DepartmentSchema); 