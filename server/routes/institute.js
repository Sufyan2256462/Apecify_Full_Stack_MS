const express = require('express');
const router = express.Router();
const Institute = require('../models/Institute');

// Get all institutes
router.get('/', async (req, res) => {
  try {
    const institutes = await Institute.find();
    res.json(institutes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new institute
router.post('/', async (req, res) => {
  const institute = new Institute({
    name: req.body.name,
  });
  try {
    const newInstitute = await institute.save();
    res.status(201).json(newInstitute);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an institute
router.put('/:id', async (req, res) => {
  try {
    const updated = await Institute.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an institute
router.delete('/:id', async (req, res) => {
  try {
    await Institute.findByIdAndDelete(req.params.id);
    res.json({ message: 'Institute deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 