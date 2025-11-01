"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Attendance {
  id: number;
  student_name: string;
  date: string;
  status: string;
  remarks: string;
  marked_by_role: string;
  created_at: string;
  student: string;
}

interface TimetableEntry {
  day: string;
  subjects: { time: string; subject: string; teacher: string }[];
}

const StudentAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [filteredTimetable, setFilteredTimetable] = useState<TimetableEntry | null>(null);
  const [loggedUserEmail, setLoggedUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/attendance/";

  // ✅ Fetch logged-in user email from localStorage.userInfo
  useEffect(() => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        setLoggedUserEmail(parsed.email);
      } else {
        console.warn("No userInfo found in localStorage");
      }
    } catch (error) {
      console.error("Error reading userInfo from localStorage:", error);
    }
  }, []);

  // ✅ Fetch attendance data for that email
  useEffect(() => {
    if (!loggedUserEmail) return;
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        const allData: Attendance[] = response.data;

        // Filter attendance for logged-in student email
        const filtered = allData.filter((att) => att.student === loggedUserEmail);
        setAttendanceData(filtered);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [loggedUserEmail]);

  // ✅ Static timetable data (weekly)
  useEffect(() => {
    const timetable: TimetableEntry[] = [
      {
        day: "Monday",
        subjects: [
          { time: "9:00 - 10:00", subject: "Mathematics", teacher: "Mr. Sharma" },
          { time: "10:00 - 11:00", subject: "Science", teacher: "Ms. Priya" },
          { time: "11:30 - 12:30", subject: "English", teacher: "Mr. Raj" },
          { time: "1:30 - 2:30", subject: "Computer Science", teacher: "Mr. Deepak" },
        ],
      },
      {
        day: "Tuesday",
        subjects: [
          { time: "9:00 - 10:00", subject: "Social Studies", teacher: "Mr. Amit" },
          { time: "10:00 - 11:00", subject: "Mathematics", teacher: "Mr. Sharma" },
          { time: "11:30 - 12:30", subject: "Hindi", teacher: "Ms. Ritu" },
          { time: "1:30 - 2:30", subject: "Physical Education", teacher: "Coach Singh" },
        ],
      },
      {
        day: "Wednesday",
        subjects: [
          { time: "9:00 - 10:00", subject: "Computer Science", teacher: "Mr. Deepak" },
          { time: "10:00 - 11:00", subject: "Science Lab", teacher: "Ms. Priya" },
          { time: "11:30 - 12:30", subject: "Mathematics", teacher: "Mr. Sharma" },
          { time: "1:30 - 2:30", subject: "Art & Craft", teacher: "Ms. Anjali" },
        ],
      },
      {
        day: "Thursday",
        subjects: [
          { time: "9:00 - 10:00", subject: "Mathematics", teacher: "Mr. Sharma" },
          { time: "10:00 - 11:00", subject: "Social Studies", teacher: "Mr. Amit" },
          { time: "11:30 - 12:30", subject: "English Literature", teacher: "Mr. Raj" },
          { time: "1:30 - 2:30", subject: "Music", teacher: "Ms. Meera" },
        ],
      },
      {
        day: "Friday",
        subjects: [
          { time: "9:00 - 10:00", subject: "English", teacher: "Mr. Raj" },
          { time: "10:00 - 11:00", subject: "Science", teacher: "Ms. Priya" },
          { time: "11:30 - 12:30", subject: "Mathematics", teacher: "Mr. Sharma" },
          { time: "1:30 - 2:30", subject: "General Knowledge", teacher: "Mr. Amit" },
        ],
      },
    ];
    setTimetableData(timetable);
    
    // Set initial timetable for current day
    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const dayTimetable = timetable.find((entry) => entry.day === dayName);
    setFilteredTimetable(dayTimetable || null);
  }, []);

  // ✅ When date is clicked on calendar, show timetable for that weekday
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const dayTimetable = timetableData.find((entry) => entry.day === dayName);
    setFilteredTimetable(dayTimetable || null);
  };

  // ✅ Calculate attendance summary
  const presentCount = attendanceData.filter((att) => att.status === "Present").length;
  const absentCount = attendanceData.filter((att) => att.status === "Absent").length;
  const totalCount = attendanceData.length;
  const attendancePercentage =
    totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

  // Custom calendar tile content to show attendance status
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const dateStr = date.toISOString().split('T')[0];
    const attendance = attendanceData.find(att => att.date === dateStr);
    
    if (attendance) {
      return (
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          attendance.status === "Present" ? "bg-green-500" : "bg-red-500"
        }`}></div>
      );
    }
    return null;
  };

  // Get subject color
  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      "Mathematics": "from-blue-500 to-blue-600",
      "Science": "from-green-500 to-green-600",
      "English": "from-purple-500 to-purple-600",
      "Computer Science": "from-orange-500 to-orange-600",
      "Social Studies": "from-amber-500 to-amber-600",
      "Hindi": "from-red-500 to-red-600",
      "Science Lab": "from-emerald-500 to-emerald-600",
      "Physical Education": "from-lime-500 to-lime-600",
      "Art & Craft": "from-pink-500 to-pink-600",
      "English Literature": "from-violet-500 to-violet-600",
      "Music": "from-rose-500 to-rose-600",
      "General Knowledge": "from-cyan-500 to-cyan-600"
    };
    return colors[subject] || "from-gray-500 to-gray-600";
  };

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your attendance data...</p>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-blue-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">📊</span>
                </div>
                Attendance & Timetable
              </h1>
              {loggedUserEmail && (
                <p className="text-gray-600 mt-2">
                  Welcome, <span className="font-semibold text-blue-600">{loggedUserEmail}</span>
                </p>
              )}
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
              <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                <div className="text-sm text-green-800 font-medium">Present</div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-rose-100 rounded-xl p-4 border border-red-200 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                <div className="text-sm text-red-800 font-medium">Absent</div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-100 rounded-xl p-4 border border-blue-200 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                <div className="text-sm text-blue-800 font-medium">Total</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-100 rounded-xl p-4 border border-purple-200 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-purple-600">{attendancePercentage}%</div>
                <div className="text-sm text-purple-800 font-medium">Percentage</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 border border-blue-100">
          <div className="flex space-x-2">
            {["overview", "calendar", "timetable", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "overview" && "📈 Overview"}
                {tab === "calendar" && "📅 Calendar"}
                {tab === "timetable" && "🕒 Timetable"}
                {tab === "history" && "📋 History"}
              </button>
            ))}
          </div>
        </div>

        {!loggedUserEmail ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h3>
            <p className="text-gray-600">Please log in to view your attendance records.</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">📅</span>
                    </div>
                    Attendance Calendar
                  </h2>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                    <Calendar
                      onClickDay={handleDateClick}
                      value={selectedDate}
                      tileContent={tileContent}
                      className="border-0 w-full custom-calendar"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600">Absent</span>
                    </div>
                  </div>
                </div>

                {/* Today's Timetable */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🕒</span>
                    </div>
                    Today's Schedule
                  </h2>
                  {filteredTimetable ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold">
                          {filteredTimetable.day}
                        </div>
                        <span className="text-gray-600">{selectedDate?.toLocaleDateString()}</span>
                      </div>
                      {filteredTimetable.subjects.map((subj, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border bg-gradient-to-r ${getSubjectColor(subj.subject)} text-white shadow-lg transform hover:scale-105 transition-all duration-200`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">{subj.subject}</h3>
                              <p className="text-white/90 text-sm">{subj.teacher}</p>
                            </div>
                            <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
                              {subj.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📚</span>
                      </div>
                      <p className="text-gray-600">No classes scheduled for today.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === "calendar" && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Monthly Attendance Calendar</h2>
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                    <Calendar
                      onClickDay={handleDateClick}
                      value={selectedDate}
                      tileContent={tileContent}
                      className="border-0 w-full custom-calendar text-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Timetable Tab */}
            {activeTab === "timetable" && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Weekly Timetable</h2>
                <div className="grid gap-6">
                  {timetableData.map((daySchedule, index) => (
                    <div key={daySchedule.day} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        {daySchedule.day}
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {daySchedule.subjects.map((subject, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border bg-gradient-to-r ${getSubjectColor(subject.subject)} text-white shadow-lg transform hover:scale-105 transition-all duration-200`}
                          >
                            <div className="space-y-2">
                              <h4 className="font-bold text-lg">{subject.subject}</h4>
                              <p className="text-white/90 text-sm">{subject.teacher}</p>
                              <div className="bg-white/20 px-2 py-1 rounded-lg text-sm font-medium backdrop-blur-sm text-center">
                                {subject.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Attendance History</h2>
                {attendanceData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Marked By</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {attendanceData.map((attendance) => (
                          <tr key={attendance.id} className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                  <span className="text-blue-600 font-bold">📅</span>
                                </div>
                                <span className="font-medium text-gray-900">{attendance.date}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                attendance.status === "Present"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}>
                                {attendance.status === "Present" ? "✅ Present" : "❌ Absent"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {attendance.marked_by_role}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {attendance.remarks || (
                                <span className="text-gray-400 italic">No remarks</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">📊</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Attendance Records</h3>
                    <p className="text-gray-600">Your attendance records will appear here once marked.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .custom-calendar .react-calendar__tile--active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
          color: white !important;
          border-radius: 12px;
        }
        .custom-calendar .react-calendar__tile:enabled:hover,
        .custom-calendar .react-calendar__tile:enabled:focus {
          background: #e0e7ff !important;
          border-radius: 12px;
        }
        .custom-calendar .react-calendar__navigation button:enabled:hover,
        .custom-calendar .react-calendar__navigation button:enabled:focus {
          background: #e0e7ff !important;
          border-radius: 12px;
        }
      `}</style>
    </div>
    </DashboardLayout>
  );
};

export default StudentAttendancePage;