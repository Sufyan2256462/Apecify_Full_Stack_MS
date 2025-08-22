const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');
const { logUserActivity } = require('../utils/logger');

// Teacher Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Find teacher by username
    const teacher = await Teacher.findOne({ username });
    
    if (!teacher) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Check if teacher is active
    if (!teacher.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact admin.' 
      });
    }

    // Verify password
    const isPasswordValid = await teacher.comparePassword(password);
    if (!isPasswordValid) {
      // Log failed login attempt
      await logUserActivity(
        teacher._id,
        'Teacher',
        teacher.username,
        'LOGIN_FAILED',
        req,
        'Invalid password provided'
      );
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Update last login
    teacher.lastLogin = new Date();
    await teacher.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        teacherId: teacher._id, 
        username: teacher.username,
        isAdmin: teacher.isAdmin 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Log successful login
    await logUserActivity(
      teacher._id,
      'Teacher',
      teacher.username,
      'LOGIN',
      req,
      'Teacher logged in successfully'
    );

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      teacher: teacher.toPublicJSON()
    });

  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get teacher profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const teacher = await Teacher.findById(decoded.teacherId);
    
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    res.json({
      success: true,
      teacher: teacher.toPublicJSON()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

// Admin: Create new teacher account
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, phone, department, isAdmin = false } = req.body;

    // Check if username already exists
    const existingTeacher = await Teacher.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingTeacher) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }

    // Create new teacher
    const teacher = new Teacher({
      username,
      password,
      name,
      email,
      phone,
      department,
      isAdmin
    });

    await teacher.save();

    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully',
      teacher: teacher.toPublicJSON()
    });

  } catch (error) {
    console.error('Teacher registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Admin: Get all teachers
router.get('/all', async (req, res) => {
  try {
    const teachers = await Teacher.find({}).select('-password');
    res.json({
      success: true,
      teachers
    });
  } catch (error) {
    console.error('Get all teachers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Admin: Update teacher status
router.patch('/:teacherId/status', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { isActive } = req.body;

    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    res.json({
      success: true,
      message: 'Teacher status updated successfully',
      teacher
    });

  } catch (error) {
    console.error('Update teacher status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router; 