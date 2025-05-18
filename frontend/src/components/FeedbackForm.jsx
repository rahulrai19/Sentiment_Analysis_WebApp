import React, { useState, useEffect } from "react";
import axios from "axios";

const EVENT_TYPES = [
  "Workshop",
  "Seminar",
  "Competition",
  "Meetup",
  "Webinar",
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

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    event: "",
    eventType: "",
    comment: "",
    rating: 5,
  });
  const [sentiment, setSentiment] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dashboard state
  const [dashboard, setDashboard] = useState({ count: 0, avgRating: 0 });
  const [allFeedbacks, setAllFeedbacks] = useState([]);

  const API_BASE = process.env.REACT_APP_API_BASE;

  // Fetch dashboard data (number of submissions and average rating)
  useEffect(() => {
    axios
      .get(`${API_BASE}/feedbacks`)
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
      .catch(() => {
        setDashboard({ count: 0, avgRating: 0 });
        setAllFeedbacks([]);
      });
  }, [submitted, API_BASE]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSliderChange = (e) => {
    setFormData({ ...formData, rating: Number(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/submit-feedback`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setSentiment(response.data.sentiment);
      setSubmitted(true);
    } catch (error) {
      console.error("Submission failed:", error);
    }
    setLoading(false);
  };

  if (submitted)
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white shadow-md rounded-xl text-center">
        <h2 className="text-green-600 mb-4">Thank you for your feedback!</h2>
        {sentiment && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <strong>Sentiment:</strong> {sentiment}
          </div>
        )}
        <button
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition"
          onClick={() => {
            setFormData({
              name: "",
              event: "",
              eventType: "",
              comment: "",
              rating: 5,
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
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white shadow-md rounded-xl">
      <h2 className="text-3xl font-semibold mb-6 text-center">Submit Feedback Form</h2>
      {/* Dashboard Section */}
      <div className="dashboard-section mb-8 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
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
            className="form-input border-2 border-blue-300 focus:border-blue-600"
            style={{ borderRadius: 0 }}
            name="name"
            placeholder="Your Name"
            onChange={handleChange}
            value={formData.name}
            required
          />
          <input
            className="form-input border-2 border-blue-300 focus:border-blue-600"
            style={{ borderRadius: 0 }}
            name="event"
            placeholder="Event/Club Name"
            onChange={handleChange}
            value={formData.event}
            required
          />
          {/* Event Type Dropdown */}
          <select
            className="form-select border-2 border-blue-300 focus:border-blue-600"
            style={{ borderRadius: 0 }}
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
          {/* Rating Slider */}
          <div className="my-4">
            <label className="block font-semibold mb-2">
              Rating: <span className="ml-2 text-xl">{getEmojiForRating(formData.rating)} {formData.rating}</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.rating}
              onChange={handleSliderChange}
              className="w-full accent-blue-600"
              style={{ height: "2.5rem" }}
            />
            <div className="flex justify-between text-xs mt-1 px-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
          <textarea
            className="form-textarea border-2 border-blue-300 focus:border-blue-600"
            style={{ borderRadius: 0 }}
            name="comment"
            placeholder="Your Feedback"
            onChange={handleChange}
            value={formData.comment}
            required
          />
          {/* Centered Submit Button just below feedback */}
          <div className="btn-block mt-2">
            <button
              type="submit"
              className="btn bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-8 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-800 transition text-lg font-semibold"
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
        <div className="feedback-dashboard grid gap-4 max-h-64 overflow-y-auto">
          {allFeedbacks.length === 0 ? (
            <p className="text-gray-500 text-center">No feedback submitted yet.</p>
          ) : (
            allFeedbacks.map((f, i) => (
              <div
                key={i}
                className="feedback-card flex flex-col md:flex-row md:items-center gap-3"
              >
                <div className="flex-1">
                  <div className="font-bold text-blue-700">{f.name}</div>
                  <div className="text-sm text-gray-500">{f.event} &mdash; {f.eventType}</div>
                  <div className="mt-1">{f.comment}</div>
                </div>
                <div className="flex flex-col items-center min-w-[70px]">
                  <span style={{ fontSize: "2rem" }}>{getEmojiForRating(Number(f.rating))}</span>
                  <span className="font-semibold">{f.rating}</span>
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