import React, { useState, useEffect } from "react";
import { submitFeedback, getFeedbacks, getUniqueEvents } from "../services/api";
import { Bars3Icon, ChatBubbleLeftIcon, ChartBarIcon } from "@heroicons/react/24/outline";

const EVENT_TYPES = [
  "Workshop",
  "Seminar",
  "Competition",
  "Meetup",
  "Webinar",
  "Hackathon",
  "Coding Contest",
  "Sports Event",
  "Dance Event",
  "Music Event",
  "Art Event",
  "Cultural Event",
  "Social Service",
  "Festival",
  "Concert",
  "Movie Night",
  "Game Night",
  "Party",
  "Other",
];

// Emoji map for ratings (for display only)
const ratingEmojis = [
  { min: 1, max: 2, emoji: "😡", label: "Very Bad" },
  { min: 3, max: 4, emoji: "😕", label: "Bad" },
  { min: 5, max: 6, emoji: "😐", label: "Neutral" },
  { min: 7, max: 8, emoji: "🙂", label: "Good" },
  { min: 9, max: 10, emoji: "😃", label: "Excellent" },
];

function getEmojiForRating(rating) {
  const found = ratingEmojis.find((e) => rating >= e.min && rating <= e.max);
  return found ? found.emoji : "😐";
}

const API_BASE = import.meta.env.VITE_API_URL;

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    event: "",
    eventType: "",
    comment: "",
    rating: 7,
  });
  const [sentiment, setSentiment] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dashboard state
  const [dashboard, setDashboard] = useState({ count: 0, totalEvents: 0 });
  const [allFeedbacks, setAllFeedbacks] = useState([]);

  // New state for available events
  const [availableEvents, setAvailableEvents] = useState([]);

  // Fetch dashboard data AND the list of unique events
  useEffect(() => {
    // Fetch dashboard data AND the list of unique events
    getFeedbacks()
      .then((res) => {
        const feedbacks = res.data || [];
        setAllFeedbacks(feedbacks);
        const count = feedbacks.length;
        setDashboard(prev => ({ ...prev, count }));
      })
      .catch((error) => {
        console.error("Error fetching feedbacks:", error);
        setDashboard({ count: 0, totalEvents: 0 });
        setAllFeedbacks([]);
      });

    // Fetch unique events from the backend
    getUniqueEvents()
      .then((res) => {
        if (res && Array.isArray(res.events)) {
          setAvailableEvents(res.events);
          setDashboard(prev => ({ ...prev, totalEvents: res.events.length }));
          console.log("Fetched available events:", res.events);
        } else {
          console.error("Error fetching unique events: Unexpected response format", res);
          setAvailableEvents([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching unique events:", error);
        setAvailableEvents([]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Handling change for:", name, "with value:", value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSliderChange = (e) => {
    setFormData({ ...formData, rating: Number(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const feedbackWithDate = {
        ...formData,
        submissionDate: new Date().toISOString()
      };
      const response = await submitFeedback(feedbackWithDate);
      setSentiment(response.data.sentiment);
      setSubmitted(true);
      // Optionally re-fetch events after submitting
      getUniqueEvents()
        .then((res) => {
          setAvailableEvents(res.data.events || []);
        })
        .catch((error) => {
          console.error("Error fetching unique events after submission:", error);
          setAvailableEvents([]);
        });
    } catch (error) {
      console.error("Submission failed:", error);
    }
    setLoading(false);
  };

  if (submitted)
    return (
      <div className="max-w-3xl mx-auto mt-14 p-10 bg-blue-50/80 backdrop-blur-sm shadow-2xl rounded-2xl border border-blue-100 text-center">
        <h2 className="text-blue-700 mb-4 text-3xl font-extrabold drop-shadow">
          Thank You!
        </h2>
        <p className="text-blue-600 mb-6 text-lg font-medium">
          Your feedback has been recorded successfully.
        </p>
        {sentiment && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200 text-blue-800 font-semibold">
            Sentiment: <span className="font-normal">{sentiment}</span>
          </div>
        )}
        <button
          className="mt-8 bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg shadow-lg hover:bg-yellow-500 transition-colors text-xl font-bold tracking-wide hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          onClick={() => {
            setFormData({
              name: "",
              event: "",
              eventType: "",
              comment: "",
              rating: 7,
            });
            setSentiment(null);
            setSubmitted(false);
          }}
        >
          Submit Another Feedback
        </button>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-14 p-10 bg-blue-950/90 backdrop-blur-sm shadow-inset-lg shadow-blue-500/20 rounded-xl border border-blue-700 text-blue-100">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-yellow-400 drop-shadow">
        Submit Feedback Form
      </h2>

      {/* Dashboard Section */}
      <div className="dashboard-section mb-10 p-6 bg-blue-800/70 rounded-xl flex flex-col sm:flex-row justify-between items-center border border-blue-600 shadow-inner">
        <div className="flex items-center gap-4">
          <div className="bg-blue-700 p-3 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <span className="dashboard-label font-semibold text-blue-200">Total Submissions:</span>{" "}
            <span className="dashboard-value text-white">{dashboard.count}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-700 p-3 rounded-lg">
            <ChatBubbleLeftIcon className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <span className="dashboard-label font-semibold text-blue-200">Live Events:</span>{" "}
            <span className="dashboard-value text-white">{dashboard.totalEvents}</span>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-blue-200 mb-2">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input w-full max-w-xl mx-auto bg-blue-800/50 border-blue-600 focus:border-blue-400 focus:ring-blue-400 rounded-xl py-4 px-6 text-lg transition-all duration-200 hover:border-blue-500 focus:shadow-lg text-blue-50 placeholder-blue-300"
            placeholder="Enter your name"
          />
        </div>

        {/* Event Selection */}
        <div>
          <label htmlFor="event" className="block text-sm font-medium text-blue-200 mb-2">
            Select Event
          </label>
          <select
            id="event"
            name="event"
            value={formData.event}
            onChange={handleChange}
            required
            className="form-select w-full max-w-xl mx-auto bg-blue-800/50 border-blue-600 focus:border-blue-400 focus:ring-blue-400 rounded-xl py-4 px-6 text-lg transition-all duration-200 hover:border-blue-500 focus:shadow-lg text-blue-50"
          >
            <option value="">Select an event</option>
            {availableEvents.map((event) => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </div>

        {/* Event Type */}
        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-blue-200 mb-2">
            Event Type
          </label>
          <select
            id="eventType"
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            required
            className="form-select w-full max-w-xl mx-auto bg-blue-800/50 border-blue-600 focus:border-blue-400 focus:ring-blue-400 rounded-xl py-4 px-6 text-lg transition-all duration-200 hover:border-blue-500 focus:shadow-lg text-blue-50"
          >
            <option value="">Select event type</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Section */}
        <div className="max-w-xl mx-auto">
          <label className="block text-sm font-medium text-blue-200 mb-4">
            Rating
          </label>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-6 w-full">
              <input
                type="range"
                name="rating"
                min="1"
                max="10"
                value={formData.rating}
                onChange={handleChange}
                className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                style={{
                  background: 'linear-gradient(to right, #93c5fd 0%, #3b82f6 100%)',
                  height: '8px',
                  borderRadius: '4px',
                  outline: 'none',
                  WebkitAppearance: 'none',
                }}
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-3xl transform hover:scale-110 transition-transform duration-200">
                {getEmojiForRating(formData.rating)}
              </span>
              <span className="text-2xl font-semibold text-blue-200">
                {formData.rating}/10
              </span>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-blue-200 mb-2">
            Your Feedback
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            required
            rows="4"
            className="form-textarea w-full max-w-xl mx-auto bg-blue-800/50 border-blue-600 focus:border-blue-400 focus:ring-blue-400 rounded-xl py-4 px-6 text-lg transition-all duration-200 hover:border-blue-500 focus:shadow-lg text-blue-50 placeholder-blue-300"
            placeholder="Share your thoughts about the event..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-lg text-blue-950 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </div>
      </form>

      {/* Submissions Section with Auto-Moving Cards */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-6 text-yellow-400 flex items-center gap-2">
          <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Recent Submissions
        </h3>
        <div className="relative overflow-hidden group">
          {/* Navigation Buttons */}
          <button 
            onClick={() => {
              const container = document.querySelector('.feedback-cards-container');
              if (container) {
                const cardWidth = 256; // w-64 is 256px
                const gap = 16; // space-x-4 is 16px
                container.scrollLeft -= (cardWidth + gap);
              }
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-blue-700/80 hover:bg-blue-600 text-blue-100 p-2 rounded-full shadow-lg border border-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => {
              const container = document.querySelector('.feedback-cards-container');
              if (container) {
                 const cardWidth = 256; // w-64 is 256px
                 const gap = 16; // space-x-4 is 16px
                 container.scrollLeft += (cardWidth + gap);
              }
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-blue-700/80 hover:bg-blue-600 text-blue-100 p-2 rounded-full shadow-lg border border-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="feedback-dashboard bg-blue-800/50 rounded-xl p-6 border border-blue-700">
            {allFeedbacks.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="mt-2 text-blue-300">No feedback submitted yet.</p>
              </div>
            ) : (
              <div className="relative">
                <div className="flex space-x-4 animate-scroll feedback-cards-container whitespace-nowrap">
                  {allFeedbacks.map((f, i) => (
                    <div
                      key={i}
                      className="feedback-card flex-shrink-0 w-64 bg-blue-900/70 border border-blue-700 rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transform hover:border-blue-600 text-blue-100"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-yellow-400 font-semibold">
                            {f.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-yellow-400 truncate">
                              {f.name}
                            </h4>
                            <span className="text-sm text-blue-300">
                              {f.submissionDate && !isNaN(new Date(f.submissionDate).getTime())
                                ? (() => {
                                    const date = new Date(f.submissionDate);
                                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                    const day = date.getDate().toString().padStart(2, '0');
                                    const year = date.getFullYear();
                                    return `${month}/${day}/${year}`;}
                                )()
                                : 'Invalid Date'
                              }
                            </span>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm font-medium text-blue-200">
                              {f.event}
                            </p>
                            <p className="text-sm text-blue-300">
                              {f.eventType}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Render duplicate cards */}
                  {allFeedbacks.map((f, i) => (
                    <div
                      key={`duplicate-${i}`}
                      className="feedback-card flex-shrink-0 w-64 bg-blue-900/70 border border-blue-700 rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transform hover:border-blue-600 text-blue-100"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-yellow-400 font-semibold">
                            {f.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-yellow-400 truncate">
                              {f.name}
                            </h4>
                            <span className="text-sm text-blue-300">
                              {f.submissionDate && !isNaN(new Date(f.submissionDate).getTime())
                                ? (() => {
                                    const date = new Date(f.submissionDate);
                                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                    const day = date.getDate().toString().padStart(2, '0');
                                    const year = date.getFullYear();
                                    return `${month}/${day}/${year}`;}
                                )()
                                : 'Invalid Date'
                              }
                            </span>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm font-medium text-blue-200">
                              {f.event}
                            </p>
                            <p className="text-sm text-blue-300">
                              {f.eventType}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Gradient Overlays for Scroll Effect */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-blue-950/90 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-blue-950/90 to-transparent pointer-events-none"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Translate by the total width of one set of original cards including gaps */
            transform: translateX(calc(-1 * ((${
              allFeedbacks.length
            } * 256px) + (${allFeedbacks.length - 1} * 16px))));
          }
        }
        .animate-scroll {
          animation: scroll 95s linear infinite; /* Adjusted duration */
          /* Remove scroll-behavior: smooth; from here */
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default FeedbackForm;
