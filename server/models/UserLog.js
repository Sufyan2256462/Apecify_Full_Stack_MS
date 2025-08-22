const mongoose = require('mongoose');

const userLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userType',
    required: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['Student', 'Teacher', 'AdminUser']
  },
  username: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED']
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'BLOCKED'],
    default: 'SUCCESS'
  },
  details: {
    type: String
  },
  sessionId: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
userLogSchema.index({ userId: 1, timestamp: -1 });
userLogSchema.index({ action: 1, timestamp: -1 });
userLogSchema.index({ userType: 1, timestamp: -1 });

module.exports = mongoose.model('UserLog', userLogSchema); 