import { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js";

Chart.register(ArcElement);

export default function AdminDashboard() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [sentiments, setSentiments] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.REACT_APP_API_BASE;

  useEffect(() => {
    axios
      .get(`${API_BASE}/feedback-summary`)
      .then((res) => {
        const data = res.data || {};
        setFeedbackList(data.recent_feedback || []);
        setSentiments(data.sentiments || { positive: 0, neutral: 0, negative: 0 });
      })
      .catch((err) => {
        console.error("Error fetching summary:", err);
        setFeedbackList([]);
        setSentiments({ positive: 0, neutral: 0, negative: 0 });
      })
      .finally(() => setLoading(false));
  }, [API_BASE]);

  const pieData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [sentiments.positive, sentiments.neutral, sentiments.negative],
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-100 shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      <div className="mb-6">
        <Pie data={pieData} />
      </div>

      <h3 className="text-lg font-semibold mb-2">Recent Feedback</h3>

      {loading ? (
        <p className="text-center text-gray-500">Loading feedback...</p>
      ) : feedbackList.length > 0 ? (
        <ul className="space-y-2">
          {feedbackList.map((f, i) => (
            <li key={i} className="p-3 bg-white rounded shadow">
              <p>
                <span className="font-bold">{f.event || "Unnamed Event"}</span> —{" "}
                <span className="italic text-sm text-gray-500">{f.sentiment}</span>
              </p>
              <p>{f.comment || "No comment provided."}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No feedback available</p>
      )}
    </div>
  );
}
