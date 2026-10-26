import { useState } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tasksOpen, setTasksOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/');
  };

  const isActive = (path) => location.pathname + location.search === path;
  const navClass = (path) => `block w-full text-left px-4 py-3 rounded-lg font-semibold transition ${isActive(path) ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800'}`;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      <div className="w-64 border-r border-slate-800 p-6 flex flex-col shrink-0">
        <h1 className="text-2xl font-bold text-white mb-8">Admin Panel</h1>
        
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2">
          <Link to="/admin" className={navClass('/admin')}>🏠 Home</Link>
          
          {/* NEW: Clients Page right below Home */}
          <Link to="/admin/clients" className={navClass('/admin/clients')}>🤝 Clients</Link>
          
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 rounded-lg font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer" onClick={() => setTasksOpen(!tasksOpen)}>
              <span>📋 Tasks</span>
              <span>{tasksOpen ? '▲' : '▼'}</span>
            </div>
            
            {tasksOpen && (
              <div className="flex flex-col gap-1 mt-1 ml-4 border-l border-slate-800 pl-2">
                <Link to="/admin/tasks?category=Team" className={`text-sm py-2 ${navClass('/admin/tasks?category=Team')}`}>🛡️ Team Tasks</Link>
                <Link to="/admin/tasks?category=Individual" className={`text-sm py-2 ${navClass('/admin/tasks?category=Individual')}`}>👤 Individual Tasks</Link>
              </div>
            )}
          </div>

          <Link to="/admin/teams" className={navClass('/admin/teams')}>🛡️ Teams</Link>
          <Link to="/admin/directory" className={navClass('/admin/directory')}>👥 Members</Link>
          <Link to="/admin/repo" className={navClass('/admin/repo')}>📁 Files</Link>
          <Link to="/admin/chat" className={navClass('/admin/chat')}>💬 Chat</Link>
        </nav>

        <button onClick={handleLogout} className="mt-auto px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg transition border border-slate-800">
          Log Out
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-10 relative bg-slate-950">
        <Outlet />
      </div>
    </div>
  );
}