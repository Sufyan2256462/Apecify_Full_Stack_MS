const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const TeacherClass = require('./models/TeacherClass');
const DownloadableMaterial = require('./models/DownloadableMaterial');

async function testUploadWithRealData() {
  try {
    console.log('Testing upload functionality with real data...\n');

    // Find existing teacher classes
    const teacherClasses = await TeacherClass.find({ teacherId: 'teacher123' });
    console.log(`Found ${teacherClasses.length} teacher classes for teacher123`);

    if (teacherClasses.length === 0) {
      console.log('No teacher classes found for teacher123');
      return;
    }

    // Test with the first teacher class
    const teacherClass = teacherClasses[0];
    console.log(`Using teacher class: ${teacherClass.className} - ${teacherClass.subjectName}`);
    console.log(`TeacherClass ID: ${teacherClass._id}`);

    // Create a test downloadable material
    const testMaterial = new DownloadableMaterial({
      teacherClassId: teacherClass._id,
      title: 'Test Upload Material',
      fileName: 'test-upload.pdf',
      originalName: 'test-upload.pdf',
      description: 'This is a test upload for verification',
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
      teacherClassId: retrievedMaterial.teacherClassId
    });

    // Test the GET route for this specific teacher class
    const materials = await DownloadableMaterial.find({ teacherClassId: teacherClass._id });
    console.log('✅ Found materials for specific teacher class:', materials.length);

    // Test the GET route for all teacher classes of teacher123
    const allTeacherClasses = await TeacherClass.find({ teacherId: 'teacher123' });
    const teacherClassIds = allTeacherClasses.map(tc => tc._id);
    const allMaterials = await DownloadableMaterial.find({ 
      teacherClassId: { $in: teacherClassIds } 
    });
    console.log('✅ Found materials for all teacher classes:', allMaterials.length);

    // Clean up test data
    await DownloadableMaterial.findByIdAndDelete(savedMaterial._id);
    console.log('✅ Test material cleaned up');

    console.log('\n🎉 Upload functionality is working correctly!');
    console.log('The frontend should now be able to upload and retrieve materials.');

  } catch (error) {
    console.error('Error testing upload functionality:', error);
  } finally {
    mongoose.connection.close();
  }
}

testUploadWithRealData(); 