import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import FeedbackForm from "./components/FeedbackForm";
import AdminDashboard from "./components/AdminDashboard";
import './index.css'

// Simple navigation bar component
function NavBar() {
  const location = useLocation();
  return (
    <nav className="w-full bg-blue-600 py-3 mb-6 shadow">
      <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
        <span className="text-white font-bold text-xl">Sentiment Feeder</span>
        <div className="flex gap-4">
          <Link
            to="/"
            className={`text-white px-3 py-1 rounded hover:bg-blue-700 transition ${location.pathname === "/" ? "bg-blue-800" : ""}`}
          >
            Feedback
          </Link>
          <Link
            to="/admin"
            className={`text-white px-3 py-1 rounded hover:bg-blue-700 transition ${location.pathname === "/admin" ? "bg-blue-800" : ""}`}
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
    <NavBar />
    <Routes>
      <Route path="/" element={<FeedbackForm />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  </Router>
)