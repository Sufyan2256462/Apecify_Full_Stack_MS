const express = require('express');
const router = express.Router();
const AdminUser = require('../models/AdminUser');

// Get all admin users
router.get('/', async (req, res) => {
  try {
    const users = await AdminUser.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new admin user
router.post('/', async (req, res) => {
  const user = new AdminUser({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    password: req.body.password,
  });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an admin user
router.put('/:id', async (req, res) => {
  try {
    const updated = await AdminUser.findByIdAndUpdate(
      req.params.id,
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        password: req.body.password,
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an admin user
router.delete('/:id', async (req, res) => {
  try {
    await AdminUser.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin user deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await AdminUser.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // In a real app, return a JWT or session
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 