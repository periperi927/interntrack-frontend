import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Supervisor() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const downloadCSV = () => {
    const historyLogs = filteredLogs.filter(log => log.status !== 'Pending');
    const headers = ["Date", "Student", "Hours", "Task Description", "Status"];
    const rows = historyLogs.map(log => [
      new Date(log.date).toLocaleDateString(),
      log.student,
      log.hours,
      log.description.replace(/,/g, " "),
      log.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `OJT_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => 
    log.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const studentSummaries = filteredLogs.reduce((acc, log) => {
    const student = log.student;
    if (!acc[student]) acc[student] = { approved: 0, pending: 0 };
    if (log.status === 'Approved') acc[student].approved += Number(log.hours);
    if (log.status === 'Pending') acc[student].pending += Number(log.hours);
    return acc;
  }, {});

  const pendingLogs = filteredLogs.filter(log => log.status === 'Pending');
  const historyLogs = filteredLogs.filter(log => log.status !== 'Pending');

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-10 border-b-2 border-gray-200 pb-6">
        <div className="flex items-center gap-6">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
            <img src="/logo.png" alt="InternTrack Logo" className="w-44 h-auto object-contain" />
          </div>
          <div className="relative">
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
              Admin Portal
              {/* --- NEW: BOUNCING NOTIFICATION BADGE --- */}
              {pendingLogs.length > 0 && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-[12px] font-bold text-white animate-bounce shadow-lg">
                  {pendingLogs.length}
                </span>
              )}
            </h1>
            <p className="text-gray-500 font-medium italic">Review and approve student hours</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search student or task..." 
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none w-72 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 opacity-40 text-lg">🔍</span>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('userEmail'); navigate('/'); }} 
            className="bg-red-50 text-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm border border-red-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* OVERALL STUDENT PROGRESS */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-blue-600">
        <h2 className="text-xl font-bold mb-4 text-blue-900 flex items-center gap-2">
          📊 Overall Student Progress
          {/* --- NEW: ATTENTION PULSE --- */}
          {pendingLogs.length > 0 && (
            <span className="text-xs font-normal text-red-500 animate-pulse bg-red-50 px-2 py-1 rounded-full border border-red-100 italic">
              New submissions pending
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(studentSummaries).map(studentEmail => {
            const data = studentSummaries[studentEmail];
            const percent = Math.min((data.approved / 600) * 100, 100).toFixed(1);
            return (
              <div key={studentEmail} className="border p-4 rounded-lg bg-gray-50 shadow-inner hover:border-blue-300 transition-colors">
                <p className="font-bold text-gray-700 truncate">{studentEmail}</p>
                <div className="flex justify-between text-sm my-2">
                  <span>Approved: <b>{data.approved}h</b></span>
                  <span className={data.pending > 0 ? "text-orange-600 font-bold" : "text-gray-500"}>
                    Pending: <b>{data.pending}h</b>
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  {/* --- NEW: COLOR SHIFT AT 100% --- */}
                  <div 
                    className={`h-2 rounded-full transition-all duration-700 ${Number(percent) >= 100 ? 'bg-purple-600' : 'bg-green-500'}`} 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <p className={`text-[10px] text-right mt-1 font-bold ${Number(percent) >= 100 ? 'text-purple-600' : 'text-green-600'}`}>
                   {percent}% Complete
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* PENDING SUBMISSIONS */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-orange-400">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🕒 Pending Review ({pendingLogs.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Student</th>
                <th className="p-3 border-b">Hours</th>
                <th className="p-3 border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLogs.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">Everything is up to date!</td></tr>
              ) : (
                pendingLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition">
                    <td className="p-3 border-b text-sm">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="p-3 border-b font-semibold">{log.student}</td>
                    <td className="p-3 border-b font-bold text-blue-700">{log.hours}h</td>
                    <td className="p-3 border-b text-center flex justify-center gap-2">
                      <button onClick={() => updateStatus(log._id, 'Approved')} className="bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold hover:bg-green-600 shadow-md">Approve</button>
                      <button onClick={() => updateStatus(log._id, 'Rejected')} className="bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold hover:bg-red-600 shadow-md">Reject</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTION HISTORY + EXPORT */}
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">📜 Action History</h2>
          <button onClick={downloadCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition flex items-center gap-2">
            📥 Download Report
          </button>
        </div>
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
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${log.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
