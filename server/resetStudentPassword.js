const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Student = require('./models/Student');

async function resetStudentPassword() {
  try {
    console.log('Resetting student password for testing...\n');

    // Find all students
    const students = await Student.find({});
    console.log(`Found ${students.length} students in database:`);
    
    students.forEach((student, index) => {
      console.log(`${index + 1}. Name: ${student.name}, RegNo: ${student.regNo}, Class: ${student.class}`);
    });

    if (students.length === 0) {
      console.log('\nNo students found. Please add students through the admin panel first.');
      return;
    }

    // Reset password for the first student
    const testStudent = students[0];
    const newPassword = 'password123';
    
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the student's password
    await Student.findByIdAndUpdate(testStudent._id, {
      password: hashedPassword,
      isActive: true
    });

    console.log(`\n✅ Password reset successful for student: ${testStudent.name}`);
    console.log(`Registration Number: ${testStudent.regNo}`);
    console.log(`New Password: ${newPassword}`);
    console.log(`\nYou can now test the login at: http://localhost:3000/student`);

  } catch (error) {
    console.error('Error resetting student password:', error);
  } finally {
    mongoose.connection.close();
  }
}

resetStudentPassword(); 