const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  
  // Who sent it
  senderName: { type: String, default: 'Admin' },
  senderEmail: { type: String },
  isAdminShare: { type: Boolean, default: true }, 
  
  // Who receives it (For Admin Shares)
  type: { type: String, enum: ['All', 'Team', 'Individual'] },
  target: { type: String }, 

  // Context (For Member Submissions)
  contextType: { type: String }, // Team or Individual
  contextName: { type: String },
  projectType: { type: String } // Client or Company
}, { timestamps: true });

module.exports = mongoose.model('File', FileSchema);