const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const TeacherClass = require('../models/TeacherClass');
const TeacherClassStudent = require('../models/TeacherClassStudent');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Course = require('../models/Course');
const DownloadableMaterial = require('../models/DownloadableMaterial');
const Assignment = require('../models/Assignment');
const Announcement = require('../models/Announcement');
const ClassEvent = require('../models/ClassEvent');
const Quiz = require('../models/Quiz');
const SubjectOverview = require('../models/SubjectOverview'); // Added import for SubjectOverview
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Student login route
router.post('/login', async (req, res) => {
  try {
    const { regNo, password } = req.body;
    console.log('Student login attempt for regNo:', regNo);

    if (!regNo || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration number and password are required' 
      });
    }

    // Find student by registration number
    const student = await Student.findOne({ regNo: regNo });
    
    if (!student) {
      console.log('Student not found for regNo:', regNo);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid registration number or password' 
      });
    }

    // Check if student is active (not deactivated)
    if (student.registrationStatus === 'Deactivated') {
      console.log('Student is deactivated:', regNo);
      return res.status(401).json({ 
        success: false, 
        message: 'Your account has been deactivated. Please contact administrator.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    
    if (!isPasswordValid) {
      console.log('Invalid password for student:', regNo);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid registration number or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        studentId: student._id, 
        regNo: student.regNo,
        name: student.name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Student login successful:', student.name, 'RegNo:', student.regNo);

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      student: {
        _id: student._id,
        name: student.name,
        regNo: student.regNo,
        class: student.class,
        course: student.course,
        institute: student.institute
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

// Get detailed class information for student dashboard
router.get('/class-details/:teacherClassId', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    console.log('Getting class details for teacherClassId:', teacherClassId);

    if (!teacherClassId) {
      return res.status(400).json({ message: 'Teacher Class ID is required' });
    }

    // Find the teacher class
    const teacherClass = await TeacherClass.findById(teacherClassId)
      .populate('classId')
      .populate('subjectId');

    if (!teacherClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Get all students enrolled in this class
    const enrolledStudents = await TeacherClassStudent.find({ teacherClassId })
      .populate('studentId');

    // Get downloadable materials for this class
    const materials = await DownloadableMaterial.find({ teacherClassId })
      .sort({ createdAt: -1 });
    
    console.log('Found materials for class:', materials.length);
    console.log('Materials:', materials.map(m => ({ id: m._id, title: m.title, fileName: m.fileName })));

    // Get assignments for this class
    const assignments = await Assignment.find({ teacherClassId })
      .sort({ dueDate: 1 });

    // Get announcements for this class
    const announcements = await Announcement.find({ teacherClassId })
      .sort({ createdAt: -1 });

    // Get class events
    const events = await ClassEvent.find({ teacherClassId })
      .sort({ start: 1 });

    // Get quizzes for this class
    const quizzes = await Quiz.find({ teacherClassId })
      .sort({ createdAt: -1 });

    // Get subject overview for this class
    const subjectOverview = await SubjectOverview.findOne({ teacherClassId });

    // Format the response
    const classDetails = {
      teacherClassId: teacherClass._id,
      className: teacherClass.className,
      subjectName: teacherClass.subjectName,
      subjectCode: teacherClass.subjectId?.code || '',
      teacherName: teacherClass.teacherName || 'Teacher',
      teacherId: teacherClass.teacherId,
      subjectOverview: subjectOverview ? {
        content: subjectOverview.content,
        updatedAt: subjectOverview.updatedAt
      } : null,
      classmates: enrolledStudents.map(enrollment => ({
        name: enrollment.studentId?.name || 'Unknown',
        regNo: enrollment.studentId?.regNo || 'N/A'
      })),
      materials: materials.map(material => ({
        _id: material._id,
        title: material.title || material.fileName,
        description: material.description,
        fileName: material.fileName,
        originalName: material.originalName,
        uploadedAt: material.uploadedAt || material.dateUpload,
        className: teacherClass.className,
        subjectName: teacherClass.subjectName
      })),
      assignments: assignments.map(assignment => ({
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        fileName: assignment.fileName,
        originalName: assignment.originalName,
        status: 'Pending' // This would be calculated based on student submissions
      })),
      quizzes: quizzes.map(quiz => ({
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
        timeMinutes: quiz.timeMinutes,
        date: quiz.date
      })),
      announcements: announcements.map(announcement => ({
        title: announcement.title,
        content: announcement.content,
        postedAt: announcement.postedAt
      })),
      events: events.map(event => ({
        _id: event._id,
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        color: event.color,
        eventType: event.eventType,
        duration: event.duration,
        totalMarks: event.totalMarks,
        instructions: event.instructions,
        fileUrl: event.fileUrl,
        fileName: event.fileName,
        isRecurring: event.isRecurring,
        recurrencePattern: event.recurrencePattern,
        createdBy: event.createdBy,
        createdAt: event.createdAt
      }))
    };

    console.log('Class details prepared:', {
      className: classDetails.className,
      subjectName: classDetails.subjectName,
      classmatesCount: classDetails.classmates.length,
      materialsCount: classDetails.materials.length,
      assignmentsCount: classDetails.assignments.length,
      announcementsCount: classDetails.announcements.length,
      eventsCount: classDetails.events.length,
      quizzesCount: classDetails.quizzes.length
    });

    res.json(classDetails);

  } catch (error) {
    console.error('Error fetching class details:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all classes where a specific student has been added by teachers
router.get('/student-classes', async (req, res) => {
  try {
    const { studentId } = req.query;
    console.log('Getting classes for studentId:', studentId);

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Find the student first
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('Found student:', student.name, 'Class:', student.class, 'Course:', student.course, 'Institute:', student.institute);

    // Find all teacher classes where this student has been specifically added
    const studentEnrollments = await TeacherClassStudent.find({ studentId })
      .populate({
        path: 'teacherClassId',
        populate: [
          { path: 'classId', model: 'Class' },
          { path: 'subjectId', model: 'Course' }
        ]
      });

    console.log('Student enrollments found:', studentEnrollments.length);

    // Also find classes that match the student's registration data
    const matchingClasses = await TeacherClass.find({
      $or: [
        { className: student.class },
        { subjectName: student.course },
        { institute: student.institute }
      ]
    }).populate([
      { path: 'classId', model: 'Class' },
      { path: 'subjectId', model: 'Course' }
    ]);

    console.log('Matching classes found:', matchingClasses.length);

    // Combine both sets of classes
    const allClasses = new Map();

    // Add enrolled classes
    studentEnrollments.forEach(enrollment => {
      const teacherClass = enrollment.teacherClassId;
      if (teacherClass) {
        allClasses.set(teacherClass._id.toString(), {
          teacherClassId: teacherClass._id,
          className: teacherClass.className,
          subjectName: teacherClass.subjectName,
          subjectCode: teacherClass.subjectId?.code || '',
          teacherName: teacherClass.teacherName || 'Teacher',
          teacherId: teacherClass.teacherId,
          enrollmentDate: enrollment.createdAt,
          classId: teacherClass.classId?._id,
          subjectId: teacherClass.subjectId?._id,
          enrollmentType: 'enrolled'
        });
      }
    });

    // Add matching classes (if not already enrolled)
    matchingClasses.forEach(teacherClass => {
      const classId = teacherClass._id.toString();
      if (!allClasses.has(classId)) {
        allClasses.set(classId, {
          teacherClassId: teacherClass._id,
          className: teacherClass.className,
          subjectName: teacherClass.subjectName,
          subjectCode: teacherClass.subjectId?.code || '',
          teacherName: teacherClass.teacherName || 'Teacher',
          teacherId: teacherClass.teacherId,
          enrollmentDate: null,
          classId: teacherClass.classId?._id,
          subjectId: teacherClass.subjectId?._id,
          enrollmentType: 'matching'
        });
      }
    });

    const formattedClasses = Array.from(allClasses.values());

    console.log('Total classes for student:', formattedClasses.length);
    console.log('Formatted classes:', formattedClasses);
    res.json(formattedClasses);

  } catch (error) {
    console.error('Error fetching student classes:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get student details
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: error.message });
  }
});

// Download assignment for students
router.get('/assignments/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Student download request for assignment ID:', id);
    
    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      console.log('Assignment not found in database');
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    console.log('Assignment found:', {
      fileName: assignment.fileName,
      originalName: assignment.originalName
    });
    
    const filePath = path.join(__dirname, '..', 'uploads/teacher-assignments', assignment.fileName);
    console.log('Looking for file at:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File not found at path:', filePath);
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    console.log('File found, starting download...');
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${assignment.originalName || assignment.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading assignment:', error);
    res.status(500).json({ message: 'Failed to download assignment' });
  }
});

module.exports = router; 