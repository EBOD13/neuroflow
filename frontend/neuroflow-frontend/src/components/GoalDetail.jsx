import { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import GoalEditor from "./GoalEditor";
import MilestoneEditor from "./MilestoneEditor";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement
);

export default function GoalDetail() {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalVisualStyles, setGoalVisualStyles] = useState({});
  const [globalVisualStyle, setGlobalVisualStyle] = useState("circular");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingMilestone, setIsEditingMilestone] = useState(false);
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(null);

  const fetchGoals = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/goals");
      const data = await res.json();
      setGoals(data);
      if (selectedGoal) {
        const updated = data.find(g => g._id === selectedGoal._id);
        if (updated) setSelectedGoal(updated);
      }
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    }
  };

const toggleMilestoneCompletion = async (index, completed) => {
  try {
    // Get the current milestone to preserve all its properties
    const currentMilestone = selectedGoal.milestones[index];
    
    const res = await fetch(
      `http://localhost:8000/api/goals/${selectedGoal._id}/milestones/${index}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...currentMilestone,  // Include all existing milestone data
          completed  // Update just the completed status
        }),
      }
    );

    if (res.ok) {
      await fetchGoals();
    } else {
      alert("Could not update milestone.");
    }
  } catch (err) {
    console.error("Failed to update milestone:", err);
    alert("Something went wrong.");
  }
};

  const deleteMilestone = async (index) => {
    if (window.confirm("Are you sure you want to delete this milestone?")) {
      try {
        const res = await fetch(
          `http://localhost:8000/api/goals/${selectedGoal._id}/milestones/${index}`,
          {
            method: "DELETE",
          }
        );

        if (res.ok) {
          await fetchGoals();
        } else {
          alert("Failed to delete milestone.");
        }
      } catch (err) {
        console.error("Failed to delete milestone:", err);
        alert("Something went wrong.");
      }
    }
  };

  const startEditingMilestone = (index) => {
    setCurrentMilestoneIndex(index);
    setIsEditingMilestone(true);
  };

  const handleMilestoneSave = async (updatedMilestone) => {
    try {
      const method = currentMilestoneIndex === -1 ? "POST" : "PUT";
      const url = 
        currentMilestoneIndex === -1
          ? `http://localhost:8000/api/goals/${selectedGoal._id}/milestones`
          : `http://localhost:8000/api/goals/${selectedGoal._id}/milestones/${currentMilestoneIndex}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMilestone),
      });

      if (res.ok) {
        await fetchGoals();
        setIsEditingMilestone(false);
        setCurrentMilestoneIndex(null);
      } else {
        alert("Failed to save milestone.");
      }
    } catch (err) {
      console.error("Failed to save milestone:", err);
      alert("Something went wrong.");
    }
  };

  const addNewMilestone = () => {
    setCurrentMilestoneIndex(-1);
    setIsEditingMilestone(true);
  };

const handleGoalSave = async (updatedGoal) => {
    try {
      const res = await fetch(`http://localhost:8000/api/goals/${selectedGoal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedGoal),
      });

      if (res.ok) {
        await fetchGoals();
        setIsEditing(false);
      } else {
        alert("Failed to update goal.");
      }
    } catch (err) {
      console.error("Failed to update goal:", err);
      alert("Something went wrong.");
    }
  };
  useEffect(() => {
    fetchGoals();
  }, []);

  const handleVisualStyleChange = (goalId, style) => {
    setGoalVisualStyles(prev => ({ ...prev, [goalId]: style }));
  };

  const applyGlobalStyleToAll = (style) => {
    if (goals.length > 0) {
      const newStyles = {};
      goals.forEach(goal => {
        newStyles[goal._id] = style;
      });
      setGoalVisualStyles(newStyles);
    }
  };

  const renderVisualTracker = (goal) => {
    const completed = goal.milestones?.filter((m) => m.completed).length || 0;
    const total = goal.milestones?.length || 1;
    const progressPercent = Math.round((completed / total) * 100);

    const visualStyle = goalVisualStyles[goal._id] || globalVisualStyle;

    switch (visualStyle) {
      case "circular":
        return (
          <div className="w-48 h-48 mb-4">
            <CircularProgressbar
              value={progressPercent}
              text={`${progressPercent}%`}
              styles={buildStyles({
                textSize: "18px",
                pathColor: "#3b82f6",
                textColor: "#3b82f6",
                trailColor: "#d1d5db",
              })}
            />
          </div>
        );
      case "bar":
        return (
          <div className="w-full bg-gray-200 rounded h-6 mb-4">
            <div
              className="h-6 bg-blue-500 text-white text-sm text-center rounded"
              style={{ width: `${progressPercent}%` }}
            >
              {progressPercent}%
            </div>
          </div>
        );
      case "timeline":
        return (
          <div className="flex gap-4 mb-4 overflow-x-auto">
            {goal.milestones?.map((m, idx) => (
              <div key={idx} className="text-center">
                <div
                  className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                    m.completed ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                <p className="text-xs">{m.name}</p>
              </div>
            ))}
          </div>
        );
      case "doughnut":
        return (
          <div className="w-48 h-48 mb-4">
            <Doughnut
              data={{
                labels: ["Completed", "Remaining"],
                datasets: [
                  {
                    data: [completed, total - completed],
                    backgroundColor: ["#3b82f6", "#d1d5db"],
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        );
      case "barChart":
        return (
          <div className="w-full max-w-md mb-4">
            <Bar
              data={{
                labels: ["Completed", "Remaining"],
                datasets: [
                  {
                    label: "Milestones",
                    data: [completed, total - completed],
                    backgroundColor: ["#10b981", "#f87171"],
                  },
                ],
              }}
              options={{
                indexAxis: "y",
                plugins: { legend: { display: false } },
                scales: { x: { max: total } },
              }}
            />
          </div>
        );
      case "lineChart":
        return (
          <div className="w-full max-w-lg mb-4">
            <Line
              data={{
                labels: goal.milestones.map((m, i) => m.name || `M${i + 1}`),
                datasets: [
                  {
                    label: "Milestone Completion",
                    data: goal.milestones.map((m) => (m.completed ? 1 : 0)),
                    backgroundColor: "#3b82f6",
                    borderColor: "#3b82f6",
                    fill: false,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                scales: {
                  y: {
                    ticks: {
                      callback: (val) => (val === 1 ? "✅" : "❌"),
                      stepSize: 1,
                      max: 1,
                    },
                  },
                },
              }}
            />
          </div>
        );
      default:
        return <p className="text-sm text-red-500">Unknown tracker style selected.</p>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🎯 Goal Detail</h1>
        {!selectedGoal && (
          <select
            value={globalVisualStyle}
            onChange={(e) => {
              const newStyle = e.target.value;
              setGlobalVisualStyle(newStyle);
              applyGlobalStyleToAll(newStyle);
            }}
            className="border px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 appearance-none"
          >
            <option value="circular">Circular Progress</option>
            <option value="bar">Linear Bar</option>
            <option value="timeline">Timeline Flags</option>
            <option value="doughnut">Doughnut Chart</option>
            <option value="barChart">Bar Chart (Chart.js)</option>
            <option value="lineChart">Line Chart (Progress Over Time)</option>
          </select>
        )}
      </div>

      {!selectedGoal ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <div
              key={goal._id}
              className="border rounded shadow p-4 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setSelectedGoal(goal);
                if (!goalVisualStyles[goal._id]) {
                  handleVisualStyleChange(goal._id, globalVisualStyle);
                }
              }}
            >
              <h3 className="font-bold">{goal.title}</h3>
              <p className="text-sm text-gray-500">{goal.category}</p>
              <div className="mt-3">{renderVisualTracker(goal)}</div>
            </div>
          ))}
        </div>
      ) : isEditing ? (
        <GoalEditor
          goal={selectedGoal}
          onSave={handleGoalSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : isEditingMilestone ? (
        <MilestoneEditor
          milestone={
            currentMilestoneIndex === -1
              ? { name: "", description: "", start: "", end: "", completed: false }
              : selectedGoal.milestones[currentMilestoneIndex]
          }
          onSave={handleMilestoneSave}
          onCancel={() => {
            setIsEditingMilestone(false);
            setCurrentMilestoneIndex(null);
          }}
        />
      ) : (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setSelectedGoal(null)}
              className="text-blue-600 underline"
            >
              ← Back to all goals
            </button>
            <select
              value={goalVisualStyles[selectedGoal._id] || globalVisualStyle}
              onChange={(e) => handleVisualStyleChange(selectedGoal._id, e.target.value)}
              className="border px-2 py-1"
            >
              <option value="circular">Circular Progress</option>
              <option value="bar">Linear Bar</option>
              <option value="timeline">Timeline Flags</option>
              <option value="doughnut">Doughnut Chart</option>
              <option value="barChart">Bar Chart (Chart.js)</option>
              <option value="lineChart">Line Chart (Progress Over Time)</option>
            </select>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              className="bg-yellow-500 text-white px-3 py-1 rounded"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit Goal
            </button>
            <button
              className="bg-red-600 text-white px-3 py-1 rounded"
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this goal?")) {
                  const res = await fetch(
                    `http://localhost:8000/api/goals/${selectedGoal._id}`,
                    {
                      method: "DELETE",
                    }
                  );
                  if (res.ok) {
                    alert("Goal deleted.");
                    setSelectedGoal(null);
                    fetchGoals();
                  } else {
                    alert("Failed to delete goal.");
                  }
                }
              }}
            >
              🗑 Delete Goal
            </button>
          </div>

          <h2 className="text-3xl font-bold mb-2">{selectedGoal.title}</h2>
          <p className="text-gray-600 mb-1">
            <strong>Category:</strong> {selectedGoal.category}
          </p>
          <p className="text-gray-600 mb-1">
            <strong>Deadline:</strong> {selectedGoal.deadline}
          </p>
          <p className="text-gray-600 mb-4">
            <strong>Why:</strong> {selectedGoal.why}
          </p>
          <p className="mb-6">{selectedGoal.description}</p>

          {renderVisualTracker(selectedGoal)}

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">🎯 Milestones</h3>
              <button
                onClick={addNewMilestone}
                className="bg-green-500 text-white px-3 py-1 text-sm rounded"
              >
                + Add Milestone
              </button>
            </div>
            <ul className="space-y-2">
              {selectedGoal.milestones?.map((m, i) => (
                <li
                  key={i}
                  className={`p-3 border rounded ${
                    m.completed ? "bg-green-100" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{m.name}</div>
                      {m.description && (
                        <p className="text-sm text-gray-600 mt-1">{m.description}</p>
                      )}
                      {(m.start || m.end) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {m.start && `Start: ${m.start}`} {m.end && `• End: ${m.end}`}
                        </p>
                      )}
                      {m.completed && (
                        <span className="text-green-600 text-xs font-semibold">
                          ✅ Completed
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        className={`px-2 py-1 text-sm rounded ${
                          m.completed ? "bg-gray-300" : "bg-green-500 text-white"
                        }`}
                        onClick={() => toggleMilestoneCompletion(i, !m.completed)}
                      >
                        {m.completed ? "Undo" : "Done"}
                      </button>
                      <button
                        className="px-2 py-1 bg-blue-500 text-white text-sm rounded"
                        onClick={() => startEditingMilestone(i)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white text-sm rounded"
                        onClick={() => deleteMilestone(i)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {selectedGoal.behaviors?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">✅ Behaviors</h3>
              <ul className="list-disc list-inside text-gray-700">
                {selectedGoal.behaviors.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedGoal.reward && (
            <div className="mt-6 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
              🎁 <strong>Reward:</strong> {selectedGoal.reward}
            </div>
          )}
        </div>
      )}
    </div>
  );
}