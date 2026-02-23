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
      
      {/* --- BACKGROUND BLOBS (Matching Login Style) --- */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 w-full max-w-lg">
        {/* THE GLASS CARD */}
        <div className="bg-white/5 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
          
          <div className="text-center mb-8">
            <div className="bg-white/10 w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center border border-white/20">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Create Account</h2>
            <p className="text-blue-200/60 mt-2 font-medium">Join the InternTrack platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAME ROW */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">First Name</label>
                <input 
                  type="text" required
                  className="w-full p-4 mt-1 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="John"
                  onChange={(e) => setForm({...form, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Last Name</label>
                <input 
                  type="text" required
                  className="w-full p-4 mt-1 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Doe"
                  onChange={(e) => setForm({...form, lastName: e.target.value})}
                />
              </div>
            </div>

            {/* EMAIL ADDRESS */}
            <div>
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" required
                className="w-full p-4 mt-1 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="john@example.com"
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password" required
                className="w-full p-4 mt-1 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
            </div>

            {/* ROLE SELECTION */}
            <div>
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">I am a:</label>
              <select 
                className="w-full p-4 mt-1 bg-[#0f172a] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                value={form.role}
                onChange={(e) => setForm({...form, role: e.target.value})}
              >
                <option value="student">Student / Intern</option>
                <option value="admin">Supervisor / Admin</option>
              </select>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] active:scale-[0.98] disabled:bg-gray-700 mt-4 uppercase tracking-widest text-sm"
            >
              {loading ? "Creating Profile..." : "Register Now"}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-400">
            Already have an account? 
            <Link to="/" className="ml-2 text-blue-400 hover:text-blue-300 font-bold transition">Login here</Link>
          </p>
        </div>

        {/* Branding Credit */}
        <p className="text-center mt-8 text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          InternTrack Enterprise
        </p>
      </div>
    </div>
  );
}
