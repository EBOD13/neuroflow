// src/components/WorkoutLog.jsx
import { useState, useEffect } from 'react';

const workoutDays = {
  monday: {
    label: 'Push',
    img: '/monday.svg',
    completedImg: '/monday.png',
  },
  tuesday: {
    label: 'Pull',
    img: '/tuesday.svg',
    completedImg: '/tuesday.png',
  },
  wednesday: {
    label: 'Legs',
    img: '/wednesday.svg',
    completedImg: '/wednesday.png',
  },
  thursday: {
    label: 'Core',
    img: '/thursday.svg',
    completedImg: '/thursday.png',
  },
  friday: {
    label: 'Rest',
    img: '/friday.svg',
    completedImg: '/friday.png',
  },
  saturday: {
    label: 'Jog',
    img: '/saturday.svg',
    completedImg: '/saturday.png',
  },
};

export default function WorkoutLog() {
  const [workouts, setWorkouts] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [planItems, setPlanItems] = useState([]);
  const [miles, setMiles] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  const fetchWorkoutSummary = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/log/workout/summary/today');
      const data = await res.json();
      setWorkouts((prev) => ({ ...prev, [data.day?.toLowerCase()]: data }));
    } catch (err) {
      console.error('Failed to fetch workout summary', err);
    }
  };

  const submitWorkout = async (completed = false) => {
    if (!selectedDay) return;

    const body = {
      description: planItems.map(item => item.text).join('\n'),
      checklist: planItems,
      completed,
    };

    if (selectedDay === 'saturday') {
      body.miles = parseFloat(miles) || 0;
    }

    try {
      await fetch(`http://localhost:8000/api/log/workout/${selectedDay}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setPopupOpen(false);
      fetchWorkoutSummary();
    } catch (err) {
      console.error('Failed to log workout', err);
    }
  };

  useEffect(() => {
    fetchWorkoutSummary();
  }, []);

  const toggleCheckbox = (index) => {
    const updated = [...planItems];
    updated[index].checked = !updated[index].checked;
    setPlanItems(updated);
  };

  const getProgress = (key) => {
    if (selectedDay !== key) return workouts[key]?.progress || 0;
    if (planItems.length === 0) return 0;
    const completed = planItems.filter((item) => item.checked).length;
    return Math.round((completed / planItems.length) * 100);
  };

  const handleAddPlanItem = () => {
    if (newItemText.trim()) {
      setPlanItems([...planItems, { text: newItemText.trim(), checked: false }]);
      setNewItemText('');
      setAddingItem(false);
    }
  };

  const isCompleted = selectedDay && workouts[selectedDay]?.completed;

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-6">🏋️ Weekly Workout Tracker</h1>
      <div className="flex justify-center flex-wrap gap-6">
        {Object.entries(workoutDays).map(([key, { label, img, completedImg }]) => (
          <div key={key} className="workout-item">
            <p className="mt-2 text-sm">
              {workouts[key]?.completed ? `✅ ${label}` : `${label}`}
            </p>
            <img
              src={workouts[key]?.completed ? completedImg : img}
              alt={label}
              style={{ width: '75px', height: '75px' }}
              className="cursor-pointer transition"
              onClick={() => {
                setSelectedDay(key);
                const existing = workouts[key]?.checklist || [];
                setPlanItems(existing);
                setMiles(workouts[key]?.miles || '');
                setPopupOpen(true);
              }}
            />
            <div className="w-20 h-2 mt-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  getProgress(key) === 100 ? 'bg-green-400 animate-pulse-glow' : 'bg-green-500'
                }`}
                style={{ width: `${getProgress(key)}%` }}
              ></div>
            </div>
            <p className="text-xs mt-1 text-gray-600">{getProgress(key)}% Complete</p>
          </div>
        ))}
      </div>

      {popupOpen && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Plan {workoutDays[selectedDay].label}</h2>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {planItems.map((item, idx) => (
                <li key={idx}>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      disabled={isCompleted}
                      onChange={() => toggleCheckbox(idx)}
                    />{' '}
                    {item.text}
                  </label>
                </li>
              ))}
            </ul>
            {!isCompleted && (addingItem ? (
              <div className="mb-3 flex items-center gap-2">
                <input
                  className="border rounded px-2 py-1 w-full"
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                />
                <button onClick={handleAddPlanItem} className="text-green-600 font-semibold">Add</button>
              </div>
            ) : (
              <button
                className="mb-3 text-blue-500"
                onClick={() => setAddingItem(true)}
              >
                ➕ Add Plan Item
              </button>
            ))}

            {selectedDay === 'saturday' && (
              <input
                type="number"
                placeholder="Miles ran"
                value={miles}
                disabled={isCompleted}
                onChange={(e) => setMiles(e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
              />
            )}
            <div className="popup-actions">
              <button className="cancel-btn" onClick={() => setPopupOpen(false)}>Cancel</button>
              {!isCompleted && (
                <>
                  <button className="cancel-btn" onClick={() => submitWorkout(false)}>Update</button>
                  <button className="submit-btn" onClick={() => submitWorkout(true)}>Done</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
