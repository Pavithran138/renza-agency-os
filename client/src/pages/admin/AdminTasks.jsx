import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api'; // Using your custom Axios instance to fetch data properly

const AdminTasks = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('overview');

  // Form States
  const [taskName, setTaskName] = useState('');
  const [projectType, setProjectType] = useState('Client'); 
  const [assignType, setAssignType] = useState('Team'); 
  const [assignee, setAssignee] = useState('');
  
  // Client Specific States
  const [selectedClient, setSelectedClient] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  // MongoDB Data States
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);

  // FETCH DATA FROM MONGODB ON LOAD
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Properly fetching using your Axios API setup
      const tasksRes = await api.get('/tasks');
      setTasks(tasksRes.data || []);

      const teamsRes = await api.get('/teams');
      setTeams(teamsRes.data || []);

      const clientsRes = await api.get('/clients');
      setClients(clientsRes.data || []);

      const usersRes = await api.get('/users');
      // Filter out admin, keep only members
      setMembers(usersRes.data ? usersRes.data.filter(u => u.role === 'Member') : []);
    } catch (error) {
      console.error("Error fetching data from MongoDB:", error);
    }
  };

  const displayedTasks = tasks.filter(task => task.projectType === currentView || task.type === currentView);

  // SAVE NEW TASK
  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskName || !assignee) return alert("Please fill all required fields");
    
    let finalClientName = null;
    if (projectType === 'Client') {
      finalClientName = isNewClient ? newClientName : selectedClient;
      if (!finalClientName) return alert("Please provide client details");
    }

    const newTaskData = {
      taskName: taskName, // or 'name' depending on your backend schema
      name: taskName, 
      projectType: projectType,
      type: projectType,
      clientName: finalClientName,
      client: finalClientName,
      assignType: assignType,
      assignee: assignee,
      assignedTo: assignee,
      status: 'PENDING'
    };
    
    try {
      const response = await api.post('/tasks', newTaskData);
      // Immediately add the new task to the UI
      setTasks([...tasks, response.data]);
      
      // Reset form
      setTaskName('');
      setAssignee('');
      setSelectedClient('');
      setNewClientName('');
      setIsNewClient(false);
      alert("Task Assigned Successfully!");
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task.");
    }
  };

  // DELETE TASK
  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (!taskId) return alert("Error: Could not find Task ID.");

    if (window.confirm("Are you sure you want to permanently delete this task?")) {
      const prevTasks = [...tasks];
      // Instantly remove from UI using strict string conversion
      setTasks(tasks.filter(task => String(task._id) !== String(taskId) && String(task.id) !== String(taskId)));
      
      try {
        await api.delete(`/tasks/${taskId}`);
      } catch (error) {
        console.error("Error deleting task:", error);
        setTasks(prevTasks); // Restore if DB fails
      }
    }
  };

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      {currentView === 'overview' && (
        <>
          <div style={{ background: '#1a1b2e', padding: '25px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #334155' }}>
            <h3 style={{ color: '#4ade80', marginTop: 0, marginBottom: '20px' }}>Assign New Task</h3>
            <form onSubmit={handleAssignTask} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'gray', fontSize: '14px' }}>Task Name</label>
                <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="e.g. Design Homepage" style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#0f172a', border: '1px solid #334155', color: 'white' }} required />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'gray', fontSize: '14px' }}>Project Category</label>
                  <select value={projectType} onChange={(e) => setProjectType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}>
                    <option value="Client">Client Project</option>
                    <option value="Company">Company Project</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'gray', fontSize: '14px' }}>Assign To</label>
                  <select value={assignType} onChange={(e) => { setAssignType(e.target.value); setAssignee(''); }} style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}>
                    <option value="Team">Team</option>
                    <option value="Individual">Individual Member</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC CLIENT SELECTION */}
              {projectType === 'Client' && (
                <div style={{ background: '#292a40', padding: '15px', borderRadius: '8px', border: '1px dashed #60a5fa' }}>
                  <select 
                    value={isNewClient ? 'new' : selectedClient} 
                    onChange={(e) => { setIsNewClient(e.target.value === 'new'); setSelectedClient(e.target.value !== 'new' ? e.target.value : ''); }} 
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#0f172a', border: '1px solid #334155', color: 'white', marginBottom: isNewClient ? '10px' : '0' }}
                  >
                    <option value="">-- Select Existing Client --</option>
                    {clients.map(c => {
                      const cName = typeof c === 'object' ? (c.name || c.clientName || c.companyName) : c;
                      return <option key={c._id || c.id || cName} value={cName}>{cName}</option>;
                    })}
                    <option value="new">+ Add New Client</option>
                  </select>
                  {isNewClient && (
                    <input type="text" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Enter new client name..." style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#0f172a', border: '1px solid #60a5fa', color: 'white' }} />
                  )}
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'gray', fontSize: '14px' }}>Select {assignType}</label>
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#0f172a', border: '1px solid #334155', color: 'white' }} required>
                  <option value="">-- Select {assignType} --</option>
                  {assignType === 'Team' 
                    ? teams.map(t => {
                        const tName = typeof t === 'object' ? (t.teamName || t.name) : t;
                        return <option key={t._id || t.id || tName} value={tName}>{tName}</option>;
                      })
                    : members.map(m => {
                        const mName = typeof m === 'object' ? (m.name || m.username) : m;
                        return <option key={m._id || m.id || mName} value={mName}>{mName}</option>;
                      })
                  }
                </select>
              </div>

              <button type="submit" style={{ background: '#6366f1', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>+ Assign Task</button>
            </form>
          </div>

          <h3 style={{ color: 'white', marginBottom: '15px' }}>Task Workspaces</h3>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div onClick={() => setCurrentView('Client')} style={{ flex: 1, background: '#1a1b2e', padding: '30px 20px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #334155', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📁</div>
              <h3 style={{ color: '#60a5fa', margin: '0 0 5px 0' }}>Client Tasks</h3>
            </div>
            <div onClick={() => setCurrentView('Company')} style={{ flex: 1, background: '#1a1b2e', padding: '30px 20px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #334155', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏢</div>
              <h3 style={{ color: '#f97316', margin: '0 0 5px 0' }}>Company Tasks</h3>
            </div>
          </div>
        </>
      )}

      {currentView !== 'overview' && (
        <div>
          <button onClick={() => setCurrentView('overview')} style={{ background: '#334155', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}>← Back to Workspaces</button>
          <h2 style={{ color: currentView === 'Client' ? '#60a5fa' : '#f97316' }}>{currentView} Projects Workspace</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            {displayedTasks.length === 0 ? <p style={{ color: 'gray' }}>No tasks found.</p> : displayedTasks.map(task => (
              <div key={task._id || task.id} onClick={() => navigate(`/admin/tasks/progress/${task._id || task.id}`)} style={{ background: '#1a1b2e', padding: '20px', borderRadius: '8px', cursor: 'pointer', borderLeft: `4px solid ${currentView === 'Client' ? '#60a5fa' : '#f97316'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{task.taskName || task.name}</h4>
                  {(task.clientName || task.client) && <p style={{ margin: '0 0 5px 0', color: '#60a5fa', fontSize: '13px' }}>Client: {task.clientName || task.client}</p>}
                  <p style={{ margin: 0, color: 'gray', fontSize: '14px' }}>Assigned to: <strong style={{ color: 'white' }}>{task.assignee || task.assignedTo}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ background: '#334155', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}>{task.status || 'PENDING'}</span>
                  
                  <button onClick={(e) => handleDeleteTask(task._id || task.id, e)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;