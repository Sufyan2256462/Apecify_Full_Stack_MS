const express = require('express');
const router = express.Router();
const DownloadableMaterial = require('../models/DownloadableMaterial');
const Assignment = require('../models/Assignment');
const TeacherClass = require('../models/TeacherClass');

// Admin: Get all downloadable materials
router.get('/downloadables', async (req, res) => {
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

// Admin: Get all assignments
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find({})
      .populate('teacherClassId')
      .sort({ dateUpload: -1 });
    
    const assignmentsWithInfo = assignments.map(assignment => {
      const teacherClass = assignment.teacherClassId;
      return {
        ...assignment.toObject(),
        className: teacherClass ? teacherClass.className : 'Unknown',
        subjectName: teacherClass ? teacherClass.subjectName : 'Unknown',
        teacherId: teacherClass ? teacherClass.teacherId : 'Unknown'
      };
    });
    
    res.json(assignmentsWithInfo);
  } catch (error) {
    console.error('Error fetching all assignments:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 