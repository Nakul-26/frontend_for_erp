import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import axios from 'axios';
import { useTheme } from '../ThemeContext';

function Navbar({ role, pageTitle }) {
  const { toggleSidebar } = useTheme();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/admin/logout`, 
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data) {
        localStorage.clear();
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <header className="dashboard-header">
      <button
        // className="menu-btn"
        onClick={toggleSidebar}
        // aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <h1> {pageTitle}</h1>
      <div className="header-actions">
        <button className="profile-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div
        className={`sidebar-overlay ${isOverlayOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
      ></div>
    </header>
  );
}

export default Navbar;