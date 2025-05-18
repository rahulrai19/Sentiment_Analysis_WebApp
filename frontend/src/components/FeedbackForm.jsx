import React, { useState } from "react";
import axios from "axios";
import "./FeedbackForm.css"; // Import the CSS file

const FeedbackForm = () => {
  // Main state management
  const [view, setView] = useState("feedback"); // feedback, dashboard
  const [activeTab, setActiveTab] = useState("profile"); // profile, history, analytics
  const [formData, setFormData] = useState({ name: "", event: "", comment: "" });
  const [sentiment, setSentiment] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  const API_BASE = process.env.REACT_APP_API_BASE;

  // Handle feedback form input changes
  const handleFeedbackChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (e) => {
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
      
      // Add the new feedback to history
      const newFeedback = {
        ...formData,
        sentiment: response.data.sentiment,
        createdAt: new Date().toISOString()
  };

      setFeedbackHistory([newFeedback, ...feedbackHistory]);
      
    } catch (error) {
      console.error("Submission failed:", error);
      setError("Failed to submit feedback. Please try again.");
    }
    
    setLoading(false);
  };

  // Tab component
  const Tab = ({ id, label, icon, active, onClick }) => (
        <button
      onClick={() => onClick(id)}
      className={`tab-button ${active ? 'tab-button-active' : 'tab-button-inactive'}`}
        >
      <span className="tab-icon">{icon}</span>
      {label}
        </button>
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
            <button
              onClick={() => {
                setSubmitted(false);
                setView("dashboard");
                setActiveTab("history");
              setFormData({ name: "", event: "", comment: "" });
              }}
            className="mt-4 form-button"
            >
            View Dashboard
            </button>
        </div>
  );
    }

    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-center">Submit Feedback</h2>
          {feedbackHistory.length > 0 && (
            <button
              onClick={() => setView("dashboard")}
              className="text-blue-600 hover:underline"
            >
              View Dashboard
            </button>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <input
            className="form-input"
              name="name"
              placeholder="Your Name"
              onChange={handleFeedbackChange}
              value={formData.name}
              required
            />
          <input
            className="form-input"
            name="event"
            placeholder="Event/Club Name"
            onChange={handleFeedbackChange}
            value={formData.event}
            required
          />
          <textarea
            className="form-input"
            name="comment"
            placeholder="Your Feedback"
            onChange={handleFeedbackChange}
            value={formData.comment}
            rows="4"
            required
          />
          <button
            type="submit"
            className="form-button"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
          </div>
    );
};

  // Render student dashboard with tabs
  const renderDashboard = () => (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-md rounded-xl overflow-hidden">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Feedback Dashboard</h2>
            <p className="opacity-90">View and analyze feedback</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setView("feedback")}
              className="bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              New Feedback
            </button>
          </div>
        </div>
          </div>
      {/* Tabs Navigation */}
      <div className="tab-container">
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
        {activeTab === "history" && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Feedback History</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : feedbackHistory.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="feedback-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Event</th>
                      <th>Feedback</th>
                      <th>Sentiment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackHistory.map((feedback, index) => (
                      <tr key={index}>
                        <td>
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </td>
                        <td className="font-medium">
                          {feedback.name}
                        </td>
                        <td>
                          {feedback.event}
                        </td>
                        <td className="max-w-xs truncate">
                          {feedback.comment}
                        </td>
                        <td>
                          <span className={`sentiment-tag ${
                            feedback.sentiment === "Positive" ? "sentiment-positive" :
                            feedback.sentiment === "Negative" ? "sentiment-negative" :
                            "sentiment-neutral"
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
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="stat-card stat-card-blue">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="stat-label">Total Submissions</p>
                    <p className="stat-value text-blue-700">{feedbackHistory.length}</p>
      </div>
                  <div className="stat-icon-container stat-icon-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
    </div>
                </div>
              </div>
              
              <div className="stat-card stat-card-green">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="stat-label">Positive Feedback</p>
                    <p className="stat-value text-green-700">
                      {feedbackHistory.filter(f => f.sentiment === "Positive").length}
                    </p>
                  </div>
                  <div className="stat-icon-container stat-icon-green">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="stat-card stat-card-red">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="stat-label">Negative Feedback</p>
                    <p className="stat-value text-red-700">
                      {feedbackHistory.filter(f => f.sentiment === "Negative").length}
                    </p>
                  </div>
                  <div className="stat-icon-container stat-icon-red">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        <div className="progress-container">
                          <div 
                            className="progress-bar" 
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
    case "feedback":
      return renderFeedbackForm();
    case "dashboard":
      return renderDashboard();
    default:
      return renderFeedbackForm();
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
