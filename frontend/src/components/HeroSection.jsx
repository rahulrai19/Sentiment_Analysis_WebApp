import React from 'react';
import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Share Your Voice on Campus Events
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Help improve events by giving your honest feedback.
        </p>
        <Link
          to="/submit"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg"
        >
          Give Feedback
        </Link>
      </div>
    </div>
  );
}

export default HeroSection; 