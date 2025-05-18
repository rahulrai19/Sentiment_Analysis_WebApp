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

  const API_BASE = process.env.REACT_APP_API_BASE;

  // Fetch dashboard data (number of submissions and average rating)
  useEffect(() => {
    axios
      .get(`${API_BASE}/feedbacks`)
      .then((res) => {
        const feedbacks = res.data || [];
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
      .catch(() => setDashboard({ count: 0, avgRating: 0 }));
  }, [submitted, API_BASE]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
      <div className="dashboard-section">
        <span className="dashboard-label">Total Submissions:</span>
        <span className="dashboard-value">{dashboard.count}</span>
        <span className="dashboard-label">Average Rating:</span>
        <span className="dashboard-value">{dashboard.avgRating}</span>
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
        {/* Rating Input */}
        <div className="rating-container">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
            <div
              key={r}
              className={`rating-option${formData.rating === r ? " selected" : ""}`}
              onClick={() => setFormData({ ...formData, rating: r })}
            >
              {r}
            </div>
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
    </div>
  );
};

export default FeedbackForm;