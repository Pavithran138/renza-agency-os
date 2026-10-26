const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Will be hashed via bcrypt
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);