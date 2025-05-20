import React from 'react';
import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/optimized/banner1.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
        
          // opacity: 2
        }}
      />
      
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-blue-800/50 z-0" />
      
      {/* Content - positioned on the left with refined styling and increased width */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 flex flex-col justify-center h-full max-w-xl text-left">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-xl animate-fade-in-up">
          Share Your Voice on <span className="text-yellow-300">Campus Events</span>
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-10 drop-shadow-lg">
          Help improve events by giving your honest feedback.
        </p>
        <Link
          to="/submit"
          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold px-10 py-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg border-2 border-yellow-300 text-lg"
        >
          Give Feedback
        </Link>
      </div>
    </div>
  );
}

export default HeroSection;

