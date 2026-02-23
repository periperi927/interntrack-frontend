import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register'; // 1. Added this import
import Student from './Student';
import Supervisor from './Supervisor';

// --- THE SECURITY GUARD ---
const AdminGuard = ({ children }) => {
  const userEmail = localStorage.getItem('userEmail');
  const MAIN_ADMIN_EMAIL = 'perrydumaual33@gmail.com';

  if (!userEmail || userEmail.toLowerCase().trim() !== MAIN_ADMIN_EMAIL.toLowerCase().trim()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* 2. Added this route */}
        
        {/* Student Route */}
        <Route path="/student" element={<Student />} />
        
        {/* Protected Admin Route */}
        <Route 
          path="/supervisor" 
          element={
            <AdminGuard>
              <Supervisor />
            </AdminGuard>
          } 
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
