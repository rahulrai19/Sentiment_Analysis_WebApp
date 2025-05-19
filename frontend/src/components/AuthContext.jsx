import React, { createContext, useContext, useState } from 'react';
import jwt_encode from 'jwt-encode';

import { jwt_decode } from 'jwt-decode';

const AuthContext = createContext();

const SECRET = 'your_super_secret_key'; // keep this secret in real apps!
const ADMIN_PASSWORD = 'admin123';

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    const token = localStorage.getItem('admin_jwt');
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded && decoded.role === 'admin' && decoded.exp > Date.now();
    } catch (error) {
      console.error("Failed to decode token:", error);
      return false;
    }
  });

  const login = (username, password) => {
    if (username === 'admin' && password === ADMIN_PASSWORD) {
      const expiry = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // in seconds
      const payload = { role: 'admin', exp: expiry };
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}