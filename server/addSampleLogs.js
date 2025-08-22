const mongoose = require('mongoose');
const UserLog = require('./models/UserLog');
const ActivityLog = require('./models/ActivityLog');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleUserLogs = [
  {
    userId: new mongoose.Types.ObjectId(),
    userType: 'Student',
    username: 'student1',
    action: 'LOGIN',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'SUCCESS',
    details: 'Student logged in successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userType: 'Teacher',
    username: 'teacher1',
    action: 'LOGIN',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    status: 'SUCCESS',
    details: 'Teacher logged in successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userType: 'AdminUser',
    username: 'admin',
    action: 'LOGIN',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'SUCCESS',
    details: 'Admin logged in successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 90) // 1.5 hours ago
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userType: 'Student',
    username: 'student2',
    action: 'LOGIN_FAILED',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'FAILED',
    details: 'Invalid password provided',
    timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userType: 'Teacher',
    username: 'teacher2',
    action: 'LOGOUT',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    status: 'SUCCESS',
    details: 'Teacher logged out',
    timestamp: new Date(Date.now() - 1000 * 60 * 20) // 20 minutes ago
  }
];

const sampleActivityLogs = [
  {
    userId: new mongoose.Types.ObjectId(),
    userType: 'AdminUser',
    username: 'admin',
    action: 'Created new student',
    module: 'STUDENTS',
    operation: 'CREATE',
    resourceId: new mongoose.Types.ObjectId(),
    resourceType: 'Student',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'SUCCESS',
    details: 'Added new student John Doe',
    newValues: { name: 'John Doe', email: 'john@example.com' },
    timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userType: 'Teacher',
    username: 'teacher1',
    action: 'Updated assignment',
    module: 'ASSIGNMENTS',
    operation: 'UPDATE',
    resourceId: new mongoose.Types.ObjectId(),
    resourceType: 'Assignment',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    status: 'SUCCESS',
    details: 'Updated assignment deadline',
    oldValues: { deadline: '2024-01-15' },
    newValues: { deadline: '2024-01-20' },
    timestamp: new Date(Date.now() - 1000 * 60 * 40) // 40 minutes ago
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userType: 'AdminUser',
    username: 'admin',
    action: 'Deleted department',
    module: 'DEPARTMENTS',
    operation: 'DELETE',
    resourceId: new mongoose.Types.ObjectId(),
    resourceType: 'Department',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'SUCCESS',
    details: 'Deleted old department',
    oldValues: { name: 'Old Department', code: 'OLD' },
    timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userType: 'Teacher',
    username: 'teacher1',
    action: 'Uploaded downloadable material',
    module: 'DOWNLOADABLES',
    operation: 'CREATE',
    resourceId: new mongoose.Types.ObjectId(),
    resourceType: 'DownloadableMaterial',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    status: 'SUCCESS',
    details: 'Uploaded lecture notes for Chapter 5',
    newValues: { title: 'Chapter 5 Notes', fileName: 'chapter5.pdf' },
    timestamp: new Date(Date.now() - 1000 * 60 * 80) // 80 minutes ago
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userType: 'AdminUser',
    username: 'admin',
    action: 'Exported student data',
    module: 'STUDENTS',
    operation: 'EXPORT',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'SUCCESS',
    details: 'Exported all student records to CSV',
    timestamp: new Date(Date.now() - 1000 * 60 * 200) // 3.3 hours ago
  }
];

async function addSampleLogs() {
  try {
    console.log('Adding sample logs...');
    
    // Add user logs
    for (const logData of sampleUserLogs) {
      const userLog = new UserLog(logData);
      await userLog.save();
      console.log(`User log created: ${logData.action} by ${logData.username}`);
    }
    
    // Add activity logs
    for (const logData of sampleActivityLogs) {
      const activityLog = new ActivityLog(logData);
      await activityLog.save();
      console.log(`Activity log created: ${logData.action} in ${logData.module}`);
    }
    
    console.log('Sample logs added successfully!');
    
  } catch (error) {
    console.error('Error adding sample logs:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleLogs(); 