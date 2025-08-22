const mongoose = require('mongoose');

const DownloadableMaterialSchema = new mongoose.Schema({
  teacherClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherClass',
    required: true
  },
  title: { type: String, required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  description: { type: String },
  uploadedBy: { type: String },
  dateUpload: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DownloadableMaterial', DownloadableMaterialSchema); 