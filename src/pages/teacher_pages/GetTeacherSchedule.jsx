import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TeacherSidebar from '../../components/TeacherSidebar';
import Navbar from '../../components/Navbar';
import '../../styles/Dashboard.css';
import { useAuth } from '../../context/AuthContext';

function GetTeacherSchedule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [timeSlots, setTimeSlots] = useState([]);
  const [classesAndSubjects, setClassesAndSubjects] = useState([]);
  const [subject, setSubject] = useState('');
  const [classinfo, setClassinfo] = useState({});

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
      console.log('Fetched teacher schedule:', response.data.data);
      setSchedule(response.data.data);
    } catch (err) {
      console.error('Failed to fetch teacher schedule:', err);
      setError('Failed to fetch your schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

    const fetchTimeSlots = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/teacher/getallslots`, { withCredentials: true });
      console.log('Time slots fetched:', res.data);
      setTimeSlots(res.data);
    } catch (err) {
      setError('Failed to fetch time slots.');
      // console.error(err);
    }
  };

  const fetchTeacherClassAndSubjectInfo = async () => {
    if (!user?.id) {
      setError('User not authenticated. Please log in.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/teacher/${user._id}`,
        { withCredentials: true }
      );
      console.log('Fetched classes and subjects:', response.data.mapped);
      if (response.data.mapped) {
        setClassesAndSubjects(response.data.mapped);
      } else {
        throw new Error('Failed to fetch classes and subjects.');
      }
    } catch (err) {
      console.error('Error fetching teacher classes and subjects:', err);
      setError('Failed to load your classes and subjects . Please try again.');
      // setClassesAndSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to render the schedule based on fetched data
  const renderSchedule = () => {
    if (loading) {
      return <p>Loading schedule...</p>;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }
    if (schedule.length === 0 || !schedule[0]?.periods) {
      return <p>No schedule found.</p>;
    }

    console.log('timeSlots:', timeSlots);

    // Create a time slot map for quick lookup
    const timeSlotMap = timeSlots.reduce((map, slot) => {
      map[slot._id] = slot;
      return map;
    }, {});

    // Create a classes and subjects map for quick lookup
    const mappedInfoMap = classesAndSubjects.reduce((map, mappedItem) => {
        map[mappedItem._id] = mappedItem;
        return map;
    }, {});

    // Extract period names for the table header from the first day
    const periodsHeader = schedule[0].periods.map(period => {
        const timeSlot = timeSlotMap[period.period];
        return timeSlot ? timeSlot.period : '';
    });

    return (
        <div className="schedule-table-container">
            <table className="schedule-table">
                <thead>
                    <tr>
                        <th>Day</th>
                        {periodsHeader.map((periodName, index) => (
                            <th key={index}>{periodName}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {schedule.map((dayEntry) => (
                        <tr key={dayEntry._id}>
                            <td>{dayEntry.day}</td>
                            {dayEntry.periods.map((periodEntry) => {
                                const mappedInfo = mappedInfoMap[periodEntry.mapped];
                                const isTeacherAssigned = mappedInfo?.teacherId === user._id;

                                return (
                                    <td key={periodEntry._id}>
                                        {isTeacherAssigned && mappedInfo ? (
                                            <>
                                                <div className="subject-name">{mappedInfo.subjectId.name}</div>
                                                <div className="class-id">({mappedInfo.classId.classId})</div>
                                            </>
                                        ) : (
                                            <div className="empty-slot">-</div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


    





  useEffect(() => {
    fetchTimeSlots();
    fetchTeacherClassAndSubjectInfo();
    fetchTeacherSchedule();
  }, [user?._id, API_BASE_URL]);

  return (
    <div className="dashboard-container">
      <TeacherSidebar />
      <main className="main-content">
        <Navbar pageTitle="My Schedule" />
        <button onClick={fetchTeacherSchedule}>Refresh Schedule</button>
        <div className="schedule-section">
          {/* {error && <p className="error-message">{error}</p>} */}
          {renderSchedule()}
        </div>
      </main>
    </div>
  );
}

export default GetTeacherSchedule;