import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const MAIN_ADMIN_EMAIL = 'perrydumaual33@gmail.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('https://interntrack-api.onrender.com/api/login', { 
        email: email.trim(), 
        password 
      });
      
      localStorage.setItem('userEmail', email.toLowerCase().trim());
      if (response.data.userName) {
        localStorage.setItem('userName', response.data.userName);
      }

      if (email.toLowerCase().trim() === MAIN_ADMIN_EMAIL.toLowerCase().trim()) {
        navigate('/supervisor');
      } else {
        navigate('/student');
      }
    } catch (error) {
      console.error("Login error", error);
      alert(error.response?.data?.message || 'Invalid email or password!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* --- BACKGROUND BLOBS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-md">
        {/* THE GLASS CARD */}
        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
          
          <div className="text-center mb-10">
            <div className="bg-white/10 w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl overflow-hidden group hover:scale-110 transition-transform duration-500">
              <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain group-hover:rotate-12 transition-transform" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">InternTrack</h1>
            <p className="text-blue-200/50 mt-2 font-bold text-[10px] uppercase tracking-[0.3em]">Precision Hour Management</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-2 mb-2 block group-focus-within:text-blue-300 transition-colors">
                Email Address
              </label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                required
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 outline-none transition-all shadow-inner font-medium"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="group">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-2 mb-2 block group-focus-within:text-blue-300 transition-colors">
                Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 outline-none transition-all shadow-inner font-medium"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] active:scale-[0.97] disabled:bg-slate-800 disabled:text-slate-500 mt-4 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.15em]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-10 text-center border-t border-white/5 pt-8">
            <p className="text-xs text-slate-400 font-medium">
              New to the platform? 
              <Link to="/register" className="ml-2 text-blue-400 hover:text-blue-300 font-black transition-all border-b border-transparent hover:border-blue-300 pb-0.5">
                Create Account
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer Credit */}
        <p className="text-center mt-10 text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
          Powered by InternTrack Architecture
        </p>
      </div>
    </div>
  );
}
