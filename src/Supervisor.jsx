import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Supervisor() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- NEW MODAL STATE (Nothing else removed) ---
  const [modal, setModal] = useState({ show: false, logId: null, action: '' });
  
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

  const formatName = (email) => {
    if (!email) return "Unknown";
    const namePart = email.split('@')[0];
    const firstName = namePart.split('.')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString([], options);
  };

  const getTimeAgo = (dateString) => {
    const logDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.setHours(0,0,0,0) - new Date(dateString).setHours(0,0,0,0));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Active Today";
    if (diffDays === 1) return "Active Yesterday";
    return `Active ${diffDays} days ago`;
  };

  // --- MODAL HANDLERS ---
  const openConfirmModal = (id, action) => {
    setModal({ show: true, logId: id, action: action });
  };

  const confirmAction = async () => {
    try {
      await axios.put(`https://interntrack-api.onrender.com/api/logs/${modal.logId}`, { status: modal.action });
      setModal({ show: false, logId: null, action: '' });
      fetchLogs();
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const downloadCSV = () => {
    const historyLogs = filteredLogs.filter(log => log.status !== 'Pending');
    const headers = ["Date", "Time", "Student", "Hours", "Task Description", "Status"];
    const rows = historyLogs.map(log => [
      new Date(log.date).toLocaleDateString(),
      formatTime(log.date),
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
    if (!acc[student]) {
      acc[student] = { approved: 0, pending: 0, lastDate: log.date };
    }
    if (log.status === 'Approved') acc[student].approved += Number(log.hours);
    if (log.status === 'Pending') acc[student].pending += Number(log.hours);
    if (new Date(log.date) > new Date(acc[student].lastDate)) {
      acc[student].lastDate = log.date;
    }
    return acc;
  }, {});

  const pendingLogs = filteredLogs.filter(log => log.status === 'Pending');
  const historyLogs = filteredLogs.filter(log => log.status !== 'Pending');
  const totalStudents = Object.keys(studentSummaries).length;
  const totalApprovedHours = logs.filter(l => l.status === 'Approved').reduce((sum, l) => sum + Number(l.hours), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800 relative">
      
      {/* --- CONFIRMATION MODAL --- */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-100 scale-100 transition-all">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Confirm Action</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to <span className="font-bold uppercase italic">{modal.action}</span> this entry?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setModal({ show: false, logId: null, action: '' })}
                className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                className={`flex-1 py-2 text-white rounded-lg font-bold shadow-md transition ${modal.action === 'Approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
              >
                Yes, {modal.action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex justify-between items-center mb-10 border-b-2 border-gray-200 pb-6">
        <div className="flex items-center gap-6">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
            <img src="/logo.png" alt="InternTrack Logo" className="w-44 h-auto object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
              Admin Portal
              {pendingLogs.length > 0 && (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-[14px] font-black text-white animate-bounce shadow-lg">
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
            <span className="absolute left-3 top-2.5 opacity-40">🔍</span>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('userEmail'); navigate('/'); }} 
            className="bg-red-50 text-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* QUICK STATS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-transform">
          <p className="text-blue-200 text-xs font-black uppercase tracking-widest leading-none mb-1">Total Active Students</p>
          <h2 className="text-4xl font-black">{totalStudents}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-orange-500 transform hover:scale-[1.02] transition-transform">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest leading-none mb-1">Pending Reviews</p>
          <h2 className="text-4xl font-black text-orange-600">{pendingLogs.length}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-purple-600 transform hover:scale-[1.02] transition-transform">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest leading-none mb-1">Total Hours Approved</p>
          <h2 className="text-4xl font-black text-purple-700">{totalApprovedHours}h</h2>
        </div>
      </div>

      {/* INDIVIDUAL PROGRESS */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-blue-600">
        <h2 className="text-xl font-bold mb-4 text-blue-900 flex items-center gap-2">📊 Student Progress Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(studentSummaries).map(studentEmail => {
            const data = studentSummaries[studentEmail];
            const percent = Math.min((data.approved / 600) * 100, 100).toFixed(1);
            const isActiveToday = getTimeAgo(data.lastDate) === "Active Today";
            
            return (
              <div key={studentEmail} className="border p-4 rounded-lg bg-gray-50 shadow-inner hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="font-bold text-gray-700 truncate text-lg leading-none">{formatName(studentEmail)}</p>
                        <p className="text-[10px] text-gray-400 italic mt-1">{studentEmail}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${isActiveToday ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-200 text-gray-500'}`}>
                        {getTimeAgo(data.lastDate)}
                    </span>
                </div>
                <div className="flex justify-between text-sm my-2">
                  <span>Approved: <b>{data.approved}h</b></span>
                  <span className={data.pending > 0 ? "text-orange-600 font-bold" : "text-gray-500"}>Pending: <b>{data.pending}h</b></span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-700 ${Number(percent) >= 100 ? 'bg-purple-600' : 'bg-green-500'}`} style={{ width: `${percent}%` }}></div>
                </div>
                <p className={`text-[10px] text-right mt-1 font-bold ${Number(percent) >= 100 ? 'text-purple-600' : 'text-green-600'}`}>{percent}% Complete</p>
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
              <tr className="bg-gray-50 text-gray-700 text-sm">
                <th className="p-3 border-b">Date / Time</th>
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
                  <tr key={log._id} className="hover:bg-gray-50 transition border-b last:border-0">
                    <td className="p-3 text-xs leading-tight">
                        {new Date(log.date).toLocaleDateString()}<br/>
                        <span className="text-blue-500 font-bold">{formatTime(log.date)}</span>
                    </td>
                    <td className="p-3 font-semibold text-blue-900">{formatName(log.student)}</td>
                    <td className="p-3 font-bold text-blue-700">{log.hours}h</td>
                    <td className="p-3 text-center flex justify-center gap-2">
                      <button onClick={() => openConfirmModal(log._id, 'Approved')} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-black shadow-md hover:bg-green-600 transition">Approve</button>
                      <button onClick={() => openConfirmModal(log._id, 'Rejected')} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-black shadow-md hover:bg-red-600 transition">Reject</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTION HISTORY */}
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">📜 Action History</h2>
          <button onClick={downloadCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-lg">
            📥 Download Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm font-bold uppercase tracking-tight">
                <th className="p-3 border-b text-xs">Date</th>
                <th className="p-3 border-b text-xs">Student</th>
                <th className="p-3 border-b text-xs">Hours</th>
                <th className="p-3 border-b text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {historyLogs.map((log) => (
                <tr key={log._id} className="border-b last:border-0 hover:bg-gray-50/50 transition">
                  <td className="p-3 text-sm text-gray-500 font-medium">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-bold text-gray-800">{formatName(log.student)}</td>
                  <td className="p-3 text-sm font-black text-blue-900">{log.hours}h</td>
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
