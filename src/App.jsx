import React from 'react';
import { ThemeProvider, useTheme } from './Context';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import ProtectedRoute from './components/ProtectedRoute';

import Index from './pages/other/FirstPage'; 

import AddClassPage from './pages/class/AddClassPage'; 
import ClassesPage from './pages/class/ClassesPage'; 
import ModifyClassPage from './pages/class/ModifyClassPage';
import SearchClass from './pages/class/SearchClass';

import AdminDashboard from './pages/admin/AdminDashboard'; 
import AdminLogin from './pages/admin/AdminLogin'; 

import TeacherLogin from './pages/teacher/TeacherLogin'; 
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherRegister from './pages/teacher/TeacherRegister'; 
import TeachersPage from './pages/teacher/TeachersPage'; 
import ModifyTeacherPage from './pages/teacher/ModifyTeacherPage'; 
import SearchTeacher from './pages/teacher/SearchTeacher';

import StudentLogin from './pages/student/StudentLogin'; 
import StudentDashboard from './pages/student/StudentDashboard'; 
import StudentRegister from './pages/student/StudentRegister'; 
import StudentsPage from './pages/student/StudentsPage'; 
import ModifyStudentPage from './pages/student/ModifyStudentPage'; 

import SubjectsPage from './pages/subject/SubjectsPage'; 
import AddSubjectPage from './pages/subject/AddSubjectPage'; 
import UpdateSubjectPage from './pages/subject/UpdateSubjectPage'; 
import SearchSubjectPage from './pages/subject/SearchSubjectPage'; 
import DeleteSubjectPage from './pages/subject/DeleteSubjectPage'; 

import MappedPage from './pages/timetable/Mapped';
import GenerateTimetablePage from './pages/timetable/GenerateTimetablePage';
import AdminTimetablePdfGenerator from './pages/admin/AdminTimetablePdfGenerator';
import CreateTimetablePage from './pages/timetable/CreateTimetablePage';
import GetAllTimetables from './pages/timetable/GetAllTimetables';
import ViewClassMappingsPage from './pages/timetable/ViewClassMappingsPage';

import CreateExam from './pages/exam/createExam';
import GetAllExams from './pages/exam/GetAllExams';
import UpdateExam from './pages/exam/UpdateExam';
import DeleteExam from './pages/exam/DeleteExam';
import GetSingleExam from './pages/exam/GetSingleExam';

import CreateExamResult from './pages/exam-result/CreateExamResult';
import ExamResultsByExam from './pages/exam-result/ExamResultsByExam';
import UpdateExamResult from './pages/exam-result/UpdateExamResult';

import MarkStudentAttendance from './pages/attendence/MarkStudentAttendance';
import MarkTeacherAttendance from './pages/attendence/MarkTeacherAttendance';
import GetTeacherAttendance from './pages/attendence/GetTeacherAttendance';
import UpdateTeacherAttendance from './pages/attendence/UpdateTeacherAttendance';

import TeacherChangePassword from './pages/teacher/TeacherChangePassword';
import GetTeacherSchedule from './pages/teacher_pages/GetTeacherSchedule';
import CreateAttendance from './pages/teacher_pages/CreateAttendance';

import './App.css';

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  document.documentElement.setAttribute('data-theme', theme);
  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

function AppContent() {
  return (
    <Router>
      <AuthProvider>
        <ThemeToggleButton />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />


          {/* Protected admin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />

          <Route path="/admin/teachers/register" element={<ProtectedRoute element={<TeacherRegister />} requiredRole="admin" />} />
          <Route path="/admin/teachers" element={<ProtectedRoute element={<TeachersPage />} requiredRole="admin" />} />
          <Route path="/admin/teachers/modify" element={<ProtectedRoute element={<ModifyTeacherPage />} requiredRole="admin" />} />
          <Route path="/admin/teachers/search" element={<ProtectedRoute element={<SearchTeacher />} requiredRole="admin" />} />

          <Route path="/admin/students/register" element={<ProtectedRoute element={<StudentRegister />} requiredRole="admin" />} />
          <Route path="/admin/students" element={<ProtectedRoute element={<StudentsPage />} requiredRole="admin" />} />
          <Route path="/admin/students/modify" element={<ProtectedRoute element={<ModifyStudentPage />} requiredRole="admin" />} />

          <Route path="/admin/classes" element={<ProtectedRoute element={<ClassesPage />} requiredRole="admin" />} />
          <Route path="/admin/classes/add" element={<ProtectedRoute element={<AddClassPage />} requiredRole="admin" />} />
          <Route path="/admin/classes/modify" element={<ProtectedRoute element={<ModifyClassPage />} requiredRole="admin" />} />
          <Route path="/admin/classes/modify/:c_id" element={<ProtectedRoute element={<ModifyClassPage />} requiredRole="admin" />} />
          <Route path="/admin/classes/search" element={<ProtectedRoute element={<SearchClass />} requiredRole="admin" />} />

          {/* Protected teacher routes */}
          <Route path="/teacher/dashboard" element={<ProtectedRoute element={<TeacherDashboard />} requiredRole="teacher" />} />

          {/* Protected student routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute element={<StudentDashboard />} requiredRole="student" />} />

          {/* Protected admin subject routes */}
          <Route path="/admin/subjects" element={<ProtectedRoute element={<SubjectsPage />} requiredRole="admin" />} />
          <Route path="/admin/subjects/add" element={<ProtectedRoute element={<AddSubjectPage />} requiredRole="admin" />} />
          <Route path="/admin/subjects/updatesubject/:subjectCode" element={<ProtectedRoute element={<UpdateSubjectPage />} requiredRole="admin" />} />
          <Route path="/admin/subjects/search" element={<ProtectedRoute element={<SearchSubjectPage />} requiredRole="admin" />} />
          <Route path="/admin/subjects/delete" element={<ProtectedRoute element={<DeleteSubjectPage />} requiredRole="admin" />} />

          <Route path="/admin/mapped" element={<ProtectedRoute element={<MappedPage />} requiredRole="admin" />} />
          <Route path="/admin/generatetimetable" element={<ProtectedRoute element={<GenerateTimetablePage />} requiredRole="admin" />} />
          <Route path="/admin/timetable-pdf" element={<ProtectedRoute element={<AdminTimetablePdfGenerator />} requiredRole="admin" />} />
          <Route path="/admin/timetable/create" element={<ProtectedRoute element={<CreateTimetablePage />} requiredRole="admin" />} />
          <Route path="/admin/timetable/getall" element={<ProtectedRoute element={<GetAllTimetables />} requiredRole="admin" />} />
          <Route path="/admin/timetable/view-mappings" element={<ProtectedRoute element={<ViewClassMappingsPage />} requiredRole="admin" />} />

          <Route path="/admin/exams/create" element={<ProtectedRoute element={<CreateExam />} requiredRole="admin" />} />
          <Route path="/admin/exams/delete" element={<ProtectedRoute element={<DeleteExam />} requiredRole="admin" />} />
          <Route path="/admin/exams/getall" element={<ProtectedRoute element={<GetAllExams />} requiredRole="admin" />} />
          <Route path="/admin/exams/update/:examId" element={<ProtectedRoute element={<UpdateExam />} requiredRole="admin" />} />
          <Route path="/admin/exams/getsingle/:examId" element={<ProtectedRoute element={<GetSingleExam />} requiredRole="admin" />} />

          <Route path="/admin/examresult/create" element={<ProtectedRoute element={<CreateExamResult />} requiredRole="admin" />} />
          <Route path="/admin/examresult/getbyexam/:examId" element={<ProtectedRoute element={<ExamResultsByExam />} requiredRole="admin" />} />
          <Route path="/admin/examresult/update/:resultId" element={<ProtectedRoute element={<UpdateExamResult />} requiredRole="admin" />} />

          <Route path="/admin/teachers/attendance" element={<ProtectedRoute element={<MarkTeacherAttendance />} requiredRole="admin" />} />
          <Route path="/admin/teacher-attendance" element={<ProtectedRoute element={<GetTeacherAttendance />} requiredRole="admin" />} />
          <Route path="/admin/teacher-attendance/update/:attendanceId" element={<ProtectedRoute element={<UpdateTeacherAttendance />} requiredRole="admin" />} />

          <Route path="/teacher/change-password" element={<ProtectedRoute element={<TeacherChangePassword />} requiredRole="teacher" />} />
          <Route path="/teacher/schedule" element={<ProtectedRoute element={<GetTeacherSchedule />} requiredRole="teacher" />} />
          <Route path="/teacher/create-attendance" element={<ProtectedRoute element={<CreateAttendance />} requiredRole="teacher" />} />

          {/* <Route path="*" element={<Navigate to="/" />} />  */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}