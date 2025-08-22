const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleTeachers = [
  {
    username: 'teacher1',
    password: 'password123',
    name: 'John Smith',
    email: 'john.smith@school.com',
    phone: '+1234567890',
    department: 'Computer Science',
    isActive: true,
    isAdmin: false
  },
  {
    username: 'teacher2',
    password: 'password123',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@school.com',
    phone: '+1234567891',
    department: 'Mathematics',
    isActive: true,
    isAdmin: false
  },
  {
    username: 'admin_teacher',
    password: 'admin123',
    name: 'Admin Teacher',
    email: 'admin.teacher@school.com',
    phone: '+1234567892',
    department: 'Administration',
    isActive: true,
    isAdmin: true
  }
];

async function addSampleTeachers() {
  try {
    console.log('Adding sample teachers...');
    
    for (const teacherData of sampleTeachers) {
      // Check if teacher already exists
      const existingTeacher = await Teacher.findOne({ 
        $or: [{ username: teacherData.username }, { email: teacherData.email }] 
      });
      
      if (existingTeacher) {
        console.log(`Teacher ${teacherData.username} already exists, skipping...`);
        continue;
      }
      
      // Create new teacher
      const teacher = new Teacher(teacherData);
      await teacher.save();
      console.log(`Teacher ${teacherData.username} created successfully`);
    }
    
    console.log('Sample teachers added successfully!');
    console.log('\nTest credentials:');
    console.log('1. Username: teacher1, Password: password123');
    console.log('2. Username: teacher2, Password: password123');
    console.log('3. Username: admin_teacher, Password: admin123');
    
  } catch (error) {
    console.error('Error adding sample teachers:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleTeachers(); 