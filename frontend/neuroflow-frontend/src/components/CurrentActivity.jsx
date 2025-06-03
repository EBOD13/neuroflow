import React, { useState, useEffect } from "react";
import "../styles/CurrentActivity.css";

const workoutDays = {
  monday: {
    label: "Push",
    img: "/images/monday.svg",
    completedImg: "/images/monday.png",
  },
  tuesday: {
    label: "Pull",
    img: "/images/tuesday.svg",
    completedImg: "/images/tuesday.png",
  },
  wednesday: {
    label: "Legs",
    img: "/images/wednesday.svg",
    completedImg: "/images/wednesday.png",
  },
  thursday: {
    label: "Core",
    img: "/images/thursday.svg",
    completedImg: "/images/thursday.png",
  },
  friday: {
    label: "Rest",
    img: "/images/friday.svg",
    completedImg: "/images/friday.png",
  },
  saturday: {
    label: "Jog",
    img: "/images/saturday.svg",
    completedImg: "/images/saturday.png",
  },
};

export default function CurrentActivity() {
  const [currentDay, setCurrentDay] = useState("");
  const [workoutData, setWorkoutData] = useState(null);
  const [dateString, setDateString] = useState("");
  const [timeString, setTimeString] = useState("");

  // Get current day and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const day = now
        .toLocaleString("en-US", { weekday: "long" })
        .toLowerCase();
      setCurrentDay(day);

      setDateString(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })
      );

      setTimeString(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Fetch workout data for current day
  useEffect(() => {
    if (!currentDay) return;

    const fetchWorkoutData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/log/workout/summary/today`
        );
        const data = await response.json();

        // If we have data for today, use it
        if (data.day && data.day.toLowerCase() === currentDay) {
          setWorkoutData(data);
        } else {
          // Otherwise create empty state
          setWorkoutData({
            completed: false,
            checklist: [],
            miles: currentDay === "saturday" ? "" : undefined,
            location: "Home", // Default location
          });
        }
      } catch (error) {
        console.error("Failed to fetch workout data:", error);
        setWorkoutData({
          completed: false,
          checklist: [],
          miles: currentDay === "saturday" ? "" : undefined,
          location: "Home", // Default location
        });
      }
    };

    fetchWorkoutData();
  }, [currentDay]);

  if (!currentDay || !workoutData) {
    return <div className="loading">Loading today's activity...</div>;
  }

  const workoutMeta = workoutDays[currentDay];
  if (!workoutMeta) {
    return <div className="no-workout">No workout planned for today</div>;
  }

  const checklist = workoutData.checklist || [];
  const midIndex = Math.ceil(checklist.length / 2);
  const leftItems = checklist.slice(0, midIndex);
  const rightItems = checklist.slice(midIndex);

  return (
    <div className="current-activity">
      <div className="header">
        <div className="date">{dateString}</div>
        <div className="activity-header-center">
          <div className="activity-label">{workoutMeta.label}</div>
          {workoutData.location && (
            <div className="activity-location">{workoutData.location}</div>
          )}
        </div>
        <div className="time">{timeString}</div>
      </div>

      <div className="content">
        <div className="tasks left-tasks">
          {leftItems.map((item, index) => (
            <div
              key={`left-${index}`}
              className={`task ${item.checked ? "completed" : ""}`}
            >
              <div className="task-bubble"></div>
              <span className="task-text">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="center-content">
          <div className="center-image">
            <img src={workoutMeta.completedImg} alt={workoutMeta.label} />
          </div>
          {/* <div className="activity-info">
            <div className="activity-location">
              {workoutData.location || "Home"}
            </div>
          </div> */}
        </div>

        <div className="tasks right-tasks">
          {rightItems.map((item, index) => (
            <div
              key={`right-${index}`}
              className={`task ${item.checked ? "completed" : ""}`}
            >
              <span className="task-text">{item.text}</span>
              <div className="task-bubble"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
