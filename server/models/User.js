const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  phone:      { type: String, required: true },
  password:   { type: String, required: true, minlength: 6 },
  avatar:     { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  address:    { type: String, default: '' },
  isLocationSharing: { type: Boolean, default: false },
  lastLocation: {
    latitude:  { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    updatedAt: { type: Date,   default: Date.now }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare plain password with hash
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);