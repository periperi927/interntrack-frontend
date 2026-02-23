import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link back
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- CENTRALIZED ADMIN SETTING ---
  const MAIN_ADMIN_EMAIL = 'perrydumaual33@gmail.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://interntrack-api.onrender.com/api/login', { email, password });
      
      // Save user info to local storage
      localStorage.setItem('userEmail', email);
      if (response.data.userName) {
          localStorage.setItem('userName', response.data.userName);
      }

      // --- REDIRECT LOGIC ---
      // Check if the email belongs to the Supervisor
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-blue-900">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="InternTrack Logo" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-blue-900">InternTrack</h1>
          <p className="text-gray-500 mt-2">Please sign in to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
            <input 
              type="email" placeholder="john@example.com" required
              className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
            <input 
              type="password" placeholder="••••••••" required
              className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 mt-2"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 font-semibold">
            Need an account? 
            <Link to="/register" className="ml-1 text-blue-600 hover:underline">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
