"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
// Removed framer-motion import as animations are simplified
import DashboardLayout from "@/app/components/DashboardLayout";

const STUDENT_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/students/`;
const CLASS_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/`;
const TIMETABLE_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/timetable/`;

// Color palette for subjects - simplified to single colors
const subjectColors = [
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-red-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-indigo-100",
  "bg-gray-100"
];

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
  class_id?: number;
  subject_code?: string;
  subject_color?: string;
}

interface Student {
  id: number;
  email: string;
  fullname?: string;
  class_id?: number;
  roll_number?: string;
  section?: string;
  profile_picture?: string;
}

interface ClassInfo {
  id: number;
  class_name: string;
  sec: string;
  class_teacher_name?: string;
  class_teacher_email?: string;
}

type ViewMode = "calendar" | "timetable";

const Student_Timetable = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [filteredTimetable, setFilteredTimetable] = useState<Timetable[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  // Get user info from localStorage safely
  const getLocalUserInfo = useCallback(() => {
    try {
      const localInfo = localStorage.getItem("userInfo") || localStorage.getItem("userData");
      return localInfo ? JSON.parse(localInfo) : null;
    } catch (error) {
      console.error("Error parsing user info:", error);
      return null;
    }
  }, []);



  // Fetch student and class information
  useEffect(() => {
    const fetchStudentAndClass = async () => {
      try {
        setLoading(true);
        setError(null);

        const userInfo = getLocalUserInfo();
        if (!userInfo) {
          throw new Error("Please log in to access your timetable");
        }

        const email = userInfo.email;
        console.log("📧 Fetching data for student:", email);

        // Fetch student data
        const studentRes = await axios.get(STUDENT_API);
        const allStudents = studentRes.data || [];
        const matchedStudent = allStudents.find(
          (s: Student) => s.email?.toLowerCase() === email.toLowerCase()
        );

        if (!matchedStudent) {
          throw new Error("Student profile not found in system");
        }
        setStudent(matchedStudent);

        // Fetch class information
        const classRes = await axios.get(CLASS_API);
        const matchedClass = classRes.data.find(
          (cls: ClassInfo) => cls.id === matchedStudent.class_id
        );
        setClassInfo(matchedClass || null);

      } catch (err: unknown) {
        console.error("❌ Error loading student data:", err);
        setError(err instanceof Error ? err.message : "Failed to load student information");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndClass();
  }, [getLocalUserInfo]);

  // Fetch timetable data
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!student?.class_id) return;

      try {
        const res = await axios.get(TIMETABLE_API);
        const data = res.data || [];
        const filtered = data.filter(
          (t: Timetable) => t.class_id?.toString() === student.class_id?.toString()
        );

        // Sort by day and time
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const sortedTimetable = filtered.sort((a: Timetable, b: Timetable) => {
          const dayCompare = dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week);
          if (dayCompare !== 0) return dayCompare;
          return a.start_time.localeCompare(b.start_time);
        });

        // Add colors to subjects
        const timetableWithColors = sortedTimetable.map((item: Timetable, index: number) => ({
          ...item,
          subject_color: subjectColors[index % subjectColors.length]
        }));

        setTimetable(timetableWithColors);
        console.log("🕒 Loaded timetable with", timetableWithColors.length, "entries");
      } catch (err) {
        console.error("❌ Failed to fetch timetable:", err);
        setError("Unable to load timetable data");
      }
    };

    fetchTimetable();
  }, [student]);



  // ✅ Handle date selection (timezone-safe)
  const handleDateClick = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

      // Filter timetable for selected day
      const filtered = timetable.filter(
        (t) => t.day_of_week.toLowerCase() === dayName.toLowerCase()
      );
      setFilteredTimetable(filtered);
    },
    [timetable]
  );

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Group timetable by day
  const timetableByDay = timetable.reduce((acc, item) => {
    if (!acc[item.day_of_week]) {
      acc[item.day_of_week] = [];
    }
    acc[item.day_of_week].push(item);
    return acc;
  }, {} as Record<string, Timetable[]>);

  // Get current period
  const getCurrentPeriod = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });

    return timetable.find(item => {
      if (item.day_of_week !== today) return false;

      const [startHours, startMinutes] = item.start_time.split(':').map(Number);
      const [endHours, endMinutes] = item.end_time.split(':').map(Number);
      const startTime = startHours * 60 + startMinutes;
      const endTime = endHours * 60 + endMinutes;

      return currentTime >= startTime && currentTime <= endTime;
    });
  };

  const currentPeriod = getCurrentPeriod();
  const viewTabs: Array<{ id: ViewMode; label: string; icon: string }> = [
    { id: "calendar", label: "🌌 Calendar", icon: "📅" },
    { id: "timetable", label: "🕐 Visual Schedule", icon: "🕒" },
  ];

  // Card Components for Responsive Design
  const ClassCard = ({ classItem }: { classItem: Timetable; index: number }) => (
    <div
      key={classItem.id}
      className={`p-4 ${classItem.subject_color} rounded-lg border border-gray-200`}
    >
      <div className="font-bold text-base mb-2">
        {classItem.subject_name}
      </div>
      <div className="text-sm mb-1">
        ⏰ {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
      </div>
      <div className="text-xs text-gray-600">
        👨‍🏫 {classItem.teacher_name} • 🚪 {classItem.room_number}
      </div>
    </div>
  );

  const DayScheduleCard = ({ day, classes }: { day: string; classes: Timetable[] }) => (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="bg-blue-500 text-white px-4 py-3">
        <h3 className="font-bold text-base text-center">{day}</h3>
      </div>
      <div className="p-3 space-y-3">
        {classes.map((classItem: Timetable, index: number) => (
          <ClassCard key={classItem.id} classItem={classItem} index={index} />
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-3 sm:mb-4" style={{ animation: 'spin 1s linear infinite' }}></div>
            <p className="text-gray-600 text-sm sm:text-lg">
              Loading your timetable...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">Error Loading Timetable</h2>
            <p className="text-gray-600 mb-6 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">

          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
              {classInfo && (
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 font-medium">
                    {classInfo.class_name} • {classInfo.sec} Section
                  </p>
                  {classInfo.class_teacher_name && (
                    <p className="text-blue-600 font-semibold text-sm sm:text-base">
                      Class Teacher: {classInfo.class_teacher_name}
                    </p>
                  )}
                  {student?.roll_number && (
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Student ID: {student.roll_number}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Current Period Alert */}
            {currentPeriod && (
              <div className="bg-green-500 text-white rounded-lg p-3 sm:p-4 shadow max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  <span className="font-semibold text-sm sm:text-base">Live: {currentPeriod.subject_name}</span>
                  <span className="text-xs sm:text-sm">({formatTime(currentPeriod.start_time)} - {formatTime(currentPeriod.end_time)})</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow border border-gray-200 mb-6 sm:mb-8">
            <div className="flex overflow-x-auto scrollbar-hide">
              {viewTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as ViewMode)}
                  className={`flex-1 min-w-0 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm ${viewMode === tab.id
                    ? 'text-white bg-blue-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-base">{tab.icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            {/* Calendar View */}
            {viewMode === "calendar" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl">📅</span>
                    Academic Calendar
                  </h2>
                  <div className="flex justify-center">
                    <Calendar
                      onClickDay={handleDateClick}
                      value={selectedDate}
                      className="rounded-lg border-0 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-full react-calendar-advanced shadow-inner bg-white"
                    />
                  </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Selected Date Details */}
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>

                    {/* Classes */}
                    <div className="mb-3 sm:mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                        📚 Schedule
                      </h4>
                      {filteredTimetable.length > 0 ? (
                        <div className="space-y-2 sm:space-y-3">
                          {filteredTimetable.map((item: Timetable, index: number) => (
                            <ClassCard key={item.id} classItem={item} index={index} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs sm:text-sm text-center py-3 sm:py-4">
                          No classes scheduled for this date
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Timetable View */}
            {viewMode === "timetable" && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl">🕐</span>
                    Weekly Schedule
                  </h2>
                  <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                    {timetable.length} classes scheduled
                  </div>
                </div>

                {Object.keys(timetableByDay).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {Object.entries(timetableByDay).map(([day, classes]: [string, Timetable[]]) => (
                      <DayScheduleCard key={day} day={day} classes={classes} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 lg:py-16">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">No Schedule Available</h3>
                    <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
                      Your class schedule is being prepared. Check back soon.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .react-calendar-advanced {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }
        .react-calendar-advanced .react-calendar__tile--active {
          background: #3b82f6;
          color: white;
          border-radius: 0.25rem;
        }
        .react-calendar-advanced .react-calendar__tile--now {
          background: #f59e0b;
          color: #1f2937;
          border-radius: 0.25rem;
          font-weight: bold;
        }
        .react-calendar-advanced .react-calendar__navigation button {
          color: #4b5563;
          font-weight: 600;
        }
        .react-calendar-advanced .react-calendar__tile {
          border-radius: 0.25rem;
          padding: 0.5em;
          font-size: 0.875rem;
        }
        .react-calendar-advanced .react-calendar__tile:hover {
          background: #e5e7eb;
        }

        /* Mobile First Responsive Calendar */
        @media (max-width: 640px) {
          .react-calendar-advanced {
            font-size: 0.75rem;
          }
          .react-calendar-advanced .react-calendar__navigation button {
            font-size: 0.75rem;
            min-width: 28px;
            padding: 0.25em;
          }
          .react-calendar-advanced .react-calendar__tile {
            padding: 0.25em;
            font-size: 0.75rem;
          }
        }

        /* Tablet Styles */
        @media (min-width: 641px) and (max-width: 768px) {
          .react-calendar-advanced {
            font-size: 0.8rem;
          }
          .react-calendar-advanced .react-calendar__navigation button {
            font-size: 0.8rem;
            min-width: 36px;
          }
          .react-calendar-advanced .react-calendar__tile {
            padding: 0.4em;
            font-size: 0.8rem;
          }
        }

        /* Desktop Styles */
        @media (min-width: 769px) {
          .react-calendar-advanced {
            font-size: 0.9rem;
          }
          .react-calendar-advanced .react-calendar__navigation button {
            font-size: 0.9rem;
            min-width: 44px;
          }
          .react-calendar-advanced .react-calendar__tile {
            padding: 0.75em 0.5em;
            font-size: 0.9rem;
          }
        }

        /* Hide scrollbar for tabs */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Student_Timetable;