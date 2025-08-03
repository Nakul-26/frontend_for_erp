// ExamResultsByStudent.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

function ExamResultsByStudent() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API}/api/v1/admin/getallclassformapped`, { withCredentials: true })
      .then(res => setClasses(res.data.data || []));
      // console.log('Fetched classes:', res.data.data);
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }
    axios.get(`${API}/api/v1/admin/studentdata/${selectedClass}`, { withCredentials: true })
      .then(res => {
        setStudents(res.data.data || []);
        console.log('Fetched students:', res.data.data);
      });
  }, [selectedClass]);

  const fetchResults = async () => {
    try {
      console.log('Fetched results:',selectedStudent);
      const res = await axios.get(`${API}/api/v1/admin/examresult/student/${selectedStudent}`, { withCredentials: true });
      setResults(res.data.data || []);
    } catch (err) {
      setResults([]);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar />
        <div className="form-container" style={{ width: '100%', maxWidth: '100%', margin: 0, background: 'var(--surface, #222)', color: 'var(--text, #e0e0e0)', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px #222' }}>
          <h2 style={{ marginBottom: 24, color: '#2563eb', fontWeight: 700 }}>Results by Student</h2>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ padding: 8, borderRadius: 6, width: '100%', marginBottom: 12, border: '1px solid #cbd5e1' }}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name || c.className}</option>)}
          </select>
          <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} style={{ padding: 8, borderRadius: 6, width: '100%', marginBottom: 12, border: '1px solid #cbd5e1' }}>
            <option value="">Select Student</option>
            {students.map(s => {
              const id = s._id;
              return <option key={id} value={id}>{s.name}</option>;
            })}
          </select>
          <button onClick={fetchResults} style={{
            marginBottom: 20,
            padding: '10px 20px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 4px #cbd5e1',
          }}>Get Results</button>
          {results.map(r => (
            <div key={r._id} style={{ marginBottom: 24, background: 'var(--surface, #222)', color: 'var(--text, #e0e0e0)', borderRadius: 8, boxShadow: '0 1px 4px #222', padding: 16 }}>
              <p style={{ fontWeight: 600, color: '#334155' }}>Exam: {r.examId?.examName}</p>
              <ul style={{ marginLeft: 16 }}>
                {r.marksObtained.map((m, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{m.subjectId?.name || m.subjectId}: {m.marks} <span style={{ color: m.status === 'Present' ? '#22c55e' : '#ef4444' }}>({m.status})</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default ExamResultsByStudent;
