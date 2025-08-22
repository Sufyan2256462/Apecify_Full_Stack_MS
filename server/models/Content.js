const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  categories: [{ type: String }],
  attachments: [{ type: String }], // file paths
  images: [{ type: String }], // image file paths
  videos: [{ type: String }], // video file paths
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema); 