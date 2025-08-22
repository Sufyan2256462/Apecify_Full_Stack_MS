const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: String,
    required: true,
    index: true
  },
  recipientType: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderType: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'assignment', 'announcement', 'quiz', 'material', 'event'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: String,
    // ID of the related item (message, assignment, etc.)
  },
  relatedType: {
    type: String,
    // Type of related item
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDeleted: {
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

// Index for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isDeleted: 1 });

module.exports = mongoose.model('Notification', notificationSchema); 