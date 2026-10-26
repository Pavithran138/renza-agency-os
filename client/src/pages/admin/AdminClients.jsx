import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [project, setProject] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, tasksRes, teamsRes] = await Promise.all([
        api.get('/clients'),
        api.get('/tasks'),
        api.get('/teams')
      ]);
      setClients(clientsRes.data);
      setTasks(tasksRes.data);
      setTeams(teamsRes.data);
    } catch (err) {
      console.error("Error fetching CRM data:", err);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', { name, email, project, status: 'Active' });
      setName(''); setEmail(''); setProject('');
      fetchData();
    } catch (err) {
      alert("Failed to add client. Check console.");
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!clientId) return alert("Error: Client ID is missing.");
    if (window.confirm("Are you sure you want to permanently delete this client?")) {
      try {
        await api.delete(`/clients/${clientId}`);
        fetchData();
      } catch (err) {
        console.error("Delete client error:", err);
        alert("Delete failed. Make sure your Node.js backend is running and restarted.");
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) return alert("Error: Task ID is missing.");
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchData();
      } catch (err) {
        console.error("Delete task error:", err);
        alert("Delete failed. Make sure your Node.js backend is running and restarted.");
      }
    }
  };

  return (
    <div className="max-w-6xl pb-10 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">Client CRM</h2>

      {/* ADD CLIENT FORM */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm mb-8">
        <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Client Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Contact Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Project Scope</label>
            <input type="text" required value={project} onChange={e => setProject(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white text-sm" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white font-bold py-2.5 rounded-lg text-sm h-[42px]">+ Add Client</button>
        </form>
      </div>

      {/* CLIENT DIRECTORY */}
      <div className="flex flex-col gap-6">
        {clients.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-500">
            No active clients. Register a client above to begin.
          </div>
        )}
        
        {clients.map(client => {
          const clientTeams = teams.filter(t => t.client === client.name).map(t => t.name);
          const clientTasks = tasks.filter(t => t.type === 'Client' && clientTeams.includes(t.assignedTo));

          return (
            <div key={client._id || client.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group">
              <button onClick={() => handleDeleteClient(client._id || client.id)} className="absolute top-6 right-6 text-rose-500 opacity-0 group-hover:opacity-100 text-sm font-bold bg-rose-500/10 px-4 py-2 rounded-lg hover:bg-rose-500 hover:text-white">✕ Delete Client</button>
              
              <div className="mb-4 pr-32">
                <h3 className="text-2xl font-bold text-white">{client.name}</h3>
                <p className="text-sm text-slate-400 mt-1">Contact: {client.email} | Scope: <strong className="text-indigo-400">{client.project}</strong></p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-slate-800 pb-2">Active Tasks</h4>
                <div className="flex flex-col gap-2">
                  {clientTasks.length === 0 ? <p className="text-sm text-slate-600">No tasks currently assigned for this client.</p> : 
                    clientTasks.map(task => (
                      <div key={task._id || task.id} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                        <div>
                          <p className="text-sm font-bold text-slate-200">{task.name}</p>
                          <p className="text-[10px] text-slate-500">Assigned Team: {task.assignedTo}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${task.status === 'Completed' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-orange-900/30 text-orange-400'}`}>{task.status}</span>
                          <button onClick={() => handleDeleteTask(task._id || task.id)} className="text-rose-500 text-xs font-bold bg-slate-950 border border-slate-800 px-3 py-1.5 rounded">Delete Task</button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}