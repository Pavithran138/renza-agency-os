import { useState, useEffect } from 'react';
import api from '../../api';

export default function MemberRepo() {
  const [user] = useState(() => JSON.parse(sessionStorage.getItem('currentUser')) || { name: 'Unknown', email: '' });
  const [sharedFiles, setSharedFiles] = useState([]);
  const [mySubmittedFiles, setMySubmittedFiles] = useState([]);
  const [myTeams, setMyTeams] = useState([]);

  const [fileTitle, setFileTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [assocContext, setAssocContext] = useState('Individual');

  useEffect(() => {
    fetchData();
  }, [user.email]);

  const fetchData = async () => {
    try {
      const [filesRes, teamsRes] = await Promise.all([
        api.get('/files'),
        api.get('/teams')
      ]);
      
      const userTeams = teamsRes.data.filter(t => t.members.includes(user.email));
      setMyTeams(userTeams);
      
      const allFiles = filesRes.data;
      
      setSharedFiles(allFiles.filter(f => 
        f.isAdminShare && (
          f.type === 'All' || 
          (f.type === 'Team' && userTeams.map(t=>t.name).includes(f.target)) || 
          (f.type === 'Individual' && f.target === user.email)
        )
      ));
      
      setMySubmittedFiles(allFiles.filter(f => !f.isAdminShare && f.senderEmail === user.email));
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const handleSubmitFile = async (e) => {
    e.preventDefault();
    let contextType = 'Individual';
    let contextName = 'Direct Submission';
    let projectType = null;

    if (assocContext !== 'Individual') {
      const selectedTeam = myTeams.find(t => (t._id || t.id) === assocContext);
      if (selectedTeam) {
        contextType = 'Team';
        contextName = selectedTeam.name;
        projectType = selectedTeam.type;
      }
    }

    try {
      await api.post('/files', {
        title: fileTitle, url: fileUrl, isAdminShare: false,
        senderName: user.name, senderEmail: user.email,
        contextType, contextName, projectType
      });
      setFileTitle(''); setFileUrl(''); setAssocContext('Individual');
      fetchData(); // Refresh UI
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  return (
    <div className="max-w-6xl pb-10 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">Global Files & Resources</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit shadow-sm">
          <h3 className="text-lg font-bold text-emerald-400 mb-4">Send Link to Admin</h3>
          <form onSubmit={handleSubmitFile} className="flex flex-col gap-4">
            <input type="text" required value={fileTitle} onChange={e => setFileTitle(e.target.value)} placeholder="File Title" className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white text-sm focus:outline-none" />
            <input type="url" required value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white text-sm focus:outline-none" />
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Project Association</label>
              <select value={assocContext} onChange={e => setAssocContext(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white text-sm focus:outline-none">
                <option value="Individual">Individual Assignment</option>
                {myTeams.map(t => <option key={t._id || t.id} value={t._id || t.id}>Team: {t.name}</option>)}
              </select>
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold mt-2 text-sm transition">Submit</button>
          </form>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm overflow-y-auto max-h-[300px]">
            <h3 className="text-lg font-bold text-white mb-4">Files Sent By Admin</h3>
            <div className="flex flex-col gap-3">
              {sharedFiles.length === 0 && <p className="text-slate-500 text-sm p-4 border border-dashed border-slate-800 rounded-lg text-center">No files shared with you.</p>}
              {sharedFiles.map(file => (
                <div key={file._id || file.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-400 hover:underline text-lg">📁 {file.title}</a>
                  </div>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="bg-indigo-500/10 text-indigo-400 font-bold text-xs px-4 py-2 rounded">Open</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}