import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css';
import TeacherSidebar from '../../components/TeacherSidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function CreateAttendance() {
  const { user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [classes, setClasses] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState();
  const [todayTimetable, setTodayTimetable] = useState({});
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTimetableId, setSelectedTimetableId] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const today = new Date();
  const formatted = today.toISOString().split("T")[0];
  const todaysDay = new Date().getDay();
  const todayName = daysOfWeek[todaysDay];
  const [selectedDay, setSelectedDay] = useState(todayName);
  const [todayClasses, setTodayClasses] = useState([]);

  // Helper function to fetch classes
  const fetchInitialData = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    try {
      const classesRes = await axios.get(`${API_BASE_URL}/api/v1/teacher/${user._id}`, { withCredentials: true });
      console.log('Classes:', classesRes.data);
      if (classesRes.data.mapped) {
        const uniqueClassIds = new Set();
        const uniqueClasses = [];
        classesRes.data.mapped.forEach(mapping => {
          // Check if the class ID has already been added
          if (mapping.classId && !uniqueClassIds.has(mapping.classId._id)) {
            uniqueClassIds.add(mapping.classId._id);
            uniqueClasses.push(mapping.classId);
          }
        });
        setClasses(uniqueClasses);
      } else {
        throw new Error('Failed to fetch classes.');
      }
      
      // Fetch all time slots
      const timeSlotsRes = await axios.get(`${API_BASE_URL}/api/v1/teacher/getallslots`, { withCredentials: true });
      console.log('Time Slots:', timeSlotsRes.data);
      if (timeSlotsRes.data) {
        setTimeSlots(timeSlotsRes);
      } else {
        throw new Error('Failed to fetch time slots.');
      }
    } catch (err) {
      setError('Failed to load initial data.');
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchInitialData();
  }, [user?._id, API_BASE_URL]);

  // Fetch timetables when a class is selected
  useEffect(() => {
    const fetchTimetables = async () => {
      if (!selectedClassId) {
        setTimetables([]);
        setSelectedTimetableId('');
        setSelectedPeriodId('');
        return;
      }
      try {
        setLoading(true);
        const res2 = await axios.get(`${API_BASE_URL}/api/v1/teacher/getalldailyschedules/${selectedClassId}`, { withCredentials: true });
        console.log('Fetched Timetables:', res2);
        setTimetables(res2.data.data);
      } catch (err) {
        setError('Failed to fetch timetables for the selected class.');
      } finally {
        setLoading(false);
      }

    };
    fetchTimetables();
    
  }, [selectedClassId, API_BASE_URL]);

  useEffect(() => {
    const filterTimetables = () => {
      try {
        console.log("4 time tables : ", timetables);
        console.log("today's day", todayName);
        const filteredTimetable = timetables.filter(
          tt => tt.day.toLowerCase() === todayName.toLowerCase()
        );
        console.log("filtered time table - day - ",filteredTimetable);
        setTodayTimetable(filteredTimetable);
      } catch (err) {
        console.log("error occured when filtering timetables: ", err);
      }
    }
    filterTimetables();
  }, [timetables]);

  useEffect(() => {
    const filterPeriods = () => {
      try {
        const periodsInTimeTable = todayTimetable[0].periods.filter(item => item.mapped !== null).map(item => item.period);
        const filteredPeriods = (timeSlots.data).filter(ts => periodsInTimeTable.some(pt => pt._id === ts._id));
        setTodayClasses(filteredPeriods);
      } catch (err) {
        console.log("error occured when filtering classes: ", err);
      }
    }
    filterPeriods();
  }, [timeSlots, todayTimetable]);

  //fetch all students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId) {
        setStudents([]);
        setAttendanceRecords({});
        return;
      }
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const studentsResponse = await axios.get(`${API_BASE_URL}/api/v1/teacher/class/${selectedClassId}/students`, { withCredentials: true });
        console.log('Fetched Students:', studentsResponse.data);
        if (studentsResponse.data.success) {
          const fetchedStudents = studentsResponse.data.data;
          setStudents(fetchedStudents);
          const initialAttendance = {};
          fetchedStudents.forEach(student => {
            initialAttendance[student._id] = { status: 'present', remarks: '' };
          });
          setAttendanceRecords(initialAttendance);
        } else {
          throw new Error('Failed to fetch students.');
        }
      } catch (err) {
        setError('Failed to load students for this class.');
        setStudents([]);
        setAttendanceRecords({});
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClassId, API_BASE_URL]);

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setSelectedTimetableId('');
    setSelectedPeriodId('');
  };

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendanceRecords(prevRecords => ({
      ...prevRecords,
      [studentId]: {
        ...prevRecords[studentId],
        [field]: value,
      },
    }));
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!selectedClassId || !selectedTimetableId || !selectedPeriodId) {
      setError('Please select a class, timetable, and period.');
      setLoading(false);
      return;
    }

    // Filter for absent students and map their MongoDB _ids
    // The attendanceRecords state uses student._id as the key, so we must use that here.
    const absentStudents = students
      .filter(student => attendanceRecords[student.rollno]?.status === 'absent') // <-- CORRECTED
      .map(student => student.rollno); // <-- This should also use _id, not rollno, to match backend validation

    const attendancePayload = {
      classId: selectedClassId,
      date: date,
      absent: absentStudents, // <-- CORRECTED: This should be the direct array of IDs
      timetableId: selectedTimetableId,
      period: selectedPeriodId,
      markedBy: user._id
    };

    console.log('Attendance Payload:', attendancePayload);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/attendance/create`,
        attendancePayload,
        { withCredentials: true }
      );

      console.log('4Attendance Response:', response.data);

      if (response.data.success) {
        setSuccess('3Student attendance marked successfully!');
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('!!!!Error marking attendance:', err);
      const errorMessage = err.response?.data?.error?.errors?.[0]?.message || err.response?.data?.message || '2Failed to mark attendance. Please try again.';
      setError("1"+errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="dashboard-container">
      <TeacherSidebar />
      <main className="main-content">
        <Navbar pageTitle="Mark Student Attendance" />
        <div className="form-container" style={{ width: '100%', maxWidth: '100%', margin: '0 auto', background: 'var(--surface)', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px var(--border-color)' }}>
          {/* <h2 style={{ marginBottom: 24, color: 'var(--primary)', fontWeight: 700 }}>Mark Student Attendance</h2> */}
          <form onSubmit={handleSubmitAttendance}>
            <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              <div>
                <label htmlFor="date-select" style={{ marginRight: '10px', fontWeight: 500 }}>Date:</label>
                <input
                  type="date"
                  id="date-select"
                  value={formatted}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled
                  readOnly
                  style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--input-background)', color: 'var(--input-text)' }}
                />
              </div>

              <div>
                <label htmlFor="class-select" style={{ marginRight: '10px', fontWeight: 500 }}>Select Class:</label>
                <select
                  id="class-select"
                  value={selectedClassId}
                  onChange={handleClassChange}
                  required
                  style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', minWidth: 180, background: 'var(--input-background)', color: 'var(--input-text)' }}
                >
                  <option value="">-- Select Class --</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.classId} ({cls.section})
                    </option>
                  ))}
                </select>
              </div>
              {timetables.length > 0 && (
                <div>
                  <label htmlFor="timetable-select" style={{ marginRight: '10px', fontWeight: 500 }}>Day:</label>
                  <input 
                    type="text"
                    id="timetable-select" 
                    value={todayName}
                    onChange={(e) => {
                      setSelectedTimetableId(e.target.value)
                      setSelectedDay(e.target.value)
                    }}
                    required
                    disabled
                    readOnly
                    style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--input-background)', color: 'var(--input-text)' }}
                  />
                </div>
              )}
              {timetables && selectedClassId && (
                <div>
                  <label htmlFor="period-select" style={{ marginRight: '10px', fontWeight: 500 }}>Select Period:</label>
                  <select
                    id="period-select"
                    value={selectedPeriodId}
                    onChange={(e) => setSelectedPeriodId(e.target.value)}
                    required
                    style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', minWidth: 180, background: 'var(--input-background)', color: 'var(--input-text)' }}
                  >
                    <option value="">-- Select Period --</option>
                      {todayClasses.map(tc => 
                        <option key={tc._id} value="tc._id">{tc.period}</option>
                      )}
                  </select>
                </div>
              )}
            </div>

            {loading && <p style={{ textAlign: 'center', fontSize: '18px', color: 'var(--text-muted, #666)' }}>Loading...</p>}
            {error && <div className="error-message" style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'var(--success)', textAlign: 'center', marginBottom: '20px' }}>{success}</div>}

            {students.length > 0 && !loading && (
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--text)', fontWeight: 600 }}>Students in {classes.find(cls => cls._id === selectedClassId)?.classId}</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', background: 'var(--card-background)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text)' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>Roll No.</th>
                        <th style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>Student Name</th>
                        <th style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.rollno} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                          <td style={{ padding: '10px' }}>{student.rollno}</td>
                          <td style={{ padding: '10px' }}>{student.name}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <select
                              value={attendanceRecords[student.rollno]?.status || 'present'}
                              onChange={(e) => handleAttendanceChange(student.rollno, 'status', e.target.value)}
                              style={{ padding: '6px', borderRadius: 4, border: '1px solid var(--border-color)', background: 'var(--input-background)', color: 'var(--input-text)' }}
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="leave">Leave</option>
                            </select>
                          </td>
                          <td style={{ padding: '10px' }}>
                            <input
                              type="text"
                              value={attendanceRecords[student.rollno]?.remarks || ''}
                              onChange={(e) => handleAttendanceChange(student.rollno, 'remarks', e.target.value)}
                              placeholder="Remarks"
                              style={{ padding: '6px', borderRadius: 4, border: '1px solid var(--border-color)', width: '100%', background: 'var(--input-background)', color: 'var(--input-text)' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="submit"
                  className="login-button"
                  style={{ marginTop: '25px', padding: '12px 25px', background: 'var(--primary)', color: 'var(--text-light)', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                  disabled={loading || students.length === 0}
                >
                  {loading ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </div>
            )}
            {selectedClassId && !loading && students.length === 0 && !error && (
              <p style={{ textAlign: 'center', fontSize: '18px', color: 'var(--text-muted, #666)' }}>No students found for this class.</p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateAttendance;