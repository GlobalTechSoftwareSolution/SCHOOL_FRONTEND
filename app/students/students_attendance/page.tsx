"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import DashboardLayout from "@/app/components/DashboardLayout";

interface AttendanceRecord {
  id: number;
  student_name: string;
  date: string;
  status: "Present" | "Absent" | "Late" | string;
  marked_by_role?: string;
  remarks?: string;
  section?: string;
  class_id?: number;
  class_name?: string;
}

interface ClassDetails {
  id: number;
  class_name?: string;
  sec?: string;
}

interface StudentData {
  fullname: string;
  class_id?: number;
  class_name?: string;
  section?: string;
  email?: string;
}

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [studentInfo, setStudentInfo] = useState<StudentData | null>(null);

  const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

  // Get user data from localStorage
  const getUserData = () => {
    if (typeof window === "undefined") return { email: "", role: "" };

    try {
      const storedEmail = 
        localStorage.getItem("userEmail") ||
        JSON.parse(localStorage.getItem("userData") || "{}")?.email ||
        JSON.parse(localStorage.getItem("userInfo") || "{}")?.email;

      const storedRole = 
        localStorage.getItem("userRole") ||
        JSON.parse(localStorage.getItem("userData") || "{}")?.role ||
        JSON.parse(localStorage.getItem("userInfo") || "{}")?.role;

      return { 
        email: storedEmail || "", 
        role: storedRole || "Student" 
      };
    } catch (error) {
      console.error("Error reading user data from localStorage:", error);
      return { email: "", role: "" };
    }
  };

  // Fetch student details by email
  const fetchStudentDetails = async (email: string): Promise<StudentData | null> => {
    try {
      const response = await axios.get(
        `${API_BASE}/students/?email=${encodeURIComponent(email)}`
      );
      
      const studentData = Array.isArray(response.data) 
        ? response.data[0] 
        : response.data;

      return studentData || null;
    } catch (error) {
      console.error("Error fetching student details:", error);
      return null;
    }
  };

  // Fetch all classes
  const fetchClasses = async (): Promise<Map<number, ClassDetails>> => {
    try {
      const response = await axios.get(`${API_BASE}/classes/`);
      const classList: ClassDetails[] = response.data || [];
      return new Map(classList.map((cls: ClassDetails) => [cls.id, cls]));
    } catch (error) {
      console.error("Error fetching classes:", error);
      return new Map();
    }
  };

  // Fetch attendance data
  const fetchAttendanceData = async (email: string, studentData: StudentData, classMap: Map<number, ClassDetails>) => {
    try {
      const response = await axios.get(`${API_BASE}/student_attendance/`);
      const rawAttendance: any[] = response.data || [];
      
      console.log("📋 Total student_attendance records:", rawAttendance.length);

      // Filter attendance for the logged-in student
      const filteredAttendance: AttendanceRecord[] = rawAttendance
        .filter((record) => {
          if (!record) return false;

          const recordEmail = (
            record.student || 
            record.student_email || 
            record.user_email || 
            ""
          ).toLowerCase().trim();

          return recordEmail === email.toLowerCase().trim();
        })
        .map((record) => {
          const classDetails = record.class_id ? classMap.get(record.class_id) : undefined;
          
          return {
            id: record.id,
            student_name: record.student_name || studentData.fullname || email,
            date: record.date,
            status: record.status || "Unknown",
            marked_by_role: record.teacher_name || record.marked_by_role || "Unknown",
            remarks: record.remarks || "",
            section: record.section || classDetails?.sec || studentData.section || "N/A",
            class_id: record.class_id,
            class_name: record.class_name || classDetails?.class_name || studentData.class_name || "Unknown",
          };
        });

      console.log("✅ Filtered attendance records:", filteredAttendance.length);
      return filteredAttendance;
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      throw error;
    }
  };

  // Main data fetching function
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const { email, role } = getUserData();
      
      if (!email) {
        setError("⚠️ No logged-in user found. Please log in again.");
        return;
      }

      setUserEmail(email);
      setUserRole(role);

      console.log("🎓 Fetching attendance for:", email);

      // Fetch student details
      const studentData = await fetchStudentDetails(email);
      if (!studentData) {
        setError("❌ No student data found for your account.");
        return;
      }

      setStudentInfo(studentData);
      console.log("✅ Student found:", studentData);

      // Fetch classes and create mapping
      const classMap = await fetchClasses();

      // Fetch attendance data
      const attendanceRecords = await fetchAttendanceData(email, studentData, classMap);
      
      if (attendanceRecords.length === 0) {
        setError("📝 No attendance records found for your account.");
      }

      setAttendanceData(attendanceRecords);
    } catch (err) {
      console.error("❌ Error in fetchAttendance:", err);
      setError("Failed to fetch attendance data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Calculate attendance statistics
  const presentCount = attendanceData.filter(att => att.status === "Present").length;
  const absentCount = attendanceData.filter(att => att.status === "Absent").length;
  const lateCount = attendanceData.filter(att => att.status === "Late").length;
  const totalCount = attendanceData.length;
  const attendancePercentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : "0";

  // Format date to YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get attendance for selected date
  const selectedDateString = getLocalDateString(selectedDate);
  const dayAttendance = attendanceData.filter(att => att.date === selectedDateString);

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700 border border-green-200";
      case "Late":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "Absent":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* HEADER SECTION */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  📅
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Attendance Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Welcome,{" "}
                    <span className="font-semibold text-blue-600">{userEmail}</span>
                    <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {userRole}
                    </span>
                  </p>
                </div>
              </div>
              
              {studentInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                  <p className="text-sm text-gray-600">Class & Section</p>
                  <p className="text-lg font-bold text-gray-900">
                    {studentInfo.class_name || "Unknown"} - {studentInfo.section || "N/A"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* STATISTICS AND CALENDAR SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 border border-green-200 rounded-xl text-center shadow-sm">
                <p className="text-2xl font-bold text-green-700">{presentCount}</p>
                <p className="text-sm font-medium text-green-700">Present</p>
              </div>
              <div className="bg-red-50 p-4 border border-red-200 rounded-xl text-center shadow-sm">
                <p className="text-2xl font-bold text-red-700">{absentCount}</p>
                <p className="text-sm font-medium text-red-700">Absent</p>
              </div>
              <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-xl text-center shadow-sm">
                <p className="text-2xl font-bold text-yellow-700">{lateCount}</p>
                <p className="text-sm font-medium text-yellow-700">Late</p>
              </div>
              <div className="bg-purple-50 p-4 border border-purple-200 rounded-xl text-center shadow-sm">
                <p className="text-2xl font-bold text-purple-700">
                  {attendancePercentage}%
                </p>
                <p className="text-sm font-medium text-purple-700">Percentage</p>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Select a date to view attendance
              </h3>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Calendar Component */}
                <div className="flex justify-center">
                  <Calendar
                    onChange={(value) => {
                      if (value instanceof Date) {
                        setSelectedDate(value);
                      }
                    }}
                    value={selectedDate}
                    className="react-calendar rounded-2xl shadow-inner bg-white border border-gray-200"
                  />
                </div>
                
                {/* Selected Date Details */}
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Selected Date</p>
                  <p className="text-xl font-bold text-gray-900 mb-4">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  
                  {dayAttendance.length > 0 ? (
                    <div className="space-y-3">
                      {dayAttendance.map((attendance) => (
                        <div
                          key={attendance.id}
                          className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                              {attendance.class_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Section {attendance.section}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(attendance.status)}`}
                          >
                            {attendance.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 text-sm">
                        No attendance record available for this date.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ATTENDANCE TABLE SECTION */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Attendance History
              </h2>
              <p className="text-gray-600 mt-1">
                Your complete attendance record
              </p>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 mt-2">Loading attendance data...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-600 font-semibold mb-2">{error}</div>
                  <button
                    onClick={fetchAttendance}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : attendanceData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Marked By
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendanceData.map((record) => (
                        <tr 
                          key={record.id} 
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.date}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {record.class_name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {record.section}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(record.status)}`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {record.marked_by_role || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {record.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">
                    No attendance records found.
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Your attendance records will appear here once they are marked.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles for Calendar */}
      <style jsx global>{`
        .react-calendar {
          border: none;
          background: transparent;
          width: 100%;
          max-width: 400px;
          font-family: inherit;
        }
        
        .react-calendar__tile {
          border-radius: 8px;
          padding: 0.75em 0.5em;
          margin: 1px;
          transition: all 0.2s ease;
        }
        
        .react-calendar__tile:hover {
          background-color: #f3f4f6;
        }
        
        .react-calendar__tile--active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
          color: white;
        }
        
        .react-calendar__tile--now {
          background: #dbeafe;
          border: 1px solid #3b82f6;
        }
        
        .react-calendar__navigation button {
          border-radius: 8px;
          min-width: 44px;
          background: none;
          font-size: 16px;
          margin: 1px;
        }
        
        .react-calendar__navigation button:hover {
          background-color: #f3f4f6;
        }
        
        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: 600;
          font-size: 0.75em;
          color: #6b7280;
        }
        
        @media (max-width: 768px) {
          .react-calendar {
            font-size: 0.85rem;
          }
          
          .react-calendar__navigation button {
            font-size: 0.85rem;
            min-width: 36px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default AttendancePage;