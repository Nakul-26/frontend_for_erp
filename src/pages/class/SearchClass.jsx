// src/pages/SearchClass.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/InputForm.css'; // For form styling
import '../../styles/Dashboard.css'; // For dashboard layout
import '../../styles/ClassCard.css'; // For ClassCard styling
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import ClassCard from '../../components/ClassCard'; // Import the ClassCard component
import { useAuth } from '../../context/AuthContext';

function SearchClass() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null); // To store the single class object found
  const [allSubjects, setAllSubjects] = useState([]); // Needed for ClassCard
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open
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
      setError('Please enter a Class ID.');
      setLoading(false);
      return;
    }

    try {
      // Endpoint to fetch a single class by its ID.
      // Assuming your backend route for a single class is something like GET /api/v1/admin/class/:id
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/admin/class/${searchQuery}`,
        { withCredentials: true }
      );
      if (response.data.success === true && response.data.data) {
        // Assuming 'response.data.data' directly contains the single class object
        setSearchResult(response.data.data);
        setSuccess('Class found!');
      } else {
        // If success is true but data is null/undefined, or success is false
        setError('No class found with that ID.');
        setSearchResult(null); // Explicitly set to null if not found
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching the class from backend.');
      // console.error('Search error:', err); // Debugging log
      // console.error('Error details:', err.response?.data); // Log error details for more info
      setSearchResult(null); // Ensure searchResult is null on error
    } finally {
      setLoading(false);
    }
  };

  // The ClassCard itself contains logic for deletion and navigation.
  // When a class is deleted via the ClassCard, we need to clear the search result.
  const handleClassDeleted = (deletedClassId) => {
    if (searchResult && searchResult.classId === deletedClassId) {
      setSearchResult(null);
      setSuccess('');
      setError('Class successfully deleted from the system.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar pageTitle={"Search Class"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        {/* <header className="dashboard-header">
          <h1>Search Class</h1>
          <p className="dashboard-subtitle">Find a class by Class ID</p>
        </header> */}
        <div className="login-container" style={{ width: '600px' }}>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="query"
                placeholder="Enter Class ID (e.g., C101, 5f8d0c3f0b2f1c0017a5b3a4)"
                value={searchQuery}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
            {loading && <div style={{ textAlign: 'center', margin: '10px 0' }}>Searching...</div>}
            <button type="submit" className="login-button">SEARCH CLASS</button>
          </form>

          {/* Display single search result using ClassCard */}
          <div className="search-results-cards" style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {searchResult ? ( // Conditionally render if searchResult is not null
              <ClassCard
                key={searchResult._id || searchResult.classId} // Use _id or classId for key
                classData={searchResult} // Pass the single class object as 'classData' prop
                onDelete={handleClassDeleted} // Pass the handler to update this page if deleted
                allSubjects={allSubjects} // Pass allSubjects for rendering subject names
              />
            ) : (
              // Optional: Display a message if no result is found after a search or before first search
              !loading && !error && !success && searchQuery.trim() && (
                <p style={{ textAlign: 'center', color: '#666' }}>No class found for "{searchQuery}". Please try another ID.</p>
              )
            )}
            {/* Initial prompt for user if nothing searched yet */}
            {!loading && !error && !success && !searchQuery.trim() && !searchResult && (
              <p style={{ textAlign: 'center', color: '#666' }}>Enter a Class ID above to find a specific class.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SearchClass;