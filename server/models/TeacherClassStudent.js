const mongoose = require('mongoose');

const TeacherClassStudentSchema = new mongoose.Schema({
  teacherClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherClass',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TeacherClassStudent', TeacherClassStudentSchema); 