const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  teacherClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherClass',
    required: true
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  postedBy: { type: String },
});

module.exports = mongoose.model('Announcement', AnnouncementSchema); 