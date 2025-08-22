const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const AdminUser = require('./models/AdminUser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/teachers', express.static(path.join(__dirname, 'uploads/teachers')));
app.use('/uploads/content/attachments', express.static(path.join(__dirname, 'uploads/content/attachments')));
app.use('/uploads/content/images', express.static(path.join(__dirname, 'uploads/content/images')));
app.use('/uploads/content/videos', express.static(path.join(__dirname, 'uploads/content/videos')));
app.use('/uploads/events', express.static(path.join(__dirname, 'uploads/events')));
app.use('/uploads/calendar-events', express.static(path.join(__dirname, 'uploads/calendar-events')));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  // Auto-create default admin user if not exists
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  if (email && password) {
    const exists = await AdminUser.findOne({ username: email });
    if (!exists) {
      await AdminUser.create({
        firstname: 'Admin',
        lastname: 'User',
        username: email,
        password: password,
      });
      console.log('Default admin user created:', email);
    }
  }
});

app.get('/', (req, res) => {
  res.send('API is running');
});

const instituteRoutes = require('./routes/institute');
app.use('/api/institutes', instituteRoutes);

const courseRoutes = require('./routes/course');
app.use('/api/courses', courseRoutes);

const classRoutes = require('./routes/class');
app.use('/api/classes', classRoutes);

const adminUserRoutes = require('./routes/adminUser');
app.use('/api/admin-users', adminUserRoutes);
const departmentRoutes = require('./routes/department');
app.use('/api/departments', departmentRoutes);

const studentRoutes = require('./routes/student');
app.use('/api/students', studentRoutes);

const attendanceRoutes = require('./routes/attendance');
app.use('/api/attendance', attendanceRoutes);

const feeRoutes = require('./routes/fee');
app.use('/api/fees', feeRoutes);

const teacherRouter = require('./routes/teacher');
app.use('/api/teachers', teacherRouter);

const contentRouter = require('./routes/content');
app.use('/api/contents', contentRouter);

const expenseRoutes = require('./routes/expense');
app.use('/api/expenses', expenseRoutes);

const schoolYearRoutes = require('./routes/schoolYear');
app.use('/api/school-years', schoolYearRoutes);

const eventRoutes = require('./routes/event');
app.use('/api/events', eventRoutes);

const teacherClassRoutes = require('./routes/teacherClass');
app.use('/api/teacher-classes', teacherClassRoutes);

const studentClassRoutes = require('./routes/studentClass');
app.use('/api/student-classes', studentClassRoutes);

const teacherAuthRoutes = require('./routes/teacherAuth');
app.use('/api/teacher', teacherAuthRoutes);

const logsRoutes = require('./routes/logs');
app.use('/api/logs', logsRoutes);

const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

const gradeRoutes = require('./routes/grades');
app.use('/api/grades', gradeRoutes);

const messagesRoutes = require('./routes/messages');
app.use('/api/messages', messagesRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const backpackRouter = require('./routes/backpack');
// Ensure uploads/teacher-backpack directory exists
const backpackDir = path.join(__dirname, 'uploads/teacher-backpack');
if (!fs.existsSync(backpackDir)) {
  fs.mkdirSync(backpackDir, { recursive: true });
}
app.use('/api/backpack', backpackRouter);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 