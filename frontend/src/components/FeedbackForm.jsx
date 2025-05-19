import React, { useState, useEffect } from "react";
import { submitFeedback, getFeedbacks, getUniqueEvents } from "../services/api";
import { Bars3Icon } from "@heroicons/react/24/outline";

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
  const [dashboard, setDashboard] = useState({ count: 0, avgRating: 0 });
  const [allFeedbacks, setAllFeedbacks] = useState([]);

  // New state for available events
  const [availableEvents, setAvailableEvents] = useState([]);

  // Fetch dashboard data AND the list of unique events
  useEffect(() => {
    // Fetch dashboard data (keep if needed in this component)
    getFeedbacks()
      .then((res) => {
        const feedbacks = res.data || [];
        setAllFeedbacks(feedbacks);
        const count = feedbacks.length;
        const ratings = feedbacks
          .map((f) => Number(f.rating))
          .filter((r) => !isNaN(r));
        const avgRating =
          ratings.length > 0
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
            : 0;
        setDashboard({ count, avgRating });
      })
      .catch((error) => {
        console.error("Error fetching feedbacks:", error);
        setDashboard({ count: 0, avgRating: 0 });
        setAllFeedbacks([]);
      });

    // Fetch unique events from the backend
    getUniqueEvents()
      .then((res) => {
        // Safely check if res, res.data, and res.data.events exist and is an array
        if (res && res.data && Array.isArray(res.data.events)) {
          setAvailableEvents(res.data.events);
          console.log("Fetched available events:", res.data.events);
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
      <div className="max-w-3xl mx-auto mt-14 p-10 bg-white shadow-2xl rounded-2xl border border-blue-100 text-center">
        <h2 className="text-green-600 mb-4 text-2xl font-bold">Thank you for your feedback!</h2>
        {sentiment && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <strong>Sentiment:</strong> {sentiment}
          </div>
        )}
        <button
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700 transition text-lg font-semibold"
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
    <div className="max-w-3xl mx-auto mt-14 p-10 bg-white shadow-2xl rounded-2xl border border-blue-100">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-700 drop-shadow">Submit Feedback Form</h2>
      {/* Dashboard Section */}
      <div className="dashboard-section mb-10 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl flex flex-col sm:flex-row justify-between items-center border border-blue-100 shadow">
        <div>
          <span className="dashboard-label font-semibold">Total Submissions:</span>{" "}
          <span className="dashboard-value">{dashboard.count}</span>
        </div>
        <div>
          <span className="dashboard-label font-semibold">Average Rating:</span>{" "}
          <span className="dashboard-value">{dashboard.avgRating}</span>
        </div>
      </div>
      <div className="feedback-form-main">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            className="form-input border border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-xl bg-blue-50 placeholder:text-blue-400 text-center text-lg py-3 transition hover:border-blue-500 hover:shadow-md"
            name="name"
            placeholder="Your Name"
            onChange={handleChange}
            value={formData.name}
            required
            id="name"
          />
          <div>
            <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-2">Select Event/Club</label>
            <select
              id="event"
              name="event"
              value={formData.event}
              onChange={handleChange}
              className="form-select border border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-xl bg-blue-50 text-center text-lg py-3 transition text-blue-700 hover:border-blue-500 hover:shadow-md"
              required
            >
              <option value="">Choose an event...</option>
              {availableEvents.map((eventName, index) => (
                <option key={index} value={eventName}>
                  {eventName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">Select Event Type</label>
            <select
              className="form-select border border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-xl bg-blue-50 text-center text-lg py-3 transition text-blue-700 hover:border-blue-500 hover:shadow-md"
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              required
            >
              <option value="">Select Event Type</option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="my-4">
            <label htmlFor="rating" className="block font-semibold mb-2 text-blue-700">
              Rating:
              <span className="ml-2 text-xl align-middle">
                {getEmojiForRating(formData.rating)} {formData.rating}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.rating}
              onChange={handleSliderChange}
              className="rating-slider mb-2"
              style={{ accentColor: "#2563eb" }}
              id="rating"
            />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
            <textarea
              className="form-textarea border border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-xl bg-blue-50 placeholder:text-blue-400 text-center text-lg py-3 mb-4 transition"
              name="comment"
              placeholder="Your Feedback"
              onChange={handleChange}
              value={formData.comment}
              required
              rows={4}
              id="comment"
            />
          </div>
          <div className="btn-block mt-2 flex justify-center">
            <button
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-10 rounded-full shadow-xl hover:from-blue-600 hover:to-blue-800 transition text-xl font-bold tracking-wide"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
      {/* Feedback Dashboard */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-4">All Submissions</h3>
        <div className="feedback-dashboard grid gap-4 max-h-96 overflow-y-auto bg-blue-50 rounded-2xl p-4">
          {allFeedbacks.length === 0 ? (
            <p className="text-gray-500 text-center">No feedback submitted yet.</p>
          ) : (
            allFeedbacks.map((f, i) => (
              <div
                key={i}
                className="feedback-card flex flex-col md:flex-row md:items-center gap-4 bg-white border border-blue-100 rounded-2xl shadow p-5 hover:shadow-lg transition"
              >
                <div className="flex-1">
                  <div className="font-bold text-blue-700">{f.name}</div>
                  <div className="text-sm text-gray-500">{f.event} &mdash; {f.eventType}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;