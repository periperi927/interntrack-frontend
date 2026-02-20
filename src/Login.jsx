import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // --- CENTRALIZED ADMIN SETTING ---
  const MAIN_ADMIN_EMAIL = 'perrydumaual33@gmail.com';
  // ---------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering) {
      try {
        await axios.post('https://interntrack-api.onrender.com/api/register', { 
          firstName, 
          lastName, 
          email, 
          password, 
          role: 'student' // Force everyone who registers to be a student
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
        
        localStorage.setItem('userEmail', email);
        if (response.data.userName) {
            localStorage.setItem('userName', response.data.userName);
        }

        // --- CENTRALIZED REDIRECT LOGIC ---
        // If the email matches the hardcoded admin email, go to Supervisor
        if (email.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase()) {
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

          {/* REMOVED: The select role dropdown. 
            We now force all registrations to be 'student' in the logic above.
          */}
          
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
              onClick={() => setIsRegistering(isRegistering ? false : true)}
            >
              {isRegistering ? 'Log in here' : 'Register here'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
