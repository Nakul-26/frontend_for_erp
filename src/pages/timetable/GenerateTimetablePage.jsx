import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css';
import '../../styles/InputForm.css'; // Use InputForm.css for input-group and button styling
import '../../styles/Mapped.css'; // Importing Mapped.css for checkbox-group/grid styling
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

function GenerateTimetablePage() {
    const [formData, setFormData] = useState({
        academicYear: '',
        semester: '',
        startDate: '',
        endDate: '',
    });
    const [classes, setClasses] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);

    // Initial fetch of classes
    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            // Using withCredentials for API calls
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/admin/classes`, { withCredentials: true });
            if (response.data.success) {
                setClasses(response.data.data);
            }
        } catch (err) {
            // console.error('Error fetching classes:', err);
            setError('Failed to fetch classes.');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleClassSelection = (classId) => {
        setSelectedClasses(prev => {
            if (prev.includes(classId)) {
                return prev.filter(id => id !== classId);
            }
            return [...prev, classId];
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (selectedClasses.length === 0) {
            setError('Please select at least one class.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/admin/generate-timetable`,
                {
                    ...formData,
                    classes: selectedClasses
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                setSuccess('Timetable generated successfully!');
                // Reset form
                setFormData({
                    academicYear: '',
                    semester: '',
                    startDate: '',
                    endDate: '',
                });
                setSelectedClasses([]);
            } else {
                setError(response.data.message || 'Failed to generate timetable.');
            }
        } catch (err) {
            // console.error('Timetable generation error:', err);
            setError(err.response?.data?.message || 'An error occurred during timetable generation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`} style={{ fontSize: '18px' }}>
                <Navbar pageTitle={"Generate Timetable"} toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
                
                {/* <header className="dashboard-header">
                    <h1>Generate Timetable</h1>
                    <p className="dashboard-subtitle">Define parameters and select classes to generate timetables.</p>
                </header> */}

                {/* Using form-container and form-form for consistent form styling */}
                <div className="form-container" style={{ width: '80%', maxWidth: '800px', padding: '30px', marginTop: '20px' }}>
                    <form onSubmit={handleSubmit} className="form-form"> {/* Reusing form-form */}
                        <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>Timetable Details</h2>

                        {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
                        {success && <div className="success-message" style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{success}</div>}

                        <div className="input-group"> {/* Reusing input-group */}
                            <label htmlFor="academicYear">Academic Year</label>
                            <input
                                type="text"
                                id="academicYear"
                                name="academicYear"
                                value={formData.academicYear}
                                onChange={handleChange}
                                placeholder="e.g., 2025-2026"
                                required
                            />
                        </div>

                        <div className="input-group"> {/* Reusing input-group */}
                            <label htmlFor="semester">Semester</label>
                            <select
                                id="semester"
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Semester</option>
                                <option value="1">Semester 1</option>
                                <option value="2">Semester 2</option>
                            </select>
                        </div>

                        <div className="input-group"> {/* Reusing input-group */}
                            <label htmlFor="startDate">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group"> {/* Reusing input-group */}
                            <label htmlFor="endDate">End Date</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="checkbox-group-section" style={{ marginTop: '25px' }}> {/* Using styling from Mapped.css */}
                            <h3>Select Classes:</h3>
                            {classes.length > 0 ? (
                                <div className="checkbox-grid"> {/* Using styling from Mapped.css */}
                                    {classes.map((cls) => (
                                        <label key={cls.id || cls._id} className="checkbox-label"> {/* Ensure key is unique, using .id or ._id */}
                                            <input
                                                type="checkbox"
                                                checked={selectedClasses.includes(cls.id || cls._id)}
                                                onChange={() => handleClassSelection(cls.id || cls._id)}
                                            />
                                            {cls.name} ({cls.section})
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#777' }}>No classes available.</p>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className="form-button" // Reusing form-button
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Timetable'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default GenerateTimetablePage;