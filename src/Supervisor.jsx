import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Supervisor() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATE MANAGEMENT ---
  const [modal, setModal] = useState({ show: false, logId: null, action: '', isBulk: false });
  const [selectedStudent, setSelectedStudent] = useState(null); 
  const [innerSearch, setInnerSearch] = useState(''); 
  const [statusFilter, setStatusFilter] = useState('All'); 
  
  const navigate = useNavigate();

  // --- CENTRALIZED ADMIN SETTING ---
  // Must match the email you set in Login.jsx
  const MAIN_ADMIN_EMAIL = 'your-admin-email@gmail.com'; 

  useEffect(() => { 
    // SECURITY GUARD: Check if the logged-in user is the Main Admin
    const currentUserEmail = localStorage.getItem('userEmail');

    if (!currentUserEmail || currentUserEmail.toLowerCase() !== MAIN_ADMIN_EMAIL.toLowerCase()) {
      // If not the admin, clear storage and kick them out
      localStorage.clear();
      navigate('/');
      return;
    }

    fetchLogs(); 
  }, [navigate]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('https://interntrack-api.onrender.com/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs", error);
    }
  };

  // --- UPDATED NAME LOGIC ---
  const displayName = (log) => {
    if (log.studentName) return log.studentName;
    const email = log.student || log; 
    const namePart = email.split('@')[0];
    const firstName = namePart.split('.')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString([], options);
  };

  const getTimeAgo = (dateString) => {
    const today = new Date();
    const diffTime = Math.abs(today.setHours(0,0,0,0) - new Date(dateString).setHours(0,0,0,0));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Active Today";
    if (diffDays === 1) return "Active Yesterday";
    return `Active ${diffDays} days ago`;
  };

  // --- ACTION HANDLERS ---
  const openConfirmModal = (e, id, action, isBulk = false) => {
    e.stopPropagation(); 
    setModal({ show: true, logId: id, action: action, isBulk: isBulk });
  };

  const confirmAction = async () => {
    try {
      if (modal.isBulk) {
        const studentPendingLogs = logs.filter(l => l.student === selectedStudent && l.status === 'Pending');
        await Promise.all(studentPendingLogs.map(log => 
          axios.put(`https://interntrack-api.onrender.com/api/logs/${log._id}`, { status: 'Approved' })
        ));
      } else {
        await axios.put(`https://interntrack-api.onrender.com/api/logs/${modal.logId}`, { status: modal.action });
      }
      setModal({ show: false, logId: null, action: '', isBulk: false });
      fetchLogs();
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const downloadCSV = (specificStudentEmail = null) => {
    const logsToExport = specificStudentEmail 
      ? logs.filter(log => log.student === specificStudentEmail)
      : filteredLogs.filter(log => log.status !== 'Pending');

    const headers = ["Date", "Time", "Student Name", "Email", "Hours", "Task Description", "Status"];
    const rows = logsToExport.map(log => [
      new Date(log.date).toLocaleDateString(),
      formatTime(log.date),
      log.studentName || displayName(log.student),
      log.student,
      log.hours,
      log.description.replace(/,/g, " "),
      log.status
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = specificStudentEmail 
      ? `OJT_Report_${displayName(specificStudentEmail)}_${new Date().toLocaleDateString()}.csv`
      : `OJT_Full_Report_${new Date().toLocaleDateString()}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- DATA LOGIC ---
  const filteredLogs = logs.filter(log => 
    (log.studentName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.student.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const studentSummaries = filteredLogs.reduce((acc, log) => {
    const student = log.student;
    if (!acc[student]) {
      acc[student] = { 
        name: log.studentName || displayName(student),
        approved: 0, 
        pending: 0, 
        lastDate: log.date, 
        lastTask: log.description 
      };
    }
    if (log.status === 'Approved') acc[student].approved += Number(log.hours);
    if (log.status === 'Pending') acc[student].pending += Number(log.hours);
    if (new Date(log.date) > new Date(acc[student].lastDate)) {
      acc[student].lastDate = log.date;
      acc[student].lastTask = log.description;
    }
    return acc;
  }, {});

  const pendingLogs = filteredLogs.filter(log => log.status === 'Pending');
  const historyLogs = filteredLogs.filter(log => log.status !== 'Pending');
  const totalStudents = Object.keys(studentSummaries).length;
  const totalApprovedHours = logs.filter(l => l.status === 'Approved').reduce((sum, l) => sum + Number(l.hours), 0);
  const currentStudentPendingCount = logs.filter(l => l.student === selectedStudent && l.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800 relative">
      
      {/* --- CONFIRMATION MODAL --- */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-100">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Confirm Action</h3>
            <p className="text-gray-500 text-sm mb-6">
              {modal.isBulk 
                ? `Are you sure you want to APPROVE ALL ${currentStudentPendingCount} pending logs for this student?` 
                : `Are you sure you want to ${modal.action.toUpperCase()} this entry?`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal({ show: false, logId: null, action: '', isBulk: false })} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={confirmAction} className={`flex-1 py-2 text-white rounded-lg font-bold shadow-md transition ${modal.action === 'Rejected' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                Yes, {modal.isBulk ? 'Approve All' : modal.action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STUDENT DETAIL MODAL --- */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 bg-blue-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">{studentSummaries[selectedStudent]?.name}'s Records</h2>
                <div className="flex items-center gap-2">
                    <p className="text-blue-200 text-xs">{selectedStudent}</p>
                    {currentStudentPendingCount > 0 && (
                        <button onClick={(e) => openConfirmModal(e, null, 'Approved', true)} className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase transition animate-pulse">Bulk Approve ({currentStudentPendingCount})</button>
                    )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none">
                  <option className="text-gray-800" value="All">All Status</option>
                  <option className="text-gray-800" value="Approved">Approved Only</option>
                  <option className="text-gray-800" value="Pending">Pending Only</option>
                  <option className="text-gray-800" value="Rejected">Rejected Only</option>
                </select>
                <input type="text" placeholder="Search tasks..." className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs focus:bg-white focus:text-gray-800 outline-none w-32 md:w-40" value={innerSearch} onChange={(e) => setInnerSearch(e.target.value)} />
                <button onClick={() => downloadCSV(selectedStudent)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold transition">📥 Download</button>
                <button onClick={() => {setSelectedStudent(null); setInnerSearch(''); setStatusFilter('All');}} className="bg-white/10 hover:bg-white/20 p-2 rounded-full px-4 font-bold">✕</button>
              </div>
            </div>
            <div className="overflow-y-auto p-6 flex-1 bg-white">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="text-gray-400 text-[10px] uppercase font-black">
                    <th className="p-3 border-b">Date</th>
                    <th className="p-3 border-b">Hours</th>
                    <th className="p-3 border-b">Task Description</th>
                    <th className="p-3 border-b text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.filter(l => l.student === selectedStudent).filter(l => statusFilter === 'All' || l.status === statusFilter).filter(l => l.description.toLowerCase().includes(innerSearch.toLowerCase())).sort((a,b) => new Date(b.date) - new Date(a.date)).map(log => (
                    <tr key={log._id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 text-sm">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="p-3 text-sm font-bold text-blue-900">{log.hours}h</td>
                      <td className="p-3 text-sm text-gray-600 max-w-md truncate">{log.description}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${log.status === 'Approved' ? 'bg-green-100 text-green-700' : log.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex justify-between items-center mb-10 border-b-2 border-gray-200 pb-6">
        <div className="flex items-center gap-6">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <img src="/logo.png" alt="Logo" className="w-44 h-auto" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
              Admin Portal
              {pendingLogs.length > 0 && <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white animate-bounce shadow-lg">{pendingLogs.length}</span>}
            </h1>
            <p className="text-gray-500 font-medium italic">Review and approve student hours</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input type="text" placeholder="Search name or task..." className="pl-4 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 w-72 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="bg-red-50 text-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100">Logout</button>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-blue-200 text-xs font-black uppercase tracking-widest leading-none mb-1">Total Students</p>
          <h2 className="text-4xl font-black">{totalStudents}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-orange-500">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest leading-none mb-1">Pending Review</p>
          <h2 className="text-4xl font-black text-orange-600">{pendingLogs.length}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-purple-600">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest leading-none mb-1">Approved Hours</p>
          <h2 className="text-4xl font-black text-purple-700">{totalApprovedHours}h</h2>
        </div>
      </div>

      {/* LIVE TASK FEED */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-10 overflow-hidden">
        <div className="flex items-center gap-2 mb-3 border-b pb-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-tighter">Live Activity Feed</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {Object.keys(studentSummaries).map(email => (
                <div key={email} className="min-w-[200px] bg-gray-50 p-3 rounded-lg border-l-4 border-blue-900 shadow-sm">
                    <p className="text-[10px] font-black text-blue-900 truncate">{studentSummaries[email].name}</p>
                    <p className="text-[11px] text-gray-600 line-clamp-1 italic">"{studentSummaries[email].lastTask}"</p>
                </div>
            ))}
        </div>
      </div>

      {/* PROGRESS TRACKING */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-blue-600">
        <h2 className="text-xl font-bold mb-4 text-blue-900 flex items-center gap-2">📊 Student Progress Tracking <span className="text-[10px] font-normal bg-blue-50 text-blue-600 px-2 py-1 rounded font-mono uppercase">Target: 300 Hours</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(studentSummaries).map(studentEmail => {
            const data = studentSummaries[studentEmail];
            const percent = Math.min((data.approved / 300) * 100, 100).toFixed(1);
            const isDone = Number(percent) >= 100;
            const isActiveToday = getTimeAgo(data.lastDate) === "Active Today";
            
            return (
              <div key={studentEmail} onClick={() => setSelectedStudent(studentEmail)} className={`border p-4 rounded-lg bg-gray-50 shadow-inner hover:border-blue-400 transition-all cursor-pointer group ${isDone ? 'ring-2 ring-purple-400 bg-purple-50/30' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-700 group-hover:text-blue-700 transition">{data.name}</p>
                            {isDone && <span className="bg-purple-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black animate-bounce">GOAL REACHED</span>}
                        </div>
                        <p className="text-[10px] text-gray-400 italic mt-0.5">{studentEmail}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${isActiveToday ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-200 text-gray-500'}`}>
                        {getTimeAgo(data.lastDate)}
                    </span>
                </div>
                <div className="flex justify-between text-sm my-2">
                  <span>Approved: <b>{data.approved}h</b></span>
                  <span className={data.pending > 0 ? "text-orange-600 font-bold" : "text-gray-500"}>Pending: <b>{data.pending}h</b></span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-700 ${isDone ? 'bg-purple-600' : 'bg-green-500'}`} style={{ width: `${percent}%` }}></div>
                </div>
                <p className={`text-[10px] text-right mt-1 font-bold ${isDone ? 'text-purple-600' : 'text-green-600'}`}>{percent}% Complete</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* PENDING TABLE */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-orange-400">
        <h2 className="text-xl font-bold mb-4 text-orange-900">🕒 Pending Review ({pendingLogs.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm font-bold">
                <th className="p-3 border-b">Date / Time</th>
                <th className="p-3 border-b">Student Name</th>
                <th className="p-3 border-b">Email</th>
                <th className="p-3 border-b">Hours</th>
                <th className="p-3 border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLogs.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400 italic">Everything is up to date!</td></tr>
              ) : (
                pendingLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition border-b last:border-0">
                    <td className="p-3 text-xs leading-tight">{new Date(log.date).toLocaleDateString()}<br/><span className="text-blue-500 font-bold">{formatTime(log.date)}</span></td>
                    <td className="p-3 font-semibold text-blue-900">{log.studentName || displayName(log)}</td>
                    <td className="p-3 text-xs text-gray-400">{log.student}</td>
                    <td className="p-3 font-bold text-blue-700">{log.hours}h</td>
                    <td className="p-3 text-center flex justify-center gap-2">
                      <button onClick={(e) => openConfirmModal(e, log._id, 'Approved')} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-black shadow-md hover:bg-green-600 transition">Approve</button>
                      <button onClick={(e) => openConfirmModal(e, log._id, 'Rejected')} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-black shadow-md hover:bg-red-600 transition">Reject</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">📜 Action History</h2>
          <button onClick={() => downloadCSV()} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-lg">📥 Download Full Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-tight">
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Student Name</th>
                <th className="p-3 border-b">Hours</th>
                <th className="p-3 border-b text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {historyLogs.map((log) => (
                <tr key={log._id} className="border-b last:border-0 hover:bg-gray-50/50 transition">
                  <td className="p-3 text-sm text-gray-500">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-bold text-gray-800">{log.studentName || displayName(log)}</td>
                  <td className="p-3 text-sm font-black text-blue-900">{log.hours}h</td>
                  <td className="p-3 text-right"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${log.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
