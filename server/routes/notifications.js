const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get notifications for a user (student or teacher)
router.get('/', async (req, res) => {
  try {
    const { recipientId, recipientType, page = 1, limit = 20, unreadOnly = false } = req.query;
    
    if (!recipientId || !recipientType) {
      return res.status(400).json({ message: 'recipientId and recipientType are required' });
    }

    let query = {
      recipientId,
      recipientType,
      isDeleted: false
    };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipientId,
      recipientType,
      isRead: false,
      isDeleted: false
    });

    res.json({
      notifications,
      total,
      unreadCount,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientId, recipientType } = req.body;

    if (!recipientId || !recipientType) {
      return res.status(400).json({ message: 'recipientId and recipientType are required' });
    }

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: id, 
        recipientId, 
        recipientType,
        isDeleted: false 
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    const { recipientId, recipientType } = req.body;

    if (!recipientId || !recipientType) {
      return res.status(400).json({ message: 'recipientId and recipientType are required' });
    }

    const result = await Notification.updateMany(
      { 
        recipientId, 
        recipientType,
        isRead: false,
        isDeleted: false 
      },
      { isRead: true }
    );

    res.json({ 
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientId, recipientType } = req.body;

    if (!recipientId || !recipientType) {
      return res.status(400).json({ message: 'recipientId and recipientType are required' });
    }

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: id, 
        recipientId, 
        recipientType 
      },
      { isDeleted: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete all notifications for a user
router.delete('/delete-all', async (req, res) => {
  try {
    const { recipientId, recipientType } = req.body;

    if (!recipientId || !recipientType) {
      return res.status(400).json({ message: 'recipientId and recipientType are required' });
    }

    const result = await Notification.updateMany(
      { recipientId, recipientType },
      { isDeleted: true }
    );

    res.json({ 
      message: 'All notifications deleted successfully',
      deletedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new notification (internal use)
router.post('/', async (req, res) => {
  try {
    const {
      recipientId,
      recipientType,
      senderId,
      senderType,
      senderName,
      type,
      title,
      message,
      relatedId,
      relatedType,
      metadata
    } = req.body;

    const notification = new Notification({
      recipientId,
      recipientType,
      senderId,
      senderType,
      senderName,
      type,
      title,
      message,
      relatedId,
      relatedType,
      metadata
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get notification count for unread notifications
router.get('/count', async (req, res) => {
  try {
    const { recipientId, recipientType } = req.query;
    
    if (!recipientId || !recipientType) {
      return res.status(400).json({ message: 'recipientId and recipientType are required' });
    }

    const unreadCount = await Notification.countDocuments({
      recipientId,
      recipientType,
      isRead: false,
      isDeleted: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting notification count:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 