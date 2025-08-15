import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function ViewClassMappingsPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclassformapped`, { withCredentials: true });
      setClasses(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch classes.');
    }
  };

  const fetchMappings = async (classId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getClassMappings/${classId}`, { withCredentials: true });
      setMappings(res.data.data);
    } catch (err) {
      setError('Failed to fetch mappings.');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setMappings([]);
    if (classId) {
      fetchMappings(classId);
    }
  };

  const handleDelete = async (mappingId) => {
    if (!window.confirm('Are you sure you want to delete this mapping?')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/admin/deletemapped/${mappingId}`, { withCredentials: true });
      setSuccess('Mapping deleted successfully.');
      setMappings(mappings.filter(m => m._id !== mappingId));
    } catch (err) {
      setError('Failed to delete mapping.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar pageTitle={"View Class Mappings"} />
        <div className="timetable-form-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', flexGrow: 1 }}>
          {/* <h1 style={{ textAlign: 'center', width: '100%' }}>View Class Mappings</h1> */}
          {loading && <p className="status-message" style={{ textAlign: 'center' }}>Loading...</p>}
          {error && <p className="status-message error" style={{ textAlign: 'center' }}>{error}</p>}
          {success && <p className="status-message success" style={{ textAlign: 'center' }}>{success}</p>}
          <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <label htmlFor="class-select" style={{ fontSize: '1rem', marginRight: '8px', textAlign: 'center' }}>Select Class: </label>
            <select id="class-select" value={selectedClass} onChange={handleClassChange} required style={{ fontSize: '1rem', padding: '6px 8px', minWidth: '120px', maxWidth: '100%', textAlign: 'center' }}>
              <option value="">-- Select Class --</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name || cls.className}</option>
              ))}
            </select>
          </div>
          <div style={{ width: '100%', margin: 0, overflowX: 'auto', display: 'block' }}>
            {selectedClass && mappings.length > 0 && (
              <div style={{ width: '100%', display: 'block' }}>
                <table className="timetable-table" style={{
                  width: '100%',
                  minWidth: '600px',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  borderCollapse: 'collapse',
                  boxShadow: '0 2px 8px var(--border-color)',
                  margin: 0,
                  textAlign: 'center'
                }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'var(--text-light)' }}>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping, idx) => (
                    <tr key={mapping._id} style={{ background: 'var(--surface)', color: 'var(--text)', borderBottom: idx === mappings.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                      <td style={{ color: 'var(--text)', fontWeight: 500 }}>{
                        mapping.subjectName ||
                        mapping.subject?.name ||
                        (typeof mapping.subjectId === 'object' ? (mapping.subjectId.name || mapping.subjectId.code || mapping.subjectId.shortName || mapping.subjectId._id) : mapping.subjectId)
                      }</td>
                      <td style={{ color: 'var(--text)', fontWeight: 500 }}>{
                        mapping.teacherName ||
                        mapping.teacher?.name ||
                        (typeof mapping.teacherId === 'object' ? (mapping.teacherId.name || mapping.teacherId.code || mapping.teacherId.shortName || mapping.teacherId._id) : mapping.teacherId)
                      }</td>
                      <td>
                        <button onClick={() => handleDelete(mapping._id)} disabled={loading} style={{ color: 'var(--danger)', background: 'var(--surface)', border: '1px solid var(--danger)', borderRadius: '6px', padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}
            {selectedClass && mappings.length === 0 && !loading && (
              <p>No mappings found for this class.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ViewClassMappingsPage;
