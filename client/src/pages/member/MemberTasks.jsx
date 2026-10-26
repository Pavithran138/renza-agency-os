import { useState, useEffect } from 'react';
import api from '../../api';

export default function MemberTasks() {
  const [user] = useState(() => JSON.parse(sessionStorage.getItem('currentUser')) || { email: '' });
  const [tasks, setTasks] = useState([]);
  const [myTeamNames, setMyTeamNames] = useState([]);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    fetchData();
  }, [user.email]);

  const fetchData = async () => {
    try {
      const [tasksRes, teamsRes] = await Promise.all([api.get('/tasks'), api.get('/teams')]);
      
      // Map tasks to the member's specific teams
      const userTeams = teamsRes.data.filter(t => t.members && t.members.includes(user.email));
      const teamNames = userTeams.map(t => t.name);
      setMyTeamNames(teamNames);
      
      setTasks(tasksRes.data.filter(t => teamNames.includes(t.assignedTo)));
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const updateStatus = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task._id || task.id}`, { ...task, status: newStatus });
      fetchData();
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  const sendMessage = async (task) => {
    const msg = messages[task._id || task.id];
    if (!msg) return;
    
    try {
      await api.put(`/tasks/${task._id || task.id}`, { ...task, progressMsg: msg });
      setMessages({ ...messages, [task._id || task.id]: '' });
      alert("Update sent to Admin successfully!");
      fetchData();
    } catch (err) {
      console.error("Failed to send message");
    }
  };

  return (
    <div className="max-w-6xl pb-10 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">My Tasks</h2>
      
      <div className="flex flex-col gap-4">
        {tasks.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-500">
            No tasks are currently assigned to your teams.
          </div>
        )}

        {tasks.map(task => (
          <div key={task._id || task.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{task.name}</h3>
                <p className="text-xs text-slate-400 mt-1">For Team: {task.assignedTo}</p>
              </div>
              <button 
                onClick={() => updateStatus(task, task.status === 'Pending' ? 'Completed' : 'Pending')}
                className={`text-xs font-bold px-3 py-1.5 rounded transition ${task.status === 'Completed' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/50' : 'bg-orange-900/30 text-orange-400 border border-orange-500/30 hover:bg-orange-900/50'}`}
              >
                {task.status} (Click to change)
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Send Update to Admin</p>
              {task.progressMsg && (
                <div className="mb-3 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded text-sm text-indigo-200">
                  <strong className="text-indigo-400">Previous Update:</strong> {task.progressMsg}
                </div>
              )}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type progress update or blockages here..." 
                  value={messages[task._id || task.id] || ''} 
                  onChange={e => setMessages({ ...messages, [task._id || task.id]: e.target.value })}
                  className="flex-1 bg-slate-900 border border-slate-700 p-2.5 rounded text-sm text-white focus:outline-none focus:border-indigo-500" 
                />
                <button 
                  onClick={() => sendMessage(task)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-bold transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}