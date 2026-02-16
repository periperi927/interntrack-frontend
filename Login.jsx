import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Only used when registering
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering) {
      // HANDLE REGISTRATION
      try {
       await axios.post('https://interntrack-api.onrender.com/api/register', { email, password, role });
        alert('Account created! You can now log in.');
        setIsRegistering(false); // Switch back to login view
        setPassword(''); // Clear password field for safety
      } catch (error) {
        alert('Error creating account. Email might already be taken.');
      }
    } else {
      // HANDLE LOGIN
      try {
        const response = await axios.post('https://interntrack-api.onrender.com/api/login', { email, password });
        
        // The backend tells us if they are a student or admin!
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
        <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">InternTrack</h1>
        <p className="text-gray-500 mb-6 text-center">
          {isRegistering ? 'Create a new secure account' : 'Please sign in to continue'}
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          {/* Only show the Role dropdown if they are creating a new account */}
          {isRegistering && (
            <select 
              className="border p-3 rounded bg-gray-50 focus:outline-blue-500"
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
          <button 
            type="button" 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 hover:underline text-sm font-semibold"
          >
            {isRegistering ? 'Already have an account? Log in' : 'Need an account? Register here'}
          </button>
        </div>
      </div>
    </div>
  );

}
