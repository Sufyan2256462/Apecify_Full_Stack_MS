const mongoose = require('mongoose');
require('dotenv').config();

const Attendance = require('./models/Attendance');
const TeacherClass = require('./models/TeacherClass');
const Student = require('./models/Student');

async function addTestAttendance() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get teacher classes
    const teacherClasses = await TeacherClass.find().limit(3);
    console.log('Found teacher classes:', teacherClasses.length);

    // Get students
    const students = await Student.find().limit(5);
    console.log('Found students:', students.length);

    if (teacherClasses.length === 0 || students.length === 0) {
      console.log('No teacher classes or students found. Please run addTestStudents.js first.');
      return;
    }

    // Generate attendance data for the last 30 days
    const attendanceRecords = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      for (const teacherClass of teacherClasses) {
        for (const student of students) {
          // Random attendance status (70% present, 20% absent, 10% late)
          const random = Math.random();
          let status;
          if (random < 0.7) status = 'present';
          else if (random < 0.9) status = 'absent';
          else status = 'late';
          
          attendanceRecords.push({
            studentId: student._id,
            teacherClassId: teacherClass._id,
            date: date,
            status: status,
            markedBy: 'teacher123',
            remarks: status === 'absent' ? 'Not present in class' : 
                     status === 'late' ? 'Arrived late' : 'Present and participated'
          });
        }
      }
    }

    console.log('Generated attendance records:', attendanceRecords.length);

    // Check for existing attendance records to avoid duplicates
    const existingRecords = await Attendance.find({
      studentId: { $in: students.map(s => s._id) },
      teacherClassId: { $in: teacherClasses.map(tc => tc._id) }
    });

    if (existingRecords.length > 0) {
      console.log('Attendance records already exist. Skipping...');
      console.log('Existing records:', existingRecords.length);
      return;
    }

    // Insert attendance records
    const savedRecords = await Attendance.insertMany(attendanceRecords);
    console.log('Saved attendance records:', savedRecords.length);

    // Calculate and display statistics
    const presentCount = savedRecords.filter(r => r.status === 'present').length;
    const absentCount = savedRecords.filter(r => r.status === 'absent').length;
    const lateCount = savedRecords.filter(r => r.status === 'late').length;
    const totalCount = savedRecords.length;

    console.log('\n=== Attendance Statistics ===');
    console.log('Total records:', totalCount);
    console.log('Present:', presentCount, `(${Math.round((presentCount/totalCount)*100)}%)`);
    console.log('Absent:', absentCount, `(${Math.round((absentCount/totalCount)*100)}%)`);
    console.log('Late:', lateCount, `(${Math.round((lateCount/totalCount)*100)}%)`);

    console.log('\nTest attendance data added successfully!');

  } catch (error) {
    console.error('Error adding test attendance:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addTestAttendance(); 