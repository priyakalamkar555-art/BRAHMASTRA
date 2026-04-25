const express = require('express');
const { Contact } = require('../models/Models');
const { protect } = require('../middleware/auth');

const router = express.Router();

/* GET /api/contacts */
router.get('/', protect, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/contacts */
router.post('/', protect, async (req, res) => {
  try {
    const { name, phone, relation, email } = req.body;
    if (!name || !phone)
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    const contact = await Contact.create({ user: req.user._id, name, phone, relation, email });
    res.status(201).json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* PUT /api/contacts/:id */
router.put('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* DELETE /api/contacts/:id */
router.delete('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;