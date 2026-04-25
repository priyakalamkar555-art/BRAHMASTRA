const mongoose = require('mongoose');

/* ── Emergency Contact ── */
const contactSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  phone:     { type: String, required: true },
  relation:  { type: String, default: 'Contact' },
  email:     { type: String, default: '' },
  isAppUser: { type: Boolean, default: false },
  appUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

/* ── SOS Log ── */
const sosLogSchema = new mongoose.Schema({
  user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude:          { type: Number, required: true },
  longitude:         { type: Number, required: true },
  address:           { type: String, default: '' },
  contactsNotified:  [{ type: String }],
  smsSent:           { type: Boolean, default: false },
  resolvedAt:        { type: Date,    default: null },
  status:            { type: String,  enum: ['active','resolved'], default: 'active' }
}, { timestamps: true });

/* ── Note (voice + text) ── */
const noteSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:     { type: String, enum: ['voice','text'], required: true },
  content:  { type: String, default: '' },   // text content OR audio file path
  duration: { type: String, default: '' },   // voice notes only
  title:    { type: String, default: 'Untitled Note' }
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);
const SOSLog  = mongoose.model('SOSLog',  sosLogSchema);
const Note    = mongoose.model('Note',    noteSchema);

module.exports = { Contact, SOSLog, Note };