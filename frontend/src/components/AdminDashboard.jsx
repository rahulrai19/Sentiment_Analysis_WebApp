import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  ChatBubbleLeftIcon, 
  FaceSmileIcon, 
  MinusCircleIcon, 
  FaceFrownIcon,
  TrashIcon,
  ChartBarIcon,
  StarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// You might need to import EVENT_TYPES or define them here if not imported
const EVENT_TYPES = [
  "Workshop", "Seminar", "Competition", "Meetup", "Webinar", "Other"
];

// Update the API base URL to use the correct backend URL
const API_BASE = 'https://sentiment-s0y3.onrender.com';

const submitFeedback = async (formData) => {
  await axios.post(`${API_BASE}/api/submit-feedback`, formData);
};

const fetchFeedbacks = async () => {
  const res = await axios.get(`${API_BASE}/feedbacks`);
  return res.data;
};

const fetchSummary = async (eventName = null) => {
  let url = `${API_BASE}/api/feedback-summary`;
  if (eventName) {
    // Add eventName as a query parameter
    url += `?event=${encodeURIComponent(eventName)}`;
  }
  const res = await axios.get(url);
  return res.data;
};

function AdminDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [sentimentCounts, setSentimentCounts] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [selectedEventName, setSelectedEventName] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [addEventLoading, setAddEventLoading] = useState(false);
  const [addEventSuccess, setAddEventSuccess] = useState(false);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalSubmissions: 0,
    averageRating: 0
  });

  useEffect(() => {
    // Fetch available events when component mounts
    const fetchAvailableEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/events`);
        setAvailableEvents(response.data.events || []);
      } catch (error) {
        console.error("Error fetching available events:", error);
      }
    };

    fetchAvailableEvents();
  }, []);

  useEffect(() => {
    // Calculate dashboard stats whenever feedbacks change
    if (feedbacks.length > 0) {
      const totalSubmissions = feedbacks.length;
      const totalRating = feedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
      const averageRating = (totalRating / totalSubmissions).toFixed(1);

      setDashboardStats({
        totalSubmissions,
        averageRating
      });
    }
  }, [feedbacks]);

  useEffect(() => {
    // Call fetchSummary with the selected event name
    fetchSummary(selectedEventName)
      .then(data => {
        setSentimentCounts(data.sentiments || { positive: 0, neutral: 0, negative: 0 });
        setFeedbacks(data.recent_feedback || []);
      })
      .catch(error => {
        console.error("Error fetching feedback summary:", error);
        // Optionally reset data or show error state
        setSentimentCounts({ positive: 0, neutral: 0, negative: 0 });
        setFeedbacks([]);
      });
  }, [selectedEventName]);

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      if (!dateString) return '-';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error, "for date:", dateString);
      return '-';
    }
  };

  const pieChartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      data: [sentimentCounts.positive, sentimentCounts.neutral, sentimentCounts.negative],
      backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
      borderColor: ['#16a34a', '#ca8a04', '#dc2626'],
      borderWidth: 1,
    }],
  };

  const barChartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      label: 'Feedback Distribution',
      data: [sentimentCounts.positive, sentimentCounts.neutral, sentimentCounts.negative],
      backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
      borderColor: ['#16a34a', '#ca8a04', '#dc2626'],
      borderWidth: 1,
    }],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'neutral': return 'text-yellow-600 bg-yellow-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEventName.trim()) {
      alert('Please enter an event name.');
      return;
    }
    setAddEventLoading(true);
    setAddEventSuccess(false);
    try {
      // Add new event to backend
      await axios.post(`${API_BASE}/api/events`, { name: newEventName });
      
      // Update local state with new event
      setAvailableEvents(prevEvents => [...prevEvents, newEventName]);
      setAddEventSuccess(true);
      setNewEventName(''); // Clear input on success
    } catch (error) {
      console.error("Error adding new event:", error);
      alert('Failed to add event.');
    } finally {
      setAddEventLoading(false);
      setTimeout(() => setAddEventSuccess(false), 3000);
    }
  };

  const handleDeleteEvent = async (eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE}/api/events/${encodeURIComponent(eventName)}`);
      
      if (response.data.message) {
        // Update local state by removing the deleted event
        setAvailableEvents(prevEvents => prevEvents.filter(event => event !== eventName));
        toast.success(response.data.message);
        
        // Refresh the events list to ensure sync with backend
        const eventsResponse = await axios.get(`${API_BASE}/api/events`);
        setAvailableEvents(eventsResponse.data.events || []);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to delete event. Please try again.';
      toast.error(errorMessage);
    }
  };

  const exportToCSV = (eventName = null) => {
    try {
      // Filter feedbacks by event name
      const filteredFeedbacks = eventName 
        ? feedbacks.filter(f => f.event === eventName)
        : feedbacks;

      if (filteredFeedbacks.length === 0) {
        toast.error('No feedback data to export for this event');
        return;
      }

      // Define CSV headers
      const headers = [
        'Name',
        'Event',
        'Event Type',
        'Comment',
        'Rating',
        'Sentiment',
        'Date'
      ];

      // Convert feedback data to CSV rows
      const csvRows = filteredFeedbacks.map(feedback => [
        feedback.name || '',
        feedback.event || '',
        feedback.eventType || '',
        `"${(feedback.comment || '').replace(/"/g, '""')}"`, // Escape quotes in comments
        feedback.rating || '',
        feedback.sentiment || '',
        feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : ''
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `feedback_export_${eventName || 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${filteredFeedbacks.length} feedback entries for ${eventName || 'all events'}`);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export feedback data');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      {/* Event Name Filter and Export Section */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-1/3">
          <label htmlFor="eventFilter" className="block text-sm font-medium text-gray-700 mb-2">Filter by Event Name:</label>
          <select
            id="eventFilter"
            value={selectedEventName}
            onChange={(e) => setSelectedEventName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Events</option>
            {availableEvents.map((event) => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export All
          </button>
          {selectedEventName && (
            <button
              onClick={() => exportToCSV(selectedEventName)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export {selectedEventName}
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Overview Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Submissions Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-[1.02] transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Submissions</p>
                <p className="text-3xl font-bold">{dashboardStats.totalSubmissions}</p>
              </div>
              <div className="bg-blue-400/20 p-3 rounded-lg">
                <ChartBarIcon className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-400/20">
              <p className="text-blue-100 text-sm">All time feedback submissions</p>
            </div>
          </div>

          {/* Average Rating Card */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-[1.02] transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-1">Average Rating</p>
                <div className="flex items-center">
                  <p className="text-3xl font-bold">{dashboardStats.averageRating}</p>
                  <span className="ml-2 text-yellow-100">/ 10</span>
                </div>
              </div>
              <div className="bg-yellow-400/20 p-3 rounded-lg">
                <StarIcon className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-yellow-400/20">
              <p className="text-yellow-100 text-sm">Overall event satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard icon={<ChatBubbleLeftIcon className="h-6 w-6 text-blue-600" />} label="Total Feedback" value={feedbacks.length} bg="blue-50" />
        <SummaryCard icon={<FaceSmileIcon className="h-6 w-6 text-green-600" />} label="Positive" value={sentimentCounts.positive} bg="green-50" />
        <SummaryCard icon={<MinusCircleIcon className="h-6 w-6 text-yellow-600" />} label="Neutral" value={sentimentCounts.neutral} bg="yellow-50" />
        <SummaryCard icon={<FaceFrownIcon className="h-6 w-6 text-red-600" />} label="Negative" value={sentimentCounts.negative} bg="red-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartCard title={`Sentiment Distribution (Pie) ${selectedEventName ? `for ${selectedEventName}` : 'All Events'}`}>
          <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
        </ChartCard>
        <ChartCard title={`Sentiment Distribution (Bar) ${selectedEventName ? `for ${selectedEventName}` : 'All Events'}`}>
          <Bar data={barChartData} options={{ ...barChartOptions, maintainAspectRatio: false }} />
        </ChartCard>
      </div>

      {/* Section to Add New Event */}
      <div className="add-event-section mb-8 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-100 shadow">
        <h3 className="text-2xl font-bold mb-4 text-green-700">Manage Events/Clubs</h3>
        
        {/* Display Existing Events */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">Existing Events:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableEvents.map((event, index) => (
              <div 
                key={index}
                className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between group hover:border-red-200 transition-colors"
              >
                <span className="text-gray-700">{event}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                  <button
                    onClick={() => handleDeleteEvent(event)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete event"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Event Form */}
        <div className="border-t border-green-200 pt-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">Add New Event:</h4>
          <form onSubmit={handleAddEvent} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              className="flex-grow form-input border border-green-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 rounded-xl bg-green-50 placeholder:text-green-400 text-lg py-3 px-4 transition hover:border-green-500 hover:shadow-md"
              placeholder="Enter New Event Name"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-8 rounded-full shadow-xl hover:from-green-600 hover:to-green-800 transition text-lg font-bold tracking-wide flex items-center justify-center"
              disabled={addEventLoading}
            >
              {addEventLoading ? (
                <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Add Event"
              )}
            </button>
          </form>
          {addEventSuccess && (
            <p className="mt-3 text-center text-green-600 font-semibold">Event added successfully!</p>
          )}
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{selectedEventName ? `Recent Feedback for ${selectedEventName}` : 'Recent Feedback'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Event', 'Type', 'Comment', 'Rating', 'Sentiment', 'Date'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbacks.slice().reverse().map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-blue-50 transition cursor-pointer">
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">{item.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.event || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.eventType || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.comment || '-'}</td>
                  <td className="px-6 py-4 text-sm text-blue-700 font-bold">{item.rating || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(item.sentiment)}`}>
                      {item.sentiment ? item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1) : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
               {feedbacks.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No feedback found for this type.</td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Reusable Summary Card Component
function SummaryCard({ icon, label, value, bg }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-1 transition cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-${bg}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Reusable Chart Card
function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

export default AdminDashboard;
