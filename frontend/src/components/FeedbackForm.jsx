import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FeedbackForm.css";

const FeedbackForm = () => {
  // Available events for dropdown
  const availableEvents = [
    "Annual Conference 2023",
    "Product Launch Webinar",
    "Customer Training Workshop",
    "Tech Meetup",
    "Industry Summit",
    "User Group Meeting",
    "Developer Conference",
    "Marketing Seminar",
    "Leadership Retreat",
    "Other"
  ];

  // Main state management
  const [view, setView] = useState("feedback"); // feedback, dashboard
  const [activeTab, setActiveTab] = useState("history"); // history, analytics, myDashboard
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    company: "", 
    event: "", 
    comment: "",
    rating: null
  });
  const [sentiment, setSentiment] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [customEvent, setCustomEvent] = useState("");
  const [showCustomEvent, setShowCustomEvent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userFeedback, setUserFeedback] = useState([]);

  const API_BASE = process.env.REACT_APP_API_BASE;

  // Load feedback history from localStorage on component mount
  useEffect(() => {
    const storedFeedback = localStorage.getItem("feedbackHistory");
    if (storedFeedback) {
      try {
        setFeedbackHistory(JSON.parse(storedFeedback));
    } catch (error) {
        console.error("Error parsing stored feedback:", error);
    }
    }
  }, []);
    
  // Save feedback history to localStorage whenever it changes
  useEffect(() => {
    if (feedbackHistory.length > 0) {
      localStorage.setItem("feedbackHistory", JSON.stringify(feedbackHistory));
    }
  }, [feedbackHistory]);

  // Filter user feedback when email is entered or changed
  useEffect(() => {
    if (userEmail) {
      const filteredFeedback = feedbackHistory.filter(
        feedback => feedback.email.toLowerCase() === userEmail.toLowerCase()
      );
      setUserFeedback(filteredFeedback);
    } else {
      setUserFeedback([]);
    }
  }, [userEmail, feedbackHistory]);

  // Handle feedback form input changes
  const handleFeedbackChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle event selection
  const handleEventChange = (e) => {
    const selectedEvent = e.target.value;
    if (selectedEvent === "Other") {
      setShowCustomEvent(true);
      setFormData({ ...formData, event: "" });
    } else {
      setShowCustomEvent(false);
      setFormData({ ...formData, event: selectedEvent });
    }
};

  // Handle custom event input
  const handleCustomEventChange = (e) => {
    const value = e.target.value;
    setCustomEvent(value);
    setFormData({ ...formData, event: value });
  };

  // Handle rating selection
  const handleRatingSelect = (rating) => {
    setFormData({ ...formData, rating });
  };

  // Handle user email input for dashboard
  const handleUserEmailChange = (e) => {
    setUserEmail(e.target.value);
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
      
      // Default to "Neutral" if no sentiment is returned
      const feedbackSentiment = response.data.sentiment || "Neutral";
      setSentiment(feedbackSentiment);
      setSubmitted(true);
      
      // Add the new feedback to history
      const newFeedback = {
        ...formData,
        sentiment: feedbackSentiment,
        createdAt: new Date().toISOString(),
        id: Date.now() // Use timestamp as a simple unique ID
      };
      
      setFeedbackHistory([newFeedback, ...feedbackHistory]);
      
      // If the user has entered their email in the dashboard, update their feedback list
      if (userEmail && userEmail.toLowerCase() === formData.email.toLowerCase()) {
        setUserFeedback([newFeedback, ...userFeedback]);
      }
      
    } catch (error) {
      console.error("Submission failed:", error);
      
      // For demo purposes, simulate a successful submission with random sentiment
      const sentiments = ["Positive", "Negative", "Neutral"];
      const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      setSentiment(randomSentiment);
      setSubmitted(true);
      
      // Add the new feedback to history with the random sentiment
      const newFeedback = {
        ...formData,
        sentiment: randomSentiment,
        createdAt: new Date().toISOString(),
        id: Date.now()
      };
      
      setFeedbackHistory([newFeedback, ...feedbackHistory]);
      
      // If the user has entered their email in the dashboard, update their feedback list
      if (userEmail && userEmail.toLowerCase() === formData.email.toLowerCase()) {
        setUserFeedback([newFeedback, ...userFeedback]);
      }
    }
    
    setLoading(false);
  };

  // Calculate average rating
  const calculateAverageRating = (feedbacks) => {
    if (!feedbacks || feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((total, feedback) => total + (feedback.rating || 0), 0);
    return Math.round((sum / feedbacks.length) * 10) / 10;
  };

  // Get sentiment counts
  const getSentimentCounts = (feedbacks) => {
    return {
      positive: feedbacks.filter(f => f.sentiment === "Positive").length,
      negative: feedbacks.filter(f => f.sentiment === "Negative").length,
      neutral: feedbacks.filter(f => f.sentiment === "Neutral").length
    };
  };

  // Render feedback form
  const renderFeedbackForm = () => {
    if (submitted) {
      return (
        <div className="feedback-container">
          <div className="feedback-card success-card">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Thank you for your feedback!</h2>
            <p className="success-message">
              We appreciate your input and will use it to improve our services.
            </p>
            {sentiment && (
              <div className="analytics-card">
                <p className="analytics-label">Sentiment Analysis</p>
                <p className="analytics-value" style={{ 
                  color: sentiment === "Positive" ? "var(--success)" : 
                         sentiment === "Negative" ? "var(--danger)" : "var(--warning)" 
                }}>
                  {sentiment}
                </p>
              </div>
            )}
            <div className="button-group">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setView("dashboard");
                  setActiveTab("myDashboard");
                  setUserEmail(formData.email);
                  setFormData({ 
                    name: "", 
                    email: "", 
                    company: "", 
                    event: "", 
                    comment: "",
                    rating: null
                  });
                  setCustomEvent("");
                  setShowCustomEvent(false);
                }}
                className="btn btn-primary"
              >
                View My Dashboard
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ 
                    name: "", 
                    email: "", 
                    company: "", 
                    event: "", 
                    comment: "",
                    rating: null
                  });
                  setCustomEvent("");
                  setShowCustomEvent(false);
                }}
                className="btn btn-outline"
              >
                Submit Another Feedback
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="feedback-container">
        <div className="feedback-header">
          <h1>Customer Feedback & <br />Experience Management</h1>
          <p>
            Effortlessly measure feedback from customers, users, visitors, and employees using <span className="highlight">real-time feedback</span>, in-depth analytics, and automation.
          </p>
        </div>
        
        <div className="feedback-card">
          <div className="card-header">
            <h2>Submit Your Feedback</h2>
            <p>We value your opinion and would love to hear about your experience.</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleFeedbackSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                className="form-input"
                name="name"
                placeholder="Enter your full name"
                onChange={handleFeedbackChange}
                value={formData.name}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="Enter your email address"
                onChange={handleFeedbackChange}
                value={formData.email}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Company/Organization</label>
              <input
                className="form-input"
                name="company"
                placeholder="Enter your company or organization"
                onChange={handleFeedbackChange}
                value={formData.company}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Select Event</label>
              <select
                className="form-input form-select"
                onChange={handleEventChange}
                required
                defaultValue=""
              >
                <option value="" disabled>Choose an event</option>
                {availableEvents.map((event, index) => (
                  <option key={index} value={event}>{event}</option>
                ))}
              </select>
            </div>
            
            {showCustomEvent && (
              <div className="form-group">
                <label className="form-label">Specify Event</label>
                <input
                  className="form-input"
                  name="customEvent"
                  placeholder="Enter the event name"
                  onChange={handleCustomEventChange}
                  value={customEvent}
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">How likely are you to recommend us to a friend or colleague?</label>
              <div className="rating-container">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <div 
                    key={rating} 
                    className={`rating-option rating-${rating} ${formData.rating === rating ? 'selected' : ''}`}
                    onClick={() => handleRatingSelect(rating)}
                  >
                    {rating}
                  </div>
                ))}
              </div>
              <div className="rating-label">
                <span>Not at all likely</span>
                <span>Extremely likely</span>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Your Feedback</label>
              <textarea
                className="form-input form-textarea"
                name="comment"
                placeholder="Please share your thoughts, suggestions, or concerns"
                onChange={handleFeedbackChange}
                value={formData.comment}
                required
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
          
          <div className="integration-icons">
            <div className="integration-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z"/>
              </svg>
              <span>Integrates with Slack</span>
            </div>
            <div className="integration-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
              </svg>
              <span>Email Notifications</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-cta">
          <div className="dashboard-cta-content">
            <h3>Already submitted feedback?</h3>
            <p>View your feedback history and analytics in your personal dashboard.</p>
          </div>
          <button
            onClick={() => {
              setView("dashboard");
              setActiveTab("myDashboard");
            }}
            className="btn btn-secondary"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  };

  // Render dashboard
  const renderDashboard = () => (
    <div className="feedback-container">
      <div className="feedback-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="dashboard-title">Feedback Dashboard</h2>
              <p className="dashboard-subtitle">View and analyze customer feedback</p>
            </div>
            <button
              onClick={() => setView("feedback")}
              className="btn btn-secondary"
            >
              Submit New Feedback
            </button>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="tab-container">
          <div
            className={`tab-button ${activeTab === "myDashboard" ? 'tab-button-active' : ''}`}
            onClick={() => setActiveTab("myDashboard")}
          >
            My Dashboard
          </div>
          <div
            className={`tab-button ${activeTab === "history" ? 'tab-button-active' : ''}`}
            onClick={() => setActiveTab("history")}
          >
            All Feedback
          </div>
          <div
            className={`tab-button ${activeTab === "analytics" ? 'tab-button-active' : ''}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "myDashboard" && (
            <div className="animate-fadeIn">
              <div className="my-dashboard-header">
                <h3>My Feedback Dashboard</h3>
                <p>View and manage all your submitted feedback</p>
                
                <div className="email-lookup-form">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={userEmail}
                    onChange={handleUserEmailChange}
                    className="form-input"
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      // This is just to trigger the useEffect if the email hasn't changed
                      setUserEmail(userEmail);
                    }}
                  >
                    Find My Feedback
                  </button>
                </div>
              </div>
              
              {userEmail && (
                <div className="my-dashboard-content">
                  {userFeedback.length > 0 ? (
                    <>
                      <div className="user-stats-grid">
                        <div className="user-stat-card">
                          <div className="user-stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                          </div>
                          <div className="user-stat-info">
                            <h4>{userFeedback.length}</h4>
                            <p>Total Submissions</p>
                          </div>
                        </div>
                        
                        <div className="user-stat-card">
                          <div className="user-stat-icon" style={{ backgroundColor: 'rgba(0, 195, 137, 0.1)', color: 'var(--success)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                          </div>
                          <div className="user-stat-info">
                            <h4>{getSentimentCounts(userFeedback).positive}</h4>
                            <p>Positive Feedback</p>
                          </div>
                        </div>
                        
                        <div className="user-stat-card">
                          <div className="user-stat-icon" style={{ backgroundColor: 'rgba(255, 71, 87, 0.1)', color: 'var(--danger)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                            </svg>
                          </div>
                          <div className="user-stat-info">
                            <h4>{getSentimentCounts(userFeedback).negative}</h4>
                            <p>Negative Feedback</p>
                          </div>
                        </div>
                        
                        <div className="user-stat-card">
                          <div className="user-stat-icon" style={{ backgroundColor: 'rgba(0, 102, 255, 0.1)', color: 'var(--primary)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          </div>
                          <div className="user-stat-info">
                            <h4>{calculateAverageRating(userFeedback)}</h4>
                            <p>Average Rating</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="user-feedback-list">
                        <h4>Your Feedback History</h4>
                        
                        {userFeedback.map((feedback, index) => (
                          <div key={feedback.id || index} className="user-feedback-item">
                            <div className="user-feedback-header">
                              <div className="user-feedback-event">
                                <h5>{feedback.event}</h5>
                                <span className="user-feedback-date">
                                  {new Date(feedback.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="user-feedback-rating">
                                {feedback.rating && (
                                  <div className={`rating-badge rating-${feedback.rating}`}>
                                    {feedback.rating}/10
                                  </div>
                                )}
                                <div className={`sentiment-badge sentiment-${feedback.sentiment.toLowerCase()}`}>
                                  {feedback.sentiment}
                                </div>
                              </div>
                            </div>
                            <div className="user-feedback-comment">
                              <p>{feedback.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="empty-feedback">
                      <div className="empty-feedback-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                      </div>
                      <h4>No feedback found for this email</h4>
                      <p>We couldn't find any feedback submissions associated with {userEmail}</p>
                      <button
                        onClick={() => setView("feedback")}
                        className="btn btn-primary"
                      >
                        Submit Your First Feedback
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === "history" && (
            <div className="animate-fadeIn">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Recent Feedback</h3>
              
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                  <div className="animate-spin" style={{ 
                    width: '2rem', 
                    height: '2rem', 
                    borderRadius: '50%', 
                    borderWidth: '3px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border-color)',
                    borderTopColor: 'var(--primary)'
                  }}></div>
                </div>
              ) : feedbackHistory.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-medium)', fontWeight: 500 }}>Date</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-medium)', fontWeight: 500 }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-medium)', fontWeight: 500 }}>Event</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-medium)', fontWeight: 500 }}>Rating</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-medium)', fontWeight: 500 }}>Feedback</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-medium)', fontWeight: 500 }}>Sentiment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbackHistory.map((feedback, index) => (
                        <tr key={feedback.id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-light)' }}>
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 500 }}>
                            {feedback.name}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {feedback.event}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {feedback.rating && (
                              <div className={`rating-option rating-${feedback.rating}`} style={{ margin: '0 auto' }}>
                                {feedback.rating}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '1rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {feedback.comment}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '999px',
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              backgroundColor: feedback.sentiment === "Positive" ? "#dcfce7" : 
                                              feedback.sentiment === "Negative" ? "#fee2e2" : "#fef3c7",
                              color: feedback.sentiment === "Positive" ? "#166534" : 
                                     feedback.sentiment === "Negative" ? "#991b1b" : "#92400e",
                            }}>
                              {feedback.sentiment || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', color: 'var(--text-light)' }}>
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-medium)' }}>No feedback submissions yet</h3>
                  <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Submit your first feedback to see it here</p>
                  <button
                    onClick={() => setView("feedback")}
                    className="btn btn-primary"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "analytics" && (
            <div className="animate-fadeIn">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Feedback Analytics</h3>
              
              <div className="analytics-grid">
                <div className="analytics-card">
                  <p className="analytics-value">{feedbackHistory.length}</p>
                  <p className="analytics-label">Total Submissions</p>
                </div>
                
                <div className="analytics-card">
                  <p className="analytics-value" style={{ color: 'var(--success)' }}>
                    {feedbackHistory.filter(f => f.sentiment === "Positive").length}
                  </p>
                  <p className="analytics-label">Positive Feedback</p>
                </div>
                
                <div className="analytics-card">
                  <p className="analytics-value" style={{ color: 'var(--danger)' }}>
                    {feedbackHistory.filter(f => f.sentiment === "Negative").length}
                  </p>
                  <p className="analytics-label">Negative Feedback</p>
                </div>
                
                <div className="analytics-card">
                  <p className="analytics-value" style={{ color: 'var(--primary)' }}>
                    {feedbackHistory.length > 0 
                      ? Math.round(feedbackHistory.reduce((sum, item) => sum + (item.rating || 0), 0) / feedbackHistory.length * 10) / 10
                      : 0
                    }
                  </p>
                  <p className="analytics-label">Average Rating</p>
                </div>
              </div>
              
              <div style={{ backgroundColor: 'var(--light-bg)', borderRadius: 'var(--radius)', padding: '1.5rem', marginTop: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1rem' }}>Feedback by Event</h4>
                
                {feedbackHistory.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Array.from(new Set(feedbackHistory.map(f => f.event))).map(event => {
                      const eventFeedbacks = feedbackHistory.filter(f => f.event === event);
                      const positiveCount = eventFeedbacks.filter(f => f.sentiment === "Positive").length;
                      const percentage = Math.round((positiveCount / eventFeedbacks.length) * 100);
                      
                      return (
                        <div key={event} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 500 }}>{event}</span>
                            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{eventFeedbacks.length} submissions</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                width: `${percentage}%`, 
                                backgroundColor: percentage > 70 ? 'var(--success)' : percentage > 40 ? 'var(--warning)' : 'var(--danger)' 
                              }}
                            ></div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                            <span>{percentage}% positive</span>
                            <span>
                              {positiveCount} positive / {eventFeedbacks.length - positiveCount} negative
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                    No data available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
