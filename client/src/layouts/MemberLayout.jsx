import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function MemberLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => JSON.parse(sessionStorage.getItem('currentUser')) || { name: 'Member' });

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/');
  };

  // The navigation links for the Member Sidebar
  const navLinks = [
    { name: 'Dashboard', path: '/member' },
    { name: 'My Clients', path: '/member/clients' }, // <-- New Sidebar Link added here
    { name: 'My Teams', path: '/member/teams' },
    { name: 'My Tasks', path: '/member/tasks' },
    { name: 'Global Files', path: '/member/repo' },
    { name: 'Global Chat', path: '/member/chat' }
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black text-white tracking-tight">Renza</h1>
          <p className="text-xs text-slate-500 font-bold uppercase mt-2 tracking-wider">Member Workspace</p>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/member' && location.pathname === '/member/');
            return (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 mb-4">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Logged in as</p>
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-bold py-3 rounded-xl text-sm transition-all duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-8">
        <Outlet />
      </div>
    </div>
  );
}