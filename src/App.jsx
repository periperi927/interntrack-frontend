import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Student from './Student';
import Supervisor from './Supervisor';

// --- THE SECURITY GUARD ---
const ProtectedAdminRoute = ({ children }) => {
  const userEmail = localStorage.getItem('userEmail');
  const MAIN_ADMIN_EMAIL = 'perrydumaual33@gmail.com';

  if (!userEmail || userEmail.toLowerCase() !== MAIN_ADMIN_EMAIL.toLowerCase()) {
    // If they aren't the boss, send them back to login
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student" element={<Student />} />
        
        {/* WRAP THE SUPERVISOR ROUTE IN OUR GUARD */}
        <Route 
          path="/supervisor" 
          element={
            <ProtectedAdminRoute>
              <Supervisor />
            </ProtectedAdminRoute>
          } 
        />
      </Routes>
    </Router>
  );
}
