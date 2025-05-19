import React from 'react';

function Footer() {
  return (
    <footer className="bg-white shadow-sm mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500">© {new Date().getFullYear()} Sentiment Feeder. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer; 