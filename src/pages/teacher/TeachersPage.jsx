  // src/pages/AdminTeachersPage.jsx
  import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
  import { useNavigate } from 'react-router-dom';
  import axios from 'axios';
  import '../../styles/Dashboard.css';
  import '../../styles/Card.css';
  import '../../styles/InputForm.css';
  import Sidebar from '../../components/Sidebar';
  import Navbar from '../../components/Navbar';
  import TeacherCard from '../../components/TeacherCard';

  // Import the Table component
  const Table = lazy(() => import('../../components/Table'));

  function AdminTeachersPage() {
    const [teachers, setTeachers] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
    const [isTableView, setIsTableView] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [showFilters, setShowFilters] = useState(false);

    // State for Filters
    const [filters, setFilters] = useState({
      subject: '',
      status: '',
      joiningYear: ''
    });

    // State for Sorting
    const [sortBy, setSortBy] = useState({ field: '', order: 'asc' });

    // States to hold unique filter options
    const [uniqueSubjects, setUniqueSubjects] = useState([]);
    const [uniqueJoiningYears, setUniqueJoiningYears] = useState([]);

    // Handle window resize
    useEffect(() => {
      const handleResize = () => {
        setIsSidebarOpen(window.innerWidth > 900);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const teacherFields = [
      { key: 'id', label: 'Teacher ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'age', label: 'Age' },
      { key: 'address', label: 'Address' },
      { key: 'phone', label: 'Phone' },
      { key: 'dateofjoining', label: 'Date of Joining' },
      { key: 'subjects', label: 'Subjects', accessor: (data) => data.subjects?.join(', ') },
      { key: 'classes', label: 'Classes', accessor: (data) => data.classes?.join(', ') },
      { key: 'status', label: 'Status' }
    ];

    useEffect(() => {
      let isMounted = true;
      const fetchTeachers = async () => {
        const API_BASE_URL = import.meta.env.VITE_API_URL;

        if (!isMounted) return;
        setError('');
        try {
          const response = await axios.get(`${API_BASE_URL}/api/v1/admin/getallteacher`, {
            withCredentials: true,
          });
          if (response.data.success) {
            setTeachers(response.data.data);
            
            // Extract unique filter options
            const years = [...new Set(response.data.data
              .map(teacher => new Date(teacher.dateofjoining).getFullYear())
              .filter(Boolean))].sort();
            setUniqueJoiningYears(['', ...years]);

            const subjects = [...new Set(response.data.data
              .flatMap(teacher => teacher.subjects || [])
              .filter(Boolean))].sort();
            setUniqueSubjects(['', ...subjects]);
          } else {
            throw new Error('Failed to fetch teachers');
          }
        } catch (err) {
          setError('Unable to fetch teachers from backend.');
          // console.error('Fetch Teachers Error:', err);
        }
      };
      fetchTeachers();
      return () => {
        isMounted = false;
      };
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
      setFilters({ subject: '', status: '', joiningYear: '' });
      setSortBy({ field: '', order: 'asc' });
    };

    // Memoized filtered and sorted teachers
    const filteredAndSortedTeachers = useMemo(() => {
      let currentTeachers = [...teachers];

      // Apply Filters
      currentTeachers = currentTeachers.filter(teacher => {
        let matches = true;
        if (filters.subject && (!teacher.subjects || !teacher.subjects.includes(filters.subject))) matches = false;
        if (filters.status && String(teacher.status).toLowerCase() !== filters.status.toLowerCase()) matches = false;
        if (filters.joiningYear) {
          const teacherYear = new Date(teacher.dateofjoining).getFullYear().toString();
          if (teacherYear !== filters.joiningYear) matches = false;
        }
        return matches;
      });

      // Apply Sort
      if (sortBy.field) {
        currentTeachers.sort((a, b) => {
          let aValue = a[sortBy.field];
          let bValue = b[sortBy.field];

          // Handle null/undefined values
          if (aValue === null || aValue === undefined) return sortBy.order === 'asc' ? 1 : -1;
          if (bValue === null || bValue === undefined) return sortBy.order === 'asc' ? -1 : 1;

          // Handle date fields
          if (sortBy.field === 'dateofjoining') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
          }

          // Handle arrays (subjects, classes)
          if (Array.isArray(aValue)) aValue = aValue.join(', ');
          if (Array.isArray(bValue)) bValue = bValue.join(', ');

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

      return currentTeachers;
    }, [teachers, filters, sortBy]);

    const handleDeleteTeacher = (id) => {
      setTeachers(teachers.filter((teacher) => teacher.id !== id));
    };

    // Define columns for the Teacher Table
    const teacherTableColumns = [
      { key: 'id', label: 'Teacher ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'age', label: 'Age' },
      { key: 'phone', label: 'Phone' },
      { key: 'dateofjoining', label: 'Date of Joining' },
      { key: 'subjects', label: 'Subjects', accessor: (data) => data.subjects?.join(', ') },
      { key: 'classes', label: 'Classes', accessor: (data) => data.classes?.join(', ') },
      { key: 'status', label: 'Status' },
      {
        key: 'actions',
        label: 'Actions',
        renderCell: (teacher) => (
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              className="form-button small-button"
              onClick={() => navigate(`/admin/teachers/modify?t_id=${teacher.id}`)}
            >
              Edit
            </button>
            <button
              className="login-button delete-button small-button"
              onClick={() => handleDeleteTeacher(teacher.id)}
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
          <Navbar pageTitle={"Teachers Management"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          {/* <header className="dashboard-header">
            <h1>Teachers Management</h1>
            <p className="dashboard-subtitle">View and manage all teachers</p>
          </header> */}

          <div className="action-and-filter-bar" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                className="login-button"
                style={{ minWidth: '120px', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                onClick={() => navigate('/admin/teachers/register')}
              >
                Register Teacher
              </button>
              {/* <button
                className="login-button"
                style={{ minWidth: '120px', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                onClick={() => navigate('/admin/teachers/modify')}
              >
                Update Teacher
              </button> */}
              {/* <button
                className="login-button"
                style={{ minWidth: '120px', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                onClick={() => navigate('/admin/teachers/search')}
              >
                Search Teacher
              </button> */}
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
                {/* Subject Filter */}
                <select name="subject" value={filters.subject} onChange={handleFilterChange} className="filter-select">
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* Joining Year Filter */}
                <select name="joiningYear" value={filters.joiningYear} onChange={handleFilterChange} className="filter-select">
                  <option value="">All Joining Years</option>
                  {uniqueJoiningYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                {/* Sort Controls */}
                <h3>Sort By:</h3>
                <select name="sortField" value={sortBy.field} onChange={handleSortChange} className="filter-select">
                  <option value="">No Sort</option>
                  <option value="name">Name</option>
                  <option value="id">Teacher ID</option>
                  <option value="age">Age</option>
                  <option value="dateofjoining">Joining Date</option>
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

          {filteredAndSortedTeachers.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>No teachers found matching your criteria.</div>
          ) : (
            isTableView ? (
              <Suspense fallback={<div>Loading table view...</div>}>
                <Table data={filteredAndSortedTeachers} columns={teacherTableColumns} />
              </Suspense>
            ) : (
              <div className="cards-grid">
                {filteredAndSortedTeachers.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    data={teacher}
                    type="teacher"
                    fields={teacherFields}
                    onDelete={handleDeleteTeacher}
                  />
                ))}
              </div>
            )
          )}
        </main>
      </div>
    );
  }

  export default AdminTeachersPage;