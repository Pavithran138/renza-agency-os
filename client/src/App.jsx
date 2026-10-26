import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import MemberLayout from './layouts/MemberLayout';

// Auth
import Login from './pages/Login'; // Make sure this path matches your Login file location

// Admin Pages
import AdminHome from './pages/admin/AdminHome';
import AdminClients from './pages/admin/AdminClients';
import AdminTeams from './pages/admin/AdminTeams';
import AdminTasks from './pages/admin/AdminTasks';
import AdminRepo from './pages/admin/AdminRepo';
import AdminChat from './pages/admin/AdminChat';
import AdminDirectory from './pages/admin/AdminDirectory';

// Member Pages
import MemberHome from './pages/member/MemberHome';
import MemberClients from './pages/member/MemberClients'; // <-- New Import
import MemberTeam from './pages/member/MemberTeam';
import MemberTasks from './pages/member/MemberTasks';
import MemberRepo from './pages/member/MemberRepo';
import MemberChat from './pages/member/MemberChat';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="teams" element={<AdminTeams />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="repo" element={<AdminRepo />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="directory" element={<AdminDirectory />} />
        </Route>

        {/* Member Routes */}
        <Route path="/member" element={<MemberLayout />}>
          <Route index element={<MemberHome />} />
          <Route path="clients" element={<MemberClients />} /> {/* <-- New Route */}
          <Route path="teams" element={<MemberTeam />} />
          <Route path="tasks" element={<MemberTasks />} />
          <Route path="repo" element={<MemberRepo />} />
          <Route path="chat" element={<MemberChat />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}