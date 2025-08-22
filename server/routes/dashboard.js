const express = require('express');
const router = express.Router();

// Import all models
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Department = require('../models/Department');
const DownloadableMaterial = require('../models/DownloadableMaterial');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Expense = require('../models/Expense');
const Event = require('../models/Event');
const UserLog = require('../models/UserLog');
const ActivityLog = require('../models/ActivityLog');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get counts
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const classCount = await Class.countDocuments();
    const departmentCount = await Department.countDocuments();
    const downloadableCount = await DownloadableMaterial.countDocuments();
    const assignmentCount = await Assignment.countDocuments();
    const courseCount = await Course.countDocuments();
    const eventCount = await Event.countDocuments();

    // Get monthly data for charts
    const currentYear = new Date().getFullYear();
    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      const studentsAdded = await Student.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const teachersAdded = await Teacher.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const feesCollected = await Fee.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const expensesIncurred = await Expense.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      monthlyData.push({
        month: new Date(currentYear, month).toLocaleString('default', { month: 'short' }),
        students: studentsAdded,
        teachers: teachersAdded,
        fees: feesCollected[0]?.total || 0,
        expenses: expensesIncurred[0]?.total || 0
      });
    }

    // Get department-wise student distribution
    const departmentStats = await Student.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'departmentInfo'
        }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          departmentName: { $first: { $arrayElemAt: ['$departmentInfo.name', 0] } }
        }
      },
      {
        $project: {
          department: '$departmentName',
          count: 1
        }
      }
    ]);

    // Get attendance statistics
    const attendanceStats = await Attendance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activities
    const recentActivities = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('userId', 'username');

    // Get recent user logs
    const recentUserLogs = await UserLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('userId', 'username');

    res.json({
      counts: {
        students: studentCount,
        teachers: teacherCount,
        classes: classCount,
        departments: departmentCount,
        downloadables: downloadableCount,
        assignments: assignmentCount,
        courses: courseCount,
        events: eventCount
      },
      monthlyData,
      departmentStats,
      attendanceStats,
      recentActivities,
      recentUserLogs
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Get real-time statistics
router.get('/realtime', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStudents = await Student.countDocuments({
      createdAt: { $gte: today }
    });

    const todayTeachers = await Teacher.countDocuments({
      createdAt: { $gte: today }
    });

    const todayFees = await Fee.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          status: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const todayExpenses = await Expense.aggregate([
      {
        $match: {
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      todayStudents,
      todayTeachers,
      todayFees: todayFees[0]?.total || 0,
      todayExpenses: todayExpenses[0]?.total || 0
    });

  } catch (error) {
    console.error('Error fetching real-time stats:', error);
    res.status(500).json({ message: 'Error fetching real-time statistics' });
  }
});

module.exports = router; 