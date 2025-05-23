import { useState } from "react";

export default function GoalEditor({ goal, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: goal.title || "",
    category: goal.category || "",
    description: goal.description || "",
    deadline: goal.deadline || "",
    why: goal.why || "",
    reward: goal.reward || "",
    behaviors: goal.behaviors?.join("\n") || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      behaviors: formData.behaviors.split("\n").filter(b => b.trim() !== ""),
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">
        {goal._id ? "Edit Goal" : "Add New Goal"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows="3"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Deadline</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Why is this important?</label>
          <textarea
            name="why"
            value={formData.why}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows="2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Reward</label>
          <input
            type="text"
            name="reward"
            value={formData.reward}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Behaviors (one per line)</label>
          <textarea
            name="behaviors"
            value={formData.behaviors}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows="3"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}