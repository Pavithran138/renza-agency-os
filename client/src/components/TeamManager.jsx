import { useState, useEffect } from 'react';

export default function TeamManager({ employees }) {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  const [assignmentType, setAssignmentType] = useState('Client Project');
  const [assignmentTarget, setAssignmentTarget] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamRepo, setTeamRepo] = useState(''); // New Repo State

  useEffect(() => {
    const loadTeams = () => setTeams(JSON.parse(localStorage.getItem('company_teams')) || []);
    loadTeams();
    window.addEventListener('storage', (e) => {
      if (e.key === 'company_teams') loadTeams();
    });
  }, []);

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (selectedMembers.length === 0) return alert("Select at least one employee.");
    
    const newTeam = { 
      id: Date.now(), 
      name: teamName, 
      members: selectedMembers,
      assignmentType,
      assignmentTarget,
      description: teamDescription,
      repoLink: teamRepo // Save repo link
    };
    
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    localStorage.setItem('company_teams', JSON.stringify(updatedTeams));
    
    setTeamName('');
    setAssignmentTarget('');
    setTeamDescription('');
    setTeamRepo('');
    setSelectedMembers([]);
  };

  const toggleMember = (email) => {
    setSelectedMembers(prev => 
      prev.includes(email) ? prev.filter(m => m !== email) : [...prev, email]
    );
  };

  const handleDeleteTeam = (id) => {
    const updated = teams.filter(t => t.id !== id);
    setTeams(updated);
    localStorage.setItem('company_teams', JSON.stringify(updated));
  };

  // Remove just the repo link if there is a mistake
  const handleRemoveRepo = (id) => {
    const updated = teams.map(t => t.id === id ? { ...t, repoLink: '' } : t);
    setTeams(updated);
    localStorage.setItem('company_teams', JSON.stringify(updated));
  };

  const formatUrl = (url) => url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-white mb-4">Assemble a New Team</h3>
        <form onSubmit={handleCreateTeam} className="flex flex-col gap-5">
          
          <div>
            <label className="block text-xs text-slate-400 mb-1">Team Name</label>
            <input type="text" required value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g., Frontend Devs" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:outline-none focus:border-indigo-500 text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Assignment Type</label>
              <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                <button type="button" onClick={() => setAssignmentType('Client Project')} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${assignmentType === 'Client Project' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Client Project</button>
                <button type="button" onClick={() => setAssignmentType('Module Work')} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${assignmentType === 'Module Work' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Module Work</button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">{assignmentType} Target</label>
              <input type="text" required value={assignmentTarget} onChange={e => setAssignmentTarget(e.target.value)} placeholder={assignmentType === 'Client Project' ? "e.g., Nexus Dynamics" : "e.g., Auth API Migration"} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:outline-none focus:border-indigo-500 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Initial Repository Link (Optional)</label>
              <input type="text" value={teamRepo} onChange={e => setTeamRepo(e.target.value)} placeholder="e.g., https://github.com/..." className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:outline-none focus:border-indigo-500 text-white" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Work Description & Objectives</label>
            <textarea required value={teamDescription} onChange={e => setTeamDescription(e.target.value)} placeholder="Describe what this team needs to accomplish..." className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:outline-none focus:border-indigo-500 text-white h-20"></textarea>
          </div>
          
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
            <p className="text-sm text-slate-400 mb-3">Select Members:</p>
            <div className="grid grid-cols-2 gap-3">
              {employees.length === 0 && <p className="text-xs text-slate-500">No employees registered yet.</p>}
              {employees.map(emp => (
                <label key={emp.id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={selectedMembers.includes(emp.email)} onChange={() => toggleMember(emp.email)} className="accent-indigo-500" />
                  {emp.name}
                </label>
              ))}
            </div>
          </div>
          
          <button type="submit" className="bg-indigo-500 text-white py-3 rounded-lg font-bold hover:bg-indigo-400">Assemble Team</button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-white mb-6">Active Teams & Assignments</h3>
        <div className="grid grid-cols-1 gap-6">
          {teams.length === 0 && <p className="text-slate-500">No teams created.</p>}
          {teams.map(team => (
            <div key={team.id} className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex flex-col relative">
              <button onClick={() => handleDeleteTeam(team.id)} className="absolute top-6 right-6 text-rose-500 text-sm font-bold hover:underline">Disband Team</button>
              
              <div className="mb-4 pr-24">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-indigo-400 text-xl">{team.name}</h4>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${team.assignmentType === 'Client Project' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20' : 'bg-orange-900/30 text-orange-400 border-orange-500/20'}`}>
                    {team.assignmentType || 'Project'}
                  </span>
                </div>
                <p className="text-white font-semibold text-sm">Target: {team.assignmentTarget || 'Unassigned'}</p>
              </div>
              
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 mb-4">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Mission / Description</p>
                <p className="text-sm text-slate-300 leading-relaxed">{team.description || 'No description provided.'}</p>
              </div>

              {/* Display Team Repo if it exists */}
              {team.repoLink && (
                <div className="p-3 bg-indigo-950/30 rounded-lg border border-indigo-500/30 mb-4 flex justify-between items-center">
                  <div className="overflow-hidden pr-4">
                    <p className="text-xs text-indigo-400 uppercase font-bold mb-1">Team Repository</p>
                    <a href={formatUrl(team.repoLink)} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-white truncate block">
                      {team.repoLink} ↗
                    </a>
                  </div>
                  <button onClick={() => handleRemoveRepo(team.id)} className="text-xs text-rose-400 hover:text-rose-300 font-bold whitespace-nowrap">
                    Clear Link
                  </button>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-2">Team Members ({team.members.length})</p>
                <div className="flex flex-wrap gap-2">
                  {team.members.map(email => (
                     <span key={email} className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700">
                       {employees.find(e => e.email === email)?.name || email}
                     </span>
                  ))}
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}