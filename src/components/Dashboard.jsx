import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaCalendarAlt, FaChalkboardTeacher, FaBook } from 'react-icons/fa';
import '../styles/Dashboard.css';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useTheme } from '../../ThemeContext';
import React from 'react';

function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => {
    // Get teacher data from localStorage
    const data = JSON.parse(localStorage.getItem('teacherData'));
    if (data) {
      setTeacherData(data);
    }
  }, []);

  const stats = [
    { icon: <FaUserGraduate />, title: "ID", value: teacherData?.id || '-' },
    { icon: <FaCalendarAlt />, title: "Joined Date", value: teacherData ? new Date(teacherData.dateofjoining).toLocaleDateString() : '-' },
    { icon: <FaChalkboardTeacher />, title: "Classes", value: teacherData?.classes?.length || 0 },
    { icon: <FaBook />, title: "Subjects", value: teacherData?.subjects?.length || 0 }
  ];

  const upcomingClasses = [
    { time: "09:00 AM", subject: "Database Management", class: "CS-301" },
    { time: "11:00 AM", subject: "Web Development", class: "CS-401" },
    { time: "02:00 PM", subject: "Data Structures", class: "CS-201" }
  ];

  return (
    <div className="dashboard-container" data-theme={theme}>
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}> 
        <Navbar role="admin" />
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000 }}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <div className="dashboard-container">
          <Sidebar teacherData={teacherData} />
          <main className="main-content">
            <Navbar />
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-info">
                    <h3>{stat.value}</h3>
                    <p>{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="dashboard-grid">
              <section className="schedule-section">
                <h2>Today's Schedule</h2>
                <div className="schedule-list">
                  {upcomingClasses.map((class_, index) => (
                    <div key={index} className="schedule-item">
                      <div className="time">{class_.time}</div>
                      <div className="class-info">
                        <h4>{class_.subject}</h4>
                        <p>{class_.class}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                  <button>Take Attendance</button>
                  <button>Add Grades</button>
                  <button>Schedule Class</button>
                  <button>Generate Report</button>
                </div>
              </section>
            </div>
          </main>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;