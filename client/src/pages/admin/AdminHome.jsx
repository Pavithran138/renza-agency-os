import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function AdminHome() {
  const [stats, setStats] = useState({ users: 0, teams: 0, activeTasks: 0 });
  const [activeClients, setActiveClients] = useState([]);
  const [progressUpdates, setProgressUpdates] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, teamsRes, tasksRes, clientsRes] = await Promise.all([
        api.get('/users'),
        api.get('/teams'),
        api.get('/tasks'),
        api.get('/clients')
      ]);

      const users = usersRes.data;
      const teams = teamsRes.data;
      const tasks = tasksRes.data;
      const clients = clientsRes.data;

      // GLITCH FIX: Find only clients that have active tasks assigned to their teams
      const activeClientNames = tasks
        .filter(t => t.type === 'Client' && t.status !== 'Completed')
        .map(t => {
          const associatedTeam = teams.find(team => team.name === t.assignedTo);
          return associatedTeam ? associatedTeam.client : null;
        })
        .filter(Boolean); // Remove nulls

      // Filter the clients list to only those actively being worked on
      const filteredClients = clients.filter(c => activeClientNames.includes(c.name));
      
      setActiveClients(filteredClients);
      
      setStats({
        users: users.filter(u => u.role !== 'Admin').length,
        teams: teams.length,
        activeTasks: tasks.filter(t => t.status !== 'Completed').length
      });

      // Fetch recent team progress alerts
      const updates = teams.filter(t => t.progressMsg).map(t => ({
        team: t.name,
        client: t.client,
        msg: t.progressMsg
      }));
      setProgressUpdates(updates);

    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  return (
    <div className="max-w-6xl pb-10 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">Agency Command Center</h2>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <p className="text-slate-400 text-sm font-bold uppercase mb-1">Active Employees</p>
          <p className="text-4xl font-black text-indigo-400">{stats.users}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <p className="text-slate-400 text-sm font-bold uppercase mb-1">Deployed Teams</p>
          <p className="text-4xl font-black text-emerald-400">{stats.teams}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <p className="text-slate-400 text-sm font-bold uppercase mb-1">Pending Tasks</p>
          <p className="text-4xl font-black text-orange-400">{stats.activeTasks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Clients (Glitch Fixed) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
            <h3 className="text-lg font-bold text-white">Active Client Projects</h3>
            <Link to="/admin/clients" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">View CRM ➔</Link>
          </div>
          <div className="flex flex-col gap-3">
            {activeClients.length === 0 && (
              <p className="text-slate-500 text-sm p-4 border border-dashed border-slate-800 rounded-lg text-center">
                No clients currently have active tasks.
              </p>
            )}
            {activeClients.map(client => (
              <div key={client._id || client.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
                <p className="font-bold text-indigo-400">{client.name}</p>
                <span className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded font-bold uppercase">In Progress</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Team Updates */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
            <h3 className="text-lg font-bold text-white">Recent Team Alerts</h3>
            <Link to="/admin/teams" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Manage Teams ➔</Link>
          </div>
          <div className="flex flex-col gap-3">
            {progressUpdates.length === 0 && (
              <p className="text-slate-500 text-sm p-4 border border-dashed border-slate-800 rounded-lg text-center">
                No recent team updates.
              </p>
            )}
            {progressUpdates.map((update, i) => (
              <div key={i} className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-lg">
                <p className="text-xs font-bold text-emerald-400 mb-1">{update.team} <span className="text-slate-400 opacity-60">({update.client})</span></p>
                <p className="text-sm text-slate-200">{update.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}