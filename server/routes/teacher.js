const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const { logActivity } = require('../utils/logger');

// Multer setup for photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/teachers'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Add teacher
router.post('/', async (req, res) => {
  try {
    const { department, name, username, password, email, phone, isActive } = req.body;
    const teacher = new Teacher({ 
      department, 
      name, 
      username, 
      password, 
      email, 
      phone, 
      isActive: isActive === 'true' || isActive === true 
    });
    await teacher.save();
    
    // Log the activity
    await logActivity(
      req.user?._id || new mongoose.Types.ObjectId(),
      req.user?.userType || 'AdminUser',
      req.user?.username || 'admin',
      'Created new teacher',
      'TEACHERS',
      'CREATE',
      req,
      `Added teacher: ${name}`,
      null,
      teacher,
      teacher._id,
      'Teacher'
    );
    
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get teacher by ID
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update teacher
router.put('/:id', async (req, res) => {
  try {
    const oldTeacher = await Teacher.findById(req.params.id);
    const { department, name, username, password, email, phone, isActive } = req.body;
    const updateData = { 
      department, 
      name, 
      username, 
      email, 
      phone, 
      isActive: isActive === 'true' || isActive === true 
    };
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = password;
    }
    
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Log the activity
    await logActivity(
      req.user?._id || new mongoose.Types.ObjectId(),
      req.user?.userType || 'AdminUser',
      req.user?.username || 'admin',
      'Updated teacher',
      'TEACHERS',
      'UPDATE',
      req,
      `Updated teacher: ${name}`,
      oldTeacher,
      teacher,
      teacher._id,
      'Teacher'
    );
    
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete teacher
router.delete('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Log the activity
    await logActivity(
      req.user?._id || new mongoose.Types.ObjectId(),
      req.user?.userType || 'AdminUser',
      req.user?.username || 'admin',
      'Deleted teacher',
      'TEACHERS',
      'DELETE',
      req,
      `Deleted teacher: ${teacher.name}`,
      teacher,
      null,
      teacher._id,
      'Teacher'
    );
    
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle teacher status (activate/deactivate)
router.patch('/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 