import { useState, useEffect } from 'react';
import api from '../../api';

export default function MemberClients() {
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);

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
      console.error("Error fetching client data:", err);
    }
  };

  return (
    <div className="max-w-6xl pb-10 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">Global Client Monitor</h2>
      <p className="text-slate-400 text-sm mb-8">Read-only view of all active company clients and team progress.</p>

      <div className="flex flex-col gap-6">
        {clients.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-500">
            No active client projects found in the company database.
          </div>
        )}

        {clients.map(client => {
          // Find teams for this client, then pull tasks for those teams
          const clientTeams = teams.filter(t => t.client === client.name).map(t => t.name);
          const clientTasks = tasks.filter(t => t.type === 'Client' && clientTeams.includes(t.assignedTo));

          return (
            <div key={client._id || client.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-white">{client.name}</h3>
                <p className="text-sm text-slate-400 mt-1">Scope: <strong className="text-indigo-400">{client.project}</strong></p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-slate-800 pb-2">Active Team Tasks</h4>
                <div className="flex flex-col gap-2">
                  {clientTasks.length === 0 ? <p className="text-sm text-slate-600">No tasks currently assigned for this client.</p> : 
                    clientTasks.map(task => (
                      <div key={task._id || task.id} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                        <div>
                          <p className="text-sm font-bold text-slate-200">{task.name}</p>
                          <p className="text-[10px] text-slate-500">Assigned Team: {task.assignedTo}</p>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${task.status === 'Completed' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-orange-900/30 text-orange-400'}`}>
                          {task.status}
                        </span>
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