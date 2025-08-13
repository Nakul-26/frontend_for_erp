import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function GetAllTimetables() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Fetch all classes on mount
    axios.get(`${API_BASE_URL}/api/v1/admin/getallclassformapped`, { withCredentials: true })
      .then(res => setClasses(res.data.data || []))
      .catch(() => setClasses([]));
  }, []);

  const fetchTimetables = async (classId) => {
    if (!classId) return;
    setLoading(true);
    setError('');
    setTimetables([]);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getalldailyschedules/${classId}`, { withCredentials: true });
      setTimetables(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch timetables.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar pageTitle={"All Timetables"} />
        <div className="timetable-form-container">
          {/* <h1>All Timetables</h1> */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="class-select">Select Class: </label>
            <select
              id="class-select"
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value);
                fetchTimetables(e.target.value);
              }}
              required
            >
              <option value="">-- Select Class --</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name || cls.className}</option>
              ))}
            </select>
            {selectedClass && (
              <button
                style={{ marginLeft: 16, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
                onClick={async () => {
                  if (!window.confirm('Are you sure you want to delete the entire timetable for this class?')) return;
                  try {
                    await axios.delete(`${API_BASE_URL}/api/v1/admin/deletedailyschedule/${selectedClass}`, { withCredentials: true });
                    setTimetables([]);
                    setError('');
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to delete timetable.');
                  }
                }}
              >Delete Timetable</button>
            )}
          </div>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {timetables.length === 0 && !loading && selectedClass && <p>No timetables found for this class.</p>}
          {timetables.length > 0 && (
            <div style={{ marginBottom: 32, background: 'var(--surface)', borderRadius: 8, padding: 16 }}>
              <h3 style={{ color: 'var(--text)' }}>Class: {timetables[0].classId?.name || timetables[0].classId}</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="timetable-table" style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', borderRadius: '8px', overflow: 'hidden', borderCollapse: 'collapse', boxShadow: '0 2px 8px var(--border-color)' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary)', color: 'var(--text-light)' }}>
                      <th>Day / Time Slot</th>
                      {(() => {
                        // Collect all unique periods from all days
                        const allPeriods = [];
                        timetables.forEach(tt => {
                          tt.periods?.forEach(p => {
                            if (!allPeriods.find(ap => ap._id === p.period?._id)) {
                              allPeriods.push(p.period);
                            }
                          });
                        });
                        return allPeriods.map(slot => (
                          <th key={slot?._id}>
                            {slot?.period}<br />
                            <small style={{ color: 'var(--text-light)' }}>{slot?.startTime} - {slot?.endTime}</small>
                          </th>
                        ));
                      })()}
                    </tr>
                  </thead>
                  <tbody>
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
                      <tr key={day} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{day}</td>
                        {(() => {
                          // Find the timetable for this day
                          const ttDay = timetables.find(tt => tt.day === day);
                          // Get all unique periods
                          const allPeriods = [];
                          timetables.forEach(tt => {
                            tt.periods?.forEach(p => {
                              if (!allPeriods.find(ap => ap._id === p.period?._id)) {
                                allPeriods.push(p.period);
                              }
                            });
                          });
                          return allPeriods.map(slot => {
                            // Find the period for this slot in this day
                            const periodObj = ttDay?.periods?.find(p => p.period?._id === slot?._id);
                            if (!periodObj) return <td key={slot?._id} style={{ background: 'var(--surface)', color: 'var(--text)' }}><em>-</em></td>;
                            // If break, show break
                            if (periodObj.period?.period?.toLowerCase().includes('break')) {
                              return <td key={slot?._id} style={{ background: 'var(--surface)', color: 'var(--text)' }}><em>{periodObj.period?.period}</em></td>;
                            }
                            return (
                              <td key={slot?._id} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                                <div>
                                  <b style={{ color: 'var(--text)' }}>{periodObj.mapped?.subjectId?.name || periodObj.mapped?.subjectId?.code || '-'}</b><br />
                                  <span style={{ color: 'var(--text)' }}>{periodObj.mapped?.teacherId?.name || periodObj.mapped?.teacherId?.email || '-'}</span>
                                </div>
                              </td>
                            );
                          });
                        })()}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GetAllTimetables;
