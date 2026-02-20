import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Student from './Student';
import Supervisor from './Supervisor';

// --- THE SECURITY GUARD ---
// This checks if the user is the specific admin before letting them in
const AdminGuard = ({ children }) => {
  const userEmail = localStorage.getItem('userEmail');
  const MAIN_ADMIN_EMAIL = 'perrydumaual33@gmail.com';

  if (!userEmail || userEmail.toLowerCase() !== MAIN_ADMIN_EMAIL.toLowerCase()) {
    // If they are not the admin, kick them back to login
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route: The Entrance */}
        <Route path="/" element={<Login />} />
        
        {/* Student Route: General dashboard */}
        <Route path="/student" element={<Student />} />
        
        {/* Protected Admin Route: Wrapped in the Guard */}
        <Route 
          path="/supervisor" 
          element={
            <AdminGuard>
              <Supervisor />
            </AdminGuard>
          } 
        />

        {/* Catch-all: Redirects any unknown URL back to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
