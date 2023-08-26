import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UpdateTaskForm.css"; // Import your custom CSS file for styling

const UpdateTaskForm = ({ taskId, onClose, onUpdate }) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTask(taskId);
  }, [taskId]);

  const fetchTask = async (taskId) => {
    try {
      const response = await axios.get(`http://localhost:5000/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const task = response.data;
      setTitle(task.title);
      setPriority(task.priority);
      setDone(task.done);
    } catch (error) {
      setError("Error fetching task");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`http://localhost:5000/tasks/${taskId}`, { title, priority, done }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.status === 200) {
        onUpdate();
        onClose();
        setError("");
        setSuccess(true);
      }
    } catch (error) {
      setError("Error updating task");
      setSuccess(false);
    }
  };

  return (
    <div className="update-task-form">
      <h2 className="h2-update-form">Update Task</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Task updated successfully!</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group-update-form">
          <label className="label-update-form">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-update-form"
            required
          />
        </div>
        <div className="form-group-update-form">
          <label className="label-update-form">Priority:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="">Select Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group-update-form">
          <label className="label-update-form">Done:</label>
          <input
            type="checkbox"
            checked={done}
            onChange={(e) => setDone(e.target.checked)}
            className="input-update-form"
          />
        </div>
        <button className="cancel-button-update-form button-update-form" onClick={onClose}>Cancel</button>
        <button className="update-button-update-form button-update-form" type="submit">Update Task</button>
      </form>
    </div>
  );
};

export default UpdateTaskForm;
