import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Student from './Student';
import Supervisor from './Supervisor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The first page they see (Login) */}
        <Route path="/" element={<Login />} />
        
        {/* The hidden dashboard pages */}
        <Route path="/student" element={<Student />} />
        <Route path="/supervisor" element={<Supervisor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;