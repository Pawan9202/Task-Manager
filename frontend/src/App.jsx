/**
 * App - Main Application Component
 * 
 * Defines all routes and implements protected route guards.
 * Uses React Router for client-side navigation.
 * 
 * Route Structure:
 * - Public:  /login, /signup
 * - Protected: /dashboard, /projects, /projects/:id, /tasks
 * 
 * @module App
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';

/**
 * ProtectedRoute - Route guard component
 * 
 * Redirects unauthenticated users to login page.
 * Optionally restricts access to admin role only.
 * 
 * Usage:
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>
 *   <ProtectedRoute adminOnly><Projects /></ProtectedRoute>
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {Boolean} props.adminOnly - If true, requires admin role
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar only renders when user is authenticated */}
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        {/* Redirect root based on auth state */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;
