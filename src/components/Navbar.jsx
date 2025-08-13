import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import axios from 'axios';
import { useTheme } from '../Context';
import { useAuth } from '../context/AuthContext';

function Navbar({ pageTitle}) { 
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const navigate = useNavigate();
  const { toggleSidebar, isSidebarOpen } = useTheme();
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/${user.role}/logout`,
      {},
      {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data) {
      logout(); 
      navigate('/');
    }
  } catch (error) {
    // console.error('Logout error:', error);
    navigate('/');
  }
};

  return (
    <header className="dashboard-header">
      <button
        className="menu-btn"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <h1>{pageTitle}</h1>
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