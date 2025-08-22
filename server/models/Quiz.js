const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  teacherClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherClass',
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  questions: [
    {
      question: { type: String, required: true },
      questionType: { type: String, enum: ['mcq', 'text'], default: 'mcq' },
      options: [String],
      answer: { type: String, required: true },
      points: { type: Number, default: 1 }
    }
  ],
  timeMinutes: { type: Number },
  date: { type: Date, default: Date.now },
  createdBy: { type: String },
});

module.exports = mongoose.model('Quiz', QuizSchema); 