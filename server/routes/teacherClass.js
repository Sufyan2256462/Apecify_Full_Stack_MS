const express = require('express');
const router = express.Router();
const TeacherClass = require('../models/TeacherClass');
const Class = require('../models/Class');
const Course = require('../models/Course');
const TeacherClassStudent = require('../models/TeacherClassStudent');
const Student = require('../models/Student');
const SubjectOverview = require('../models/SubjectOverview');
const DownloadableMaterial = require('../models/DownloadableMaterial');
const Assignment = require('../models/Assignment');
const multer = require('multer');
const path = require('path');
const Announcement = require('../models/Announcement');
const ClassEvent = require('../models/ClassEvent');
const Quiz = require('../models/Quiz');
const SharedFile = require('../models/SharedFile');
const Teacher = require('../models/Teacher');
const fs = require('fs'); // Added for file download
const mongoose = require('mongoose'); // Added for ObjectId validation

// MULTER CONFIGURATIONS
const materialsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads/teacher-materials'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const uploadMaterial = multer({ storage: materialsStorage });

const assignmentsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads/teacher-assignments'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const uploadAssignment = multer({ storage: assignmentsStorage });

const sharedFilesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads/teacher-materials'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const uploadSharedFile = multer({ storage: sharedFilesStorage });

// Calendar events storage
const calendarEventsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads/calendar-events'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const uploadCalendarEvent = multer({ storage: calendarEventsStorage });

// SPECIFIC ROUTES (must come before parameterized routes)

// Get all classes with subjects
router.get('/classes', async (req, res) => {
  try {
    const teacherId = req.query.teacherId;
    const classes = await TeacherClass.find({ teacherId })
      .populate('classId')
      .populate('subjectId')
      .sort({ 'className': 1 });

    const formattedClasses = classes.map(tc => ({
      classId: tc.classId?._id,
      className: tc.className,
      subjectId: tc.subjectId?._id,
      subjectName: tc.subjectName,
      subjectCode: tc.subjectId?.code || '',
      teacherClassId: tc._id
    }));

    console.log('Fetched classes:', formattedClasses);
    res.json(formattedClasses);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all downloadable materials
router.get('/downloadables', async (req, res) => {
  try {
    console.log('GET /downloadables route called');
    const { teacherClassId, teacherId, studentId } = req.query;
    let query = {};
    let teacherClasses = null; // Initialize teacherClasses variable
    
    if (teacherClassId) {
      query.teacherClassId = teacherClassId;
      // Get the specific teacher class for this classId
      teacherClasses = await TeacherClass.find({ _id: teacherClassId });
    } else if (teacherId) {
      // For global tab, get all teacher classes for this teacher
      console.log('Finding teacher classes for teacherId:', teacherId);
      teacherClasses = await TeacherClass.find({ teacherId });
      console.log('Found teacher classes:', teacherClasses);
      const teacherClassIds = teacherClasses.map(tc => tc._id);
      console.log('Teacher class IDs:', teacherClassIds);
      
      if (teacherClassIds.length > 0) {
        query.teacherClassId = { $in: teacherClassIds };
      } else {
        console.log('No classes found for teacher, returning empty');
        return res.json([]);
      }
    } else if (studentId) {
      // For student global view, get all classes the student is enrolled in
      console.log('Finding classes for studentId:', studentId);
      
      // First get all student class enrollments
      const TeacherClassStudent = require('../models/TeacherClassStudent');
      const studentEnrollments = await TeacherClassStudent.find({ studentId });
      console.log('Found student enrollments:', studentEnrollments);
      
      if (studentEnrollments.length === 0) {
        console.log('No enrollments found for student, returning empty');
        return res.json([]);
      }
      
      const teacherClassIds = studentEnrollments.map(enrollment => enrollment.teacherClassId);
      console.log('Teacher class IDs for student:', teacherClassIds);
      
      query.teacherClassId = { $in: teacherClassIds };
      teacherClasses = await TeacherClass.find({ _id: { $in: teacherClassIds } });
    }
    
    console.log('Downloadables query:', query);
    
    const downloadables = await DownloadableMaterial.find(query)
      .sort({ dateUpload: -1 });
    
    console.log('Found downloadables:', downloadables.length);
    
    // Add class information to each downloadable
    const downloadablesWithClassInfo = downloadables.map(downloadable => {
      let teacherClass = null;
      if (teacherClasses) {
        teacherClass = teacherClasses.find(tc => tc._id.toString() === downloadable.teacherClassId.toString());
      }
      return {
        ...downloadable.toObject(),
        className: teacherClass ? teacherClass.className : 'Unknown',
        subjectName: teacherClass ? teacherClass.subjectName : 'Unknown'
      };
    });
    
    res.json(downloadablesWithClassInfo);
  } catch (error) {
    console.error('Error fetching downloadables:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all downloadable materials (for admin dashboard)
router.get('/admin/downloadables', async (req, res) => {
  try {
    const downloadables = await DownloadableMaterial.find({})
      .populate('teacherClassId')
      .sort({ dateUpload: -1 });
    
    const downloadablesWithInfo = downloadables.map(downloadable => {
      const teacherClass = downloadable.teacherClassId;
      return {
        ...downloadable.toObject(),
        className: teacherClass ? teacherClass.className : 'Unknown',
        subjectName: teacherClass ? teacherClass.subjectName : 'Unknown',
        teacherId: teacherClass ? teacherClass.teacherId : 'Unknown'
      };
    });
    
    res.json(downloadablesWithInfo);
  } catch (error) {
    console.error('Error fetching all downloadables:', error);
    res.status(500).json({ message: error.message });
  }
});

// Pagination and search for assignments
router.get('/assignments', async (req, res) => {
  try {
    console.log('GET /assignments route called');
    console.log('Query parameters:', req.query);
    const { page = 1, limit = 10, search = '', teacherClassId, teacherId, studentId } = req.query;
    let query = {};
    
    if (search) {
      query.fileName = { $regex: search, $options: 'i' };
    }
    
    if (teacherClassId) {
      query.teacherClassId = teacherClassId;
    } else if (teacherId) {
      // For global tab, get all teacher classes for this teacher
      console.log('Finding teacher classes for teacherId:', teacherId);
      const teacherClasses = await TeacherClass.find({ teacherId });
      console.log('Found teacher classes:', teacherClasses);
      const teacherClassIds = teacherClasses.map(tc => tc._id);
      console.log('Teacher class IDs:', teacherClassIds);
      
      if (teacherClassIds.length > 0) {
        query.teacherClassId = { $in: teacherClassIds };
      } else {
        console.log('No classes found for teacher, returning empty');
        return res.json({ files: [], total: 0 });
      }
    } else if (studentId) {
      // For student global view, get all classes the student is enrolled in
      console.log('Finding classes for studentId:', studentId);
      
      // First get all student class enrollments
      const TeacherClassStudent = require('../models/TeacherClassStudent');
      const studentEnrollments = await TeacherClassStudent.find({ studentId });
      console.log('Found student enrollments:', studentEnrollments);
      
      if (studentEnrollments.length === 0) {
        console.log('No enrollments found for student, returning empty');
        return res.json({ files: [], total: 0 });
      }
      
      const teacherClassIds = studentEnrollments.map(enrollment => enrollment.teacherClassId);
      console.log('Teacher class IDs for student:', teacherClassIds);
      
      query.teacherClassId = { $in: teacherClassIds };
    }
    
    console.log('Final assignments query:', query);
    
    // Get all assignments matching the query
    const allAssignments = await Assignment.find(query)
      .sort({ dateUpload: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    console.log('Found assignments:', allAssignments.length);
    
    const total = await Assignment.countDocuments(query);
    console.log('Total assignments matching query:', total);
    
    // Add class information to assignments
    const assignmentsWithClassInfo = allAssignments.map(assignment => {
      return {
        ...assignment.toObject(),
        className: 'Unknown', // Will be populated if needed
        subjectName: 'Unknown'
      };
    });
    
    res.json({ files: assignmentsWithClassInfo, total });
    
  } catch (error) {
    console.error('Error in /assignments route:', error);
    res.status(500).json({ message: error.message });
  }
});

// Pagination and search for announcements
router.get('/announcements', async (req, res) => {
  try {
    console.log('GET /announcements route called');
    const { page = 1, limit = 10, search = '', teacherClassId, teacherId, studentId } = req.query;
    let query = {};
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }
    if (teacherClassId) {
      query.teacherClassId = teacherClassId;
    } else if (teacherId) {
      // For global tab, get all teacher classes for this teacher
      const teacherClasses = await TeacherClass.find({ teacherId });
      const teacherClassIds = teacherClasses.map(tc => tc._id);
      if (teacherClassIds.length > 0) {
        query.teacherClassId = { $in: teacherClassIds };
      } else {
        // No classes found for this teacher, return empty
        return res.json({ files: [], total: 0 });
      }
    } else if (studentId) {
      // For student global view, get all classes the student is enrolled in
      console.log('Finding classes for studentId:', studentId);
      
      // First get all student class enrollments
      const TeacherClassStudent = require('../models/TeacherClassStudent');
      const studentEnrollments = await TeacherClassStudent.find({ studentId });
      console.log('Found student enrollments:', studentEnrollments);
      
      if (studentEnrollments.length === 0) {
        console.log('No enrollments found for student, returning empty');
        return res.json({ files: [], total: 0 });
      }
      
      const teacherClassIds = studentEnrollments.map(enrollment => enrollment.teacherClassId);
      console.log('Teacher class IDs for student:', teacherClassIds);
      
      query.teacherClassId = { $in: teacherClassIds };
    }
    console.log('Announcements query:', query);
    
    // Check if collection exists and has documents
    const count = await Announcement.countDocuments();
    console.log('Total announcements in database:', count);
    
    if (count === 0) {
      console.log('No announcements found, returning empty array');
      return res.json({ files: [], total: 0 });
    }
    
    const allFiles = await Announcement.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    let validFiles = [];
    let invalidCount = 0;
    for (const file of allFiles) {
      try {
        // Check for required fields
        if (!file.teacherClassId || !file.content || !file.date) {
          console.warn('Malformed Announcement document:', file);
          invalidCount++;
          continue;
        }
        validFiles.push(file);
      } catch (err) {
        console.error('Error processing Announcement document:', err, file);
        invalidCount++;
      }
    }
    const total = await Announcement.countDocuments(query);
    console.log('Found valid announcements:', validFiles.length, 'Invalid:', invalidCount, 'Total:', total);
    res.json({ files: validFiles, total });
  } catch (error) {
    console.error('Error in /announcements route:', error);
    res.status(500).json({ message: error.message });
  }
});

// SHARED FILES ROUTES

// Get shared files
router.get('/shared-files', async (req, res) => {
  try {
    const { teacherId, type = 'received' } = req.query;
    let query = {};
    
    // Validate teacherId is a valid ObjectId
    if (teacherId && !mongoose.Types.ObjectId.isValid(teacherId)) {
      console.error('Invalid teacherId format:', teacherId);
      return res.status(400).json({ message: 'Invalid teacher ID format' });
    }
    
    if (teacherId) {
      if (type === 'received') {
        // Find files shared WITH this teacher (received files)
        query.sharedWith = teacherId;
      } else if (type === 'shared') {
        // Find files shared BY this teacher (shared files)
        query.uploadedBy = teacherId;
      }
    }
    
    const sharedFiles = await SharedFile.find(query)
      .sort({ uploadDate: -1 });
    
    // Get all teacher IDs to fetch names
    const teacherIds = new Set();
    sharedFiles.forEach(file => {
      if (file.uploadedBy) teacherIds.add(file.uploadedBy);
      if (file.sharedWith) {
        file.sharedWith.forEach(id => teacherIds.add(id));
      }
    });
    
    // Filter out invalid ObjectIds before querying
    const validTeacherIds = Array.from(teacherIds).filter(id => mongoose.Types.ObjectId.isValid(id));
    
    // Fetch teacher names only for valid IDs
    let teachers = [];
    let teacherMap = {};
    if (validTeacherIds.length > 0) {
      teachers = await Teacher.find({ _id: { $in: validTeacherIds } });
      teachers.forEach(teacher => {
        teacherMap[teacher._id] = teacher.name;
      });
    }
    
    // Add teacher names to the response
    const filesWithNames = sharedFiles.map(file => {
      const fileObj = file.toObject();
      fileObj.uploadedByName = teacherMap[file.uploadedBy] || 'Unknown Teacher';
      fileObj.sharedWithNames = file.sharedWith.map(id => teacherMap[id] || 'Unknown Teacher');
      return fileObj;
    });
    
    res.json({ files: filesWithNames, total: filesWithNames.length });
  } catch (error) {
    console.error('Error fetching shared files:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload shared file
router.post('/shared-files', uploadSharedFile.single('file'), async (req, res) => {
  try {
    const { fileName, description, selectedTeachers, teacherId } = req.body;
    
    console.log('Upload shared file request body:', req.body);
    console.log('Uploaded file:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    if (!selectedTeachers || !teacherId) {
      return res.status(400).json({ message: 'Missing required fields: selectedTeachers or teacherId' });
    }
    
    // Validate teacherId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      console.error('Invalid teacherId format:', teacherId);
      return res.status(400).json({ message: 'Invalid teacher ID format' });
    }
    
    const teacherIds = selectedTeachers.split(',').map(id => id.trim()).filter(id => id.length > 0);
    
    // Validate all selected teacher IDs
    const validTeacherIds = teacherIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validTeacherIds.length !== teacherIds.length) {
      console.error('Some teacher IDs are invalid:', teacherIds);
      return res.status(400).json({ message: 'Some teacher IDs are invalid' });
    }
    
    console.log('Teacher IDs to share with:', validTeacherIds);
    console.log('Uploading teacher ID:', teacherId);
    
    // Create shared file entry
    const sharedFile = new SharedFile({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      description: description || '',
      uploadedBy: teacherId,
      sharedWith: validTeacherIds,
      uploadDate: new Date()
    });
    
    await sharedFile.save();
    console.log('Saved shared file:', sharedFile);
    
    res.status(201).json({ message: 'File shared successfully', file: sharedFile });
  } catch (error) {
    console.error('Error uploading shared file:', error);
    res.status(500).json({ message: error.message });
  }
});

// Download shared file
router.get('/shared-files/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const sharedFile = await SharedFile.findById(id);
    
    if (!sharedFile) {
      return res.status(404).json({ message: 'Shared file not found' });
    }
    
    const filePath = path.join(__dirname, '..', 'uploads/teacher-materials', sharedFile.fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${sharedFile.originalName || sharedFile.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading shared file:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
});

// Delete shared file
router.delete('/shared-files/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sharedFile = await SharedFile.findByIdAndDelete(id);
    
    if (!sharedFile) {
      return res.status(404).json({ message: 'Shared file not found' });
    }
    
    res.json({ message: 'Shared file deleted successfully' });
  } catch (error) {
    console.error('Error deleting shared file:', error);
    res.status(500).json({ message: 'Failed to delete shared file' });
  }
});

// PARAMETERIZED ROUTES (must come after specific routes)

// Get all teacher classes for a specific teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { schoolYear } = req.query;
    console.log('GET /teacher/:teacherId route called');
    console.log('Params:', req.params, 'Query:', req.query);
    let query = { teacherId };
    if (schoolYear) {
      query.schoolYear = schoolYear;
    }
    console.log('TeacherClass query:', query);
    const teacherClasses = await TeacherClass.find(query)
      .populate('classId')
      .populate('subjectId')
      .sort({ createdAt: -1 });
    console.log('Found teacher classes:', teacherClasses.length);
    res.json(teacherClasses);
  } catch (error) {
    console.error('Error in /teacher/:teacherId route:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get available admin classes for teacher to assign
router.get('/available-classes', async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true }).sort({ name: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available admin courses (subjects) for teacher to assign
router.get('/available-subjects', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ name: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all teacher classes
router.get('/', async (req, res) => {
  try {
    const teacherClasses = await TeacherClass.find({});
    res.json(teacherClasses.map(tc => ({
      _id: tc._id,
      name: tc.className
    })));
  } catch (error) {
    console.error('Error fetching all teacher classes:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add a new teacher class
router.post('/', async (req, res) => {
  try {
    const { teacherId, teacherName, classId, className, subjectId, subjectName, schoolYear } = req.body;
    
    // Check if this teacher already has this class assigned
    const existingClass = await TeacherClass.findOne({
      teacherId,
      classId,
      schoolYear
    });
    
    if (existingClass) {
      return res.status(400).json({ message: 'Teacher already has this class assigned for this school year' });
    }
    
    // Get student count from the admin class
    const adminClass = await Class.findById(classId);
    const studentCount = adminClass ? adminClass.studentCount || 0 : 0;
    
    const teacherClass = new TeacherClass({
      teacherId,
      teacherName,
      classId,
      className,
      subjectId,
      subjectName,
      schoolYear,
      studentCount
    });
    
    const savedClass = await teacherClass.save();
    res.status(201).json(savedClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update teacher class
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedAt = Date.now();
    
    const teacherClass = await TeacherClass.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!teacherClass) {
      return res.status(404).json({ message: 'Teacher class not found' });
    }
    
    res.json(teacherClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all quizzes for a teacher (multi-class)
router.get('/quizzes', async (req, res) => {
  try {
    console.log('GET /quizzes route called');
    const { teacherId = 'teacher123', studentId, page = 1, limit = 10, search = '' } = req.query;
    
    console.log('Looking for teacher with ID:', teacherId);
    
    // First, let's check what quizzes exist in the database
    console.log('Testing Quiz model...');
    const allQuizzes = await Quiz.find({});
    console.log('All quizzes in database:', allQuizzes.length);
    
    let teacherClasses = [];
    let teacherClassIds = [];
    
    if (studentId) {
      // For student global view, get all classes the student is enrolled in
      console.log('Finding classes for studentId:', studentId);
      
      // First get all student class enrollments
      const TeacherClassStudent = require('../models/TeacherClassStudent');
      const studentEnrollments = await TeacherClassStudent.find({ studentId });
      console.log('Found student enrollments:', studentEnrollments);
      
      if (studentEnrollments.length === 0) {
        console.log('No enrollments found for student, returning empty');
        return res.json({ quizzes: [], total: 0 });
      }
      
      teacherClassIds = studentEnrollments.map(enrollment => enrollment.teacherClassId);
      teacherClasses = await TeacherClass.find({ _id: { $in: teacherClassIds } });
    } else {
      // For teacher global view
      teacherClasses = await TeacherClass.find({ teacherId });
      teacherClassIds = teacherClasses.map(tc => tc._id);
    }
    
    console.log('Found teacher classes:', teacherClasses.length);
    console.log('Teacher class IDs:', teacherClassIds);
    
    if (teacherClassIds.length === 0) {
      console.log('No teacher classes found, trying to find quizzes by createdBy');
      const quizzesByCreatedBy = await Quiz.find({ createdBy: teacherId });
      console.log('Quizzes found by createdBy:', quizzesByCreatedBy.length);
      
      const quizzesWithClassInfo = quizzesByCreatedBy.map(quiz => ({
        ...quiz.toObject(),
        className: 'Unknown Class',
        subjectName: 'Unknown Subject'
      }));
      
      return res.json({ quizzes: quizzesWithClassInfo, total: quizzesByCreatedBy.length });
    }
    
    let query = { teacherClassId: { $in: teacherClassIds } };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Quizzes query:', query);
    
    const quizzes = await Quiz.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const total = await Quiz.countDocuments(query);
    
    console.log('Found quizzes matching query:', quizzes.length, 'Total:', total);
    
    // Add class information to each quiz
    const quizzesWithClassInfo = quizzes.map(quiz => {
      const teacherClass = teacherClasses.find(tc => tc._id.toString() === quiz.teacherClassId.toString());
      return {
        ...quiz.toObject(),
        className: teacherClass?.className || 'Unknown Class',
        subjectName: teacherClass?.subjectName || 'Unknown Subject'
      };
    });
    
    res.json({ quizzes: quizzesWithClassInfo, total });
  } catch (error) {
    console.error('Error in /quizzes route:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
});

// Add a quiz (multi-class)
router.post('/quizzes', async (req, res) => {
  try {
    console.log('POST /quizzes route called');
    const { title, description, questions, timeMinutes, selectedClasses, createdBy = 'teacher123' } = req.body;
    
    console.log('Quiz data received:', {
      title,
      description,
      timeMinutes,
      selectedClasses: selectedClasses?.length,
      questionsCount: questions?.length
    });
    
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Title and at least one question are required' });
    }
    
    if (!selectedClasses || selectedClasses.length === 0) {
      return res.status(400).json({ message: 'Please select at least one class' });
    }
    
    // Validate and process questions
    const processedQuestions = questions.map(q => ({
      question: q.question,
      questionType: q.questionType || 'mcq',
      options: q.questionType === 'mcq' ? q.options : [],
      answer: q.answer,
      points: q.points || 1
    }));
    
    // Create a quiz for each selected class
    const createdQuizzes = [];
    
    for (const classId of selectedClasses) {
      const quizData = {
        title,
        description,
        questions: processedQuestions,
        timeMinutes: parseInt(timeMinutes) || 30,
        teacherClassId: classId,
        createdBy,
        date: new Date()
      };
      
      const quiz = new Quiz(quizData);
      await quiz.save();
      createdQuizzes.push(quiz);
    }
    
    console.log(`Created ${createdQuizzes.length} quizzes`);
    res.status(201).json({ 
      message: `Quiz created successfully for ${createdQuizzes.length} class(es)`,
      quizzes: createdQuizzes
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a quiz
router.delete('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findByIdAndDelete(id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete teacher class
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const teacherClass = await TeacherClass.findByIdAndDelete(id);
    
    if (!teacherClass) {
      return res.status(404).json({ message: 'Teacher class not found' });
    }
    
    res.json({ message: 'Teacher class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get teacher class by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const teacherClass = await TeacherClass.findById(id);
    
    if (!teacherClass) {
      return res.status(404).json({ message: 'Teacher class not found' });
    }
    
    res.json(teacherClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk delete teacher classes
router.delete('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'IDs array is required' });
    }
    
    const result = await TeacherClass.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${result.deletedCount} teacher classes deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get admin students for a class (for teacher to add) with search
router.get('/:teacherClassId/admin-students', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { search } = req.query;
    const teacherClass = await TeacherClass.findById(teacherClassId);
    if (!teacherClass) return res.status(404).json({ message: 'Teacher class not found' });
    // Match by class name (not classId)
    let query = { class: teacherClass.className };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { regNo: { $regex: search, $options: 'i' } }
      ];
    }
    const students = await Student.find(query);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get students assigned to a teacher's class
router.get('/:teacherClassId/students', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const assignments = await TeacherClassStudent.find({ teacherClassId }).populate('studentId');
    res.json(assignments.map(a => a.studentId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign a student to a teacher's class
router.post('/:teacherClassId/students', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { studentId } = req.body;
    // Prevent duplicate assignment
    const exists = await TeacherClassStudent.findOne({ teacherClassId, studentId });
    if (exists) return res.status(400).json({ message: 'Student already assigned' });
    const assignment = new TeacherClassStudent({ teacherClassId, studentId });
    await assignment.save();
    // Update studentCount
    const count = await TeacherClassStudent.countDocuments({ teacherClassId });
    await TeacherClass.findByIdAndUpdate(teacherClassId, { studentCount: count });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Unassign a student from a teacher's class
router.delete('/:teacherClassId/students/:studentId', async (req, res) => {
  try {
    const { teacherClassId, studentId } = req.params;
    await TeacherClassStudent.findOneAndDelete({ teacherClassId, studentId });
    // Update studentCount
    const count = await TeacherClassStudent.countDocuments({ teacherClassId });
    await TeacherClass.findByIdAndUpdate(teacherClassId, { studentCount: count });
    res.json({ message: 'Student unassigned' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get subject overview for a teacher class
router.get('/:teacherClassId/subject-overview', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const overview = await SubjectOverview.findOne({ teacherClassId });
    res.json(overview || { content: '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Set subject overview for a teacher class
router.post('/:teacherClassId/subject-overview', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { content } = req.body;
    let overview = await SubjectOverview.findOne({ teacherClassId });
    if (!overview) {
      overview = new SubjectOverview({ teacherClassId, content });
    } else {
      overview.content = content;
    }
    await overview.save();
    res.json(overview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update subject overview for a teacher class
router.put('/:teacherClassId/subject-overview', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { content } = req.body;
    const overview = await SubjectOverview.findOneAndUpdate(
      { teacherClassId },
      { content },
      { new: true, upsert: true }
    );
    res.json(overview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete subject overview for a teacher class
router.delete('/:teacherClassId/subject-overview', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    await SubjectOverview.findOneAndDelete({ teacherClassId });
    res.json({ message: 'Subject overview deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all subject overviews for a teacher
router.get('/teacher/:teacherId/subject-overviews', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacherClasses = await TeacherClass.find({ teacherId });
    const teacherClassIds = teacherClasses.map(tc => tc._id);
    
    const overviews = await SubjectOverview.find({ 
      teacherClassId: { $in: teacherClassIds } 
    }).populate('teacherClassId');
    
    res.json(overviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List downloadable materials for a teacher class
router.get('/:teacherClassId/materials', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const materials = await DownloadableMaterial.find({ teacherClassId }).sort({ dateUpload: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Upload a downloadable material
router.post('/:teacherClassId/materials', uploadMaterial.single('file'), async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { description, uploadedBy } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const material = new DownloadableMaterial({
      teacherClassId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      description,
      uploadedBy
    });
    await material.save();
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Download a material
router.get('/materials/download/:fileName', (req, res) => {
      const filePath = path.join(__dirname, 'uploads/teacher-materials', req.params.fileName);
  res.download(filePath);
});
// Delete a material
router.delete('/:teacherClassId/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const material = await DownloadableMaterial.findByIdAndDelete(id);
    if (material) {
      // Optionally delete file from disk
      const fs = require('fs');
      const filePath = path.join(__dirname, '..', 'uploads/teacher-materials', material.fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List assignments for a teacher class
router.get('/:teacherClassId/assignments', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const assignments = await Assignment.find({ teacherClassId }).sort({ dateUpload: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Upload an assignment
router.post('/:teacherClassId/assignments', uploadAssignment.single('file'), async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { description, dueDate, uploadedBy } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const assignment = new Assignment({
      teacherClassId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      description,
      dueDate,
      uploadedBy
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Download an assignment
router.get('/assignments/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Download request for assignment ID:', id);
    
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
// Delete an assignment
router.delete('/:teacherClassId/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);
    if (assignment) {
      // Optionally delete file from disk
      const fs = require('fs');
      const filePath = path.join(__dirname, '..', 'uploads/teacher-assignments', assignment.fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List announcements for a teacher class
router.get('/:teacherClassId/announcements', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const announcements = await Announcement.find({ teacherClassId }).sort({ date: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Add an announcement
router.post('/:teacherClassId/announcements', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { title, content, postedBy } = req.body;
    const announcement = new Announcement({ teacherClassId, title, content, postedBy });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Delete an announcement
router.delete('/:teacherClassId/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List events for a teacher class
router.get('/:teacherClassId/events', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { eventType } = req.query;
    
    let query = { teacherClassId };
    if (eventType) {
      query.eventType = eventType;
    }
    
    const events = await ClassEvent.find(query).sort({ start: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add an event (without file)
router.post('/:teacherClassId/events', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { 
      title, start, end, description, color, createdBy, 
      eventType, duration, totalMarks, instructions, 
      isRecurring, recurrencePattern 
    } = req.body;
    
    const event = new ClassEvent({ 
      teacherClassId, title, start, end, description, color, createdBy,
      eventType: eventType || 'event', duration, totalMarks, instructions,
      isRecurring, recurrencePattern
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add an event with file upload (for timetables, datesheets, etc.)
router.post('/:teacherClassId/events/with-file', uploadCalendarEvent.single('file'), async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { 
      title, start, end, description, color, createdBy, 
      eventType, duration, totalMarks, instructions,
      isRecurring, recurrencePattern 
    } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'File is required for this event type' });
    }
    
    const fileUrl = `/uploads/calendar-events/${req.file.filename}`;
    const fileName = req.file.originalname;
    
    const event = new ClassEvent({ 
      teacherClassId, title, start, end, description, color, createdBy,
      eventType: eventType || 'event', duration, totalMarks, instructions,
      isRecurring, recurrencePattern, fileUrl, fileName
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an event
router.put('/:teacherClassId/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const event = await ClassEvent.findByIdAndUpdate(id, updateData, { new: true });
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an event
router.delete('/:teacherClassId/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await ClassEvent.findById(id);
    if (event && event.fileUrl) {
      // Delete the file if it exists
      const filePath = path.join(__dirname, '..', event.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await ClassEvent.findByIdAndDelete(id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download event file
router.get('/events/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await ClassEvent.findById(id);
    
    if (!event || !event.fileUrl) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const filePath = path.join(__dirname, '..', event.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    res.download(filePath, event.fileName || 'event-file');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Test route to see all quizzes in database
router.get('/all-quizzes', async (req, res) => {
  try {
    console.log('Testing Quiz model...');
    console.log('Quiz model:', Quiz);
    
    const allQuizzes = await Quiz.find({});
    console.log('All quizzes in database:', allQuizzes);
    res.json({ quizzes: allQuizzes, count: allQuizzes.length });
  } catch (error) {
    console.error('Error in /all-quizzes route:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
});





// Multi-class upload for downloadables
router.post('/downloadables', uploadMaterial.single('file'), async (req, res) => {
  try {
    console.log('=== DOWNLOADABLE UPLOAD DEBUG START ===');
    console.log('POST /downloadables route called');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request headers:', req.headers);
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    const { fileName, description, uploadDate, selectedClasses = [] } = req.body;
    
    console.log('Extracted data:', {
      fileName,
      description,
      uploadDate,
      selectedClasses
    });
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    if (!description) {
      console.log('❌ No description provided');
      return res.status(400).json({ message: 'Description is required' });
    }
    
    let classIds = selectedClasses;
    if (typeof classIds === 'string') {
      classIds = classIds.split(',');
    }
    if (!Array.isArray(classIds)) {
      classIds = [classIds];
    }
    
    console.log('Processing classIds:', classIds);
    console.log('File details:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    const mongoose = require('mongoose');
    const results = [];
    
    for (const classId of classIds) {
      try {
        console.log('Processing classId:', classId);
        
        // Validate that classId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(classId)) {
          console.error('❌ Invalid ObjectId for classId:', classId);
          continue;
        }
        
        const material = new DownloadableMaterial({
          teacherClassId: new mongoose.Types.ObjectId(classId),
          title: fileName || req.file.originalname,
          fileName: req.file.filename,
          originalName: req.file.originalname,
          description,
          dateUpload: uploadDate ? new Date(uploadDate) : new Date(),
          uploadedBy: 'teacher123'
        });
        
        console.log('Saving material:', material);
        const savedMaterial = await material.save();
        console.log('✅ Material saved successfully:', savedMaterial._id);
        results.push(savedMaterial);
        
      } catch (err) {
        console.error('❌ Error saving material for classId', classId, err);
      }
    }
    
    console.log('Total materials saved:', results.length);
    console.log('Returning results:', results);
    console.log('=== DOWNLOADABLE UPLOAD DEBUG END ===');
    res.status(201).json(results);
    
  } catch (error) {
    console.error('❌ Error in /downloadables POST route:', error);
    res.status(400).json({ message: error.message });
  }
});
// Multi-class upload for assignments
router.post('/assignments', uploadAssignment.single('file'), async (req, res) => {
  try {
    console.log('POST /assignments route called');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { description, dueDate, selectedClasses = [] } = req.body;
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    let classIds = selectedClasses;
    if (typeof classIds === 'string') {
      classIds = classIds.split(',');
    }
    if (!Array.isArray(classIds)) {
      classIds = [classIds];
    }
    console.log('Saving assignments for classIds:', classIds);
    
    const mongoose = require('mongoose');
    const results = [];
    
    for (const classId of classIds) {
      try {
        console.log('Processing classId:', classId);
        
        // Validate that classId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(classId)) {
          console.error('Invalid ObjectId for classId:', classId);
          continue;
        }
        
        const assignment = new Assignment({
          teacherClassId: new mongoose.Types.ObjectId(classId),
          fileName: req.file.filename,
          originalName: req.file.originalname,
          description,
          dueDate,
          uploadedBy: 'teacher123'
        });
        
        console.log('Saving assignment:', assignment);
        const savedAssignment = await assignment.save();
        console.log('Assignment saved successfully:', savedAssignment._id);
        results.push(savedAssignment);
        
      } catch (err) {
        console.error('Error saving assignment for classId', classId, err);
      }
    }
    
    console.log('Total assignments saved:', results.length);
    console.log('Returning results:', results);
    res.status(201).json(results);
    
  } catch (error) {
    console.error('Error in /assignments POST route:', error);
    res.status(400).json({ message: error.message });
  }
});
// Multi-class announcement
router.post('/announcements', async (req, res) => {
  try {
    const { content, selectedClasses = [] } = req.body;
    const classIds = Array.isArray(selectedClasses) ? selectedClasses : [selectedClasses];
    const results = [];
    for (const classId of classIds) {
      const announcement = new Announcement({
        teacherClassId: classId,
        title: 'Announcement', // Add default title since it's required
        content,
        postedBy: req.user?._id
      });
      await announcement.save();
      results.push(announcement);
    }
    res.status(201).json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Pagination and search for downloadables
router.get('/downloadables', async (req, res) => {
  try {
    console.log('GET /downloadables route called');
    const { page = 1, limit = 10, search = '', teacherClassId } = req.query;
    let query = {};
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }
    if (teacherClassId) {
      query.teacherClassId = teacherClassId;
    }
    console.log('Downloadables query:', query);
    const allFiles = await DownloadableMaterial.find(query)
      .sort({ dateUpload: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    let validFiles = [];
    let invalidCount = 0;
    for (const file of allFiles) {
      try {
        if (!file.teacherClassId || !file.fileName || !file.dateUpload) {
          console.warn('Malformed DownloadableMaterial document:', file);
          invalidCount++;
          continue;
        }
        validFiles.push(file);
      } catch (err) {
        console.error('Error processing DownloadableMaterial document:', err, file);
        invalidCount++;
      }
    }
    const total = await DownloadableMaterial.countDocuments(query);
    console.log('Found valid downloadables:', validFiles.length, 'Invalid:', invalidCount, 'Total:', total);
    res.json({ files: validFiles, total });
  } catch (error) {
    console.error('Error in /downloadables route:', error);
    res.status(500).json({ message: error.message });
  }
});

// Download downloadable material
router.get('/downloadables/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Download request for material ID:', id);
    
    const material = await DownloadableMaterial.findById(id);
    
    if (!material) {
      console.log('Material not found in database');
      return res.status(404).json({ message: 'Downloadable material not found' });
    }
    
    console.log('Material found:', {
      fileName: material.fileName,
      originalName: material.originalName,
      title: material.title
    });
    
    const filePath = path.join(__dirname, '..', 'uploads/teacher-materials', material.fileName);
    console.log('Looking for file at:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File not found at path:', filePath);
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    console.log('File found, starting download...');
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${material.originalName || material.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
});

// Delete downloadable material
router.delete('/downloadables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const material = await DownloadableMaterial.findByIdAndDelete(id);
    
    if (!material) {
      return res.status(404).json({ message: 'Downloadable material not found' });
    }
    
    res.json({ message: 'Downloadable material deleted successfully' });
  } catch (error) {
    console.error('Error deleting downloadable material:', error);
    res.status(500).json({ message: 'Failed to delete downloadable material' });
  }
});

module.exports = router;