const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const TeacherClass = require('./models/TeacherClass');
const TeacherClassStudent = require('./models/TeacherClassStudent');

async function cleanupOrphanedEnrollments() {
  try {
    console.log('Cleaning up orphaned enrollment records...\n');

    // Find all teacher classes
    const teacherClasses = await TeacherClass.find({});
    const teacherClassIds = teacherClasses.map(tc => tc._id.toString());
    
    console.log(`Found ${teacherClasses.length} teacher classes`);
    console.log('Teacher class IDs:', teacherClassIds);

    // Find all enrollments
    const allEnrollments = await TeacherClassStudent.find({});
    console.log(`Found ${allEnrollments.length} total enrollments`);

    // Find orphaned enrollments (where teacherClassId doesn't exist)
    const orphanedEnrollments = allEnrollments.filter(enrollment => 
      !teacherClassIds.includes(enrollment.teacherClassId.toString())
    );

    console.log(`Found ${orphanedEnrollments.length} orphaned enrollments:`);
    orphanedEnrollments.forEach((enrollment, index) => {
      console.log(`${index + 1}. ID: ${enrollment._id}, TeacherClassId: ${enrollment.teacherClassId}, StudentId: ${enrollment.studentId}`);
    });

    if (orphanedEnrollments.length > 0) {
      // Delete orphaned enrollments
      const result = await TeacherClassStudent.deleteMany({
        _id: { $in: orphanedEnrollments.map(e => e._id) }
      });
      
      console.log(`\n✅ Deleted ${result.deletedCount} orphaned enrollment records`);
    } else {
      console.log('\n✅ No orphaned enrollments found');
    }

    // Show remaining enrollments
    const remainingEnrollments = await TeacherClassStudent.find({});
    console.log(`\nRemaining enrollments: ${remainingEnrollments.length}`);

  } catch (error) {
    console.error('Error cleaning up enrollments:', error);
  } finally {
    mongoose.connection.close();
  }
}

cleanupOrphanedEnrollments(); 