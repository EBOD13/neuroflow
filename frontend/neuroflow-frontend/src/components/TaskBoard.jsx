// src/components/TaskBoard.jsx
import { useEffect, useState } from 'react';

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Personal',
    frequency: 'daily',
    start_time: '',
    end_time: '',
    location: '',
    is_group: false,
    milestones: [],
    importance: '',
    reward: '',
    reminder_type: 'daily',
    duration_minutes: 30,
    confirmed_by: 'screen',
  });
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ name: '', description: '', start: '', end: '' });

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:8000/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const createTask = async () => {
    const body = { ...formData };
    await fetch('http://localhost:8000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    resetForm();
    fetchTasks();
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', category: 'Personal', frequency: 'daily', start_time: '', end_time: '',
      location: '', is_group: false, milestones: [], importance: '', reward: '', reminder_type: 'daily',
      duration_minutes: 30, confirmed_by: 'screen'
    });
  };

 const addMilestone = () => {
  const { name, description, start, end } = milestoneForm;
  if (!name.trim() || !description.trim() || !start || !end) {
    alert("Please complete all milestone fields before submitting.");
    return;
  }

  setFormData(prev => ({
    ...prev,
    milestones: [...prev.milestones, { ...milestoneForm, completed: false }]
  }));
  setMilestoneForm({ name: '', description: '', start: '', end: '' });
  setShowMilestoneModal(false);
};

  const isMilestoneValid = () => {
  const { name, description, start, end } = milestoneForm;
  return name.trim() && description.trim() && start && end;
};

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🎯 Create a Life-Changing Task</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input placeholder="Task Name" className="border px-2 py-1" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        <input placeholder="Location" className="border px-2 py-1" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
        <input type="time" placeholder="Start Time" className="border px-2 py-1" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
        <input type="time" placeholder="End Time" className="border px-2 py-1" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
        <select className="border px-2 py-1" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
          {['Personal','Work','Health','Study','Self-care','Creative','Chores','Errands','Spiritual','Social'].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select className="border px-2 py-1" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <textarea placeholder="Why is this task important to you?" className="border px-2 py-1 col-span-2" value={formData.importance} onChange={e => setFormData({ ...formData, importance: e.target.value })}></textarea>
        <textarea placeholder="Final Reward" className="border px-2 py-1 col-span-2" value={formData.reward} onChange={e => setFormData({ ...formData, reward: e.target.value })}></textarea>
      </div>
      <div className="mb-4">
  {formData.milestones.length > 0 && (
    <div className="mb-2">
      <h4 className="font-semibold mb-1">📌 Milestones</h4>
      <ul className="list-disc list-inside space-y-1">
        {formData.milestones.map((m, i) => (
          <li key={i}>
            <strong>{m.name}</strong> ({m.start} → {m.end})<br />
            <span className="text-sm text-gray-600">{m.description}</span>
          </li>
        ))}
      </ul>
    </div>
  )}
  <button onClick={() => setShowMilestoneModal(true)} className="text-sm text-blue-600 underline">
    ➕ Add Milestone
  </button>
</div>


      {showMilestoneModal && (
  <div className="popup-overlay">
    <div className="popup-box max-w-md w-full">
      <h2 className="text-xl font-semibold mb-4"> Create Milestone</h2>

      <input
        type="text"
        className="border w-full mb-2 px-3 py-2 rounded"
        placeholder="Milestone Name"
        value={milestoneForm.name}
        onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
      />
      <textarea
        className="border w-full mb-2 px-3 py-2 rounded"
        placeholder="Description"
        rows={2}
        value={milestoneForm.description}
        onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
      />
      <input
        type="date"
        className="border w-full mb-2 px-3 py-2 rounded"
        value={milestoneForm.start}
        onChange={(e) => setMilestoneForm({ ...milestoneForm, start: e.target.value })}
      />
      <input
        type="date"
        className="border w-full mb-4 px-3 py-2 rounded"
        value={milestoneForm.end}
        onChange={(e) => setMilestoneForm({ ...milestoneForm, end: e.target.value })}
      />

      <div className="popup-actions">
        <button className="cancel-btn" onClick={() => setShowMilestoneModal(false)}>Cancel</button>
        <button className={`submit-btn ${!isMilestoneValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
  onClick={addMilestone}
  disabled={!isMilestoneValid()}
>
  Submit
</button>

      </div>
    </div>
  </div>
)}


      <button onClick={createTask} className="bg-blue-600 text-white px-4 py-2 rounded">Add Task</button>

      <h3 className="text-xl font-semibold mt-8">🗂️ Your Tasks</h3>
      <ul className="mt-4 space-y-3">
        {tasks.map(task => (
          <li key={task._id} className="border p-3 rounded shadow">
            <h4 className="font-semibold">{task.name || task.title}</h4>
            <p className="text-sm text-gray-600">{task.category} | {task.frequency} | {task.duration_minutes} mins</p>
            <p className="mt-1 text-gray-700">{task.description}</p>
            {task.milestones?.length > 0 && (
              <ul className="list-disc list-inside mt-2">
                {task.milestones.map((m, i) => (
                  <li key={i}>{m.name} ({m.start} → {m.end})</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
