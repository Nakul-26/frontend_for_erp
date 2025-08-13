// src/components/SubjectCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Card.css';

function SubjectCard({ subject, onDelete }) {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleDelete = async () => {
    //if (!window.confirm(`Are you sure you want to delete subject ${subject.code}?`)) return;

    try {
      // const response = await axios.delete(
      //   `${API_BASE_URL}/api/v1/admin/subdelete?code=${subject.code}`,
      //   { withCredentials: true }
      // );
      //if (response.data.status==="success") {
        onDelete(subject.code);
      //} else {
        //alert('Failed to delete subject');
      //}
    } catch (err) {
      alert('Error deleting subject from backend.');
      // console.error('Delete Subject Error:', err);
    }
  };

  const getValue = (value, fallback = 'Not Available') => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'boolean') return value ? 'active' : 'inactive';
    return value.toString() || fallback;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>{getValue(subject.name)}</h3>
        <span className={`status-badge ${subject.isActive ? 'active' : 'inactive'}`}>
          {getValue(subject.isActive)}
        </span>
      </div>
      <div className="card-body">
        <p className="card-id">
          <strong>Code:</strong> <span>{getValue(subject.code)}</span>
        </p>
        <p className="card-info">
          <strong>Short Name:</strong> <span>{getValue(subject.shortName)}</span>
        </p>
        <p className="card-info">
          <strong>Description:</strong> <span>{getValue(subject.description)}</span>
        </p>
        <p className="card-info">
          <strong>Exam Details:</strong> <span>{getValue(subject.examDetails)}</span>
        </p>
        <p className="card-info">
          <strong>Lecture Hours:</strong> <span>{getValue(subject.lectureHours)}</span>
        </p>
        <p className="card-info">
          <strong>Course Type:</strong> <span>{getValue(subject.courseType)}</span>
        </p>
        <p className="card-info">
          <strong>Syllabus:</strong> <span>{getValue(subject.syllabus)}</span>
        </p>
      </div>
      <div className="card-footer">
        <button //edit button - to edit subject info
          className="login-button"
          onClick={() => navigate(`/admin/subjects/updatesubject/${getValue(subject.code)}`)}
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

export default SubjectCard;