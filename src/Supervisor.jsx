import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Supervisor() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // --- STATE MANAGEMENT ---
  const [modal, setModal] = useState({ show: false, logId: null, action: '', isBulk: false });
  const [selectedStudent, setSelectedStudent] = useState(null); 
  const [innerSearch, setInnerSearch] = useState(''); 
  const [statusFilter, setStatusFilter] = useState('All'); 
  
  const navigate = useNavigate();

  // --- CENTRALIZED ADMIN SETTING ---
  const MAIN_ADMIN_EMAIL = 'perrydumaual33@gmail.com'; 

  useEffect(() => { 
    const currentUserEmail = localStorage.getItem('userEmail');
    if (!currentUserEmail || currentUserEmail.toLowerCase() !== MAIN_ADMIN_EMAIL.toLowerCase()) {
      localStorage.clear();
      navigate('/');
      return;
    }
    fetchLogs(); 
  }, [navigate]);

  const fetchLogs = async () => {
    setLoading(true); 
    try {
      const response = await axios.get('https://interntrack-api.onrender.com/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs", error);
    } finally {
      // Small delay to make the transition smooth
      setTimeout(() => setLoading(false), 800);
    }
  };

  const displayName = (log) => {
    if (log.studentName && log.studentName.trim() !== "") return log.studentName;
    const email = typeof log === 'string' ? log : (log.student || "");
    if (!email) return "Unknown Student";
    const namePart = email.split('@')[0];
    const nameArray = namePart.split(/[._0-9]+/); 
    return nameArray
      .filter(part => part.length > 0)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
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

  // --- SKELETON GATEKEEPER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans">
        <div className="bg-[#020617] pt-12 pb-32 px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-3xl animate-pulse"></div>
                <div className="h-10 w-64 bg-white/10 rounded-xl animate-pulse"></div>
             </div>
             <div className="h-12 w-80 bg-white/10 rounded-2xl animate-pulse"></div>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-8 -mt-20 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-[2rem] shadow-xl animate-pulse"></div>)}
          </div>
          <div className="h-24 bg-white/60 rounded-[2rem] animate-pulse"></div>
          <div className="h-96 bg-white rounded-[2.5rem] animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="h-80 bg-white rounded-[2.5rem] animate-pulse"></div>
             <div className="h-80 bg-white rounded-[2.5rem] animate-pulse"></div>
          </div>
        </main>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20">
      
      {/* --- CONFIRMATION MODAL --- */}
      {modal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full border border-slate-100">
            <h3 className="text-2xl font-black text-slate-800 mb-2">Confirm Action</h3>
            <p className="text-slate-500 text-sm mb-8">
              {modal.isBulk 
                ? `Are you sure you want to APPROVE ALL ${currentStudentPendingCount} pending logs for this student?` 
                : `Are you sure you want to ${modal.action.toUpperCase()} this entry?`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal({ show: false, logId: null, action: '', isBulk: false })} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Cancel</button>
              <button onClick={confirmAction} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition ${modal.action === 'Rejected' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                Confirm {modal.isBulk ? 'All' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STUDENT DETAIL MODAL --- */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[90] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
            <div className="p-8 bg-[#020617] text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black tracking-tight">{studentSummaries[selectedStudent]?.name}'s Records</h2>
                <div className="flex items-center gap-3 mt-1">
                    <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">{selectedStudent}</p>
                    {currentStudentPendingCount > 0 && (
                        <button onClick={(e) => openConfirmModal(e, null, 'Approved', true)} className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase transition animate-pulse">Bulk Approve ({currentStudentPendingCount})</button>
                    )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs text-white outline-none focus:bg-white focus:text-slate-900 transition">
                  <option value="All">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <input type="text" placeholder="Search tasks..." className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs focus:bg-white focus:text-slate-900 outline-none w-44" value={innerSearch} onChange={(e) => setInnerSearch(e.target.value)} />
                <button onClick={() => downloadCSV(selectedStudent)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20">📥 Export</button>
                <button onClick={() => {setSelectedStudent(null); setInnerSearch(''); setStatusFilter('All');}} className="bg-white/10 hover:bg-red-500 p-2 rounded-xl px-4 font-bold transition">✕</button>
              </div>
            </div>
            <div className="overflow-y-auto p-8 flex-1 bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                    <th className="pb-4 px-2">Date</th>
                    <th className="pb-4 px-2">Hours</th>
                    <th className="pb-4 px-2">Task Description</th>
                    <th className="pb-4 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.filter(l => l.student === selectedStudent).filter(l => statusFilter === 'All' || l.status === statusFilter).filter(l => l.description.toLowerCase().includes(innerSearch.toLowerCase())).sort((a,b) => new Date(b.date) - new Date(a.date)).map(log => (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-4 px-2 text-sm font-medium text-slate-600">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="py-4 px-2 text-sm font-black text-blue-600">{log.hours}h</td>
                      <td className="py-4 px-2 text-sm text-slate-500 max-w-md truncate group-hover:text-slate-900">{log.description}</td>
                      <td className="py-4 px-2 text-right">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${log.status === 'Approved' ? 'bg-green-100 text-green-600' : log.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>{log.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="bg-[#020617] text-white pt-12 pb-32 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
          <div className="flex items-center gap-6">
            <div className="bg-white/10 p-4 rounded-[1.5rem] backdrop-blur-xl border border-white/10 shadow-2xl">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain brightness-200" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                Admin Portal
                {pendingLogs.length > 0 && <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm font-black text-white animate-bounce shadow-xl shadow-red-500/40">{pendingLogs.length}</span>}
              </h1>
              <p className="text-blue-400 font-bold text-xs uppercase tracking-[0.3em] mt-1">OJT Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <input type="text" placeholder="Search logs..." className="bg-white/10 border border-white/10 px-6 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80 backdrop-blur-xl transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={() => { localStorage.clear(); navigate('/'); }} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-2xl font-bold transition-all border border-red-500/20">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 -mt-20 relative z-20">
        {/* --- STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 transform hover:scale-[1.02] transition-transform">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Students</p>
            <h2 className="text-5xl font-black text-slate-800">{totalStudents}</h2>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border-b-4 border-orange-500 transform hover:scale-[1.02] transition-transform">
            <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-2">Pending Review</p>
            <h2 className="text-5xl font-black text-orange-600">{pendingLogs.length}</h2>
          </div>
          <div className="bg-blue-600 p-8 rounded-[2rem] shadow-2xl shadow-blue-500/30 text-white transform hover:scale-[1.02] transition-transform">
            <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-2">Approved Hours</p>
            <h2 className="text-5xl font-black">{totalApprovedHours}h</h2>
          </div>
        </div>

        {/* --- LIVE TASK FEED --- */}
        <div className="bg-white/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white mb-10 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 mb-4 px-4">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Activity Feed</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
                {Object.keys(studentSummaries).map(email => (
                    <div key={email} className="min-w-[240px] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs font-black text-blue-900 truncate mb-1">{studentSummaries[email].name}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic">"{studentSummaries[email].lastTask}"</p>
                    </div>
                ))}
            </div>
        </div>

        {/* --- PROGRESS TRACKING --- */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl mb-12 border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-800">📊 Progress Tracking</h2>
            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-4 py-2 rounded-full uppercase tracking-tighter border border-blue-100">Target: 300 Hours</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(studentSummaries).map(studentEmail => {
              const data = studentSummaries[studentEmail];
              const percent = Math.min((data.approved / 300) * 100, 100).toFixed(1);
              const isDone = Number(percent) >= 100;
              const isActiveToday = getTimeAgo(data.lastDate) === "Active Today";
              
              return (
                <div key={studentEmail} onClick={() => setSelectedStudent(studentEmail)} className={`group relative p-6 rounded-[2rem] bg-slate-50 border border-transparent hover:border-blue-400 hover:bg-white transition-all cursor-pointer shadow-sm hover:shadow-xl ${isDone ? 'ring-2 ring-purple-500/20 bg-purple-50/30' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <div className="flex items-center gap-2">
                              <p className="font-black text-slate-700 group-hover:text-blue-700 transition">{data.name}</p>
                              {isDone && <span className="bg-purple-600 text-white text-[8px] px-2 py-0.5 rounded-full font-black animate-bounce">GOAL</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{studentEmail}</p>
                      </div>
                      <span className={`text-[8px] px-2 py-1 rounded-lg font-black uppercase ${isActiveToday ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                          {getTimeAgo(data.lastDate)}
                      </span>
                  </div>
                  <div className="flex justify-between text-xs mb-3 font-bold">
                    <span className="text-slate-600">Approved: <b className="text-blue-600">{data.approved}h</b></span>
                    <span className={data.pending > 0 ? "text-orange-600" : "text-slate-400"}>Pending: <b>{data.pending}h</b></span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-1000 ${isDone ? 'bg-purple-600' : 'bg-blue-600'}`} style={{ width: `${percent}%` }}></div>
                  </div>
                  <p className={`text-[10px] text-right mt-2 font-black ${isDone ? 'text-purple-600' : 'text-blue-600'}`}>{percent}% Complete</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* --- PENDING TABLE --- */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">🕒 Queue <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingLogs.length}</span></h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-50">
                            {pendingLogs.length === 0 ? (
                                <tr><td className="p-20 text-center text-slate-400 italic">No pending requests</td></tr>
                            ) : (
                                pendingLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/50 transition group">
                                        <td className="p-6">
                                            <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{displayName(log)}</p>
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{log.description}</p>
                                            <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(log.date).toLocaleDateString()} at {formatTime(log.date)} • <span className="text-blue-500">{log.hours}h</span></p>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={(e) => openConfirmModal(e, log._id, 'Approved')} className="bg-green-500 hover:bg-green-600 text-white p-2.5 rounded-xl transition shadow-lg shadow-green-500/20"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></button>
                                                <button onClick={(e) => openConfirmModal(e, log._id, 'Rejected')} className="bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 p-2.5 rounded-xl transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- HISTORY TABLE --- */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-800">📜 History</h2>
                    <button onClick={() => downloadCSV()} className="bg-[#020617] text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-blue-600 transition tracking-widest uppercase shadow-lg shadow-slate-900/20">Full Export</button>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-50">
                            {historyLogs.slice(0, 10).map((log) => (
                                <tr key={log._id} className="hover:bg-slate-50/50 transition group">
                                    <td className="p-6">
                                        <p className="text-sm font-bold text-slate-800">{displayName(log)}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{new Date(log.date).toLocaleDateString()} • {log.hours}h</p>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${log.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{log.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
