const mongoose = require('mongoose');
const Student = require('./models/Student');
const Class = require('./models/Class');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard';

async function fixStudentClassNames() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const classes = await Class.find();
  const classNames = classes.map(cls => cls.name);

  const students = await Student.find();
  console.log('--- All students and their class fields ---');
  for (const student of students) {
    console.log(`Student: ${student.name || student.firstname || ''} (${student.regNo || ''}), class: '${student.class}'`);
  }
  console.log('--- All class names in Class collection ---');
  for (const name of classNames) {
    console.log(`Class: '${name}'`);
  }
  let updated = 0;
  for (const student of students) {
    // Try to match the class name (case-insensitive)
    const match = classNames.find(name => name.toLowerCase() === (student.class || '').toLowerCase());
    if (match && student.class !== match) {
      student.class = match;
      await student.save();
      updated++;
      console.log(`Updated student ${student.name || student.firstname || ''} (${student.regNo || ''}) to class '${match}'`);
    }
  }
  console.log(`Updated ${updated} students.`);
  mongoose.disconnect();
}

fixStudentClassNames(); 