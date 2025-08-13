// src/components/ClassCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ClassCard.css'; // Assuming this provides necessary styling

function ClassCard({ classData, onDelete, allSubjects }) {
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // Helper function to safely get a value, handling potential null/undefined
    const getValue = (value, fallback = 'N/A') => {
        return value !== undefined && value !== null && value !== '' ? value : fallback;
    };

    // Helper function to render subjects array by looking up subject codes
    const renderSubjects = (subjectIdsArray) => {
        if (!subjectIdsArray || subjectIdsArray.length === 0) {
            return 'No subjects assigned';
        }
        return subjectIdsArray.map(subjectID => { // Corrected parameter name to subjectID
            const subject = allSubjects.find(s => s._id === subjectID);
            // Return the subject code if found, otherwise the ID itself or a fallback
            return subject ? getValue(subject.code, subjectID) : subjectID; // Use subjectID here
        }).join(', ');
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete class ${classData.classId}?`)) return;

        try {
            const response = await axios.delete(
                `${API_BASE_URL}/api/v1/admin/class/${classData.classId}`,
                { withCredentials: true }
            );
            if (response.data.success) {
                // Call the onDelete prop to update the parent's state
                onDelete(classData.classId);
            } else {
                alert(response.data.message || 'Failed to delete class from backend.');
            }
        } catch (err) {
            // console.error('Error deleting class:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Error deleting class from backend.';
            alert(errorMessage);
            // Do NOT try to manipulate localStorage here.
            // The onDelete callback in the parent (ClassesPage) will handle state updates.
        }
    };

    return (
        <div className="class-card">
            <div className="class-card-header">
                <h3>{getValue(classData.name)}</h3>
                <span className={`status-badge ${getValue(classData.status, 'unknown').toLowerCase()}`}>
                    {getValue(classData.status)}
                </span>
            </div>
            <div className="class-card-body">
                <p className="class-id">
                    <strong>Class ID:</strong> <span>{getValue(classData.classId)}</span>
                </p>
                <p className="class-info">
                    <strong>Section:</strong> <span>{getValue(classData.section)}</span>
                </p>
                <p className="class-info">
                    <strong>Class Teacher:</strong> <span>{getValue(classData.classteacher)}</span>
                </p>
                <p className="class-info">
                    <strong>No. of Students:</strong> <span>{getValue(classData.nostudent, 0)}</span>
                </p>
                <p className="class-info">
                    <strong>Subjects:</strong> <span>{renderSubjects(classData.subjects)}</span>
                </p>
                <p className="class-info">
                    <strong>Schedule:</strong> <span>{getValue(classData.schedule)}</span>
                </p>
                <p className="class-info">
                    <strong>Academic Year:</strong> <span>{getValue(classData.academicYear)}</span>
                </p>
            </div>
            <div className="class-card-footer">
                <button
                    className="login-button"
                    onClick={() => navigate(`/admin/classes/modify/${getValue(classData.classId)}`)}
                >
                    Edit
                </button>
                <button
                    className="login-button delete-button"
                    onClick={handleDelete}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}

export default ClassCard;