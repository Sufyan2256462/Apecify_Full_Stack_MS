const mongoose = require('mongoose');

const teacherClassSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
    ref: 'Teacher'
  },
  teacherName: {
    type: String,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  className: {
    type: String,
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  schoolYear: {
    type: String,
    required: true
  },
  studentCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
teacherClassSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TeacherClass', teacherClassSchema); 