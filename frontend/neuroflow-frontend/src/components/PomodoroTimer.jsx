import React, { useEffect, useRef, useState, useMemo } from "react";
import { FaPlay, FaPause, FaStop, FaForward, FaRunning } from "react-icons/fa";
import CircularTimeProgress from "./CircularTimeProgress";
import "../styles/PomodoroTimer.css";

const CATEGORIES = [
  "Work",
  "Studying",
  "Programming",
  "Reading",
  "Writing",
  "Other",
];

export default function PomodoroTimer() {
  // Audio setup
  const beepAudio = useRef(null);
  useEffect(() => {
    beepAudio.current = new Audio("/audio/beep.wav");
    beepAudio.current.load();
    return () => beepAudio.current?.pause();
  }, []);

  // Timer states
  const [duration, setDuration] = useState({ hours: 0, minutes: 10 });
  const [timer, setTimer] = useState({
    secondsLeft: 0,
    isRunning: false,
    isCompleted: false,
    isBreak: false,
    cycleCount: 0,
  });
  const [session, setSession] = useState({
    startTime: null,
    category: "Work",
    customCategory: "",
    showCustomInput: false,
    skipBreaks: false,
  });
  const [showModal, setShowModal] = useState(false);

  // Derived values
  const totalSeconds = useMemo(
    () => duration.hours * 3600 + duration.minutes * 60,
    [duration.hours, duration.minutes]
  );

  const estimatedPomodoros = useMemo(() => {
    const pomodoroCycle = 25 * 60 + 5 * 60;
    const adjustedSeconds = Math.floor(totalSeconds / 300) * 300;
    return Math.floor(adjustedSeconds / pomodoroCycle);
  }, [totalSeconds]);

  // Timer controls
  const playSound = () => {
    if (beepAudio.current) {
      beepAudio.current.currentTime = 0;
      beepAudio.current.play().catch(console.error);
    }
  };

  const startTimer = () => {
    playSound();
    const workTime = totalSeconds;

    setTimer({
      secondsLeft: workTime,
      isRunning: true,
      isCompleted: false,
      isBreak: false,
      cycleCount: 0,
    });
    setSession((prev) => ({ ...prev, startTime: new Date().toISOString() }));
  };

  const stopTimer = () => {
    resetTimer();
  };

  const resetTimer = () => {
    setTimer({
      secondsLeft: 0,
      isRunning: false,
      isCompleted: false,
      isBreak: false,
      cycleCount: 0,
    });
    setSession((prev) => ({ ...prev, startTime: null }));
  };

  // Timer effect
  useEffect(() => {
    let interval;

    if (timer.isRunning && timer.secondsLeft > 0) {
      interval = setInterval(() => {
        setTimer((prev) => ({
          ...prev,
          secondsLeft: prev.secondsLeft - 1,
        }));
      }, 1000);
    } else if (timer.secondsLeft === 0 && timer.isRunning) {
      setTimer((prev) => ({
        ...prev,
        isRunning: false,
        isCompleted: true,
      }));
      playSound();
      setShowModal(true);
    }

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.secondsLeft]);

  // Time adjustment
  const adjustTime = (type, operation) => {
    setDuration((prev) => {
      let newHours = prev.hours;
      let newMinutes = prev.minutes;

      if (type === "hours") {
        newHours =
          operation === "increment"
            ? Math.min(23, newHours + 1)
            : Math.max(0, newHours - 1);
      } else {
        newMinutes =
          operation === "increment"
            ? newMinutes >= 55
              ? 0
              : newMinutes + 5
            : newMinutes <= 0
            ? 55
            : newMinutes - 5;
      }

      return { hours: newHours, minutes: newMinutes };
    });
  };

  return (
    <div className="pomodoro-container">
      {!session.startTime ? (
        <SetupView
          duration={duration}
          session={session}
          estimatedPomodoros={estimatedPomodoros}
          onDurationChange={adjustTime}
          onCategoryChange={(e) => {
            const value = e.target.value;
            setSession((prev) => ({
              ...prev,
              category: value,
              showCustomInput: value === "Other",
            }));
          }}
          onCustomCategoryChange={(e) =>
            setSession((prev) => ({
              ...prev,
              customCategory: e.target.value,
            }))
          }
          onSkipBreaksToggle={() =>
            setSession((prev) => ({
              ...prev,
              skipBreaks: !prev.skipBreaks,
            }))
          }
          onStart={startTimer}
        />
      ) : (
        <ActiveTimerView
          timer={timer}
          isBreak={timer.isBreak}
          totalSeconds={totalSeconds}
          onPause={() => setTimer((prev) => ({ ...prev, isRunning: false }))}
          onResume={() => setTimer((prev) => ({ ...prev, isRunning: true }))}
          onStop={stopTimer}
        />
      )}

      {showModal && (
        <CompletionModal
          cycleCount={timer.cycleCount}
          onClose={() => {
            setShowModal(false);
            resetTimer();
          }}
        />
      )}
    </div>
  );
}

function SetupView({
  duration,
  session,
  estimatedPomodoros,
  onDurationChange,
  onCategoryChange,
  onCustomCategoryChange,
  onSkipBreaksToggle,
  onStart,
}) {
  return (
    <>
      <h2 className="timer-title">Pomodoro Timer</h2>

      <div className="category-selector">
        <select
          value={session.category}
          onChange={onCategoryChange}
          className="category-dropdown"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {session.showCustomInput && (
          <input
            type="text"
            placeholder="Enter custom category"
            value={session.customCategory}
            onChange={onCustomCategoryChange}
            className="custom-category-input"
          />
        )}
      </div>

      <TimeInput
        hours={duration.hours}
        minutes={duration.minutes}
        onIncrementHours={() => onDurationChange("hours", "increment")}
        onDecrementHours={() => onDurationChange("hours", "decrement")}
        onIncrementMinutes={() => onDurationChange("minutes", "increment")}
        onDecrementMinutes={() => onDurationChange("minutes", "decrement")}
      />

      <p className="breaks-info">You'll have {estimatedPomodoros} breaks</p>

      <div className="action-buttons">
        <button onClick={onStart} className="start-button">
          <FaRunning className="button-icon" />
        </button>
        <button
          onClick={onSkipBreaksToggle}
          className={`skip-button ${session.skipBreaks ? "active" : ""}`}
        >
          <FaForward className="button-icon" />
          {session.skipBreaks}
        </button>
      </div>
    </>
  );
}

function TimeInput({
  hours,
  minutes,
  onIncrementHours,
  onDecrementHours,
  onIncrementMinutes,
  onDecrementMinutes,
}) {
  return (
    <div className="time-box">
      <div className="time-input-group">
        <TimeInputField
          value={hours}
          label="hrs"
          onIncrement={onIncrementHours}
          onDecrement={onDecrementHours}
        />
      </div>

      <div className="time-divider" />

      <div className="time-input-group">
        <TimeInputField
          value={minutes}
          label="mins"
          onIncrement={onIncrementMinutes}
          onDecrement={onDecrementMinutes}
        />
      </div>
    </div>
  );
}

function TimeInputField({ value, label, onIncrement, onDecrement }) {
  return (
    <div className="input-controls">
      <button className="pomodoro-control-button" onClick={onIncrement}>
        <svg viewBox="0 0 24 24">
          <path d="M7 14l5-5 5 5z" fill="currentColor" />
        </svg>
      </button>
      <div className="time-value">{value.toString().padStart(2, "0")}</div>
      <div className="time-label">{label}</div>
      <button className="pomodoro-control-button" onClick={onDecrement}>
        <svg viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
function ActiveTimerView({
  timer,
  isBreak,
  totalSeconds,
  onPause,
  onResume,
  onStop,
}) {
  return (
    <>
      <h2 className="session-title">{isBreak ? "Break" : "Focus session"}</h2>

      <div className="timer-display">
        <CircularTimeProgress
          secondsLeft={timer.secondsLeft}
          totalSeconds={totalSeconds}
          isBreak={isBreak}
        />
        <div className="timer-status">{timer.isRunning}</div>
      </div>

      <div className="timer-controls">
        {timer.secondsLeft > 0 && (
          <>
            <button
              onClick={timer.isRunning ? onPause : onResume}
              className="pomodoro-control-button-large"
            >
              {timer.isRunning ? <FaPause /> : <FaPlay />}
            </button>
            <button
              onClick={onStop}
              className="control-button-large stop-button"
            >
              <FaStop />
            </button>
          </>
        )}
      </div>
    </>
  );
}

function CompletionModal({ cycleCount, onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2>🎉 All Sessions Complete!</h2>
        <p>
          You've completed <strong>{cycleCount}</strong> Pomodoro intervals!
        </p>
        <button onClick={onClose} className="submit-btn">
          Close
        </button>
      </div>
    </div>
  );
}
