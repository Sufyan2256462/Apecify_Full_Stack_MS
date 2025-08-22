const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const TeacherClass = require('./models/TeacherClass');
const DownloadableMaterial = require('./models/DownloadableMaterial');
const Assignment = require('./models/Assignment');
const Announcement = require('./models/Announcement');
const ClassEvent = require('./models/ClassEvent');
const Quiz = require('./models/Quiz');

async function addSampleClassData() {
  try {
    console.log('Adding sample class data...\n');

    // Find existing teacher classes
    const teacherClasses = await TeacherClass.find({});
    console.log(`Found ${teacherClasses.length} teacher classes`);

    if (teacherClasses.length === 0) {
      console.log('No teacher classes found. Please add classes through teacher dashboard first.');
      return;
    }

    const teacherClass = teacherClasses[0];
    console.log(`Using teacher class: ${teacherClass.className} - ${teacherClass.subjectName}`);

    // Add sample downloadable materials
    const materials = [
      {
        teacherClassId: teacherClass._id,
        title: 'Introduction to Web Development',
        description: 'Basic concepts and fundamentals of web development',
        fileName: 'intro-web-dev.pdf',
        originalName: 'intro-web-dev.pdf',
        uploadedAt: new Date()
      },
      {
        teacherClassId: teacherClass._id,
        title: 'HTML Basics',
        description: 'Complete guide to HTML structure and elements',
        fileName: 'html-basics.pdf',
        originalName: 'html-basics.pdf',
        uploadedAt: new Date()
      }
    ];

    await DownloadableMaterial.insertMany(materials);
    console.log('✅ Added 2 downloadable materials');

    // Add sample assignments
    const assignments = [
      {
        teacherClassId: teacherClass._id,
        title: 'Create a Personal Website',
        description: 'Build a simple personal website using HTML and CSS',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        fileName: 'assignment-1.pdf',
        originalName: 'assignment-1.pdf'
      },
      {
        teacherClassId: teacherClass._id,
        title: 'JavaScript Fundamentals',
        description: 'Complete exercises on JavaScript basics',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        fileName: 'assignment-2.pdf',
        originalName: 'assignment-2.pdf'
      }
    ];

    await Assignment.insertMany(assignments);
    console.log('✅ Added 2 assignments');

    // Add sample announcements
    const announcements = [
      {
        teacherClassId: teacherClass._id,
        title: 'Welcome to Web Development Class',
        content: 'Welcome everyone! This semester we will learn the fundamentals of web development including HTML, CSS, and JavaScript.',
        postedAt: new Date()
      },
      {
        teacherClassId: teacherClass._id,
        title: 'Assignment Submission Reminder',
        content: 'Please remember to submit your first assignment by the end of this week. Late submissions will not be accepted.',
        postedAt: new Date()
      }
    ];

    await Announcement.insertMany(announcements);
    console.log('✅ Added 2 announcements');

    // Add sample class events
    const events = [
      {
        teacherClassId: teacherClass._id,
        title: 'Midterm Exam',
        description: 'Comprehensive exam covering HTML and CSS topics',
        start: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        color: '#ff4444'
      },
      {
        teacherClassId: teacherClass._id,
        title: 'Project Presentation',
        description: 'Students will present their final projects',
        start: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        end: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
        color: '#44aa44'
      }
    ];

    await ClassEvent.insertMany(events);
    console.log('✅ Added 2 class events');

    // Add sample quizzes
    const quizzes = [
      {
        teacherClassId: teacherClass._id,
        title: 'HTML Quiz',
        description: 'Test your knowledge of HTML fundamentals',
        questions: [
          {
            question: 'What does HTML stand for?',
            options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language'],
            answer: 'HyperText Markup Language'
          },
          {
            question: 'Which tag is used for headings?',
            options: ['p tag', 'h1 to h6 tags', 'div tag'],
            answer: 'h1 to h6 tags'
          }
        ],
        timeMinutes: 30
      },
      {
        teacherClassId: teacherClass._id,
        title: 'CSS Quiz',
        description: 'Test your knowledge of CSS styling',
        questions: [
          {
            question: 'What does CSS stand for?',
            options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets'],
            answer: 'Cascading Style Sheets'
          },
          {
            question: 'How do you change text color?',
            options: ['text-color property', 'color property', 'font-color property'],
            answer: 'color property'
          }
        ],
        timeMinutes: 25
      }
    ];

    await Quiz.insertMany(quizzes);
    console.log('✅ Added 2 quizzes');

    console.log('\n🎉 Sample data added successfully!');
    console.log('You can now test the class dashboard by:');
    console.log('1. Login as student (regNo: 002, password: password123)');
    console.log('2. Go to My Classes');
    console.log('3. Click on a class card to view the detailed dashboard');

  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleClassData(); 