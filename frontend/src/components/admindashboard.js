import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './AdminDashboard.css'; 

const socket = io('http://localhost:5000');

const AdminDashboard = () => {
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const fetchTasks = async (user_id = null) => {
    const apiUrl = user_id
      ? `http://localhost:5000/tasks?user_id=${user_id}`
      : 'http://localhost:5000/tasks';
  
    try {
      const response = await axios.get(apiUrl, {
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
   
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchTasks();
    fetchUsers();

    socket.on('adminNotification', (data) => {
      setAdminNotifications((prevNotifications) => [
        ...prevNotifications,
        data.message,
      ]);
      console.log(data)
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="admin-dashboard">
      <h2 className='h2-admin'>Admin Dashboard</h2>
      <ul >
        {adminNotifications.map((notification, index) => (
          <li key={index}>{notification}</li>
        ))}
      </ul>
      <div className='task-user'>
      <div className="tasks-section">
      <h3 className='h3-task-admin'>Tasks</h3>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>{task.title}</li>
        ))}
      </ul>
      </div>
      <div className="users-section">
      <h3 className='h3-task-admin'>Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user._id} className='user-li-admin'>
            {user.username} ({user.email})
            <ul>
              <button className='button-admin' onClick={()=>{fetchTasks(user._id)}}>Tasks</button>
              {Object.entries(user.taskCounts).map(([priority, count]) => (
                <li className='li-admin' key={priority}>
                  {priority} priority: {count}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
