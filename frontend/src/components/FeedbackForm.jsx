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

// Emoji map for ratings
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
    rating: "",
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

  const handleRatingSelect = (rating) => {
    setFormData({ ...formData, rating });
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
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl text-center">
        <h2 className="text-green-600 mb-4">Thank you for your feedback!</h2>
        {sentiment && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <strong>Sentiment:</strong> {sentiment}
          </div>
        )}
        <button
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => {
            setFormData({
              name: "",
              event: "",
              eventType: "",
              comment: "",
              rating: "",
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
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold mb-4 text-center">Submit Feedback Form</h2>
      {/* Dashboard Section */}
      <div className="dashboard-section mb-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
        <div>
          <span className="dashboard-label font-semibold">Total Submissions:</span>{" "}
          <span className="dashboard-value">{dashboard.count}</span>
        </div>
        <div>
          <span className="dashboard-label font-semibold">Average Rating:</span>{" "}
          <span className="dashboard-value">{dashboard.avgRating}</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="form-input"
          name="name"
          placeholder="Your Name"
          onChange={handleChange}
          value={formData.name}
          required
        />
        <input
          className="form-input"
          name="event"
          placeholder="Event/Club Name"
          onChange={handleChange}
          value={formData.event}
          required
        />
        {/* Event Type Dropdown */}
        <select
          className="form-select"
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
        {/* Rating Input with Emojis */}
        <div className="rating-container flex justify-between items-center my-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
            <button
              type="button"
              key={r}
              className={`rating-option-emoji${Number(formData.rating) === r ? " selected" : ""}`}
              onClick={() => handleRatingSelect(r)}
              aria-label={`Rate ${r}`}
            >
              <span style={{ fontSize: "2rem", display: "block" }}>{getEmojiForRating(r)}</span>
              <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{r}</span>
            </button>
          ))}
        </div>
        <textarea
          className="form-textarea"
          name="comment"
          placeholder="Your Feedback"
          onChange={handleChange}
          value={formData.comment}
          required
        />
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
      {/* Feedback Dashboard */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">All Submissions</h3>
        <div className="feedback-dashboard bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
          {allFeedbacks.length === 0 ? (
            <p className="text-gray-500 text-center">No feedback submitted yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">Event</th>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-left">Rating</th>
                  <th className="px-2 py-1 text-left">Comment</th>
                </tr>
              </thead>
              <tbody>
                {allFeedbacks.map((f, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1">{f.name}</td>
                    <td className="px-2 py-1">{f.event}</td>
                    <td className="px-2 py-1">{f.eventType}</td>
                    <td className="px-2 py-1 text-center">
                      <span style={{ fontSize: "1.2rem" }}>{getEmojiForRating(Number(f.rating))}</span>
                      <span className="ml-1">{f.rating}</span>
                    </td>
                    <td className="px-2 py-1">{f.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;