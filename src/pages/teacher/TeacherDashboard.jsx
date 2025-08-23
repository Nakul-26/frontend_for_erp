import React, { useState, useEffect } from 'react';
import { FaIdCard, FaUser, FaEnvelope, FaBook, FaChalkboard } from 'react-icons/fa';
import axios from 'axios';
import '../../styles/Dashboard.css';
import Sidebar from '../../components/TeacherSidebar';
import Navbar from '../../components/Navbar';
import TeacherSidebar from '../../components/TeacherSidebar';
import { useAuth } from '../../context/AuthContext';

function TeacherDashboard() {
  const { user } = useAuth();

  // useEffect(() => {
  //   const fetchTeacherData = async () => {
  //     try {
  //       // Check localStorage first
  //       const storedData = JSON.parse(localStorage.getItem('teacherData'));
  //       if (storedData) {
  //         setTeacherData(storedData);
  //         return;
  //       }

  //       // Fetch from backend
  //       const response = await axios.get('https://your-backend-domain.com/teacher/profile', {
  //         withCredentials: true,
  //       });
  //       const data = response.data.data;
  //       setTeacherData(data);
  //       localStorage.setItem('teacherData', JSON.stringify(data));
  //     } catch (error) {
  //       console.error('Error fetching teacher data:', error);
  //     }
  //   };

  //   fetchTeacherData();
  // }, []);

  const stats = [
    { icon: <FaIdCard />, title: 'Teacher ID', value: user?.id || '-' },
    { icon: <FaUser />, title: 'Name', value: user?.name || '-' },
    { icon: <FaEnvelope />, title: 'Email', value: user?.email || '-' },
    { icon: <FaBook />, title: 'Subjects', value: user?.subjects?.join(', ') || '-' },
    { icon: <FaChalkboard />, title: 'Classes', value: user?.classes?.join(', ') || '-' },
  ];

  const upcomingEvents = [
    { time: '09:00 AM', event: 'Math Class', location: 'Room 101' },
    { time: '11:00 AM', event: 'Science Lab', location: 'Lab B' },
    { time: '02:00 PM', event: 'Faculty Meeting', location: 'Conference Room' },
  ];

  return (
    <div className="dashboard-container">
      <TeacherSidebar />
      <main className="main-content">
        <Navbar pageTitle={"Dashboard"} />
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
            <h2>Upcoming Events</h2>
            <div className="schedule-list">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="schedule-item">
                  <div className="time">{event.time}</div>
                  <div className="class-info">
                    <h4>{event.event}</h4>
                    <p>{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button>View Schedule</button>
              <button>Grade Students</button>
              <button>Mark Attendance</button>
              <button>Change Password</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default TeacherDashboard;