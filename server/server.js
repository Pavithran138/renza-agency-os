const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

const User = require('./models/User');
const Team = require('./models/Team');
const Client = require('./models/Client');
const Task = require('./models/Task');
const File = require('./models/File');
const Chat = require('./models/Chat');

// ==========================================
// GET ROUTES 
// ==========================================
app.get('/api/users', async (req, res) => { try { res.json(await User.find()); } catch(e) { res.status(500).json({error: e.message}); } });
app.get('/api/teams', async (req, res) => { try { res.json(await Team.find()); } catch(e) { res.status(500).json({error: e.message}); } });
app.get('/api/clients', async (req, res) => { try { res.json(await Client.find()); } catch(e) { res.status(500).json({error: e.message}); } });
app.get('/api/tasks', async (req, res) => { try { res.json(await Task.find()); } catch(e) { res.status(500).json({error: e.message}); } });
app.get('/api/files', async (req, res) => { try { res.json(await File.find()); } catch(e) { res.status(500).json({error: e.message}); } });
app.get('/api/chats', async (req, res) => { try { res.json(await Chat.find()); } catch(e) { res.status(500).json({error: e.message}); } });

// ==========================================
// POST ROUTES 
// ==========================================
app.post('/api/users', async (req, res) => { try { res.status(201).json(await User.create(req.body)); } catch(e) { res.status(400).json({error: e.message}); } });
app.post('/api/teams', async (req, res) => { try { res.status(201).json(await Team.create(req.body)); } catch(e) { res.status(400).json({error: e.message}); } });
app.post('/api/clients', async (req, res) => { try { res.status(201).json(await Client.create(req.body)); } catch(e) { res.status(400).json({error: e.message}); } });
app.post('/api/tasks', async (req, res) => { try { res.status(201).json(await Task.create(req.body)); } catch(e) { res.status(400).json({error: e.message}); } });
app.post('/api/files', async (req, res) => { try { res.status(201).json(await File.create(req.body)); } catch(e) { res.status(400).json({error: e.message}); } });
app.post('/api/chats', async (req, res) => { try { res.status(201).json(await Chat.create(req.body)); } catch(e) { res.status(400).json({error: e.message}); } });

// ==========================================
// PUT & DELETE ROUTES
// ==========================================
app.put('/api/tasks/:id', async (req, res) => { try { res.json(await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch(e) { res.status(400).json({error: e.message}); } });
app.put('/api/teams/:id', async (req, res) => { try { res.json(await Team.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch(e) { res.status(400).json({error: e.message}); } });

app.delete('/api/tasks/:id', async (req, res) => { try { await Task.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch(e) { res.status(400).json({error: e.message}); } });
app.delete('/api/clients/:id', async (req, res) => { try { await Client.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch(e) { res.status(400).json({error: e.message}); } });
app.delete('/api/users/:id', async (req, res) => { try { await User.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch(e) { res.status(400).json({error: e.message}); } });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));