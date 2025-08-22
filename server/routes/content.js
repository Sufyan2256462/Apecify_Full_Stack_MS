const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const multer = require('multer');
const path = require('path');

// Multer setup for content uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = 'uploads/content';
    if (file.mimetype.startsWith('image/')) dest = 'uploads/content/images';
    else if (file.mimetype.startsWith('video/')) dest = 'uploads/content/videos';
    else dest = 'uploads/content/attachments';
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Create content with file upload
router.post('/', upload.fields([
  { name: 'attachments', maxCount: 5 },
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]), async (req, res) => {
  try {
    const { title, content, categories } = req.body;
    const attachments = req.files['attachments'] ? req.files['attachments'].map(f => `/uploads/content/attachments/${f.filename}`) : [];
    const images = req.files['images'] ? req.files['images'].map(f => `/uploads/content/images/${f.filename}`) : [];
    const videos = req.files['videos'] ? req.files['videos'].map(f => `/uploads/content/videos/${f.filename}`) : [];
    const contentDoc = new Content({
      title,
      content,
      categories: categories ? (Array.isArray(categories) ? categories : [categories]) : [],
      attachments,
      images,
      videos
    });
    await contentDoc.save();
    res.status(201).json(contentDoc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all contents
router.get('/', async (req, res) => {
  try {
    const contents = await Content.find().sort({ createdAt: -1 });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one content
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ message: 'Not found' });
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update content with file upload
router.put('/:id', upload.fields([
  { name: 'attachments', maxCount: 5 },
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]), async (req, res) => {
  try {
    const { title, content, categories } = req.body;
    const attachments = req.files['attachments'] ? req.files['attachments'].map(f => `/uploads/content/attachments/${f.filename}`) : [];
    const images = req.files['images'] ? req.files['images'].map(f => `/uploads/content/images/${f.filename}`) : [];
    const videos = req.files['videos'] ? req.files['videos'].map(f => `/uploads/content/videos/${f.filename}`) : [];
    const update = {
      title,
      content,
      categories: categories ? (Array.isArray(categories) ? categories : [categories]) : [],
    };
    if (attachments.length) update.attachments = attachments;
    if (images.length) update.images = images;
    if (videos.length) update.videos = videos;
    const updated = await Content.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete content
router.delete('/:id', async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Image upload endpoint for CKEditor
router.post('/upload-image', upload.single('upload'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the full image URL for CKEditor
  const fullUrl = req.protocol + '://' + req.get('host') + `/uploads/content/images/${req.file.filename}`;
  res.status(201).json({ url: fullUrl });
});

module.exports = router; 