const mongoose = require('mongoose');
require('dotenv').config();

const TeacherClassStudent = require('./models/TeacherClassStudent');
const Student = require('./models/Student');
const TeacherClass = require('./models/TeacherClass');
const Class = require('./models/Class');
const Course = require('./models/Course');

async function addTestStudents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get or create required Class and Course
    let classDoc = await Class.findOne();
    if (!classDoc) {
      classDoc = new Class({
        name: 'CS',
        description: 'Computer Science Class'
      });
      await classDoc.save();
      console.log('Created class:', classDoc._id);
    }

    let courseDoc = await Course.findOne();
    if (!courseDoc) {
      courseDoc = new Course({
        name: 'CS',
        description: 'Computer Science Course'
      });
      await courseDoc.save();
      console.log('Created course:', courseDoc._id);
    }

    // Get or create teacher class for the actual teacher ID (from logs)
    const actualTeacherId = '688b250bcc3695bd665d44b6';
    let teacherClass = await TeacherClass.findOne({ teacherId: actualTeacherId });
    
    if (!teacherClass) {
      console.log('No teacher class found for teacher ID:', actualTeacherId);
      console.log('Creating a test teacher class...');
      teacherClass = new TeacherClass({
        teacherId: actualTeacherId,
        teacherName: 'Teacher',
        classId: classDoc._id,
        className: 'CS',
        subjectId: courseDoc._id,
        subjectName: 'CS',
        schoolYear: '2024-2025'
      });
      await teacherClass.save();
      console.log('Created teacher class for teacher ID:', actualTeacherId);
      console.log('Teacher Class ID:', teacherClass._id);
    } else {
      console.log('Found existing teacher class for teacher ID:', actualTeacherId);
      console.log('Teacher Class ID:', teacherClass._id);
    }

    // Get or create test students
    let students = await Student.find().limit(5);
    
    if (students.length === 0) {
      console.log('No students found. Creating test students...');
      const testStudents = [
        { name: 'John Doe', regNo: 'STU001', class: 'CS', email: 'john@test.com' },
        { name: 'Jane Smith', regNo: 'STU002', class: 'CS', email: 'jane@test.com' },
        { name: 'Mike Johnson', regNo: 'STU003', class: 'CS', email: 'mike@test.com' },
        { name: 'Sarah Wilson', regNo: 'STU004', class: 'CS', email: 'sarah@test.com' },
        { name: 'David Brown', regNo: 'STU005', class: 'CS', email: 'david@test.com' }
      ];

      students = [];
      for (const studentData of testStudents) {
        const student = new Student(studentData);
        await student.save();
        students.push(student);
        console.log('Created student:', student.name);
      }
    }

    // Enroll students in the teacher class
    console.log('Enrolling students in teacher class...');
    for (const student of students) {
      const existingEnrollment = await TeacherClassStudent.findOne({
        teacherClassId: teacherClass._id,
        studentId: student._id
      });

      if (!existingEnrollment) {
        const enrollment = new TeacherClassStudent({
          teacherClassId: teacherClass._id,
          studentId: student._id
        });
        await enrollment.save();
        console.log(`Enrolled ${student.name} in ${teacherClass.className}`);
      } else {
        console.log(`${student.name} is already enrolled`);
      }
    }

    console.log('Test students added successfully!');
    console.log('Teacher Class ID:', teacherClass._id);
    console.log('Students enrolled:', students.length);

  } catch (error) {
    console.error('Error adding test students:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addTestStudents(); 