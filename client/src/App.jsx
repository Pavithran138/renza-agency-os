import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import MemberLayout from './layouts/MemberLayout';

// Public Page
import Login from './pages/Login';

// Admin Pages
import AdminHome from './pages/admin/AdminHome';
import AdminClients from './pages/admin/AdminClients';
import AdminTasks from './pages/admin/AdminTasks';
import AdminTeams from './pages/admin/AdminTeams';
import AdminChat from './pages/admin/AdminChat';
import AdminDirectory from './pages/admin/AdminDirectory'; 

// Member Pages
import MemberHome from './pages/member/MemberHome';
import MemberClients from './pages/member/MemberClients';
import MemberTasks from './pages/member/MemberTasks';
import MemberTeam from './pages/member/MemberTeam';
import MemberChat from './pages/member/MemberChat';
import MemberRepo from './pages/member/MemberRepo';

// Components
import TeamProgressChat from './components/TeamProgressChat';
import AdminRepo from './pages/admin/AdminRepo';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/" element={<Login />} />

        {/* Admin Routes with Sidebar Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Automatically redirect /admin to /admin/home so it is never blank */}
          <Route index element={<Navigate to="home" replace />} />
          
          <Route path="home" element={<AdminHome />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="teams" element={<AdminTeams />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="directory" element={<AdminDirectory />} />
          <Route path="repo" element={<AdminRepo />} />
          <Route path="tasks/progress/:taskId" element={<TeamProgressChat />} />
        </Route>

        {/* Member Routes with Sidebar Layout */}
        <Route path="/member" element={<MemberLayout />}>
          {/* Automatically redirect /member to /member/home so it is never blank */}
          <Route index element={<Navigate to="home" replace />} />
          
          <Route path="home" element={<MemberHome />} />
          <Route path="clients" element={<MemberClients />} />
          <Route path="tasks" element={<MemberTasks />} />
          <Route path="teams" element={<MemberTeam />} />
          <Route path="chat" element={<MemberChat />} />
          <Route path="repo" element={<MemberRepo />} />
          
          <Route path="tasks/progress/:taskId" element={<TeamProgressChat />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;