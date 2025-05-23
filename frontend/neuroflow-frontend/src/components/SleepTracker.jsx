// src/components/SleepTracker.jsx
import { useState, useEffect } from 'react';

export default function SleepTracker() {
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState(3);
  const [dreamNotes, setDreamNotes] = useState('');
  const [logs, setLogs] = useState([]);

  const logSleep = async () => {
    const sleepData = {
      bedtime,
      wakeTime,
      quality,
      dreamNotes,
      confirmed_by: 'screen',
      timestamp: new Date().toISOString()
    };

    try {
      await fetch('http://localhost:8000/api/log/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sleepData),
      });
      fetchSleepLogs();
      resetForm();
    } catch (err) {
      console.error('Error logging sleep:', err);
    }
  };

  const fetchSleepLogs = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/log/sleep');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching sleep logs:', err);
    }
  };

  const resetForm = () => {
    setBedtime('');
    setWakeTime('');
    setQuality(3);
    setDreamNotes('');
  };

  useEffect(() => {
    fetchSleepLogs();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">😴 Sleep Tracker</h2>
      <label className="block mb-2">Bedtime:</label>
      <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="w-full mb-4 border px-2 py-1" />

      <label className="block mb-2">Wake Time:</label>
      <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="w-full mb-4 border px-2 py-1" />

      <label className="block mb-2">Sleep Quality (1-5):</label>
      <input type="range" min="1" max="5" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full mb-4" />

      <label className="block mb-2">Dream Notes (optional):</label>
      <textarea value={dreamNotes} onChange={(e) => setDreamNotes(e.target.value)} className="w-full mb-4 border px-2 py-1" rows={3} />

      <button onClick={logSleep} className="bg-blue-500 text-white px-4 py-2 rounded">Log Sleep</button>

      <h3 className="text-xl font-semibold mt-6 mb-2">📅 Previous Logs</h3>
      <ul className="space-y-2">
        {logs.map((log, i) => (
          <li key={i} className="bg-gray-100 p-2 rounded shadow">
            <div><strong>Bed:</strong> {log.bedtime} | <strong>Wake:</strong> {log.wakeTime}</div>
            <div><strong>Quality:</strong> {log.quality} ⭐</div>
            {log.dreamNotes && <div><em>"{log.dreamNotes}"</em></div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
