const mongoose = require('mongoose');

const ClassEventSchema = new mongoose.Schema({
  teacherClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherClass',
    required: true
  },
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date },
  description: { type: String },
  color: { type: String, default: '#1976d2' },
  createdBy: { type: String },
  eventType: { 
    type: String, 
    enum: ['event', 'timetable', 'datesheet', 'exam', 'assignment', 'holiday'],
    default: 'event'
  },
  // For timetables and datesheets
  fileUrl: { type: String },
  fileName: { type: String },
  // For recurring events
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: { type: String }, // daily, weekly, monthly
  // For exam/assignment specific fields
  duration: { type: Number }, // in minutes
  totalMarks: { type: Number },
  instructions: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ClassEvent', ClassEventSchema); 