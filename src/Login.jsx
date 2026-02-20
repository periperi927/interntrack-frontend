import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [firstName, setFirstName] = useState(''); // NEW
  const [lastName, setLastName] = useState('');   // NEW
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering) {
      try {
        // Updated to send firstName and lastName
        await axios.post('https://interntrack-api.onrender.com/api/register', { 
          firstName, 
          lastName, 
          email, 
          password, 
          role 
        });
        alert('Account created! You can now log in.');
        setIsRegistering(false);
        setPassword('');
      } catch (error) {
        alert('Error creating account. Email might already be taken.');
      }
    } else {
      try {
        const response = await axios.post('https://interntrack-api.onrender.com/api/login', { email, password });
        
        // --- STORAGE UPDATED ---
        localStorage.setItem('userEmail', email);
        // Save the name sent back by the backend (assuming backend sends 'userName')
        if (response.data.userName) {
            localStorage.setItem('userName', response.data.userName);
        }
        // -----------------------

        const userRole = response.data.role; 
        if (userRole === 'admin') {
          navigate('/supervisor');
        } else {
          navigate('/student');
        }
      } catch (error) {
        alert('Invalid email or password!');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-8 border-blue-900">
        <img src="/logo.png" alt="InternTrack Logo" className="w-20 h-20 mx-auto mb-4 object-contain" />
        <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">InternTrack</h1>
        <p className="text-gray-500 mb-6 text-center">
          {isRegistering ? 'Create a new secure account' : 'Please sign in to continue'}
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* NEW NAME FIELDS (Only show when registering) */}
          {isRegistering && (
            <div className="flex gap-2">
              <input 
                type="text" placeholder="First Name" required
                className="border p-3 rounded bg-gray-50 focus:outline-blue-500 w-1/2"
                value={firstName} onChange={(e) => setFirstName(e.target.value)}
              />
              <input 
                type="text" placeholder="Last Name" required
                className="border p-3 rounded bg-gray-50 focus:outline-blue-500 w-1/2"
                value={lastName} onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          )}

          <input 
            type="email" placeholder="Email Address" required
            className="border p-3 rounded bg-gray-50 focus:outline-blue-500"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          
          <input 
            type="password" placeholder="Password" required
            className="border p-3 rounded bg-gray-50 focus:outline-blue-500"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />

          {isRegistering && (
            <select 
              className="border p-3 rounded bg-gray-50 focus:outline-blue-500 font-semibold text-gray-600"
              value={role} onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">I am a Student</option>
              <option value="admin">I am a Supervisor</option>
            </select>
          )}
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition mt-2">
            {isRegistering ? 'Register Account' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isRegistering ? 'Already have an account?' : 'Need an account?'} 
            <Link 
              to={isRegistering ? "/" : "/register"} 
              className="ml-1 text-blue-600 hover:underline font-semibold"
              onClick={() => setIsRegistering(false)}
            >
              {isRegistering ? 'Log in here' : 'Register here'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
