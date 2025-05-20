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
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const About = lazy(() => import("./components/About"));

// Background Wrapper Component
function BackgroundWrapper({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("/Back1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.8,
        }}
      />
      {/* Content - Removed pt-4 for less gap below navbar and adjusted max-w for increased width */}
      <div className="relative z-10 max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

// NavLink component to encapsulate repetitive NavLink markup
function NavLink({ to, label, location, onClick }) {
  const isActive = location === to;
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${
        isActive 
          ? "text-yellow-300" 
          : "text-white hover:text-yellow-200"
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-300 transform scale-x-100 transition-transform duration-200" />
      )}
      {!isActive && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-300 transform scale-x-0 transition-transform duration-200 group-hover:scale-x-100" />
      )}
    </Link>
  );
}

// Mobile Menu Button
function MobileMenuButton({ menuOpen, setMenuOpen }) {
  return (
    <div className="-mr-2 flex sm:hidden">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
        className="inline-flex items-center justify-center p-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-700/50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-blue-800 transition-all duration-200"
        aria-controls="mobile-menu" 
        aria-expanded={menuOpen}
      >
        <span className="sr-only">Open main menu</span>
        {menuOpen ? (
          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
        ) : (
          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

// Mobile Menu
function MobileMenu({ isOpen, setMenuOpen, location, logout, isAdmin }) {
  return (
    <div 
      className={`sm:hidden transition-all duration-300 ease-in-out ${
        isOpen 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-2 pointer-events-none'
      }`} 
      id="mobile-menu"
    >
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-800/95 backdrop-blur-sm rounded-lg mt-2 mx-4 shadow-xl">
        <NavLink to="/" label="Feedback" location={location} onClick={() => setMenuOpen(false)} />
        {isAdmin ? (
          <>
            <NavLink to="/admin" label="Admin Dashboard" location={location} onClick={() => setMenuOpen(false)} />
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm font-medium text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-md transition-colors duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" label="Login" location={location} onClick={() => setMenuOpen(false)} />
        )}
        <NavLink to="/about" label="About" location={location} onClick={() => setMenuOpen(false)} />
      </div>
    </div>
  );
}

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
    <nav className="w-full bg-gradient-to-br from-blue-950 via-blue-800 to-blue-950 py-4 shadow-xl sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center text-white text-2xl font-bold tracking-wide hover:scale-105 transition-all duration-200 group"
          >
            <div className="relative mr-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 transform group-hover:rotate-12 transition-transform duration-200" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" stroke="white" fill="#1d4ed8"/>
                <path d="M8 13h8M8 17h5" stroke="white" strokeLinecap="round"/>
                <circle cx="9" cy="9" r="1.5" fill="white"/>
                <circle cx="15" cy="9" r="1.5" fill="white"/>
              </svg>
              <div className="absolute -inset-1 bg-yellow-300/20 rounded-full blur-sm group-hover:bg-yellow-300/30 transition-all duration-200" />
            </div>
            <span className="relative">
              Sentiment 
              <span className="text-yellow-300 ml-1 font-extrabold group-hover:text-yellow-200 transition-colors duration-200">
                Feeder
              </span>
              <div className="absolute -inset-1 bg-yellow-300/10 rounded-lg blur-sm group-hover:bg-yellow-300/20 transition-all duration-200" />
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden sm:flex items-center space-x-1">
          <NavLink to="/" label="Feedback" location={location.pathname} />
          {isAdmin ? (
            <>
              <NavLink to="/admin" label="Admin Dashboard" location={location.pathname} />
              <button 
                onClick={handleLogout} 
                className="ml-2 px-4 py-2 text-sm font-medium text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-md transition-all duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" label="Login" location={location.pathname} />
          )}
          <NavLink to="/about" label="About" location={location.pathname} />
        </div>

        {/* Mobile Menu Button */}
        <MobileMenuButton menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={menuOpen} 
        setMenuOpen={setMenuOpen} 
        location={location.pathname} 
        logout={handleLogout}
        isAdmin={isAdmin}
      />
    </nav>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <Toaster position="top-center" />
      <NavBar />
      <BackgroundWrapper>
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <Routes>
            <Route path="/" element={
              <div className="space-y-12">
                <HeroSection />
              </div>
            } />
            <Route path="/admin" element={
              <Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute>
                  <div className="mt-8">
                    <AdminDashboard />
                  </div>
                </ProtectedRoute>
              </Suspense>
            } />
            <Route path="/login" element={
              <div className="mt-8">
                <Login />
              </div>
            } />
            <Route path="/submit" element={
              <div className="mt-8">
                <FeedbackForm />
              </div>
            } />
            <Route path="/about" element={
              <Suspense fallback={<div>Loading...</div>}>
                <div className="mt-8">
                  <About />
                </div>
              </Suspense>
            } />
            <Route path="*" element={
              <div className="mt-8 text-center text-xl">
                404 - Page Not Found
              </div>
            } />
          </Routes>
        </div>
      </BackgroundWrapper>
      <Footer />
    </AuthProvider>
  </BrowserRouter>
)