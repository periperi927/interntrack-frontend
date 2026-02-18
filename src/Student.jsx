import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Student() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ hours: '', description: '' });
  const navigate = useNavigate();

  // 1. THIS IS YOUR KEY: Grab the email we just saved in Login.jsx
  const currentUserEmail = localStorage.getItem('userEmail') || 'Guest';

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('https://interntrack-api.onrender.com/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs", error);
    }
  };

  const deleteLog = async (id) => {
  if (!id) return alert("Error: Log ID is missing!"); // Safety check
  
  if (window.confirm("Are you sure you want to delete this log?")) {
    try {
      // Ensure there is a slash before the ${id}
      await axios.delete(`https://interntrack-api.onrender.com/api/logs/${id}`);
      fetchLogs(); 
    } catch (error) {
      console.error("Error deleting log", error);
    }
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hours || !form.description) return alert('Fill all fields');
    
    try {
      // We automatically use the email from login so they can't fake their name
      await axios.post('https://interntrack-api.onrender.com/api/logs', {
        ...form,
        student: currentUserEmail,
        date: new Date()
      });
      setForm({ hours: '', description: '' }); 
      fetchLogs(); 
    } catch (error) {
      console.error("Error saving log", error);
    }
  };

  // --- THE PRIVACY FILTER ---
  // This line makes sure you ONLY see your own logs in the table and calculations
  const myLogs = logs.filter(log => log.student === currentUserEmail);

  const approvedHours = myLogs
    .filter(log => log.status === 'Approved')
    .reduce((sum, log) => sum + Number(log.hours), 0);

  const pendingHours = myLogs
    .filter(log => log.status === 'Pending')
    .reduce((sum, log) => sum + Number(log.hours), 0);

  const goal = 600;
  const progressPercentage = Math.min((approvedHours / goal) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-8 border-b-2 border-gray-200 pb-4">
        <div className="flex items-center gap-6">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain drop-shadow-md" />
        <div>
          <h1 className="text-4xl font-extrabold text-blue-900">Student Portal</h1>
          <p className="text-gray-600 italic">Welcome back, {currentUserEmail}</p>
        </div>
        </div>
        <button onClick={() => {
          localStorage.removeItem('userEmail'); // Clean up memory on logout
          navigate('/');
        }} className="text-red-500 hover:text-red-700 font-bold transition">Logout</button>
      </header>

      {/* STATS WIDGETS (Now using myLogs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 uppercase font-bold">My Approved Hours</p>
          <h3 className="text-3xl font-bold text-blue-900">{approvedHours} <span className="text-lg text-gray-400">/ {goal}</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 uppercase font-bold">My Pending Approval</p>
          <h3 className="text-3xl font-bold text-yellow-600">{pendingHours} hrs</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 uppercase font-bold">My Completion</p>
          <h3 className="text-3xl font-bold text-green-600">{progressPercentage.toFixed(1)}%</h3>
        </div>
      </div>

      {/* FORM & TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Submit Hours</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Your ID/Email:</label>
            <input type="text" readOnly className="border p-2 rounded bg-gray-100 text-gray-500" value={currentUserEmail} />
            
            <input type="number" placeholder="Hours Rendered" className="border p-2 rounded" value={form.hours} onChange={(e) => setForm({...form, hours: e.target.value})} />
            <textarea placeholder="Task Description" className="border p-2 rounded h-24" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition">Submit Log</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">My History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="p-3 border-b">Date</th>
                  <th className="p-3 border-b">Hours</th>
                  <th className="p-3 border-b">Task</th>
                  <th className="p-3 border-b">Status</th>
                  <th className="p-3 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {/* We map over myLogs instead of logs! */}
                {myLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="p-3 border-b text-sm">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="p-3 border-b font-bold">{log.hours}h</td>
                    <td className="p-3 border-b text-sm text-gray-600">{log.description}</td>
                    <td className="p-3 border-b">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.status === 'Approved' ? 'bg-green-100 text-green-700' : log.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 border-b">
                      <button onClick={() => deleteLog(log._id)} // MUST have the underscore
        className="text-red-400 hover:text-red-600 transition"
      >
        🗑️
      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}





