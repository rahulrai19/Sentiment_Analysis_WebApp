import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import FeedbackForm from "./components/FeedbackForm";
import AdminDashboard from "./components/AdminDashboard";
import HeroSection from "./components/HeroSection";
import About from "./components/About";
import Login from "./components/Login";
import Footer from "./components/Footer";
import './index.css'
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Simple navigation bar component
function NavBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 py-5 mb-8 shadow-lg">
      <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
        <div className="flex items-center gap-6">
          <span className="text-white text-3xl font-extrabold tracking-tight drop-shadow-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="#2563eb"/>
              <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="9" r="1.5" fill="white"/>
              <circle cx="15" cy="9" r="1.5" fill="white"/>
            </svg>
            Sentiment <span className="text-yellow-300 ml-1">Feeder</span>
          </span>
          <Link
            to="/about"
            className={`hidden sm:inline text-white px-4 py-2 rounded-lg hover:bg-blue-800/70 transition font-semibold ${location.pathname === "/about" ? "bg-blue-900/80" : ""}`}
          >
            About
          </Link>
        </div>
        {/* Hamburger menu for mobile */}
        <button className="sm:hidden ml-2 text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? (
            <XMarkIcon className="h-8 w-8" />
          ) : (
            <Bars3Icon className="h-8 w-8" />
          )}
        </button>
        {/* Nav links */}
        <div className={`flex-col sm:flex-row flex sm:gap-6 gap-3 items-center absolute sm:static top-20 left-0 w-full sm:w-auto bg-gradient-to-b sm:bg-none from-blue-700/95 to-blue-500/95 sm:bg-transparent z-40 sm:flex transition-all duration-300 ${menuOpen ? 'flex' : 'hidden sm:flex'}`}>
          <Link
            to="/"
            className={`text-white px-4 py-2 rounded-lg hover:bg-blue-800/70 transition font-semibold ${location.pathname === "/" ? "bg-blue-900/80" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Feedback
          </Link>
          <Link
            to="/admin"
            className={`text-white px-4 py-2 rounded-lg hover:bg-blue-800/70 transition font-semibold ${location.pathname === "/admin" ? "bg-blue-900/80" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Admin Dashboard
          </Link>
          <Link
            to="/login"
            className={`text-white px-4 py-2 rounded-lg border border-white hover:bg-yellow-400/80 hover:text-blue-900 transition font-bold ${location.pathname === "/login" ? "bg-yellow-300 text-blue-900" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
          {/* About link for mobile */}
          <Link
            to="/about"
            className={`sm:hidden text-white px-4 py-2 rounded-lg hover:bg-blue-800/70 transition font-semibold ${location.pathname === "/about" ? "bg-blue-900/80" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <Toaster position="top-center" />
    <NavBar />
    <Routes>
      <Route path="/" element={
        <>
          <HeroSection />
          <FeedbackForm />
        </>
      } />
      <Route path="/admin" element={
        <AuthProvider>
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        </AuthProvider>
      } />
      <Route path="/login" element={
        <AuthProvider>
          <Login />
        </AuthProvider>
      } />
      <Route path="/submit" element={<FeedbackForm />} />
      <Route path="/about" element={<About />} />
    </Routes>
    <Footer />
  </Router>
)