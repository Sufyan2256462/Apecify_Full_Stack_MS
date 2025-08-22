const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const BackpackFile = require('../models/BackpackFile');

// Multer storage config
const backpackStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads/teacher-backpack'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const uploadBackpack = multer({ storage: backpackStorage });

// Upload a file to backpack
router.post('/', uploadBackpack.single('file'), async (req, res) => {
  try {
    const { teacherId, description } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: 'Invalid or missing teacherId' });
    }
    const backpackFile = new BackpackFile({
      teacherId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      description: description || '',
      filePath: req.file.path,
      uploadDate: new Date()
    });
    await backpackFile.save();
    res.status(201).json({ message: 'File uploaded', file: backpackFile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List all backpack files for a teacher
router.get('/', async (req, res) => {
  try {
    const { teacherId } = req.query;
    if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: 'Invalid or missing teacherId' });
    }
    const files = await BackpackFile.find({ teacherId }).sort({ createdAt: -1 });
    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download a backpack file
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid file id' });
    }
    const file = await BackpackFile.findById(id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.download(file.filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a backpack file
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid file id' });
    }
    const file = await BackpackFile.findById(id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    // Delete file from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }
    await file.deleteOne();
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;