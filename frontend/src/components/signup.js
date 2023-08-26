import React, { useState } from 'react';
import './SignupForm.css'; 

const SignupForm = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        full_name: fullname,
        email: email,
        password: password,
      };

      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("User registered successfully");
      } else {
        console.error("Registration failed");
      }

      setFullname('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <div className="form-container-signup">
      <h2 className='h2-signup'>Sign Up</h2>
      <form onSubmit={handleSignup}>
      <label className='label-signup'>Full name</label>
        <input
          type="text"
          placeholder="Enter you full Name"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          className='input-signup'
        />
      <label className='label-signup'>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='input-signup'
        />
      <label className='label-signup'>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='input-signup'
        />
        <button type="submit" className='button-signup'>Sign Up</button>
      </form>
    </div>
  );
};

export default SignupForm;
