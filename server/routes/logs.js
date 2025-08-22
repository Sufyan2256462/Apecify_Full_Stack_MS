const express = require('express');
const router = express.Router();
const UserLog = require('../models/UserLog');
const ActivityLog = require('../models/ActivityLog');

// Get user logs with filtering and pagination
router.get('/user-logs', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userType, 
      action, 
      status, 
      startDate, 
      endDate,
      username 
    } = req.query;

    const filter = {};
    
    if (userType) filter.userType = userType;
    if (action) filter.action = action;
    if (status) filter.status = status;
    if (username) filter.username = { $regex: username, $options: 'i' };
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const logs = await UserLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get activity logs with filtering and pagination
router.get('/activity-logs', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userType, 
      module, 
      operation, 
      status, 
      startDate, 
      endDate,
      username 
    } = req.query;

    const filter = {};
    
    if (userType) filter.userType = userType;
    if (module) filter.module = module;
    if (operation) filter.operation = operation;
    if (status) filter.status = status;
    if (username) filter.username = { $regex: username, $options: 'i' };
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get log statistics
router.get('/statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    const userLogStats = await UserLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    const activityLogStats = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$module',
          count: { $sum: 1 }
        }
      }
    ]);

    const userTypeStats = await UserLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      userLogStats,
      activityLogStats,
      userTypeStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export logs to CSV
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, userType, action, module, operation } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    if (userType) filter.userType = userType;
    if (action) filter.action = action;
    if (module) filter.module = module;
    if (operation) filter.operation = operation;

    let logs;
    if (type === 'user-logs') {
      logs = await UserLog.find(filter).sort({ timestamp: -1 });
    } else if (type === 'activity-logs') {
      logs = await ActivityLog.find(filter).sort({ timestamp: -1 });
    } else {
      return res.status(400).json({ message: 'Invalid log type' });
    }

    // Convert to CSV format
    const csvData = logs.map(log => {
      if (type === 'user-logs') {
        return `${log.timestamp},${log.username},${log.userType},${log.action},${log.status},${log.ipAddress || ''},${log.details || ''}`;
      } else {
        return `${log.timestamp},${log.username},${log.userType},${log.module},${log.operation},${log.action},${log.status},${log.details || ''}`;
      }
    });

    const headers = type === 'user-logs' 
      ? 'Timestamp,Username,UserType,Action,Status,IPAddress,Details\n'
      : 'Timestamp,Username,UserType,Module,Operation,Action,Status,Details\n';

    const csv = headers + csvData.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 