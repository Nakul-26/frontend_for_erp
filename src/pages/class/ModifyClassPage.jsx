import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import '../../styles/Dashboard.css';
//import '../../styles/Card.css';
import '../../styles/InputForm.css';
//import '../../styles/ClassesPage.css';
import '../../styles/EnhancedForm.css'; // Ensure EnhancedForm.css is imported for .form-page-container

const Sidebar = lazy(() => import('../../components/Sidebar'));
const Navbar = lazy(() => import('../../components/Navbar'));

function ModifyClassPage() {
    const navigate = useNavigate();
    const { c_id: paramClassId } = useParams(); // Get class ID from route parameter (e.g., /modify/CLASS123)

    // State to store the original class ID from the URL for comparison
    const [initialClassId, setInitialClassId] = useState(null);

    // --- NEW/UPDATED STATES BASED ON SCHEMA ---
    const [allSubjects, setAllSubjects] = useState([]); // Stores all subjects fetched from API
    //const [allTeachers, setAllTeachers] = useState([]); // Stores all teachers fetched from API
    const [selectedSubjects, setSelectedSubjects] = useState([]); // Stores IDs of subjects selected in multi-select

    const [formData, setFormData] = useState({
        classId: '', // Changed from c_id to classId
        name: '',
        section: '',
        classteacher: '', // Will store the ID of the selected teacher
        //nostudent: '',   
        schedule: '',
        academicYear: '',
        status: 'active',
    });
    // --- END NEW/UPDATED STATES ---

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // Effect to load class data, subjects, and teachers when the component mounts or paramClassId changes
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError('');
            setSuccess(''); // Clear success messages on new fetch

            if (!API_BASE_URL) {
                setError('Server configuration error: API URL missing.');
                setLoading(false);
                return;
            }

            try {
                // Fetch all subjects
                const subjectsResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/getall`, { withCredentials: true });
                if (subjectsResponse.data.success || subjectsResponse.data.status === "success") { // Handle both 'success' and 'status'
                    setAllSubjects(subjectsResponse.data.subjects);
                } else {
                    setError(prev => prev + (prev ? '; ' : '') + (subjectsResponse.data.message || 'Failed to fetch subjects.'));
                }

                // Fetch all teachers
                // const teachersResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/getallteachers`, { withCredentials: true }); // Assuming this endpoint exists
                // if (teachersResponse.data.success || teachersResponse.data.status === "success") { // Handle both 'success' and 'status'
                //     setAllTeachers(teachersResponse.data.teachers); // Adjust 'teachers' path as per your API response
                // } else {
                //     setError(prev => prev + (prev ? '; ' : '') + (teachersResponse.data.message || 'Failed to fetch teachers.'));
                // }

                // If 'new' is passed as paramClassId, prepare for new class creation
                if (paramClassId === "new") {
                    setFormData({ // Reset form for new entry, keeping defaults
                        classId: '', name: '', section: '', classteacher: '',
                        //nostudent: '',
                        schedule: '', academicYear: '', status: 'active',
                    });
                    setSelectedSubjects([]); // Ensure no subjects are pre-selected
                    setInitialClassId(null); // No initial ID for a new class
                    setError("Enter details for a new class.");
                    setLoading(false); // Set loading to false here for new class
                    return; // Exit as no existing class data to fetch
                }

                // If paramClassId exists and is not 'new', fetch existing class data
                const classResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/class/${paramClassId}`, { withCredentials: true });
                if (classResponse.data.success && classResponse.data.data) {
                    const fetchedClass = classResponse.data.data;
                    setFormData({
                        classId: fetchedClass.classId || '', // Use classId
                        name: fetchedClass.name || '',
                        section: fetchedClass.section || '',
                        classteacher: fetchedClass.classteacher || '', // Use classteacher (ID)
                        //nostudent: fetchedClass.nostudent || '', // Populate nostudent
                        schedule: fetchedClass.schedule || '',
                        academicYear: fetchedClass.academicYear || '',
                        status: fetchedClass.status || 'active',
                    });
                    // Set selected subjects for multi-select (assuming fetchedClass.subjects is an array of subject IDs)
                    setSelectedSubjects(fetchedClass.subjects || []);
                    setInitialClassId(fetchedClass.classId); // Store the original ID (classId)
                    setSuccess('Class details loaded successfully.');
                } else {
                    throw new Error(classResponse.data.message || 'Failed to fetch class data.');
                }
            } catch (err) {
                // console.error("Error fetching initial data:", err);
                setError(err.response?.data?.message || `Failed to load data for ID: ${paramClassId}. Please check the class ID or network.`);
                // Reset form data if fetching fails, unless it's a new class entry that failed on initial data fetch
                if (paramClassId !== "new") {
                    setFormData({
                        classId: '', name: '', section: '', classteacher: '', //nostudent: '',
                        schedule: '', academicYear: '', status: 'active',
                    });
                    setSelectedSubjects([]);
                    setInitialClassId(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [paramClassId, API_BASE_URL]); // Re-run if paramClassId or API_BASE_URL changes

    // useEffect(() => {
    //     if (formData) {
    //         setSelectedSubjects(formData.subjects?.map(s => s.id) || []);
    //     }
    // }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubjectSelection = (e) => {
        const { value, checked } = e.target;
        setSelectedSubjects(prev => {
            if (checked) {
                return [...prev, value];
            } else {
                return prev.filter(id => id !== value);
            }
        });
    };

    const handleTeacherSelection = (e) => {
        setFormData((prev) => ({
            ...prev,
            classteacher: e.target.value, // This will be the _id of the selected teacher
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!API_BASE_URL) {
            setError('API URL is missing. Cannot submit.');
            setLoading(false);
            return;
        }

        // Prepare the class data to send to the backend, strictly adhering to the schema
        const classDataToSend = {
            classId: formData.classId,
            name: formData.name,
            section: formData.section,
            classteacher: formData.classteacher, // Sends the teacher's _id
            subjects: selectedSubjects, // Correctly sends the array of selected subject IDs
            //nostudent: Number(formData.nostudent), // Ensure nostudent is converted to a number
            schedule: formData.schedule,
            academicYear: formData.academicYear,
            status: formData.status,
        };

        // --- Basic Client-Side Validation ---
        if (!classDataToSend.classId || !classDataToSend.name || !classDataToSend.section ||
            !classDataToSend.classteacher || !classDataToSend.schedule || !classDataToSend.academicYear) {
            setError('Please fill in all required text fields (Class ID, Name, Section, Class Teacher, Schedule, Academic Year).');
            setLoading(false);
            return;
        }
        // if (isNaN(classDataToSend.nostudent) || classDataToSend.nostudent < 0) { // Allow 0 students
        //     setError('Number of students must be a non-negative number.');
        //     setLoading(false);
        //     return;
        // }
        if (classDataToSend.subjects.length === 0) {
            setError('Please select at least one subject.');
            setLoading(false);
            return;
        }
        // --- End Validation ---

        try {
            // Scenario 1: Creating a brand new class (when route was /admin/classes/new)
            if (paramClassId === "new") {
                const createResponse = await axios.post(
                    `${API_BASE_URL}/api/v1/admin/registerclass`, // Assuming this is your add class endpoint
                    classDataToSend,
                    { withCredentials: true }
                );

                if (createResponse.data.success) {
                    setSuccess(`New class '${formData.classId}' registered successfully!`);
                    setTimeout(() => navigate('/admin/classes'), 2000);
                } else {
                    throw new Error(createResponse.data.message || 'Failed to register new class.');
                }
            }
            // Scenario 2: Class ID changed (original ID was paramClassId, new ID is formData.classId)
            else if (formData.classId !== initialClassId) {
                // To change a primary key (classId), you typically need to create a new record and delete the old one.
                // 1. Create New Class with the new ID
                const createResponse = await axios.post(
                    `${API_BASE_URL}/api/v1/admin/registerclass`,
                    classDataToSend,
                    { withCredentials: true }
                );

                if (createResponse.data.success) {
                    setSuccess(`New class '${formData.classId}' created successfully.`);

                    // 2. Delete Old Class using the original ID (initialClassId)
                    const deleteResponse = await axios.delete(
                        `${API_BASE_URL}/api/v1/admin/class/${initialClassId}`,
                        { withCredentials: true }
                    );

                    if (deleteResponse.data.success) {
                        setSuccess(`Class ID changed from '${initialClassId}' to '${formData.classId}'. Original class deleted successfully.`);
                    } else {
                        // console.warn(`Warning: New class created, but failed to delete old class '${initialClassId}'.`);
                        setError(`Class updated (new ID: ${formData.classId}), but failed to delete original class '${initialClassId}'.`);
                    }
                    setTimeout(() => navigate('/admin/classes'), 2000);
                } else {
                    throw new Error(createResponse.data.message || 'Failed to create new class with updated ID.');
                }
            }
            // Scenario 3: Class ID not changed - update existing class
            else {
                const response = await axios.put(
                    `${API_BASE_URL}/api/v1/admin/class/${paramClassId}`, // Use paramClassId for PUT
                    classDataToSend,
                    { withCredentials: true }
                );

                if (response.data.success) {
                    setSuccess('Class updated successfully!');
                    setTimeout(() => navigate('/admin/classes'), 2000);
                } else {
                    throw new Error(response.data.message || 'Failed to update class.');
                }
            }
        } catch (err) {
            // console.error("Modify Class Error:", err);
            // More robust error handling
            if (err.response) {
                setError(err.response.data?.message || `Server Error: ${err.response.status}`);
            } else if (err.request) {
                setError('Network error: No response from server. Check your connection.');
            } else {
                setError(`Request failed: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Removed inline styles. Use CSS classes for checkbox group/items.

    if (loading) {
        return (
            <Suspense fallback={<div>Loading components...</div>}>
                <div className="dashboard-container">
                    <Sidebar isOpen={isSidebarOpen} />
                    <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
                        <Navbar pageTitle={"Modify Class"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                        {/* <header className="dashboard-header">
                            <h1>Modify Class</h1>
                            <p className="dashboard-subtitle">Loading class details...</p>
                        </header> */}
                        <div className="login-container" style={{ width: '600px', textAlign: 'center' }}>
                            Loading...
                        </div>
                    </main>
                </div>
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<div>Loading components...</div>}>
            <div className="dashboard-container">
                <Sidebar isOpen={isSidebarOpen} />
                <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}
                    style={{ overflowX: 'hidden', width: '100vw', boxSizing: 'border-box' }}>
                    <Navbar pageTitle={"Modify Class"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                    {/* <header className="dashboard-header">
                        <h1>{paramClassId === "new" ? "Register New Class" : "Modify Class"}</h1>
                        <p className="dashboard-subtitle">
                            {paramClassId === "new" ? "Enter details for a new class" : "Edit existing class details"}
                        </p>
                    </header> */}
                    {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
                    {success && <div className="success-message" style={{ color: 'green', textAlign: 'center', marginBottom: '20px' }}>{success}</div>}

                    <div className="form-page-container" style={{ overflowX: 'hidden', width: '100vw', boxSizing: 'border-box' }}>
                        <div className="form-content-wrapper">
                            <form onSubmit={handleSubmit} className="enhanced-form modify-class-form">
                                <div className="form-group">
                                    <label htmlFor="classId">Class ID</label>
                                    <input
                                        type="text"
                                        id="classId"
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="name">Class Name</label>
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
                                    <label htmlFor="section">Section</label>
                                    <input
                                        type="text"
                                        id="section"
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="classteacher">Class Teacher</label>
                                    <input
                                        id="classteacher"
                                        name="classteacher"
                                        value={formData.classteacher}
                                        onChange={handleTeacherSelection}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Subjects:</label>
                                    <div className="checkbox-group">
                                        {allSubjects.map(subject => (
                                            <div key={subject._id} className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    id={`subject-${subject._id}`}
                                                    value={subject._id}
                                                    checked={selectedSubjects.includes(subject._id)}
                                                    onChange={handleSubjectSelection}
                                                    className="checkbox-input"
                                                />
                                                <label htmlFor={`subject-${subject._id}`} className="checkbox-label">
                                                    {subject.name} ({subject.code})
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedSubjects.length > 0 && (
                                        <p className="selected-items">
                                            Selected: {selectedSubjects.map(id => allSubjects.find(s => s._id === id)?.name || id).join(', ')}
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="schedule">Schedule</label>
                                    <input
                                        type="text"
                                        id="schedule"
                                        name="schedule"
                                        value={formData.schedule}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="academicYear">Academic Year</label>
                                    <input
                                        type="text"
                                        id="academicYear"
                                        name="academicYear"
                                        value={formData.academicYear}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="status">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                <div className="form-group form-actions">
                                    <button type="submit" className="login-button">
                                        {paramClassId === "new" ? "REGISTER NEW CLASS" : "SAVE CHANGES"}
                                    </button>
                                    <button type="button" className="login-button" onClick={() => navigate('/admin/classes')}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </Suspense>
    );
}

export default ModifyClassPage;