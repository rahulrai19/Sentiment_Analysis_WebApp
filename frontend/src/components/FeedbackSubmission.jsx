import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

function FeedbackSubmission() {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock events data - replace with actual data from your backend
  const events = [
    { id: '1', name: 'Spring Festival 2024' },
    { id: '2', name: 'Tech Workshop Series' },
    { id: '3', name: 'Cultural Night' },
    { id: '4', name: 'Career Fair' },
    { id: '5', name: 'Sports Tournament' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }
    
    if (!feedback.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      toast.success('Thank you for your feedback!');
      setSelectedEvent('');
      setFeedback('');
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Feedback</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-2">
              Select Event/Club
            </label>
            <select
              id="event"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              <option value="">Choose an event...</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Share your thoughts about the event..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all
              ${isSubmitting 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:bg-blue-700 hover:shadow-lg transform hover:scale-[1.02]'
              }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FeedbackSubmission; 