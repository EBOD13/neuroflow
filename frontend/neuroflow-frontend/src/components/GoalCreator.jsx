import { useState } from 'react';

export default function GoalCreator() {
  const [goal, setGoal] = useState({
    title: '',
    category: 'Fitness',
    description: '',
    goalType: 'numeric',
    targetValue: '',
    frequency: '',
    deadline: '',
    reward: '',
    why: '',
  });

  const [milestones, setMilestones] = useState([]);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    start: '',
    end: '',
    type: 'binary',
    targetValue: '',
    unit: '',
  });
  const [validationError, setValidationError] = useState('');

  const categories = ['Fitness', 'Finance', 'Education', 'Mental Health', 'Career', 'Creativity', 'Travel', 'Relationships', 'Spirituality', 'Custom'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGoal(prev => ({ ...prev, [name]: value }));
  };

  const addMilestone = () => {
    const { name, start, end, type } = milestoneForm;

    if (!name || !start || !end) {
      alert("Please fill in name, start, and end date.");
      return;
    }

    const newMilestone = {
      ...milestoneForm,
      completed: false,
      currentValue: type !== 'binary' ? 0 : undefined,
    };

    setMilestones(prev => [...prev, newMilestone]);
    setMilestoneForm({
      name: '',
      description: '',
      start: '',
      end: '',
      type: 'binary',
      targetValue: '',
      unit: '',
    });
    setShowMilestoneModal(false);
    setValidationError('');
  };

  const createGoal = async () => {
    // Validate required fields
    if (!goal.title) {
      setValidationError('Goal title is required');
      return;
    }

    if (milestones.length === 0) {
      setValidationError('Please add at least one milestone');
      return;
    }

    const body = {
      ...goal,
      milestones,
      behaviors: [], // Add later if needed
    };

    try {
      const res = await fetch('http://localhost:8000/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Server error:", errText);
        alert("Failed to create goal. Check console for details.");
        return;
      }

      const result = await res.json();
      if (result.id) {
        window.location.href = `/goals/${result.id}`;
      } else {
        console.error("Missing ID in response:", result);
        alert("Goal creation failed: Missing ID in response");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Something went wrong while creating the goal.");
    }
  };

  const removeMilestone = (index) => {
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🎯 Create Your Goal</h2>

      {validationError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{validationError}</p>
        </div>
      )}

      <input 
        name="title" 
        placeholder="Goal Title *" 
        className="border px-2 py-1 mb-3 w-full" 
        value={goal.title} 
        onChange={handleChange} 
        required
      />

      <textarea 
        name="description" 
        placeholder="Why does this goal matter?" 
        className="border px-2 py-1 mb-3 w-full" 
        value={goal.description} 
        onChange={handleChange} 
      />

      <select 
        name="category" 
        className="border px-2 py-1 mb-3 w-full" 
        value={goal.category} 
        onChange={handleChange}
      >
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <label className="block font-semibold mt-4">Goal Type:</label>
      <select 
        name="goalType" 
        value={goal.goalType} 
        onChange={handleChange} 
        className="border px-2 py-1 mb-3 w-full"
      >
        <option value="numeric">Numeric (e.g., Save $5000)</option>
        <option value="binary">Yes/No (e.g., Visit Paris)</option>
        <option value="frequency">Frequency (e.g., Read 3x/week)</option>
      </select>

      {goal.goalType === 'numeric' && (
        <input 
          name="targetValue" 
          type="number" 
          placeholder="Target Amount" 
          className="border px-2 py-1 mb-3 w-full" 
          value={goal.targetValue} 
          onChange={handleChange} 
        />
      )}
      {goal.goalType === 'frequency' && (
        <input 
          name="frequency" 
          type="text" 
          placeholder="e.g. 5 times per week" 
          className="border px-2 py-1 mb-3 w-full" 
          value={goal.frequency} 
          onChange={handleChange} 
        />
      )}

      <input 
        name="deadline" 
        type="date" 
        className="border px-2 py-1 mb-3 w-full" 
        value={goal.deadline} 
        onChange={handleChange} 
      />
      <input 
        name="reward" 
        placeholder="Reward for completing goal" 
        className="border px-2 py-1 mb-3 w-full" 
        value={goal.reward} 
        onChange={handleChange} 
      />
      <textarea 
        name="why" 
        placeholder="Purpose reminder (your why)" 
        className="border px-2 py-1 mb-3 w-full" 
        value={goal.why} 
        onChange={handleChange} 
      />

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Milestones *</h3>
        <button 
          onClick={() => setShowMilestoneModal(true)} 
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
        >
          ➕ Add Milestone
        </button>
        
        {milestones.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {milestones.map((m, i) => (
              <li key={i} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <span className="font-medium">{m.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({m.start} → {m.end})
                  </span>
                </div>
                <button 
                  onClick={() => removeMilestone(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-red-500 mt-2">At least one milestone is required</p>
        )}
      </div>

      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Milestone</h3>
            <input 
              placeholder="Milestone Name *" 
              className="border w-full mb-2 px-2 py-1" 
              value={milestoneForm.name} 
              onChange={e => setMilestoneForm({ ...milestoneForm, name: e.target.value })} 
              required
            />
            <input 
              placeholder="Start Date *" 
              type="date" 
              className="border w-full mb-2 px-2 py-1" 
              value={milestoneForm.start} 
              onChange={e => setMilestoneForm({ ...milestoneForm, start: e.target.value })} 
              required
            />
            <input 
              placeholder="End Date *" 
              type="date" 
              className="border w-full mb-2 px-2 py-1" 
              value={milestoneForm.end} 
              onChange={e => setMilestoneForm({ ...milestoneForm, end: e.target.value })} 
              required
            />
            <select
              className="border w-full mb-2 px-2 py-1"
              value={milestoneForm.type}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, type: e.target.value })}
            >
              <option value="binary">Binary (Done/Not Done)</option>
              <option value="numeric">Numeric (e.g., Save $500)</option>
              <option value="frequency">Frequency (e.g., Read 3 times)</option>
            </select>

            {milestoneForm.type !== 'binary' && (
              <>
                <input
                  placeholder="Target Value"
                  type="number"
                  className="border w-full mb-2 px-2 py-1"
                  value={milestoneForm.targetValue}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, targetValue: e.target.value })}
                />
                <input
                  placeholder="Unit (optional, e.g., km, $)"
                  className="border w-full mb-2 px-2 py-1"
                  value={milestoneForm.unit}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, unit: e.target.value })}
                />
              </>
            )}

            <textarea 
              placeholder="Description" 
              className="border w-full mb-2 px-2 py-1" 
              value={milestoneForm.description} 
              onChange={e => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-1 border" 
                onClick={() => setShowMilestoneModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-1 bg-green-500 text-white" 
                onClick={addMilestone}
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={createGoal} 
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Goal
      </button>
    </div>
  );
}