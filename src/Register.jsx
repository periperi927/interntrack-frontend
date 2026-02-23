import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // THE KEY: This must match your supervisor email exactly
  const MAIN_ADMIN_EMAIL = 'perrydumaual33@gmail.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // --- AUTO-ASSIGN ADMIN ROLE ---
    const finalRole = form.email.toLowerCase().trim() === MAIN_ADMIN_EMAIL.toLowerCase().trim() 
      ? 'admin' 
      : 'student';

    const finalFormData = { ...form, role: finalRole };

    try {
      await axios.post('https://interntrack-api.onrender.com/api/register', finalFormData);
      alert(`Account created successfully! ${finalRole === 'admin' ? 'Welcome back, Supervisor.' : ''}`);
      navigate('/');
    } catch (error) {
      console.error("Registration error", error);
      alert(error.response?.data?.message || "Error creating account. Email might be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* --- BACKGROUND BLOBS --- */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 w-full max-w-lg">
        {/* THE GLASS CARD */}
        <div className="bg-white/5 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
          
          <div className="text-center mb-10">
            <div className="bg-white/10 w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center border border-white/20 shadow-xl overflow-hidden group hover:scale-110 transition-transform duration-500">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain group-hover:rotate-12 transition-transform" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Create Account</h2>
            <p className="text-blue-200/50 mt-2 font-bold text-[10px] uppercase tracking-[0.3em]">Join the InternTrack platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME ROW */}
            <div className="grid grid-cols-2 gap-5">
              <div className="group">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-2 mb-2 block group-focus-within:text-blue-300 transition-colors">First Name</label>
                <input 
                  type="text" required
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium"
                  placeholder="John"
                  onChange={(e) => setForm({...form, firstName: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-2 mb-2 block group-focus-within:text-blue-300 transition-colors">Last Name</label>
                <input 
                  type="text" required
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium"
                  placeholder="Doe"
                  onChange={(e) => setForm({...form, lastName: e.target.value})}
                />
              </div>
            </div>

            {/* EMAIL ADDRESS */}
            <div className="group">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-2 mb-2 block group-focus-within:text-blue-300 transition-colors">Email Address</label>
              <input 
                type="email" required
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium"
                placeholder="john@example.com"
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>

            {/* PASSWORD */}
            <div className="group">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-2 mb-2 block group-focus-within:text-blue-300 transition-colors">Password</label>
              <input 
                type="password" required
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium"
                placeholder="••••••••"
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
            </div>

            {/* ROLE SELECTION */}
            <div className="group">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-2 mb-2 block group-focus-within:text-blue-300 transition-colors">I am a:</label>
              <div className="relative">
                <select 
                  className="w-full p-4 bg-[#0f172a] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer font-bold text-xs tracking-wider"
                  value={form.role}
                  onChange={(e) => setForm({...form, role: e.target.value})}
                >
                  <option value="student">Student / Intern</option>
                  <option value="admin">Supervisor / Admin</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] active:scale-[0.97] disabled:bg-slate-800 disabled:text-slate-500 mt-4 uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2"
            >
              {loading ? (
                 <>
                   <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Creating Profile...
                 </>
              ) : "Register Now"}
            </button>
          </form>

          <div className="mt-10 text-center border-t border-white/5 pt-8">
            <p className="text-xs text-slate-400 font-medium">
              Already have an account? 
              <Link to="/" className="ml-2 text-blue-400 hover:text-blue-300 font-black transition-all border-b border-transparent hover:border-blue-300 pb-0.5">
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Branding Credit */}
        <p className="text-center mt-10 text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
          InternTrack Enterprise
        </p>
      </div>
    </div>
  );
}
