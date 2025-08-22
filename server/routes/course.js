const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new course
router.post('/', async (req, res) => {
  const name = req.body.name || req.body.title;
  const course = new Course({
    code: req.body.code,
    name,
    title: req.body.title,
    units: req.body.units,
    semester: req.body.semester,
    description: req.body.description,
  });
  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a course
router.put('/:id', async (req, res) => {
  try {
    const name = req.body.name || req.body.title;
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      {
        code: req.body.code,
        name,
        title: req.body.title,
        units: req.body.units,
        semester: req.body.semester,
        description: req.body.description,
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a course
router.delete('/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 