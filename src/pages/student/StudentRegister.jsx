// src/pages/StudentRegister.jsx
import React, { useState } from 'react';
import '../../styles/EnhancedForm.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
// import '../../App.css';

function StudentRegister() {
  const [formData, setFormData] = useState({
    rollno: '',
    name: '',
    email: '',
    password: '',
    age: '',
    dateofbirth: '',
    address: '',
    phone: '',
    dateofadmission: '',
    class: '',
    fatherName: '',
    fatherPhoneNumber: '',
    fatherOccupation: '',
    motherName: '',
    motherPhoneNumber: '',
    motherOccupation: '',
  });
  const [classes, setClasses] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { adminData } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fetch all classes on mount
  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclass`,
          { withCredentials: true }
        );
        if (response.data.success && Array.isArray(response.data.data)) {
          setClasses(response.data.data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchClasses();
  }, []);

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate phone numbers (10 digits)
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError('Student phone number must be exactly 10 digits');
      return;
    }
    if (formData.fatherPhoneNumber && !/^\d{10}$/.test(formData.fatherPhoneNumber)) {
      setError('Father’s phone number must be exactly 10 digits');
      return;
    }
    if (formData.motherPhoneNumber && !/^\d{10}$/.test(formData.motherPhoneNumber)) {
      setError('Mother’s phone number must be exactly 10 digits');
      return;
    }

    // Prepare student data
    const studentData = new FormData();
    studentData.append('rollno', formData.rollno);
    studentData.append('name', formData.name);
    studentData.append('age', formData.age);
    studentData.append('email', formData.email);
    studentData.append('address', formData.address || undefined);
    studentData.append('password', formData.password);
    
    studentData.append('dateofbirth', formData.dateofbirth);
    
    studentData.append('phone', formData.phone);
    studentData.append('dateofadmission', formData.dateofadmission);
    studentData.append('class', formData.class);
    studentData.append('fatherName', formData.fatherName);
    studentData.append('fatherPhoneNumber', formData.fatherPhoneNumber);
    studentData.append('fatherOccupation', formData.fatherOccupation || undefined);
    studentData.append('motherName', formData.motherName);
    studentData.append('motherPhoneNumber', formData.motherPhoneNumber);
    studentData.append('motherOccupation', formData.motherOccupation || undefined);
    if (photo) {
      studentData.append('Studentphoto', photo);
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/admin/registerstudent`,
        studentData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.success) {
        setSuccess('Student registered successfully');
        setTimeout(() => navigate('/admin/students'), 2000);
      } else {
        throw new Error('Failed to register student');
      }
    } catch (err) {
      setError('Unable to register student via backend.', err);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar pageTitle={"Register Student"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        {/* <header className="dashboard-header">
          <h1>Register Student</h1>
          <p className="dashboard-subtitle">Add a new student to the system</p>
        </header> */}
        <div className="login-container" style={{ width: '100%', maxWidth: '100%', margin: '0', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <form className="enhanced-form student-register-form" onSubmit={handleSubmit} style={{ width: '100%', borderRadius: '16px', padding: '40px 24px', margin: '32px 0' }}>
            <div className="input-group">
              <input
                type="text"
                name="rollno"
                placeholder="Roll No (e.g., S001)"
                value={formData.rollno}
                onChange={handleChange}
                required
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
                min="1"
              />
            </div>
            <div className="input-group">
              <label htmlFor="dateofbirth" style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Date of Birth</label>
              <input
                type="date"
                name="dateofbirth"
                id="dateofbirth"
                placeholder="Date of Birth"
                value={formData.dateofbirth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="dateofadmission" style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Date of Admission</label>
              <input
                type="date"
                name="dateofadmission"
                id="dateofadmission"
                placeholder="Date of Admission"
                value={formData.dateofadmission}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="address"
                placeholder="Address (optional)"
                value={formData.address}
                onChange={handleChange}
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
              />
            </div>
            <div className="input-group">
              <select
                name="class"
                value={formData.Class}
                onChange={handleChange}
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls._id || cls.classId} value={cls._id}>{cls.className || cls.classId}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <input
                type="text"
                name="fatherName"
                placeholder="Father's Name"
                value={formData.fatherName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="fatherPhoneNumber"
                placeholder="Father's Phone (10 digits)"
                value={formData.fatherPhoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="fatherOccupation"
                placeholder="Father's Occupation (optional)"
                value={formData.fatherOccupation}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="motherName"
                placeholder="Mother's Name"
                value={formData.motherName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="motherPhoneNumber"
                placeholder="Mother's Phone (10 digits)"
                value={formData.motherPhoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="motherOccupation"
                placeholder="Mother's Occupation (optional)"
                value={formData.motherOccupation}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <input
                type="file"
                name="Studentphoto"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
            <button type="submit" className="login-button">REGISTER</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default StudentRegister;