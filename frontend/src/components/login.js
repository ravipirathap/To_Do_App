import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; 

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        email: email,
        password: password,
      };

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data.data);
        localStorage.setItem('token', data.data.token);
        if (data.data.user.role.name === 'admin') {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      } else {
        console.error("Login failed");
      }

      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    
      <div className="form-container-login">
        <h2 className='h2-login'>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-container-login">
            <label className='label-login'>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='input-login'
            />
          </div>
          <div className="input-container">
            <label className='label-login'>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='input-login'
            />
          </div>
          <button type="submit" className='button-login'>Login</button>
        </form>
      </div>
   
  );
};

export default LoginForm;
