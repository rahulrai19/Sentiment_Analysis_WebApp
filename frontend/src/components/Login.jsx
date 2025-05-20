import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center bg-blue-950/90 backdrop-blur-sm shadow-inset-lg shadow-blue-500/20 rounded-xl border border-blue-700 text-blue-100">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6 drop-shadow">Admin Login</h1>
      <p className="text-blue-300 mb-6 text-sm">Use username: <strong className="text-yellow-300">admin</strong> and password: <strong className="text-yellow-300">admin123</strong> for admin access.</p>
      <form onSubmit={handleSubmit} className="bg-blue-900/70 shadow-inner rounded-xl p-8 space-y-6 border border-blue-800">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full px-4 py-3 border border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-blue-800/50 text-blue-100 placeholder-blue-300"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-blue-800/50 text-blue-100 placeholder-blue-300"
          required
        />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-semibold px-8 py-3 rounded-lg transition duration-300 shadow-lg transform hover:scale-105"
        >
          Admin Login
        </button>
      </form>
    </div>
  );
}

export default Login; 