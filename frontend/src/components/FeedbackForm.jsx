import React, { useState, useEffect } from "react";
import axios from "axios";

const FeedbackForm = () => {
  // Main state management
  const [view, setView] = useState("login"); // login, feedback, dashboard
  const [formData, setFormData] = useState({ name: "", event: "", comment: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [sentiment, setSentiment] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  const API_BASE = process.env.REACT_APP_API_BASE;

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("studentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setView("dashboard");
        fetchFeedbackHistory(parsedUser.id);
    } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("studentUser");
    }
    }
  }, []);

  // Fetch feedback history for the logged-in student
  const fetchFeedbackHistory = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/api/student-feedback/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("studentToken")}`
          },
        }
    );
      setFeedbackHistory(response.data.feedbacks || []);
    } catch (error) {
      console.error("Failed to fetch feedback history:", error);
      setError("Failed to load your feedback history. Please try again later.");
    }
    setLoading(false);
};

  // Handle login form input changes
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError(""); // Clear any previous errors
  };

  // Handle feedback form input changes
  const handleFeedbackChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post(
        `${API_BASE}/api/student-login`,
        loginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem("studentToken", token);
      localStorage.setItem("studentUser", JSON.stringify(user));
      
      setUser(user);
      setView("dashboard");
      fetchFeedbackHistory(user.id);
      
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.response?.data?.message || "Login failed. Please check your credentials.");
    }
    
    setLoading(false);
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Add user ID to the form data if logged in
    const submissionData = user 
      ? { ...formData, studentId: user.id, name: user.name || formData.name }
      : formData;
    
    try {
      const response = await axios.post(
        `${API_BASE}/api/submit-feedback`,
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": user ? `Bearer ${localStorage.getItem("studentToken")}` : undefined
          },
        }
      );
      setSentiment(response.data.sentiment);
      setSubmitted(true);
      
      // If user is logged in, refresh feedback history
      if (user) {
        setTimeout(() => {
          setSubmitted(false);
          fetchFeedbackHistory(user.id);
          setView("dashboard");
        }, 3000);
      }
      
    } catch (error) {
      console.error("Submission failed:", error);
      setError("Failed to submit feedback. Please try again.");
    }
    
    setLoading(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentUser");
    setUser(null);
    setView("login");
    setFeedbackHistory([]);
  };

  // Render login form
  const renderLoginForm = () => (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold mb-4 text-center">Student Login</h2>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleLoginChange}
          value={loginData.email}
          required
        />
        <input
          className="w-full p-2 border rounded"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleLoginChange}
          value={loginData.password}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p>Don't have an account? Contact your administrator</p>
        <button 
          onClick={() => setView("feedback")} 
          className="mt-2 text-blue-600 hover:underline"
        >
          Continue as guest
        </button>
      </div>
    </div>
  );

  // Render feedback form
  const renderFeedbackForm = () => {
    if (submitted) {
      return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl text-center">
          <h2 className="text-green-600 mb-4">Thank you for your feedback!</h2>
          {sentiment && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <strong>Sentiment:</strong> {sentiment}
            </div>
          )}
          {user && (
            <button
              onClick={() => {
                setSubmitted(false);
                setView("dashboard");
              }}
              className="mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-center">Submit Feedback</h2>
          {user && (
            <button
              onClick={() => setView("dashboard")}
              className="text-blue-600 hover:underline"
            >
              Back to Dashboard
            </button>
          )}
        </div>
        
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          {!user && (
            <input
              className="w-full p-2 border rounded"
              name="name"
              placeholder="Your Name"
              onChange={handleFeedbackChange}
              value={formData.name}
              required
            />
          )}
          <input
            className="w-full p-2 border rounded"
            name="event"
            placeholder="Event/Club Name"
            onChange={handleFeedbackChange}
            value={formData.event}
            required
          />
          <textarea
            className="w-full p-2 border rounded"
            name="comment"
            placeholder="Your Feedback"
            onChange={handleFeedbackChange}
            value={formData.comment}
            rows="4"
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
        
        {!user && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setView("login")}
              className="text-blue-600 hover:underline"
            >
              Login as Student
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render student dashboard
  const renderDashboard = () => (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Student Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView("feedback")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            New Feedback
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-2">Profile Information</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-gray-600">Name:</p>
            <p className="font-medium">{user?.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600">Email:</p>
            <p className="font-medium">{user?.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600">Student ID:</p>
            <p className="font-medium">{user?.studentId || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600">Department:</p>
            <p className="font-medium">{user?.department || "N/A"}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Your Feedback History</h3>
        {loading ? (
          <p className="text-center py-4">Loading feedback history...</p>
        ) : feedbackHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Event</th>
                  <th className="py-2 px-4 text-left">Feedback</th>
                  <th className="py-2 px-4 text-left">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {feedbackHistory.map((feedback, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-4">{new Date(feedback.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{feedback.event}</td>
                    <td className="py-2 px-4">{feedback.comment}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        feedback.sentiment === "Positive" ? "bg-green-100 text-green-800" :
                        feedback.sentiment === "Negative" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {feedback.sentiment || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-4 bg-gray-50 rounded">No feedback submissions found.</p>
        )}
      </div>
    </div>
  );

  // Main render logic based on current view
  switch (view) {
    case "login":
      return renderLoginForm();
    case "feedback":
      return renderFeedbackForm();
    case "dashboard":
      return renderDashboard();
    default:
      return renderLoginForm();
  }
};

export default FeedbackForm;
