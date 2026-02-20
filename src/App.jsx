import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Student from './Student';
import Supervisor from './Supervisor';

// --- THE SECURITY GUARD ---
// This component checks if the user is the specific admin
const AdminGuard = ({ children }) => {
  const userEmail = localStorage.getItem('userEmail');
  const MAIN_ADMIN_EMAIL = 'perrydumaual33@gmail.com';

  if (!userEmail || userEmail.toLowerCase() !== MAIN_ADMIN_EMAIL.toLowerCase()) {
    // Not the admin? Send them to the login page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        
        {/* Student Route (General) */}
        <Route path="/student" element={<Student />} />
        
        {/* PROTECTED Admin Route */}
        <Route 
          path="/supervisor" 
          element={
            <AdminGuard>
              <Supervisor />
            </AdminGuard>
          } 
        />

        {/* Catch-all: Redirect unknown pages to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
