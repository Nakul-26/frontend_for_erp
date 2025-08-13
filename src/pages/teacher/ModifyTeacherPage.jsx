// src/pages/ModifyTeacherPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
// import '../../styles/EnhancedForm.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext'; // Assuming useAuth is correctly implemented

function ModifyTeacherPage() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchData, setSearchData] = useState({ id: '' });
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    age: '',
    address: '',
    phone: '',
    dateofjoining: '',
    subjects: '', // Keep as comma-separated string
    status: '',
  });
  const [allClasses, setAllClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [coverImage, setCoverImage] = useState(null); // Holds the NEWLY selected File object from the input
  const [existingCoverImageUrl, setExistingCoverImageUrl] = useState(''); // Holds the URL of the image fetched from backend for display
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [originalId, setOriginalId] = useState(null); // State to store the original ID fetched
  const navigate = useNavigate();
  const location = useLocation();
  const { adminData } = useAuth(); // Assuming adminData is used elsewhere or for auth checks

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

  // Memoized function for searching a teacher
  const handleSearchSubmit = useCallback(async (teacherIdFromParam = null) => {
    setError('');
    setSuccess('');
    setSearchResult(null);
    setCoverImage(null);
    setExistingCoverImageUrl('');
    setSelectedClasses([]);

    const idToSearch = teacherIdFromParam || searchData.id;
    if (!idToSearch) {
      setError('Please enter a Teacher ID to search.');
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/admin/teacher/${idToSearch}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const teacher = response.data.data;
        setSearchResult(teacher);
        setOriginalId(teacher.id);

        setFormData({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          password: '',
          age: teacher.age,
          address: teacher.address || '',
          phone: teacher.phone,
          dateofjoining: teacher.dateofjoining ? new Date(teacher.dateofjoining).toISOString().split('T')[0] : '',
          subjects: teacher.subjects ? teacher.subjects.join(', ') : '',
          status: teacher.status || '',
        });

        // Set selected classes
        setSelectedClasses(teacher.classes || []);

        if (teacher.coverImage) {
          setExistingCoverImageUrl(teacher.coverImage);
        }
        setSuccess('Teacher found!');
        setActiveTab('update'); // Automatically switch to update tab
      } else {
        throw new Error(response.data.message || 'Teacher not found');
      }
    } catch (err) {
      setError(`Unable to fetch teacher: ${err.response?.data?.message || err.message}. Please check the ID.`);
      // console.error('Search Teacher Error:', err);
    }
  }, [searchData.id, API_BASE_URL]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('t_id'); // This is the URL parameter name from TeacherCard
    if (id) {
      setSearchData({ id });
      handleSearchSubmit(id);
    }
  }, [location.search, handleSearchSubmit]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    setSearchResult(null);
    setCoverImage(null);
    setExistingCoverImageUrl('');
    setOriginalId(null);

    if (tab !== 'update' || !searchResult) {
      setFormData({
        id: '', name: '', email: '', password: '', age: '', address: '', phone: '',
        dateofjoining: '', subjects: '', classes: '', status: '',
      });
    }
  };

  const handleSearchChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    if (selectedClasses.length === 0) {
      setError('Please select at least one class.');
      setLoading(false);
      return;
    }

    // Validate that we have either a new image or existing image
    if (!coverImage && !existingCoverImageUrl) {
      setError('Please upload a teacher photo.');
      setLoading(false);
      return;
    }

    const commonTeacherData = new FormData();

    // Convert comma-separated string to array for subjects
    const subjectsArray = formData.subjects ? formData.subjects.split(',').map((s) => s.trim()).filter(s => s !== '') : [];

    // Append subjects and classes as individual items
    subjectsArray.forEach(subject => commonTeacherData.append('subjects[]', subject));
    selectedClasses.forEach(cls => commonTeacherData.append('classes[]', cls));
    
    commonTeacherData.append('name', formData.name);
    commonTeacherData.append('email', formData.email);
    if (formData.password) commonTeacherData.append('password', formData.password);
    commonTeacherData.append('age', formData.age);
    commonTeacherData.append('address', formData.address || '');
    commonTeacherData.append('phone', formData.phone);
    commonTeacherData.append('dateofjoining', formData.dateofjoining);
  
    // Handle image upload: either send new image file or existing image URL
    if (coverImage instanceof File) {
      commonTeacherData.append('coverImage', coverImage);
    } else if (existingCoverImageUrl) {
      commonTeacherData.append('coverImage', existingCoverImageUrl);
    }

    // LOGIC FOR CHANGING TEACHER ID (DELETE OLD, REGISTER NEW) vs. UPDATE EXISTING
    if (formData.id !== originalId && originalId !== null) {
      // Scenario: Teacher ID has been changed
      if (!formData.password) {
        setError('Password is required when changing Teacher ID (new registration).');
        setLoading(false);
        return;
      }

      // For new registration
      commonTeacherData.append('id', formData.id);

      try {
        const registerResponse = await axios.post(
          `${API_BASE_URL}/api/v1/admin/teachregister`,
          commonTeacherData,
          { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (registerResponse.data.success) {
          try {
            const deleteResponse = await axios.delete(
              `${API_BASE_URL}/api/v1/admin/teacher/${originalId}`,
              { withCredentials: true }
            );

            if (deleteResponse.data.success) {
              setSuccess(`Teacher ID changed from ${originalId} to ${formData.id} successfully.`);
              setTimeout(() => navigate('/admin/teachers'), 2000);
            } else {
              setError(`New teacher ${formData.id} registered, but failed to delete old teacher ${originalId}.`);
              // console.error('Delete Old Teacher Error:', deleteResponse.data.message);
            }
          } catch (deleteErr) {
            setError(`New teacher ${formData.id} registered, but encountered error deleting old teacher ${originalId}.`);
            // console.error('Delete Old Teacher Network Error:', deleteErr);
          }
        } else {
          setError(`Failed to register new teacher with ID ${formData.id}. ${registerResponse.data.message || ''}`);
          // console.error('Register New Teacher Error:', registerResponse.data.message);
        }
      } catch (registerErr) {
        setError(`Unable to register new teacher with ID ${formData.id} via backend. It might already exist or there's a server issue.`);
        // console.error('Register New Teacher Network Error:', registerErr.response?.data?.message || registerErr.message);
      }
    } else {
      // Scenario: Teacher ID has NOT been changed
      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/v1/admin/teacher/${formData.id}`,
          commonTeacherData, 
          { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (response.data.success) {
          setSuccess('Teacher updated successfully.');
          setTimeout(() => navigate('/admin/teachers'), 2000);
        } else {
          throw new Error(response.data.message || 'Failed to update teacher');
        }
      } catch (err) {
        setError(`Unable to update teacher: ${err.response?.data?.message || err.message}.`);
        // console.error('Update Teacher Error:', err);
      }
    }
    setLoading(false);
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const isConfirmed = window.confirm(`Are you sure you want to delete teacher with ID: ${searchData.id}?`);
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/admin/teacher/${searchData.id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess('Teacher deleted successfully.');
        setTimeout(() => navigate('/admin/teachers'), 2000);
        setSearchData({ id: '' });
        setSearchResult(null);
        setFormData({
          id: '', name: '', email: '', password: '', age: '', address: '', phone: '',
          dateofjoining: '', subjects: '', classes: '', status: '',
        });
        setCoverImage(null);
        setExistingCoverImageUrl('');
        setOriginalId(null);
        setActiveTab('search');
      } else {
        throw new Error(response.data.message || 'Failed to delete teacher');
      }
    } catch (err) {
      setError(`Unable to delete teacher: ${err.response?.data?.message || err.message}.`);
      // console.error('Delete Teacher Error:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}
        style={{ overflowX: 'hidden', width: '100vw', boxSizing: 'border-box' }}>
        <Navbar pageTitle={"Modify Teacher"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        {/* <header className="dashboard-header">
          <h1>Modify Teacher</h1>
          <p className="dashboard-subtitle">Search, update, or delete a teacher</p>
        </header> */}
        {/* <div className="form-page-container" style={{ overflowX: 'hidden', width: '100vw', boxSizing: 'border-box' }}>
          <div className="form-content-wrapper">
            
          </div>
        </div> */}
            <div className="tab-content" style={{ background: 'none', boxShadow: 'none', padding: 0 }}>
              {activeTab === 'search' && (
                <form className="enhanced-form modify-teacher-form" onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }}>
                  <div className="form-group">
                    <input
                      type="text"
                      name="id"
                      placeholder="Teacher ID (e.g., TCH001)"
                      value={searchData.id}
                      onChange={handleSearchChange}
                      required
                    />
                  </div>
                  {error && (
                    <div className="error-message">{error}</div>
                  )}
                  {success && (
                    <div className="success-message">{success}</div>
                  )}
                  {searchResult && (
                    <div style={{ marginTop: '20px', textAlign: 'left' }}>
                      <h3>Teacher Details:</h3>
                      {searchResult.coverImage && (
                        <div className="teacher-image-preview" style={{ marginBottom: '10px', textAlign: 'center' }}>
                          <img
                            src={searchResult.coverImage}
                            alt="Teacher"
                            style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }}
                          />
                        </div>
                      )}
                      <p><strong>ID:</strong> {searchResult.id}</p>
                      <p><strong>Name:</strong> {searchResult.name}</p>
                      <p><strong>Email:</strong> {searchResult.email}</p>
                      <p><strong>Age:</strong> {searchResult.age}</p>
                      <p><strong>Address:</strong> {searchResult.address || 'N/A'}</p>
                      <p><strong>Phone:</strong> {searchResult.phone}</p>
                      <p>
                        <strong>Date of Joining:</strong>{' '}
                        {searchResult.dateofjoining ? new Date(searchResult.dateofjoining).toLocaleDateString() : 'N/A'}
                      </p>
                      <p><strong>Subjects:</strong> {searchResult.subjects?.join(', ') || 'N/A'}</p>
                      <p><strong>Classes:</strong> {searchResult.classes?.join(', ') || 'N/A'}</p>
                      <p><strong>Status:</strong> {searchResult.status || 'N/A'}</p>
                    </div>
                  )}
                  <button type="submit" className="form-button">
                    Search Teacher
                  </button>
                </form>
              )}
              {activeTab === 'update' && (
                <form className="enhanced-form modify-teacher-form" onSubmit={handleUpdateSubmit}>
                  <div className="form-group">
                    <input
                      type="text"
                      name="id"
                      placeholder="Teacher ID (e.g., TCH001)"
                      value={formData.id}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      name="password"
                      placeholder="New Password (optional for update, required for new ID)"
                      value={formData.password}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="number"
                      name="age"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleFormChange}
                      required
                      min="18"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="address"
                      placeholder="Address (optional)"
                      value={formData.address}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone (10 digits)"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateofjoining">Date of Joining:</label>
                    <input
                      type="date"
                      name="dateofjoining"
                      id="dateofjoining"
                      value={formData.dateofjoining}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="subjects"
                      placeholder="Subjects (comma-separated, e.g., Math,Science)"
                      value={formData.subjects}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label" style={{ alignSelf: 'flex-start', fontSize: '0.95em', color: '#ccc', marginBottom: '5px' }}>Select Classes:</label>
                    <div className="checkbox-group">
                      {allClasses.length > 0 ? (
                        allClasses.map((cls) => (
                          <div key={cls.classId} className="checkbox-item">
                            <input
                              type="checkbox"
                              id={`class-${cls.classId}`}
                              value={cls.classId}
                              checked={selectedClasses.includes(cls.classId)}
                              onChange={handleClassSelection}
                              disabled={loading}
                              className="checkbox-input"
                            />
                            <label htmlFor={`class-${cls.classId}`} className="checkbox-label">
                              {cls.name} ({cls.classId})
                            </label>
                          </div>
                        ))
                      ) : (
                        <p>No classes available</p>
                      )}
                    </div>
                    {selectedClasses.length > 0 && (
                      <p className="selected-items">
                        Selected: {selectedClasses.length} class(es)
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status:</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      required
                      disabled={formData.id === originalId && originalId !== null}
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="coverImage">Teacher Photo:</label>
                    {existingCoverImageUrl && !coverImage && (
                      <div className="current-image-preview" style={{ marginBottom: '10px', textAlign: 'center' }}>
                        <img
                          src={existingCoverImageUrl}
                          alt="Current Teacher"
                          style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '0%', objectFit: 'cover', border: '1px solid #ddd' }}
                        />
                      </div>
                    )}
                    {coverImage && (
                      <div className="new-image-preview" style={{ marginBottom: '10px', textAlign: 'center' }}>
                        <p>Photo:</p>
                        <img
                          src={URL.createObjectURL(coverImage)}
                          alt="New Teacher"
                          style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '0%', objectFit: 'cover', border: '1px solid #ddd' }}
                        />
                      </div>
                    )}
                    <input type="file" name="coverImage" id="coverImage" accept="image/*" onChange={handleFileChange} />
                  </div>
                  {error && (
                    <div className="error-message">{error}</div>
                  )}
                  {success && (
                    <div className="success-message">{success}</div>
                  )}
                  <div className="form-group form-actions">
                    <button type="submit" className="form-button">
                      Update Teacher
                    </button>
                  </div>
                </form>
              )}
            </div>
      </main>
    </div>
  );
}

export default ModifyTeacherPage;