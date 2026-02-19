import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Student() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ hours: '', description: '' });
  const navigate = useNavigate();

  const currentUserEmail = localStorage.getItem('userEmail') || 'Guest';

  // --- NEW HELPER: TURNS EMAIL INTO FIRST NAME ---
  const formatName = (email) => {
    if (!email || email === 'Guest') return "Student";
    const namePart = email.split('@')[0]; 
    const firstName = namePart.split('.')[0]; 
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  const studentName = formatName(currentUserEmail);

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
    if (!id) return alert("Error: Log ID is missing!");
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
    if (!form.hours || !form.description) return alert('Fill all fields');
    
    try {
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

  const myLogs = logs.filter(log => log.student === currentUserEmail);

  const approvedHours = myLogs
    .filter(log => log.status === 'Approved')
    .reduce((sum, log) => sum + Number(log.hours), 0);

  const pendingHours = myLogs
    .filter(log => log.status === 'Pending')
    .reduce((sum, log) => sum + Number(log.hours), 0);

  const goal = 600;
  const progressPercentage = Math.min((approvedHours / goal) * 100, 100);
  const remainingHours = Math.max(goal - approvedHours, 0);

  const getProgressBarColor = () => {
    if (progressPercentage >= 100) return 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]';
    if (progressPercentage >= 80) return 'bg-green-500';
    if (progressPercentage >= 50) return 'bg-blue-400';
    return 'bg-blue-600';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-10 border-b-2 border-gray-200 pb-6">
        <div className="flex items-center gap-6">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
            <img src="/logo.png" alt="InternTrack Logo" className="w-40 h-auto object-contain" />
          </div>
          <div>
            {/* --- UPDATED TO SHOW NAME --- */}
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Student Portal</h1>
            <p className="text-gray-600 italic font-medium">Welcome back, <span className="text-blue-600 font-bold">{studentName}</span>!</p>
          </div>
        </div>
        <button onClick={() => {
          localStorage.removeItem('userEmail');
          navigate('/');
        }} className="bg-white text-red-500 border border-red-100 px-6 py-2 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm">Logout</button>
      </header>

      {/* STATS WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Approved Hours</p>
          <h3 className="text-3xl font-bold text-blue-900">{approvedHours} <span className="text-lg text-gray-400">/ {goal}</span></h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Pending Approval</p>
          <h3 className="text-3xl font-bold text-yellow-600">{pendingHours} <span className="text-lg text-gray-400">hrs</span></h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Remaining</p>
          <h3 className="text-3xl font-bold text-purple-900">{remainingHours} <span className="text-lg text-gray-400">hrs</span></h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Completion</p>
          <h3 className="text-3xl font-bold text-green-600">{progressPercentage.toFixed(1)}%</h3>
        </div>
      </div>

      {/* DYNAMIC PROGRESS BAR */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-gray-700">OJT Progress Journey</span>
          <span className="font-bold text-blue-600">{approvedHours} / {goal} Hours</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className={`${getProgressBarColor()} h-4 rounded-full transition-all duration-1000 ease-in-out`} 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit border-t-4 border-blue-600">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Submit Hours</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Logged in as:</label>
            <input type="text" readOnly className="border p-2 rounded bg-gray-50 text-gray-400 text-sm" value={currentUserEmail} />
            
            <label className="text-xs font-bold text-gray-500">Hours Rendered Today:</label>
            <input type="number" placeholder="Enter number of hours" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition" value={form.hours} onChange={(e) => setForm({...form, hours: e.target.value})} />
            
            <label className="text-xs font-bold text-gray-500">What did you do today?</label>
            <textarea placeholder="Describe your tasks..." className="border p-2 rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none transition" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            
            <button type="submit" className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md active:scale-95">Submit Log</button>
          </form>
        </div>

        {/* TABLE */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border-t-4 border-gray-200">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800 font-sans">My Activity History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="p-3 border-b text-xs uppercase tracking-wider font-black">Date</th>
                  <th className="p-3 border-b text-xs uppercase tracking-wider font-black">Hours</th>
                  <th className="p-3 border-b text-xs uppercase tracking-wider font-black">Task</th>
                  <th className="p-3 border-b text-xs uppercase tracking-wider font-black">Status</th>
                  <th className="p-3 border-b text-xs uppercase tracking-wider font-black">Action</th>
                </tr>
              </thead>
              <tbody>
                {myLogs.length === 0 ? (
                  <tr><td colSpan="5" className="p-10 text-center text-gray-400 italic font-sans">No logs found. Start by submitting your first entry!</td></tr>
                ) : (
                  myLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 transition border-b last:border-0">
                      <td className="p-3 text-sm text-gray-500">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-blue-900">{log.hours}h</td>
                      <td className="p-3 text-sm text-gray-600">{log.description}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${log.status === 'Approved' ? 'bg-green-100 text-green-700' : log.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button onClick={() => deleteLog(log._id)} className="text-gray-300 hover:text-red-600 transition p-2">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
