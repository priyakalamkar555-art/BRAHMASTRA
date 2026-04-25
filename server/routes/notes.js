const express = require('express');
const multer  = require('multer');
const path    = require('path');
const { Note } = require('../models/Models');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer storage – audio files saved to uploads/voice/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../uploads/voice')),
  filename:    (_req, file, cb) => cb(null, `voice_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    if (/wav|mp3|ogg|webm|m4a/i.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Only audio files are allowed'));
  }
});

/* GET /api/notes?type=voice|text */
router.get('/', protect, async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.type) filter.type = req.query.type;
    const notes = await Note.find(filter).sort('-createdAt');
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/notes/text */
router.post('/text', protect, async (req, res) => {
  try {
    const { content, title } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });
    const note = await Note.create({ user: req.user._id, type: 'text', content, title: title || 'Text Note' });
    res.status(201).json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/notes/voice  (multipart/form-data, field name: audio) */
router.post('/voice', protect, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Audio file required' });
    const note = await Note.create({
      user:     req.user._id,
      type:     'voice',
      content:  `/uploads/voice/${req.file.filename}`,
      duration: req.body.duration || '0:00',
      title:    req.body.title   || 'Voice Note'
    });
    res.status(201).json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* DELETE /api/notes/:id */
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;