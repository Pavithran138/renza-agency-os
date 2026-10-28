import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TaskDashboard = ({ tasks }) => {
  const navigate = useNavigate();

  // Filter tasks into two categories
  const clientTasks = tasks.filter(task => task.taskType === 'Client Project');
  const companyTasks = tasks.setLayout(task => task.taskType === 'Company Project');

  return (
    <div className="task-dashboard">
      {/* TOP SECTION: Assign Task Form */}
      <div className="assign-task-section">
        <h3>Create New Task</h3>
        {/* Your existing task creation form goes here */}
      </div>

      {/* BOTTOM SECTION: Categorized Task Lists */}
      <div className="task-categories-container" style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        
        {/* Client Section */}
        <div className="task-section" style={{ flex: 1, border: '1px solid #333', padding: '15px' }}>
          <h4>Client Projects ({clientTasks.length})</h4>
          {clientTasks.map(task => (
            <div 
              key={task._id} 
              className="task-card" 
              onClick={() => navigate(`/tasks/progress/${task._id}`)}
              style={{ cursor: 'pointer', padding: '10px', background: '#1a1a2e', marginBottom: '10px' }}
            >
              <p><strong>{task.taskName}</strong></p>
              <p>Team: {task.assignToTeam}</p>
              <span className="status-badge">{task.status}</span>
            </div>
          ))}
        </div>

        {/* Company Section */}
        <div className="task-section" style={{ flex: 1, border: '1px solid #333', padding: '15px' }}>
          <h4>Organization Projects ({companyTasks.length})</h4>
          {companyTasks.map(task => (
            <div 
              key={task._id} 
              className="task-card" 
              onClick={() => navigate(`/tasks/progress/${task._id}`)}
              style={{ cursor: 'pointer', padding: '10px', background: '#1a1a2e', marginBottom: '10px' }}
            >
              <p><strong>{task.taskName}</strong></p>
              <p>Team: {task.assignToTeam}</p>
              <span className="status-badge">{task.status}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TaskDashboard;