const UserLog = require('../models/UserLog');
const ActivityLog = require('../models/ActivityLog');

// Log user authentication activities
const logUserActivity = async (userId, userType, username, action, req, details = '') => {
  try {
    const userLog = new UserLog({
      userId,
      userType,
      username,
      action,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      details,
      timestamp: new Date()
    });
    await userLog.save();
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
};

// Log system activities
const logActivity = async (userId, userType, username, action, module, operation, req, details = '', oldValues = null, newValues = null, resourceId = null, resourceType = null) => {
  try {
    const activityLog = new ActivityLog({
      userId,
      userType,
      username,
      action,
      module,
      operation,
      resourceId,
      resourceType,
      oldValues,
      newValues,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      details,
      timestamp: new Date()
    });
    await activityLog.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Middleware to automatically log CRUD operations
const logCRUDOperation = (module, operation) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      // Log the operation after response is sent
      if (req.user) {
        const logData = {
          userId: req.user._id || req.user.id,
          userType: req.user.userType || 'AdminUser',
          username: req.user.username || req.user.email,
          action: `${operation} ${module}`,
          module: module.toUpperCase(),
          operation: operation.toUpperCase(),
          req,
          details: `Successfully ${operation} ${module}`,
          resourceId: req.params.id || null,
          resourceType: module
        };
        
        if (operation === 'UPDATE' && req.body) {
          logData.newValues = req.body;
        }
        
        logActivity(
          logData.userId,
          logData.userType,
          logData.username,
          logData.action,
          logData.module,
          logData.operation,
          logData.req,
          logData.details,
          logData.oldValues,
          logData.newValues,
          logData.resourceId,
          logData.resourceType
        );
      }
      
      originalSend.call(this, data);
    };
    next();
  };
};

module.exports = {
  logUserActivity,
  logActivity,
  logCRUDOperation
}; 