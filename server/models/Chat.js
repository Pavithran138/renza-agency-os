const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  mode: { type: String, enum: ['Common', 'Team', 'Individual'], required: true }, // For Global Chat
  target: { type: String }, // 'all', Team Name, or Email
  category: { type: String }, // Used specifically for Workspace Hub Chats (Task Name / Team Name)
  sender: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);