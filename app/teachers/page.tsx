"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  BookOpen,
  Users,
  Clock,
  BarChart3,
  UserCheck,
  FileText,
  Plus,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Bell,
  Download,
  Eye
} from "lucide-react";

type ClassInfo = {
  class_name: string;
  section: string;
};

const API_BASE = "https://school.globaltechsoftwaresolutions.cloud/api/";

const TeachersDashboard = () => {
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string>("");
  const [todayTimetable, setTodayTimetable] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [avgGrades, setAvgGrades] = useState<number>(0);
  const [recentLeaves, setRecentLeaves] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [studentStats, setStudentStats] = useState({ total: 0, present: 0 });
  const [loading, setLoading] = useState(true);
  const [activeStats, setActiveStats] = useState(0);

  // ✅ Get teacher info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      setTeacherEmail(user.email);
      setTeacherName(user.name || "Teacher");
    }
  }, []);

  // ✅ Stats animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStats((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Fetch all dashboard data
  useEffect(() => {
    if (!teacherEmail) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        
        // Fetch all dashboard data with proper error handling
        const [timetableRes, gradesRes, leavesRes, attendanceRes, studentsRes] = await Promise.all([
          axios.get(`${API_BASE}timetable/`).catch(err => {
            console.warn("Timetable API failed:", err.message);
            return { data: [] };
          }),
          axios.get(`${API_BASE}grades/`).catch(err => {
            console.warn("Grades API failed:", err.message);
            return { data: [] };
          }),
          axios.get(`${API_BASE}leaves/`).catch(err => {
            console.warn("Leaves API failed:", err.message);
            return { data: [] };
          }),
          axios.get(`${API_BASE}attendance/`).catch(err => {
            console.warn("Attendance API failed:", err.message);
            return { data: [] };
          }),
          axios.get(`${API_BASE}students/`).catch(err => {
            console.warn("Students API failed:", err.message);
            return { data: [] };
          })
        ]);


        // Filter teacher's timetable by email
        const timetable = timetableRes.data.filter(
          (t: any) => t.teacher === teacherEmail
        );

        

        // Get today's weekday name
        const today = new Date().toLocaleString("en-US", { weekday: "long" });
        const todaySchedule = timetable.filter(
          (t: any) => t.day_of_week === today
        );

        // Get upcoming classes (next 2 days)
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayIndex = new Date().getDay();
        const upcomingDays = [days[(todayIndex + 1) % 7], days[(todayIndex + 2) % 7]];
        const upcomingSchedule = timetable.filter((t: any) => 
          upcomingDays.includes(t.day_of_week)
        ).slice(0, 3);

        // Create a unique class list
        const uniqueClasses = timetable.reduce((acc: any[], curr: any) => {
          if (
            !acc.find(
              (a) =>
                a.class_name === curr.class_name && a.section === curr.section
            )
          ) {
            acc.push({ 
              class_name: curr.class_name, 
              section: curr.section,
              subject: curr.subject_name,
              start_time: curr.start_time,
              room_number: curr.room_number
            });
          }
          return acc;
        }, []);


        // Compute average grades for teacher
        const teacherGrades = gradesRes.data.filter(
          (g: any) => g.teacher === teacherEmail
        );
        const avg =
          teacherGrades.length > 0
            ? teacherGrades.reduce((a: number, b: any) => a + b.percentage, 0) /
              teacherGrades.length
            : 0;

        // Get recent approved leaves
        const recent = leavesRes.data
          .filter((l: any) => l.status === "Approved")
          .slice(0, 4);

        // Calculate student stats
        const teacherAttendance = attendanceRes.data.filter(
          (a: any) => a.marked_by_email === teacherEmail
        );
        const present = teacherAttendance.filter((a: any) => a.status === "Present").length;
        
        // Get total students from teacher's classes
        const teacherStudents = studentsRes.data.filter(
  (s: { class_name: string; section: string }) =>
    uniqueClasses.some(
      (c: ClassInfo) => c.class_name === s.class_name && c.section === s.section
    )
);

        setTodayTimetable(todaySchedule);
        setUpcomingClasses(upcomingSchedule);
        setClasses(uniqueClasses);
        setAvgGrades(avg);
        setRecentLeaves(recent);
        setStudentStats({
          total: teacherStudents.length,
          present: present
        });
      } catch (error: any) {
        console.error("Error loading teacher dashboard:", error);
        console.error("Error details:", error.response?.data || error.message);
        
        // Set empty states when API fails
        setTodayTimetable([]);
        setUpcomingClasses([]);
        setClasses([]);
        setAvgGrades(0);
        setRecentLeaves([]);
        setStudentStats({ total: 0, present: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherEmail]);

  const stats = [
    {
      label: "Classes Assigned",
      value: classes.length,
      icon: BookOpen,
      color: "blue",
      description: "Total classes you teach"
    },
    {
      label: "Avg Student Marks",
      value: `${avgGrades.toFixed(1)}%`,
      icon: BarChart3,
      color: "green",
      description: "Average performance"
    },
    {
      label: "Today's Classes",
      value: todayTimetable.length,
      icon: Clock,
      color: "orange",
      description: "Scheduled for today"
    },
    {
      label: "Student Attendance",
      value: `${studentStats.total > 0 ? Math.round((studentStats.present / studentStats.total) * 100) : 0}%`,
      icon: UserCheck,
      color: "purple",
      description: "Overall attendance rate"
    }
  ];

  const quickActions = [
    { label: "Manage Grades", href: "/teachers/teachers_marks", icon: BarChart3, color: "blue" },
    { label: "View Students", href: "/teachers/teachers_monthly_report", icon: Users, color: "green" },
    { label: "Mark Attendance", href: "/teachers/teachers_attendance", icon: UserCheck, color: "orange" },
    { label: "Create Assignment", href: "/teachers/teachers_assignment", icon: FileText, color: "purple" }
  ];

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gray-50/30 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {teacherName.split(" ")[0] || "Teacher"}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here's your overview for {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            const isActive = index === activeStats;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-500 ${
                  isActive ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                    <IconComponent className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Today's Schedule & Upcoming */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Timetable */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                  Today's Schedule
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </span>
              </div>

              {todayTimetable.length > 0 ? (
                <div className="space-y-4">
                  {todayTimetable.map((classItem, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{classItem.subject_name}</h3>
                          <p className="text-sm text-gray-600">
                            {classItem.class_name} {classItem.section && `• ${classItem.section}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Room: {classItem.room_number || "Not assigned"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {classItem.start_time?.slice(0, 5)} - {classItem.end_time?.slice(0, 5)}
                        </p>
                        <p className="text-sm text-gray-500">{classItem.duration || "1 hour"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Classes Today</h3>
                  <p className="text-gray-600">Enjoy your free day!</p>
                </div>
              )}
            </div>

            {/* Classes You Teach */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Users className="h-6 w-6 text-green-600" />
                  Your Classes
                </h2>
                <span className="text-sm text-gray-500">{classes.length} classes</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((cls, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-xl hover:border-green-300 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                          {cls.class_name}
                        </h3>
                        <p className="text-sm text-gray-600">Section: {cls.section || "All"}</p>
                        <p className="text-xs text-gray-500 mt-1">Subject: {cls.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">Time: {cls.start_time || "Not specified"}</p>
                        <p className="text-xs text-gray-500 mt-1">Room No: {cls.room_number || "Not assigned"}</p>

                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming & Quick Actions */}
          <div className="space-y-8">
            {/* Upcoming Classes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-orange-600" />
                Upcoming Classes
              </h2>

              {upcomingClasses.length > 0 ? (
                <div className="space-y-4">
                  {upcomingClasses.map((classItem, index) => (
                    <div
                      key={index}
                      className="p-3 border border-orange-200 rounded-xl bg-orange-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-orange-800">{classItem.subject_name}</h3>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                          {classItem.day_of_week}
                        </span>
                      </div>
                      <p className="text-sm text-orange-700">
                        {classItem.class_name} • {classItem.start_time?.slice(0, 5)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No upcoming classes</p>
                </div>
              )}
            </div>

            {/* Recent Leaves */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <UserCheck className="h-6 w-6 text-purple-600" />
                Recent Approved Leaves
              </h2>

              {recentLeaves.length > 0 ? (
                <div className="space-y-3">
                  {recentLeaves.map((leave, index) => (
                    <div
                      key={index}
                      className="p-3 border border-purple-200 rounded-xl bg-purple-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-purple-800 text-sm">
                          {leave.applicant || "Student"}
                        </h3>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-xs text-purple-700 mb-1">{leave.reason}</p>
                      <p className="text-xs text-purple-600">
                        {leave.start_date} to {leave.end_date}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No recent leaves</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <a
                      key={index}
                      href={action.href}
                      className="p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-colors flex flex-col items-center gap-2 text-center"
                    >
                      <IconComponent className="h-6 w-6" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Performance Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Grades</span>
                  <span className="font-semibold text-green-600">{avgGrades.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Student Attendance</span>
                  <span className="font-semibold text-blue-600">
                    {studentStats.total > 0 ? Math.round((studentStats.present / studentStats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Classes This Week</span>
                  <span className="font-semibold text-orange-600">{todayTimetable.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeachersDashboard;