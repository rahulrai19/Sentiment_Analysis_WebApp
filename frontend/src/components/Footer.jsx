import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white shadow-sm mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <p className="text-center text-gray-500 mb-1">© {new Date().getFullYear()} Sentiment Feeder. All rights reserved.</p>
        <Link
          to="/about"
          className="text-blue-700 hover:text-blue-900 font-semibold transition"
        >
          About
        </Link>
      </div>
    </footer>
  );
}

export default Footer;