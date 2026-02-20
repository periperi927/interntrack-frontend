import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Student from './Student';
import Supervisor from './Supervisor';
import Register from './Register'; // 1. Import the new file

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* 2. Add this line */}
        <Route path="/student" element={<Student />} />
        <Route path="/supervisor" element={<Supervisor />} />
      </Routes>
    </Router>
  );
}

export default App;
