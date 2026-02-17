import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Supervisor() {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('https://interntrack-api.onrender.com/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs", error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`https://interntrack-api.onrender.com/api/logs/${id}`, { status: newStatus });
      fetchLogs();
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-8 border-b-2 border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Admin Portal</h1>
          <p className="text-gray-600">Review and approve student hours</p>
        </div>
        <button onClick={() => navigate('/')} className="text-red-500 hover:text-red-700 font-bold transition">Logout</button>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Pending Submissions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Student</th>
                <th className="p-3 border-b">Hours</th>
                <th className="p-3 border-b">Task</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 transition">
                  <td className="p-3 border-b">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="p-3 border-b font-semibold">{log.student}</td>
                  <td className="p-3 border-b">{log.hours}</td>
                  <td className="p-3 border-b text-sm text-gray-600">{log.description}</td>
                  <td className="p-3 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'Approved' ? 'bg-green-100 text-green-700' : log.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 border-b flex gap-2">
                    <button onClick={() => updateStatus(log._id, 'Approved')} className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">Approve</button>
                    <button onClick={() => updateStatus(log._id, 'Rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
