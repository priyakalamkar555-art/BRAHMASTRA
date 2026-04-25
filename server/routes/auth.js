const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

/* POST /api/auth/register */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, phone, password });
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/auth/me */
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

/* PUT /api/auth/profile */
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, bloodGroup, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, bloodGroup, address },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;