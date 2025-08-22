const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true
  },
  teacherClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherClass',
    required: true,
    index: true
  },
  assessmentType: {
    type: String,
    enum: ['assignment', 'quiz', 'midterm', 'final', 'total'],
    required: true
  },
  assessmentId: {
    type: String,
    // ID of the specific assignment, quiz, etc.
  },
  assessmentTitle: {
    type: String,
    required: true
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100
  },
  obtainedMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  remarks: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedBy: {
    type: String,
    required: true
  },
  gradedAt: {
    type: Date,
    default: Date.now
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Calculate percentage and grade before saving
gradeSchema.pre('save', function(next) {
  if (this.maxMarks > 0) {
    this.percentage = (this.obtainedMarks / this.maxMarks) * 100;
    
    // Calculate grade based on percentage
    if (this.percentage >= 90) {
      this.grade = 'A+';
    } else if (this.percentage >= 80) {
      this.grade = 'A';
    } else if (this.percentage >= 70) {
      this.grade = 'B+';
    } else if (this.percentage >= 60) {
      this.grade = 'B';
    } else if (this.percentage >= 50) {
      this.grade = 'C+';
    } else if (this.percentage >= 40) {
      this.grade = 'C';
    } else if (this.percentage >= 30) {
      this.grade = 'D';
    } else {
      this.grade = 'F';
    }
  }
  next();
});

// Index for efficient queries
gradeSchema.index({ studentId: 1, teacherClassId: 1, assessmentType: 1 });
gradeSchema.index({ teacherClassId: 1, assessmentType: 1 });
gradeSchema.index({ studentId: 1, isPublished: 1 });

module.exports = mongoose.model('Grade', gradeSchema); 