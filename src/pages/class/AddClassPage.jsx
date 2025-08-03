import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/EnhancedForm.css';

// Lazy load components for better performance
const Sidebar = lazy(() => import('../../components/Sidebar'));
const Navbar = lazy(() => import('../../components/Navbar'));

function AddClassPage() {
    // State to store fetched teachers (if classteacher is an ObjectId)
    const [teachers, setTeachers] = useState([]);
    // State to store fetched subjects
    const [subjects, setSubjects] = useState([]);
    // State to store the IDs of subjects selected by the user
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    // const [showSubjectsDelayed, setShowSubjectsDelayed] = useState(false); // No longer needed for this functionality

    // State for the form data
    const [formData, setFormData] = useState({
        classId: "",
        name: "",
        section: "",
        classteacher: "", // Will be a string name or a teacher ID depending on backend schema
        // 'subjects' field is implicitly handled by selectedSubjects, no need for it in formData
        nostudent: "", // Storing as string initially, will convert to number on submit
        schedule: "",
        academicYear: "",
        status: "active",
    });

    // State for UI feedback
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
    const navigate = useNavigate();
    const { adminData } = useAuth(); // Assuming adminData contains necessary auth info

    // Get API base URL from environment variables
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // Log an error if API_BASE_URL is not defined at startup
    useEffect(() => {
        if (!API_BASE_URL) {
            console.error('API URL is not defined in environment variables.');
            setError('Configuration error: API URL is missing.');
        }
    }, [API_BASE_URL]);

    // Effect to fetch teachers and subjects when the component mounts or API_BASE_URL changes
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(''); // Clear previous errors

            if (!API_BASE_URL) {
                setError('API URL is not configured. Cannot fetch data.');
                setLoading(false);
                return;
            }

            try {
                // Fetch Teachers (Uncomment this block if your backend expects a Teacher ObjectId for classteacher)
                // const teachersResponse = await axios.get(`${API_BASE_URL}/api/v1/teacher/all`, { withCredentials: true });
                // if (teachersResponse.data.success) {
                //      setTeachers(teachersResponse.data.data); // Adjust 'data' path as per your API response
                // } else {
                //      setError(prev => prev + (prev ? '; ' : '') + (teachersResponse.data.message || 'Failed to fetch teachers.'));
                // }

                // Fetch Subjects
                const subjectsResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/getall`, { withCredentials: true });
                if (subjectsResponse.data.status === "success") {
                    setSubjects(subjectsResponse.data.subjects);
                    // console.log('Subjects state updated:', subjectsResponse.data.subjects);
                } else {
                    setError(prev => prev + (prev ? '; ' : '') + (subjectsResponse.data.message || 'Failed to fetch subjects.'));
                }
                // console.log(subjectsResponse);
                // No longer need a delay for showSubjectsDelayed with checkboxes
                // setTimeout(() => {
                //     setShowSubjectsDelayed(true);
                // }, 10000);

            } catch (err) {
                console.error('Failed to fetch initial data (teachers/subjects):', err);
                let errorMessage = 'Failed to load available data. Please try again.';
                if (err.response && err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [API_BASE_URL]); // Depend on API_BASE_URL to re-fetch if it changes

    // Handles changes for simple input fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // --- UPDATED: Handles changes for the multiple checkboxes for subjects ---
    const handleSubjectSelection = (e) => {
        const { value, checked } = e.target; // Get value (subject._id) and checked status

        setSelectedSubjects((prevSelected) => {
            if (checked) {
                // Add the subject ID if it's checked and not already in the array
                return [...prevSelected, value];
            } else {
                // Remove the subject ID if it's unchecked
                return prevSelected.filter((subjectId) => subjectId !== value);
            }
        });
    };
    // ---------------------------------------------------------------------

    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!API_BASE_URL) {
            setError('API URL is not configured. Cannot submit.');
            setLoading(false);
            return;
        }

        // Construct the payload for the API call
        const payload = {
            classId: formData.classId,
            name: formData.name,
            section: formData.section,
            classteacher: formData.classteacher,
            subjects: selectedSubjects, // Correctly sends the array of selected subject IDs
            //nostudent: Number(formData.nostudent), // Ensure nostudent is converted to a number
            schedule: formData.schedule,
            academicYear: formData.academicYear,
            status: formData.status,
        };

        // Client-side validation (optional but recommended)
        if (!payload.classId || !payload.name || !payload.section || !payload.schedule || !payload.academicYear || !payload.classteacher) {
            setError('Please fill in all required text fields.');
            setLoading(false);
            return;
        }
        // if (isNaN(payload.nostudent) || payload.nostudent <= 0) {
        //      setError('Number of students must be a positive number.');
        //      setLoading(false);
        //      return;
        // }

        if (payload.subjects.length === 0) {
            setError('Please select at least one subject.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/v1/admin/registerclass`,
                payload,
                { withCredentials: true } // Important for sending cookies/session info
            );

            if (response.data.success) {
                setSuccess('Class registered successfully!');
                // Reset form and selected subjects after successful submission
                setFormData({
                    classId: "", name: "", section: "", classteacher: "",
                    nostudent: "", schedule: "", academicYear: "", status: "active",
                });
                setSelectedSubjects([]); // Reset selected subjects
                setTimeout(() => navigate('/admin/classes'), 2000); // Redirect after 2 seconds
            } else {
                // Backend sent a non-success response, extract message
                setError(response.data.message || 'Failed to add class. Please try again.');
            }
        } catch (err) {
            console.error('Add Class Error:', err);

            // Detailed error handling for Axios
            if (err.response) {
                // Server responded with a status code outside the 2xx range
                if (err.response.data) {
                    if (err.response.data.errors) { // Handles validation errors (e.g., from Zod/Mongoose)
                        if (Array.isArray(err.response.data.errors)) {
                            setError(err.response.data.errors.join('; '));
                        } else if (typeof err.response.data.errors === 'object') {
                            const messages = Object.values(err.response.data.errors).map(msg => String(msg));
                            setError(messages.join('; '));
                        }
                    } else if (err.response.data.message) { // Standard message field
                        setError(String(err.response.data.message));
                    } else {
                        setError(`Server responded with: ${err.response.status} - ${err.response.statusText || 'Unknown Server Error'}`);
                    }
                } else {
                    setError(`Server error: ${err.response.status} - ${err.response.statusText || 'An unknown error occurred'}`);
                }
            } else if (err.request) {
                // The request was made but no response was received
                setError('Network error: Could not reach the server. Please check your internet connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError(`Request error: ${err.message || 'An unexpected error occurred.'}`);
            }
        } finally {
            setLoading(false); // Always stop loading, regardless of success or failure
        }
    };

    return (
        <Suspense fallback={<div>Loading dashboard...</div>}>
            <div className="form-page-container">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}> 
                    <Navbar pageTitle={"Add Class"} role="admin" toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
                    {/* <header className="dashboard-header">
                        <h1>Add Class</h1>
                        <p className="dashboard-subtitle">Create a new class in the system</p>
                    </header> */}
                    <div className="form-content-wrapper">
                        <form className="enhanced-form add-class-form form-form" onSubmit={handleSubmit}>
                            {/* Class ID */}
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="classId"
                                    placeholder="Class ID (e.g., C001)"
                                    value={formData.classId}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {/* Class Name */}
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Class Name (e.g., Grade 10)"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {/* Section */}
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="section"
                                    placeholder="Section (e.g., A, B)"
                                    value={formData.section}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {/* Class Teacher Input */}
                            <div className="input-group">
                                {/* Option 2: Text input for Class Teacher (if backend accepts name string) */}
                                <input
                                    type="text"
                                    name="classteacher"
                                    placeholder="Class Teacher Name/ID"
                                    value={formData.classteacher}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            {/* Subjects Checkbox Group */}
                            <div className="input-group">
                                <label className="input-label">Select Subjects:</label>

                                <div className="checkbox-group"> {/* This div is now correctly styled to show checkboxes */}
                                    {subjects.length > 0 ? (
                                        subjects.map((subject) => (
                                            <div key={subject._id} className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    id={`subject-${subject._id}`} // Unique ID for each checkbox
                                                    value={subject._id}
                                                    checked={selectedSubjects.includes(subject._id)} // Controlled by state
                                                    onChange={handleSubjectSelection} // Correct handler for checkboxes
                                                    // The 'required' attribute on individual checkboxes can be tricky for groups.
                                                    // Consider handling this validation in your form submission logic.
                                                    // For native HTML5 validation, 'required' on a checkbox means it *must* be checked.
                                                    // Here, we want at least one selected, which is handled in handleSubmit.
                                                    // required={selectedSubjects.length === 0} // You can uncomment if you want native HTML5 "at least one" validation
                                                />
                                                <label htmlFor={`subject-${subject._id}`}>
                                                    {subject.name} ({subject.code})
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No subjects available</p>
                                    )}
                                </div>

                                {/* Display selected subjects for user feedback */}
                                {selectedSubjects.length > 0 && (
                                    <p className="selected-items">
                                        Selected: {selectedSubjects.map(id => subjects.find(s => s._id === id)?.name || id).join(', ')}
                                    </p>
                                )}
                            </div>
                            {/* Schedule */}
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="schedule"
                                    placeholder="Schedule (e.g., Mon-Fri 9-3)"
                                    value={formData.schedule}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {/* Academic Year */}
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="academicYear"
                                    placeholder="Academic Year (e.g., 2023-2024)"
                                    value={formData.academicYear}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {/* Status Dropdown */}
                            <div className="input-group">
                                <select name="status" value={formData.status} onChange={handleChange} disabled={loading}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {/* Error and Success Messages */}
                            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
                            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{success}</div>}

                            {/* Submit Button */}
                            <button type="submit" className="form-button" disabled={loading}>
                                {loading ? 'Adding Class...' : 'ADD CLASS'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </Suspense>
    );
}

export default AddClassPage;