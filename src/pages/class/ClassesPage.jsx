import React, { useEffect, useState, lazy, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Dashboard.css';
import '../../styles/Card.css';
import '../../styles/InputForm.css';
import '../../styles/ClassesPage.css';
import { useAuth } from '../../context/AuthContext';

// Import the new Table component
const Table = lazy(() => import('../../components/Table'));
const Sidebar = lazy(() => import('../../components/Sidebar'));
const Navbar = lazy(() => import('../../components/Navbar'));
const ClassCard = lazy(() => import('../../components/ClassCard'));

function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const { adminData } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 900);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [isTableView, setIsTableView] = useState(false);

  // State for Filters
  const [filters, setFilters] = useState({
    academicYear: '',
    section: '',
    status: '',
    subject: '', // Will store subject _id
    classteacher: ''
  });

  // State for Sorting
  const [sortBy, setSortBy] = useState({ field: '', order: 'asc' }); // field: 'name', 'nostudent', etc.

  // States to hold unique filter options (derived from 'classes' data)
  const [uniqueAcademicYears, setUniqueAcademicYears] = useState([]);
  const [uniqueSections, setUniqueSections] = useState([]);
  const [uniqueClassTeachers, setUniqueClassTeachers] = useState([]);

  // Helper to get subject name from ID
  const getSubjectName = (subjectId) => {
    if (!allSubjects || allSubjects.length === 0) {
      return 'Loading Subjects...';
    }
    const subject = allSubjects.find(sub => sub._id === subjectId);
    return subject ? subject.name : `Unknown (${subjectId})`;
  };

  useEffect(() => {
    const fetchClassesAndSubjects = async () => {
      setError('');
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL;

      if (!API_BASE_URL) {
        setError('Server configuration error: API URL missing.');
        setLoading(false);
        return;
      }

      try {
        const classesResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclass`,
          { withCredentials: true }
        );

        if (classesResponse.data.success && Array.isArray(classesResponse.data.data)) {
          setClasses(classesResponse.data.data);
          // Extract unique filter options after classes are fetched
          const years = [...new Set(classesResponse.data.data.map(cls => cls.academicYear).filter(Boolean))].sort();
          setUniqueAcademicYears(['', ...years]); // Add empty option for "All"

          const sections = [...new Set(classesResponse.data.data.map(cls => cls.section).filter(Boolean))].sort();
          setUniqueSections(['', ...sections]);

          const teachers = [...new Set(classesResponse.data.data.map(cls => cls.classteacher).filter(Boolean))].sort();
          setUniqueClassTeachers(['', ...teachers]);

        } else {
          setError('Invalid response format for classes from backend.');
        }

        const subjectsResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/getall`,
          { withCredentials: true }
        );

        if (subjectsResponse.data.status === "success" && Array.isArray(subjectsResponse.data.subjects)) {
          setAllSubjects(subjectsResponse.data.subjects);
        } else {
          setError(prev => prev + (prev ? '; ' : '') + 'Invalid subjects response format.');
        }

      } catch (err) {
        setError('Unable to fetch data. Please check your connection or server.');
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassesAndSubjects();
  }, []); // Empty dependency array means this runs once on mount

  const handleDeleteClass = (classId) => {
    setClasses(classes.filter((cls) => cls.classId !== classId));
  };

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
    setFilters({ academicYear: '', section: '', status: '', subject: '', classteacher: '' });
    setSortBy({ field: '', order: 'asc' });
  };

  // Memoized filtered and sorted classes for performance
  const filteredAndSortedClasses = useMemo(() => {
    let currentClasses = [...classes]; // Start with a copy of the original data

    // Apply Filters
    currentClasses = currentClasses.filter(cls => {
      let matches = true;
      if (filters.academicYear && String(cls.academicYear) !== filters.academicYear) matches = false;
      if (filters.section && String(cls.section).toLowerCase() !== filters.section.toLowerCase()) matches = false;
      if (filters.status && String(cls.status).toLowerCase() !== filters.status.toLowerCase()) matches = false;
      if (filters.subject) {
        // Check if class's subjects array contains the filtered subject ID (_id)
        if (!cls.subjects || !Array.isArray(cls.subjects) || !cls.subjects.includes(filters.subject)) {
          matches = false;
        }
      }
      if (filters.classteacher && !String(cls.classteacher).toLowerCase().includes(filters.classteacher.toLowerCase())) matches = false;
      return matches;
    });

    // Apply Sort
    if (sortBy.field) {
      currentClasses.sort((a, b) => {
        const aValue = a[sortBy.field];
        const bValue = b[sortBy.field];

        // Handle null/undefined values by placing them at the end (or beginning)
        if (aValue === null || aValue === undefined) return sortBy.order === 'asc' ? 1 : -1;
        if (bValue === null || bValue === undefined) return sortBy.order === 'asc' ? -1 : 1;

        // Handle string comparisons
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortBy.order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        // Handle numeric comparisons (e.g., nostudent)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortBy.order === 'asc' ? aValue - bValue : bValue - aValue;
        }
        // Fallback for mixed types or other types by converting to string
        const valA = String(aValue);
        const valB = String(bValue);
        return sortBy.order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    return currentClasses;
  }, [classes, filters, sortBy]); // Re-calculate when classes, filters, or sortBy change

  // Define columns for the Class Table
  const classTableColumns = [
    { key: 'classId', label: 'Class ID' },
    { key: 'name', label: 'Class Name' },
    { key: 'section', label: 'Section' },
    { key: 'classteacher', label: 'Class Teacher' },
    {
      key: 'subjects',
      label: 'Subjects',
      renderCell: (classItem) => {
        if (!classItem.subjects || classItem.subjects.length === 0) {
          return 'No subjects assigned';
        }
        return classItem.subjects.map(subjectID => getSubjectName(subjectID)).join(', ');
      }
    },
    { key: 'nostudent', label: 'No. of Students' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      renderCell: (classItem) => (
        <div style={{ display: 'flex', gap: '5px' }}>
          <Link to={`/admin/classes/modify?c_id=${classItem.classId}`} className="login-button small-button">Edit</Link>
          <button
            className="login-button delete-button small-button"
            onClick={() => handleDeleteClass(classItem.classId)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <Suspense fallback={<div>Loading application components...</div>}>
      <div className="dashboard-container">
        <Sidebar 
          //adminData={adminData} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />
        <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
          <Navbar pageTitle={"Classes Management"} role="admin" toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
          {/* <header className="dashboard-header">
            <h1>Classes Management</h1>
            <p className="dashboard-subtitle">View and manage all classes</p>
          </header> */}

          <div className="action-and-filter-bar" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Link to="/admin/classes/add" className="login-button" style={{ minWidth: '120px', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Add Class
              </Link>
              <button
                onClick={() => setIsTableView(!isTableView)}
                className="login-button"
                style={{ minWidth: '120px', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {isTableView ? 'Show Card View' : 'Show Table View'}
              </button>
            </div>

            {/* Filter Controls */}
          <div className="filter-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '10px', border: '1px solid var(--border, #222)', borderRadius: '8px', backgroundColor: 'var(--surface, #222)' }}>
              <h3>Filter By:</h3>
              {/* Academic Year Filter */}
              <select name="academicYear" value={filters.academicYear} onChange={handleFilterChange} className="filter-select">
                <option value="">All Academic Years</option>
                {uniqueAcademicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Section Filter */}
              <select name="section" value={filters.section} onChange={handleFilterChange} className="filter-select">
                <option value="">All Sections</option>
                {uniqueSections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Subject Filter */}
              <select name="subject" value={filters.subject} onChange={handleFilterChange} className="filter-select">
                <option value="">All Subjects</option>
                {allSubjects.map(subject => (
                  <option key={subject._id} value={subject._id}>{subject.name} ({subject.code})</option>
                ))}
              </select>

              {/* Class Teacher Filter */}
              <select name="classteacher" value={filters.classteacher} onChange={handleFilterChange} className="filter-select">
                <option value="">All Class Teachers</option>
                {uniqueClassTeachers.map(teacher => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
              </select>

              {/* Sort Controls */}
              <h3>Sort By:</h3>
              <select name="sortField" value={sortBy.field} onChange={handleSortChange} className="filter-select">
                <option value="">No Sort</option>
                <option value="name">Class Name</option>
                <option value="nostudent">No. of Students</option>
                <option value="academicYear">Academic Year</option>
                <option value="status">Status</option>
                <option value="classteacher">Class Teacher</option>
              </select>

              <select name="sortOrder" value={sortBy.order} onChange={handleSortChange} className="filter-select">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>

              <button onClick={clearFiltersAndSort} className="clear-filters-btn">
                Clear Filters & Sort
              </button>
            </div>
          </div>

          {error ? (
            <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
              {error}
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Loading classes...</div>
          ) : filteredAndSortedClasses.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>No classes found matching your criteria.</div>
          ) : (
            isTableView ? (
              <Suspense fallback={<div>Loading table view...</div>}>
                <Table data={filteredAndSortedClasses} columns={classTableColumns} />
              </Suspense>
            ) : (
              <div className="classes-grid">
                {filteredAndSortedClasses.map((cls) => (
                  <ClassCard key={cls.classId} classData={cls} onDelete={handleDeleteClass} allSubjects={allSubjects} />
                ))}
              </div>
            )
          )}
        </main>
      </div>
    </Suspense>
  );
}

export default ClassesPage;