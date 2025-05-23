// src/pages/Progress.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function Progress() {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
    fetchTasks();
  }, []);

  const fetchGoals = async () => {
    const res = await fetch('http://localhost:8000/api/goals');
    const data = await res.json();
    setGoals(data);
  };

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:8000/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const getGoalProgress = (goal) => {
    const completed = goal.milestones?.filter(m => m.completed)?.length || 0;
    const total = goal.milestones?.length || 1;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📈 Progress Dashboard</h2>

      <section className="mb-12">
        <h3 className="text-xl font-semibold mb-4">🎯 Goal Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => (
            <div
              key={goal._id}
              className="border p-4 rounded shadow hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/goals/${goal._id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16">
                  <CircularProgressbar
                    value={getGoalProgress(goal)}
                    text={`${getGoalProgress(goal)}%`}
                    styles={buildStyles({ pathColor: '#3b82f6', textColor: '#111' })}
                  />
                </div>
                <div>
                  <h4 className="font-bold">{goal.title}</h4>
                  <p className="text-sm text-gray-500">
                    {goal.milestones?.length || 0} milestones, {goal.behaviors?.length || 0} behaviors
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">✅ Task Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => (
            <div
              key={task._id}
              className="border p-4 rounded shadow hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/tasks/${task._id}`)}
            >
              <h4 className="font-bold">{task.title || task.name}</h4>
              <p className="text-sm text-gray-500">
                {task.category} | {task.frequency} | {task.duration_minutes} min
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
