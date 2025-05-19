import React, { Suspense, lazy } from "react";
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import FeedbackForm from "./components/FeedbackForm";
import HeroSection from "./components/HeroSection";
import Login from "./components/Login";
import Footer from "./components/Footer";
import './index.css'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { AuthProvider, useAuth } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load components
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const About = lazy(() => import("./components/About"));

// Simple navigation bar component
function NavBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="w-full bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 py-4 shadow-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center text-white text-2xl font-bold tracking-wide hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" stroke="white" fill="#1d4ed8"/>
              <path d="M8 13h8M8 17h5" stroke="white" strokeLinecap="round"/>
              <circle cx="9" cy="9" r="1.5" fill="white"/>
              <circle cx="15" cy="9" r="1.5" fill="white"/>
            </svg>
            Sentiment <span className="text-yellow-300 ml-1 font-extrabold">Feeder</span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden sm:flex items-center space-x-6">
          <Link
            to="/"
            className={`text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${location.pathname === "/" ? "bg-blue-900" : "hover:bg-blue-700"}`}
          >
            Feedback
          </Link>
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className={`text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${location.pathname === "/admin" ? "bg-blue-900" : "hover:bg-blue-700"}`}
              >
                Admin Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-white px-3 py-2 rounded-md text-sm font-medium border border-white hover:bg-red-600 transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`text-white px-3 py-2 rounded-md text-sm font-medium border border-white transition-colors duration-200 ${location.pathname === "/login" ? "bg-yellow-400 text-blue-900 border-yellow-400" : "hover:bg-yellow-500 hover:text-blue-900"}`}
            >
              Login
            </Link>
          )}
          <Link
            to="/about"
            className={`text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${location.pathname === "/about" ? "bg-blue-900" : "hover:bg-blue-700"}`}
          >
            About
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="-mr-2 flex sm:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-controls="mobile-menu" aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {menuOpen ? (
              <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`sm:hidden ${menuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`${location.pathname === "/" ? "bg-blue-900 text-white" : "text-blue-200 hover:bg-blue-700 hover:text-white"} block px-3 py-2 rounded-md text-base font-medium`}
            onClick={() => setMenuOpen(false)}
          >
            Feedback
          </Link>
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className={`${location.pathname === "/admin" ? "bg-blue-900 text-white" : "text-blue-200 hover:bg-blue-700 hover:text-white"} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-200 border border-blue-200 hover:bg-red-600 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`${location.pathname === "/login" ? "bg-yellow-400 text-blue-900" : "text-blue-200 hover:bg-yellow-500 hover:text-blue-900"} block px-3 py-2 rounded-md text-base font-medium border border-blue-200 hover:border-yellow-500`}
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
          <Link
            to="/about"
            className={`${location.pathname === "/about" ? "bg-blue-900 text-white" : "text-blue-200 hover:bg-blue-700 hover:text-white"} block px-3 py-2 rounded-md text-base font-medium`}
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
  <BrowserRouter>
    <AuthProvider>
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
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/submit" element={<FeedbackForm />} />
        <Route path="/about" element={
          <Suspense fallback={<div>Loading...</div>}>
            <About />
          </Suspense>
        } />
        <Route path="*" element={<div className="text-center mt-10 text-xl">404 - Page Not Found</div>} />
      </Routes>
      <Footer />
    </AuthProvider>
  </BrowserRouter>
)