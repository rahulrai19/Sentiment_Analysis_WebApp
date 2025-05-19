import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  ChatBubbleLeftIcon, 
  FaceSmileIcon, 
  MinusCircleIcon, 
  FaceFrownIcon 
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function AdminDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [sentimentCounts, setSentimentCounts] = useState({ positive: 0, neutral: 0, negative: 0 });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/feedback-summary`)
      .then(response => response.json())
      .then(data => {
        // Update counts and feedback list
        setSentimentCounts(data.sentiments || { positive: 0, neutral: 0, negative: 0 });
        setFeedbacks(data.recent_feedback || []);
      })
      .catch(error => {
        console.error("Error fetching feedback summary:", error);
      });
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard icon={<ChatBubbleLeftIcon className="h-6 w-6 text-blue-600" />} label="Total Feedback" value={feedbacks.length} bg="blue-50" />
        <SummaryCard icon={<FaceSmileIcon className="h-6 w-6 text-green-600" />} label="Positive" value={sentimentCounts.positive} bg="green-50" />
        <SummaryCard icon={<MinusCircleIcon className="h-6 w-6 text-yellow-600" />} label="Neutral" value={sentimentCounts.neutral} bg="yellow-50" />
        <SummaryCard icon={<FaceFrownIcon className="h-6 w-6 text-red-600" />} label="Negative" value={sentimentCounts.negative} bg="red-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Sentiment Distribution (Pie)">
          <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
        </ChartCard>
        <ChartCard title="Sentiment Distribution (Bar)">
          <Bar data={barChartData} options={{ ...barChartOptions, maintainAspectRatio: false }} />
        </ChartCard>
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
                {['Name', 'Event', 'Type', 'Feedback', 'Rating', 'Sentiment', 'Date'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbacks.slice().reverse().map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-blue-50 transition cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.event}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.eventType}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.comment}</td>
                  <td className="px-6 py-4 text-sm text-blue-700 font-bold">{item.rating}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(item.sentiment)}`}>
                      {item.sentiment ? item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1) : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
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
