const express = require('express');
const router = express.Router();
const Grade = require('../models/Grade');
const TeacherClass = require('../models/TeacherClass');
const TeacherClassStudent = require('../models/TeacherClassStudent');

// Get grades for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { teacherClassId, assessmentType, isPublished = true } = req.query;
    
    let query = { studentId };
    
    if (teacherClassId) {
      query.teacherClassId = teacherClassId;
    }
    
    if (assessmentType) {
      query.assessmentType = assessmentType;
    }
    
    if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }
    
    const grades = await Grade.find(query)
      .populate('teacherClassId')
      .sort({ createdAt: -1 });
    
    // Group grades by class and assessment type
    const groupedGrades = grades.reduce((acc, grade) => {
      const teacherClass = grade.teacherClassId;
      const className = teacherClass ? teacherClass.className : 'Unknown Class';
      const subjectName = teacherClass ? teacherClass.subjectName : 'Unknown Subject';
      
      if (!acc[className]) {
        acc[className] = {
          className,
          subjectName,
          teacherClassId: teacherClass ? teacherClass._id : null,
          assessments: {}
        };
      }
      
      if (!acc[className].assessments[grade.assessmentType]) {
        acc[className].assessments[grade.assessmentType] = [];
      }
      
      acc[className].assessments[grade.assessmentType].push(grade);
      return acc; // Make sure to return the accumulator
    }, {});
    
    res.json({
      grades: Object.values(groupedGrades || {}),
      total: grades.length
    });
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get grades for a teacher class
router.get('/teacher-class/:teacherClassId', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { assessmentType, studentId } = req.query;
    
    let query = { teacherClassId };
    
    if (assessmentType) {
      query.assessmentType = assessmentType;
    }
    
    if (studentId) {
      query.studentId = studentId;
    }
    
    const grades = await Grade.find(query)
      .sort({ studentId: 1, assessmentType: 1, createdAt: -1 });
    
    res.json({
      grades,
      total: grades.length
    });
  } catch (error) {
    console.error('Error fetching teacher class grades:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload a single grade
router.post('/', async (req, res) => {
  try {
    const {
      studentId,
      teacherClassId,
      assessmentType,
      assessmentId,
      assessmentTitle,
      maxMarks,
      obtainedMarks,
      remarks,
      gradedBy
    } = req.body;
    
    // Validate required fields
    if (!studentId || !teacherClassId || !assessmentType || !assessmentTitle || !obtainedMarks || !gradedBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if grade already exists for this student and assessment
    const existingGrade = await Grade.findOne({
      studentId,
      teacherClassId,
      assessmentType,
      assessmentId
    });
    
    if (existingGrade) {
      return res.status(400).json({ message: 'Grade already exists for this student and assessment' });
    }
    
    const grade = new Grade({
      studentId,
      teacherClassId,
      assessmentType,
      assessmentId,
      assessmentTitle,
      maxMarks: maxMarks || 100,
      obtainedMarks,
      remarks: remarks || '',
      gradedBy
    });
    
    await grade.save();
    
    res.status(201).json(grade);
  } catch (error) {
    console.error('Error uploading grade:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple grades (bulk upload)
router.post('/bulk', async (req, res) => {
  try {
    const { grades, teacherClassId, assessmentType, assessmentId, assessmentTitle, maxMarks, gradedBy } = req.body;
    
    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ message: 'Grades array is required' });
    }
    
    if (!teacherClassId || !assessmentType || !assessmentTitle || !gradedBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const gradesToSave = grades.map(gradeData => {
      const obtainedMarks = gradeData.obtainedMarks;
      const maxMarksValue = maxMarks || 100;
      const percentage = (obtainedMarks / maxMarksValue) * 100;
      
      // Calculate grade based on percentage
      let grade;
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C+';
      else if (percentage >= 40) grade = 'C';
      else if (percentage >= 30) grade = 'D';
      else grade = 'F';
      
      return {
        studentId: gradeData.studentId,
        teacherClassId,
        assessmentType,
        assessmentId,
        assessmentTitle,
        maxMarks: maxMarksValue,
        obtainedMarks,
        percentage,
        grade,
        remarks: gradeData.remarks || '',
        gradedBy
      };
    });
    
    // Remove duplicates based on studentId and assessmentId
    const uniqueGrades = gradesToSave.filter((grade, index, self) => 
      index === self.findIndex(g => g.studentId === grade.studentId)
    );
    
    const savedGrades = await Grade.insertMany(uniqueGrades);
    
    res.status(201).json({
      message: `${savedGrades.length} grades uploaded successfully`,
      grades: savedGrades
    });
  } catch (error) {
    console.error('Error uploading bulk grades:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update a grade
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData.studentId;
    delete updateData.teacherClassId;
    delete updateData.assessmentType;
    delete updateData.assessmentId;
    
    const grade = await Grade.findByIdAndUpdate(
      id,
      { ...updateData, gradedAt: new Date() },
      { new: true }
    );
    
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    
    res.json(grade);
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a grade
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const grade = await Grade.findByIdAndDelete(id);
    
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ message: error.message });
  }
});

// Publish/unpublish grades
router.patch('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    
    const grade = await Grade.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true }
    );
    
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    
    res.json(grade);
  } catch (error) {
    console.error('Error updating grade publish status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Bulk publish/unpublish grades
router.patch('/bulk-publish', async (req, res) => {
  try {
    const { gradeIds, isPublished } = req.body;
    
    if (!gradeIds || !Array.isArray(gradeIds)) {
      return res.status(400).json({ message: 'Grade IDs array is required' });
    }
    
    const result = await Grade.updateMany(
      { _id: { $in: gradeIds } },
      { isPublished }
    );
    
    res.json({
      message: `${result.modifiedCount} grades updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating grade publish status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get students for a teacher class (for grade upload)
router.get('/teacher-class/:teacherClassId/students', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    
    // Validate teacherClassId
    if (!teacherClassId) {
      return res.status(400).json({ message: 'Teacher class ID is required' });
    }

    // Check if teacher class exists
    const teacherClass = await TeacherClass.findById(teacherClassId);
    if (!teacherClass) {
      return res.status(404).json({ message: 'Teacher class not found' });
    }
    
    // Find all enrollments for this class and populate student details
    const enrollments = await TeacherClassStudent.find({ teacherClassId })
      .populate('studentId')
      .lean();
    
    // Filter out any enrollments where studentId might be null (in case of data inconsistency)
    const students = enrollments
      .filter(enrollment => enrollment.studentId)
      .map(enrollment => ({
        _id: enrollment.studentId._id,
        name: enrollment.studentId.name,
        regNo: enrollment.studentId.regNo,
        class: enrollment.studentId.class
      }));
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching students for grade upload:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Get grade statistics for a teacher class
router.get('/teacher-class/:teacherClassId/statistics', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { assessmentType } = req.query;
    
    let query = { teacherClassId };
    if (assessmentType) {
      query.assessmentType = assessmentType;
    }
    
    const grades = await Grade.find(query);
    
    if (grades.length === 0) {
      return res.json({
        totalStudents: 0,
        averagePercentage: 0,
        averageGrade: 'N/A',
        gradeDistribution: {},
        assessmentTypes: []
      });
    }
    
    const totalStudents = grades.length;
    const totalPercentage = grades.reduce((sum, grade) => sum + grade.percentage, 0);
    const averagePercentage = totalPercentage / totalStudents;
    
    // Calculate average grade
    let averageGrade = 'F';
    if (averagePercentage >= 90) averageGrade = 'A+';
    else if (averagePercentage >= 80) averageGrade = 'A';
    else if (averagePercentage >= 70) averageGrade = 'B+';
    else if (averagePercentage >= 60) averageGrade = 'B';
    else if (averagePercentage >= 50) averageGrade = 'C+';
    else if (averagePercentage >= 40) averageGrade = 'C';
    else if (averagePercentage >= 30) averageGrade = 'D';
    
    // Grade distribution
    const gradeDistribution = grades.reduce((acc, grade) => {
      acc[grade.grade] = (acc[grade.grade] || 0) + 1;
      return acc;
    }, {});
    
    // Assessment types
    const assessmentTypes = [...new Set(grades.map(grade => grade.assessmentType))];
    
    res.json({
      totalStudents,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      averageGrade,
      gradeDistribution,
      assessmentTypes
    });
  } catch (error) {
    console.error('Error fetching grade statistics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get student grade summary
router.get('/student/:studentId/summary', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const grades = await Grade.find({ studentId, isPublished: true })
      .populate('teacherClassId')
      .sort({ createdAt: -1 });
    
    const summary = grades.reduce((acc, grade) => {
      const teacherClass = grade.teacherClassId;
      const className = teacherClass ? teacherClass.className : 'Unknown Class';
      const subjectName = teacherClass ? teacherClass.subjectName : 'Unknown Subject';
      
      if (!acc[className]) {
        acc[className] = {
          className,
          subjectName,
          teacherClassId: teacherClass ? teacherClass._id : null,
          totalAssessments: 0,
          totalMarks: 0,
          totalObtained: 0,
          averagePercentage: 0,
          averageGrade: 'N/A',
          assessments: []
        };
      }
      
      acc[className].totalAssessments++;
      acc[className].totalMarks += grade.maxMarks;
      acc[className].totalObtained += grade.obtainedMarks;
      acc[className].assessments.push(grade);
      
      return acc;
    }, {});
    
    // Calculate averages for each class
    Object.values(summary).forEach(classSummary => {
      if (classSummary.totalMarks > 0) {
        classSummary.averagePercentage = (classSummary.totalObtained / classSummary.totalMarks) * 100;
        
        // Calculate average grade
        if (classSummary.averagePercentage >= 90) classSummary.averageGrade = 'A+';
        else if (classSummary.averagePercentage >= 80) classSummary.averageGrade = 'A';
        else if (classSummary.averagePercentage >= 70) classSummary.averageGrade = 'B+';
        else if (classSummary.averagePercentage >= 60) classSummary.averageGrade = 'B';
        else if (classSummary.averagePercentage >= 50) classSummary.averageGrade = 'C+';
        else if (classSummary.averagePercentage >= 40) classSummary.averageGrade = 'C';
        else if (classSummary.averagePercentage >= 30) classSummary.averageGrade = 'D';
        else classSummary.averageGrade = 'F';
      }
    });
    
    res.json({
      summary: Object.values(summary),
      totalClasses: Object.keys(summary).length
    });
  } catch (error) {
    console.error('Error fetching student grade summary:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;