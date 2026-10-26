const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  project: { type: String, required: true },
  status: { type: String, default: 'Active' }
}, { strict: false, timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);