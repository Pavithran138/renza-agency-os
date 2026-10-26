import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminChat() {
  const [chatMode, setChatMode] = useState('Common'); 
  const [targetId, setTargetId] = useState(''); 
  
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [chats, setChats] = useState([]);
  const [msgInput, setMsgInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, usersRes, chatsRes] = await Promise.all([
        api.get('/teams'),
        api.get('/users'),
        api.get('/chats')
      ]);
      setTeams(teamsRes.data);
      setEmployees(usersRes.data.filter(u => u.role !== 'Admin'));
      setChats(chatsRes.data);
    } catch (err) {
      console.error("Error fetching chat data:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    
    const target = chatMode === 'Common' ? 'all' : targetId;
    if (!target && chatMode !== 'Common') return alert(`Select a ${chatMode} first.`);

    try {
      await api.post('/chats', {
        mode: chatMode, target, 
        sender: 'Admin', text: msgInput, time: new Date().toLocaleTimeString() 
      });
      setMsgInput('');
      fetchData(); // Refresh UI
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const filteredChats = chats.filter(c => {
    if (chatMode === 'Common') return c.mode === 'Common';
    return c.mode === chatMode && c.target === targetId;
  });

  return (
    <div className="h-full flex flex-col max-w-4xl animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">Global Communication Hub</h2>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-0">
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-950 border-b border-slate-800 p-2 gap-2">
          {['Common', 'Team', 'Individual'].map(mode => (
            <button 
              key={mode} 
              onClick={() => { setChatMode(mode); setTargetId(''); }} 
              className={`flex-1 py-2 text-sm font-bold rounded transition ${chatMode === mode ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              {mode} Channel
            </button>
          ))}
        </div>

        {/* Dynamic Selectors */}
        {chatMode === 'Team' && (
          <div className="p-3 bg-slate-900 border-b border-slate-800">
            <select value={targetId} onChange={e => setTargetId(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white text-sm focus:outline-none">
              <option value="">-- Select Team to Chat --</option>
              {teams.map(t => <option key={t._id || t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
        )}
        
        {chatMode === 'Individual' && (
          <div className="p-3 bg-slate-900 border-b border-slate-800">
            <select value={targetId} onChange={e => setTargetId(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white text-sm focus:outline-none">
              <option value="">-- Select Employee to Chat --</option>
              {employees.map(e => <option key={e._id || e.id} value={e.email}>{e.name}</option>)}
            </select>
          </div>
        )}

        {/* Chat Log View */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {filteredChats.map(msg => (
            <div key={msg._id || msg.id} className={`p-3 rounded-lg text-sm max-w-[80%] ${msg.sender === 'Admin' ? 'bg-indigo-600 text-white self-end' : 'bg-slate-800 text-slate-200 self-start'}`}>
              <p className="text-xs opacity-70 mb-1">{msg.sender} • {msg.time}</p>
              <p>{msg.text}</p>
            </div>
          ))}
          {filteredChats.length === 0 && <p className="text-slate-500 text-center text-sm mt-10">No messages in this channel.</p>}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input type="text" value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder={`Message ${chatMode}...`} className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none" />
          <button type="submit" className="bg-indigo-500 text-white px-6 font-bold rounded text-sm hover:bg-indigo-400">Send</button>
        </form>

      </div>
    </div>
  );
}