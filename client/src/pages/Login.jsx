import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get('/users');
      const validUser = res.data.find(u => u.email === email && u.password === password);

      if (validUser) {
        sessionStorage.setItem('currentUser', JSON.stringify(validUser));
        if (validUser.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/member');
        }
      } else {
        setError('Invalid credentials or user not found in database.');
      }
    } catch (err) {
      console.error("FULL ERROR:", err);
      // This will now print the exact reason for the failure on your screen
      setError(`Connection failed: ${err.message}. Ensure backend is running on port 5000.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-2 text-center">Renza</h1>
        <p className="text-slate-400 text-center text-sm mb-8">Sign in to your workspace</p>
        
        {error && <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 text-sm p-3 rounded-lg mb-6 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Email Address</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Password</label>
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition" 
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-3 rounded-lg mt-2 transition">
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}