const mongoose = require('mongoose');
const TeacherClass = require('./models/TeacherClass');
const Student = require('./models/Student');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_dashboard';

async function fixTeacherClassNames() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const student = await Student.findOne();
  if (!student) {
    console.log('No students found.');
    return mongoose.disconnect();
  }
  const newClassName = student.class;
  const teacherClasses = await TeacherClass.find();
  let updated = 0;
  for (const tclass of teacherClasses) {
    if (tclass.className !== newClassName) {
      tclass.className = newClassName;
      await tclass.save();
      updated++;
      console.log(`Updated teacher class ${tclass._id} to className '${newClassName}'`);
    }
  }
  console.log(`Updated ${updated} teacher classes.`);
  mongoose.disconnect();
}

fixTeacherClassNames(); 