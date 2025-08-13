// src/pages/StudentsPage.jsx
import React, { useEffect, useState, lazy, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Dashboard.css';
import '../../styles/Card.css';
import '../../styles/InputForm.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StudentCard from '../../components/StudentCard';

// Import the Table component
const Table = lazy(() => import('../../components/Table'));

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
  const [isTableView, setIsTableView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // State for Filters
  const [filters, setFilters] = useState({
    class: '',
    status: '',
    admissionYear: ''
  });

  // State for Sorting
  const [sortBy, setSortBy] = useState({ field: '', order: 'asc' });

  // States to hold unique filter options
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [uniqueAdmissionYears, setUniqueAdmissionYears] = useState([]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 900);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      setError('');
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL;

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/admin/getallstudents`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setStudents(response.data.data);
          // Extract unique filter options
          const years = [...new Set(response.data.data
            .map(student => new Date(student.dateOfAdmission).getFullYear())
            .filter(Boolean))].sort();
          setUniqueAdmissionYears(['', ...years]);

          const classes = [...new Set(response.data.data
            .map(student => student.class)
            .filter(Boolean))].sort();
          setUniqueClasses(['', ...classes]);
        } else {
          throw new Error('Failed to fetch students');
        }
      } catch (err) {
        setError('Unable to fetch students from backend.');
        // console.error('Fetch Students Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sortField') {
      setSortBy(prev => ({ ...prev, field: value }));
    } else if (name === 'sortOrder') {
      setSortBy(prev => ({ ...prev, order: value }));
    }
  };

  const clearFiltersAndSort = () => {
    setFilters({ class: '', status: '', admissionYear: '' });
    setSortBy({ field: '', order: 'asc' });
  };

  // Memoized filtered and sorted students
  const filteredAndSortedStudents = useMemo(() => {
    let currentStudents = [...students];

    // Apply Filters
    currentStudents = currentStudents.filter(student => {
      let matches = true;
      if (filters.class && String(student.class) !== filters.class) matches = false;
      if (filters.status && String(student.status).toLowerCase() !== filters.status.toLowerCase()) matches = false;
      if (filters.admissionYear) {
        const studentYear = new Date(student.dateOfAdmission).getFullYear().toString();
        if (studentYear !== filters.admissionYear) matches = false;
      }
      return matches;
    });

    // Apply Sort
    if (sortBy.field) {
      currentStudents.sort((a, b) => {
        let aValue = a[sortBy.field];
        let bValue = b[sortBy.field];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return sortBy.order === 'asc' ? 1 : -1;
        if (bValue === null || bValue === undefined) return sortBy.order === 'asc' ? -1 : 1;

        // Handle date fields
        if (sortBy.field === 'dateOfAdmission' || sortBy.field === 'dateOfBirth') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Handle string and number comparisons
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortBy.order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortBy.order === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Fallback for mixed types
        const valA = String(aValue);
        const valB = String(bValue);
        return sortBy.order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return currentStudents;
  }, [students, filters, sortBy]);

  const handleDeleteStudent = (s_id) => {
    setStudents(students.filter((student) => student.s_id !== s_id));
  };

  // Define columns for the Student Table
  const studentTableColumns = [
    { key: 's_id', label: 'Student ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'class', label: 'Class' },
    { key: 'Age', label: 'Age' },
    { key: 'phone', label: 'Phone' },
    { key: 'dateOfAdmission', label: 'Admission Date' },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      renderCell: (student) => (
        <div style={{ display: 'flex', gap: '5px' }}>
          <Link to={`/admin/students/modify?s_id=${student.s_id}`} className="login-button small-button">
            Edit
          </Link>
          <button
            className="login-button delete-button small-button"
            onClick={() => handleDeleteStudent(student.s_id)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar pageTitle={"Student Management"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="action-and-filter-bar" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Link to="/admin/students/register" className="login-button" style={{ minWidth: '120px', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Register Student
            </Link>
            <Link to="/admin/students/modify" className="login-button" style={{ minWidth: '120px', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Modify Student
            </Link>
            <button
              onClick={() => setIsTableView(!isTableView)}
              className="login-button"
              style={{ minWidth: '120px', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {isTableView ? 'Show Card View' : 'Show Table View'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="login-button"
              style={{ minWidth: '120px', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="filter-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '10px', border: '1px solid var(--border, #222)', borderRadius: '8px', backgroundColor: 'var(--surface, #222)' }}>
              <h3>Filter By:</h3>
              {/* Class Filter */}
              <select name="class" value={filters.class} onChange={handleFilterChange} className="filter-select">
                <option value="">All Classes</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Admission Year Filter */}
              <select name="admissionYear" value={filters.admissionYear} onChange={handleFilterChange} className="filter-select">
                <option value="">All Admission Years</option>
                {uniqueAdmissionYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Sort Controls */}
              <h3>Sort By:</h3>
              <select name="sortField" value={sortBy.field} onChange={handleSortChange} className="filter-select">
                <option value="">No Sort</option>
                <option value="name">Name</option>
                <option value="class">Class</option>
                <option value="Age">Age</option>
                <option value="dateOfAdmission">Admission Date</option>
                <option value="status">Status</option>
              </select>

              <select name="sortOrder" value={sortBy.order} onChange={handleSortChange} className="filter-select">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>

              <button onClick={clearFiltersAndSort} className="clear-filters-btn">
                Clear Filters & Sort
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Loading...</div>
        ) : filteredAndSortedStudents.length === 0 ? (
          <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>No students found matching your criteria.</div>
        ) : (
          isTableView ? (
            <Suspense fallback={<div>Loading table view...</div>}>
              <Table data={filteredAndSortedStudents} columns={studentTableColumns} />
            </Suspense>
          ) : (
            <div className="cards-grid">
              {filteredAndSortedStudents.map((student) => (
                <StudentCard
                  key={student.s_id}
                  student={student}
                  onDelete={handleDeleteStudent}
                />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default StudentsPage;