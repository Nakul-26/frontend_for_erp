// CreateExamResult.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

function CreateExamResult() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [marksObtained, setMarksObtained] = useState([]);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API}/api/v1/admin/exam/getall`, { withCredentials: true })
      .then(res => setExams(res.data.data || []));

    axios.get(`${API}/api/v1/admin/getallclassformapped`, { withCredentials: true })
      .then(res => setClasses(res.data.data || []));

    axios.get(`${API}/api/v1/admin/getall`, { withCredentials: true })
      .then(res => {
        setSubjects(res.data.subjects);
      });
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

  useEffect(() => {
    if (!selectedExam) return;
    axios.get(`${API}/api/v1/admin/exam/${selectedExam}`, { withCredentials: true })
      .then(res => {
        const subjectsArr = res.data.data.subjects || [];
        setMarksObtained(subjectsArr.map(s => ({
          subjectId: s.subjectId._id || s.subjectId,
          marks: 0,
          status: "Present"
        })));
      });
  }, [selectedExam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting payload:', {
        examId: selectedExam,
        studentId: selectedStudent,
        marksObtained
      });
      await axios.post(`${API}/api/v1/admin/examresult/create`, {
        examId: selectedExam,
        studentId: selectedStudent,
        marksObtained
      }, { withCredentials: true });
      alert('Exam result created!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating result');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar />
        <div className="form-container" style={{ width: '100%', maxWidth: '100%', margin: 0, background: 'var(--surface, #222)', color: 'var(--text, #e0e0e0)', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px #222' }}>
          <h2 style={{ marginBottom: 24, color: '#2563eb', fontWeight: 700 }}>Create Exam Result</h2>
          <form onSubmit={handleSubmit}>
            <select required value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ padding: 8, borderRadius: 6, width: '100%', marginBottom: 12, border: '1px solid #444', background: 'var(--surface, #222)', color: 'var(--text, #e0e0e0)' }}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name || c.className}</option>)}
            </select>

            <select required value={selectedExam} onChange={e => setSelectedExam(e.target.value)} style={{ padding: 8, borderRadius: 6, width: '100%', marginBottom: 12, border: '1px solid #444', background: 'var(--surface, #222)', color: 'var(--text, #e0e0e0)' }}>
              <option value="">Select Exam</option>
              {exams.map(e => <option key={e._id} value={e._id}>{e.examName}</option>)}
            </select>

            <select required value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} style={{ padding: 8, borderRadius: 6, width: '100%', marginBottom: 12, border: '1px solid #444', background: 'var(--surface, #222)', color: 'var(--text, #e0e0e0)' }}>
              <option value="">Select Student</option>
              {students.map(s => {
                const id = s._id || s.id || s.rollno;
                return <option key={id} value={id}>{s.name}</option>;
              })}
            </select>

            {marksObtained.map((m, i) => {
              const subj = subjects.find(s => s._id === m.subjectId);
              return (
                <div key={i} style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 500, marginRight: 8 }}>
                    Subject: {subj ? `${subj.name} (${subj.code})` : m.subjectId}
                  </label>
                  <input type="number" value={m.marks} onChange={e => {
                    const updated = [...marksObtained];
                    updated[i].marks = Number(e.target.value);
                    setMarksObtained(updated);
                  }} style={{ marginLeft: 8, width: 80, padding: 6, borderRadius: 6, border: '1px solid #444', background: 'var(--surface, #222)', color: 'var(--text, #e0e0e0)' }} />
                  <select value={m.status} onChange={e => {
                    const updated = [...marksObtained];
                    updated[i].status = e.target.value;
                    setMarksObtained(updated);
                  }} style={{ marginLeft: 8, padding: 6, borderRadius: 6, border: '1px solid #444', background: 'var(--surface, #222)', color: 'var(--text, #e0e0e0)' }}>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              );
            })}

            <button type="submit" style={{
              marginTop: 12,
              padding: '10px 20px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 4px #cbd5e1',
            }}>Submit</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateExamResult;
