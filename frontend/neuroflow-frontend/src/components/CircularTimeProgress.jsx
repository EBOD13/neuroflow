import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import "../styles/PomodoroTimer.css";

const CircularTimeProgress = ({ secondsLeft, totalSeconds, isBreak }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      const ctx = chartRef.current.getContext("2d");

      // Initialize with full circle (100% remaining)
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          datasets: [
            {
              data: [100, 0], // [remaining, elapsed] - start with full circle
              backgroundColor: [
                isBreak ? "#E97633" : "#28A293", // Active progress color
                "#0C172B", // Background color
              ],
              borderWidth: 0,
            },
          ],
        },
        options: {
          rotation: -90, // Start at the top
          circumference: 360, // Full circle
          cutout: "70%",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          animation: {
            animateScale: false,
            animateRotate: false,
          },
          events: [],
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [isBreak]);

  useEffect(() => {
    if (chartInstance.current) {
      // Calculate the remaining percentage (not elapsed)
      const remainingPercentage = Math.max(
        0,
        (secondsLeft / totalSeconds) * 100
      );

      // Update the chart data - first value is remaining time, second is elapsed
      chartInstance.current.data.datasets[0].data = [
        remainingPercentage,
        100 - remainingPercentage,
      ];

      // Update colors based on break state
      chartInstance.current.data.datasets[0].backgroundColor = [
        isBreak ? "#E97633" : "#28A293", // Active color
        "#0C172B", // Background color
      ];

      // Update without animation
      chartInstance.current.update("none");
    }
  }, [secondsLeft, totalSeconds, isBreak]);

  return (
    <div className="circular-progress-container">
      <canvas ref={chartRef} />
      <div className="circular-progress-text">
        <div className="time-display">{formatTime(secondsLeft)}</div>
        <div className="time-label">
          {isBreak ? "Break Time" : "Focus Time"}
        </div>
      </div>
    </div>
  );
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default CircularTimeProgress;
