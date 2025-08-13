// src/components/Card.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Card.css';

function Card({ data, type, onDelete, fields }) {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleDelete = async () => {
    const idField = type === 'class' ? 'c_id' : 'id'; // Ensure 's_id' for teachers
    const id = data[idField];
    const deleteUrl = type === 'class'
      ? `${API_BASE_URL}/api/v1/admin/class/${id}`
      : `${API_BASE_URL}/api/v1/admin/teacher/${id}`;
    const storageKey = type === 'class' ? 'classes' : 'teachers';
    const confirmMessage = type === 'class'
      ? `Are you sure you want to delete class ${id}?`
      : `Are you sure you want to delete teacher ${id}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await axios.delete(deleteUrl, { withCredentials: true });
      if (response.data.success) {
        try {
          const storedItems = JSON.parse(localStorage.getItem(storageKey)) || [];
          const updatedItems = storedItems.filter((item) => item[idField] !== id);
          localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        } catch (localErr) {
          // console.error('Error updating local storage:', localErr);
        }
        onDelete(id);
      } else {
        alert(`Failed to delete ${type}`);
      }
    } catch (err) {
      alert(`Error deleting ${type} from backend. Removing from local data.`);
      try {
        const storedItems = JSON.parse(localStorage.getItem(storageKey)) || [];
        const updatedItems = storedItems.filter((item) => item[idField] !== id);
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        onDelete(id);
      } catch (localErr) {
        alert(`Error deleting from local storage: ${localErr.message}`);
      }
    }
  };

  const getValue = (value, fallback = 'Not Available') => {
    if (value === undefined || value === null || value === '') return fallback;
    if (Array.isArray(value)) return value.join(', ') || fallback;
    if (typeof value === 'string') {
      const date = new Date(value);
      // Simple heuristic for date string (e.g., "2023-01-15")
      if (!isNaN(date.getTime()) && value.length >= 8 && (value.includes('-') || value.includes('/'))) {
        return date.toLocaleDateString() || fallback;
      }
    }
    const stringValue = String(value);
    return stringValue || fallback;
  };

  // --- START OF IMPORTANT CHANGE ---
  const renderField = (field) => {
    // If a custom render function is provided for this field, use it.
    if (field.render) {
      return (
        <div className="card-detail-item" key={field.key}>
          <strong>{field.label}:</strong> {field.render(data)}
        </div>
      );
    }

    // Otherwise, render the value using the default getValue logic.
    const value = field.accessor ? field.accessor(data) : data[field.key];
    return (
      <p className={field.key === 'c_id' || field.key === 's_id' ? 'card-id' : 'card-info'} key={field.key}>
        <strong>{field.label}:</strong> <span>{getValue(value)}</span>
      </p>
    );
  };
  // --- END OF IMPORTANT CHANGE ---

  const getNavigatePath = () => {
    const teacherId = data.id;
    const classId = data.c_id;

    if (type === 'class' && classId) return `/admin/classes/modify?c_id=${getValue(classId)}`;
    if (type === 'teacher' && teacherId) return `/admin/teachers/modify?t_id=${getValue(teacherId)}`;
    return '#';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>
          {type === 'teacher' && data.name ? getValue(data.name) :
           type === 'class' && data.name ? getValue(data.name) :
           `ID: ${data.s_id || data.c_id || data._id || 'N/A'}`}
        </h3>
        {(type === 'class' || type === 'teacher') && (
          <span className={`status-badge ${getValue(data.status, 'unknown').toLowerCase()}`}>
            {getValue(data.status)}
          </span>
        )}
      </div>
      <div className="card-body">
        {fields.map(renderField)}
      </div>
      <div className="card-footer">
        <button
          className="login-button"
          onClick={() => navigate(getNavigatePath())}
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

export default Card;