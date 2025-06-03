import React from "react";
import "../styles/Dashboard.css";
import SpotifyPlayer from "./SpotifyPlayer";
import CameraStream from "./CameraStream";
import TemperatureDial from "./TemperatureDial";
import WaterLog from "./WaterLog";
import MealLog from "./MealLog";
import PomodoroTimer from "./PomodoroTimer";
import CurrentActivity from "./CurrentActivity";
import WorkoutLog from "./WorkoutLog";
import TaskBoard from "./TaskBoard";

function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* Left Panel */}
      <div className="left-panel">
        <div className="top-left">
          <TemperatureDial />
        </div>
        <div className="bottom-left">
          <div className="camera-stream-wrapper">
            <CameraStream />
          </div>
          <div className="right-bottom-left">
            <div className="half-section">
              <SpotifyPlayer />
            </div>
            <div className="half-section">
              <WaterLog />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="top-right">
          <CurrentActivity />
        </div>
        <div className="bottom-right">
          <div className="bottom-right-left">
            <WaterLog />
            <PomodoroTimer />
          </div>
          <WorkoutLog className="workout-log" />
          <div className="bottom-right-right">
            <MealLog />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
