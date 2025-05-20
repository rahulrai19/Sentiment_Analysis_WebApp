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

// Update the API base URL to use environment variable
const API_BASE = process.env.REACT_APP_API_URL || 'https://sentiment-s0y3.onrender.com';

const submitFeedback = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE}/api/submit-feedback`, formData);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw new Error(error.response?.data?.detail || 'Failed to submit feedback');
  }
};

const fetchFeedbacks = async () => {
  try {
    const response = await axios.get(`${API_BASE}/feedbacks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch feedbacks');
  }
};

const fetchSummary = async (eventName = null, eventType = null) => {
  try {
    let url = `${API_BASE}/api/feedback-summary`;
    const params = new URLSearchParams();
    if (eventName) {
      params.append('event_name', eventName);
    }
    if (eventType) {
      params.append('event_type', eventType);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch summary');
  }
};

function AdminDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [sentimentCounts, setSentimentCounts] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [selectedEventName, setSelectedEventName] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [addEventLoading, setAddEventLoading] = useState(false);
  const [addEventSuccess, setAddEventSuccess] = useState(false);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalSubmissions: 0,
    averageRating: 0
  });
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  useEffect(() => {
    // Fetch available events when component mounts
    const fetchAvailableEvents = async () => {
      try {
<<<<<<< HEAD
        const response = await axios.get(`${API_BASE}/api/events`);
=======
        const response = await axios.get(`${API_BASE}/api/events`); // Removed headers
>>>>>>> parent of 95b6a87 (db)
        setAvailableEvents(response.data.events || []);
      } catch (error) {
        console.error("Error fetching available events:", error);
      }
    };

    fetchAvailableEvents();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSummary(null, selectedEventType);
        setSentimentCounts(data.sentiments || { positive: 0, neutral: 0, negative: 0 });
        const fetchedFeedbacks = data.recent_feedback || [];
        setFeedbacks(fetchedFeedbacks);

        const totalSubmissions = fetchedFeedbacks.length;
        const totalRating = fetchedFeedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
        const averageRating = totalSubmissions > 0 ? (totalRating / totalSubmissions).toFixed(1) : '0.0';

        setDashboardStats({
          totalSubmissions,
          averageRating
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.message || 'Failed to fetch dashboard data');
        setSentimentCounts({ positive: 0, neutral: 0, negative: 0 });
        setFeedbacks([]);
        setDashboardStats({
          totalSubmissions: 0,
          averageRating: '0.0'
        });
      }
    };

    fetchData();
  }, [selectedEventType]);

  useEffect(() => {
    const img = new Image();
    img.src = '/optimized/Back1.webp';
    img.onload = () => setBackgroundLoaded(true);
  }, []);

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
        },
        ticks: {
          padding: 10
        }
      },
      x: {
        grid: {
        },
        ticks: {
          padding: 10
        }
      }
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-900/30';
      case 'neutral': return 'text-yellow-400 bg-yellow-900/30';
      case 'negative': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
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
      // Filter feedbacks by event name (using the selectedEventName state)
      const feedbackToExport = selectedEventName
        ? feedbacks.filter(f => f.event === selectedEventName)
        : feedbacks;

      if (feedbackToExport.length === 0) {
        toast.error('No feedback data to export for the selected event');
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
      const csvRows = feedbackToExport.map(feedback => [
        feedback.name || '',
        feedback.event || '',
        feedback.eventType || '',
        `"${(feedback.comment || '').replace(/"/g, '""')}"`, // Escape quotes in comments
        feedback.rating || '',
        feedback.sentiment || '',
        feedback.createdAt ? new Date(feedback.createdAt).toISOString() : '' // Use ISO string for CSV consistency
      ]);

      // Combine headers and rows
      const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const filename = selectedEventName ? `feedback_${selectedEventName.replace(/\s+/g, '_')}.csv` : 'all_feedback.csv';
      link.setAttribute('download', filename);
      link.click();

      toast.success('Feedback data exported successfully!');
    } catch (error) {
      console.error('Error exporting feedback data:', error);
      toast.error('Failed to export feedback data.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-blue-200 p-8 relative overflow-hidden shadow-lg">
      <div 
        className={`fixed inset-0 z-0 transition-opacity duration-500 ${backgroundLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: 'url("/optimized/Back1.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="p-6 bg-blue-950/90 backdrop-blur-sm shadow-inset-lg shadow-blue-500/20 rounded-xl border border-blue-700 text-blue-100 space-y-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6 drop-shadow">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard 
            icon={<ChartBarIcon className="h-6 w-6" />} 
            label="Total Submissions" 
            value={dashboardStats.totalSubmissions}
            bg="bg-blue-900/70"
          />
          <SummaryCard 
            icon={<StarIcon className="h-6 w-6" />} 
            label="Average Rating" 
            value={dashboardStats.averageRating}
            bg="bg-blue-900/70"
          />
          <SummaryCard 
            icon={<ChatBubbleLeftIcon className="h-6 w-6" />} 
            label="Sentiment Distribution"
            value="View Chart"
            bg="bg-blue-900/70"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-900/70 shadow-inner rounded-xl p-6 border border-blue-800 space-y-4">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">Filter Feedbacks</h3>
            <div>
              <label htmlFor="filterEvent" className="block text-sm font-medium text-blue-200 mb-2">Filter by Event(export only)</label>
              <select
                id="filterEvent"
                value={selectedEventName}
                onChange={e => setSelectedEventName(e.target.value)}
                className="w-full px-4 py-3 border border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-blue-800/50 text-blue-100"
              >
                <option value="">All Events</option>
                {availableEvents.map(event => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterEventType" className="block text-sm font-medium text-blue-200 mb-2">Filter by Event Type(changes To Display Data specific)</label>
              <select
                id="filterEventType"
                value={selectedEventType}
                onChange={e => setSelectedEventType(e.target.value)}
                className="w-full px-4 py-3 border border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-blue-800/50 text-blue-100"
              >
                <option value="">All Types</option>
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => exportToCSV(selectedEventName)}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-blue-950 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 transform hover:scale-105"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export to CSV
            </button>
          </div>

          <div className="bg-blue-900/70 shadow-inner rounded-xl p-6 border border-blue-800 space-y-4">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">Manage Events</h3>
            <form onSubmit={handleAddEvent} className="flex gap-2">
              <input
                type="text"
                placeholder="New event name"
                value={newEventName}
                onChange={e => setNewEventName(e.target.value)}
                className="flex-grow px-4 py-3 border border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-blue-800/50 text-blue-100 placeholder-blue-300"
                disabled={addEventLoading}
                required
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={addEventLoading}
              >
                {addEventLoading ? 'Adding...' : 'Add Event'}
              </button>
            </form>
            {addEventSuccess && (
              <p className="text-green-400 text-sm">Event added successfully!</p>
            )}
            <div className="mt-4">
              <h4 className="text-lg font-medium text-blue-200 mb-2">Available Events</h4>
              <ul className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide pr-2">
                {availableEvents.length === 0 ? (
                  <li className="text-blue-300 text-sm italic">No events added yet.</li>
                ) : (
                  availableEvents.map(event => (
                    <li key={event} className="flex justify-between items-center bg-blue-800/50 rounded-md p-2 border border-blue-700">
                      <span className="text-blue-100 text-sm">{event}</span>
                      <button 
                        onClick={() => handleDeleteEvent(event)}
                        className="text-red-400 hover:text-red-500 transition-colors duration-200"
                        aria-label={`Delete event ${event}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ChartCard title="Feedback Sentiment Distribution">
            <Pie data={pieChartData} />
          </ChartCard>
          <ChartCard title="Sentiment Counts (Bar Chart)">
            <Bar data={barChartData} options={chartOptions} />
          </ChartCard>
        </div>

        <div className="bg-blue-900/70 shadow-inner border border-blue-800 rounded-md p-6">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4">Recent Feedbacks</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-hide pr-2">
            {feedbacks.length === 0 ? (
              <p className="text-blue-300 text-sm italic text-center">No feedbacks matching filter criteria.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-sky-400">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-sky-400/20 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 bg-sky-400/20 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 bg-sky-400/20 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">Event Type</th>
                      <th className="px-6 py-3 bg-sky-400/20 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">Comment</th>
                      <th className="px-6 py-3 bg-sky-400/20 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 bg-sky-400/20 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">Sentiment</th>
                      <th className="px-6 py-3 bg-sky-400/20 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-sky-400/20 divide-y divide-sky-400">
                    {feedbacks.map((feedback, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-100">{feedback.name || 'Anonymous'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{feedback.event || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{feedback.eventType || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{feedback.comment || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{feedback.rating || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{feedback.sentiment || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{formatDate(feedback.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, bg }) {
  return (
    <div className={`rounded-xl p-5 flex items-center space-x-4 shadow-inner border border-sky-400 ${bg}`}>
      <div className="flex-shrink-0 text-yellow-400">
        {icon}
      </div>
      <div>
        <div className="text-blue-200 text-sm font-medium">{label}</div>
        <div className="text-white text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-blue-900/70 shadow-inner rounded-xl p-6 border border-blue-800 space-y-4">
      <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center">{title}</h3>
      <div className="chart-container" style={{ height: '300px', width: '100%', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

export default AdminDashboard;
