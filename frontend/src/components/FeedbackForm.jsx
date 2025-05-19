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

const API_BASE = process.env.REACT_APP_API_URL;

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
            className="form-input border border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-xl bg-blue-50 placeholder:text-blue-400 text-center text-lg py-3 mb-4 transition"
            name="name"
            placeholder="Your Name"
            onChange={handleChange}
            value={formData.name}
            required
          />
          <input
            className="form-input border border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-xl bg-blue-50 placeholder:text-blue-400 text-center text-lg py-3 mb-4 transition"
            name="event"
            placeholder="Event/Club Name"
            onChange={handleChange}
            value={formData.event}
            required
          />
          {/* Event Type Dropdown */}
          <select
            className="form-select border border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-xl bg-blue-50 text-center text-lg py-3 mb-4 transition"
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
            <label className="block font-semibold mb-2 text-blue-700">
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
            />
            <div className="flex justify-between text-xs mt-1 px-1">
              {/* <span>1</span>
              <span>5</span>
              <span>10</span> */}
            </div>
          </div>
          <textarea
            className="form-textarea border border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-xl bg-blue-50 placeholder:text-blue-400 text-center text-lg py-3 mb-4 transition"
            name="comment"
            placeholder="Your Feedback"
            onChange={handleChange}
            value={formData.comment}
            required
          />
          {/* Centered Submit Button just below feedback */}
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
                  <div className="mt-1">{f.comment}</div>
                </div>
                <div className="flex flex-col items-center min-w-[70px]">
                  <span className="font-semibold text-lg">{f.rating}</span>
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