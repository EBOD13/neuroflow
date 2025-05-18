// src/components/MealLog.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const mealTargets = {
  breakfast: {
    label: 'Breakfast',
    time: '11:00',
    img: '/breakfast.svg',
    completedImg: '/breakfast(1).png',
  },
  lunch: {
    label: 'Lunch',
    time: '15:00',
    img: '/lunch.svg',
    completedImg: '/lunch (1).png',
  },
  dinner: {
    label: 'Dinner',
    time: '20:00',
    img: '/dinner.svg',
    completedImg: '/dinner.png',
  },
};

export default function MealLog() {
  const [meals, setMeals] = useState({});
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [description, setDescription] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);

  const fetchMealSummary = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/log/meal/summary/today');
      const data = await res.json();
      setMeals(data.meals);
    } catch (err) {
      console.error('Failed to fetch meal summary', err);
    }
  };

  const handleMealClick = (mealType) => {
    setSelectedMeal(mealType);
    setDescription(meals[mealType]?.description || '');
    setPopupOpen(true);
  };

const submitMeal = async () => {
  try {
    const now = new Date().toISOString();
    await fetch(`http://localhost:8000/api/log/meal/${selectedMeal}?description=${encodeURIComponent(description)}&timestamp=${encodeURIComponent(now)}`, {
      method: 'POST',
    });
    toast.success(`${mealTargets[selectedMeal].label} logged!`);
    setPopupOpen(false);
    setSelectedMeal(null);
    setDescription('');
    fetchMealSummary();
  } catch (err) {
    toast.error("Failed to log meal.");
    console.error('Failed to log meal', err);
  }
};


  useEffect(() => {
    fetchMealSummary();
  }, []);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-6">🍽️ Daily Meal Tracker</h1>
<div className="flex justify-center meal-container">
  {Object.entries(mealTargets).map(([key, { label, img, completedImg }]) => (
    <div
      key={key}
      className="meal-item"
    >
      <img
        src={meals[key]?.completed ? completedImg : img}
        alt={label}
        onClick={() => handleMealClick(key)}
        style={{ width: '75px', height: '75px' }}
        className="cursor-pointer transition"
      />
      <p className="mt-2 text-sm">
        {meals[key]?.completed ? `✅ ${label}` : `${label}`}
      </p>
    </div>
  ))}
</div>




      {popupOpen && (
  <div className="popup-overlay">
    <div className="popup-box">
      <h2>Log {mealTargets[selectedMeal].label}</h2>
      <textarea
        placeholder="What did you eat?"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="popup-actions">
        <button onClick={() => setPopupOpen(false)} className="cancel-btn">
          Cancel
        </button>
        <button onClick={submitMeal} className="submit-btn">
          Log Meal
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
