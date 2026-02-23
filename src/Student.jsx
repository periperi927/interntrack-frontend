import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Student() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ hours: '', description: '' });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // --- NAME LOGIC ---
  const currentUserEmail = localStorage.getItem('userEmail') || 'Guest';
  const storedName = localStorage.getItem('userName');

  const formatName = (email) => {
    if (!email || email === 'Guest') return "Student";
    const namePart = email.split('@')[0]; 
    const firstName = namePart.split('.')[0]; 
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  const studentName = storedName || formatName(currentUserEmail);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true); 
    try {
      const response = await axios.get('https://interntrack-api.onrender.com/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs", error);
    } finally {
      // Small timeout to prevent the "flicker" on fast connections
      setTimeout(() => setLoading(false), 800);
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
        studentName: studentName,
        date: new Date()
      });
      setForm({ hours: '', description: '' }); 
      fetchLogs(); 
    } catch (error) {
      console.error("Error saving log", error);
    }
  };

  // --- DATA LOGIC ---
  const myLogs = logs.filter(log => log.student === currentUserEmail);

  const approvedHours = myLogs
    .filter(log => log.status === 'Approved')
    .reduce((sum, log) => sum + Number(log.hours), 0);

  const pendingHours = myLogs
    .filter(log => log.status === 'Pending')
    .reduce((sum, log) => sum + Number(log.hours), 0);

  const goal = 300;
  const progressPercentage = Math.min((approvedHours / goal) * 100, 100);
  const remainingHours = Math.max(goal - approvedHours, 0);

  // --- LOADING GATEKEEPER (SKELETON SCREEN) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans">
        <div className="bg-[#020617] pt-12 pb-32 px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-3xl animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse"></div>
                <div className="h-4 w-32 bg-white/5 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-8 -mt-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-[2rem] shadow-xl animate-pulse border border-slate-100"></div>
            ))}
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl mb-8 border border-slate-100">
            <div className="h-6 w-1/4 bg-slate-100 rounded mb-4 animate-pulse"></div>
            <div className="h-4 w-full bg-slate-50 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-1 h-[400px] bg-white rounded-[2.5rem] animate-pulse"></div>
             <div className="lg:col-span-2 h-[400px] bg-white rounded-[2.5rem] animate-pulse"></div>
          </div>
        </main>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20">
      
      {/* --- HEADER --- */}
      <header className="bg-[#020617] text-white pt-12 pb-32 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
          <div className="flex items-center gap-6">
            <div className="bg-white/10 p-4 rounded-[1.5rem] backdrop-blur-xl border border-white/10 shadow-2xl">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain brightness-200" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Student Portal</h1>
              <p className="text-blue-400 font-bold text-xs uppercase tracking-[0.3em] mt-1 italic">
                Welcome back, <span className="text-white underline decoration-blue-500 underline-offset-4">{studentName}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.clear(); navigate('/'); }} 
            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-8 py-3 rounded-2xl font-bold transition-all border border-red-500/20 shadow-lg"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 -mt-20 relative z-20">
        
        {/* --- STAT CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 transform hover:scale-[1.02] transition-transform">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Approved Hours</p>
            <h3 className="text-3xl font-black text-blue-600">{approvedHours} <span className="text-sm text-slate-300">/ {goal}</span></h3>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border-l-4 border-orange-500 transform hover:scale-[1.02] transition-transform">
            <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-2">Pending</p>
            <h3 className="text-3xl font-black text-slate-800">{pendingHours}h</h3>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border-l-4 border-purple-500 transform hover:scale-[1.02] transition-transform">
            <p className="text-purple-500 text-[10px] font-black uppercase tracking-widest mb-2">Remaining</p>
            <h3 className="text-3xl font-black text-slate-800">{remainingHours}h</h3>
          </div>
          <div className="bg-blue-600 p-6 rounded-[2rem] shadow-2xl shadow-blue-500/30 text-white transform hover:scale-[1.02] transition-transform">
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">Completion</p>
            <h3 className="text-3xl font-black">{progressPercentage.toFixed(1)}%</h3>
          </div>
        </div>

        {/* --- DYNAMIC PROGRESS BAR --- */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl mb-8 border border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">OJT Progress Journey</h2>
              <p className="text-xs text-slate-400 font-medium">Rendered hours are updated upon admin approval</p>
            </div>
            <span className="text-sm font-black text-blue-600 bg-blue-50 px-4 py-1 rounded-full">{approvedHours} / {goal} Hours</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1 shadow-inner relative">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-in-out ${
                progressPercentage >= 100 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'bg-gradient-to-r from-blue-600 to-blue-400'
              }`} 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {progressPercentage >= 100 && (
            <p className="text-center text-purple-600 font-black text-[10px] mt-4 uppercase tracking-[0.3em] animate-pulse">
              🎉 Congratulations! Target Requirement Met! 🎉
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- FORM SIDEBAR --- */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 sticky top-8">
              <h2 className="text-2xl font-black mb-6 text-slate-800">Submit Hours</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Student Email</label>
                  <input type="text" readOnly className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-400 text-xs font-bold outline-none cursor-not-allowed" value={currentUserEmail} />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 block">Hours Rendered</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 8" 
                    className="w-full border border-slate-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold" 
                    value={form.hours} 
                    onChange={(e) => setForm({...form, hours: e.target.value})} 
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 block">Task Description</label>
                  <textarea 
                    placeholder="What did you work on today?" 
                    className="w-full border border-slate-200 p-4 rounded-xl h-32 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium resize-none" 
                    value={form.description} 
                    onChange={(e) => setForm({...form, description: e.target.value})} 
                  />
                </div>
                
                <button type="submit" className="bg-[#020617] text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 active:scale-95 text-sm tracking-widest uppercase">
                  Submit Log
                </button>
              </form>
            </div>
          </div>

          {/* --- HISTORY TABLE --- */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-800">Activity History</h2>
                <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-400 uppercase tracking-tighter">Total Entries: {myLogs.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                      <th className="p-6">Date</th>
                      <th className="p-6">Task</th>
                      <th className="p-6 text-center">Status</th>
                      <th className="p-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {myLogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-20 text-center text-slate-400 italic font-medium">
                          No logs found. Start by submitting your first entry!
                        </td>
                      </tr>
                    ) : (
                      [...myLogs].sort((a,b) => new Date(b.date) - new Date(a.date)).map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/50 transition-all group">
                          <td className="p-6">
                            <p className="text-sm font-bold text-slate-800">{new Date(log.date).toLocaleDateString()}</p>
                            <p className="text-blue-600 text-[10px] font-black uppercase mt-1">{log.hours} Hours</p>
                          </td>
                          <td className="p-6">
                            <p className="text-sm text-slate-500 font-medium line-clamp-2 max-w-xs group-hover:text-slate-900 transition-colors">{log.description}</p>
                          </td>
                          <td className="p-6 text-center">
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              log.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                              log.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                            <button 
                              onClick={() => deleteLog(log._id)} 
                              className="bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 p-2.5 rounded-xl transition-all"
                              title="Delete Log"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
      </main>
    </div>
  );
}
