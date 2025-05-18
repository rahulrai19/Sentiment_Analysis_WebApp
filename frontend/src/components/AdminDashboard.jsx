import { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    axios.get("https://your-backend-url/feedback-summary").then((res) => {
      setSummary(res.data);
    });
  }, []);

  if (!summary) return <p>Loading...</p>;

  const pieData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [
          summary.sentiments.positive,
          summary.sentiments.neutral,
          summary.sentiments.negative,
        ],
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
    <ul className="space-y-2">
      {summary.recent_feedback.map((f, i) => (
        <li key={i} className="p-3 bg-white rounded shadow">
          <p><span className="font-bold">{f.event}</span> — <span className="italic text-sm text-gray-500">{f.sentiment}</span></p>
          <p>{f.comment}</p>
        </li>
      ))}
    </ul>
  </div>
);

}
