// src/components/StudentCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Card.css';

function StudentCard({ student, onDelete }) {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete student ${student.s_id}?`)) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/admin/student/${student.s_id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        onDelete(student.s_id);
      } else {
        alert('Failed to delete student');
      }
    } catch (err) {
      alert('Error deleting student from backend. Removing from local data.');
      // console.error('Delete Student Error:', err);
    }
  };

  const getValue = (value, fallback = 'Not Available') => {
    if (value === undefined || value === null) return fallback;
    if (value instanceof Date || !isNaN(Date.parse(value))) {
      return new Date(value).toLocaleDateString() || fallback;
    }
    return value.toString() || fallback;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>{getValue(student.name)}</h3>
        <span className={`status-badge ${getValue(student.status, 'unknown').toLowerCase()}`}>
          {getValue(student.status)}
        </span>
      </div>
      <div className="card-body">
        <p className="card-id">
          <strong>Student ID:</strong> <span>{getValue(student.s_id)}</span>
        </p>
        <p className="card-info">
          <strong>Email:</strong> <span>{getValue(student.email)}</span>
        </p>
        <p className="card-info">
          <strong>Age:</strong> <span>{getValue(student.Age)}</span>
        </p>
        <p className="card-info">
          <strong>Phone:</strong> <span>{getValue(student.phone)}</span>
        </p>
        <p className="card-info">
          <strong>Date of Birth:</strong> <span>{getValue(student.dateOfBirth)}</span>
        </p>
        <p className="card-info">
          <strong>Date of Admission:</strong> <span>{getValue(student.dateOfAdmission)}</span>
        </p>
        <p className="card-info">
          <strong>Class:</strong> <span>{getValue(student.class?.name || student.class)}</span>
        </p>
        <p className="card-info">
          <strong>Father's Name:</strong> <span>{getValue(student.fatherName)}</span>
        </p>
        <p className="card-info">
          <strong>Father's Phone:</strong> <span>{getValue(student.fatherPhoneNumber)}</span>
        </p>
        <p className="card-info">
          <strong>Mother's Name:</strong> <span>{getValue(student.motherName)}</span>
        </p>
        <p className="card-info">
          <strong>Mother's Phone:</strong> <span>{getValue(student.motherPhoneNumber)}</span>
        </p>
        <p className="card-info">
          <strong>Qualification:</strong> <span>{getValue(student.Qualification)}</span>
        </p>
      </div>
      <div className="card-footer">
        <button
          className="login-button"
          onClick={() => navigate(`/admin/students/modify?s_id=${getValue(student.s_id)}`)}
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

export default StudentCard;