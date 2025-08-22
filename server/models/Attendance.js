const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  teacherClassId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TeacherClass', 
    required: true, 
    index: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late'], 
    required: true 
  },
  markedBy: { 
    type: String, 
    required: true 
  },
  remarks: { 
    type: String, 
    default: '' 
  },
  markedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Compound index for efficient queries
attendanceSchema.index({ studentId: 1, teacherClassId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);