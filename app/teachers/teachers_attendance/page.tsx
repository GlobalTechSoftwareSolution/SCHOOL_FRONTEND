"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  User,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  School,
  Calendar,
  Users,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api/";

interface AttendanceRecord {
  id: number;
  user_email: string;
  user_name: string;
  date: string;
  check_in?: string;
  status?: string;
}

interface Student {
  id: number;
  fullname: string;
  email: string;
  class_id: number;
  markedStatus?: string | null;
}

export default function AttendancePage() {
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<"teacher" | "students" | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // ✅ Load teacher info from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      const userInfo = localStorage.getItem("userInfo");
      const accessToken = localStorage.getItem("accessToken");

      const parsedData = userData ? JSON.parse(userData) : null;
      const parsedInfo = userInfo ? JSON.parse(userInfo) : null;

      const email =
        parsedData?.email ||
        parsedInfo?.email ||
        localStorage.getItem("userEmail");

      if (email) setTeacherEmail(email);
      if (accessToken) setToken(accessToken);
    } catch (error) {
      console.error("❌ Error parsing user info:", error);
    }
  }, []);

  // ✅ Use direct axios calls (same as working marks system)

  // ✅ Fetch teacher's specific attendance for selected date
  const fetchTeacherAttendance = async (date?: string) => {
    if (!teacherEmail) return;
    setLoading(true);
    try {
      const targetDate = date || selectedDate;
      const res = await axios.get(`${API_BASE}/attendance/`);
      
      // Filter by teacher email AND selected date
      const teacherRecords = res.data.filter(
        (record: any) =>
          (record.user_email?.toLowerCase() === teacherEmail.toLowerCase() ||
          record.user_email?.toLowerCase().includes(teacherEmail.split("@")[0])) &&
          record.date === targetDate
      );
      setAttendance(teacherRecords);
      setMessage("");
    } catch (error) {
      console.error("❌ Failed to load teacher attendance:", error);
      setMessage("Failed to load teacher attendance.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch classes taught by teacher
  const fetchTeacherClasses = async () => {
    if (!teacherEmail) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/classes/?teacher=${teacherEmail}`);

      const teacherNameFromEmail = teacherEmail
        .split("@")[0]
        .replace(".", " ")
        .toLowerCase();

      const teacherClasses = res.data.filter(
        (cls: any) =>
          cls.class_teacher_name?.toLowerCase()?.trim() ===
          teacherNameFromEmail.trim()
      );

      setClasses(teacherClasses);

      if (teacherClasses.length === 1) {
        setSelectedClass(teacherClasses[0].id);
        fetchStudentsWithAttendance(teacherClasses[0].id, selectedDate);
      }
    } catch (error) {
      console.error("❌ Failed to load teacher classes:", error);
      setMessage("Failed to load teacher classes.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch students for selected class with their attendance for the selected date
  const fetchStudentsWithAttendance = async (classId: number, date: string) => {
    setSelectedClass(classId);
    setLoading(true);
    try {
      // Fetch students
      let res = await axios.get(`${API_BASE}/students/?class_id=${classId}`);
      if (!res.data.length) {
        res = await axios.get(`${API_BASE}/students/?class_id__id=${classId}`);
      }
      
      const studentsData: Student[] = res.data;
      
      // Fetch attendance for these students on the selected date
      const attendancePromises = studentsData.map(async (student) => {
        try {
          const attendanceRes = await axios.get(
            `${API_BASE}/attendance/?user_email=${student.email}&date=${date}`
          );
          
          if (attendanceRes.data && attendanceRes.data.length > 0) {
            return {
              ...student,
              markedStatus: attendanceRes.data[0].status
            };
          }
          // Return student with null status if no attendance record exists
          return { ...student, markedStatus: null };
        } catch (error) {
          console.error(`❌ Failed to fetch attendance for ${student.email}:`, error);
          return { ...student, markedStatus: null };
        }
      });

      const studentsWithAttendance = await Promise.all(attendancePromises);
      setStudents(studentsWithAttendance);
      
    } catch (error) {
      console.error("❌ Failed to load students:", error);
      setMessage("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Safe attendance marking (prevents IntegrityError) - FIXED VERSION
  const markAttendance = async (studentEmail) => {
  if (!teacherEmail || !selectedClass) return;

  const student = students.find((s) => s.email === studentEmail);
  if (!student) return;

  const payload = {
    user_email: student.email,
    user_name: student.fullname,
    class_id: selectedClass,
    date: selectedDate,
    role: "Student",
    check_in: new Date().toTimeString().split(" ")[0], // current time
  };

  console.log("📝 Sending attendance payload:", payload);

  try {
    const response = await axios.post(`${API_BASE}attendance/mark/`, payload);

console.log(`✅ ${student.fullname} marked as ${response.data.status}`);

    // The server decides Present/Absent internally
    const actualStatus = response.data.status || "Auto-Determined";

    // Update local state to reflect actual server status
    setStudents((prev) =>
      prev.map((s) =>
        s.email === student.email ? { ...s, markedStatus: actualStatus } : s
      )
    );

    setMessage(`✅ ${student.fullname} marked as ${actualStatus}`);

  } catch (error) {
    console.error("❌ Failed to mark attendance:", error);
    setMessage("❌ Failed to mark attendance.");
  }
};

  // ✅ Handle date change for students view
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    if (selectedClass) {
      fetchStudentsWithAttendance(selectedClass, newDate);
    }
  };

  // ✅ Handle date change for teacher view
  const handleTeacherDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchTeacherAttendance(newDate);
  };

  // 🔁 Handle view switching
  useEffect(() => {
    if (!teacherEmail) return;
    if (view === "teacher") {
      fetchTeacherAttendance(selectedDate);
    } else if (view === "students") {
      fetchTeacherClasses();
    }
  }, [view, teacherEmail]);

  // 🔁 Refresh students data when selectedDate changes for students view
  useEffect(() => {
    if (view === "students" && selectedClass) {
      fetchStudentsWithAttendance(selectedClass, selectedDate);
    }
  }, [selectedDate, selectedClass]);

  // 🧩 Render attendance status (for teacher view)
  const renderStatus = (status: string) => {
    switch (status) {
      case "Present":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-2 rounded-full flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4" /> Present
          </span>
        );
      case "Absent":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-2 rounded-full flex items-center gap-2 font-medium">
            <XCircle className="w-4 h-4" /> Absent
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-full flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4" /> Leave
          </span>
        );
    }
  };

  // 📊 Calculate attendance stats
  const getAttendanceStats = () => {
    const present = students.filter(s => s.markedStatus === 'Present').length;
    const absent = students.filter(s => s.markedStatus === 'Absent').length;
    const leave = students.filter(s => s.markedStatus === 'Leave').length;
    const notMarked = students.filter(s => s.markedStatus === null).length;
    const total = students.length;
    
    return { present, absent, leave, notMarked, total };
  };

  const stats = getAttendanceStats();

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <School className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    📊 Attendance Management
                  </h1>
                  {teacherEmail && (
                    <p className="text-gray-600 mt-1">
                      Logged in as <span className="font-semibold text-blue-600">{teacherEmail}</span>
                    </p>
                  )}
                </div>
              </div>
              
              {/* Date Picker */}
              <div className="flex items-center gap-4 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <Calendar className="w-5 h-5 text-blue-600" />
                <label className="text-blue-700 font-semibold whitespace-nowrap">
                  Selected Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setSelectedDate(newDate);
                    if (view === "teacher") {
                      handleTeacherDateChange(newDate);
                    } else if (view === "students" && selectedClass) {
                      handleDateChange(newDate);
                    }
                  }}
                  className="border border-blue-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  max={new Date().toISOString().split('T')[0]} // Can't select future dates
                />
              </div>
            </div>
          </motion.div>

          {/* View Selection Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <div
              onClick={() => setView("teacher")}
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                view === "teacher"
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                  : "bg-white text-gray-800 border-gray-200 hover:border-blue-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  view === "teacher" ? "bg-blue-500" : "bg-blue-100 text-blue-600"
                }`}>
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">My Attendance</h3>
                  <p className={view === "teacher" ? "text-blue-100" : "text-gray-600"}>
                    View your attendance records for any date
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setView("students")}
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                view === "students"
                  ? "bg-green-600 text-white border-green-600 shadow-lg scale-105"
                  : "bg-white text-gray-800 border-gray-200 hover:border-green-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  view === "students" ? "bg-green-500" : "bg-green-100 text-green-600"
                }`}>
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Student Attendance</h3>
                  <p className={view === "students" ? "text-green-100" : "text-gray-600"}>
                    Mark and manage student attendance
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Section */}
          {loading ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-2xl shadow-lg">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading attendance data...</p>
              </div>
            </div>
          ) : view === "teacher" ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  My Attendance Records for {new Date(selectedDate).toLocaleDateString()}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Total Records: {attendance.length}</span>
                </div>
              </div>

              {attendance.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No attendance records found for you on {new Date(selectedDate).toLocaleDateString()}.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <tr>
                        <th className="p-4 text-left font-semibold">Date</th>
                        <th className="p-4 text-left font-semibold">Student</th>
                        <th className="p-4 text-center font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendance.map((record, index) => (
                        <motion.tr
                          key={record.id || record.user_email}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="p-4 text-gray-700">{record.user_email}</td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              {renderStatus(record.status || "Present")}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          ) : view === "students" ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Class Selection Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                      <Users className="w-6 h-6 text-green-600" />
                      Manage Student Attendance for {new Date(selectedDate).toLocaleDateString()}
                    </h2>
                    <p className="text-gray-600">Select a class to mark attendance for students</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-3">
                      <label className="text-gray-700 font-semibold whitespace-nowrap">
                        Select Class:
                      </label>
                      <select
                        onChange={(e) => {
                          const classId = Number(e.target.value);
                          if (classId) {
                            fetchStudentsWithAttendance(classId, selectedDate);
                          } else {
                            setSelectedClass(null);
                            setStudents([]);
                          }
                        }}
                        className="border border-gray-300 rounded-lg p-3 min-w-[200px] focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">-- Choose a class --</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.class_name} - {cls.sec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              {selectedClass && students.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-green-700">{stats.present}</p>
                        <p className="text-green-600 text-sm">Present</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
                        <p className="text-red-600 text-sm">Absent</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <Clock className="w-8 h-8 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold text-yellow-700">{stats.leave}</p>
                        <p className="text-yellow-600 text-sm">Leave</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <User className="w-8 h-8 text-gray-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-700">{stats.notMarked}</p>
                        <p className="text-gray-600 text-sm">Not Marked</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                        <p className="text-blue-600 text-sm">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Students Table */}
              {selectedClass && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  {students.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No students found for this class.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                          <tr>
                            <th className="p-4 text-left font-semibold">Student Information</th>
                            <th className="p-4 text-center font-semibold">Current Status</th>
                            <th className="p-4 text-center font-semibold">Attendance Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {students.map((student, index) => (
                            <motion.tr
                              key={student.id || student.email}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{student.fullname}</p>
                                    <p className="text-sm text-gray-500">{student.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex justify-center">
                                  {student.markedStatus ? (
                                    <div className={`px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                                      student.markedStatus === "Present"
                                        ? "bg-green-100 text-green-700"
                                        : student.markedStatus === "Absent"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}>
                                      {student.markedStatus === "Present" && <CheckCircle className="w-4 h-4" />}
                                      {student.markedStatus === "Absent" && <XCircle className="w-4 h-4" />}
                                      {student.markedStatus === "Leave" && <Clock className="w-4 h-4" />}
                                      {student.markedStatus}
                                    </div>
                                  ) : (
                                    <div className="px-3 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      Not Marked
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col items-center gap-3">
                                  <div className="flex gap-2 flex-wrap justify-center">
                                    <button
                                      onClick={() => markAttendance(student.email, "Present")}
                                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        student.markedStatus === "Present"
                                          ? "bg-green-600 text-white shadow-md border-2 border-green-600"
                                          : "bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-100"
                                      }`}
                                    >
                                      Present
                                    </button>
                                    <button
                                      onClick={() => markAttendance(student.email, "Absent")}
                                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        student.markedStatus === "Absent"
                                          ? "bg-red-600 text-white shadow-md border-2 border-red-600"
                                          : "bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-100"
                                      }`}
                                    >
                                      Absent
                                    </button>
                                    <button
                                      onClick={() => markAttendance(student.email, "Leave")}
                                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        student.markedStatus === "Leave"
                                          ? "bg-yellow-600 text-white shadow-md border-2 border-yellow-600"
                                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-2 border-yellow-100"
                                      }`}
                                    >
                                      Leave
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <School className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-700 mb-3">Welcome to Attendance Management</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Select an option above to view your attendance records or manage student attendance.
              </p>
            </motion.div>
          )}

          {/* Message Display */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl text-center font-semibold ${
                message.includes('✅') 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}