// src/pages/TeacherRegister.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/EnhancedForm.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
// import '../../App.css'; // Ensure global styles are applied
// Assuming useAuth is still needed, though not directly used in the provided snippet's logic for form submission.
// import { useAuth } from '../../context/AuthContext'; 

function TeacherRegister() {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    age: '',
    address: '',
    phone: '',
    dateofjoining: '',
    subjects: '', // Keep as string for text input
    password: '',
  });
  const [allClasses, setAllClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const { adminData } = useAuth(); // If adminData is not used, you can remove this line

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclass`, {
          withCredentials: true
        });
        
        if (response.data.success && Array.isArray(response.data.data)) {
          setAllClasses(response.data.data);
        } else {
          // console.error('Invalid response format for classes');
          setError('Failed to fetch classes.');
        }
      } catch (err) {
        // console.error('Error fetching classes:', err);
        setError('Failed to load available classes.');
      }
    };

    fetchClasses();
  }, [API_BASE_URL]);

  // Handle class checkbox changes
  const handleClassSelection = (e) => {
    const { value, checked } = e.target;
    setSelectedClasses(prev => {
      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter(classId => classId !== value);
      }
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Client-side validation
    if (!formData.id || !formData.name || !formData.email || !formData.password ||
        !formData.age || !formData.phone || !formData.dateofjoining) {
      setError('Please fill in all required fields: Teacher ID, Name, Email, Password, Age, Phone, and Date of Joining.');
      setLoading(false);
      return;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    if (isNaN(formData.age) || Number(formData.age) < 18) {
      setError('Age must be a number and at least 18.');
      setLoading(false);
      return;
    }

    const teacherData = new FormData();
    teacherData.append('id', formData.id);
    teacherData.append('name', formData.name);
    teacherData.append('email', formData.email);
    teacherData.append('password', formData.password);
    teacherData.append('age', formData.age);
    teacherData.append('address', formData.address || '');
    teacherData.append('phone', formData.phone);
    teacherData.append('dateofjoining', formData.dateofjoining);

    // Parse subjects from comma-separated string to array
    const subjectsArray = formData.subjects ? formData.subjects.split(',').map((s) => s.trim()).filter(s => s !== '') : [];
    
    // Use selectedClasses array directly
    if (selectedClasses.length === 0) {
      setError('Please select at least one class.');
      setLoading(false);
      return;
    }

    // Append arrays as individual items
    subjectsArray.forEach(subject => teacherData.append('subjects[]', subject));
    selectedClasses.forEach(cls => teacherData.append('classes[]', cls));

    if (photo) {
      teacherData.append('coverImage', photo);
    }

    if (!API_BASE_URL) {
      setError('Server configuration error: API URL missing.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/admin/teachregister`,
        teacherData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        setSuccess('Teacher registered successfully!');
        // Clear form
        setFormData({
          id: '', name: '', email: '', password: '', age: '',
          address: '', phone: '', dateofjoining: '', subjects: ''
        });
        setSelectedClasses([]);
        setPhoto(null);
        setTimeout(() => navigate('/admin/teachers'), 2000);
      } else {
        throw new Error(response.data.message || 'Failed to register teacher.');
      }
    } catch (err) {
      // console.error("Teacher Registration Error:", err);
      setError(err.response?.data?.message || err.message || 'Unable to register teacher via backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar pageTitle={"Register Teacher"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        {/* <header className="dashboard-header">
          <h1>Register Teacher</h1>
          <p className="dashboard-subtitle">Add a new teacher to the system</p>
        </header> */}
        <div className="form-content-wrapper">
          <form className="enhanced-form teacher-register-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="id"
                placeholder="Teacher ID (e.g., TCH001)"
                value={formData.id}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                required
                min="18"
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="address"
                placeholder="Address (optional)"
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="phone"
                placeholder="Phone (10 digits)"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label htmlFor="dateofjoining" style={{ alignSelf: 'flex-start', fontSize: '0.85em', color: '#555', marginBottom: '5px' }}>Date of Joining:</label>
              <input
                type="date"
                id="dateofjoining"
                name="dateofjoining"
                value={formData.dateofjoining}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="subjects"
                placeholder="Subjects (comma-separated, e.g., Math,Science)"
                value={formData.subjects}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label className="input-label" style={{ alignSelf: 'flex-start', fontSize: '0.85em', color: '#555', marginBottom: '5px' }}>Select Classes:</label>
              <div className="checkbox-group" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                {allClasses.length > 0 ? (
                  allClasses.map((cls) => (
                    <div key={cls.classId} className="checkbox-item" style={{ marginBottom: '8px' }}>
                      <input
                        type="checkbox"
                        id={`class-${cls.classId}`}
                        value={cls.classId}
                        checked={selectedClasses.includes(cls.classId)}
                        onChange={handleClassSelection}
                        disabled={loading}
                      />
                      <label htmlFor={`class-${cls.classId}`} style={{ marginLeft: '8px' }}>
                        {cls.name} ({cls.classId})
                      </label>
                    </div>
                  ))
                ) : (
                  <p>No classes available</p>
                )}
              </div>
              {selectedClasses.length > 0 && (
                <p style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
                  Selected: {selectedClasses.length} class(es)
                </p>
              )}
            </div>
            <div className="input-group">
              <label htmlFor="coverImage" style={{ alignSelf: 'flex-start', fontSize: '0.85em', color: '#555', marginBottom: '5px' }}>Teacher Photo:</label>
              <input 
                type="file" 
                id="coverImage" 
                name="coverImage" 
                accept="image/*" 
                onChange={handleFileChange} 
                disabled={loading}
              />
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Registering...' : 'Register Teacher'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default TeacherRegister;