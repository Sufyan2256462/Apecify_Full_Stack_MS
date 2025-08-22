const express = require('express');
const router = express.Router();
const SchoolYear = require('../models/SchoolYear');

// Create
router.post('/', async (req, res) => {
  try {
    const year = new SchoolYear(req.body);
    await year.save();
    res.status(201).json(year);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all (with search, pagination, sorting)
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, sort = 'year', order = 'asc' } = req.query;
    const query = search ? { year: { $regex: search, $options: 'i' } } : {};
    const total = await SchoolYear.countDocuments(query);
    const years = await SchoolYear.find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ years, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const year = await SchoolYear.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(year);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await SchoolYear.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk delete
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    await SchoolYear.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 