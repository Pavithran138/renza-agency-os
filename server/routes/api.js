const express = require('express');
const router = express.Router();

// Import Models
const User = require('../models/User');
const Team = require('../models/Team');
const Client = require('../models/Client');
const Task = require('../models/Task');
const File = require('../models/File');
const Chat = require('../models/Chat');

// ==========================================
// USER ROUTES
// ==========================================
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// TEAM ROUTES
// ==========================================
router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/teams', async (req, res) => {
  try {
    const newTeam = new Team(req.body);
    const savedTeam = await newTeam.save();
    res.json(savedTeam);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/teams/:id', async (req, res) => {
  try {
    // FIXED: Removed { new: true }, replaced with { returnDocument: 'after' }
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { returnDocument: 'after' }
    );
    res.json(updatedTeam);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/teams/:id', async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// CLIENT ROUTES
// ==========================================
router.get('/clients', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/clients', async (req, res) => {
  try {
    const newClient = new Client(req.body);
    const savedClient = await newClient.save();
    res.json(savedClient);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// TASK ROUTES (CHAT SYNC FIX)
// ==========================================
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    // FIXED: Added $set to save chat messages, replaced { new: true }
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { returnDocument: 'after' }
    );
    res.json(updatedTask);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// FILE ROUTES
// ==========================================
router.get('/files', async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/files', async (req, res) => {
  try {
    const newFile = new File(req.body);
    const savedFile = await newFile.save();
    res.json(savedFile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/files/:id', async (req, res) => {
  try {
    await File.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// CHAT ROUTES
// ==========================================
router.get('/chats', async (req, res) => {
  try {
    const chats = await Chat.find();
    res.json(chats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/chats', async (req, res) => {
  try {
    const newChat = new Chat(req.body);
    const savedChat = await newChat.save();
    res.json(savedChat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;