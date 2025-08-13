import React, { useState, useEffect } from 'react';
import { useTheme } from '../Context';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';
import { useAuth } from '../context/AuthContext';

function getInitialSidebarOpen() {
  if (typeof window !== 'undefined' && window.innerWidth <= 900) {
    return false;
  }
  return true;
}

function Sidebar({ isOpen, setIsOpen }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  const [openSections, setOpenSections] = useState({
    classes: false,
    teachers: false,
    students: false,
    subjects: false,
  });

  // Close sidebar on route change (optional, for better UX)
  useEffect(() => {
    if (isOpen === undefined) return;
    if (!isOpen) {
      setOpenSections({ classes: false, teachers: false, students: false, subjects: false });
    }
  }, [isOpen]);

  // Hide sidebar by default on small screens
  useEffect(() => {
    if (typeof isOpen === 'undefined' && typeof setIsOpen === 'function') {
      setIsOpen(getInitialSidebarOpen());
    }
    // eslint-disable-next-line
  }, []);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Sidebar open/close for mobile
  const sidebarClass = () => {
    if (typeof isOpen === 'boolean') {
      return `sidebar${isOpen ? ' open' : ''}`;
    }
    return 'sidebar';
  };

  return (
    <div className={sidebarClass()} data-theme={theme}>
      <div className="profile-section">
        <div className="profile-image">{user?.Name?.charAt(0) || 'A'}</div>
        <h3>{user?.Name || 'Loading...'}</h3>
        <p>{user?.email || 'Loading...'}</p>
      </div>
      <nav className="sidebar-nav">
        <Link to="/admin/dashboard" data-icon="🏠">Dashboard</Link>
        <Link to="/admin/classes" data-icon="📚">Classes</Link>
        <Link to="/admin/teachers" data-icon="👩‍🏫">Teachers</Link>
        <Link to="/admin/students" data-icon="👩‍🎓">Students</Link>
        <Link to="/admin/subjects" data-icon="📖">Subjects</Link>
        <div className="nav-group">
          <span
            className="nav-group-title"
            data-icon="📊"
            onClick={() => toggleSection('attendance')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('attendance')}
          >
            Attendance
          </span>
          <div className={`nav-subgroup ${openSections.attendance ? 'open' : ''}`}>
            {/* <Link to="/admin/adminstudentattendance" data-icon="👩‍🎓">Student Attendance</Link>
            <Link to="/admin/adminteacherattendance" data-icon="👨‍🏫">Teacher Attendance</Link> */}
            <Link to="/admin/teachers/attendance" data-icon="📝">Mark Teacher Attendance</Link>
            <Link to="/admin/teacher-attendance" data-icon="📅">View Teacher Attendance</Link>
            <Link to="/admin/teacher-attendance/update/:attendanceId" data-icon="✏️">Update Teacher Attendance</Link>
          </div>
        </div>
        <div className="nav-group">
          <span
            className="nav-group-title"
            data-icon="📅"
            onClick={() => toggleSection('timetable')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('t imetable')}
          >
            Timetable
          </span>
          <div className={`nav-subgroup ${openSections.timetable ? 'open' : ''}`}>
            {/* <Link to="/admin/timetable/create" data-icon="➕">Create Timetable</Link> */}
            {/* <Link to="/admin/timetable/view" data-icon="👀" >View Timetable</Link>   */}
            {/* <Link to="/admin/timetable/viewclassmappings" data-icon="🔍">View Class Mappings</Link> */}
            {/* <Link to="/admin/timetable/viewteacher" data-icon="👨‍🏫"> teacher timetable </Link> */}
            {/* <Link to="/admin/timetable/viewstudent" data-icon="👩‍🎓"> Student timetable </Link> */}

            <Link to="/admin/mapped" data-icon="🔗">Create Mapped Relations</Link>
            <Link to="/admin/timetable/view-mappings" data-icon="🔍">View Class Mappings</Link> 
            {/* <Link to="/admin/timetable-pdf" data-icon="📄">Timetable PDF Generator</Link> */}
            <Link to="/admin/timetable/create" data-icon="🗓️">Create Timetable</Link>            
            <Link to="/admin/timetable/getall" data-icon="📋">Get All Timetables</Link>
          </div>
        </div>
        <div className="nav-group">
          <span
            className="nav-group-title"
            data-icon="📝"
            onClick={() => toggleSection('exams')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('exams')}
          >
            Exams
          </span>
          <div className={`nav-subgroup ${openSections.exams ? 'open' : ''}`}>
            <Link to="/admin/exams/create" data-icon="➕">Create Exam</Link>
            {/* <Link to="/admin/exams/delete" data-icon="🗑️">Delete Exam</Link> */}
            <Link to="/admin/exams/getall" data-icon="📋">All Exams</Link>
            {/* <Link to="/admin/exams/update/:examId" data-icon="✏️">Update Exam</Link> */}
            {/* <Link to="/admin/exams/getsingle/:examId" data-icon="🔍">Get Single Exam</Link> */}
          </div>
        </div>
        <div className="nav-group">
          <span
            className="nav-group-title"
            data-icon="📊"
            onClick={() => toggleSection('examresults')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('examresults')}
          >
            Exam Results
          </span>
          <div className={`nav-subgroup ${openSections.examresults ? 'open' : ''}`}>
            <Link to="/admin/examresult/create" data-icon="➕">Create Exam Result</Link>
            <Link to="/admin/examresult/getbyexam/:examId" data-icon="📋">All Results by Exam</Link>
            <Link to="/admin/examresult/update/:resultId" data-icon="✏️">Update Exam Result</Link>
          </div>
        </div>
      </nav>
      {/* Mobile close button */}
      {/* {typeof isOpen === 'boolean' && setIsOpen && (
        <button
          className="sidebar-close-btn"
          style={{ display: 'block' }}
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        >
          ×
        </button>
      )} */}
    </div>
  );
}

export default Sidebar;


{/* <div className="nav-group">
          <span
            className="nav-group-title"
            data-icon="📚"
            onClick={() => toggleSection('classes')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('classes')}
          >
            Classes
          </span>
          <div className={`nav-subgroup ${openSections.classes ? 'open' : ''}`}>
            <Link to="/admin/classes" data-icon="👥">All Classes</Link>
            <Link to="/admin/classes/add" data-icon="➕">Add Class</Link>
            {/* <Link to="/admin/classes/modify" data-icon="✏️">Modify Class</Link> 
            {/* <Link to="/admin/classes/delete" data-icon="🗑️">Delete Class</Link> 
          </div>
        </div> */}