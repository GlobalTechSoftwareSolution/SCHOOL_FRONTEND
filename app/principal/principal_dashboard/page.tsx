"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  FiUsers,
  FiBook,
  FiBarChart2,
  FiCalendar,
  FiBell,
  FiTrendingUp,
  FiAward,
  FiClock,
  FiMessageSquare,
  FiActivity,
  FiEye
} from "react-icons/fi";
import axios from "axios";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

const PrincipalDashboard = () => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    attendanceRate: 0,
    pendingApprovals: 0,
    upcomingEvents: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPresent, setShowPresent] = useState(false);
  const [showAbsent, setShowAbsent] = useState(false);


  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all required data
        const [teachersRes, studentsRes, classesRes, activitiesRes, attendanceRes] = await Promise.all([
          axios.get(`${API_BASE}/teachers/`),
          axios.get(`${API_BASE}/students/`),
          axios.get(`${API_BASE}/classes/`),
          axios.get(`${API_BASE}/activities/`),
          axios.get(`${API_BASE}/attendance/`),
        ]);

        // Calculate statistics
        const teachers = teachersRes.data || [];
        const students = studentsRes.data || [];
        const classes = classesRes.data || [];
        const activities = activitiesRes.data || [];
        const attendance = attendanceRes.data || [];


        // Calculate attendance rate
        const presentCount = attendance.filter((a: any) => a.status === "Present").length;
        const totalCount = attendance.length;
        const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

        // Get unique classes from classes API
        const uniqueClasses = [...new Set(classes.map((c: any) => c.class_name))].filter(Boolean);


        // Get upcoming events (next 7 days)
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = activities
          .filter((activity: any) => {
            if (!activity.date) return false;
            const activityDate = new Date(activity.date);
            return activityDate >= today && activityDate <= nextWeek;
          })
          .slice(0, 5);

        // Get recent activities (last 5)
        const recent = activities.slice(0, 5);

        // Enrich attendance with display name, role, class & section (for students) or department (for teachers)
        const enrichedAttendance = attendance.map((record: any) => {

          const email = String(record.user_email || record.student_email || "").toLowerCase();
          const roleRaw = record.role || "";
          const role = String(roleRaw).toLowerCase();

          let displayName = record.student_name || record.user_name || record.user_email;
          let className = record.class_name || "";
          let section = record.sec || record.section || "";
          let department = record.department || "";

          if (role === "student") {
            const student = students.find(
              (s: any) => String(s.email || "").toLowerCase() === email
            );
            if (student) {
              displayName = student.fullname || displayName;

              // Prefer explicit student class/section if present
              className = student.class_name || className;
              section = student.section || section;

              // If class info still missing, resolve via classes API using class_id
              if (!className || !section) {
                const cls = classes.find((c: any) => c.id === student.class_id);
                if (cls) {
                  className = cls.class_name || className;
                  section = cls.sec || section;
                }
              }
            }
          }

          if (role === "teacher") {
            const teacher = teachers.find(
              (t: any) => String(t.email || "").toLowerCase() === email
            );
            if (teacher) {
              displayName = teacher.fullname || displayName;
              department = teacher.department_name || department;
            }
          }

          return {
            ...record,
            role,
            display_name: displayName,
            class_name: className,
            section,
            department,
          };
        });


        setStats({
          totalTeachers: teachers.length,
          totalStudents: students.length,
          totalClasses: uniqueClasses.length,
          attendanceRate,
          pendingApprovals: 3, // Mock data
          upcomingEvents: upcoming.length
        });

        setRecentActivities(recent);
        setUpcomingEvents(upcoming);
        // Store enriched attendance; Present/Absent tables will filter for today
        setAttendanceData(enrichedAttendance);


      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats Cards Data
  const statCards = [
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      icon: <FiUsers className="w-6 h-6" />,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: <FiBook className="w-6 h-6" />,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Classes",
      value: stats.totalClasses,
      icon: <FiBarChart2 className="w-6 h-6" />,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents,
      icon: <FiCalendar className="w-6 h-6" />,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600"
    }
  ];

  // Quick Actions
  const quickActions = [
    {
      title: "View Teachers",
      description: "Manage teaching staff",
      icon: <FiUsers className="w-8 h-8" />,
      path: "/principal/principal_teachers",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Student Reports",
      description: "Check student performance",
      icon: <FiBook className="w-8 h-8" />,
      path: "/principal/principal_students",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Monthly Reports",
      description: "Generate monthly reports",
      icon: <FiBarChart2 className="w-8 h-8" />,
      path: "/principal/principal_monthly_report",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "School Activities",
      description: "Manage events & activities",
      icon: <FiActivity className="w-8 h-8" />,
      path: "/principal/principal_activities",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  if (loading) {
    return (
      <DashboardLayout role="principal">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="principal">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome Back, Principal!
            </h1>
            <p className="text-gray-600 text-lg">
              Here's what's happening at your school today.
            </p>
            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <FiClock className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.textColor}`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${stat.color} transition-all duration-500`}
                      style={{ width: `${typeof stat.value === 'number' ? Math.min(100, (stat.value / 100) * 100) : 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Quick Actions & Recent Activities */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiAward className="w-5 h-5 text-blue-500" />
                    Quick Actions
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Frequently accessed features</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <a
                        key={index}
                        href={action.path}
                        className={`${action.color} text-white p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            {action.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-white/90">
                              {action.title}
                            </h3>
                            <p className="text-white/80 text-sm mt-1">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-green-500" />
                    Recent Activities
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Latest school events and updates</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <FiCalendar className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                              {activity.name}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-1">
                              {activity.description || "No description provided"}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <FiClock className="w-3 h-3" />
                                {activity.date ? new Date(activity.date).toLocaleDateString() : "No date"}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${activity.type === 'Cultural' ? 'bg-purple-100 text-purple-800' :
                                  activity.type === 'Sports' ? 'bg-green-100 text-green-800' :
                                    activity.type === 'Academic' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                }`}>
                                {activity.type || 'General'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-gray-500">No recent activities found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Upcoming Events & Notifications */}
            <div className="space-y-8">
              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-orange-500" />
                    Upcoming Events
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Events in the next 7 days</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800 group-hover:text-orange-600">
                                {event.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {event.date ? new Date(event.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                }) : 'No date'}
                              </p>
                            </div>
                            <div className={`p-2 rounded-lg ${event.type === 'Cultural' ? 'bg-purple-100 text-purple-600' :
                                event.type === 'Sports' ? 'bg-green-100 text-green-600' :
                                  event.type === 'Academic' ? 'bg-blue-100 text-blue-600' :
                                    'bg-gray-100 text-gray-600'
                              }`}>
                              {event.type?.charAt(0) || 'G'}
                            </div>
                          </div>
                          {event.class_name && (
                            <div className="mt-2 text-xs text-gray-500">
                              Class: {event.class_name} {event.section ? `- ${event.section}` : ''}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📅</div>
                        <p className="text-gray-500">No upcoming events.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Recent Attendance */}

          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
              <FiTrendingUp className="w-5 h-5 text-green-500" />
              Recent Attendance
            </h2>
            <p className="text-gray-600 text-sm mb-4">Today's attendance records</p>

            {attendanceData.length > 0 ? (
              <>
                {/* Filter today */}
                {(() => {
                  const today = new Date();
                  const todayRecords = attendanceData.filter((record) => {
                    const recordDate = new Date(record.date);
                    return (
                      recordDate.getFullYear() === today.getFullYear() &&
                      recordDate.getMonth() === today.getMonth() &&
                      recordDate.getDate() === today.getDate()
                    );
                  });
                  return todayRecords.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Present */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-green-800">Present</h3>
                          <button
                            onClick={() => setShowPresent(!showPresent)}
                            className="px-2 py-1 bg-green-500 text-white rounded-lg text-sm"
                          >
                            {showPresent ? "Hide" : "View"}
                          </button>
                        </div>
                        {showPresent && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-2 text-sm text-gray-500">Name</th>
                                  <th className="text-left py-2 text-sm text-gray-500">Role</th>
                                  <th className="text-left py-2 text-sm text-gray-500">Check-in Time</th>
                                  <th className="text-left py-2 text-sm text-gray-500">Class</th>
                                  <th className="text-left py-2 text-sm text-gray-500">Section</th>
                                </tr>
                              </thead>
                              <tbody>
                                {todayRecords
                                  .filter((r) => r.status === "Present")
                                  .map((record, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                      <td className="py-2 text-sm text-gray-700">
                                        <div className="flex flex-col">
                                          <span className="font-medium text-gray-800 max-w-[180px] truncate">
                                            {record.display_name || record.student_name || record.user_name}
                                          </span>
                                          {record.user_email && (
                                            <span
                                              className="text-xs text-gray-500 max-w-[180px] truncate"
                                              title={record.user_email}
                                            >
                                              {record.user_email}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-2 text-sm text-gray-600 capitalize font-bold">
                                        {record.role || "-"}
                                      </td>
                                      <td className="py-2 text-sm text-gray-600">{record.check_in || "-"}</td>
                                      <td className="py-2 text-sm text-gray-600">{record.class_name || "-"}</td>
                                      <td className="py-2 text-sm text-gray-600">{record.sec || record.sec || "-"}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Absent */}
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-red-800">Absent</h3>
                          <button
                            onClick={() => setShowAbsent(!showAbsent)}
                            className="px-2 py-1 bg-red-500 text-white rounded-lg text-sm"
                          >
                            {showAbsent ? "Hide" : "View"}
                          </button>
                        </div>
                        {showAbsent && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-2 text-sm text-gray-500">Name</th>
                                  <th className="text-left py-2 text-sm text-gray-500">Role</th>
                                  <th className="text-left py-2 text-sm text-gray-500">Date</th>
                                  <th className="text-left py-2 text-sm text-gray-500">Class</th>
                                  <th className="text-left py-2 text-sm text-gray-500">Section</th>
                                </tr>
                              </thead>
                              <tbody>
                                {todayRecords
                                  .filter((r) => r.status === "Absent")
                                  .map((record, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                      <td className="py-2 text-sm text-gray-700">
                                        <div className="flex flex-col">
                                          <span className="font-medium text-gray-800 max-w-[100px] truncate">
                                            {record.display_name || record.student_name || record.user_name}
                                          </span>
                                          {record.user_email && (
                                            <span
                                              className="text-xs text-gray-500 max-w-[100px] truncate"
                                              title={record.user_email}
                                            >
                                              {record.user_email}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-2 text-sm text-gray-600 capitalize font-bold">
                                        {record.role || "-"}
                                      </td>
                                      <td className="py-2 text-sm text-gray-600">{record.date}</td>
                                      <td className="py-2 text-sm text-gray-600">{record.class_name || "-"}</td>
                                      <td className="py-2 text-sm text-gray-600">{record.section || record.sec || "-"}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No attendance records for today.</p>
                  );
                })()}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-500">No attendance records available.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default PrincipalDashboard;