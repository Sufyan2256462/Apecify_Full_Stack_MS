const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userType: String,
  username: String,
  action: String,
  module: String,
  operation: String,
  resourceId: mongoose.Schema.Types.ObjectId,
  resourceType: String,
  oldValues: mongoose.Schema.Types.Mixed,
  newValues: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  status: String,
  details: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema); 