// src/pages/ModifyStudentPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Dashboard.css';
import '../../styles/Card.css';
import '../../styles/InputForm.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function ModifyStudentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    s_id: '',
    name: '',
    email: '',
    Age: '',
    phone: '',
    dateOfBirth: '',
    dateOfAdmission: '',
    class: '',
    fatherName: '',
    fatherPhoneNumber: '',
    motherName: '',
    motherPhoneNumber: '',
    Qualification: '',
    status: 'active',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { adminData } = useAuth();

  // Extract s_id from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const s_id = queryParams.get('s_id');

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!s_id) {
        setError('No student ID provided');
        setLoading(false);
        return;
      }

      setError('');
      setLoading(true);

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/admin/student/${s_id}`,
          { withCredentials: true }
        );

        if (response.data.success && response.data.data) {
          const data = response.data.data;
          setFormData({
            s_id: data.s_id || '',
            name: data.name || '',
            email: data.email || '',
            Age: data.Age || data.age || '',
            phone: data.phone || '',
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
            dateOfAdmission: data.dateOfAdmission ? new Date(data.dateOfAdmission).toISOString().split('T')[0] : '',
            class: data.class?.name || data.class || '',
            fatherName: data.fatherName || '',
            fatherPhoneNumber: data.fatherPhoneNumber || '',
            motherName: data.motherName || '',
            motherPhoneNumber: data.motherPhoneNumber || '',
            Qualification: data.Qualification || data.qualification || '',
            status: data.status || 'active',
          });
        } else {
          throw new Error('Failed to fetch student data');
        }
      } catch (err) {
        setError('Error fetching student data: ' + err.message);
        // console.error('Fetch Student Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [s_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'Age' ? Number(value) || '' : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/admin/student/${formData.s_id}`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        alert('Student updated successfully');
        navigate('/admin/students');
      } else {
        throw new Error('Failed to update student');
      }
    } catch (err) {
      setError('Error updating student: ' + err.message);
      // console.error('Update Student Error:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar pageTitle={"Modify Student"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        {/* <header className="dashboard-header">
          <h1>Modify Student</h1>
          <p className="dashboard-subtitle">Edit student details</p>
        </header> */}
        {error && (
          <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
            {error}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="modify-class-form" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="form-group">
              <label htmlFor="s_id">Student ID</label>
              <input
                type="text"
                id="s_id"
                name="s_id"
                value={formData.s_id}
                onChange={handleChange}
                disabled
                style={{ background: '#f0f0f0' }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="Age">Age</label>
              <input
                type="number"
                id="Age"
                name="Age"
                value={formData.Age}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateOfAdmission">Date of Admission</label>
              <input
                type="date"
                id="dateOfAdmission"
                name="dateOfAdmission"
                value={formData.dateOfAdmission}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="class">Class</label>
              <input
                type="text"
                id="class"
                name="class"
                value={formData.class}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fatherName">Father's Name</label>
              <input
                type="text"
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fatherPhoneNumber">Father's Phone</label>
              <input
                type="text"
                id="fatherPhoneNumber"
                name="fatherPhoneNumber"
                value={formData.fatherPhoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="motherName">Mother's Name</label>
              <input
                type="text"
                id="motherName"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="motherPhoneNumber">Mother's Phone</label>
              <input
                type="text"
                id="motherPhoneNumber"
                name="motherPhoneNumber"
                value={formData.motherPhoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="Qualification">Qualification</label>
              <input
                type="text"
                id="Qualification"
                name="Qualification"
                value={formData.Qualification}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button type="submit" className="login-button">
                Save Changes
              </button>
              <button
                type="button"
                className="login-button"
                onClick={() => navigate('/admin/students')}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default ModifyStudentPage;