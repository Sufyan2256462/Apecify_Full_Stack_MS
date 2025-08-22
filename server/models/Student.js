const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  institute: { type: String, required: true },
  course: { type: String, required: true },
  class: { type: String, required: true },
  regNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  fatherName: { type: String },
  dob: { type: String },
  gender: { type: String },
  regDate: { type: String },
  cnic: { type: String },
  mobile1: { type: String },
  mobile2: { type: String },
  email: { type: String },
  presentAddress: { type: String },
  permanentAddress: { type: String },
  password: { type: String },
  registrationStatus: { type: String, enum: ['Registered', 'Unregistered', 'Deactivated'], default: 'Registered' },
  photo: { type: String },
  totalFee: { type: Number, default: 0 },
  remainingFee: { type: Number, default: 0 },
});

module.exports = mongoose.model('Student', StudentSchema); 