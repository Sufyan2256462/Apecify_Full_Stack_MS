const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  image: { type: String },
  video: { type: String },
  language: { type: String },
  instruction: { type: String },
  country: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema); 