"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion, AnimatePresence } from "framer-motion";
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
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [hoveredClass, setHoveredClass] = useState<string | null>(null);

  const STUDENT_API = "https://globaltechsoftwaresolutions.cloud/school-api/api/students/";
  const CLASS_API = "https://globaltechsoftwaresolutions.cloud/school-api/api/classes/";
  const TIMETABLE_API = "https://globaltechsoftwaresolutions.cloud/school-api/api/timetable/";

  // Color palette for subjects
  const subjectColors = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-600",
    "from-teal-500 to-blue-600",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-600"
  ];

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

  // Calculate current week dates
  const calculateCurrentWeek = useCallback((date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
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
          (s: any) => s.email?.toLowerCase() === email.toLowerCase()
        );

        if (!matchedStudent) {
          throw new Error("Student profile not found in system");
        }
        setStudent(matchedStudent);

        // Fetch class information
        const classRes = await axios.get(CLASS_API);
        const matchedClass = classRes.data.find(
          (cls: any) => cls.id === matchedStudent.class_id
        );
        setClassInfo(matchedClass || null);

      } catch (err: any) {
        console.error("❌ Error loading student data:", err);
        setError(err.message || "Failed to load student information");
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
          (t: any) => t.class_id?.toString() === student.class_id?.toString()
        );
        
        // Sort by day and time
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const sortedTimetable = filtered.sort((a: any, b: any) => {
          const dayCompare = dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week);
          if (dayCompare !== 0) return dayCompare;
          return a.start_time.localeCompare(b.start_time);
        });

        // Add colors to subjects
        const subjects = [...new Set(sortedTimetable.map((t: Timetable) => t.subject_name))];
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

// Initialize current week
useEffect(() => {
  setCurrentWeek(calculateCurrentWeek(new Date()));
}, [calculateCurrentWeek]);

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

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-blue-200 text-lg font-light"
            >
              Loading your academic universe...
            </motion.p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-8xl mb-6"
            >
              🌌
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-4">Orbit Disconnected</h2>
            <p className="text-blue-200 mb-8">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Reconnect
            </motion.button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section with Glass Morphism */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-6">
              {classInfo && (
                <div className="space-y-2">
                  <p className="text-xl text-gray-700 font-medium">
                    {classInfo.class_name} • {classInfo.sec}  Section 
                  </p>
                  {classInfo.class_teacher_name && (
                    <p className="text-blue-600 font-semibold">
                      Class Teacher: {classInfo.class_teacher_name}
                    </p>
                  )}
                  {student?.roll_number && (
                    <p className="text-gray-500 text-sm">
                      Student ID: {student.roll_number}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Current Period Alert */}
            {currentPeriod && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl p-4 shadow-lg max-w-md mx-auto"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                  <span className="font-semibold">Live: {currentPeriod.subject_name}</span>
                  <span className="text-sm">({formatTime(currentPeriod.start_time)} - {formatTime(currentPeriod.end_time)})</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Navigation Tabs with Glass Effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 mb-8"
          >
            <div className="flex overflow-x-auto">
              {viewTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewMode(tab.id as ViewMode)}
                  className={`flex-1 min-w-0 px-6 py-4 font-semibold transition-all duration-300 ${
                    viewMode === tab.id
                      ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden text-lg">{tab.icon}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              {/* Calendar View */}
              {viewMode === "calendar" && (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Calendar */}
                  <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <span className="text-3xl">🌌</span>
                      Academic Calendar
                    </h2>
                    <Calendar
                      onClickDay={handleDateClick}
                      value={selectedDate}
                      className="rounded-2xl border-0 w-full react-calendar-advanced shadow-inner bg-white/50"
                    />
                  </div>

                  {/* Side Panel */}
                  <div className="space-y-6">
                    {/* Selected Date Details */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>

                      {/* Classes */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          🚀 Mission Schedule
                        </h4>
                        {filteredTimetable.length > 0 ? (
                          <div className="space-y-3">
                            {filteredTimetable.map((item: Timetable, index: number) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 shadow-sm"
                              >
                                <div className="font-bold text-blue-900 text-lg">
                                  {item.subject_name}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  ⏰ {formatTime(item.start_time)} - {formatTime(item.end_time)}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  👨‍🏫 {item.teacher_name} • 🚪 {item.room_number}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm text-center py-4">
                            No missions scheduled for this date
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* Visual Timetable View */}
              {viewMode === "timetable" && (
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                      <span className="text-3xl">🕐</span>
                      Visual Schedule Matrix
                    </h2>
                    <div className="text-sm text-gray-600 bg-white/50 px-4 py-2 rounded-full">
                      {timetable.length} scheduled missions
                    </div>
                  </div>

                  {Object.keys(timetableByDay).length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {Object.entries(timetableByDay).map(([day, classes]: [string, Timetable[]]) => (
                        <motion.div
                          key={day}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4">
                            <h3 className="font-bold text-lg text-center">{day}</h3>
                          </div>
                          <div className="p-4 space-y-3">
                            {classes.map((classItem: Timetable) => (
                              <motion.div
                                key={classItem.id}
                                whileHover={{ scale: 1.05 }}
                                onHoverStart={() => setHoveredClass(classItem.id.toString())}
                                onHoverEnd={() => setHoveredClass(null)}
                                className={`p-3 rounded-xl bg-gradient-to-r ${classItem.subject_color} text-white shadow-lg cursor-pointer transform transition-all duration-300 ${
                                  hoveredClass === classItem.id.toString() ? 'shadow-2xl' : 'shadow-md'
                                }`}
                              >
                                <div className="font-bold text-sm mb-1">
                                  {classItem.subject_name}
                                </div>
                                <div className="text-xs opacity-90">
                                  {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                                </div>
                                <div className="text-xs opacity-80 mt-1">
                                  {classItem.teacher_name} • {classItem.room_number}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-8xl mb-6"
                      >
                        🚀
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Mission Control Quiet</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Your class schedule is being prepared. Check back soon for your mission briefings.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        .react-calendar-advanced {
          background: transparent;
        }
        .react-calendar-advanced .react-calendar__tile--active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        .react-calendar-advanced .react-calendar__tile--now {
          background: linear-gradient(135deg, #fef3c7, #f59e0b);
          color: #1f2937;
          border-radius: 12px;
          font-weight: bold;
        }
        .react-calendar-advanced .react-calendar__navigation button {
          color: #4b5563;
          font-weight: 600;
        }
        .react-calendar-advanced .react-calendar__tile {
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .react-calendar-advanced .react-calendar__tile:hover {
          background: #e5e7eb;
          transform: scale(1.05);
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Student_Timetable;