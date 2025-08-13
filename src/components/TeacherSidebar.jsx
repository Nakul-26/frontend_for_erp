// src/components/TeacherSidebar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';
import { useAuth } from '../context/AuthContext';

function TeacherSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
      {/* <button className="toggle-button" onClick={toggleSidebar}>
        {isSidebarOpen ? '◄' : '►'}
      </button> */}
      <div className="profile-section">
        <div className="profile-image">{user?.name?.charAt(0) || 'T'}</div>
        <h3>{user?.name || 'Loading...'}</h3>
        <p>{user?.email || 'Loading...'}</p>
      </div>
      <nav className="sidebar-nav">
        <Link to="/teacher/dashboard" data-icon="🏠">Dashboard</Link>
{/*         <Link to="/teacher/timetable" data-icon="📅">Timetable</Link> */}
        {/* New link for attendance */}
{/*         <Link to="/teacher/studentattendance" data-icon="✔️">Take Attendance</Link> */}
{/*         <Link to="/teacher/attendance/history" data-icon="📝">Attendance History</Link> Keep this for history view */}
{/*         <Link to="/teacher/grades" data-icon="📊">Grades</Link> */}
        <Link to="/teacher/change-password" data-icon="🔒">Change Password</Link>
        <Link to="/teacher/schedule" data-icon="📅">View Schedule</Link>
        {/* <Link to="/teacher/settings" data-icon="⚙️">Settings</Link> */}
        <Link to="/teacher/create-attendance" data-icon="📝">Create Attendance</Link>
{/*         <Link to="/teacher/settings" data-icon="⚙️">Settings</Link> */}
      </nav>
    </aside>
  );
}

export default TeacherSidebar;