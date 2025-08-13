// src/pages/SearchTeacher.jsx
import React, { useState } from 'react';
import '../../styles/InputForm.css'; // Use InputForm.css for form styling
import '../../styles/Dashboard.css'; // For dashboard layout
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import TeacherCard from '../../components/TeacherCard'; // Import the TeacherCard component
import { useAuth } from '../../context/AuthContext';

function SearchTeacher() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null); // To store the single teacher object found
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { adminData } = useAuth(); // Keeping this as it's part of your original context

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSearchResult(null); // Clear previous search result
    setLoading(true);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    if (!searchQuery.trim()) {
      setError('Please enter a search term (Teacher ID, Name, or Email).');
      setLoading(false);
      return;
    }

    try {
      // Endpoint to fetch a single teacher based on the query.
      // Make sure your backend route `/api/v1/admin/teacher/:query`
      // returns a single teacher object (e.g., in `response.data.data`).
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/admin/teacher/${searchQuery}`,
        { withCredentials: true }
      );

      if (response.data.success === true && response.data.data) {
        // Assuming 'response.data.data' directly contains the single teacher object
        setSearchResult(response.data.data);
        setSuccess('Teacher found!');
      } else {
        // If success is true but data is null/undefined, or success is false
        setError('No teacher found matching your search query.');
        setSearchResult(null); // Explicitly set to null if not found
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching the teacher from backend.');
      // console.error('Search error:', err); // Debugging log
      // console.error('Error details:', err.response?.data); // Log error details for more info
      setSearchResult(null); // Ensure searchResult is null on error
    } finally {
      setLoading(false);
    }
  };

  // Although not used in this component, if TeacherCard needs an onDelete for its internal logic,
  // you might pass a dummy function or ensure TeacherCard handles its absence.
  // For searching, you typically don't delete from the search result.
  // const handleDeleteTeacher = (id) => { /* Logic if you want to delete from search result */ };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar pageTitle={"Search Teacher"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        {/* <header className="dashboard-header">
          <h1>Search Teacher</h1>
          <p className="dashboard-subtitle">Find a teacher by ID, Name, or Email</p>
        </header> */}
        <div className="login-container" style={{ width: '600px' }}>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="query"
                placeholder="Teacher ID, Name, or Email (e.g., TCH101, John Doe, john@example.com)"
                value={searchQuery}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
            {loading && <div style={{ textAlign: 'center', margin: '10px 0' }}>Searching...</div>}
            <button type="submit" className="login-button">SEARCH TEACHER</button>
          </form>

          {/* Display single search result using TeacherCard */}
          <div className="search-results-cards" style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {searchResult ? ( // Conditionally render if searchResult is not null
              <TeacherCard
                key={searchResult._id || searchResult.id} // Use _id or id for key, consistent with AdminTeachersPage's key={teacher.id}
                data={searchResult} // Pass the single teacher object as 'data' prop
                showActions={true} // Set to true if you want edit/delete on the search result card
                // If your TeacherCard also expects `type` and `fields`, uncomment these:
                // type="teacher"
                // fields={/* Define appropriate fields here or remove if TeacherCard doesn't need it */}
                // If you want a delete button on the search card that actually deletes the teacher:
                // onDelete={() => handleDeleteTeacher(searchResult.id)}
              />
            ) : (
              // Optional: Display a message if no result is found after a search
              !loading && !error && !success && searchQuery.trim() && (
                <p style={{ textAlign: 'center', color: '#666' }}>Enter a query and click search to find a teacher.</p>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SearchTeacher;