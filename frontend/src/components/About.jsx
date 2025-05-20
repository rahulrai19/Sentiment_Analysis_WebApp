import React from 'react';

function About() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-8 shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Sentiment Feeder</h1>
        <p className="text-lg text-gray-800 mb-4">
          Sentiment Feeder is a platform for students and organizers to share and analyze feedback on campus events. Our goal is to help improve event quality and campus life by making feedback easy, insightful, and actionable.
        </p>
        <p className="text-md text-gray-700">
          Built with ❤️ for the campus community.
        </p>
      </div>
    </div>
  );
}

export default About; 