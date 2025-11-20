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
    console.log(`🔍 Fetching student details for email: ${email}`);
    
    try {
      const response = await axios.get(
        `${API_BASE}/students/?email=${encodeURIComponent(email)}`
      );
      
      console.log("📥 Student details response:", response.data);
      
      const studentData = Array.isArray(response.data) 
        ? response.data[0] 
        : response.data;

      console.log("✅ Student data extracted:", studentData);
      return studentData || null;
    } catch (error) {
      console.error("❌ Error fetching student details:", error);
      return null;
    }
  };

  // Fetch all classes
  const fetchClasses = async (): Promise<Map<number, ClassDetails>> => {
    console.log("🔍 Fetching all classes...");
    
    try {
      const response = await axios.get(`${API_BASE}/classes/`);
      console.log("📥 Classes response:", response.data);
      
      const classList: ClassDetails[] = response.data || [];
      const classMap = new Map(classList.map((cls: ClassDetails) => [cls.id, cls]));
      
      console.log("✅ Classes map created with", classMap.size, "entries");
      return classMap;
    } catch (error) {
      console.error("❌ Error fetching classes:", error);
      return new Map();
    }
  };

  // Fetch attendance data
  const fetchAttendanceData = async (email: string, studentData: StudentData, classMap: Map<number, ClassDetails>) => {
    console.log(`🔍 Fetching attendance data for student: ${email}`);
    
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

          const isMatch = recordEmail === email.toLowerCase().trim();
          console.log(`🔍 Record email: ${recordEmail}, User email: ${email}, Match: ${isMatch}`);
          return isMatch;
        })
        .map((record) => {
          const classDetails = record.class_id ? classMap.get(record.class_id) : undefined;
          
          const mappedRecord = {
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
          
          console.log("📄 Mapped attendance record:", mappedRecord);
          return mappedRecord;
        });

      console.log("✅ Filtered attendance records:", filteredAttendance.length);
      return filteredAttendance;
    } catch (error) {
      console.error("❌ Error fetching attendance data:", error);
      throw error;
    }
  };

  // Main data fetching function
  const fetchAttendance = async () => {
    console.log("🔄 Starting attendance fetch process...");
    
    try {
      setLoading(true);
      setError("");

      const { email, role } = getUserData();
      
      if (!email) {
        console.warn("⚠️ No logged-in user found");
        setError("⚠️ No logged-in user found. Please log in again.");
        return;
      }

      setUserEmail(email);
      setUserRole(role);

      console.log("🎓 Fetching attendance for:", email);

      // Fetch student details
      const studentData = await fetchStudentDetails(email);
      if (!studentData) {
        console.warn("⚠️ No student data found for user");
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
        console.warn("⚠️ No attendance records found for student");
        setError("📝 No attendance records found for your account.");
      }

      setAttendanceData(attendanceRecords);
      console.log("✅ Attendance data updated with", attendanceRecords.length, "records");
    } catch (err) {
      console.error("❌ Error in fetchAttendance:", err);
      setError("Failed to fetch attendance data. Please try again later.");
    } finally {
      setLoading(false);
      console.log("🏁 Attendance fetch process completed");
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

  // Card component for attendance records
  const AttendanceCard = ({ record }: { record: AttendanceRecord }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-lg mb-1">
              {record.class_name}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              Section {record.section} • {record.date}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(record.status)}`}
          >
            {record.status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Marked By:</span>
            <span className="ml-2 text-gray-700">{record.marked_by_role || "—"}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-gray-500">Remarks:</span>
            <span className="ml-2 text-gray-700">{record.remarks || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* HEADER SECTION */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Back Button */}
              <div className="absolute top-4 left-4">
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              </div>
              
              <div className="flex items-center gap-3 ml-12 sm:ml-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl sm:text-2xl">
                  📅
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                    Attendance Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Welcome,{" "}
                    <span className="font-semibold text-blue-600">{userEmail}</span>
                    <span className="ml-1 sm:ml-2 px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                      {userRole}
                    </span>
                  </p>
                </div>
              </div>
              
              {studentInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600">Class & Section</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    {studentInfo.class_name || "Unknown"} - {studentInfo.section || "N/A"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* STATISTICS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-green-50 p-3 sm:p-4 border border-green-200 rounded-xl text-center shadow-sm">
              <p className="text-xl sm:text-2xl font-bold text-green-700">{presentCount}</p>
              <p className="text-xs sm:text-sm font-medium text-green-700">Present</p>
            </div>
            <div className="bg-red-50 p-3 sm:p-4 border border-red-200 rounded-xl text-center shadow-sm">
              <p className="text-xl sm:text-2xl font-bold text-red-700">{absentCount}</p>
              <p className="text-xs sm:text-sm font-medium text-red-700">Absent</p>
            </div>
            <div className="bg-yellow-50 p-3 sm:p-4 border border-yellow-200 rounded-xl text-center shadow-sm">
              <p className="text-xl sm:text-2xl font-bold text-yellow-700">{lateCount}</p>
              <p className="text-xs sm:text-sm font-medium text-yellow-700">Late</p>
            </div>
            <div className="bg-purple-50 p-3 sm:p-4 border border-purple-200 rounded-xl text-center shadow-sm">
              <p className="text-xl sm:text-2xl font-bold text-purple-700">
                {attendancePercentage}%
              </p>
              <p className="text-xs sm:text-sm font-medium text-purple-700">Percentage</p>
            </div>
          </div>

          {/* CALENDAR AND SELECTED DATE SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Calendar Section */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Select a date to view attendance
              </h3>
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Calendar Component */}
                <div className="flex justify-center">
                  <Calendar
                    onChange={(value) => {
                      if (value instanceof Date) {
                        setSelectedDate(value);
                      }
                    }}
                    value={selectedDate}
                    className="react-calendar rounded-2xl shadow-inner bg-white border border-gray-200 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[350px]"
                  />
                </div>
                
                {/* Selected Date Details */}
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">Selected Date</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
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
                          className="flex items-center justify-between bg-white rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm border border-gray-100"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">
                              {attendance.class_name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Section {attendance.section}
                            </p>
                          </div>
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusBadgeClass(attendance.status)}`}
                          >
                            {attendance.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3 sm:py-4">
                      <p className="text-gray-600 text-xs sm:text-sm">
                        No attendance record available for this date.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Attendance Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">Total Records</span>
                  <span className="font-bold text-gray-800">{totalCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">Present Rate</span>
                  <span className="font-bold text-green-600">{attendancePercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">Absent Rate</span>
                  <span className="font-bold text-red-600">
                    {totalCount > 0 ? ((absentCount / totalCount) * 100).toFixed(1) : "0"}%
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-500 text-center">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ATTENDANCE HISTORY CARDS */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Attendance History
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Your complete attendance record
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Showing {attendanceData.length} records
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 mt-2 text-sm sm:text-base">Loading attendance data...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-600 font-semibold mb-2 text-sm sm:text-base">{error}</div>
                  <button
                    onClick={fetchAttendance}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Try Again
                  </button>
                </div>
              ) : attendanceData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {attendanceData.map((record) => (
                    <AttendanceCard key={record.id} record={record} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No attendance records found.</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Your attendance records will appear here once they are marked.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles for Calendar with proper media queries */}
      <style jsx global>{`
        .react-calendar {
          border: none;
          background: transparent;
          width: 100%;
          font-family: inherit;
        }
        
        .react-calendar__tile {
          border-radius: 6px;
          padding: 0.5em;
          margin: 1px;
          transition: all 0.2s ease;
          font-size: 0.875rem;
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
          border-radius: 6px;
          min-width: 32px;
          background: none;
          font-size: 0.875rem;
          margin: 1px;
          padding: 0.5em;
        }
        
        .react-calendar__navigation button:hover {
          background-color: #f3f4f6;
        }
        
        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: 600;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .react-calendar__month-view__weekdays__weekday {
          padding: 0.5em;
        }
        
        /* Mobile First Approach */
        @media (max-width: 640px) {
          .react-calendar {
            font-size: 0.75rem;
          }
          
          .react-calendar__navigation button {
            font-size: 0.75rem;
            min-width: 28px;
            padding: 0.25em;
          }
          
          .react-calendar__tile {
            padding: 0.25em;
            font-size: 0.75rem;
          }
        }
        
        /* Tablet Styles */
        @media (min-width: 641px) and (max-width: 768px) {
          .react-calendar {
            font-size: 0.8rem;
          }
          
          .react-calendar__navigation button {
            font-size: 0.8rem;
            min-width: 36px;
          }
          
          .react-calendar__tile {
            padding: 0.4em;
            font-size: 0.8rem;
          }
        }
        
        /* Desktop Styles */
        @media (min-width: 769px) {
          .react-calendar {
            font-size: 0.9rem;
          }
          
          .react-calendar__navigation button {
            font-size: 0.9rem;
            min-width: 44px;
          }
          
          .react-calendar__tile {
            padding: 0.75em 0.5em;
            font-size: 0.9rem;
          }
        }
        
        /* Large Desktop */
        @media (min-width: 1024px) {
          .react-calendar {
            font-size: 1rem;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default AttendancePage;