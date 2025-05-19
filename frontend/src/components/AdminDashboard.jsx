import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  ChatBubbleLeftIcon, 
  FaceSmileIcon, 
  MinusCircleIcon, 
  FaceFrownIcon 
} from '@heroicons/react/24/outline';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function AdminDashboard() {
  const [feedbackData, setFeedbackData] = useState({
    total: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    recentFeedback: []
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/feedback-summary`)
      .then(response => response.json())
      .then(data => {
        // The backend returns: { sentiments: {positive, neutral, negative}, recent_feedback: [...] }
        setFeedbackData({
          total: data.recent_feedback.length,
          positive: data.sentiments.positive,
          neutral: data.sentiments.neutral,
          negative: data.sentiments.negative,
          recentFeedback: data.recent_feedback.map((item, idx) => ({
            id: idx + 1,
            event: item.event,
            feedback: item.comment || item.feedback, // fallback for different field names
            sentiment: item.sentiment ? item.sentiment.toLowerCase() : 'neutral',
            date: item.date || new Date().toISOString(), // fallback if no date
          }))
        });
      })
      .catch(error => {
        // handle error, maybe setFeedbackData to empty/default
        console.error(error);
      });
  }, []);

  // Chart data for pie chart
  const pieChartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      data: [feedbackData.positive, feedbackData.neutral, feedbackData.negative],
      backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
      borderColor: ['#16a34a', '#ca8a04', '#dc2626'],
      borderWidth: 1,
    }],
  };

  // Chart data for bar chart
  const barChartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      label: 'Feedback Distribution',
      data: [feedbackData.positive, feedbackData.neutral, feedbackData.negative],
      backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
      borderColor: ['#16a34a', '#ca8a04', '#dc2626'],
      borderWidth: 1,
    }],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <ChatBubbleLeftIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{feedbackData.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <FaceSmileIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Positive</p>
              <p className="text-2xl font-bold text-gray-900">{feedbackData.positive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <MinusCircleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Neutral</p>
              <p className="text-2xl font-bold text-gray-900">{feedbackData.neutral}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <FaceFrownIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Negative</p>
              <p className="text-2xl font-bold text-gray-900">{feedbackData.negative}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution (Pie)</h3>
          <div className="h-64">
            <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution (Bar)</h3>
          <div className="h-64">
            <Bar data={barChartData} options={{ ...barChartOptions, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Feedback</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbackData.recentFeedback.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.event}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.feedback}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(item.sentiment)}`}>
                      {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
