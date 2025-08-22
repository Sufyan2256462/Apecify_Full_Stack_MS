const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const TeacherClass = require('../models/TeacherClass');
const TeacherClassStudent = require('../models/TeacherClassStudent');

// Mark attendance for a student
router.post('/', async (req, res) => {
  try {
    const { studentId, teacherClassId, date, status, markedBy, remarks } = req.body;
    
    if (!studentId || !teacherClassId || !date || !status || !markedBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if attendance already exists for this student, class, and date
    const existingAttendance = await Attendance.findOne({
      studentId,
      teacherClassId,
      date: new Date(date)
    });
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }
    
    const attendance = new Attendance({
      studentId,
      teacherClassId,
      date: new Date(date),
      status,
      markedBy,
      remarks: remarks || ''
    });
    
    await attendance.save();
    
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance for multiple students (bulk)
router.post('/bulk', async (req, res) => {
  try {
    const { teacherClassId, date, attendanceData, markedBy } = req.body;
    
    if (!teacherClassId || !date || !attendanceData || !markedBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const attendanceRecords = attendanceData.map(record => ({
      studentId: record.studentId,
      teacherClassId,
      date: new Date(date),
      status: record.status,
      markedBy,
      remarks: record.remarks || ''
    }));
    
    // Remove duplicates and handle conflicts
    const uniqueRecords = attendanceRecords.filter((record, index, self) => 
      index === self.findIndex(r => r.studentId === record.studentId)
    );
    
    // Use bulkWrite with updateOne operations to handle duplicates
    const bulkOps = uniqueRecords.map(record => ({
      updateOne: {
        filter: {
          studentId: record.studentId,
          teacherClassId: record.teacherClassId,
          date: record.date
        },
        update: { $set: record },
        upsert: true
      }
    }));

    const savedAttendance = await Attendance.bulkWrite(bulkOps, { ordered: false });
    
    res.status(201).json({
      message: `${savedAttendance.upsertedCount + savedAttendance.modifiedCount} attendance records processed`,
      upsertedCount: savedAttendance.upsertedCount,
      modifiedCount: savedAttendance.modifiedCount
    });
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get attendance for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { teacherClassId, startDate, endDate } = req.query;
    
    let query = { studentId };
    
    if (teacherClassId) {
      query.teacherClassId = teacherClassId;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const attendance = await Attendance.find(query)
      .populate('teacherClassId')
      .sort({ date: -1 });
    
    // Calculate attendance statistics
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
    
    res.json({
      attendance,
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get attendance for a teacher class
router.get('/teacher-class/:teacherClassId', async (req, res) => {
  try {
    const { teacherClassId } = req.params;
    const { date, studentId } = req.query;
    
    let query = { teacherClassId };
    
    if (date) {
      query.date = new Date(date);
    }
    
    if (studentId) {
      query.studentId = studentId;
    }
    
    const attendance = await Attendance.find(query)
      .populate('teacherClassId')
      .sort({ date: -1, studentId: 1 });
    
    res.json({
      attendance,
      total: attendance.length
    });
  } catch (error) {
    console.error('Error fetching teacher class attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get attendance statistics for a student
router.get('/student/:studentId/statistics', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { teacherClassId, startDate, endDate } = req.query;
    
    let query = { studentId };
    
    if (teacherClassId) {
      query.teacherClassId = teacherClassId;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const attendance = await Attendance.find(query)
      .populate('teacherClassId')
      .sort({ date: -1 });
    
    // Group by class
    const classStatistics = attendance.reduce((acc, record) => {
      const teacherClass = record.teacherClassId;
      const className = teacherClass ? teacherClass.className : 'Unknown Class';
      const subjectName = teacherClass ? teacherClass.subjectName : 'Unknown Subject';
      
      if (!acc[className]) {
        acc[className] = {
          className,
          subjectName,
          teacherClassId: teacherClass ? teacherClass._id : null,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          attendancePercentage: 0,
          attendanceRecords: []
        };
      }
      
      acc[className].totalDays++;
      acc[className].attendanceRecords.push(record);
      
      if (record.status === 'present') acc[className].presentDays++;
      else if (record.status === 'absent') acc[className].absentDays++;
      else if (record.status === 'late') acc[className].lateDays++;
      
      return acc;
    }, {});
    
    // Calculate percentages
    Object.values(classStatistics).forEach(stat => {
      if (stat.totalDays > 0) {
        stat.attendancePercentage = Math.round((stat.presentDays / stat.totalDays) * 100 * 100) / 100;
      }
    });
    
    res.json({
      statistics: Object.values(classStatistics),
      totalClasses: Object.keys(classStatistics).length
    });
  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update attendance
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { ...updateData, markedAt: new Date() },
      { new: true }
    );
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.json(attendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete attendance
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findByIdAndDelete(id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin search attendance
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, markedBy } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Attendance status is required' });
    }

    const updateFields = { status, remarks, markedAt: new Date() };
    if (markedBy) {
      updateFields.markedBy = markedBy;
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(updatedAttendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin search attendance
router.get('/search', async (req, res) => {
  try {
    const { class: className, date, student, markedBy, teacherId } = req.query;
    const query = {};
    
    const conditions = [];

    // 1. Filter by date
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      conditions.push({ date: { $gte: startOfDay, $lte: endOfDay } });
    }

    // 2. Filter by student name or registration number
    if (student) {
      const Student = require('../models/Student');
      const matchingStudents = await Student.find({
        $or: [
          { name: { $regex: student, $options: 'i' } },
          { regNo: { $regex: student, $options: 'i' } }
        ]
      }).select('_id');

      const studentIds = matchingStudents.map(s => s._id);
      if (studentIds.length > 0) {
        conditions.push({ studentId: { $in: studentIds } });
      } else {
        return res.json([]); // No students match, return empty
      }
    }

    // 3. Filter by class and/or teacher
    let classTeacherCombinedOrConditions = [];

    // Determine if className is a regular class or a teacher class
    let isClassNameARegularClass = false;
    let regularClassName = '';
    let isClassNameATeacherClass = false;
    let teacherClassIdFromClassName = null;

    if (className) {
      const Class = require('../models/Class');
      const foundRegularClass = await Class.findOne({ name: className });
      if (foundRegularClass) {
        isClassNameARegularClass = true;
        regularClassName = className;
      }

      const TeacherClass = require('../models/TeacherClass');
      const foundTeacherClass = await TeacherClass.findOne({ name: className });
      if (foundTeacherClass) {
        isClassNameATeacherClass = true;
        teacherClassIdFromClassName = foundTeacherClass._id;
      }
    }

    // Get teacher's associated class IDs if teacherId is provided
    let teacherClassIdsFromTeacher = [];
    if (teacherId) {
      const TeacherClass = require('../models/TeacherClass');
      const teacherClasses = await TeacherClass.find({ teacherId: teacherId }).select('_id');
      teacherClassIdsFromTeacher = teacherClasses.map(tc => tc._id);

      // Always filter by markedBy if teacherId is present
      // conditions.push({ markedBy: teacherId }); // Remove this line
    }

    // Combine class and teacher filters
    if (className && teacherId) {
      // Case: Both className and teacherId are provided
      if (isClassNameARegularClass) {
        // If className is a regular class, filter by class name
        classTeacherCombinedOrConditions.push({ class: regularClassName });
      }
      if (isClassNameATeacherClass) {
        // If className is a teacher class, filter by teacherClassId AND it must be one of the teacher's classes
        if (teacherClassIdFromClassName && teacherClassIdsFromTeacher.map(String).includes(teacherClassIdFromClassName.toString())) {
          classTeacherCombinedOrConditions.push({ teacherClassId: teacherClassIdFromClassName });
        }
      }
      console.log('DEBUG: classTeacherCombinedOrConditions (className && teacherId):', JSON.stringify(classTeacherCombinedOrConditions, null, 2));
      if (classTeacherCombinedOrConditions.length === 0) {
        return res.json([]); // No valid combination found
      }
      conditions.push({ $or: classTeacherCombinedOrConditions });
      // Add markedBy as a separate AND condition if it's not already handled by teacherId
      if (markedBy) {
        conditions.push({ markedBy: { $regex: markedBy, $options: 'i' } });
      }

    } else if (className) {
      // Case: Only className provided
      if (isClassNameARegularClass) {
        classTeacherCombinedOrConditions.push({ class: regularClassName });
      }
      if (isClassNameATeacherClass) {
        classTeacherCombinedOrConditions.push({ teacherClassId: teacherClassIdFromClassName });
      }
      console.log('DEBUG: classTeacherCombinedOrConditions (only className):', JSON.stringify(classTeacherCombinedOrConditions, null, 2));
      if (classTeacherCombinedOrConditions.length > 0) {
        conditions.push({ $or: classTeacherCombinedOrConditions });
      } else {
        return res.json([]); // No valid class found
      }

    } else if (teacherId) {
      // Case: Only teacherId provided
      // This means we want all attendance records marked by this teacher, or for teacher classes taught by this teacher.
      const teacherSpecificOrConditions = [];
      if (teacherClassIdsFromTeacher.length > 0) {
        teacherSpecificOrConditions.push({ teacherClassId: { $in: teacherClassIdsFromTeacher } });
      }


      console.log('DEBUG: teacherSpecificOrConditions (only teacherId):', JSON.stringify(teacherSpecificOrConditions, null, 2));
      if (teacherSpecificOrConditions.length > 0) {
        conditions.push({ $or: teacherSpecificOrConditions });
      } else {
        return res.json([]); // Should not happen if teacherClassIdsFromTeacher is checked above
      }
    } else {
      // Case: No className or teacherId provided, include all teacher classes and regular classes
      const TeacherClass = require('../models/TeacherClass');
      const Class = require('../models/Class');

      const [allTeacherClasses, allRegularClasses] = await Promise.all([
        TeacherClass.find().select('_id'),
        Class.find().select('name')
      ]);

      const allTeacherClassIds = allTeacherClasses.map(tc => tc._id);
      const allRegularClassNames = allRegularClasses.map(rc => rc.name);

      const orConditions = [];
      if (allTeacherClassIds.length > 0) {
        orConditions.push({ teacherClassId: { $in: allTeacherClassIds } });
      }
      if (allRegularClassNames.length > 0) {
        orConditions.push({ class: { $in: allRegularClassNames } });
      }

      console.log('DEBUG: default orConditions:', JSON.stringify(orConditions, null, 2));
      if (orConditions.length > 0) {
        conditions.push({ $or: orConditions });
      } else {
        return res.json([]); // No classes exist at all
      }
    }

    // 4. Filter by markedBy (teacher or admin) - if explicitly provided in query, apply it as an additional AND condition
    if (markedBy) {
      conditions.push({ markedBy: { $regex: markedBy, $options: 'i' } });
    }

    console.log('DEBUG: Final conditions array before constructing finalQuery:', JSON.stringify(conditions, null, 2));

    // Construct the final query
    const finalQuery = conditions.length > 0 ? { $and: conditions } : {};
    
    console.log('Final attendance search query:', JSON.stringify(finalQuery, null, 2));
    // Get attendance records and populate with student and class info
    const records = await Attendance.find(finalQuery)
      .populate({ path: 'teacherClassId', select: 'className subjectName' })
      .populate({ path: 'studentId', select: 'name regNo' })
      .sort({ date: -1, studentId: 1 });

    res.json(records);
  } catch (error) {
    console.error('Error searching attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper to get teacherClassId by class name
async function getTeacherClassIdByName(className) {
  const cls = await require('../models/TeacherClass').findOne({ className });
  return cls ? cls._id : null;
}

module.exports = router;