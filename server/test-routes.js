const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  // Test models
  const TeacherClass = require('./models/TeacherClass');
  const Announcement = require('./models/Announcement');
  const Assignment = require('./models/Assignment');
  const DownloadableMaterial = require('./models/DownloadableMaterial');
  
  try {
    // Test TeacherClass
    console.log('Testing TeacherClass model...');
    const teacherClasses = await TeacherClass.find().limit(1);
    console.log('TeacherClass count:', teacherClasses.length);
    
    // Test Announcement
    console.log('Testing Announcement model...');
    const announcements = await Announcement.find().limit(1);
    console.log('Announcement count:', announcements.length);
    
    // Test Assignment
    console.log('Testing Assignment model...');
    const assignments = await Assignment.find().limit(1);
    console.log('Assignment count:', assignments.length);
    
    // Test DownloadableMaterial
    console.log('Testing DownloadableMaterial model...');
    const materials = await DownloadableMaterial.find().limit(1);
    console.log('DownloadableMaterial count:', materials.length);
    
    console.log('All models working correctly!');
  } catch (error) {
    console.error('Error testing models:', error);
  } finally {
    mongoose.connection.close();
  }
}); 