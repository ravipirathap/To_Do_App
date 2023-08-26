import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import UpdateTaskFormModal from './updatetask';
import AddTaskFormModal from './addtask';
import './UserHome.css';

const socket = io('http://localhost:5000');

const UserHome = () => {
  const [userNotifications, setUserNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [TaskId, setTaskId] = useState(null);
 
  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/tasks', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  useEffect(() => {

    fetchTasks();

    socket.on('taskNotification', (data) => {
      setUserNotifications((prevNotifications) => [
        ...prevNotifications,
        data.message,
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  async function handleDelete(id) {
    try {
      await axios.delete(`http://localhost:5000/tasks/${id}`,
      {headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,}
      },
      );
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error(error);
    }
  }
  const showUpdateTaskModal = (taskId) => {
    setTaskId(taskId);
    setShowUpdateModal(true);
  };

  const showAddTaskModal = () => {
    setShowAddModal(true);
  };

  const hideModals = () => {
    setShowUpdateModal(false);
    setShowAddModal(false);
    setTaskId(null);
  };
  return (
    <div className="user-home">
      <h2 className='h2-user'>User Home</h2> 
      <div className='user-body'> 
      <ul className='ul-user-notification'>
        {userNotifications.map((notification, index) => (
          <li key={index}>{notification}</li>
        ))}
      </ul>
      <h3 className='h3-user'>Tasks</h3>
      <button className='button-user-newtask' onClick={showAddTaskModal}>New task</button>
      <ul className='ul-user-list'>
        {tasks.map((task) => (
          <>
          <li className='li-user-models' key={task._id}>{task.title}</li>
          <button className='button-user-update' onClick={() => showUpdateTaskModal(task._id)}>Update Task</button>
          <button className='button-user-delete' onClick={() => handleDelete(task._id)}>Delete Task</button>
          </>
        ))}
      </ul>
      <div className='models-form-add-update'>
      {showUpdateModal && (
        <UpdateTaskFormModal
          taskId={TaskId}
          onClose={hideModals}
          onUpdate={fetchTasks}
        />
      )}
      {showAddModal && (
        <AddTaskFormModal
          onClose={hideModals}
          onAdd={fetchTasks}
        />
      )}
      </div>
      </div>
    </div>
  );
};

export default UserHome;
