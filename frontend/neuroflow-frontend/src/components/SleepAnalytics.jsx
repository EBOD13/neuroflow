// src/components/SleepAnalytics.jsx
import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function SleepAnalytics() {
  const [sleepData, setSleepData] = useState([]);

  useEffect(() => {
    const fetchSleepStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/stats/sleep');
        const stats = await res.json();
        setSleepData(stats);
      } catch (err) {
        console.error('Failed to fetch sleep stats:', err);
      }
    };
    fetchSleepStats();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">😴 Sleep Dashboard</h2>

      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-2">Sleep Quality Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sleepData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="quality" stroke="#3b82f6" name="Quality (1-5)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-2">Bedtime Deviation (mins from 10:30 PM)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sleepData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="deviation" fill="#f97316" name="Deviation (mins)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Weekly Sleep Scores</h3>
        <div className="flex gap-4 flex-wrap">
          {sleepData.map(({ date, quality }, i) => (
            <div key={i} className="border p-3 rounded shadow text-center w-28">
              <p className="text-sm text-gray-600">{date}</p>
              <p className="text-xl font-bold" style={{ color: quality >= 4 ? '#16a34a' : quality >= 3 ? '#f59e0b' : '#dc2626' }}>{quality}/5</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
