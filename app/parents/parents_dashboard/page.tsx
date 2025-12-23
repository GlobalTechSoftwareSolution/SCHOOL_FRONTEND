"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import {
  Users,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Award,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  BarChart3,
  Sparkles,
  Target,
  Zap,
  Gem
} from "lucide-react";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

interface Student {
  email: string;
  fullname: string;
  class_id: number;
  class_name?: string;
  section?: string;
  class_teacher?: string;
  teacher_email?: string;
  profile_picture?: string;
  student_id: string;
}

interface AttendanceRecord {
  student: string;
  status: string;
  student_name?: string;
  fullname?: string;
  email?: string;
  class_name?: string;
  section?: string;
  profile_picture?: string;
  student_data?: Student;
  date: string;
  remarks?: string;
  created_time?: string;
  marked_by?: string;
  created_at?: string;
}

interface Grade {
  student: string;
  subject_name: string;
  fullname?: string;
  email?: string;
  section?: string;
  class_name?: string;
  exam_type: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  exam_date: string;
}

interface Leave {
  applicant_email: string;
  status: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  class_name?: string;
  section?: string;
  fullname?: string;
  reason: string;
  approved_by?: string;
  created_at: string;
  remarks?: string;
}

const ParentDashboard = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  // Initialize parentEmail from localStorage during component initialization
  const [parentEmail] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          return parsedData.email || null;
        } catch (error) {
          console.error("Error parsing user data:", error);
          return null;
        }
      }
    }
    return null;
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // ✅ Fetch all data for parent
  useEffect(() => {
    if (!parentEmail) return;

    const fetchParentData = async () => {
      try {
        setLoading(true);

        const [studentsRes, attendanceRes, gradesRes, leavesRes, classesRes] = await Promise.all([
          axios.get(`${API_BASE}/students/`),
          axios.get(`${API_BASE}/student_attendance/`),
          axios.get(`${API_BASE}/grades/`),
          axios.get(`${API_BASE}/leaves/`),
          axios.get(`${API_BASE}/classes/`)
        ]);

        // Filter students by parent email
        const parentStudents = studentsRes.data.filter(
          (student: Record<string, unknown>) => student.parent === parentEmail
        );

        // Enrich students with class information
        const enrichedStudents = parentStudents.map((student: Record<string, unknown>) => {
          const classDetail = classesRes.data.find(
            (c: Record<string, unknown>) => c.id === student.class_id
          );

          return {
            ...student,
            class_name: classDetail?.class_name,
            section: classDetail?.sec,
            class_teacher: classDetail?.class_teacher_name,
            teacher_email: classDetail?.teacher_email
          };
        });

        setStudents(enrichedStudents);

        // Filter attendance for parent's students using student_attendance (field `student`)
        const allStudentAttendance = attendanceRes.data;
        console.log("📋 Total student_attendance records (dashboard):", allStudentAttendance.length);
        console.log("📝 Dashboard student emails we're looking for:", enrichedStudents.map((s: Record<string, unknown>) => s.email));

        const filteredAttendance = allStudentAttendance.filter((record: Record<string, unknown>) =>
          enrichedStudents.some((stu: Record<string, unknown>) => stu.email === record.student)
        );

        // Merge student info with attendance
        const mergedAttendance = filteredAttendance.map((att: Record<string, unknown>) => {
          const stu = enrichedStudents.find((s: Record<string, unknown>) => s.email === att.student);
          return {
            ...att,
            student: att.student,
            status: att.status || "Present",
            fullname: att.student_name || stu?.fullname || "Unknown Student",
            email: att.student || stu?.email,
            class_name: att.class_name || stu?.class_name,
            section: att.section || stu?.section,
            profile_picture: stu?.profile_picture,
            student_data: stu,
            date: att.date,
            remarks: att.remarks || "",
            created_at: att.created_time,
          };
        });

        setAttendanceData(mergedAttendance);

        // Filter grades for parent's students
        const studentGrades = gradesRes.data.filter((grade: Record<string, unknown>) =>
          enrichedStudents.some((student: Record<string, unknown>) => student.email === grade.student)
        );

        // Enrich grades with student information
        const enrichedGrades = studentGrades.map((grade: Record<string, unknown>) => {
          const student = enrichedStudents.find((s: Record<string, unknown>) => s.email === grade.student);
          return {
            ...grade,
            fullname: student?.fullname,
            email: student?.email,
            section: student?.sec,
            class_name: student?.class_name
          };
        });

        setGrades(enrichedGrades);

        // Filter leaves for parent's students
        const studentLeaves = leavesRes.data.filter((leave: Record<string, unknown>) =>
          enrichedStudents.some((student: Record<string, unknown>) => student.email === leave.applicant_email)
        );

        // Enrich leaves with student information
        const enrichedLeaves = studentLeaves.map((leave: Record<string, unknown>) => {
          const student = enrichedStudents.find((s: Record<string, unknown>) => s.email === leave.applicant_email);
          return {
            ...leave,
            fullname: student?.fullname,
            email: student?.email,
            section: student?.sec,
            class_name: student?.class_name
          };
        });

        setLeaves(enrichedLeaves);

        setLoading(false);
      } catch (error: unknown) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchParentData();
  }, [parentEmail]);

  // Calculate statistics
  const getAttendanceStats = () => {
    const present = attendanceData.filter(item => item.status === "Present").length;
    const absent = attendanceData.filter(item => item.status === "Absent").length;
    const total = present + absent;
    return {
      present,
      absent,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      total
    };
  };

  const getStudentStats = (studentEmail: string) => {
    const studentAttendance = attendanceData.filter(item => item.email === studentEmail);
    const studentGrades = grades.filter(item => item.student === studentEmail);
    const studentLeaves = leaves.filter(item => item.applicant_email === studentEmail);

    const present = studentAttendance.filter(item => item.status === "Present").length;
    const totalAttendance = studentAttendance.length;

    const avgGrade = studentGrades.length > 0
      ? studentGrades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / studentGrades.length
      : 0;

    return {
      present,
      totalAttendance,
      percentage: totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0,
      totalGrades: studentGrades.length,
      avgGrade: Math.round(avgGrade),
      totalLeaves: studentLeaves.length
    };
  };

  const getOverallStats = () => {
    const totalStudents = students.length;
    const totalGrades = grades.length;
    const totalLeaves = leaves.length;
    const attendanceStats = getAttendanceStats();

    return {
      totalStudents,
      totalGrades,
      totalLeaves,
      attendancePercentage: attendanceStats.percentage,
      avgGrade: grades.length > 0
        ? Math.round(grades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / grades.length)
        : 0
    };
  };

  // Filter data
  const filteredAttendance = attendanceData.filter(item => {
    const matchesStudent = selectedStudent === "all" || item.email === selectedStudent;
    const matchesDate = !dateFilter || item.date === dateFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch =
      (item.fullname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.class_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.remarks || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStudent && matchesDate && matchesStatus && matchesSearch;
  });

  const filteredGrades = grades.filter(grade => {
    const matchesStudent = selectedStudent === "all" || grade.student === selectedStudent;
    return matchesStudent;
  });

  const filteredLeaves = leaves.filter(leave => {
    const matchesStudent = selectedStudent === "all" || leave.applicant_email === selectedStudent;
    return matchesStudent;
  });

  const stats = getAttendanceStats();
  const overallStats = getOverallStats();

  if (loading) {
    return (
      <DashboardLayout role="parents">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 xs:h-16 xs:w-16 border-b-2 border-blue-600 mx-auto mb-3 xs:mb-4"></div>
              <Users className="h-6 w-6 xs:h-8 xs:w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-600 font-medium text-sm xs:text-base">Loading your children&#39;s data...</p>
            <p className="text-gray-400 text-xs xs:text-sm mt-1">Getting everything ready for you</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parents">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-4 xs:p-5 sm:p-6">
        {/* Enhanced Header */}
        <div className="mb-6 xs:mb-7 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 xs:gap-5 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
                <div className="p-2 xs:p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl xs:rounded-2xl shadow-lg">
                  <Users className="h-5 xs:h-6 sm:h-7 w-5 xs:w-6 sm:w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-gradient-to-br from-gray-900 to-blue-900 bg-clip-text text-transparent">
                    Welcome to Parent Dashboard
                  </h1>
                  <p className="text-gray-600 text-sm xs:text-base sm:text-lg mt-1 xs:mt-2">
                    Monitor your children&#39;s academic progress and school activities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Enhanced */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6 mb-6 xs:mb-7 sm:mb-8">
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-xl xs:rounded-2xl shadow-sm border border-blue-200/30 p-4 xs:p-5 sm:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 xs:w-20 xs:h-20 bg-blue-500/5 rounded-full -translate-y-6 xs:-translate-y-8 translate-x-6 xs:translate-x-8"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Total Children</p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mt-1 xs:mt-2">{overallStats.totalStudents}</p>
              </div>
              <div className="p-2 xs:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg xs:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 xs:mt-3 sm:mt-4">
              <Sparkles className="h-3 w-3 xs:h-4 xs:w-4 text-blue-500" />
              <span className="text-xs xs:text-sm text-blue-600 font-medium">Your students</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50/50 rounded-xl xs:rounded-2xl shadow-sm border border-green-200/30 p-4 xs:p-5 sm:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 xs:w-20 xs:h-20 bg-green-500/5 rounded-full -translate-y-6 xs:-translate-y-8 translate-x-6 xs:translate-x-8"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mt-1 xs:mt-2">{overallStats.attendancePercentage}%</p>
              </div>
              <div className="p-2 xs:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg xs:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 xs:mt-3 sm:mt-4">
              <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4 text-green-500" />
              <span className="text-xs xs:text-sm text-green-600 font-medium">{stats.present} present</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-xl xs:rounded-2xl shadow-sm border border-purple-200/30 p-4 xs:p-5 sm:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 xs:w-20 xs:h-20 bg-purple-500/5 rounded-full -translate-y-6 xs:-translate-y-8 translate-x-6 xs:translate-x-8"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Average Grade</p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mt-1 xs:mt-2">{overallStats.avgGrade}%</p>
              </div>
              <div className="p-2 xs:p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg xs:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 xs:mt-3 sm:mt-4">
              <Target className="h-3 w-3 xs:h-4 xs:w-4 text-purple-500" />
              <span className="text-xs xs:text-sm text-purple-600 font-medium">Performance</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-xl xs:rounded-2xl shadow-sm border border-orange-200/30 p-4 xs:p-5 sm:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 xs:w-20 xs:h-20 bg-orange-500/5 rounded-full -translate-y-6 xs:-translate-y-8 translate-x-6 xs:translate-x-8"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Leave Applications</p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mt-1 xs:mt-2">{overallStats.totalLeaves}</p>
              </div>
              <div className="p-2 xs:p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg xs:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 xs:mt-3 sm:mt-4">
              <Clock className="h-3 w-3 xs:h-4 xs:w-4 text-orange-500" />
              <span className="text-xs xs:text-sm text-orange-600 font-medium">Applications</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Enhanced */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl xs:rounded-2xl shadow-sm border border-slate-200/60 p-4 xs:p-5 sm:p-6 mb-6 xs:mb-7 sm:mb-8">
          <div className="flex gap-1 xs:gap-2 bg-gray-100/50 p-1 rounded-lg xs:rounded-xl mb-4 xs:mb-5 sm:mb-6 overflow-x-auto">
            {[
              { id: "overview", label: "📊 Overview", icon: BarChart3, shortLabel: "Overview" },
              { id: "attendance", label: "📅 Attendance", icon: Calendar, shortLabel: "Attendance" },
              { id: "grades", label: "🎓 Grades", icon: Award, shortLabel: "Grades" },
              { id: "leaves", label: "📋 Leaves", icon: FileText, shortLabel: "Leaves" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[100px] py-2 xs:py-2.5 px-2 xs:px-3 rounded-md text-xs xs:text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-1 xs:gap-2 ${activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <tab.icon className="h-3 w-3 xs:h-4 xs:w-4" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-3 xs:gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 xs:h-4 xs:w-4" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 xs:pl-10 pr-4 py-2 xs:py-3 border border-gray-300/60 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm xs:text-base"
              />
            </div>

            <div className="flex flex-wrap gap-2 xs:gap-3 w-full lg:w-auto">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="flex-1 min-w-[140px] px-3 xs:px-4 py-2 xs:py-3 border border-gray-300/60 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm xs:text-base"
              >
                <option value="all">All Children</option>
                {students.map(student => (
                  <option key={student.email} value={student.email}>
                    {student.fullname}
                  </option>
                ))}
              </select>

              {activeTab === "attendance" && (
                <>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 min-w-[120px] px-3 xs:px-4 py-2 xs:py-3 border border-gray-300/60 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm xs:text-base"
                  >
                    <option value="all">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="flex-1 min-w-[140px] px-3 xs:px-4 py-2 xs:py-3 border border-gray-300/60 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm xs:text-base"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Overview Tab - CARDS FORMAT */}
        {activeTab === "overview" && (
          <div className="space-y-6 xs:space-y-8">
            {/* Children Overview - CARDS */}
            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl xs:rounded-2xl shadow-sm border border-blue-200/30 p-4 xs:p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 xs:mb-5 sm:mb-6">
                <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 xs:gap-3">
                  <div className="p-1.5 xs:p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg xs:rounded-xl">
                    <Users className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  Your Children ({students.length})
                </h2>
                {selectedStudent !== "all" && (
                  <button
                    onClick={() => setSelectedStudent("all")}
                    className="px-3 xs:px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs xs:text-sm font-medium rounded-lg xs:rounded-xl transition-colors w-full sm:w-auto"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
                {students.map((student, index) => {
                  const studentStat = getStudentStats(student.email);
                  const isSelected = selectedStudent === student.email;
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedStudent(student.email)}
                      className={`border rounded-lg xs:rounded-xl p-4 xs:p-5 transition-all cursor-pointer group hover:shadow-lg ${isSelected
                          ? "border-blue-500 bg-blue-50/50 shadow-md"
                          : "border-gray-200/60 hover:border-blue-300 bg-white"
                        }`}
                    >
                      <div className="flex items-center gap-3 xs:gap-4 mb-3 xs:mb-4">
                        <div className={`w-10 h-10 xs:w-12 xs:h-12 rounded-full flex items-center justify-center overflow-hidden border-2 ${isSelected ? "border-blue-500" : "border-gray-200 group-hover:border-blue-300"
                          }`}>
                          {student.profile_picture ? (
                            <Image
                              src={student.profile_picture}
                              alt={student.fullname}
                              width={48}
                              height={48}
                              className="w-10 h-10 xs:w-12 xs:h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full rounded-full flex items-center justify-center ${isSelected ? "bg-blue-100" : "bg-gray-100 group-hover:bg-blue-50"
                              }`}>
                              <Users className="h-5 w-5 xs:h-6 xs:w-6 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm xs:text-base truncate">{student.fullname}</h3>
                          <p className="text-xs xs:text-sm text-gray-600 truncate">{student.class_name} • {student.section}</p>
                          <p className="text-xs text-gray-500 mt-1">ID: {student.student_id}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 xs:gap-3 text-center">
                        <div className="bg-blue-50/50 rounded-lg xs:rounded-xl p-2 group-hover:bg-blue-100/50 transition-colors">
                          <p className="text-base xs:text-lg font-bold text-blue-600">{studentStat.percentage}%</p>
                          <p className="text-xs text-gray-600">Attendance</p>
                        </div>
                        <div className="bg-purple-50/50 rounded-lg xs:rounded-xl p-2 group-hover:bg-purple-100/50 transition-colors">
                          <p className="text-base xs:text-lg font-bold text-purple-600">{studentStat.avgGrade}%</p>
                          <p className="text-xs text-gray-600">Avg Grade</p>
                        </div>
                        <div className="bg-orange-50/50 rounded-lg xs:rounded-xl p-2 group-hover:bg-orange-100/50 transition-colors">
                          <p className="text-base xs:text-lg font-bold text-orange-600">{studentStat.totalLeaves}</p>
                          <p className="text-xs text-gray-600">Leaves</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats - CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
              {/* Attendance Summary Card */}
              <div className="bg-gradient-to-br from-white to-green-50/30 rounded-xl xs:rounded-2xl shadow-sm border border-green-200/30 p-4 xs:p-5 sm:p-6">
                <h3 className="text-base xs:text-lg font-semibold text-gray-800 mb-3 xs:mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  Attendance Summary
                </h3>
                <div className="space-y-3 xs:space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm xs:text-base text-gray-600">Present Days</span>
                    <span className="font-semibold text-green-600 text-sm xs:text-base">{stats.present}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm xs:text-base text-gray-600">Absent Days</span>
                    <span className="font-semibold text-red-600 text-sm xs:text-base">{stats.absent}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm xs:text-base text-gray-600">Overall Attendance</span>
                    <span className="font-semibold text-blue-600 text-sm xs:text-base">{stats.percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Academic Summary Card */}
              <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl xs:rounded-2xl shadow-sm border border-purple-200/30 p-4 xs:p-5 sm:p-6">
                <h3 className="text-base xs:text-lg font-semibold text-gray-800 mb-3 xs:mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  Academic Summary
                </h3>
                <div className="space-y-3 xs:space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm xs:text-base text-gray-600">Total Grades</span>
                    <span className="font-semibold text-purple-600 text-sm xs:text-base">{overallStats.totalGrades}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm xs:text-base text-gray-600">Average Performance</span>
                    <span className="font-semibold text-purple-600 text-sm xs:text-base">{overallStats.avgGrade}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm xs:text-base text-gray-600">Leave Applications</span>
                    <span className="font-semibold text-orange-600 text-sm xs:text-base">{overallStats.totalLeaves}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab - CARDS FORMAT */}
        {activeTab === "attendance" && (
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl xs:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-4 xs:p-5 sm:p-6 border-b border-gray-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 xs:gap-4 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 xs:gap-4">
                <div className="p-2 xs:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg xs:rounded-xl shadow-lg">
                  <Calendar className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">Attendance Records</h2>
                  <p className="text-gray-600 text-xs xs:text-sm">Track your children&#39;s attendance</p>
                </div>
              </div>
              <div className="flex items-center gap-2 xs:gap-3">
                <span className="bg-blue-100 text-blue-800 text-xs xs:text-sm px-2 xs:px-3 py-1 xs:py-2 rounded-full font-medium flex items-center gap-1 xs:gap-2">
                  <Sparkles className="h-3 w-3 xs:h-4 xs:w-4" />
                  {filteredAttendance.length} records
                </span>
              </div>
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="text-center py-12 xs:py-16">
                <div className="w-16 h-16 xs:w-20 xs:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4">
                  <Calendar className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-lg xs:text-xl font-semibold text-gray-900 mb-1 xs:mb-2">No attendance records found</h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm xs:text-base px-4">
                  {attendanceData.length === 0
                    ? "No attendance records available for your children."
                    : "Try adjusting your filters to find what you're looking for."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 p-4 xs:p-5 sm:p-6">
                {filteredAttendance.map((record, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg xs:rounded-xl border border-gray-200/60 p-4 xs:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-blue-300"
                    onClick={() => setExpandedRecord(expandedRecord === index ? null : index)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 xs:mb-4">
                      <div className="flex items-center gap-2 xs:gap-3">
                        <div className="w-8 h-8 xs:w-10 xs:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                          {record.profile_picture ? (
                            <Image
                              src={record.profile_picture}
                              alt={record.fullname || "Student"}
                              width={40}
                              height={40}
                              className="w-8 h-8 xs:w-10 xs:h-10 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-4 w-4 xs:h-5 xs:w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm xs:text-base group-hover:text-blue-900 transition-colors line-clamp-1">
                            {record.fullname}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${record.status === "Present"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                              }`}>
                              {record.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {record.class_name} • {record.section}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRecord(expandedRecord === index ? null : index);
                        }}
                        className="p-1 xs:p-2 hover:bg-gray-50 rounded-lg transition-colors duration-300 flex-shrink-0"
                      >
                        {expandedRecord === index ?
                          <ChevronUp className="h-4 w-4 xs:h-5 xs:w-5 text-gray-600" /> :
                          <ChevronDown className="h-4 w-4 xs:h-5 xs:w-5 text-gray-600 group-hover:text-blue-600" />
                        }
                      </button>
                    </div>

                    {/* Record Details */}
                    <div className="space-y-2 xs:space-y-3">
                      <div className="flex items-center justify-between text-xs xs:text-sm">
                        <span className="text-gray-600 flex items-center gap-1 xs:gap-2">
                          <Calendar className="h-3 w-3 xs:h-4 xs:w-4" />
                          Date:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {record.remarks && (
                        <div className="text-xs xs:text-sm">
                          <span className="text-gray-600 font-medium">Remarks:</span>
                          <p className="text-gray-700 mt-1 line-clamp-2">{record.remarks}</p>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {expandedRecord === index && (
                      <div className="mt-4 xs:mt-5 border-t border-gray-200/60 pt-4 xs:pt-5 bg-gray-50/50 rounded-lg xs:rounded-xl p-3 xs:p-4">
                        <div className="space-y-3 xs:space-y-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs xs:text-sm mb-2 flex items-center gap-1 xs:gap-2">
                              <Zap className="h-3 w-3 xs:h-4 xs:w-4 text-blue-500" />
                              Record Details
                            </h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Marked By:</span>
                                <span className="text-gray-900 font-medium">{record.marked_by || "Teacher"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Marked Date:</span>
                                <span className="text-gray-900 font-medium">
                                  {new Date(record.created_at || record.date).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Student Email:</span>
                                <span className="text-gray-900 font-medium truncate ml-2">{record.email}</span>
                              </div>
                            </div>
                          </div>

                          {record.remarks && (
                            <div>
                              <h4 className="font-bold text-gray-900 text-xs xs:text-sm mb-2 flex items-center gap-1 xs:gap-2">
                                <FileText className="h-3 w-3 xs:h-4 xs:w-4 text-gray-500" />
                                Remarks
                              </h4>
                              <p className="text-gray-700 bg-white p-2 xs:p-3 rounded-lg xs:rounded-xl border border-gray-200/60 text-xs leading-relaxed">
                                {record.remarks}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grades Tab - CARDS FORMAT */}
        {activeTab === "grades" && (
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl xs:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-4 xs:p-5 sm:p-6 border-b border-gray-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 xs:gap-4 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 xs:gap-4">
                <div className="p-2 xs:p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg xs:rounded-xl shadow-lg">
                  <Award className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">Academic Grades</h2>
                  <p className="text-gray-600 text-xs xs:text-sm">Track academic performance</p>
                </div>
              </div>
              <div className="flex items-center gap-2 xs:gap-3">
                <span className="bg-purple-100 text-purple-800 text-xs xs:text-sm px-2 xs:px-3 py-1 xs:py-2 rounded-full font-medium flex items-center gap-1 xs:gap-2">
                  <Gem className="h-3 w-3 xs:h-4 xs:w-4" />
                  {filteredGrades.length} records
                </span>
              </div>
            </div>

            {filteredGrades.length === 0 ? (
              <div className="text-center py-12 xs:py-16">
                <div className="w-16 h-16 xs:w-20 xs:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4">
                  <Award className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-lg xs:text-xl font-semibold text-gray-900 mb-1 xs:mb-2">No grade records found</h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm xs:text-base px-4">
                  No grade records available for your children.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 p-4 xs:p-5 sm:p-6">
                {filteredGrades.map((grade, index) => (
                  <div key={index} className="bg-white rounded-lg xs:rounded-xl border border-gray-200/60 p-4 xs:p-5 hover:shadow-lg transition-all duration-300 group hover:border-purple-300">
                    <div className="flex items-start justify-between mb-3 xs:mb-4">
                      <div className="flex items-center gap-2 xs:gap-3">
                        <div className="w-8 h-8 xs:w-10 xs:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                          <BookOpen className="h-4 w-4 xs:h-5 xs:w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm xs:text-base group-hover:text-purple-900 transition-colors line-clamp-1">
                            {grade.subject_name}
                          </h3>
                          <p className="text-xs xs:text-sm text-gray-600 truncate">{grade.fullname}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${grade.percentage >= 80 ? "bg-green-50 text-green-700 border-green-200" :
                          grade.percentage >= 60 ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-red-50 text-red-700 border-red-200"
                        }`}>
                        {grade.percentage}%
                      </span>
                    </div>

                    <div className="space-y-2 xs:space-y-3 text-xs xs:text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Exam Type:</span>
                        <span className="font-semibold text-gray-900">{grade.exam_type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Marks:</span>
                        <span className="font-bold text-gray-900">{grade.marks_obtained}/{grade.total_marks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-gray-900">{new Date(grade.exam_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Class:</span>
                        <span className="text-gray-900">{grade.class_name} • {grade.section}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leaves Tab - CARDS FORMAT */}
        {activeTab === "leaves" && (
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl xs:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-4 xs:p-5 sm:p-6 border-b border-gray-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 xs:gap-4 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 xs:gap-4">
                <div className="p-2 xs:p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg xs:rounded-xl shadow-lg">
                  <FileText className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">Leave Applications</h2>
                  <p className="text-gray-600 text-xs xs:text-sm">Track leave applications</p>
                </div>
              </div>
              <div className="flex items-center gap-2 xs:gap-3">
                <span className="bg-orange-100 text-orange-800 text-xs xs:text-sm px-2 xs:px-3 py-1 xs:py-2 rounded-full font-medium flex items-center gap-1 xs:gap-2">
                  <Clock className="h-3 w-3 xs:h-4 xs:w-4" />
                  {filteredLeaves.length} records
                </span>
              </div>
            </div>

            {filteredLeaves.length === 0 ? (
              <div className="text-center py-12 xs:py-16">
                <div className="w-16 h-16 xs:w-20 xs:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4">
                  <FileText className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-lg xs:text-xl font-semibold text-gray-900 mb-1 xs:mb-2">No leave records found</h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm xs:text-base px-4">
                  No leave applications found for your children.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 p-4 xs:p-5 sm:p-6">
                {filteredLeaves.map((leave, index) => (
                  <div key={index} className="bg-white rounded-lg xs:rounded-xl border border-gray-200/60 p-4 xs:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-orange-300"
                    onClick={() => setExpandedRecord(expandedRecord === index ? null : index)}>
                    <div className="flex items-start justify-between mb-3 xs:mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 xs:gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 text-sm xs:text-base group-hover:text-orange-900 transition-colors line-clamp-1">
                            {leave.fullname}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${leave.status === "Approved" ? "bg-green-50 text-green-700 border-green-200" :
                              leave.status === "Pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                "bg-red-50 text-red-700 border-red-200"
                            }`}>
                            {leave.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs xs:text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Leave Type:</span>
                            <span className="font-semibold text-gray-900">{leave.leave_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="text-gray-900">{leave.start_date} to {leave.end_date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Class:</span>
                            <span className="text-gray-900">{leave.class_name} • {leave.section}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className="text-gray-600 font-medium text-xs">Reason:</span>
                          <p className="text-gray-700 mt-1 line-clamp-2 text-xs">{leave.reason}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRecord(expandedRecord === index ? null : index);
                        }}
                        className="p-1 xs:p-2 hover:bg-gray-50 rounded-lg transition-colors duration-300 flex-shrink-0 ml-2"
                      >
                        {expandedRecord === index ?
                          <ChevronUp className="h-4 w-4 xs:h-5 xs:w-5 text-gray-600" /> :
                          <ChevronDown className="h-4 w-4 xs:h-5 xs:w-5 text-gray-600 group-hover:text-orange-600" />
                        }
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedRecord === index && (
                      <div className="mt-4 xs:mt-5 border-t border-gray-200/60 pt-4 xs:pt-5 bg-gray-50/50 rounded-lg xs:rounded-xl p-3 xs:p-4">
                        <div className="space-y-3 xs:space-y-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs xs:text-sm mb-2 flex items-center gap-1 xs:gap-2">
                              <User className="h-3 w-3 xs:h-4 xs:w-4 text-blue-500" />
                              Student Information
                            </h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="text-gray-900 font-medium truncate ml-2">{leave.applicant_email}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-gray-900 text-xs xs:text-sm mb-2 flex items-center gap-1 xs:gap-2">
                              <Target className="h-3 w-3 xs:h-4 xs:w-4 text-orange-500" />
                              Approval Details
                            </h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Approved By:</span>
                                <span className="text-gray-900 font-medium">{leave.approved_by || "Pending Approval"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Applied On:</span>
                                <span className="text-gray-900">{new Date(leave.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {leave.remarks && (
                            <div>
                              <h4 className="font-bold text-gray-900 text-xs xs:text-sm mb-2 flex items-center gap-1 xs:gap-2">
                                <FileText className="h-3 w-3 xs:h-4 xs:w-4 text-gray-500" />
                                Additional Remarks
                              </h4>
                              <p className="text-gray-700 bg-white p-2 xs:p-3 rounded-lg xs:rounded-xl border border-gray-200/60 text-xs leading-relaxed">
                                {leave.remarks}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;