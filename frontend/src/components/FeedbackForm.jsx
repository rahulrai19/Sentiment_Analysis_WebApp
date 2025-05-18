import { useState } from "react";
import axios from "axios";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({ name: "", event: "", comment: "" });
  const [submitted, setSubmitted] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE}/api/submit-feedback`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setSubmitted(true);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  if (submitted)
    return (
      <h2 className="text-green-600 text-center mt-8">
        Thank you for your feedback!
      </h2>
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
          required
        />
        <input
          className="w-full p-2 border rounded"
          name="event"
          placeholder="Event/Club Name"
          onChange={handleChange}
          required
        />
        <textarea
          className="w-full p-2 border rounded"
          name="comment"
          placeholder="Your Feedback"
          onChange={handleChange}
          required
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Submit
        </button>
      </form>
    </div>
  );
}


