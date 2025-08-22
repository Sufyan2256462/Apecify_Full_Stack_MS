const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Student = require('./models/Student');
const TeacherClass = require('./models/TeacherClass');
const TeacherClassStudent = require('./models/TeacherClassStudent');
const Class = require('./models/Class');
const Course = require('./models/Course');

async function debugStudentClasses() {
  try {
    console.log('Debugging student classes issue...\n');

    // Find all students
    const students = await Student.find({});
    console.log(`Found ${students.length} students:`);
    students.forEach((student, index) => {
      console.log(`${index + 1}. ID: ${student._id}, Name: ${student.name}, RegNo: ${student.regNo}`);
    });

    // Find all teacher classes
    const teacherClasses = await TeacherClass.find({});
    console.log(`\nFound ${teacherClasses.length} teacher classes:`);
    teacherClasses.forEach((tc, index) => {
      console.log(`${index + 1}. ID: ${tc._id}, Class: ${tc.className}, Subject: ${tc.subjectName}, Teacher: ${tc.teacherId}`);
    });

    // Find all teacher class student enrollments
    const enrollments = await TeacherClassStudent.find({});
    console.log(`\nFound ${enrollments.length} student enrollments:`);
    enrollments.forEach((enrollment, index) => {
      console.log(`${index + 1}. TeacherClassId: ${enrollment.teacherClassId}, StudentId: ${enrollment.studentId}`);
    });

    // Test with first student
    if (students.length > 0) {
      const testStudent = students[0];
      console.log(`\nTesting with student: ${testStudent.name} (ID: ${testStudent._id})`);
      
      // Check if student has any enrollments
      const studentEnrollments = await TeacherClassStudent.find({ studentId: testStudent._id });
      console.log(`Student has ${studentEnrollments.length} enrollments`);
      
      if (studentEnrollments.length === 0) {
        console.log('\n❌ No enrollments found for this student.');
        console.log('This means teachers haven\'t added this student to any classes yet.');
        console.log('\nTo test the functionality, you need to:');
        console.log('1. Go to teacher dashboard');
        console.log('2. Add this student to a class');
        console.log('3. Then the student will see classes in their dashboard');
      } else {
        console.log('\n✅ Student has enrollments. Testing population...');
        
        try {
          const populatedEnrollments = await TeacherClassStudent.find({ studentId: testStudent._id })
            .populate({
              path: 'teacherClassId',
              populate: [
                { path: 'classId', model: 'Class' },
                { path: 'subjectId', model: 'Course' }
              ]
            });
          
          console.log('Population successful:', populatedEnrollments.length, 'enrollments');
        } catch (populateError) {
          console.error('Population error:', populateError.message);
        }
      }
    }

  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugStudentClasses(); 