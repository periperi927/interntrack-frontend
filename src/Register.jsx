import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student' // Default role
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Send data to your API
      const response = await axios.post('https://interntrack-api.onrender.com/api/register', form);
      
      // 2. Store the name and email for the dashboard to use
      localStorage.setItem('userEmail', form.email);
      localStorage.setItem('userName', `${form.firstName} ${form.lastName}`);
      
      alert("Registration Successful!");
      
      // 3. Redirect based on role
      if (form.role === 'supervisor') {
        navigate('/supervisor');
      } else {
        navigate('/student');
      }
    } catch (error) {
      console.error("Registration error", error);
      alert(error.response?.data?.message || "Registration failed. Check if the backend supports names.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-32 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-blue-900">Create Account</h2>
          <p className="text-gray-500">Join the InternTrack platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
              <input 
                type="text" 
                required
                className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="John"
                onChange={(e) => setForm({...form, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
              <input 
                type="text" 
                required
                className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Doe"
                onChange={(e) => setForm({...form, lastName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="john@example.com"
              onChange={(e) => setForm({...form, email: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••"
              onChange={(e) => setForm({...form, password: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">I am a:</label>
            <select 
              className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none"
              onChange={(e) => setForm({...form, role: e.target.value})}
            >
              <option value="student">Student / Intern</option>
              <option value="supervisor">Supervisor / Admin</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition shadow-lg active:scale-95 disabled:bg-gray-400"
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account? <Link to="/" className="text-blue-600 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
