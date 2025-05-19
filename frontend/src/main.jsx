import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import FeedbackForm from "./components/FeedbackForm";
import AdminDashboard from "./components/AdminDashboard";
import HeroSection from "./components/HeroSection";
import FeedbackSubmission from "./components/FeedbackSubmission";
import './index.css'

// Simple navigation bar component
function NavBar() {
  const location = useLocation();
  return (
    <nav className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 py-5 mb-8 shadow-lg">
      <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <span className="text-white text-3xl font-extrabold tracking-tight drop-shadow-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="#2563eb"/>
              <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="9" r="1.5" fill="white"/>
              <circle cx="15" cy="9" r="1.5" fill="white"/>
            </svg>
            Sentiment <span className="text-yellow-300 ml-1">Feeder</span>
          </span>
        </div>
        <div className="flex gap-4">
          <Link
            to="/"
            className={`text-white px-4 py-2 rounded-lg hover:bg-blue-800/70 transition font-semibold ${location.pathname === "/" ? "bg-blue-900/80" : ""}`}
          >
            Feedback
          </Link>
          <Link
            to="/admin"
            className={`text-white px-4 py-2 rounded-lg hover:bg-blue-800/70 transition font-semibold ${location.pathname === "/admin" ? "bg-blue-900/80" : ""}`}
          >
            Admin Dashboard
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
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/submit" element={<FeedbackSubmission />} />
    </Routes>
  </Router>
)