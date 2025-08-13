// src/pages/UpdateSubjectPage.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/EnhancedForm.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function UpdateSubjectPage() {
  const { subjectCode: initialSubjectCode } = useParams(); // Get subject code from URL
  const navigate = useNavigate();
  const { adminData } = useAuth(); // Assuming adminData is needed for authenticated requests

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    shortName: '',
    description: '',
    examDetails: '',
    lectureHours: '',
    courseType: 'core',
    syllabus: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Effect to load subject data when the component mounts or subjectCode changes
  useEffect(() => {
    const fetchSubjectDetails = async () => {
      // If 'new' is passed, it means we're starting a new subject entry, not updating an existing one.
      if (initialSubjectCode === "new") {
        setFormData({ // Reset form for new entry, keeping defaults
          code: '',
          name: '',
          shortName: '',
          description: '',
          examDetails: '',
          lectureHours: '',
          courseType: 'core',
          syllabus: '',
          isActive: true,
        });
        setError("Enter details for a new subject."); // More guiding message
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      setSuccess('');
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/admin/sub?code=${initialSubjectCode}`, // Use initialSubjectCode for fetching
          { withCredentials: true }
        );

        if (response.data.status === "success" && response.data.subject) {
          const fetchedSubject = response.data.subject;
          setFormData({
            code: fetchedSubject.code,
            name: fetchedSubject.name,
            shortName: fetchedSubject.shortName || '', // Ensure no null/undefined for controlled inputs
            description: fetchedSubject.description || '',
            examDetails: fetchedSubject.examDetails,
            lectureHours: fetchedSubject.lectureHours.toString(), // Convert to string for input type="number" value
            courseType: fetchedSubject.courseType,
            syllabus: fetchedSubject.syllabus || '',
            isActive: fetchedSubject.isActive,
          });
          setSuccess('Subject details loaded successfully.');
        } else {
          // If subject not found for a given code (not 'new')
          throw new Error('Subject not found or failed to fetch details.');
        }
      } catch (err) {
        // console.error("Error fetching subject details:", err);
        setError(err.response?.data?.message || 'Failed to load subject details from backend. Please check the subject code.');
        // If an error occurs, reset form data to prevent displaying incorrect previous data
        setFormData({
          code: '', name: '', shortName: '', description: '', examDetails: '',
          lectureHours: '', courseType: 'core', syllabus: '', isActive: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [initialSubjectCode, API_BASE_URL]); // Re-run if initialSubjectCode or API_BASE_URL changes

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const subjectData = {
      
      name: formData.name,
      shortName: formData.shortName || undefined,
      description: formData.description || undefined,
      examDetails: formData.examDetails,
      lectureHours: parseInt(formData.lectureHours),
      courseType: formData.courseType,
      syllabus: formData.syllabus || undefined,
      isActive: formData.isActive,
    };

    // Determine if the subject code has changed AND if we're not starting a 'new' subject
    const isCodeChanged = formData.code !== initialSubjectCode && initialSubjectCode !== "new";

    try {
      if (isCodeChanged) {
        // Scenario 2: Code changed - create new, then delete old
        // 1. Create New Subject
        const createResponse = await axios.post(
          `${API_BASE_URL}/api/v1/admin/registersubject`, // Assuming this is your add subject endpoint
          subjectData,
          { withCredentials: true }
        );

        if (createResponse.data.status !== "success") {
          throw new Error(createResponse.data.message || 'Failed to create new subject with updated code.');
        }
        setSuccess(`New subject '${formData.code}' created successfully.`);

        // 2. Delete Old Subject
        // Using path parameter for DELETE, which is more RESTful.
        // If your backend expects a query parameter, change this line:
        // `${API_BASE_URL}/api/v1/admin/subdelete?code=${initialSubjectCode}`
        const deleteResponse = await axios.delete(
          `${API_BASE_URL}/api/v1/admin/subject/${initialSubjectCode}`,
          { withCredentials: true }
        );

        if (deleteResponse.data.status !== "success") {
          // console.warn(`Warning: New subject created, but failed to delete old subject '${initialSubjectCode}'.`);
          setError(`Subject updated, but failed to delete original subject '${initialSubjectCode}'.`);
        } else {
          setSuccess(`Subject code changed from '${initialSubjectCode}' to '${formData.code}'. Original subject deleted successfully.`);
        }

      } else if (initialSubjectCode === "new") {
        // Scenario 3: Creating a brand new subject from the /new route
        const createResponse = await axios.post(
          `${API_BASE_URL}/api/v1/admin/registersubject`, // Assuming this is your add subject endpoint
          subjectData,
          { withCredentials: true }
        );

        if (createResponse.data.status === "success") {
          setSuccess(`New subject '${formData.code}' registered successfully.`);
        } else {
          throw new Error(createResponse.data.message || 'Failed to register new subject.');
        }

      } else {
        // Scenario 1: Code not changed - update existing subject
        const response = await axios.put(
          `${API_BASE_URL}/api/v1/admin/updatesubject/${initialSubjectCode}`, // Use initialSubjectCode for PUT
          subjectData,
          { withCredentials: true }
        );
        if (response.data.success === true) {
          setSuccess('Subject updated successfully');
        } else {
          // console.error("3 Failed to update subject:", response.data);
          throw new Error(response.data.message || 'Failed to update subject');
        }
      }
      setTimeout(() => navigate('/admin/subjects'), 2000);
    } catch (err) {
      // console.error("5 Error during subject operation:", err);
      // console.error("Update/Create/Delete Subject Error:", err);
      // More specific error messages based on `err.response` if available
      setError(err.response?.data?.message || 'Unable to complete subject operation via backend.');
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
          <Navbar pageTitle={"Update Subject"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          {/* <header className="dashboard-header">
            <h1>Update Subject</h1>
            <p className="dashboard-subtitle">Loading subject details...</p>
          </header> */}
          <div className="form-content-wrapper">
            Loading...
          </div>
        </main>
      </div>
    );
  }

  // If there's an error and not loading, display a message and no form
  // Removed !searchResult as it's not defined in this component
  if (error && !isLoading) {
    return (
      <div className="dashboard-container">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
          <Navbar pageTitle={"Update Subject"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          {/* <header className="dashboard-header">
            <h1>Update Subject</h1>
            <p className="dashboard-subtitle">Error or New Subject Entry</p>
          </header> */}
          <div className="form-container" style={{ width: '600px', textAlign: 'center' }}>
            <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>
            {/* Provide a way to go back or start fresh if it's an error */}
            {initialSubjectCode !== "new" && (
              <button className="form-button" onClick={() => navigate('/admin/subjects')}>Go Back to Subjects</button>
            )}
            {initialSubjectCode === "new" && (
              <p style={{ marginTop: '10px', color: '#555' }}>
                Fill the form below to register a new subject.
              </p>
            )}
          </div>
          {/* Render the form even with an error if it's a "new" subject entry */}
          {initialSubjectCode === "new" && (
            <div className="form-content-wrapper">
              <form className="enhanced-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    name="code"
                    placeholder="Subject Code (e.g., MATH101)"
                    value={formData.code}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Subject Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    name="shortName"
                    placeholder="Short Name (optional)"
                    value={formData.shortName}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <textarea
                    name="description"
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <textarea
                    name="examDetails"
                    placeholder="Exam Details (e.g., 40% internals, 60% final exam)"
                    value={formData.examDetails}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    name="lectureHours"
                    placeholder="Lecture Hours"
                    value={formData.lectureHours}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>
                <div className="input-group">
                  <select name="courseType" value={formData.courseType} onChange={handleChange} required>
                    <option value="core">Core</option>
                    <option value="elective">Elective</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>
                <div className="input-group">
                  <textarea
                    name="syllabus"
                    placeholder="Syllabus (optional, e.g., Unit 1: Algebra, Unit 2: Calculus)"
                    value={formData.syllabus}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    Is Active
                  </label>
                </div>
                {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
                {success && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
                <button type="submit" className="form-button">REGISTER NEW SUBJECT</button>
              </form>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar pageTitle={"Update Subject"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        {/* <header className="dashboard-header">
          <h1>Update Subject</h1>
          <p className="dashboard-subtitle">Modify an existing subject</p>
        </header> */}
        <div className="form-content-wrapper">
          <form className="enhanced-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="code"
                placeholder="Subject Code (e.g., MATH101)"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder="Subject Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="shortName"
                placeholder="Short Name (optional)"
                value={formData.shortName}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <textarea
                name="description"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <textarea
                name="examDetails"
                placeholder="Exam Details (e.g., 40% internals, 60% final exam)"
                value={formData.examDetails}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="number"
                name="lectureHours"
                placeholder="Lecture Hours"
                value={formData.lectureHours}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
            <div className="input-group">
              <select name="courseType" value={formData.courseType} onChange={handleChange} required>
                <option value="core">Core</option>
                <option value="elective">Elective</option>
                <option value="lab">Lab</option>
              </select>
            </div>
            <div className="input-group">
              <textarea
                name="syllabus"
                placeholder="Syllabus (optional, e.g., Unit 1: Algebra, Unit 2: Calculus)"
                value={formData.syllabus}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Is Active
              </label>
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
            <button type="submit" className="form-button">UPDATE SUBJECT</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default UpdateSubjectPage;