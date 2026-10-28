import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [history, setHistory] = useState([]); 
  const [adminUser] = useState(() => JSON.parse(sessionStorage.getItem('currentUser')) || { name: 'Admin', email: 'admin@company.com' });
  
  const [teamName, setTeamName] = useState('');
  const [projectType, setProjectType] = useState('Client'); 
  const [clientName, setClientName] = useState(''); 
  const [taskDesc, setTaskDesc] = useState('');
  const [sharedLink, setSharedLink] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [showHistory, setShowHistory] = useState(false); 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const timestamp = new Date().getTime();
      const teamsRes = await api.get(`/teams?t=${timestamp}`);
      const usersRes = await api.get(`/users?t=${timestamp}`);
      const clientsRes = await api.get(`/clients?t=${timestamp}`);
      
      // GHOST BUSTER: Filter out teams that were locally deleted but the backend keeps sending
      const hiddenTeams = JSON.parse(localStorage.getItem('ghost_teams_blacklist')) || [];
      const fetchedTeams = Array.isArray(teamsRes.data) ? teamsRes.data : [];
      const cleanTeams = fetchedTeams.filter(t => !hiddenTeams.includes(String(t._id)) && !hiddenTeams.includes(String(t.id)));
      
      setTeams(cleanTeams);
      setEmployees(Array.isArray(usersRes.data) ? usersRes.data.filter(u => u.role === 'Member') : []);
      setClients(Array.isArray(clientsRes.data) ? clientsRes.data : []);
      
      setHistory(JSON.parse(localStorage.getItem('company_progress_history')) || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setTeams([]); 
    }
  };

  const handleClientSelect = (e) => {
    const selectedName = e.target.value;
    setClientName(selectedName);
    if (selectedName) {
      const foundClient = clients.find(c => (c.name || c.clientName || c.companyName) === selectedName);
      const description = foundClient ? (foundClient.description || foundClient.scope || 'No description provided') : '';
      if (foundClient) {
        setTaskDesc(`[Module / Task for ${selectedName}]\n\nOriginal Scope: ${description}`);
      }
    } else {
      setTaskDesc('');
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (selectedMembers.length === 0) return alert("Select at least one member!");

    const newTeam = { 
      name: teamName, 
      type: projectType, 
      client: projectType === 'Client' ? clientName : 'Internal Company', 
      task: taskDesc, 
      link: sharedLink, 
      members: selectedMembers 
    };
    
    const newTask = {
      name: taskDesc, 
      assignedTo: teamName,
      category: 'Team', 
      type: projectType, 
      status: 'Pending'
    };

    try {
      await api.post('/teams', newTeam);
      await api.post('/tasks', newTask);
      fetchData(); 
      setTeamName(''); setClientName(''); setTaskDesc(''); setSharedLink(''); setSelectedMembers([]);
    } catch (err) {
      console.error("Error creating team:", err);
    }
  };

  const clearProgress = async (team) => {
    const historyItem = {
      id: Date.now(), teamName: team.name, client: team.client,
      message: team.progressMsg, date: new Date().toLocaleString()
    };
    const updatedHistory = [historyItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('company_progress_history', JSON.stringify(updatedHistory));

    try {
      await api.put(`/teams/${team._id}`, { progressMsg: '' });
      fetchData();
    } catch (err) {
      console.error("Error clearing progress:", err);
    }
  };

  const handleDisbandTeam = async (id) => {
    const stringId = id?.toString();
    if (!stringId) return alert("Error: Team ID not found.");
    
    if (window.confirm("Are you sure you want to disband this team? This action cannot be undone.")) {
      // 1. Instantly hide it from the UI
      setTeams(teams.filter(team => String(team._id) !== stringId && String(team.id) !== stringId));
      
      // 2. Add to Ghost Buster Blacklist so it never comes back
      const hiddenTeams = JSON.parse(localStorage.getItem('ghost_teams_blacklist')) || [];
      hiddenTeams.push(stringId);
      localStorage.setItem('ghost_teams_blacklist', JSON.stringify(hiddenTeams));
      
      try {
        // 3. Attempt backend delete, but ignore the error if backend fails
        await api.delete(`/teams/${stringId}`);
      } catch (err) {
        console.warn("Backend failed to delete, but team is permanently hidden locally.", err);
      }
    }
  };

  const toggleMember = (email) => {
    setSelectedMembers(prev => prev.includes(email) ? prev.filter(m => m !== email) : [...prev, email]);
  };

  const allSelectableMembers = [{ name: `${adminUser.name} (Admin)`, email: adminUser.email }, ...employees];

  return (
    <div className="max-w-6xl pb-20 relative">
      <h2 className="text-3xl font-bold text-white mb-6">Team Management & Assignments</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Create Team Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Assemble Team or Module</h3>
          <form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
            <input type="text" required value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team Name" className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white" />
            
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button type="button" onClick={() => { setProjectType('Client'); setClientName(''); setTaskDesc(''); }} className={`flex-1 py-2 text-sm font-bold rounded transition ${projectType === 'Client' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>Client Project</button>
              <button type="button" onClick={() => { setProjectType('Company'); setClientName(''); setTaskDesc(''); }} className={`flex-1 py-2 text-sm font-bold rounded transition ${projectType === 'Company' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>Company Project</button>
            </div>

            {projectType === 'Client' && (
              <select required value={clientName} onChange={handleClientSelect} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white">
                <option value="">-- Select Registered Client --</option>
                {clients.map(c => {
                  const cName = typeof c === 'object' ? (c.name || c.clientName || c.companyName) : c;
                  return <option key={c._id || c.id || cName} value={cName}>{cName}</option>;
                })}
              </select>
            )}

            <textarea required value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Module specific instructions..." className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-24" />
            <input type="text" value={sharedLink} onChange={e => setSharedLink(e.target.value)} placeholder="Repo / Resource Link (Optional)" className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white" />
            
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <p className="text-sm font-bold text-slate-400 mb-3">Select Members:</p>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                {allSelectableMembers.map(emp => (
                  <label key={emp.email} className="text-slate-300 text-sm flex items-center gap-3 cursor-pointer p-1 hover:bg-slate-900 rounded">
                    <input type="checkbox" checked={selectedMembers.includes(emp.email)} onChange={() => toggleMember(emp.email)} className="w-4 h-4 accent-indigo-500" />
                    <span className={emp.email === adminUser.email ? "text-indigo-400 font-bold" : ""}>{emp.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="bg-indigo-500 text-white p-3 rounded-lg font-bold hover:bg-indigo-400">Assign & Create Team</button>
          </form>
        </div>

        {/* Manage Teams & Active Updates */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Active Progress Updates</h3>
            <div className="flex flex-col gap-3">
              {!teams.some(t => t.progressMsg) && <p className="text-sm text-slate-500">No new progress reports pending.</p>}
              {teams.map(team => team.progressMsg && (
                <div key={`prog-${team._id}`} className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl relative group shadow-sm">
                  <button onClick={() => clearProgress(team)} className="absolute top-2 right-2 text-emerald-500 font-bold bg-emerald-900/40 hover:bg-emerald-500 hover:text-white transition w-6 h-6 rounded-full flex items-center justify-center text-xs">✕</button>
                  <p className="text-xs font-bold text-emerald-400 mb-1">{team.name} <span className="opacity-60">({team.client})</span></p>
                  <p className="text-sm text-slate-200 pr-4">{team.progressMsg}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Manage Teams</h3>
            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
              {teams.length === 0 && <p className="text-slate-500">No teams created yet.</p>}
              {teams.map(team => (
                <div key={team._id || team.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl relative">
                  <div className="pr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-indigo-400 text-lg">{team.name}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${team.type === 'Client' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-orange-900/30 text-orange-400'}`}>
                        {team.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">Assigned to: {team.client}</p>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={() => handleDisbandTeam(team._id || team.id)}
                      style={{ background: '#ef4444', color: 'white', padding: '5px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      Disband Team
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING HISTORY BUTTON */}
      <button onClick={() => setShowHistory(true)} className="fixed bottom-10 right-10 bg-indigo-600 hover:bg-indigo-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 border-2 border-indigo-400/30 z-40" title="Update History">
        <span className="text-2xl">📋</span>
        {history.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">{history.length}</span>}
      </button>

      {/* HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Progress Notification History</h3>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white font-bold">✕ Close</button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
              {history.length === 0 && <p className="text-slate-500 text-center py-10">No history logs found.</p>}
              {history.map((item, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-indigo-400">{item.teamName} <span className="text-xs font-normal text-slate-500">({item.client})</span></p>
                    <p className="text-[10px] text-slate-500">{item.date}</p>
                  </div>
                  <p className="text-sm text-slate-300">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}