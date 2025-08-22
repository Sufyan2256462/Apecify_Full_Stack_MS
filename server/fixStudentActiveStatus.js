const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Student = require('./models/Student');

async function fixStudentActiveStatus() {
  try {
    console.log('Fixing student active status...\n');

    // Find all students
    const students = await Student.find({});
    console.log(`Found ${students.length} students in database:`);
    
    students.forEach((student, index) => {
      console.log(`${index + 1}. Name: ${student.name}, RegNo: ${student.regNo}, Class: ${student.class}, Active: ${student.isActive}`);
    });

    if (students.length === 0) {
      console.log('\nNo students found.');
      return;
    }

    // Update all students to be active
    const result = await Student.updateMany({}, { isActive: true });
    
    console.log(`\n✅ Updated ${result.modifiedCount} students to active status`);
    
    // Show updated students
    const updatedStudents = await Student.find({});
    console.log('\nUpdated students:');
    updatedStudents.forEach((student, index) => {
      console.log(`${index + 1}. Name: ${student.name}, RegNo: ${student.regNo}, Class: ${student.class}, Active: ${student.isActive}`);
    });

    console.log('\n✅ All students are now active and can login!');

  } catch (error) {
    console.error('Error fixing student active status:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixStudentActiveStatus(); 