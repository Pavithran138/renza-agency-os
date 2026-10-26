import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function MemberHome() {
  const [user] = useState(() => JSON.parse(sessionStorage.getItem('currentUser')) || { name: 'Member', email: '' });
  const [stats, setStats] = useState({ pending: 0, completed: 0 });
  const [recentChats, setRecentChats] = useState([]);

  useEffect(() => {
    fetchMemberData();
  }, [user.email]);

  const fetchMemberData = async () => {
    try {
      const [tasksRes, teamsRes, chatsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/teams'),
        api.get('/chats')
      ]);

      const userTeams = teamsRes.data.filter(t => t.members.includes(user.email)).map(t => t.name);
      const myTasks = tasksRes.data.filter(t => t.assignedTo === user.email || userTeams.includes(t.assignedTo));

      setStats({
        pending: myTasks.filter(t => t.status !== 'Completed').length,
        completed: myTasks.filter(t => t.status === 'Completed').length
      });

      // Get recent chats relevant to this user (Common or Team chats they are in)
      const relevantChats = chatsRes.data.filter(c => 
        c.mode === 'Common' || (c.mode === 'Team' && userTeams.includes(c.target))
      ).slice(-5); // Get last 5
      
      setRecentChats(relevantChats);

    } catch (err) {
      console.error("Error loading member home:", err);
    }
  };

  return (
    <div className="max-w-6xl pb-10 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">Welcome back, {user.name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <p className="text-slate-400 text-sm font-bold uppercase mb-1">Tasks Pending</p>
          <p className="text-4xl font-black text-orange-400">{stats.pending}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <p className="text-slate-400 text-sm font-bold uppercase mb-1">Tasks Completed</p>
          <p className="text-4xl font-black text-emerald-400">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
          <h3 className="text-lg font-bold text-white">Recent Global Communications</h3>
          <Link to="/member/chat" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Open Chat ➔</Link>
        </div>
        <div className="flex flex-col gap-3">
          {recentChats.length === 0 && <p className="text-slate-500 text-sm">No recent messages.</p>}
          {recentChats.map(msg => (
            <div key={msg._id || msg.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex flex-col">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-indigo-400">{msg.sender} <span className="text-slate-500 font-normal">in {msg.mode}</span></span>
                <span className="text-[10px] text-slate-500">{msg.time}</span>
              </div>
              <p className="text-sm text-slate-300">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}