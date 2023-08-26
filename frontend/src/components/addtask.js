import React, { useState } from "react";
import axios from "axios";
import "./AddTaskForm.css"; // Import your custom CSS file for styling

const AddTaskForm = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/tasks", { title, priority }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.status === 201) {
        setSuccess(true);
        setError("");
        setTitle("");
        setPriority("");
        onAdd();
        onClose();
      }
    } catch (error) {
      setError("Error creating task");
      setSuccess(false);
    }
  };

  return (
    <div className="add-task-form-user">
      <h2 className="h2-model">Add Task</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Task added successfully!</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group-model">
          <label className="label-model">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-model"
            required
          />
        </div>
        <div className="form-group-model">
          <label className="label-model">Priority:</label>
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
        <button className="cancel-button-model button-model" onClick={onClose}>Cancel</button>
        <button className="add-button-model button-model" type="submit">Add Task</button>
      </form>
    </div>
  );
};

export default AddTaskForm;
