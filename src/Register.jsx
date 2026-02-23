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
    // If the email being registered is yours, we force the role to 'admin'
    // regardless of what is selected in the dropdown.
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-blue-900">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="InternTrack Logo" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h2 className="text-3xl font-bold text-blue-900">Create Account</h2>
          <p className="text-gray-500">Join the InternTrack platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
              <input 
                type="text" required
                className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="John"
                onChange={(e) => setForm({...form, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
              <input 
                type="text" required
                className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Doe"
                onChange={(e) => setForm({...form, lastName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
            <input 
              type="email" required
              className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="john@example.com"
              onChange={(e) => setForm({...form, email: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
            <input 
              type="password" required
              className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              onChange={(e) => setForm({...form, password: e.target.value})}
            />
          </div>

          {/* We keep the dropdown for students, but our code above overrides it for your email */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">I am a:</label>
            <select 
              className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.role}
              onChange={(e) => setForm({...form, role: e.target.value})}
            >
              <option value="student">Student / Intern</option>
              <option value="admin">Supervisor / Admin</option>
            </select>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600 font-semibold">
          Already have an account? <Link to="/" className="text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
