import { useState, useEffect } from 'react';
import api from '../../api';

export default function MemberTeam() {
  const [user] = useState(() => JSON.parse(sessionStorage.getItem('currentUser')) || { name: 'Unknown', email: '' });
  const [myTeams, setMyTeams] = useState([]);
  const [progressInputs, setProgressInputs] = useState({});

  useEffect(() => {
    fetchTeams();
  }, [user.email]);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setMyTeams(res.data.filter(t => t.members.includes(user.email)));
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const handleUpdateProgress = async (e, teamId) => {
    e.preventDefault();
    const updateMsg = progressInputs[teamId];
    if (!updateMsg) return;

    try {
      // Send update to MongoDB
      await api.put(`/teams/${teamId}`, { 
        progressMsg: `[Update from ${user.name}]: ${updateMsg}` 
      });
      
      setProgressInputs({ ...progressInputs, [teamId]: '' });
      fetchTeams(); // Refresh UI
      alert("Progress notification sent to Admin!");
    } catch (err) {
      console.error("Error sending progress:", err);
    }
  };

  return (
    <div className="max-w-5xl pb-10 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">My Teams & Objectives</h2>

      <div className="flex flex-col gap-6">
        {myTeams.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500">
            You are not assigned to any active teams.
          </div>
        )}

        {myTeams.map(team => (
          <div key={team._id || team.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-indigo-400">{team.name}</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${team.type === 'Client' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-orange-900/30 text-orange-400'}`}>
                  {team.type}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4">Target Project: <strong className="text-white">{team.client}</strong></p>
              
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 mb-4">
                <p className="text-xs text-slate-500 uppercase font-bold mb-2">Mission Scope</p>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{team.task}</p>
              </div>
            </div>

            <div className="w-full md:w-1/3 bg-slate-950 border border-slate-800 rounded-xl p-5">
              <h4 className="font-bold text-white mb-2 text-sm">Send Alert to Admin</h4>
              <form onSubmit={(e) => handleUpdateProgress(e, team._id || team.id)} className="flex flex-col gap-3">
                <textarea 
                  required value={progressInputs[team._id || team.id] || ''} 
                  onChange={e => setProgressInputs({...progressInputs, [team._id || team.id]: e.target.value})} 
                  placeholder="Type quick update..." 
                  className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white h-24 focus:outline-none"
                />
                <button type="submit" className="bg-emerald-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-emerald-500 transition">
                  Send Notification
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}