"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Timetable {
  id: number;
  subject_name: string;
  teacher_name: string;
  class_name: string;
  section: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_number: string;
}

interface Attendance {
  id: number;
  date: string;
  status: string;
  remarks: string;
  student?: string;
  student_name: string;
  marked_by_role?: string;
  section?: string;
}

interface Student {
  email: string;
  name: string;
  fullname?: string;
  class_name: string;
  section: string;
}

const Student_TImetable = () => {
  const [userData, setUserData] = useState<Student | null>(null);
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredTimetable, setFilteredTimetable] = useState<Timetable[]>([]);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const STUDENT_API = "https://globaltechsoftwaresolutions.cloud/school-api/api/students/";
  const TIMETABLE_API = "https://globaltechsoftwaresolutions.cloud/school-api/api/timetable/";
  const ATTENDANCE_API = "https://globaltechsoftwaresolutions.cloud/school-api/api/attendance/";

  // ✅ Load student info from localStorage
  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        setLoading(true);
        const userInfo = localStorage.getItem("userInfo");
        const userData = localStorage.getItem("userData");
        
        if (!userInfo && !userData) {
          setError("No logged-in user found.");
          setLoading(false);
          return;
        }

        // Try to get email from multiple sources
        let email = "";
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          email = parsed.email;
        } else if (userData) {
          const parsed = JSON.parse(userData);
          email = parsed.email;
        }

        console.log("📧 Logged in student:", email);

        if (email) {
          const response = await axios.get(`${STUDENT_API}${email}/`);
          console.log("🎓 Student API Response:", response.data);
          setUserData(response.data);
        } else {
          setError("No email found in user data.");
        }
      } catch (err) {
        console.error("❌ Failed to fetch student info:", err);
        setError("Failed to fetch student info.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentInfo();
  }, []);

  // ✅ Load timetable
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!userData?.class_name || !userData?.section) return;

      try {
        const response = await axios.get(
          `${TIMETABLE_API}?class_name=${userData.class_name}&section=${userData.section}`
        );
        console.log("✅ Timetable API Response:", response.data);
        const timetableData = Array.isArray(response.data) ? response.data : [response.data];
        setTimetable(timetableData);
      } catch (err) {
        console.error("❌ Failed to load timetable:", err);
        setError("Failed to load timetable.");
      }
    };

    fetchTimetable();
  }, [userData]);

  // ✅ Load attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!userData?.email) return;

      try {
        console.log("📊 Fetching attendance for:", userData.email);
        
        // Fetch all attendance records and filter by student name and section
        const response = await axios.get(ATTENDANCE_API);
        const allRecords: Attendance[] = response.data || [];
        
        console.log("📋 Total attendance records:", allRecords.length);

        // Get student name for matching
        const studentName = userData.fullname || userData.name || "";
        const studentSection = userData.section || "";

        // Filter records for the current student by name and section
        const filteredRecords = allRecords.filter((record) => {
          if (!record) return false;
          
          // Match by student name (exact match)
          const nameMatch = record.student_name?.toLowerCase() === studentName.toLowerCase();
          
          // If we have section info, also filter by section
          if (studentSection && record.section) {
            const sectionMatch = record.section.toLowerCase() === studentSection.toLowerCase();
            return nameMatch && sectionMatch;
          }
          
          return nameMatch;
        });

        console.log("✅ Found", filteredRecords.length, "attendance records for student:", studentName);
        setAttendance(filteredRecords);
      } catch (err) {
        console.error("❌ Failed to load attendance:", err);
        setError("Failed to load attendance data.");
      }
    };

    fetchAttendance();
  }, [userData]);

  // ✅ When a date is clicked on calendar
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);

    // filter timetable by weekday
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const filtered = timetable.filter(
      (t) => t.day_of_week.toLowerCase() === dayName.toLowerCase()
    );
    setFilteredTimetable(filtered);

    // match attendance - use local date format to avoid timezone issues
    const dateStr = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format in local timezone
    const matchedAttendance = attendance.find((a) => a.date === dateStr);
    setSelectedAttendance(matchedAttendance || null);
    
    console.log("📅 Date clicked:", date.toLocaleDateString());
    console.log("🔍 Looking for attendance with date:", dateStr);
    console.log("📋 Found attendance:", matchedAttendance);
  };

  // ✅ Highlight attendance on calendar
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;
    const dateStr = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format in local timezone
    const att = attendance.find((a) => a.date === dateStr);
    if (att) {
      return (
        <div
          className={`w-3 h-3 rounded-full mx-auto mt-1 ${
            att.status.toLowerCase() === "present" ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
      );
    }
    return null;
  };

  // Calculate attendance stats
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status.toLowerCase() === "present").length;
  const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  const getSubjectColor = (subject: string) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-amber-500",
      "from-red-500 to-rose-500",
      "from-indigo-500 to-blue-500",
    ];
    const index = subject.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "present": return "✅";
      case "absent": return "❌";
      case "late": return "⏰";
      default: return "📝";
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading your dashboard...</div>
            <p className="text-gray-500 mt-2">Getting everything ready for you</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Time Table Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Track your classes, attendance, and academic schedule
            </p>
            {userData && (
              <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 inline-block">
                <p className="text-gray-700 font-medium">
                  {userData.name} • {userData.class_name} - {userData.section}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-center">
              <div className="text-red-600 font-semibold text-lg mb-2">⚠️ Error</div>
              <div className="text-red-500">{error}</div>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">🕒</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Weekly Classes</div>
                  <div className="text-2xl font-bold text-gray-900">{timetable.length}</div>
                  <div className="text-xs text-gray-500">
                    Across {new Set(timetable.map(t => t.day_of_week)).size} days
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">📚</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Subjects</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {new Set(timetable.map(t => t.subject_name)).size}
                  </div>
                  <div className="text-xs text-gray-500">
                    Unique subjects
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">📅 Academic Calendar</h2>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Select a date to view details
                  </div>
                </div>
                <Calendar
                  onClickDay={handleDateClick}
                  value={selectedDate}
                  tileContent={tileContent}
                  className="rounded-2xl border-0 w-full react-calendar-custom bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Timetable Section */}
             {/* Timetable Section */}
<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-xl font-bold text-gray-900">
      🕒 Daily Schedule - {selectedDate.toLocaleDateString("en-US", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      })}
    </h2>
    <div className="flex items-center gap-4">
      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
        {filteredTimetable.length} {filteredTimetable.length === 1 ? 'class' : 'classes'} today
      </span>
      {filteredTimetable.length > 0 && (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          {filteredTimetable.length} periods
        </span>
      )}
    </div>
  </div>
  
  {filteredTimetable.length > 0 ? (
    <div className="space-y-4">
      {/* Class Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">📚 Today's Class Summary</h3>
            <p className="text-blue-100 text-sm">
              You have {filteredTimetable.length} classes scheduled
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{filteredTimetable.length}</div>
            <div className="text-blue-100 text-sm">Total Classes</div>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-4">
        {filteredTimetable
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
          .map((item, index) => (
          <div 
            key={item.id} 
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${getSubjectColor(item.subject_name)} flex items-center justify-center text-white font-bold text-lg`}>
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.subject_name}
                      </h3>
                      <span className="px-2 py-1 bg-white text-xs font-medium rounded-full border border-blue-200">
                        Period {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">by {item.teacher_name}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="bg-white rounded-xl p-3 text-center min-w-24">
                  <div className="text-gray-500 text-xs">Start Time</div>
                  <div className="font-semibold text-gray-900">{item.start_time}</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center min-w-24">
                  <div className="text-gray-500 text-xs">End Time</div>
                  <div className="font-semibold text-gray-900">{item.end_time}</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center min-w-20">
                  <div className="text-gray-500 text-xs">Room</div>
                  <div className="font-semibold text-gray-900">{item.room_number}</div>
                </div>
              </div>
            </div>
            
            {/* Class Duration Info */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>🕐 Class Duration: {item.start_time} - {item.end_time}</span>
                <span>📍 {item.room_number}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <h3 className="font-bold text-gray-900 mb-3">📊 Daily Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded-xl p-3">
            <div className="text-2xl font-bold text-blue-600">{filteredTimetable.length}</div>
            <div className="text-xs text-gray-500">Total Classes</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(filteredTimetable.map(t => t.subject_name)).size}
            </div>
            <div className="text-xs text-gray-500">Subjects</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <div className="text-2xl font-bold text-green-600">
              {new Set(filteredTimetable.map(t => t.teacher_name)).size}
            </div>
            <div className="text-xs text-gray-500">Teachers</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(filteredTimetable.map(t => t.room_number)).size}
            </div>
            <div className="text-xs text-gray-500">Rooms</div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No classes scheduled</h3>
      <p className="text-gray-600 mb-4">Enjoy your free day! No classes are scheduled for {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}.</p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 inline-block">
        <p className="text-yellow-700 text-sm">💡 This could be a holiday or weekend</p>
      </div>
    </div>
  )}
</div>

            </div>

            {/* Right Column - Attendance & Quick Info */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* Attendance Status */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                <h2 className="text-xl font-bold text-gray-900 mb-6">🧾 Attendance Status</h2>
                
                {selectedAttendance ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">
                        {getStatusIcon(selectedAttendance.status)}
                      </div>
                      <div className={`text-2xl font-bold ${
                        selectedAttendance.status.toLowerCase() === "present" 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {selectedAttendance.status}
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {new Date(selectedAttendance.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    {selectedAttendance.remarks && (
                      <div className="bg-white rounded-xl p-4 mt-4 border border-gray-200">
                        <div className="text-sm text-gray-500 mb-1">Remarks</div>
                        <div className="text-gray-700 italic">"{selectedAttendance.remarks}"</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Record</h3>
                    <p className="text-gray-600 text-sm">
                      Select a date to view attendance details
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                <h2 className="text-xl font-bold text-gray-900 mb-6">📈 Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                    <span className="text-gray-700">Total Classes</span>
                    <span className="font-bold text-blue-600">{timetable.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                    <span className="text-gray-700">Present Days</span>
                    <span className="font-bold text-green-600">{presentDays}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                    <span className="text-gray-700">Subjects</span>
                    <span className="font-bold text-purple-600">
                      {new Set(timetable.map(t => t.subject_name)).size}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                    <span className="text-gray-700">Teachers</span>
                    <span className="font-bold text-orange-600">
                      {new Set(timetable.map(t => t.teacher_name)).size}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upcoming Classes */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                <h2 className="text-xl font-bold text-gray-900 mb-6">⏰ Today's Classes</h2>
                <div className="space-y-3">
                  {filteredTimetable.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{item.subject_name}</div>
                        <div className="text-xs text-gray-500">{item.start_time} - {item.end_time}</div>
                      </div>
                    </div>
                  ))}
                  {filteredTimetable.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No classes today
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Custom Calendar Styles */}
      <style jsx>{`
        .react-calendar-custom .react-calendar__tile--active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
          color: white !important;
        }
        .react-calendar-custom .react-calendar__tile--now {
          background: #fbbf24 !important;
          color: white !important;
        }
        .react-calendar-custom .react-calendar__navigation button {
          color: #4b5563;
          font-weight: 600;
        }
        .react-calendar-custom .react-calendar__tile {
          border-radius: 8px;
          margin: 2px;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Student_TImetable;