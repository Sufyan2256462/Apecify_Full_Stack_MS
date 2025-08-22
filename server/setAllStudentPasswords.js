const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Student = require('./models/Student');

async function setAllStudentPasswords() {
  try {
    console.log('Setting passwords for all students...\n');

    // Find all students
    const students = await Student.find({});
    console.log(`Found ${students.length} students in database:`);
    
    const saltRounds = 10;
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
    
    // Update all students with the same password
    for (const student of students) {
      await Student.findByIdAndUpdate(student._id, {
        password: hashedPassword,
        registrationStatus: 'Registered'
      });
      
      console.log(`✅ Set password for: ${student.name} (RegNo: ${student.regNo})`);
    }

    console.log(`\n✅ All ${students.length} students now have the password: ${defaultPassword}`);
    console.log(`\nStudents can now login with their registration numbers:`);
    students.forEach((student, index) => {
      console.log(`${index + 1}. RegNo: ${student.regNo}, Name: ${student.name}, Class: ${student.class}`);
    });
    console.log(`\nPassword for all students: ${defaultPassword}`);
    console.log(`\nTest login at: http://localhost:3000/student`);

  } catch (error) {
    console.error('Error setting student passwords:', error);
  } finally {
    mongoose.connection.close();
  }
}

setAllStudentPasswords(); 