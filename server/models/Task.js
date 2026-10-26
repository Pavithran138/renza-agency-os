const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  assignedTo: { type: String },
  status: { type: String, default: 'Pending' }
}, { strict: false, timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);