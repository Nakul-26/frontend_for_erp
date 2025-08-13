import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css'; // Reusing existing dashboard styles
import TeacherSidebar from '../../components/TeacherSidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function CreateAttendance() {
  const { user } = useAuth(); // Get the logged-in teacher's info
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: { status, remarks } }
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Current date in YYYY-MM-DD format

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
 
  // 1. Fetch classes assigned to the teacher
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!user?.id) {
        setError('User not authenticated. Please log in.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/teacher/my-classes`, // Assumed endpoint for teacher's classes
          { withCredentials: true }
        );
        if (response.data.success) {
          setClasses(response.data.data || []);
        } else {
          throw new Error('Failed to fetch classes.');
        }
      } catch (err) {
        // console.error('Error fetching teacher classes:', err);
        setError('Failed to load your classes. Please try again.');
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherClasses();
  }, [user?._id, API_BASE_URL]);

  // 2. Fetch students and existing attendance for the selected class and date
  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedClassId || !date) {
        setStudents([]);
        setAttendanceRecords({});
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');
      try {
        // Fetch students in the selected class
        const studentsResponse = await axios.get(
          `${API_BASE_URL}/api/v1/teacher/classes/${selectedClassId}/students`, // Assumed endpoint
          { withCredentials: true }
        );

        if (studentsResponse.data.success) {
          const fetchedStudents = studentsResponse.data.data;
          setStudents(fetchedStudents);

          // Initialize attendance records for all fetched students as absent by default
          const initialAttendance = {};
          fetchedStudents.forEach(student => {
            initialAttendance[student._id] = { status: 'absent', remarks: '' };
          });
          setAttendanceRecords(initialAttendance);

          // Try to fetch existing attendance for pre-filling
          const existingAttendanceResponse = await axios.get(
            `${API_BASE_URL}/api/v1/teacher/attendance/${selectedClassId}/${date}`, // Assumed endpoint
            { withCredentials: true }
          );

          if (existingAttendanceResponse.data.success && existingAttendanceResponse.data.data.length > 0) {
            const existingRecords = existingAttendanceResponse.data.data;
            const updatedAttendance = { ...initialAttendance };
            existingRecords.forEach(record => {
              if (updatedAttendance[record.studentId]) { // Ensure student exists
                updatedAttendance[record.studentId] = {
                  status: record.status,
                  remarks: record.remarks || ''
                };
              }
            });
            setAttendanceRecords(updatedAttendance);
          }
        } else {
          throw new Error('Failed to fetch students.');
        }
      } catch (err) {
        // console.error('Error fetching students or attendance:', err);
        setError('Failed to load students or attendance for this class.');
        setStudents([]);
        setAttendanceRecords({});
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [selectedClassId, date, API_BASE_URL]);

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setStudents([]); // Clear students when class changes
    setAttendanceRecords({}); // Clear attendance records
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

    if (!selectedClassId || students.length === 0) {
      setError('Please select a class and ensure students are loaded.');
      setLoading(false);
      return;
    }

    const attendancePayload = students.map(student => ({
      studentId: student._id,
      status: attendanceRecords[student._id]?.status || 'absent', // Default to absent if not marked
      remarks: attendanceRecords[student._id]?.remarks || '',
    }));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/teacher/attendance`, // Assumed endpoint for marking student attendance
        {
          classId: selectedClassId,
          date: date,
          attendance: attendancePayload,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess('Student attendance marked successfully!');
        // Optionally, clear form or navigate
        // setSelectedClassId('');
        // setStudents([]);
        // setAttendanceRecords({});
      } else {
        throw new Error(response.data.message || 'Failed to mark attendance.');
      }
    } catch (err) {
      // console.error('Error submitting attendance:', err);
      const errorMessage = err.response?.data?.error?.errors?.[0] || 'Failed to mark attendance. Please try again.';
      setError(errorMessage);
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
          <h2 style={{ marginBottom: 24, color: 'var(--primary)', fontWeight: 700 }}>Mark Student Attendance</h2>
          <form onSubmit={handleSubmitAttendance}>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div>
                <label htmlFor="date-select" style={{ marginRight: '10px', fontWeight: 500 }}>Date:</label>
                <input
                  type="date"
                  id="date-select"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
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
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading && <p style={{ textAlign: 'center', fontSize: '18px', color: 'var(--text-muted, #666)' }}>Loading...</p>}
            {error && <div className="error-message" style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'var(--success)', textAlign: 'center', marginBottom: '20px' }}>{success}</div>}

            {selectedClassId && !loading && students.length === 0 && !error && (
              <p style={{ textAlign: 'center', fontSize: '18px', color: 'var(--text-muted, #666)' }}>No students found for this class or date.</p>
            )}

            {students.length > 0 && !loading && (
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--text)', fontWeight: 600 }}>Students in {classes.find(cls => cls._id === selectedClassId)?.name}</h3>
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
                        <tr key={student._id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                          <td style={{ padding: '10px' }}>{student.studentId}</td>
                          <td style={{ padding: '10px' }}>{student.name}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <select
                              value={attendanceRecords[student._id]?.status || 'absent'}
                              onChange={(e) => handleAttendanceChange(student._id, 'status', e.target.value)}
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
                              value={attendanceRecords[student._id]?.remarks || ''}
                              onChange={(e) => handleAttendanceChange(student._id, 'remarks', e.target.value)}
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
                  className="login-button" // Reusing login-button style
                  style={{ marginTop: '25px', padding: '12px 25px', background: 'var(--primary)', color: 'var(--text-light)', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                  disabled={loading || students.length === 0}
                >
                  {loading ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateAttendance;