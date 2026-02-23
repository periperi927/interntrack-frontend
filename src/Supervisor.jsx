import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Supervisor() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({ show: false, logId: null, action: '', isBulk: false });
  const [selectedStudent, setSelectedStudent] = useState(null); 
  const [innerSearch, setInnerSearch] = useState(''); 
  const [statusFilter, setStatusFilter] = useState('All'); 
  
  const navigate = useNavigate();
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
    try {
      const response = await axios.get('https://interntrack-api.onrender.com/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs", error);
    }
  };

  const displayName = (log) => {
    if (log.studentName && log.studentName.trim() !== "") return log.studentName;
    const email = typeof log === 'string' ? log : (log.student || "");
    if (!email) return "Unknown Student";
    const namePart = email.split('@')[0];
    return namePart.split(/[._0-9]+/).filter(p => p).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getTimeAgo = (dateString) => {
    const today = new Date();
    const diffTime = Math.abs(today.setHours(0,0,0,0) - new Date(dateString).setHours(0,0,0,0));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Active Today" : diffDays === 1 ? "Active Yesterday" : `Active ${diffDays}d ago`;
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
        await axios.put(`https://interntrack-api.ontrack.com/api/logs/${modal.logId}`, { status: modal.action });
      }
      setModal({ show: false, logId: null, action: '', isBulk: false });
      fetchLogs();
    } catch (error) { console.error(error); }
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
    link.setAttribute("href", url);
    link.setAttribute("download", `OJT_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => 
    (log.studentName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.student.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const studentSummaries = filteredLogs.reduce((acc, log) => {
    const student = log.student;
    if (!acc[student]) {
      acc[student] = { name: log.studentName || displayName(student), approved: 0, pending: 0, lastDate: log.date, lastTask: log.description };
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
  const currentStudentPendingCount = logs.filter(l => l.student === selectedStudent && l.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20 overflow-x-hidden">
      
      {/* --- CONFIRMATION MODAL (GLASS STYLE) --- */}
      {modal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full border border-white/20 animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Confirm</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              {modal.isBulk ? `Approve all pending logs?` : `Proceed with ${modal.action}?`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal({show:false})} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition">Cancel</button>
              <button onClick={confirmAction} className={`flex-1 py-4 text-white rounded-2xl font-bold shadow-lg transition ${modal.action === 'Rejected' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STUDENT DETAIL MODAL (GLASS STYLE) --- */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col border border-white/20">
            <div className="p-8 bg-[#020617] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight">{studentSummaries[selectedStudent]?.name}</h2>
                <p className="text-blue-400 text-sm font-medium">{selectedStudent}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => downloadCSV(selectedStudent)} className="bg-green-500 hover:bg-green-400 text-white px-5 py-2 rounded-xl text-xs font-black transition uppercase tracking-widest shadow-lg shadow-green-500/20">Export CSV</button>
                <button onClick={() => setSelectedStudent(null)} className="bg-white/10 hover:bg-red-500 p-3 rounded-full transition">✕</button>
              </div>
            </div>
            <div className="overflow-y-auto p-8 flex-1 bg-white">
               {/* Table Content Here (Same as your logic) */}
               <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Hours</th>
                      <th className="pb-4">Task</th>
                      <th className="pb-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.filter(l => l.student === selectedStudent).sort((a,b) => new Date(b.date) - new Date(a.date)).map(log => (
                      <tr key={log._id} className="hover:bg-slate-50 transition group">
                        <td className="py-4 text-sm font-medium text-slate-500">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="py-4 text-sm font-black text-blue-600">{log.hours}h</td>
                        <td className="py-4 text-sm text-slate-600 max-w-md truncate">{log.description}</td>
                        <td className="py-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${log.status === 'Approved' ? 'bg-green-100 text-green-700' : log.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span>
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
      <header className="bg-[#020617] text-white pt-12 pb-28 px-8 relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
          <div className="flex items-center gap-6">
            <div className="bg-white/10 p-4 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-inner">
              <img src="/logo.png" alt="Logo" className="w-40 h-auto brightness-200" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter">Admin Portal</h1>
              <p className="text-blue-300/60 font-medium italic mt-1">Supervising {totalStudents} Talent(s)</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-3 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
            <input 
              type="text" placeholder="Search talent or tasks..." 
              className="bg-transparent pl-4 pr-4 py-2 outline-none text-white placeholder-blue-300/30 w-72 text-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button onClick={() => { localStorage.clear(); navigate('/'); }} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Logout</button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-8 -mt-16 relative z-20">
        
        {/* TOP STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Active Interns', val: totalStudents, color: 'text-slate-900', bg: 'bg-white' },
            { label: 'Pending Review', val: pendingLogs.length, color: 'text-orange-500', bg: 'bg-white border-b-8 border-orange-500' },
            { label: 'Total Hours', val: `${totalApprovedHours}h`, color: 'text-blue-600', bg: 'bg-white border-b-8 border-blue-600 shadow-blue-200/50' }
          ].map((s, i) => (
            <div key={i} className={`${s.bg} p-8 rounded-[2.5rem] shadow-xl transition-transform hover:scale-[1.02] duration-300`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{s.label}</p>
              <h2 className={`text-6xl font-black ${s.color} tracking-tighter`}>{s.val}</h2>
            </div>
          ))}
        </div>

        {/* FEED & PROGRESS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* FEED (LEFT) */}
          <div className="lg:col-span-1 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
              Live Feed
            </h3>
            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-hide">
              {Object.keys(studentSummaries).map(email => (
                <div key={email} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition">
                  <p className="text-xs font-black text-blue-900">{studentSummaries[email].name}</p>
                  <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">"{studentSummaries[email].lastTask}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* PROGRESS (RIGHT) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Student Milestones</h3>
               <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-400 tracking-widest">GOAL: 300H</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {Object.keys(studentSummaries).map(studentEmail => {
                  const data = studentSummaries[studentEmail];
                  const percent = Math.min((data.approved / 300) * 100, 100).toFixed(0);
                  return (
                    <div key={studentEmail} onClick={() => setSelectedStudent(studentEmail)} className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] hover:border-blue-500 cursor-pointer transition-all group">
                       <div className="flex justify-between items-start mb-3">
                          <p className="font-bold text-slate-800 group-hover:text-blue-600 transition">{data.name}</p>
                          <span className="text-[10px] font-black text-blue-500">{percent}%</span>
                       </div>
                       <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                       </div>
                    </div>
                  );
               })}
             </div>
          </div>
        </div>

        {/* PENDING TABLE (FULL WIDTH) */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900">Pending Review</h2>
            <button onClick={() => downloadCSV()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/30">Download Report</button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-8">Intern Information</th>
                    <th className="p-8">Session</th>
                    <th className="p-8">Hours</th>
                    <th className="p-8 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {pendingLogs.length === 0 ? (
                     <tr><td colSpan="4" className="p-20 text-center text-slate-400 font-medium italic">All caught up! No pending reviews.</td></tr>
                   ) : (
                     pendingLogs.map(log => (
                       <tr key={log._id} className="hover:bg-slate-50/50 transition">
                         <td className="p-8">
                            <p className="font-black text-slate-900">{log.studentName || displayName(log)}</p>
                            <p className="text-xs text-slate-400">{log.student}</p>
                         </td>
                         <td className="p-8">
                            <p className="text-sm font-bold text-slate-700">{new Date(log.date).toLocaleDateString()}</p>
                            <p className="text-xs text-blue-600 font-black">{formatTime(log.date)}</p>
                         </td>
                         <td className="p-8">
                            <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-black shadow-inner">{log.hours} Hours</span>
                         </td>
                         <td className="p-8">
                            <div className="flex justify-center gap-3">
                               <button onClick={(e) => openConfirmModal(e, log._id, 'Approved')} className="px-6 py-2.5 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition shadow-lg shadow-green-500/20">Approve</button>
                               <button onClick={(e) => openConfirmModal(e, log._id, 'Rejected')} className="px-6 py-2.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition">Reject</button>
                            </div>
                         </td>
                       </tr>
                     ))
                   )}
                </tbody>
             </table>
          </div>
        </div>
      </main>
    </div>
  );
}
