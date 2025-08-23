import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css';
import TeacherSidebar from '../../components/TeacherSidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function ManageAttendance() {
  const { user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentId, setStudentId] = useState('');

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [classes, setClasses] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [todayTimetable, setTodayTimetable] = useState([]);
  
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = new Date();
  const todayName = daysOfWeek[today.getDay()];
  const [todayClasses, setTodayClasses] = useState([]);


  /** ================== FETCH INITIAL DATA ================== */
  useEffect(() => {
    if (!user?._id) return;

    const fetchInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch classes
        const classesRes = await axios.get(`${API_BASE_URL}/api/v1/teacher/${user._id}`, { withCredentials: true });
        if (classesRes.data.mapped) {
          const uniqueClasses = [];
          const seen = new Set();
          classesRes.data.mapped.forEach(mapping => {
            if (mapping.classId && !seen.has(mapping.classId._id)) {
              seen.add(mapping.classId._id);
              uniqueClasses.push(mapping.classId);
            }
          });
          setClasses(uniqueClasses);
        } else {
          throw new Error('No classes mapped.');
        }

        // Fetch time slots
        const timeSlotsRes = await axios.get(`${API_BASE_URL}/api/v1/teacher/getallslots`, { withCredentials: true });
        setTimeSlots(timeSlotsRes.data || []);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load initial data.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user?._id, API_BASE_URL]);

  /** ================== FETCH TIMETABLES WHEN CLASS CHANGES ================== */
  useEffect(() => {
    if (!selectedClassId) {
      setTimetables([]);
      setTodayTimetable([]);
      setSelectedPeriodId('');
      return;
    }

    const fetchTimetables = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/teacher/getalldailyschedules/${selectedClassId}`,
          { withCredentials: true }
        );
        setTimetables(res.data.data || []);
      } catch (err) {
        console.error('Error fetching timetables:', err);
        setError('Failed to fetch timetables for the selected class.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, [selectedClassId, API_BASE_URL]);

  /** ================== FILTER TIMETABLE FOR TODAY ================== */
  useEffect(() => {
    if (timetables.length === 0) return;

    const filtered = timetables.filter(tt => tt.day.toLowerCase() === todayName.toLowerCase());
    setTodayTimetable(filtered);
  }, [timetables, todayName]);

  /** ================== FILTER PERIODS FROM TODAY’S TIMETABLE ================== */
  useEffect(() => {
    if (!todayTimetable[0] || timeSlots.length === 0) return;

    const periodsInTimeTable = todayTimetable[0].periods
      .filter(item => item.mapped !== null)
      .map(item => item.period);

    const filteredPeriods = timeSlots.filter(ts =>
      periodsInTimeTable.some(pt => pt._id === ts._id)
    );

    setTodayClasses(filteredPeriods);
  }, [timeSlots, todayTimetable]);

  /** ================== FETCH STUDENTS WHEN CLASS CHANGES ================== */
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setAttendanceRecords({});
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/teacher/class/${selectedClassId}/students`,
          { withCredentials: true }
        );
        console.log('Fetched students:', res.data);

        if (res.data.success) {
          setStudents(res.data.data || []);
        } else {
          throw new Error('Failed to fetch students.');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students for this class.');
        setStudents([]);
        setAttendanceRecords({});
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClassId, API_BASE_URL]);

  /** ================== HANDLERS ================== */
  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setSelectedPeriodId('');
  };

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleSubmitAttendance = async (e) => {
    // e.preventDefault();
    // setError('');
    // setSuccess('');
    // setLoading(true);

    // if (!selectedClassId || !selectedPeriodId) {
    //   setError('Please select a class and period.');
    //   setLoading(false);
    //   return;
    // }

    // const absentStudents = students
    //   .filter(student => attendanceRecords[student.rollno]?.status === 'absent')
    //   .map(student => student._id);

    // console.log('Absent students:', absentStudents);

    // const payload = {
    //   classId: selectedClassId,
    //   date,
    //   absent: absentStudents,
    //   timetableId: todayTimetable[0]?._id,
    //   period: selectedPeriodId,
    //   markedBy: user._id,
    // };

    // console.log('Submitting attendance:', payload);

    // try {
    //   const res = await axios.post(`${API_BASE_URL}/api/v1/attendance/create`, payload, { withCredentials: true });
    //   console.log('Attendance response:', res);
    //   if (res.status === 201) {
    //     setSuccess('Student attendance marked successfully!');
    //   } else {
    //     throw new Error(res.data.message);
    //   }
    // } catch (err) {
    //   console.error('Error marking attendance:', err);
    //   const msg = err.response?.data?.error?.errors?.[0]?.message
    //     || err.response?.data?.message
    //     || 'Failed to mark attendance. Please try again.';
    //   setError(msg);
    // } finally {
    //   setLoading(false);
    // }
  };

  /** ================== FETCH ATTENDANCE (CLASS + DATE) ================== */
  const fetchClassAttendance = async () => {
    if (!classId || !date) {
      setError('Please select class and date');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/attendance/class/${classId}/date/${date}`,
        { withCredentials: true }
      );
      console.log('Class attendance response:', res);
      setRecords(res.data.data || []);
    } catch (err) {
      console.error('Error fetching class attendance:', err);
      setError('Failed to load attendance records.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  /** ================== FETCH ATTENDANCE (STUDENT) ================== */
  const fetchStudentAttendance = async () => {
    if (!studentId) {
      setError('Please enter student ID');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/attendance/student/${studentId}`,
        { withCredentials: true }
      );
      setRecords(res.data.data || []);
    } catch (err) {
      console.error('Error fetching student attendance:', err);
      setError('Failed to load student attendance.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  /** ================== UPDATE ATTENDANCE ================== */
  const handleUpdate = async (attendanceId, status) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/v1/attendance/update/${attendanceId}`,
        { status }, // example: updating only status
        { withCredentials: true }
      );
      setSuccess('Attendance updated successfully!');
      // refresh data
      setRecords(records.map(r => r._id === attendanceId ? { ...r, status } : r));
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError('Failed to update attendance.');
    } finally {
      setLoading(false);
    }
  };

  /** ================== DELETE ATTENDANCE ================== */
  const handleDelete = async (attendanceId) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.delete(
        `${API_BASE_URL}/api/v1/attendance/delete/${attendanceId}`,
        { withCredentials: true }
      );
      setSuccess('Attendance deleted successfully!');
      setRecords(records.filter(r => r._id !== attendanceId));
    } catch (err) {
      console.error('Error deleting attendance:', err);
      setError('Failed to delete attendance.');
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="dashboard-container">
      <TeacherSidebar />
      <main className="main-content">
        <Navbar pageTitle="Manage Attendance Records" />

        <div className="form-container" style={{
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          background: 'var(--surface)',
          padding: 32,
          borderRadius: 12,
          boxShadow: '0 2px 8px var(--border-color)'
        }}>
          <h2>Search Attendance</h2>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
            <div>
                <label style={{ marginRight: 10, fontWeight: 500 }}>Select Class:</label>
                <select value={classId} onChange={e => setClassId(e.target.value)} required>
                  <option value="">-- Select Class --</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.classId} ({cls.section})
                    </option>
                  ))}
                </select>
              </div>
            <div>
              <label>Date: </label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <button type="button" onClick={fetchClassAttendance}>Get Class Attendance</button>
          </div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            <div>
              <label>Student ID: </label>
              <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} />
            </div>
            <button type="button" onClick={fetchStudentAttendance}>Get Student Attendance</button>
          </div>

          {loading && <p>Loading...</p>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {success && <div style={{ color: 'green' }}>{success}</div>}

          {records.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <h3>Attendance Records</h3>
              <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 8, padding: 15 }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Class</th>
                      <th>Period</th>
                      <th>Student</th>
                      <th>Status</th>
                      <th>Remarks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r._id}>
                        <td>{r.date}</td>
                        <td>{r.classId?.classId} {r.classId?.section}</td>
                        <td>{r.period?.period}</td>
                        <td>{r.studentId?.name}</td>
                        <td>{r.status}</td>
                        <td>{r.remarks}</td>
                        <td>
                          <button onClick={() => handleUpdate(r._id, r.status === 'present' ? 'absent' : 'present')}>
                            Toggle Status
                          </button>
                          <button onClick={() => handleDelete(r._id)} style={{ marginLeft: 10, color: 'red' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {records.length === 0 && !loading && <p>No attendance records found.</p>}
        </div>
      </main>

      {/* <main className="main-content">
        <Navbar pageTitle="Mark Student Attendance" />

        <div className="form-container" style={{
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          background: 'var(--surface)',
          padding: 32,
          borderRadius: 12,
          boxShadow: '0 2px 8px var(--border-color)'
        }}>
          <form onSubmit={handleSubmitAttendance}> */}
            {/* Top Controls */}
            {/* <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}> */}
              {/* Date */}
              {/* <div>
                <label style={{ marginRight: 10, fontWeight: 500 }}>Date:</label>
                <input type="date" value={date} disabled readOnly />
              </div> */}

              {/* Class */}
              {/* <div>
                <label style={{ marginRight: 10, fontWeight: 500 }}>Select Class:</label>
                <select value={selectedClassId} onChange={handleClassChange} required>
                  <option value="">-- Select Class --</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.classId} ({cls.section})
                    </option>
                  ))}
                </select>
              </div> */}

              {/* Day */}
              {/* {timetables.length > 0 && (
                <div>
                  <label style={{ marginRight: 10, fontWeight: 500 }}>Day:</label>
                  <input type="text" value={todayName} disabled readOnly />
                </div>
              )} */}

              {/* Period */}
              {/* {todayClasses.length > 0 && (
                <div>
                  <label style={{ marginRight: 10, fontWeight: 500 }}>Select Period:</label>
                  <select
                    value={selectedPeriodId}
                    onChange={(e) => setSelectedPeriodId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Period --</option>
                    {todayClasses.map(tc =>
                      <option key={tc._id} value={tc._id}>{tc.period}</option>
                    )}
                  </select>
                </div>
              )}
            </div> */}

            {/* Status messages */}
            {/* {loading && <p>Loading...</p>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>} */}

            {/* Students Table */}
            {/* {students.length > 0 && !loading && (
              <div style={{ marginTop: 30 }}>
                <h3>Students in {classes.find(c => c._id === selectedClassId)?.classId}</h3>
                <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 8, padding: 15 }}>
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Roll No.</th>
                        <th>Student Name</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student.rollno}>
                          <td>{student.rollno}</td>
                          <td>{student.name}</td>
                          <td>
                            <select
                              value={attendanceRecords[student.rollno]?.status || 'present'}
                              onChange={(e) => handleAttendanceChange(student.rollno, 'status', e.target.value)}
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="leave">Leave</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={attendanceRecords[student.rollno]?.remarks || ''}
                              onChange={(e) => handleAttendanceChange(student.rollno, 'remarks', e.target.value)}
                              placeholder="Remarks"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="submit" disabled={loading || students.length === 0}>
                  {loading ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </div>
            )}
            {selectedClassId && !loading && students.length === 0 && !error && (
              <p>No students found for this class.</p>
            )}
          </form>
        </div>
      </main> */}
    </div>
  );
}

export default ManageAttendance;
