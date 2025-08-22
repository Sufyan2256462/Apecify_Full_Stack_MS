const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/events');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Create event
router.post('/', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, start, end, language, instruction, country } = req.body;
    const image = req.files['image'] ? `/uploads/events/${req.files['image'][0].filename}` : '';
    const video = req.files['video'] ? `/uploads/events/${req.files['video'][0].filename}` : '';
    const event = new Event({ title, start, end, image, video, language, instruction, country });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all events (with optional search, date range, pagination)
router.get('/', async (req, res) => {
  try {
    const { search = '', startDate, endDate, page = 1, limit = 100 } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (startDate && endDate) query.start = { $gte: new Date(startDate), $lte: new Date(endDate) };
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ start: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ events, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update event
router.put('/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, start, end, language, instruction, country } = req.body;
    const update = { title, start, end, language, instruction, country };
    if (req.files['image']) update.image = `/uploads/events/${req.files['image'][0].filename}`;
    if (req.files['video']) update.video = `/uploads/events/${req.files['video'][0].filename}`;
    const event = await Event.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk delete
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    await Event.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 