import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function CreateTimetablePage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [mappedPairs, setMappedPairs] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [days] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [timeSlots, setTimeSlots] = useState([]);
  // ...existing code...
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchClasses();
    fetchTimeSlots();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclassformapped`, { withCredentials: true });
      setClasses(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch classes.');
      // console.error(err);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallslots`, { withCredentials: true });
      setTimeSlots(res.data || []);
    } catch (err) {
      setError('Failed to fetch time slots.');
      // console.error(err);
    }
  };

  const fetchSubjectsAndTeachers = async (classId) => {
    try {
      const mappingRes = await axios.get(`${API_BASE_URL}/api/v1/admin/getClassMappings/${classId}`, { withCredentials: true });
      const pairs = mappingRes.data.data || [];
      // Extract unique subjects and teachers from pairs
      const subjectsMap = {};
      const teachersMap = {};
      pairs.forEach(m => {
        const subj = typeof m.subjectId === 'object' ? m.subjectId : null;
        const teach = typeof m.teacherId === 'object' ? m.teacherId : null;
        if (subj && subj._id) subjectsMap[subj._id] = subj;
        if (teach && teach._id) teachersMap[teach._id] = teach;
      });
      const uniqueSubjects = Object.values(subjectsMap);
      const uniqueTeachers = Object.values(teachersMap);
      setSubjects(uniqueSubjects);
      setTeachers(uniqueTeachers);
      setMappedPairs(pairs);
      setError('');
    } catch (err) {
      setError('Failed to fetch subjects, teachers, or mappings.');
      // console.error(err);
    }
  };

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setGrid({});
    if (classId) {
      await fetchSubjectsAndTeachers(classId);
    }
  };

  const handleGridChange = (day, slotId, field, value) => {
    setGrid(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slotId]: {
          ...((prev[day] && prev[day][slotId]) || {}),
          [field]: value
        }
      }
    }));
  };

  // Fill all for a day
  const handleFillAllDay = (day, mappedId) => {
    const found = mappedPairs.find(m => m._id === mappedId);
    if (!found) return;
    setGrid(prev => {
      const newDay = {};
      timeSlots.forEach(slot => {
        if (!isBreakPeriod(slot.period)) {
          const mSubject = typeof found.subjectId === 'object' ? found.subjectId : null;
          const mTeacher = typeof found.teacherId === 'object' ? found.teacherId : null;
          const subjectId = mSubject ? mSubject._id : found.subjectId;
          const teacherId = mTeacher ? mTeacher._id : found.teacherId;
          newDay[slot._id] = {
            combo: mappedId,
            subject: subjectId,
            teacher: teacherId
          };
        }
      });
      return {
        ...prev,
        [day]: newDay
      };
    });
  };

  // Drag and drop handlers
  const [draggedPair, setDraggedPair] = useState(null);
  const handleDragStart = (pairId) => setDraggedPair(pairId);
  const handleDrop = (day, slotId) => {
    if (draggedPair) {
      const found = mappedPairs.find(m => m._id === draggedPair);
      if (found) {
        const mSubject = typeof found.subjectId === 'object' ? found.subjectId : null;
        const mTeacher = typeof found.teacherId === 'object' ? found.teacherId : null;
        const subjectId = mSubject ? mSubject._id : found.subjectId;
        const teacherId = mTeacher ? mTeacher._id : found.teacherId;
        handleGridChange(day, slotId, 'combo', draggedPair);
        handleGridChange(day, slotId, 'subject', subjectId);
        handleGridChange(day, slotId, 'teacher', teacherId);
      }
    }
    setDraggedPair(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Strict validation: ensure every non-break period has a valid mappedId
    for (const day of days) {
      for (const slot of timeSlots) {
        if (!isBreakPeriod(slot.period)) {
          const cell = grid[day]?.[slot._id] || {};
          if (!cell.combo) {
            setLoading(false);
            setError(`Please select a subject-teacher pair for ${day}, ${slot.period}`);
            return;
          }
          const found = mappedPairs.find(m => m._id === cell.combo);
          if (!found || !found._id) {
            setLoading(false);
            setError(`Invalid mapping for ${day}, ${slot.period}. Please select a valid subject-teacher pair.`);
            return;
          }
        }
      }
    }

    try {
      // Send a separate request for each day
      for (const day of days) {
        const periods = timeSlots
          .filter(slot => !isBreakPeriod(slot.period))
          .map(slot => {
            const cell = grid[day]?.[slot._id] || {};
            let mappedId = '';
            if (cell.combo) {
              mappedId = cell.combo;
            }
            return {
              period: slot._id,
              mapped: mappedId
            };
          });
        const payload = {
          day,
          periods
        };
        await axios.post(`${API_BASE_URL}/api/v1/admin/createdailyschedule/${selectedClass}`, payload, { withCredentials: true });
      }
      setSuccess('Timetable created successfully!');
    } catch (err) {
      setError('Failed to create timetable.');
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isBreakPeriod = (periodName) => periodName.toLowerCase().includes('break');

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar pageTitle={"Create Timetable"} />
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0px 0px', overflowX: 'hidden' }}>
          <div className="timetable-form-container">
            {/* <h1>Create Timetable</h1> */}
            <form onSubmit={handleSubmit}>
              {loading && <p className="status-message">Loading...</p>}
              {error && <p className="status-message error">{error}</p>}
              {success && <p className="status-message success">{success}</p>}

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="class-select">Select Class: </label>
                <select id="class-select" value={selectedClass} onChange={handleClassChange} required>
                  <option value="">-- Select Class --</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name || cls.className}</option>
                  ))}
                </select>
              </div>

              {selectedClass && timeSlots.length > 0 && (
                <div>
                  {/* Drag-and-drop source list */}
                  <div style={{ marginBottom: 16 }}>
                    <label>Drag Subject-Teacher Pair:</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {mappedPairs.map(m => {
                        const mSubject = typeof m.subjectId === 'object' ? m.subjectId : null;
                        const mTeacher = typeof m.teacherId === 'object' ? m.teacherId : null;
                        const subjectName = mSubject ? (mSubject.name || mSubject.code || mSubject.shortName || mSubject._id) : m.subjectId;
                        const teacherName = mTeacher ? (mTeacher.name || mTeacher.code || mTeacher.shortName || mTeacher._id) : m.teacherId;
                        return (
                          <div
                            key={m._id}
                            draggable
                            onDragStart={() => handleDragStart(m._id)}
                            style={{
                              padding: '10px 18px',
                              background: 'var(--surface)',
                              color: 'var(--text)',
                              borderRadius: 8,
                              cursor: 'grab',
                              border: '2px solid var(--primary)',
                              fontWeight: 600,
                              fontSize: '1rem',
                              boxShadow: '0 2px 8px var(--border-color)'
                            }}
                          >
                            {subjectName} - {teacherName}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table className="timetable-table" style={{ tableLayout: 'fixed', minWidth: '2200px', width: '100%', margin: '0 auto' }}>
                      <colgroup>
                        <col style={{ width: '160px' }} />
                        {timeSlots.map((slot, idx) => (
                          <col key={slot._id} style={{ width: '180px' }} />
                        ))}
                        <col style={{ width: '120px' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>Day / Time Slot</th>
                          {timeSlots.map(slot => (
                            <th key={slot._id}>
                              {slot.period}<br />
                              <small>{slot.startTime} - {slot.endTime}</small>
                            </th>
                          ))}
                          <th>Fill All</th>
                        </tr>
                      </thead>
                      <tbody>
                        {days.map(day => (
                          <tr key={day}>
                            <td>{day}</td>
                            {timeSlots.map(slot => (
                              <td
                                key={slot._id}
                                onDragOver={e => e.preventDefault()}
                                onDrop={() => handleDrop(day, slot._id)}
                                style={{ wordBreak: 'break-word', maxWidth: '170px', fontSize: '1rem' }}
                              >
                                {isBreakPeriod(slot.period) ? (
                                  <em>{slot.period}</em>
                                ) : (
                                  <>
                                    <div>
                                      <select
                                        value={grid[day]?.[slot._id]?.combo || ''}
                                        onChange={e => {
                                          const mappedId = e.target.value;
                                          if (!mappedId) {
                                            handleGridChange(day, slot._id, 'combo', '');
                                            handleGridChange(day, slot._id, 'subject', '');
                                            handleGridChange(day, slot._id, 'teacher', '');
                                            return;
                                          }
                                          const found = mappedPairs.find(m => m._id === mappedId);
                                          if (found) {
                                            const mSubject = typeof found.subjectId === 'object' ? found.subjectId : null;
                                            const mTeacher = typeof found.teacherId === 'object' ? found.teacherId : null;
                                            const subjectId = mSubject ? mSubject._id : found.subjectId;
                                            const teacherId = mTeacher ? mTeacher._id : found.teacherId;
                                            handleGridChange(day, slot._id, 'combo', mappedId);
                                            handleGridChange(day, slot._id, 'subject', subjectId);
                                            handleGridChange(day, slot._id, 'teacher', teacherId);
                                          }
                                        }}
                                      >
                                        <option value="">-- Subject & Teacher --</option>
                                        {mappedPairs.map(m => {
                                          const mSubject = typeof m.subjectId === 'object' ? m.subjectId : null;
                                          const mTeacher = typeof m.teacherId === 'object' ? m.teacherId : null;
                                          const subjectId = mSubject ? mSubject._id : m.subjectId;
                                          const teacherId = mTeacher ? mTeacher._id : m.teacherId;
                                          const subjectName = mSubject ? (mSubject.name || mSubject.code || mSubject.shortName || subjectId) : subjectId;
                                          const teacherName = mTeacher ? (mTeacher.name || mTeacher.code || mTeacher.shortName || teacherId) : teacherId;
                                          return (
                                            <option key={m._id} value={m._id}>
                                              {subjectName} - {teacherName}
                                            </option>
                                          );
                                        })}
                                      </select>
                                    </div>
                                  </>
                                )}
                              </td>
                            ))}
                            {/* Fill All for this day */}
                            <td>
                              <select
                                onChange={e => handleFillAllDay(day, e.target.value)}
                                defaultValue=""
                                style={{ fontSize: '1rem' }}
                              >
                                <option value="">Fill All</option>
                                {mappedPairs.map(m => {
                                  const mSubject = typeof m.subjectId === 'object' ? m.subjectId : null;
                                  const mTeacher = typeof m.teacherId === 'object' ? m.teacherId : null;
                                  const subjectName = mSubject ? (mSubject.name || mSubject.code || mSubject.shortName || mSubject._id) : m.subjectId;
                                  const teacherName = mTeacher ? (mTeacher.name || mTeacher.code || mTeacher.shortName || mTeacher._id) : m.teacherId;
                                  return (
                                    <option key={m._id} value={m._id}>
                                      {subjectName} - {teacherName}
                                    </option>
                                  );
                                })}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button type="submit" disabled={!selectedClass || loading}>
                Create Timetable
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateTimetablePage;
