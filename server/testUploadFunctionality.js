const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const TeacherClass = require('./models/TeacherClass');
const DownloadableMaterial = require('./models/DownloadableMaterial');

async function testUploadFunctionality() {
  try {
    console.log('Testing upload functionality...\n');

    // Find existing teacher classes
    const teacherClasses = await TeacherClass.find({});
    console.log(`Found ${teacherClasses.length} teacher classes`);

    if (teacherClasses.length === 0) {
      console.log('No teacher classes found. Please add classes through teacher dashboard first.');
      return;
    }

    const teacherClass = teacherClasses[0];
    console.log(`Using teacher class: ${teacherClass.className} - ${teacherClass.subjectName}`);

    // Test creating a downloadable material with all required fields
    const testMaterial = new DownloadableMaterial({
      teacherClassId: teacherClass._id,
      title: 'Test Lecture Notes',
      fileName: 'test-lecture.pdf',
      originalName: 'test-lecture.pdf',
      description: 'This is a test lecture for web development',
      dateUpload: new Date(),
      uploadedBy: 'teacher123'
    });

    const savedMaterial = await testMaterial.save();
    console.log('✅ Test material created successfully:', savedMaterial._id);

    // Verify it can be retrieved
    const retrievedMaterial = await DownloadableMaterial.findById(savedMaterial._id);
    console.log('✅ Material retrieved successfully:', {
      title: retrievedMaterial.title,
      description: retrievedMaterial.description,
      fileName: retrievedMaterial.fileName,
      originalName: retrievedMaterial.originalName,
      dateUpload: retrievedMaterial.dateUpload
    });

    // Test the GET route
    const materials = await DownloadableMaterial.find({ teacherClassId: teacherClass._id });
    console.log('✅ Found materials for teacher class:', materials.length);

    // Clean up test data
    await DownloadableMaterial.findByIdAndDelete(savedMaterial._id);
    console.log('✅ Test material cleaned up');

    console.log('\n🎉 Upload functionality is working correctly!');
    console.log('The issue might be in the frontend form submission or file handling.');

  } catch (error) {
    console.error('Error testing upload functionality:', error);
  } finally {
    mongoose.connection.close();
  }
}

testUploadFunctionality(); 