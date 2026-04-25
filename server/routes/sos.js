const express = require('express');
const twilio  = require('twilio');
const { SOSLog, Contact } = require('../models/Models');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

/* POST /api/sos/trigger */
router.post('/trigger', protect, async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const user = req.user;
    const contacts = await Contact.find({ user: user._id });

    if (!contacts.length)
      return res.status(400).json({ success: false, message: 'No emergency contacts added yet' });

    const mapsLink  = `https://maps.google.com/?q=${latitude},${longitude}`;
    const sosMsg    = `🚨 EMERGENCY SOS from ${user.name}!\n📍 Location: ${address || 'Unknown'}\n🗺️ Map: ${mapsLink}\n📞 Please call them immediately!`;

    const notified = [];
    const smsResults = [];

    for (const c of contacts) {
      notified.push(c.phone);
      if (twilioClient) {
        try {
          const msg = await twilioClient.messages.create({
            body: sosMsg,
            from: process.env.TWILIO_PHONE_NUMBER,
            to:   c.phone
          });
          smsResults.push({ phone: c.phone, status: 'sent', sid: msg.sid });
        } catch (e) {
          smsResults.push({ phone: c.phone, status: 'failed', error: e.message });
        }
      }
    }

    const sosLog = await SOSLog.create({
      user: user._id, latitude, longitude,
      address: address || '',
      contactsNotified: notified,
      smsSent: !!twilioClient,
      status: 'active'
    });

    await User.findByIdAndUpdate(user._id, {
      'lastLocation.latitude':  latitude,
      'lastLocation.longitude': longitude,
      'lastLocation.updatedAt': new Date()
    });

    res.json({
      success: true,
      message: `SOS sent to ${contacts.length} contacts!`,
      sosLogId: sosLog._id,
      smsResults,
      twilioEnabled: !!twilioClient
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/sos/resolve/:id */
router.post('/resolve/:id', protect, async (req, res) => {
  try {
    const log = await SOSLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );
    if (!log) return res.status(404).json({ success: false, message: 'SOS log not found' });
    res.json({ success: true, message: 'SOS resolved', log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/sos/history */
router.get('/history', protect, async (req, res) => {
  try {
    const logs = await SOSLog.find({ user: req.user._id }).sort('-createdAt').limit(20);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;