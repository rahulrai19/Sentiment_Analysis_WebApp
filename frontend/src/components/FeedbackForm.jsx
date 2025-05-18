import React, { useState } from "react";
import axios from "axios";

const FeedbackForm = () => {
  const [formData, setFormData] = useState({ name: "", event: "", comment: "" });
  const [sentiment, setSentiment] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE;

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
      setSentiment(response.data.sentiment); // If backend returns sentiment
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
      </div>
    );

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold mb-4 text-center">Submit Feedback form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          name="name"
          placeholder="Your Name"
          onChange={handleChange}
          value={formData.name}
          required
        />
        <input
          className="w-full p-2 border rounded"
          name="event"
          placeholder="Event/Club Name"
          onChange={handleChange}
          value={formData.event}
          required
        />
        <textarea
          className="w-full p-2 border rounded"
          name="comment"
          placeholder="Your Feedback"
          onChange={handleChange}
          value={formData.comment}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;


