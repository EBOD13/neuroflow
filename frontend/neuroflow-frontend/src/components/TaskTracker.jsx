// src/components/TaskTracker.jsx
import { useState, useEffect } from 'react';

const defaultCategories = [
  'Health', 'Work', 'Study', 'Self-care', 'Creative', 'Chores', 'Errands', 'Spiritual', 'Social'
];

export default function TaskTracker() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/log/task');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const logTask = async () => {
    const task = {
      title,
      description,
      category,
      timestamp: timestamp || new Date().toISOString(),
      confirmed_by: 'screen',
    };
    try {
      await fetch('http://localhost:8000/api/log/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      fetchTasks();
      resetForm();
    } catch (err) {
      console.error('Failed to log task', err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Work');
    setTimestamp('');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📝 Task & Event Tracker</h2>
      <input
        type="text"
        placeholder="Title"
        className="w-full border px-2 py-1 mb-3"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        className="w-full border px-2 py-1 mb-3"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select
        className="w-full border px-2 py-1 mb-3"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {defaultCategories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <input
        type="datetime-local"
        className="w-full border px-2 py-1 mb-3"
        value={timestamp}
        onChange={(e) => setTimestamp(e.target.value)}
      />
      <button onClick={logTask} className="bg-blue-600 text-white px-4 py-2 rounded">Log Task</button>

      <h3 className="text-xl font-semibold mt-6 mb-3">📅 Task Timeline</h3>
      <ul className="space-y-2">
        {tasks.map((task, i) => (
          <li key={i} className="border p-3 rounded shadow bg-white">
            <div className="text-sm text-gray-500">{new Date(task.timestamp).toLocaleString()} • <span className="font-medium text-blue-700">{task.category}</span></div>
            <div className="text-lg font-semibold">{task.title}</div>
            {task.description && <div className="text-sm text-gray-700">{task.description}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
