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
      const response = await axios.post('https://interntrack-api.onrender.com/api/login', { email, password });
      localStorage.setItem('userEmail', email);
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
      
      {/* --- BACKGROUND BLOBS (The "Stunning" Part) --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-md">
        {/* THE GLASS CARD */}
        <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
          
          <div className="text-center mb-8">
            <div className="bg-white/10 w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">InternTrack</h1>
            <p className="text-blue-200/60 mt-2 font-medium">Elevating your internship journey</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                required
                className="w-full p-4 mt-1 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white/10 outline-none transition-all shadow-inner"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                className="w-full p-4 mt-1 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white/10 outline-none transition-all shadow-inner"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] active:scale-[0.98] disabled:bg-gray-700 mt-4 group flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Processing...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-sm text-gray-400">
              New to the platform? 
              <Link to="/register" className="ml-2 text-blue-400 hover:text-blue-300 font-bold transition">
                Create Account
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer Credit */}
        <p className="text-center mt-8 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
          Powered by InternTrack Architecture
        </p>
      </div>
    </div>
  );
}
