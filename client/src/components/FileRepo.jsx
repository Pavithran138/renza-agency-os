import { useState, useEffect } from 'react';

export default function FileRepo({ currentUser, isAdmin }) {
  const [repoLinks, setRepoLinks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [shareTarget, setShareTarget] = useState(isAdmin ? 'all' : 'admin');

  useEffect(() => {
    const loadRepoData = () => {
      setRepoLinks(JSON.parse(localStorage.getItem('company_repo_links')) || []);
      setTeams(JSON.parse(localStorage.getItem('company_teams')) || []);
    };
    loadRepoData();
    
    const handleStorageChange = (e) => {
      if (e.key === 'company_repo_links' || e.key === 'company_teams') loadRepoData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleShare = (e) => {
    e.preventDefault();
    const newLink = {
      id: Date.now(), 
      url: linkUrl,
      description: linkDescription,
      sender: currentUser.name, 
      senderEmail: currentUser.email,
      target: shareTarget, 
      date: new Date().toLocaleDateString()
    };
    const updated = [...repoLinks, newLink];
    setRepoLinks(updated);
    localStorage.setItem('company_repo_links', JSON.stringify(updated));
    setLinkUrl('');
    setLinkDescription('');
  };

  const handleDeleteLink = (id) => {
    if (window.confirm("Remove this repository link?")) {
      const updated = repoLinks.filter(l => l.id !== id);
      setRepoLinks(updated);
      localStorage.setItem('company_repo_links', JSON.stringify(updated));
    }
  };

  const formatUrl = (url) => url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

  // Find which team a user belongs to for Admin display
  const getUserTeams = (email) => {
    const userTeams = teams.filter(t => t.members.includes(email)).map(t => t.name);
    return userTeams.length > 0 ? userTeams.join(', ') : 'Independent';
  };

  // --- CATEGORIZATION LOGIC ---
  const myTeamNames = teams.filter(t => t.members.includes(currentUser.email)).map(t => t.name);
  
  // Universal
  const publicLinks = repoLinks.filter(l => l.target === 'all');
  
  // Admin specific
  const adminInbox = repoLinks.filter(l => l.target === 'admin' && l.senderEmail !== currentUser.email);
  const adminOutbox = repoLinks.filter(l => l.senderEmail === currentUser.email && l.target !== 'all');
  
  // Member specific
  const mySubmissions = repoLinks.filter(l => l.senderEmail === currentUser.email);
  const teamLinks = repoLinks.filter(l => myTeamNames.includes(l.target) && l.senderEmail !== currentUser.email);


  // Reusable Link Card Component
  const LinkCard = ({ linkItem, showTeamBadge }) => {
    const senderTeams = getUserTeams(linkItem.senderEmail);
    return (
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-4">
            <span className="text-2xl mt-1">🔗</span>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-xs text-slate-500">
                  From: <span className="font-semibold text-slate-400">{linkItem.senderEmail === currentUser.email ? 'You' : linkItem.sender}</span>
                </p>
                {showTeamBadge && linkItem.senderEmail !== currentUser.email && (
                  <span className="text-[10px] uppercase font-bold bg-indigo-900/30 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                    Team: {senderTeams}
                  </span>
                )}
                <p className="text-xs text-slate-500 ml-2 border-l border-slate-700 pl-2">
                  Target: <span className="font-semibold text-slate-400">{linkItem.target}</span>
                </p>
                <p className="text-xs text-slate-600 ml-2">{linkItem.date}</p>
              </div>
              <p className="font-bold text-indigo-400 text-lg break-all">
                <a href={formatUrl(linkItem.url)} target="_blank" rel="noopener noreferrer" className="hover:underline">{linkItem.url} ↗</a>
              </p>
            </div>
          </div>
          
          {(isAdmin || linkItem.senderEmail === currentUser.email) && (
            <button onClick={() => handleDeleteLink(linkItem.id)} className="text-rose-500 text-sm font-bold hover:underline whitespace-nowrap bg-rose-500/10 px-3 py-1 rounded">
              Remove
            </button>
          )}
        </div>

        <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 ml-10">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Instructions / Description</p>
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{linkItem.description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl pb-10">
      
      {/* Universal Share Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-white mb-4">Share Repository Link</h3>
        <form onSubmit={handleShare} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <input type="text" required value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="Paste URL (e.g., https://github.com/...)" className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-lg focus:outline-none focus:border-indigo-500 text-white" />
            <select value={shareTarget} onChange={e => setShareTarget(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-lg focus:outline-none focus:border-indigo-500 text-white w-48">
              {isAdmin ? (
                <>
                  <option value="all">Share with All</option>
                  {teams.map(t => <option key={t.id} value={t.name}>Team: {t.name}</option>)}
                </>
              ) : (
                <>
                  <option value="admin">Send to Admin</option>
                  {teams.filter(t => t.members.includes(currentUser.email)).map(t => (
                    <option key={t.id} value={t.name}>My Team: {t.name}</option>
                  ))}
                  <option value="all">Share with All</option>
                </>
              )}
            </select>
          </div>
          <textarea required value={linkDescription} onChange={e => setLinkDescription(e.target.value)} placeholder="What needs to be done with this repo?" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:outline-none focus:border-indigo-500 text-white h-20"></textarea>
          <button type="submit" className="bg-indigo-500 text-white py-3 rounded-lg font-bold hover:bg-indigo-400 transition">Share Link & Instructions</button>
        </form>
      </div>

      {/* --- ADMIN LAYOUT VIEWS --- */}
      {isAdmin && (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-white mb-4 flex justify-between items-center">
              <span>📥 Inbox: Team Submissions</span>
              <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">{adminInbox.length}</span>
            </h3>
            <div className="flex flex-col gap-4">
              {adminInbox.length === 0 && <p className="text-slate-500 text-sm">No new submissions from teams.</p>}
              {adminInbox.map(link => <LinkCard key={link.id} linkItem={link} showTeamBadge={true} />)}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-white mb-4">🌍 Common Workspace Repositories</h3>
            <div className="flex flex-col gap-4">
              {publicLinks.length === 0 && <p className="text-slate-500 text-sm">No public workspace links.</p>}
              {publicLinks.map(link => <LinkCard key={link.id} linkItem={link} showTeamBadge={true} />)}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-white mb-4">📤 Your Outbound Team Shares</h3>
            <div className="flex flex-col gap-4">
              {adminOutbox.length === 0 && <p className="text-slate-500 text-sm">You haven't shared links to specific teams yet.</p>}
              {adminOutbox.map(link => <LinkCard key={link.id} linkItem={link} showTeamBadge={false} />)}
            </div>
          </div>
        </>
      )}

      {/* --- MEMBER LAYOUT VIEWS --- */}
      {!isAdmin && (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-white mb-4 flex justify-between items-center">
              <span>🛡️ My Team Repositories</span>
              <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">{teamLinks.length}</span>
            </h3>
            <div className="flex flex-col gap-4">
              {teamLinks.length === 0 && <p className="text-slate-500 text-sm">No links assigned directly to your teams.</p>}
              {teamLinks.map(link => <LinkCard key={link.id} linkItem={link} showTeamBadge={false} />)}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-white mb-4">🌍 Common Workspace Repositories</h3>
            <div className="flex flex-col gap-4">
              {publicLinks.length === 0 && <p className="text-slate-500 text-sm">No public workspace links.</p>}
              {publicLinks.map(link => <LinkCard key={link.id} linkItem={link} showTeamBadge={true} />)}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-white mb-4">📤 My Submissions</h3>
            <div className="flex flex-col gap-4">
              {mySubmissions.length === 0 && <p className="text-slate-500 text-sm">You haven't shared any links yet.</p>}
              {mySubmissions.map(link => <LinkCard key={link.id} linkItem={link} showTeamBadge={false} />)}
            </div>
          </div>
        </>
      )}

    </div>
  );
}