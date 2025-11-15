"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

const API = "https://globaltechsoftwaresolutions.cloud/school-api/api";

export default function Attendance() {
  const [section, setSection] = useState("teacher");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState<any[]>([]);
  const [classesList, setClassesList] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingAttendance, setPendingAttendance] = useState<{ [email: string]: string }>({});

  let userEmail = null;

  if (typeof window !== "undefined") {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      userEmail = userData?.email || userInfo?.email || null;
      console.log("👨‍🏫 Logged-in teacher email (attendance page):", userEmail);
    } catch {}
  }

  /* ============================ 1) Teacher Attendance ============================ */
  const loadTeacherAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/attendance/`);
      const filtered = res.data.filter((a) => a.user_email === userEmail);
      setAttendance(filtered);
    } catch (error) {
      console.error("Error loading teacher attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ============================ 2) Classes ============================ */
  const loadTeacherClasses = async () => {
    setLoading(true);
    try {
      console.log("📘 Loading timetable…");

      const timeRes = await axios.get(`${API}/timetable/`);
      const teacherClasses = timeRes.data.filter((t) => t.teacher === userEmail);

      const uniqueClassIds = [
        ...new Set(teacherClasses.map((cls) => cls.class_id)),
      ];

      console.log("🔥 Unique class IDs:", uniqueClassIds);

      const classRes = await axios.get(`${API}/classes/`);
      const classes = classRes.data.filter((cls) =>
        uniqueClassIds.includes(cls.id)
      );

      console.log("🏫 Final Classes with name & section:", classes);

      setClassesList(classes);
      if (classes.length > 0) setSelectedClass(classes[0].id);
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ============================ 3) Students ============================ */
  const loadStudents = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const classRes = await axios.get(`${API}/classes/`);
      setClassInfo(classRes.data.find((c) => c.id === selectedClass));

      const stuRes = await axios.get(`${API}/students/`);
      setStudents(stuRes.data.filter((s) => s.class_id === selectedClass));
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ============================ 4) Attendance ============================ */
  const loadStudentAttendance = async () => {
    setLoading(true);
    try {
      // Use student_attendance for student records
      const res = await axios.get(`${API}/student_attendance/`);
      const filtered = res.data.filter((a) => {
        if (a.date !== selectedDate) return false;

        // Match by student email field from API
        const recordEmail = (a.student || a.student_email || a.user_email)?.toLowerCase();
        if (!recordEmail) return false;

        return students.some((stu) => stu.email?.toLowerCase() === recordEmail);
      });

      setAttendance(filtered);
    } catch (error) {
      console.error("Error loading student attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ============================ 5) Mark Attendance LOCALLY ============================ */
  const markAttendance = (email: string, status: string) => {
    console.log("📝 Locally marking attendance:", email, status, "date:", selectedDate);
    setPendingAttendance((prev) => ({ ...prev, [email]: status }));
  };

  /* ============================ 6) Submit Attendance to API ============================ */
  const submitAttendance = async () => {
    try {
      if (!userEmail) {
        console.warn("No teacher email found in localStorage; cannot submit attendance");
        return;
      }
      if (!selectedClass) {
        console.warn("No class selected; cannot submit attendance");
        return;
      }

      const emails = Object.keys(pendingAttendance);
      if (emails.length === 0) {
        console.log("ℹ️ No pending attendance changes to submit");
        return;
      }

      const payload = emails.map((email) => ({
        student: email,
        // Teacher email comes from localStorage (userEmail)
        teacher: userEmail,
        class_id: selectedClass,
        date: selectedDate,
        status: pendingAttendance[email],
        // If backend requires subject, adjust this mapping accordingly
        subject: 1,
      }));

      console.log("📨 Submitting bulk student_attendance payload:", payload);
      const resp = await axios.post(`${API}/student_attendance/bulk_create/`, payload);
      console.log("✅ student_attendance bulk_create response:", resp.status, resp.data);

      setPendingAttendance({});
      await loadStudentAttendance();
      console.log("🔄 Reloaded student_attendance after submit");
    } catch (err) {
      console.log("❌ Error submitting attendance:", err);
    }
  };

  /* ============================ FIXED useEffect calls ============================ */
  useEffect(() => {
    const run = async () => {
      await loadTeacherClasses();
    };
    run();
  }, []);

  useEffect(() => {
    if (section === "student") {
      const run = async () => {
        await loadStudents();
      };
      run();
    }
  }, [section, selectedClass]);

  useEffect(() => {
    if (section === "student") {
      const run = async () => {
        await loadStudentAttendance();
      };
      run();
    }
  }, [students, selectedDate]);

  useEffect(() => {
    if (section === "teacher") {
      const run = async () => {
        await loadTeacherAttendance();
      };
      run();
    }
  }, [section]);

  /* ============================ ENHANCED UI ============================ */
  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Management</h1>
          <p className="text-gray-600">Track and manage attendance records</p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          {/* Section Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setSection("teacher")}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  section === "teacher" 
                    ? "bg-white text-blue-600 shadow-sm border border-gray-200" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                👨‍🏫 Teacher Attendance
              </button>
              <button
                onClick={() => setSection("student")}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  section === "student" 
                    ? "bg-white text-green-600 shadow-sm border border-gray-200" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                👥 Student Attendance
              </button>
            </div>

            {/* Date Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
                <span className="text-gray-500">📅</span>
                <input
                  type="date"
                  className="outline-none bg-transparent"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
              >
                Today
              </button>
            </div>
          </div>

          {/* Class Selector for Student Section */}
          {section === "student" && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="font-semibold text-gray-700 min-w-fit">Select Class:</label>
              <select
                value={selectedClass || ""}
                onChange={(e) => setSelectedClass(parseInt(e.target.value))}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {classesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.class_name} {c.sec}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* ============================ TEACHER ATTENDANCE ============================ */}
        {section === "teacher" && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                📊 Your Attendance Records
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Check In</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Check Out</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendance.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6 text-gray-800 font-medium">{a.date}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          a.check_in ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {a.check_in ?? "Not Recorded"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          a.check_out ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {a.check_out ?? "Not Recorded"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          a.status === 'Present' 
                            ? 'bg-green-100 text-green-800' 
                            : a.status === 'Absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {attendance.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-lg">No attendance records found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================ STUDENT ATTENDANCE ============================ */}
        {section === "student" && !loading && (
          <div className="space-y-6">
            {/* Class Info Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Students of {classInfo?.class_name} {classInfo?.sec}
                  </h2>
                  <p className="text-gray-600">Manage student attendance for selected date</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total Students</div>
                    <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                  </div>
                  <button
                    onClick={submitAttendance}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Submit Attendance
                  </button>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Student Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((stu) => {
                      const att = attendance.find((a) => {
                        const recordEmail = (a.student || a.student_email || a.user_email)?.toLowerCase();
                        return recordEmail === stu.email?.toLowerCase();
                      });
                      const isPresent = att?.status === "Present";
                      const isAbsent = att?.status === "Absent";

                      return (
                        <tr key={stu.email} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {stu.fullname?.charAt(0) || 'S'}
                              </div>
                              <span className="font-medium text-gray-800">{stu.fullname}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-600">{stu.email}</td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <button
                                onClick={() => markAttendance(stu.email, "Present")}
                                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                                  isPresent
                                    ? "bg-green-500 text-white shadow-sm"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                              >
                                ✓ Present
                              </button>
                              <button
                                onClick={() => markAttendance(stu.email, "Absent")}
                                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                                  isAbsent
                                    ? "bg-red-500 text-white shadow-sm"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                              >
                                ✗ Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {students.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-lg">No students found for this class</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}