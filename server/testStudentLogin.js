const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Student = require('./models/Student');

async function testStudentLogin() {
  try {
    console.log('Testing student login functionality...\n');

    // Find all students
    const students = await Student.find({});
    console.log(`Found ${students.length} students in database:`);
    
    students.forEach((student, index) => {
      console.log(`${index + 1}. Name: ${student.name}, RegNo: ${student.regNo}, Class: ${student.class}, Status: ${student.registrationStatus}`);
    });

    if (students.length === 0) {
      console.log('\nNo students found. Please add students through the admin panel first.');
      return;
    }

    // Test with the first student
    const testStudent = students[0];
    console.log(`\nTesting login with student: ${testStudent.name} (RegNo: ${testStudent.regNo})`);

    // Test password (using the new password we set)
    const testPassword = 'password123';
    const isPasswordValid = await bcrypt.compare(testPassword, testStudent.password);
    
    console.log(`Password validation result: ${isPasswordValid ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Registration status: ${testStudent.registrationStatus}`);
    
    if (isPasswordValid && testStudent.registrationStatus !== 'Deactivated') {
      console.log(`\n✅ Login credentials for testing:`);
      console.log(`Registration Number: ${testStudent.regNo}`);
      console.log(`Password: ${testPassword}`);
      console.log(`\nYou can now test the login at: http://localhost:3000/student`);
    } else {
      if (testStudent.registrationStatus === 'Deactivated') {
        console.log('\n❌ Student is deactivated. Cannot login.');
      } else {
        console.log('\n❌ Password validation failed. The student password might be different.');
        console.log('You may need to reset the password or check the admin panel for the correct password.');
      }
    }

  } catch (error) {
    console.error('Error testing student login:', error);
  } finally {
    mongoose.connection.close();
  }
}

testStudentLogin(); 