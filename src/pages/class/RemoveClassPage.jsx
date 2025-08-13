import React, { useState } from 'react';
import '../../styles/InputForm.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RemoveClassPage() {
    const [formData, setFormData] = useState({ c_id: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_URL;
    if (!API_BASE_URL) {
        // console.error('API URL is missing in environment variables.');
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Client-side validation: Ensure c_id is not empty
        if (!formData.c_id.trim()) {
            setError('Please enter a Class ID.');
            setLoading(false);
            return;
        }

        if (!window.confirm(`Are you sure you want to delete class ${formData.c_id}? This action cannot be undone.`)) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.delete(`${API_BASE_URL}/api/v1/admin/class/${formData.c_id}`, {
                withCredentials: true,
            });

            if (response.data.success) {
                // Enhanced success message to include the deleted class ID
                setSuccess(`Class '${formData.c_id}' deleted successfully!`);
                // Clear the input field after successful deletion
                setFormData({ c_id: '' });
                // Navigate back to the classes list after a delay
                setTimeout(() => navigate('/admin/classes'), 2000);
            } else {
                // Use the backend's message if available, otherwise a generic one
                setError(response.data.message || 'Failed to delete class.');
            }
        } catch (err) {
            // console.error("Delete Class Error:", err);
            // Provide a more descriptive error from the response, or a fallback
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred while deleting the class.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-background">
            <div className="login-container">
                <h2>Remove Class</h2>
                <p style={{textAlign: 'center', marginBottom: '20px', color: '#666'}}>
                    Enter the Class ID to permanently remove a class.
                </p>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            name="c_id"
                            placeholder="Class ID (e.g., CS101)"
                            value={formData.c_id}
                            onChange={handleChange}
                            required
                            disabled={loading} // Disable input while loading
                            aria-label="Class ID to remove"
                        />
                    </div>
                    {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</div>}
                    {success && <div className="success-message" style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>{success}</div>}
                    <button type="submit" className="login-button" disabled={loading || !formData.c_id.trim()}>
                        {loading ? 'Removing...' : 'REMOVE CLASS'}
                    </button>
                    <button type="button" className="login-button secondary-button" onClick={() => navigate('/admin/classes')} disabled={loading}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RemoveClassPage;