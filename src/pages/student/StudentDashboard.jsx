import React, { useState, useEffect } from 'react';
import { FaIdCard, FaUser, FaEnvelope, FaChalkboard } from 'react-icons/fa';
import '../../styles/Dashboard.css';
import StudentSidebar from '../../components/StudentSidebar';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function StudentDashboard() {
  const [studentData, setStudentData] = useState(null);
  const { user } = useAuth();
  const studentId = user?.id;

  const stats = [
    { icon: <FaIdCard />, title: 'Roll No', value: studentData?.rollno || '-' },
    { icon: <FaUser />, title: 'Name', value: studentData?.name || '-' },
    { icon: <FaEnvelope />, title: 'Email', value: studentData?.email || '-' },
    { icon: <FaChalkboard />, title: 'Class', value: studentData?.Class || '-' },
  ];

  const mockAttendance = [
    { date: '2025-05-12', status: 'Present' },
    { date: '2025-05-11', status: 'Absent' },
  ];

  return (
    <div className="dashboard-container">
      <StudentSidebar studentData={studentData} />
      <main className="main-content">
        <Navbar role="student" />
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
            <h2>Attendance</h2>
            <div className="schedule-list">
              {mockAttendance.map((record, index) => (
                <div key={index} className="schedule-item">
                  <div className="time">{record.date}</div>
                  <div className="class-info">
                    <h4>{record.status}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button>View Timetable</button>
              <button>Check Grades</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;