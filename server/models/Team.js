const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Client', 'Company'], required: true },
  client: { type: String }, // References the Client name
  task: { type: String }, // Mission scope
  link: { type: String }, // Shared repo/resource
  members: [{ type: String }], // Array of user emails
  progressMsg: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);