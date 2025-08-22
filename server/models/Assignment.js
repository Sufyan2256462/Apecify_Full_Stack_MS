const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  teacherClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherClass',
    required: true
  },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  uploadedBy: { type: String },
  dateUpload: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Assignment', AssignmentSchema); 