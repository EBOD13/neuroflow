import { useEffect, useRef, useState, useMemo } from 'react';

export default function PomodoroTimer() {
  const [label, setLabel] = useState('');
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef(null);
  const hasTriggeredRef = useRef(false);

  const totalSeconds = useMemo(
    () => durationHours * 3600 + durationMinutes * 60 + durationSeconds,
    [durationHours, durationMinutes, durationSeconds]
  );

  const estimatedPomodoros = useMemo(() => {
    const pomodoroCycle = 25 * 60 + 5 * 60;
    return Math.floor(totalSeconds / pomodoroCycle);
  }, [totalSeconds]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleCycleCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleCycleCompletion = async () => {
    setIsRunning(false);
    new Audio('/beep.mp3').play();
    await fetch('http://localhost:8000/api/alert/pomodoro');

    if (!isBreak) {
      await logSession();
    }

    // Transition between work and break cycles
    if (!isBreak) {
      setIsBreak(true);
      setSecondsLeft(5 * 60);
      setIsRunning(true);
    } else {
      setIsBreak(false);
      setCycleCount((count) => count + 1);
      if ((cycleCount + 1) * 30 * 60 < totalSeconds) {
        setSecondsLeft(25 * 60);
        setIsRunning(true);
      } else {
        setShowModal(true);
        setIsCompleted(true);
        setStartTime(null);
      }
    }
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const startTimer = () => {
    if (totalSeconds <= 0) return;
    setCycleCount(0);
    setSecondsLeft(25 * 60);
    setStartTime(new Date().toISOString());
    setIsRunning(true);
    setIsCompleted(false);
    setIsBreak(false);
    hasTriggeredRef.current = false;
  };

  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => setIsRunning(true);
  const cancelTimer = () => {
    setIsRunning(false);
    setStartTime(null);
    setSecondsLeft(0);
    setIsCompleted(false);
    setIsBreak(false);
    setCycleCount(0);
    hasTriggeredRef.current = false;
  };

  const logSession = async () => {
    await fetch('http://localhost:8000/api/log/pomodoro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label,
        duration: 25,
        start_time: startTime,
        end_time: new Date().toISOString(),
        completed: true,
        confirmed_by: 'screen',
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
        onChange={(e) => setLabel(e.target.value)}
        disabled={isRunning || isCompleted}
      />

      <div className="flex justify-center gap-2 mb-2">
        <input
          type="number"
          min={0}
          placeholder="H"
          className="w-16 border px-2 py-1"
          value={durationHours}
          onChange={(e) => setDurationHours(Number(e.target.value))}
        />
        <input
          type="number"
          min={0}
          placeholder="M"
          className="w-16 border px-2 py-1"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
        />
        <input
          type="number"
          min={0}
          placeholder="S"
          className="w-16 border px-2 py-1"
          value={durationSeconds}
          onChange={(e) => setDurationSeconds(Number(e.target.value))}
        />
      </div>

      {estimatedPomodoros > 0 && (
        <p className="text-gray-600 mb-2">
          Estimated Pomodoro Intervals: <strong>{estimatedPomodoros}</strong>
        </p>
      )}

      <div className="text-4xl font-mono my-4">{formatTime(secondsLeft)}</div>
      <p className="mb-2">{isBreak ? '🌿 Break Time' : '💼 Focus Time'}</p>

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
            <h2>🎉 All Sessions Complete!</h2>
            <p>You've completed <strong>{cycleCount}</strong> Pomodoro intervals!</p>
            <button
              onClick={() => {
                setShowModal(false);
                cancelTimer();
              }}
              className="submit-btn mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
