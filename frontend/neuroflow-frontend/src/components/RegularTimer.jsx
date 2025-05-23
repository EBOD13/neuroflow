// src/components/RegularTimer.jsx
import { useEffect, useRef, useState } from 'react';

export default function RegularTimer() {
  const [label, setLabel] = useState('');
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setIsCompleted(true);
            if (!hasTriggeredRef.current) {
              hasTriggeredRef.current = true;
              triggerCompletion();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const totalSeconds = durationHours * 3600 + durationMinutes * 60 + durationSeconds;

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const startTimer = () => {
    if (totalSeconds <= 0) return;
    setSecondsLeft(totalSeconds);
    setStartTime(new Date().toISOString());
    setIsRunning(true);
    setIsCompleted(false);
    hasTriggeredRef.current = false;
  };

  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => setIsRunning(true);

  const cancelTimer = () => {
    setIsRunning(false);
    setSecondsLeft(0);
    setStartTime(null);
    setIsCompleted(false);
    hasTriggeredRef.current = false;
  };

  const triggerCompletion = async () => {
    new Audio('/beep.mp3').play();
    await fetch('http://localhost:8000/api/alert/pomodoro');
    await logSession();
  };

  const logSession = async () => {
    await fetch('http://localhost:8000/api/log/timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label,
        duration: totalSeconds / 60,
        start_time: startTime,
        end_time: new Date().toISOString(),
        confirmed_by: "screen",
        completed: true
      }),
    });
  };

  return (
    <div className="text-center p-6">
      <h2 className="text-2xl font-bold mb-4">⏱️ Regular Timer</h2>
      <input
        className="border px-3 py-1 mb-2"
        placeholder="Timer Label"
        value={label}
        onChange={e => setLabel(e.target.value)}
        disabled={isRunning || isCompleted}
      />

      <div className="flex justify-center gap-2 mb-4">
        <input
          type="number"
          min={0}
          placeholder="H"
          className="w-16 border px-2 py-1"
          value={durationHours}
          onChange={e => setDurationHours(Number(e.target.value))}
        />
        <input
          type="number"
          min={0}
          placeholder="M"
          className="w-16 border px-2 py-1"
          value={durationMinutes}
          onChange={e => setDurationMinutes(Number(e.target.value))}
        />
        <input
          type="number"
          min={0}
          placeholder="S"
          className="w-16 border px-2 py-1"
          value={durationSeconds}
          onChange={e => setDurationSeconds(Number(e.target.value))}
        />
      </div>

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

      {isCompleted && (
        <p className="mt-4 text-green-600 font-medium">✅ Timer completed!</p>
      )}
    </div>
  );
}
