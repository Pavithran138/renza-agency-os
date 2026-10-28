const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  assignedTo: { type: String },
  status: { type: String, default: 'Pending' },
  
  // NEW: Explicitly define the chat array structure for real-time messaging
  chat: [{
    sender: String,
    text: String,
    timestamp: String
  }]
}, { strict: false, timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);