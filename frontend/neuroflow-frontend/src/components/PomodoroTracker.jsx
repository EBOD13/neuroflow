// src/components/PomodoroTimer.jsx
import { useEffect, useRef, useState } from 'react';

export default function PomodoroTimer() {
  const [label, setLabel] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setIsCompleted(true);
            triggerCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const startTimer = () => {
    setSecondsLeft(durationMinutes * 60);
    setStartTime(new Date().toISOString());
    setIsRunning(true);
    setIsCompleted(false);
  };

  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => setIsRunning(true);
  const cancelTimer = () => {
    setIsRunning(false);
    setSecondsLeft(durationMinutes * 60);
    setStartTime(null);
    setIsCompleted(false);
  };

  const triggerCompletion = async () => {
    new Audio('/beep.mp3').play(); // Ensure this sound file exists
    setShowModal(true);
    await fetch('http://localhost:8000/api/alert/pomodoro'); // triggers LED/buzzer
    await logSession();
  };

  const logSession = async () => {
    await fetch('http://localhost:8000/api/log/pomodoro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label,
        duration: durationMinutes,
        start_time: startTime,
        end_time: new Date().toISOString(),
        completed: true,
        confirmed_by: "screen",
      }),
    });
  };

  return (
    <div className="text-center p-6">
      <h2 className="text-2xl font-bold mb-4">🍅 Pomodoro Timer</h2>
      <input
        className="border px-3 py-1 mb-2"
        placeholder="Task Label"
        value={label}
        onChange={e => setLabel(e.target.value)}
      />
      <input
        type="number"
        min={1}
        className="border px-3 py-1 mb-4 ml-2"
        value={durationMinutes}
        onChange={e => setDurationMinutes(Number(e.target.value))}
      />
      <div className="text-4xl font-mono my-4">{formatTime(secondsLeft)}</div>

      {!isRunning && !startTime && (
        <button onClick={startTimer} className="bg-green-500 text-white px-4 py-2 rounded">Start</button>
      )}
      {isRunning && (
        <button onClick={pauseTimer} className="bg-yellow-500 text-white px-4 py-2 rounded">Pause</button>
      )}
      {!isRunning && startTime && secondsLeft > 0 && (
        <button onClick={resumeTimer} className="bg-blue-500 text-white px-4 py-2 rounded">Continue</button>
      )}
      {startTime && (
        <button onClick={cancelTimer} className="bg-red-500 text-white px-4 py-2 rounded ml-2">Cancel</button>
      )}

      {showModal && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>🎉 Session Complete!</h2>
            <p>Great job on <strong>{label}</strong>!</p>
            <button onClick={() => setShowModal(false)} className="submit-btn mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
