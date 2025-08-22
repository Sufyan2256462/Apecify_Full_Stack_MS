const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const NotificationService = require('../services/notificationService');

// Get all teachers and students for dropdown
router.get('/recipients', async (req, res) => {
  try {
    const teachers = await Teacher.find({}, 'name username');
    const students = await Student.find({}, 'name regNo');
    
    res.json({
      teachers: teachers.map(t => ({ id: t._id, name: t.name, type: 'Teacher' })),
      students: students.map(s => ({ id: s._id, name: s.name, regNo: s.regNo, type: 'Student' }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post('/send', async (req, res) => {
  try {
    const { senderId, senderModel, senderName, recipientId, recipientModel, recipientName, subject, message } = req.body;
    
    const newMessage = new Message({
      senderId,
      senderModel,
      senderName,
      recipientId,
      recipientModel,
      recipientName,
      subject,
      message
    });
    
    await newMessage.save();
    // Create notification for recipient
    await NotificationService.createMessageNotification(
      senderId,
      senderModel.toLowerCase(),
      senderName,
      recipientId,
      recipientModel.toLowerCase(),
      message
    );
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get sent messages for a user
router.get('/sent/:userId/:userType', async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const messages = await Message.find({ 
      senderId: userId, 
      senderModel: userType === 'teacher' ? 'Teacher' : 'Student' 
    }).sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get received messages for a user
router.get('/received/:userId/:userType', async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const messages = await Message.find({ 
      recipientId: userId, 
      recipientModel: userType === 'teacher' ? 'Teacher' : 'Student' 
    }).sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark message as read
router.put('/read/:messageId', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { isRead: true },
      { new: true }
    );
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a message
router.delete('/:messageId', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 