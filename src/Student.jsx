import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Student() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ student: '', hours: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('https://interntrack-api.onrender.com/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs", error);
    }
  };

  // FIX 1: deleteLog should be its own separate function
  const deleteLog = async (id) => {
    if (window.confirm("Are you sure you want to delete this log?")) {
      try {
        await axios.delete(`https://interntrack-api.onrender.com/api/logs/${id}`);
        fetchLogs(); 
      } catch (error) {
        console.error("Error deleting log", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student || !form.hours || !form.description) return alert('Fill all fields');
    try {
      await axios.post('https://interntrack-api.onrender.com/api/logs', form);
      setForm({ ...form, hours: '', description: '' }); 
      fetchLogs(); 
    } catch (error) {
      console.error("Error saving log", error);
    }
  };

  const approvedHours = logs.filter(log => log.status === 'Approved').reduce((sum, log) => sum + Number(log.hours), 0);
  const pendingHours = logs.filter(log => log.status === 'Pending').reduce((sum, log) => sum + Number(log.hours), 0);
  const goal = 600;
  const progressPercentage = Math.min((approvedHours / goal) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-8 border-b-2 border-gray-200 pb-4">
        <div className="flex items-center gap-4">
           <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
           <div>
             <h1 className="text-3xl font-bold text-blue-900">Student Portal</h1>
             <p className="text-gray-600">Track and submit your daily OJT hours</p>
           </div>
        </div>
        <button onClick={() => navigate('/')} className="text-red-500 hover:text-red-700 font-bold transition">Logout</button>
      </header>

      {/* STATS & PROGRESS BAR (Kept same as yours) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Approved Hours</p>
          <h3 className="text-3xl font-bold text-blue-900">{approvedHours} <span className="text-lg text-gray-400">/ {goal}</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Pending Approval</p>
          <h3 className="text-3xl font-bold text-yellow-600">{pendingHours} hrs</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Completion</p>
          <h3 className="text-3xl font-bold text-green-600">{progressPercentage.toFixed(1)}%</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-gray-700">OJT Progress</span>
          <span className="font-bold text-blue-600">{approvedHours} / {goal} Hours</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-blue-600 h-4 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Log New Activity</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" placeholder="Your Name" className="border p-2 rounded bg-gray-50" value={form.student} onChange={(e) => setForm({...form, student: e.target.value})} />
            <input type="number" placeholder="Hours Rendered" className="border p-2 rounded bg-gray-50" value={form.hours} onChange={(e) => setForm({...form, hours: e.target.value})} />
            <textarea placeholder="Task Description" className="border p-2 rounded h-24 bg-gray-50" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition">Submit Log</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold">My Recent Submissions</h2>
            <button onClick={fetchLogs} className="text-blue-600 text-sm font-bold hover:underline">🔄 Refresh Status</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="p-3 border-b">Date</th>
                  <th className="p-3 border-b">Hours</th>
                  <th className="p-3 border-b">Task</th>
                  <th className="p-3 border-b">Status</th>
                  {/* FIX 2: Added the 'Action' header here! */}
                  <th className="p-3 border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition">
                    <td className="p-3 border-b text-sm">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="p-3 border-b font-bold">{log.hours}h</td>
                    <td className="p-4 border-b text-sm text-gray-600">{log.description}</td>
                    <td className="p-3 border-b">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        log.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                        log.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    {/* FIX 3: The button now lives inside the row mapping! */}
                    <td className="p-3 border-b text-center">
                      <button onClick={() => deleteLog(log._id)} className="hover:scale-125 transition-transform">🗑️</button>
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
