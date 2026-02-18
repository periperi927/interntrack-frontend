import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Supervisor() {
  const [logs, setLogs] = useState([]);
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

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`https://interntrack-api.onrender.com/api/logs/${id}`, { status: newStatus });
      fetchLogs();
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  // --- LOGIC: Group hours by Student ---
  const studentSummaries = logs.reduce((acc, log) => {
    const student = log.student;
    if (!acc[student]) {
      acc[student] = { approved: 0, pending: 0 };
    }
    if (log.status === 'Approved') acc[student].approved += Number(log.hours);
    if (log.status === 'Pending') acc[student].pending += Number(log.hours);
    return acc;
  }, {});

  const pendingLogs = logs.filter(log => log.status === 'Pending');
  const historyLogs = logs.filter(log => log.status !== 'Pending');

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-8 border-b-2 border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Admin Portal</h1>
            <p className="text-gray-600">Review and approve student hours</p>
          </div>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('userEmail');
            navigate('/');
          }} 
          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition"
        >
          Logout
        </button>
      </header>

      {/* SECTION: STUDENT PROGRESS TRACKER */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-blue-600">
        <h2 className="text-xl font-bold mb-4 text-blue-900">📊 Overall Student Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(studentSummaries).length === 0 ? (
            <p className="text-gray-500 italic">No student data found yet.</p>
          ) : (
            Object.keys(studentSummaries).map(studentEmail => {
              const data = studentSummaries[studentEmail];
              const percent = Math.min((data.approved / 600) * 100, 100).toFixed(1);
              return (
                <div key={studentEmail} className="border p-4 rounded-lg bg-gray-50">
                  <p className="font-bold text-gray-700 truncate">{studentEmail}</p>
                  <div className="flex justify-between text-sm my-2">
                    <span>Approved: <b>{data.approved}h</b></span>
                    <span>Pending: <b className="text-yellow-600">{data.pending}h</b></span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                  </div>
                  <p className="text-[10px] text-right mt-1 font-bold text-green-600">{percent}% Complete</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION: PENDING SUBMISSIONS */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-orange-400">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🕒 Pending Review ({pendingLogs.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Student</th>
                <th className="p-3 border-b">Hours</th>
                <th className="p-3 border-b">Task</th>
                <th className="p-3 border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLogs.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400 italic">No pending logs to review. Nice work!</td></tr>
              ) : (
                pendingLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition">
                    <td className="p-3 border-b">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="p-3 border-b font-semibold">{log.student}</td>
                    <td className="p-3 border-b font-bold text-blue-700">{log.hours}h</td>
                    <td className="p-3 border-b text-sm text-gray-600">{log.description}</td>
                    <td className="p-3 border-b text-center flex justify-center gap-2">
                      <button onClick={() => updateStatus(log._id, 'Approved')} className="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-green-600 shadow-sm transition">Approve</button>
                      <button onClick={() => updateStatus(log._id, 'Rejected')} className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-red-600 shadow-sm transition">Reject</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: HISTORY */}
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-gray-300">
        <h2 className="text-xl font-bold mb-4 text-gray-700">📜 Action History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Student</th>
                <th className="p-3 border-b">Hours</th>
                <th className="p-3 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {historyLogs.map((log) => (
                <tr key={log._id} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="p-3 text-sm text-gray-500">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="p-3 text-sm">{log.student}</td>
                  <td className="p-3 text-sm font-semibold">{log.hours}h</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      log.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
