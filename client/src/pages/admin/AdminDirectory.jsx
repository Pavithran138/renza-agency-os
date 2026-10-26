import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminDirectory() {
  const [users, setUsers] = useState([]);
  
  // New employee form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      // Only show standard members in the directory
      setUsers(res.data.filter(u => u.role !== 'Admin'));
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      // Send the new employee data to MongoDB
      await api.post('/users', {
        name,
        email,
        password,
        role: 'Member'
      });
      
      // Clear form and refresh the grid
      setName('');
      setEmail('');
      setPassword('');
      fetchUsers(); 
    } catch (err) {
      console.error("Error adding employee:", err);
      alert("Failed to add employee. Check backend console.");
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to remove this employee?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error("Error deleting employee:", err);
      }
    }
  };

  return (
    <div className="max-w-6xl pb-10 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">Employee Directory</h2>
      
      {/* ADD NEW EMPLOYEE FORM */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-emerald-400 mb-4 border-b border-slate-800 pb-2">Register New Employee</h3>
        <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="john@company.com" className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Temporary Password</label>
            <input type="text" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password123" className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-bold text-sm transition h-[42px]">
            + Add Member
          </button>
        </form>
      </div>

      {/* EMPLOYEE GRID */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Active Roster</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.length === 0 && <p className="text-slate-500 col-span-full">No employees registered yet.</p>}
          
          {users.map(employee => (
            <div key={employee._id || employee.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl uppercase border border-indigo-500/30">
                  {employee.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white text-lg leading-tight">{employee.name}</p>
                  <p className="text-xs text-slate-400">{employee.email}</p>
                  <p className="text-[10px] text-slate-600 mt-1">Pass: {employee.password}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteEmployee(employee._id || employee.id)} 
                className="text-rose-500 opacity-0 group-hover:opacity-100 transition text-sm font-bold bg-rose-500/10 px-3 py-1.5 rounded hover:bg-rose-500 hover:text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}