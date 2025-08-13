// src/pages/MappedPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/InputForm.css'; // Use InputForm.css for general form styling
import '../../styles/Dashboard.css'; // For overall layout
import '../../styles/Mapped.css'; // For radio button styling (will need updates in Mapped.css)
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function MappedPage() {
  // Removed inputId state
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Changed to single IDs instead of arrays
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { adminData } = useAuth(); // Assuming adminData might be used for auth headers etc.

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Function to fetch all necessary data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch Subjects
        const subjectsResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/getallsubjectformapped`, { withCredentials: true });
        if (subjectsResponse.data.success === true && Array.isArray(subjectsResponse.data.data)) {
          setSubjects(subjectsResponse.data.data);
        } else {
          throw new Error('Failed to fetch subjects or invalid format.');
        }

        // Fetch Classes
        const classesResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclassformapped`, { withCredentials: true });
        if (classesResponse.data.success && Array.isArray(classesResponse.data.data)) {
          setClasses(classesResponse.data.data);
        } else {
          throw new Error('Failed to fetch classes or invalid format.');
        }

        // Fetch Teachers
        const teachersResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/getallteacherformapped`, { withCredentials: true });
        if (teachersResponse.data.success && Array.isArray(teachersResponse.data.data)) {
          setTeachers(teachersResponse.data.data);
        } else {
          throw new Error('Failed to fetch teachers or invalid format.');
        }

      } catch (err) {
        // console.error('Error fetching data for Mapped Page:', err);
        setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (API_BASE_URL) {
      fetchAllData();
    } else {
      setError('API Base URL is not defined.');
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Removed handleInputChange as inputId is removed

  // Handler for radio button selection
  const handleRadioChange = (e, type) => {
    const { value } = e.target;
    if (type === 'subject') {
      setSelectedSubject(value);
    } else if (type === 'class') {
      setSelectedClass(value);
    } else if (type === 'teacher') {
      setSelectedTeacher(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if one of each is selected
    if (!selectedSubject || !selectedClass || !selectedTeacher) {
      setError('Please select one subject, one class, and one teacher.');
      return;
    }

    const payload = {
      subjectId: selectedSubject,
      classId: selectedClass,
      teacherId: selectedTeacher,
    };

    try {
      // This endpoint now directly matches your backend's `createMapped` function
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/admin/createmapped`, // Assuming your backend route is this for the `createMapped` function
        payload,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess('Mapping created successfully!');
        // Clear selections after successful submission
        setSelectedSubject('');
        setSelectedClass('');
        setSelectedTeacher('');
      } else {
        setError(response.data.message || 'Mapping failed.');
      }
    } catch (err) {
      // console.error('Mapping submission error:', err);
      setError(err.response?.data?.message || 'An error occurred during mapping.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`} style={{ fontSize: '18px' }}>
        <Navbar pageTitle={"Create New Mappings"} role="admin" toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
        {/* <header className="dashboard-header">
          <h1>Create New Mapping</h1>
          <p className="dashboard-subtitle">Link a specific class, subject, and teacher</p>
        </header> */}

        <div className="form-container" style={{ width: '100%', maxWidth: '100%' }}>
          <form className="form-form" onSubmit={handleSubmit} style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', borderRadius: '12px', padding: '2rem 1rem', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', textAlign: 'center', color: 'var(--primary)', fontWeight: 600, fontSize: '1.5rem' }}>Create Class-Subject-Teacher Mapping</h2>

            {loading ? (
              <div style={{ textAlign: 'center', margin: '20px 0', color: '#555' }}>Loading data...</div>
            ) : (
              <>
                {/* Select Subjects */}
                <div className="radio-group-section" style={{ background: 'var(--surface)', color: 'var(--text)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px', padding: '12px' }}>
                  <h3 style={{ color: 'var(--primary)', fontWeight: 500, marginBottom: '8px', fontSize: '1rem', borderBottom: 'none' }}>Select Subject:</h3>
                  {subjects.length > 0 ? (
                    <div className="radio-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                      {subjects.map(subject => (
                        <label key={subject._id} className="radio-label" style={{wordBreak: 'break-word', whiteSpace: 'pre-wrap', background: 'var(--input-background, #ffffff)', color: 'var(--input-text)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400 }}>
                          <input
                            type="radio"
                            name="subject"
                            value={subject._id}
                            checked={selectedSubject === subject._id}
                            onChange={(e) => handleRadioChange(e, 'subject')}
                            required
                            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', flexShrink: 0 }}
                          />
                          <span style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', wordBreak: 'break-word', minWidth: 0 }}>
                            <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{subject.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9em', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>({subject.code})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text)' }}>No subjects available.</p>
                  )}
                </div>

                {/* Select Classes */}
                <div className="radio-group-section" style={{ background: 'var(--surface)', color: 'var(--text)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px', padding: '12px' }}>
                  <h3 style={{ color: 'var(--primary)', fontWeight: 500, marginBottom: '8px', fontSize: '1rem', borderBottom: 'none' }}>Select Class:</h3>
                  {classes.length > 0 ? (
                    <div className="radio-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                      {classes.map(cls => (
                        <label key={cls.classId} className="radio-label" style={{wordBreak: 'break-word', whiteSpace: 'pre-wrap', background: 'var(--input-background, #ffffff)', color: 'var(--input-text)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400 }}>
                          <input
                            type="radio"
                            name="class"
                            value={cls._id}
                            checked={selectedClass === cls._id}
                            onChange={(e) => handleRadioChange(e, 'class')}
                            required
                            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', flexShrink: 0 }}
                          />
                          <span style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', wordBreak: 'break-word', minWidth: 0 }}>
                            <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{cls.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9em', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>(ID: {cls.classId})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text)' }}>No classes available.</p>
                  )}
                </div>

                {/* Select Teachers */}
                <div className="radio-group-section" style={{ background: 'var(--surface)', color: 'var(--text)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px', padding: '12px' }}>
                  <h3 style={{ color: 'var(--primary)', fontWeight: 500, marginBottom: '8px', fontSize: '1rem', borderBottom: 'none' }}>Select Teacher:</h3>
                  {teachers.length > 0 ? (
                    <div className="radio-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                      {teachers.map(teacher => (
                        <label key={teacher._id || teacher.id} className="radio-label" style={{ wordBreak: 'break-word', background: 'var(--input-background, #ffffff)', color: 'var(--input-text)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400 }}>
                          <input
                            type="radio"
                            name="teacher"
                            value={teacher._id || teacher.id}
                            checked={selectedTeacher === (teacher._id || teacher.id)}
                            onChange={(e) => handleRadioChange(e, 'teacher')}
                            required
                            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', flexShrink: 0 }}
                          />
                          <span style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', wordBreak: 'break-word', minWidth: 0 }}>
                            <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{teacher.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9em', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>({teacher.id || teacher.email})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text)' }}>No teachers available.</p>
                  )}
                </div>
              </>
            )}

            {error && <div className="error-message" style={{ color: 'var(--danger)', textAlign: 'center', marginTop: '20px' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'var(--success)', textAlign: 'center', marginTop: '20px' }}>{success}</div>}
            <button type="submit" className="form-button" disabled={loading} style={{ background: 'var(--primary)', color: 'var(--text-light)', fontWeight: 600, fontSize: '1rem', padding: '10px 0', borderRadius: '6px', marginTop: '12px', boxShadow: '0 1px 4px var(--primary-dark)', letterSpacing: '0.5px' }}>
              {loading ? 'Submitting...' : 'CREATE MAPPING'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default MappedPage;