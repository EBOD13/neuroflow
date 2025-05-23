// src/components/PomodoroAnalytics.jsx
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PomodoroAnalytics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/stats/pomodoro');
        const stats = await res.json();
        setData(stats);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">📊 Pomodoro Stats Dashboard</h2>

      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-2">Total Time Focused Per Day (Minutes)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_minutes" fill="#3b82f6" name="Focus Time" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Most Common Tasks</h3>
        <ul className="list-disc list-inside">
          {data.length > 0 &&
            [...new Set(data.flatMap(d => d.tasks))].map((task, i) => (
              <li key={i}>{task}</li>
            ))}
        </ul>
      </div>
    </div>
  );
}
