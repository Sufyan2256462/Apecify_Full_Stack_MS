const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');

// Get all fees (with student info)
router.get('/', async (req, res) => {
  try {
    const fees = await Fee.find().populate('studentId');
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new fee
router.post('/', async (req, res) => {
  const fee = new Fee(req.body);
  try {
    const newFee = await fee.save();
    res.status(201).json(newFee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a fee (voucher)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a fee
router.delete('/:id', async (req, res) => {
  try {
    await Fee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fee deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fee report (filter by date range)
router.get('/report', async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = {};
    if (from && to) query.date = { $gte: from, $lte: to };
    const fees = await Fee.find(query).populate('studentId');
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get fees by student regNo
router.get('/student/:regNo', async (req, res) => {
  try {
    const fees = await Fee.find({ regNo: req.params.regNo }).populate('studentId');
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Add monthly fee
router.post('/monthly', async (req, res) => {
  try {
    const fee = new Fee(req.body);
    const newFee = await fee.save();
    // Update student's totalFee and remainingFee if provided
    if (req.body.totalFee !== undefined || req.body.remainingFee !== undefined) {
      await Student.findByIdAndUpdate(req.body.studentId, {
        ...(req.body.totalFee !== undefined ? { totalFee: req.body.totalFee } : {}),
        ...(req.body.remainingFee !== undefined ? { remainingFee: req.body.remainingFee } : {}),
      });
    }
    res.status(201).json(newFee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Update fee status
router.put('/:id/status', async (req, res) => {
  try {
    const updated = await Fee.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update totalFee and remainingFee for a student
router.put('/student/:studentId/fees', async (req, res) => {
  try {
    const { totalFee, remainingFee, regNo, name, institute, course, photo } = req.body;
    await Student.findByIdAndUpdate(req.params.studentId, {
      ...(totalFee !== undefined ? { totalFee } : {}),
      ...(remainingFee !== undefined ? { remainingFee } : {}),
      ...(regNo !== undefined ? { regNo } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(institute !== undefined ? { institute } : {}),
      ...(course !== undefined ? { course } : {}),
      ...(photo !== undefined ? { photo } : {}),
    });
    res.json({ message: 'Student details updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 