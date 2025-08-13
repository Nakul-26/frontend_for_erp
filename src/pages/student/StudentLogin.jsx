// src/pages/StudentLogin.jsx
import React, { useState } from 'react';
import '../../styles/Login.css';
import { FaUser, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StudentLogin() {
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/student/login`,
        { rollno: rollNo, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        navigate('/student/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Invalid credentials');
      } else {
        setError('Invalid credentials');
      }
    }
  };

  return (
    <div className="login2-background">
      <div className="login2-container">
        <div className="avatar2">
          <FaUser size={40} color="#fff" />
        </div>
        <form className="login2-form" onSubmit={handleSubmit}>
          <div className="input2-group">
            <FaUser className="input2-icon" />
            <input
              type="text"
              placeholder="Roll No"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
            />
          </div>
          <div className="input2-group">
            <FaLock className="input2-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <div className="login2-options">
            <a href="#">Forgot Password?</a>
          </div>
          <button type="submit" className="login2-button">LOGIN</button>
        </form>
      </div>
    </div>
  );
}

export default StudentLogin;