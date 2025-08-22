const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new student
router.post('/', upload.single('photo'), async (req, res) => {
  const student = new Student({
    ...req.body,
    photo: req.file ? req.file.filename : '',
  });
  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a student
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.photo = req.file.filename;
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a student
router.delete('/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset password
router.put('/:id/reset-password', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { password: req.body.password },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Change registration status
router.put('/:id/status', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { registrationStatus: req.body.registrationStatus },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Bulk register/unregister
router.put('/bulk/status', async (req, res) => {
  try {
    const { ids, registrationStatus } = req.body;
    await Student.updateMany(
      { _id: { $in: ids } },
      { registrationStatus }
    );
    res.json({ message: 'Status updated for selected students' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get deactivated students
router.get('/deactivated', async (req, res) => {
  try {
    const students = await Student.find({ registrationStatus: 'Deactivated' });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Activate student
router.put('/:id/activate', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { registrationStatus: 'Registered' },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 