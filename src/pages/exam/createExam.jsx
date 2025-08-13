import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function CreateExam() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Fetch all classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclassformapped`, { withCredentials: true });
        setClasses(res.data.data || []);
      } catch (error) {
        // Optionally handle error
        setClasses([]);
      }
    };
    fetchClasses();
  }, []);

  // Fetch mapped subjects when class changes
  useEffect(() => {
    if (!selectedClass) {
      setSubjects([]);
      setSelectedSubjects([]);
      return;
    }
    axios.get(`${API_BASE_URL}/api/v1/admin/getClassMappings/${selectedClass}`, { withCredentials: true })
      .then(res => {
        // Extract unique subjects from mapping pairs
        const pairs = res.data.data || [];
        const subjectsMap = {};
        pairs.forEach(m => {
          const subj = typeof m.subjectId === 'object' ? m.subjectId : null;
          if (subj && subj._id) subjectsMap[subj._id] = subj;
        });
        setSubjects(Object.values(subjectsMap));
        setSelectedSubjects([]); // reset subjects on class change
      });
  }, [selectedClass]);

  const handleSubjectChange = (index, field, value) => {
    const updated = [...selectedSubjects];
    updated[index][field] = value;
    setSelectedSubjects(updated);
  };

  const addSubject = () => {
    setSelectedSubjects([...selectedSubjects, { subjectId: '', maxMarks: 100 }]);
  };

  const removeSubject = (index) => {
    const updated = [...selectedSubjects];
    updated.splice(index, 1);
    setSelectedSubjects(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        classId: selectedClass,
        examName,
        examDate,
        subjects: selectedSubjects
      };
      const res = await axios.post(`${API_BASE_URL}/api/v1/admin/exam/create`, payload, { withCredentials: true });
      alert('Exam created!');
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar pageTitle={"Create Exam"} />
        <div style={{ width: '100%', maxWidth: '100%', margin: 0, padding: '30px 0' }}>
          <div className="timetable-form-container">
            <form onSubmit={handleSubmit}>
              {/* <h2 style={{ marginBottom: 16 }}>Create Exam</h2> */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, marginRight: 8 }}>Class:</label>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}>
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {selectedClass && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontWeight: 600, marginRight: 8 }}>Exam Name:</label>
                    <input type="text" value={examName} onChange={e => setExamName(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', width: '100%' }} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontWeight: 600, marginRight: 8 }}>Exam Date:</label>
                    <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                  </div>
                  <h3 style={{ marginTop: 24 }}>Subjects:</h3>
                  {selectedSubjects.map((sub, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <select value={sub.subjectId} onChange={e => handleSubjectChange(idx, 'subjectId', e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginRight: 8 }}>
                        <option value="">Select Subject</option>
                        {subjects.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                      <input type="number" value={sub.maxMarks} min={1} onChange={e => handleSubjectChange(idx, 'maxMarks', e.target.value)} required style={{ width: 100, padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginRight: 8 }} />
                      <button type="button" onClick={() => removeSubject(idx)} style={{ color: 'red', border: 'none', background: 'none', fontWeight: 600, cursor: 'pointer' }}>Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={addSubject} style={{ marginTop: 8, marginBottom: 16, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Add Subject</button>
                </>
              )}

              <br />
              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }} disabled={!selectedClass}>Create Exam</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateExam;
