import { useEffect, useState } from 'react';

const bottleSizeOz = 24;
const dailyGoalOz = 120;
const bottleSizeMl = 709.76;

export default function WaterLog() {
  const [drank, setDrank] = useState(0);
  const [loading, setLoading] = useState(false);

const fetchTodayCount = async () => {
  try {
    const res = await fetch("http://localhost:8000/api/log/water/summary/today");
    const data = await res.json();
    const total = data.total_oz || 0;
    const count = Math.floor(total / bottleSizeOz);
    setDrank(count);
  } catch (err) {
    console.error("Failed to fetch water summary", err);
  }
};


const handleClick = async (index) => {
  if (index < drank || drank >= 5) return;

  setLoading(true);

  // Optimistically update the UI
  setDrank(prev => Math.min(prev + 1, 5));

  try {
    await fetch("http://localhost:8000/api/log/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount_ml: Math.round(bottleSizeMl),
        description: `Bottle ${index + 1}`,
      }),
    });

    // Confirm with real backend data
    await fetchTodayCount();
  } catch (err) {
    console.error("Failed to log water", err);
  }

  setLoading(false);
};


  useEffect(() => {
    fetchTodayCount();
  }, []);

  useEffect(() => {
  fetch("http://localhost:8000/api/log/water/streak")
    .then(res => res.json())
    .then(data => setStreak(data.streak_days));
}, []);


const bottles = Array.from({ length: 5 }, (_, i) => (
  <img
    key={i}
    src={i < drank ? '/water_bottle_filled.svg' : '/water_bottle.svg'}
    alt={`Bottle ${i + 1}`}
    onClick={() => handleClick(i)}
    style={{ width: '100px', height: '100px' }}
    className={`cursor-pointer transition duration-300 ${
      loading || drank >= 5 ? 'pointer-events-none opacity-50' : ''
    }`}
  />
));





return (
  <div className="p-6 text-center">
    <h1 className="text-2xl font-bold mb-4">💧 Daily Water Tracker</h1>

    <div className="flex justify-center gap-4 mb-4">
      {bottles}
    </div>

    <div style={{ marginTop: '40px', textAlign: 'center' }}>
  {/* Bar container */}
  <div
    style={{
      width: '480px',
      height: '40px',
      backgroundColor: '#e5e7eb', // gray
      border: '3px solid black',
      borderRadius: '9999px',
      overflow: 'hidden',
      position: 'relative',
      margin: '0 auto',
    }}
  >
    {/* Blue fill */}
    <div
      style={{
        width: `${(drank / 5) * 100}%`,
        height: '100%',
        backgroundColor: '#3b82f6', // blue-500
        borderRadius: drank === 5 ? '9999px' : '9999px 0 0 9999px',
        transition: 'width 0.5s ease',
      }}
    />
  </div>

  <p style={{ marginTop: '10px', color: '#374151' }}>
    Progress: {drank * bottleSizeOz}oz / {dailyGoalOz}oz
  </p>
</div>

    {/* Ounces text */}
    <p className="text-lg mt-4">
      {drank * bottleSizeOz} oz / {dailyGoalOz} oz
    </p>

    {/* Success message */}
    {drank === 5 && (
      <p className="text-green-600 font-semibold mt-4">
        🎉 Congratulations on taking care of your health today!
      </p>
    )}
  </div>
);

}
