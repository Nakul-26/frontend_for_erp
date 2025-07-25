import React, { useState, useEffect, lazy, Suspense } from 'react';
import { FaIdCard, FaUser, FaEnvelope, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';
import '../../styles/Dashboard.css';

const Sidebar = lazy(() => import('../../components/Sidebar'));
const Navbar = lazy(() => import('../../components/Navbar'));

function AdminDashboard() {
  const [adminData, setAdminData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Check localStorage first
        const storedData = JSON.parse(localStorage.getItem('admindata'));
        if (storedData) {
          setAdminData(storedData);
          return;
        }
      } catch (error) {
        console.error('Error Admin teacher data:', error);
      }
    };

    fetchAdminData();
  }, []);

  const stats = [
    { icon: <FaIdCard />, title: 'Admin ID', value: adminData?.id || '-' },
    { icon: <FaUser />, title: 'Name', value: adminData?.Name || '-' },
    { icon: <FaEnvelope />, title: 'Email', value: adminData?.email || '-' },
    { icon: <FaShieldAlt />, title: 'Role', value: adminData?.isAdmin ? 'Admin' : 'Non-Admin' },
  ];

  const upcomingEvents = [
    { time: '10:00 AM', event: 'Staff Meeting', location: 'Conference Room' },
    { time: '12:00 PM', event: 'Parent-Teacher Conference', location: 'Auditorium' },
    { time: '03:00 PM', event: 'System Maintenance', location: 'IT Department' },
  ];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="dashboard-container">
        <Sidebar adminData={adminData} isOpen={isSidebarOpen} />
        <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
          <Navbar role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
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
                <button>Manage Users</button>
                <button>Generate Reports</button>
                <button>View Analytics</button>
                <button>System Settings</button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </Suspense>
  );
}

export default AdminDashboard;
