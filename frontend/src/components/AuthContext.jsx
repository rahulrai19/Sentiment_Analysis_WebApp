import React, { createContext, useContext, useState } from 'react';
import jwt_encode from 'jwt-encode';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

const SECRET = 'your_super_secret_key'; // keep this secret in real apps!
const ADMIN_PASSWORD = 'admin123';

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    const token = localStorage.getItem('admin_jwt');
    if (!token) return false;
    try {
      const decoded = jwt_decode(token);
      return decoded && decoded.role === 'admin';
    } catch {
      return false;
    }
  });

  const login = (username, password) => {
    if (username === 'admin' && password === ADMIN_PASSWORD) {
      const payload = { role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 24 }; // 24h expiry
      const token = jwt_encode(payload, SECRET);
      localStorage.setItem('admin_jwt', token);
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('admin_jwt');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}