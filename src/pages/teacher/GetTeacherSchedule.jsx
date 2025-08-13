import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TeacherSidebar from '../../components/TeacherSidebar';
import Navbar from '../../components/Navbar';
import '../../styles/Dashboard.css'; // Common styles
import { useAuth } from '../../context/AuthContext';

function GetTeacherSchedule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchTeacherSchedule = async () => {
    if (!user?._id) {
      setError('User ID not found. Please log in again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/teacher/schedule/${user._id}`,
        { withCredentials: true }
      );
      setSchedule(response.data.data || []);
    } catch (err) {
      // console.error('Failed to fetch teacher schedule:', err);
      setError('Failed to fetch your schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherSchedule();
  }, [user?._id, API_BASE_URL]);

  // Function to render the schedule based on fetched data
  const renderSchedule = () => {
    if (loading) {
      return <p>Loading schedule...</p>;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }
    if (schedule.length === 0) {
      return <p>No schedule found.</p>;
    }

    return (
      <div className="schedule-list">
        {schedule.map((dayEntry, dayIndex) => (
          <div key={dayIndex} className="schedule-day-entry">
            <h3 className="day-header">{dayEntry.day}</h3>
            <div className="day-periods">
              {dayEntry.periods.map((periodEntry, periodIndex) => (
                <div key={periodIndex} className="period-item">
                  <div className="period-time">
                    {periodEntry.period.period}: {periodEntry.period.startTime} - {periodEntry.period.endTime}
                  </div>
                  {/* Check if mapped and subjectId exist before accessing */}
                  {periodEntry.mapped?.subjectId && (
                    <div className="period-subject">
                      Subject: {periodEntry.mapped.subjectId.subjectName}
                    </div>
                  )}
                  {dayEntry.classId?.classId && (
                    <div className="period-class">
                      Class: {dayEntry.classId.classId}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <hr /> {/* Add a separator between days */}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <TeacherSidebar />
      <main className="main-content">
        <Navbar pageTitle="My Schedule" />
        <button onClick={fetchTeacherSchedule}>Refresh Schedule</button>
        <div className="schedule-section">
          <h2>My Schedule</h2>
          {renderSchedule()}
        </div>
      </main>
    </div>
  );
}

export default GetTeacherSchedule;