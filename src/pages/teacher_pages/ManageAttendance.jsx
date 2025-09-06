import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Dashboard.css";
import TeacherSidebar from "../../components/TeacherSidebar";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

function ManageAttendance() {
  const { user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [studentId, setStudentId] = useState("");

  const [records, setRecords] = useState(null); // single object with {attendance: {absent: []}}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [classes, setClasses] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [students, setStudents] = useState([]);
 

  const [selectedClassId, setSelectedClassId] = useState("");

  /** ================== FETCH INITIAL DATA ================== */
  useEffect(() => {
    if (!user?._id) return;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch classes mapped to teacher
        const classesRes = await axios.get(
          `${API_BASE_URL}/api/v1/teacher/${user._id}`,
          { withCredentials: true }
        );
        if (classesRes.data.mapped) {
          const uniqueClasses = [];
          const seen = new Set();
          classesRes.data.mapped.forEach((mapping) => {
            if (mapping.classId && !seen.has(mapping.classId._id)) {
              seen.add(mapping.classId._id);
              uniqueClasses.push(mapping.classId);
            }
          });
          console.log("uniqueClasses: ", uniqueClasses);
          setClasses(uniqueClasses);
        }

        // Fetch time slots
        const slotsRes = await axios.get(
          `${API_BASE_URL}/api/v1/teacher/getallslots`,
          { withCredentials: true }
        );
        console.log("timeSlots: ", slotsRes.data);

        setTimeSlots(slotsRes.data || []);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load initial data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user?._id, API_BASE_URL]);

  /** ================== FETCH STUDENTS WHEN CLASS CHANGES ================== */
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/teacher/class/${selectedClassId}/students`,
          { withCredentials: true }
        );
        console.log("students in class: ", res.data);

        if (res.data.success) {
          setStudents(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students for this class.");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClassId, API_BASE_URL]);

  /** ================== FETCH ATTENDANCE (CLASS + DATE) ================== */
  const fetchClassAttendance = async () => {
    if (!classId || !date) {
      setError("Please select class and date");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/attendance/class/${classId}/date/${date}`,
        { withCredentials: true }
      );
      console.log("class attendance: ", res.data);

      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching class attendance:", err);
      setError("Failed to load attendance records.");
      setRecords(null);
    } finally {
      setLoading(false);
    }
  };

  /** ================== FETCH ATTENDANCE (STUDENT) ================== */
  const fetchStudentAttendance = async () => {
    if (!studentId) {
      setError("Please select a student");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/attendance/student/${studentId}`,
        { withCredentials: true }
      );
      console.log("student attendance: ", res.data);

      setRecords(res.data.data || null);
    } catch (err) {
      console.error("Error fetching student attendance:", err);
      setError("Failed to load student attendance.");
      setRecords(null);
    } finally {
      setLoading(false);
    }
  };

  /** ================== TOGGLE ATTENDANCE ================== */
  const handleToggleAttendance = async (studentId, recordIndex) => {
    if (!records?.attendance) return;
    const updated = { ...records.attendance.find(rec => rec._id === recordIndex) };

    if (updated.absent.includes(studentId)) {
      updated.absent = updated.absent.filter(
        (id) => id !== studentId
      );
    } else {
      updated.absent = [...updated.absent, studentId];
    }
    setRecords(updated);
    // setSuccess("Attendance updated locally!");

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/v1/attendance/update/${recordIndex}`,
        updated,
        { withCredentials: true }
      );
      console.log("Attendance updated successfully:", res.data);

    } catch (err) {
      console.log("Error updating attendance:", err);
    }
  };

  /** ================== DELETE ATTENDANCE ================== */
  const handleDeleteAttendance = async (recordId) => {
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/v1/attendance/delete/${recordId}`,
        {withCredentials: true}
      );
      console.log("response to deleting attendance: ",res);
    } catch (err) {
      console.log("error occured while deleting attendence of whole class: ",err );
    }
  }

  return (
    <div className="dashboard-container">
      <TeacherSidebar />
      <main className="main-content">
        <Navbar pageTitle="Manage Attendance Records" />
        <div className="form-container">
          <h2>Search Attendance</h2>

          <br />

          {/* Search by class/date */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            <div>
              <label>Select Class: </label>
              <select
                value={classId && selectedClassId ? selectedClassId : classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSelectedClassId(e.target.value);
                }}
                required
              >
                <option value="">-- Select Class --</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.classId} ({cls.section})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Date: </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <button type="button" onClick={fetchClassAttendance}>
              Get Class Attendance
            </button>
          </div>

          <hr />

          <br />

          {/* Search by student */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            <div>
              <label>Select Class: </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
              >
                <option value="">-- Select Class --</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.classId} ({cls.section})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Student: </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              >
                <option value="">-- Select Student --</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={fetchStudentAttendance}>
              Get Student Attendance
            </button>
          </div>

          {loading && <p>Loading...</p>}
          {error && <div style={{ color: "red" }}>{error}</div>}
          {success && <div style={{ color: "green" }}>{success}</div>}

          {records?.attendance && (
            <div style={{ marginTop: 30 }}>
              <h3>Attendance Records</h3>
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                <table style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Period</th>
                      <th>Class</th>
                      <th>Student</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records && records.attendance.map((record, rIndex) => (
                      <React.Fragment key={record._id}>
                        {students.map((student) => {
                          const isAbsent = record.absent.some(student2 => student2._id === student._id);
                          const slot = timeSlots.find(ts => ts._id === record.period);

                          return (
                            <tr key={`${record._id}-${student._id}`}>
                              <td>{date}</td>
                              <td>{slot ? slot.period : "Unknown"}</td>
                              <td>{classes.find((c) => c._id === selectedClassId)?.classId}</td>
                              <td>{student.name}</td>
                              <td style={{ color: isAbsent ? "red" : "green" }}>
                                {isAbsent ? "Absent" : "Present"}
                              </td>
                              <td>
                                <button onClick={() => handleToggleAttendance(student._id, record._id)}>
                                  Toggle Attendance
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {/* Add Delete All for this specific record */}
                        <tr>
                          
                          <td colSpan={6}>
                            <button onClick={() => handleDeleteAttendance(record._id)}>
                              Delete All Attendance ({timeSlots.find(ts => ts._id === record.period)?.period})
                            </button>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}

                  </tbody>
                  
                </table>

              </div>
            </div>
          )}

          {!loading && !records && <p>No attendance records found.</p>}
        </div>
      </main>
    </div>
  );
}

export default ManageAttendance;
