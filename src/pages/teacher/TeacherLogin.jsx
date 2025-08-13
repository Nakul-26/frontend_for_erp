import React, { useState } from 'react';
import '../../styles/Login.css';
import { FaUser, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function TeacherLogin() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/teacher/login`,
        { id: userId, "password":password },
        { withCredentials: true }
      );

      console.log('Login Response:', response);

      if (response.data.statusCode == 200) {
        const userData = { ...response.data.data, role: 'teacher' };
        login(userData);
        navigate('/teacher/dashboard');
      } else {
        setError(response.data.message);
      }
    } catch (err) { 
      // console.error('Login Error:', err);
      if (err.response) {
        setError(err.response.data.message || 'Login failed. Please check your inputs.');
      } else if (err.request) {
        setError('No response from server. Please check your network or try again later.');
      } else {
        setError('An unexpected error occurred during login.');
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
              placeholder="Teacher ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
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

export default TeacherLogin;