import React from 'react';
import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <div className="relative py-16 px-4">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/party.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: '0.3'
        }}
      />
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-blue-800/50 z-0" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
          Share Your Voice on Campus Events
        </h1>
        <p className="text-xl text-blue-50 mb-8 drop-shadow-md">
          Help improve events by giving your honest feedback.
        </p>
        <Link
          to="/submit"
          className="inline-block bg-white hover:bg-blue-50 text-blue-700 font-semibold px-8 py-3 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg"
        >
          Give Feedback !
        </Link>
      </div>
    </div>
  );
}

export default HeroSection;

