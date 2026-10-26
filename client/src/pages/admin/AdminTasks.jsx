import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  
  const [name, setName] = useState('');
  const [type, setType] = useState('Client');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, teamsRes] = await Promise.all([api.get('/tasks'), api.get('/teams')]);
      setTasks(tasksRes.data);
      setTeams(teamsRes.data);
      if (teamsRes.data.length > 0 && !assignedTo) {
        setAssignedTo(teamsRes.data[0].name);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const finalTeam = assignedTo || (teams.length > 0 ? teams[0].name : 'Unassigned');
    
    try {
      await api.post('/tasks', { 
        name, 
        type, 
        assignedTo: finalTeam, 
        status: 'Pending', 
        progressMsg: '' 
      });
      setName('');
      fetchData();
    } catch (err) {
      alert("Failed to add task.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this task?")) {
      await api.delete(`/tasks/${id}`);
      fetchData();
    }
  };

  return (
    <div className="max-w-6xl pb-10 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">Task Management</h2>

      {/* Add Task Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-emerald-400 mb-4 border-b border-slate-800 pb-2">Create New Task</h3>
        <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Task Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Task Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-white">
              <option value="Client">Client Project</option>
              <option value="Internal">Internal Operations</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Assign To Team</label>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-white">
              {teams.length === 0 && <option value="">No teams available</option>}
              {teams.map(t => <option key={t._id || t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-sm transition h-[42px]">+ Assign Task</button>
        </form>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(task => (
          <div key={task._id || task.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm relative group">
            <button onClick={() => handleDelete(task._id || task.id)} className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover:opacity-100 bg-rose-500/10 hover:bg-rose-500 hover:text-white px-2 py-1 rounded text-xs font-bold transition">✕ Delete</button>
            
            <div className="mb-3 pr-16">
              <h4 className="font-bold text-lg text-white leading-tight">{task.name}</h4>
              <p className="text-xs text-slate-400 mt-1">Team: {task.assignedTo} | Type: {task.type}</p>
            </div>
            
            <div className="mb-4">
              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${task.status === 'Completed' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-orange-900/30 text-orange-400'}`}>
                Status: {task.status}
              </span>
            </div>

            {/* MEMBER MESSAGE DISPLAY */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Latest Member Update</p>
              {task.progressMsg ? (
                <p className="text-sm text-indigo-300 bg-indigo-900/10 p-2 rounded border border-indigo-500/20">{task.progressMsg}</p>
              ) : (
                <p className="text-sm text-slate-600 italic">No updates sent yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}