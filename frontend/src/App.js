import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SignupForm from './components/signup';
import LoginForm from './components/login';
import AdminDashboard from './components/admindashboard';
import UserHome from './components/userhome';
import AddTaskForm from './components/addtask';
import UpdateTaskForm from './components/updatetask';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserHome />}/>
        <Route path="/addtask" element={<AddTaskForm />}/>
        <Route path="/updatetask/:id" element={<UpdateTaskForm/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
