import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axios from 'axios';

function GetTeacherAttendance() {
  const [editRecordId, setEditRecordId] = useState(null);
  const [editStatus, setEditStatus] = useState('present');
  const [editRemarks, setEditRemarks] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  // Handler for delete
  const handleDeleteAttendance = async (recordId) => {
    setError('');
    setSuccess('');
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/admin/teacher-attendance/${recordId}`,
        { withCredentials: true }
      );
      if (response.status == 200) {
        setAttendanceRecords(attendanceRecords.filter((r) => r._id !== recordId));
        setSuccess('Attendance record deleted successfully');
      } else {
        setError('Failed to delete attendance record');
      }
    } catch (err) {
      setError('Unable to delete attendance record.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for update
  const handleEditClick = (record) => {
    setEditRecordId(record._id);
    setEditStatus(record.status);
    setEditRemarks(record.remarks);
  };

  const handleUpdateAttendance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/admin/teacher-attendance/${editRecordId}`,
        {
          status: editStatus,
          remarks: editRemarks,
        },
        { withCredentials: true }
      );
      if (response.status == 200) {
        setSuccess('Attendance updated successfully');
        setAttendanceRecords(attendanceRecords.map((r) =>
          r._id === editRecordId ? { ...r, status: editStatus, remarks: editRemarks } : r
        ));
        setEditRecordId(null);
      } else {
        setError('Failed to update attendance');
      }
    } catch (err) {
      setError('Unable to update attendance.');
    } finally {
      setLoading(false);
    }
  };
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      setError('');
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/admin/getallteacher`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setTeachers(response.data.data);
        } else {
          throw new Error('Failed to fetch teachers');
        }
      } catch (err) {
        setError('Unable to fetch teachers.');
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleTeacherChange = (e) => {
    setSelectedTeacherId(e.target.value);
  };

  const handleFetchAttendance = async () => {
    if (!selectedTeacherId) {
      setError('Please select a teacher.');
      return;
    }
    setError('');
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/admin/teacher-attendance/${selectedTeacherId}`,
        { withCredentials: true }
      );

      if (response.data.status === 200) {
        setAttendanceRecords(response.data.data);
      } else {
        setAttendanceRecords([]);
        setError('No attendance records found for this teacher.');
      }
    } catch (err) {
      setError('Unable to fetch attendance records.');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar pageTitle={"View Teacher Attendance"} role="admin" />
        <div className="form-container" style={{ width: '100%', maxWidth: '100%', margin: 0, background: 'var(--surface)', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px var(--border-color)' }}>
          {/* <h2 style={{ marginBottom: 24, color: 'var(--primary)', fontWeight: 700 }}>View Teacher Attendance</h2> */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px', fontWeight: 500, color: 'var(--text)' }}>Select Teacher:</label>
            <select
              value={selectedTeacherId}
              onChange={handleTeacherChange}
              required
              style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', marginRight: '20px', minWidth: 180, background: 'var(--input-background)', color: 'var(--input-text)' }}
            >
              <option value="" style={{ background: 'var(--input-background)'}}>Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id} style={{ background: 'var(--input-background)'}}>
                  {teacher.name} ({teacher.s_id})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="login-button"
              style={{ marginLeft: '10px', padding: '10px 20px', background: 'var(--primary)', color: 'var(--text-light)', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px var(--border-color)' }}
              onClick={handleFetchAttendance}
              disabled={!selectedTeacherId}
            >
              Get Attendance
            </button>
          </div>
          {error && <div className="error-message" style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
          {success && (
            <div className="success-message" style={{ color: 'var(--success)', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
              {success}
            </div>
          )}
          {loading ? (
            <div style={{ textAlign: 'center', fontSize: '18px', color: 'var(--text-muted, #666)' }}>Loading...</div>
          ) : attendanceRecords.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '18px', color: 'var(--text-muted, #666)' }}>
              No attendance records found.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'var(--surface)', borderRadius: 8, boxShadow: '0 1px 4px var(--border-color)', color: 'var(--text)' }}>
              <thead>
                <tr style={{ background: 'var(--primary)', color: 'var(--text-light)' }}>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Date</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Remarks</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record._id} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>{new Date(record.date).toLocaleDateString()}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                      {editRecordId === record._id ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--input-background)', color: 'var(--input-text)' }}
                        >
                          <option value="present" style={{ background: 'var(--input-background)'}}>Present</option>
                          <option value="absent" style={{ background: 'var(--input-background)'}}>Absent</option>
                          <option value="leave" style={{ background: 'var(--input-background)'}}>Leave</option>
                        </select>
                      ) : (
                        record.status
                      )}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                      {editRecordId === record._id ? (
                        <input
                          type="text"
                          value={editRemarks}
                          onChange={(e) => setEditRemarks(e.target.value)}
                          style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', width: '150px', background: 'var(--input-background)', color: 'var(--input-text)' }}
                          placeholder="Optional remarks"
                        />
                      ) : (
                        record.remarks
                      )}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                      {editRecordId === record._id ? (
                        <>
                          <button
                            type="button"
                            className="login-button"
                            style={{ marginRight: '5px', padding: '8px 16px', background: 'var(--primary)', color: 'var(--text-light)', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px var(--border-color)' }}
                            onClick={handleUpdateAttendance}
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="login-button"
                            style={{ padding: '8px 16px', background: 'var(--secondary, #64748b)', color: 'var(--text-light)', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px var(--border-color)' }}
                            onClick={() => setEditRecordId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="login-button"
                            style={{ marginRight: '5px', padding: '8px 16px', background: 'var(--primary)', color: 'var(--text-light)', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px var(--border-color)' }}
                            onClick={() => handleEditClick(record)}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="login-button"
                            style={{ padding: '8px 16px', background: 'var(--danger)', color: 'var(--text-light)', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px var(--border-color)' }}
                            onClick={() => handleDeleteAttendance(record._id)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default GetTeacherAttendance;
