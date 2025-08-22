const mongoose = require('mongoose');

const SubjectOverviewSchema = new mongoose.Schema({
  teacherClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherClass',
    required: true,
    unique: true
  },
  content: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

SubjectOverviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SubjectOverview', SubjectOverviewSchema); 