const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const TeacherClass = require('./models/TeacherClass');
const ClassEvent = require('./models/ClassEvent');

async function addSampleCalendarEvents() {
  try {
    console.log('Adding sample calendar events...\n');

    // Get the first teacher class
    const teacherClass = await TeacherClass.findOne({});
    if (!teacherClass) {
      console.log('❌ No teacher class found. Please create a teacher class first.');
      return;
    }

    console.log(`Found teacher class: ${teacherClass.className} - ${teacherClass.subjectName}`);

    // Sample calendar events
    const events = [
      {
        teacherClassId: teacherClass._id,
        title: 'Midterm Exam',
        start: new Date('2025-08-15T10:00:00'),
        end: new Date('2025-08-15T12:00:00'),
        description: 'Comprehensive exam covering HTML and CSS topics',
        eventType: 'exam',
        duration: 120,
        totalMarks: 50,
        instructions: 'Bring your own laptop. No internet access allowed.',
        color: '#d32f2f',
        createdBy: 'Teacher'
      },
      {
        teacherClassId: teacherClass._id,
        title: 'Project Presentation',
        start: new Date('2025-08-28T14:00:00'),
        end: new Date('2025-08-28T16:00:00'),
        description: 'Students will present their final projects',
        eventType: 'assignment',
        duration: 120,
        totalMarks: 30,
        instructions: 'Prepare a 10-minute presentation. Submit project files before presentation.',
        color: '#7b1fa2',
        createdBy: 'Teacher'
      },
      {
        teacherClassId: teacherClass._id,
        title: 'Class Timetable',
        start: new Date('2025-08-01T09:00:00'),
        end: new Date('2025-08-01T09:00:00'),
        description: 'Updated class schedule for the semester',
        eventType: 'timetable',
        color: '#2e7d32',
        createdBy: 'Teacher'
      },
      {
        teacherClassId: teacherClass._id,
        title: 'Final Exam Datesheet',
        start: new Date('2025-09-10T09:00:00'),
        end: new Date('2025-09-10T09:00:00'),
        description: 'Complete schedule for final examinations',
        eventType: 'datesheet',
        color: '#ed6c02',
        createdBy: 'Teacher'
      },
      {
        teacherClassId: teacherClass._id,
        title: 'Labor Day Holiday',
        start: new Date('2025-09-01T00:00:00'),
        end: new Date('2025-09-01T23:59:59'),
        description: 'University closed for Labor Day',
        eventType: 'holiday',
        color: '#f57c00',
        createdBy: 'Teacher'
      },
      {
        teacherClassId: teacherClass._id,
        title: 'Web Development Workshop',
        start: new Date('2025-08-20T15:00:00'),
        end: new Date('2025-08-20T17:00:00'),
        description: 'Hands-on workshop on modern web development techniques',
        eventType: 'event',
        color: '#1976d2',
        createdBy: 'Teacher'
      }
    ];

    // Clear existing events for this class
    await ClassEvent.deleteMany({ teacherClassId: teacherClass._id });
    console.log('✅ Cleared existing events');

    // Add new events
    await ClassEvent.insertMany(events);
    console.log('✅ Added 6 sample calendar events:');
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} (${event.eventType}) - ${new Date(event.start).toLocaleDateString()}`);
    });

    console.log('\n🎉 Sample calendar events added successfully!');
    console.log(`\nTeacher can now view and manage these events in the Class Calendar tab.`);
    console.log(`Students can view these events in their class dashboard.`);

  } catch (error) {
    console.error('Error adding sample calendar events:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleCalendarEvents(); 