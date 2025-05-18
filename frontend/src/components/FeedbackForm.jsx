import React, { useState, useEffect } from "react";
import axios from "axios";

const FeedbackForm = () => {
  // Main state management
  const [view, setView] = useState("login"); // login, feedback, dashboard
  const [activeTab, setActiveTab] = useState("profile"); // profile, history, analytics
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
          setActiveTab("history");
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

  // Tab component
  const Tab = ({ id, label, icon, active, onClick }) => (
        <button
      onClick={() => onClick(id)}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ease-in-out ${
        active
          ? "bg-white text-blue-600 border-t border-l border-r border-gray-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
        >
      <span className="mr-2">{icon}</span>
      {label}
        </button>
  );

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
                setActiveTab("history");
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

  // Render student dashboard with tabs
  const renderDashboard = () => (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-md rounded-xl overflow-hidden">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Student Dashboard</h2>
            <p className="opacity-90">Welcome back, {user?.name || "Student"}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setView("feedback")}
              className="bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              New Feedback
            </button>
            <button
              onClick={handleLogout}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition border border-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 px-6 pt-4 bg-gray-50">
        <Tab
          id="profile"
          label="Profile"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>}
          active={activeTab === "profile"}
          onClick={setActiveTab}
        />
        <Tab
          id="history"
          label="Feedback History"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>}
          active={activeTab === "history"}
          onClick={setActiveTab}
        />
        <Tab
          id="analytics"
          label="Analytics"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>}
          active={activeTab === "analytics"}
          onClick={setActiveTab}
        />
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "profile" && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Profile Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold">
                    {user?.name?.charAt(0) || "S"}
                  </div>
                </div>
                <h4 className="text-center text-xl font-medium">{user?.name || "Student"}</h4>
                <p className="text-center text-gray-600 mb-4">{user?.department || "Department"}</p>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="font-medium">{user?.studentId || "N/A"}</p>
                </div>
              </div>
              
              <div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{user?.email || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{user?.department || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-medium">{user?.year || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium">{user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "history" && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Your Feedback History</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : feedbackHistory.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feedbackHistory.map((feedback, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {feedback.event}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {feedback.comment}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 mb-2">No feedback submissions found</p>
                <button
                  onClick={() => setView("feedback")}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit Your First Feedback
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "analytics" && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Feedback Analytics</h3>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Total Submissions</p>
                    <p className="text-2xl font-bold text-blue-700">{feedbackHistory.length}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Positive Feedback</p>
                    <p className="text-2xl font-bold text-green-700">
                      {feedbackHistory.filter(f => f.sentiment === "Positive").length}
                    </p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Negative Feedback</p>
                    <p className="text-2xl font-bold text-red-700">
                      {feedbackHistory.filter(f => f.sentiment === "Negative").length}
                    </p>
                  </div>
                  <div className="bg-red-100 p-2 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-4">Feedback by Event</h4>
              {feedbackHistory.length > 0 ? (
                <div className="space-y-4">
                  {Array.from(new Set(feedbackHistory.map(f => f.event))).map(event => {
                    const eventFeedbacks = feedbackHistory.filter(f => f.event === event);
                    const positiveCount = eventFeedbacks.filter(f => f.sentiment === "Positive").length;
                    const percentage = Math.round((positiveCount / eventFeedbacks.length) * 100);
                    
                    return (
                      <div key={event} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{event}</span>
                          <span className="text-sm text-gray-500">{eventFeedbacks.length} submissions</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">{percentage}% positive</span>
                          <span className="text-xs text-gray-500">
                            {positiveCount} positive / {eventFeedbacks.length - positiveCount} negative
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">No data available</p>
              )}
            </div>
          </div>
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

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

export default FeedbackForm;
