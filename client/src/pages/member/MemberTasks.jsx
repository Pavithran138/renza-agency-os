import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function MemberTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || { name: 'Member' };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // CACHE BUSTER: Ensure we get fresh data from the database
      const timestamp = new Date().getTime();
      const res = await api.get(`/tasks?t=${timestamp}`);
      
      const allTasks = Array.isArray(res.data) ? res.data : [];
      setTasks(allTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    }
  };

  // Allow members to click the status button to cycle through statuses
  const toggleStatus = async (task, e) => {
    e.stopPropagation();
    const statuses = ['PENDING', 'IN PROGRESS', 'COMPLETED'];
    const currentStatus = task.status ? task.status.toUpperCase() : 'PENDING';
    
    let currentIndex = statuses.indexOf(currentStatus);
    if (currentIndex === -1) currentIndex = 0;
    
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    // Optimistic UI update for instant feedback
    setTasks(tasks.map(t => {
      const tId = t._id || t.id;
      const taskId = task._id || task.id;
      return tId === taskId ? { ...t, status: nextStatus } : t;
    }));
    
    try {
      await api.put(`/tasks/${task._id || task.id}`, { status: nextStatus });
    } catch (err) {
      console.error("Error updating status:", err);
      fetchTasks(); // Revert to database state if the update fails
    }
  };

  return (
    <div style={{ padding: '20px', color: 'white', maxWidth: '1000px' }}>
      <h2 style={{ color: 'white', marginBottom: '25px', fontSize: '28px' }}>My Task Workspace</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {tasks.length === 0 ? (
          <div style={{ background: '#1a1b2e', padding: '30px', borderRadius: '10px', textAlign: 'center', border: '1px solid #334155' }}>
            <p style={{ color: 'gray', fontSize: '16px' }}>No tasks are currently assigned to you or your team.</p>
          </div>
        ) : (
          tasks.map(task => {
            const taskId = task._id || task.id;
            
            // Determine button color based on status
            const statusText = task.status?.toUpperCase() || 'PENDING';
            let statusColor = '#334155'; // Default Gray for Pending
            if (statusText === 'IN PROGRESS') statusColor = '#d97706'; // Orange
            if (statusText === 'COMPLETED') statusColor = '#059669'; // Green

            return (
              <div 
                key={taskId}
                style={{ 
                  background: '#1a1b2e', 
                  padding: '20px 25px', 
                  borderRadius: '10px', 
                  border: '1px solid #334155',
                  borderLeft: '4px solid #6366f1',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#e2e8f0' }}>
                    {task.taskName || task.name || 'Unnamed Task'}
                  </h3>
                  
                  {(task.clientName || task.client) && (
                    <p style={{ margin: '0 0 5px 0', color: '#60a5fa', fontSize: '14px', fontWeight: 'bold' }}>
                      Client: {task.clientName || task.client}
                    </p>
                  )}
                  
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                    Assigned to: <strong style={{ color: 'white' }}>{task.assignee || task.assignedTo}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  
                  {/* Clickable Status Button */}
                  <button 
                    onClick={(e) => toggleStatus(task, e)}
                    style={{ 
                      background: statusColor,
                      color: 'white', 
                      border: 'none', 
                      padding: '10px 15px', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      transition: 'background 0.2s',
                      minWidth: '120px'
                    }}
                    title="Click to update task status"
                  >
                    {statusText} 
                  </button>

                  {/* Route to the Real-Time Chat System */}
                  <button 
                    onClick={() => navigate(`/member/tasks/progress/${taskId}`)}
                    style={{ 
                      background: '#6366f1', 
                      color: 'white', 
                      border: 'none', 
                      padding: '10px 20px', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>💬</span> Open Chat
                  </button>
                  
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}