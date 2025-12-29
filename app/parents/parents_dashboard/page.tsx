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
          <div className="text-center p-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-600 font-medium text-sm sm:text-base">Loading your children&#39;s data...</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Getting everything ready for you</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parents">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-3 sm:p-6 md:p-8 print:bg-white print:p-2">
        {/* Enhanced Header */}
        <div className="mb-6 sm:mb-8 print:mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/20 print:hidden">
                <Users className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-br from-gray-900 to-blue-800 bg-clip-text text-transparent tracking-tight print:text-black">
                  Parent Dashboard
                </h1>
                <p className="text-gray-500 text-sm sm:text-base md:text-lg lg:text-xl font-medium print:text-gray-700">
                  Monitoring Children&#39;s Academic Progress
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 print:grid-cols-2 print:gap-3 print:mb-4">
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-sm border border-blue-200/30 p-5 sm:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300 print:shadow-none print:border">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-y-8 translate-x-8 print:hidden"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 print:text-gray-800">Total Children</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 print:text-2xl">{overallStats.totalStudents}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 print:hidden">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 sm:mt-4 relative z-10">
              <Sparkles className="h-4 w-4 text-blue-500 print:hidden" />
              <span className="text-sm text-blue-600 font-medium print:text-blue-800">Your students</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50/50 rounded-2xl shadow-sm border border-green-200/30 p-5 sm:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300 print:shadow-none print:border">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -translate-y-8 translate-x-8 print:hidden"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 print:text-gray-800">Attendance Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 print:text-2xl">{overallStats.attendancePercentage}%</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 print:hidden">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 sm:mt-4 relative z-10">
              <TrendingUp className="h-4 w-4 text-green-500 print:hidden" />
              <span className="text-sm text-green-600 font-medium print:text-green-800">{stats.present} present</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl shadow-sm border border-purple-200/30 p-5 sm:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300 print:shadow-none print:border">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -translate-y-8 translate-x-8 print:hidden"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 print:text-gray-800">Average Grade</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 print:text-2xl">{overallStats.avgGrade}%</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 print:hidden">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 sm:mt-4 relative z-10">
              <Target className="h-4 w-4 text-purple-500 print:hidden" />
              <span className="text-sm text-purple-600 font-medium print:text-purple-800">Performance</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-2xl shadow-sm border border-orange-200/30 p-5 sm:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300 print:shadow-none print:border">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full -translate-y-8 translate-x-8 print:hidden"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 print:text-gray-800">Leave Applications</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 print:text-2xl">{overallStats.totalLeaves}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 print:hidden">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 sm:mt-4 relative z-10">
              <Clock className="h-4 w-4 text-orange-500 print:hidden" />
              <span className="text-sm text-orange-600 font-medium print:text-orange-800">Applications</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Enhanced */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6 mb-6 sm:mb-8 print:bg-white print:shadow-none print:p-4 print:mb-4">
          <div className="flex bg-slate-100/50 p-1.5 rounded-2xl mb-6 overflow-x-auto scrollbar-hide print:p-1 print:mb-3">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "attendance", label: "Attendance", icon: Calendar },
              { id: "grades", label: "Grades", icon: Award },
              { id: "leaves", label: "Leaves", icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[100px] sm:min-w-0 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 print:py-1 print:px-2 print:text-xs ${activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-md ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                  }`}
              >
                <tab.icon className={`h-4 w-4 print:h-3 print:w-3 ${activeTab === tab.id ? "text-blue-600" : "text-gray-400"}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between print:flex-col print:gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 print:h-3 print:w-3" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm sm:text-base print:py-1 print:pl-7 print:text-sm print:border print:bg-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0 print:flex-col print:w-full print:gap-2">
              <div className="relative flex-1 sm:w-64">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm cursor-pointer appearance-none print:py-1 print:px-2 print:text-sm"
                >
                  <option value="all">All Students</option>
                  {students.map(student => (
                    <option key={student.email} value={student.email}>
                      {student.fullname}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>

              {activeTab === "attendance" && (
                <>
                  <div className="relative flex-1 sm:w-40">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm cursor-pointer appearance-none print:py-1 print:px-2 print:text-sm"
                    >
                      <option value="all">Any Status</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                  </div>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="flex-1 sm:w-48 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm cursor-pointer print:py-1 print:px-2 print:text-sm"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Overview Tab - CARDS FORMAT */}
        {activeTab === "overview" && (
          <div className="space-y-6 sm:space-y-8 print:space-y-4">
            {/* Children Overview - CARDS */}
            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-sm border border-blue-200/30 p-4 sm:p-6 print:bg-white print:shadow-none print:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 print:flex-col print:items-start print:gap-2 print:mb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3 print:text-xl">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl print:hidden">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  Your Children ({students.length})
                </h2>
                {selectedStudent !== "all" && (
                  <button
                    onClick={() => setSelectedStudent("all")}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-colors w-full sm:w-auto print:py-1 print:text-xs shadow-sm"
                  >
                    View All Children
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 print:grid-cols-1 print:gap-3">
                {students.map((student, index) => {
                  const studentStat = getStudentStats(student.email);
                  const isSelected = selectedStudent === student.email;
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedStudent(student.email)}
                      className={`relative group border rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden print:p-3 print:break-inside-avoid ${isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20"
                        : "border-gray-200/60 hover:border-blue-300 bg-white hover:shadow-xl hover:shadow-gray-200/50"
                        }`}
                    >
                      <div className="flex items-center gap-4 mb-4 relative z-10 print:gap-3 print:mb-3">
                        <div className={`relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 transition-transform duration-300 group-hover:scale-105 print:w-10 print:h-10 ${isSelected ? "border-blue-500" : "border-slate-100"
                          }`}>
                          {student.profile_picture ? (
                            <Image
                              src={student.profile_picture}
                              alt={student.fullname}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                              <User className="h-7 w-7 text-slate-400 print:h-4 print:w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors print:text-sm">{student.fullname}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 print:gap-1">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg print:text-[10px]">
                              {student.class_name}
                            </span>
                            <span className="text-xs text-slate-500 font-medium print:text-[10px]">Sec {student.section}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 relative z-10 print:gap-2">
                        <div className="bg-slate-50/80 rounded-xl p-2 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100 print:p-1.5 text-center">
                          <p className="text-base font-bold text-blue-600 print:text-sm">{studentStat.percentage}%</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider print:text-[10px]">Attend</p>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl p-2 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100 print:p-1.5 text-center">
                          <p className="text-base font-bold text-purple-600 print:text-sm">{studentStat.avgGrade}%</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider print:text-[10px]">Grade</p>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl p-2 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100 print:p-1.5 text-center">
                          <p className="text-base font-bold text-orange-600 print:text-sm">{studentStat.totalLeaves}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider print:text-[10px]">Leaves</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-0 right-0 p-2 print:hidden">
                          <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats - CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1 print:gap-3">
              {/* Attendance Summary Card */}
              <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-sm border border-green-200/30 p-6 print:bg-white print:shadow-none print:p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-3 print:text-base print:mb-2">
                  <div className="p-2 bg-green-100 rounded-xl print:hidden">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  Attendance Summary
                </h3>
                <div className="space-y-4 print:space-y-2">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 print:py-1">
                    <span className="text-gray-600 font-medium">Present Days</span>
                    <span className="font-bold text-green-600 text-lg">{stats.present}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 print:py-1">
                    <span className="text-gray-600 font-medium">Absent Days</span>
                    <span className="font-bold text-red-600 text-lg">{stats.absent}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 print:py-1">
                    <span className="text-gray-600 font-medium">Overall Attendance</span>
                    <span className="font-bold text-blue-600 text-lg">{stats.percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Academic Summary Card */}
              <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-sm border border-purple-200/30 p-6 print:bg-white print:shadow-none print:p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-3 print:text-base print:mb-2">
                  <div className="p-2 bg-purple-100 rounded-xl print:hidden">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  Academic Summary
                </h3>
                <div className="space-y-4 print:space-y-2">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 print:py-1">
                    <span className="text-gray-600 font-medium">Total Grades</span>
                    <span className="font-bold text-purple-600 text-lg">{overallStats.totalGrades}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 print:py-1">
                    <span className="text-gray-600 font-medium">Average Performance</span>
                    <span className="font-bold text-purple-600 text-lg">{overallStats.avgGrade}%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 print:py-1">
                    <span className="text-gray-600 font-medium">Leave Applications</span>
                    <span className="font-bold text-orange-600 text-lg">{overallStats.totalLeaves}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab - CARDS FORMAT */}
        {activeTab === "attendance" && (
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden print:bg-white print:shadow-none">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-sm print:p-3 print:flex-col print:items-start print:gap-2">
              <div className="flex items-center gap-4 print:gap-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/10 print:hidden">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight print:text-lg">Attendance Records</h2>
                  <p className="text-gray-500 text-sm font-medium mt-0.5 print:text-xs">Tracking your children&#39;s attendance</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-blue-100/50 print:text-xs print:px-2 print:py-1">
                  <Sparkles className="h-4 w-4" />
                  {filteredAttendance.length} Records Found
                </span>
              </div>
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="text-center py-12 sm:py-16 print:py-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 print:hidden">
                  <Calendar className="h-6 w-6 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 print:text-base">No attendance records found</h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4 print:text-sm print:px-2">
                  {attendanceData.length === 0
                    ? "No attendance records available for your children."
                    : "Try adjusting your filters to find what you're looking for."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6 print:grid-cols-1 print:gap-3 print:p-3">
                {filteredAttendance.map((record, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-gray-200/60 p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-blue-300 print:p-3 print:break-inside-avoid"
                    onClick={() => setExpandedRecord(expandedRecord === index ? null : index)}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 print:w-8 print:h-8">
                          {record.profile_picture ? (
                            <Image
                              src={record.profile_picture}
                              alt={record.fullname || "Student"}
                              width={44}
                              height={44}
                              className="w-full h-full rounded-full object-cover ring-2 ring-slate-100"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-50 rounded-full flex items-center justify-center ring-2 ring-slate-100">
                              <Users className="h-5 w-5 text-slate-400 print:h-3 print:w-3" />
                            </div>
                          )}
                          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${record.status === "Present" ? "bg-green-500" : "bg-red-500"} print:w-3 print:h-3`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors truncate print:text-sm">
                            {record.fullname}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 print:gap-1">
                            <span className="text-xs text-slate-500 font-medium truncate print:text-[10px]">
                              {record.class_name} • Sec {record.section}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${record.status === "Present"
                          ? "bg-green-50 text-green-600 border border-green-100"
                          : "bg-red-50 text-red-600 border border-red-100"
                          } print:text-[10px] print:px-1.5`}>
                          {record.status}
                        </span>
                        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${expandedRecord === index ? "rotate-180" : ""} print:h-3 print:w-3`} />
                      </div>
                    </div>

                    {/* Record Details */}
                    <div className="space-y-2 sm:space-y-3 print:space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm print:text-xs">
                        <span className="text-gray-600 flex items-center gap-1 sm:gap-2 print:gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 print:h-2 print:w-2" />
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
                        <div className="text-xs sm:text-sm print:text-xs">
                          <span className="text-gray-600 font-medium">Remarks:</span>
                          <p className="text-gray-700 mt-1 line-clamp-2 print:mt-0.5">{record.remarks}</p>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {expandedRecord === index && (
                      <div className="mt-4 sm:mt-5 border-t border-gray-200/60 pt-4 sm:pt-5 bg-gray-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4 print:mt-2 print:pt-2 print:p-2">
                        <div className="space-y-3 sm:space-y-4 print:space-y-2">
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-2 flex items-center gap-1 sm:gap-2 print:text-xs print:mb-1">
                              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 print:h-2 print:w-2" />
                              Record Details
                            </h4>
                            <div className="space-y-2 text-xs print:text-[10px] print:space-y-1">
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
                              <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-2 flex items-center gap-1 sm:gap-2 print:text-xs print:mb-1">
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 print:h-2 print:w-2" />
                                Remarks
                              </h4>
                              <p className="text-gray-700 bg-white p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200/60 text-xs leading-relaxed print:p-1 print:text-[10px]">
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
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden print:bg-white print:shadow-none">
            <div className="p-5 sm:p-6 border-b border-gray-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm print:p-3 print:flex-col print:items-start print:gap-2">
              <div className="flex items-center gap-4 print:gap-2">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg print:hidden">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 print:text-lg">Academic Grades</h2>
                  <p className="text-gray-600 text-sm font-medium mt-0.5 print:text-xs">Track academic performance</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="bg-purple-50 text-purple-700 text-sm px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-purple-100/50 print:text-xs print:px-2 print:py-1">
                  <Gem className="h-4 w-4" />
                  {filteredGrades.length} Records Found
                </span>
              </div>
            </div>

            {filteredGrades.length === 0 ? (
              <div className="text-center py-16 print:py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 print:hidden">
                  <Award className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 print:text-base">No grade records found</h3>
                <p className="text-gray-600 max-w-md mx-auto text-base px-4 print:text-sm print:px-2">
                  No grade records available for your children.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 print:grid-cols-1 print:gap-3 print:p-3">
                {filteredGrades.map((grade, index) => (
                  <div key={index} className="bg-white rounded-2xl border border-gray-200/60 p-5 hover:shadow-lg transition-all duration-300 group hover:border-purple-300 print:p-3 print:break-inside-avoid">
                    <div className="flex items-start justify-between mb-4 print:mb-2">
                      <div className="flex items-center gap-3 print:gap-2">
                        <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors print:w-6 print:h-6">
                          <BookOpen className="h-5 w-5 text-purple-600 print:h-3 print:w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base group-hover:text-purple-600 transition-colors line-clamp-1 print:text-sm">
                            {grade.subject_name}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium truncate print:text-xs">{grade.fullname}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap print:text-[10px] print:px-1.5 ${grade.percentage >= 80 ? "bg-green-50 text-green-700 border-green-200" :
                        grade.percentage >= 60 ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        }`}>
                        {grade.percentage}%
                      </span>
                    </div>

                    <div className="space-y-2.5 text-sm print:text-xs print:space-y-1.5">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Exam Type:</span>
                        <span className="font-bold text-slate-900">{grade.exam_type}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Marks:</span>
                        <span className="font-bold text-slate-900">{grade.marks_obtained}/{grade.total_marks}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Date:</span>
                        <span className="text-slate-900 font-medium">{new Date(grade.exam_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Class:</span>
                        <span className="text-slate-900 font-medium">{grade.class_name} • {grade.section}</span>
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
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden print:bg-white print:shadow-none">
            <div className="p-5 sm:p-6 border-b border-gray-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm print:p-3 print:flex-col print:items-start print:gap-2">
              <div className="flex items-center gap-4 print:gap-2">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg print:hidden">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 print:text-lg">Leave Applications</h2>
                  <p className="text-gray-600 text-sm font-medium mt-0.5 print:text-xs">Track leave applications</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="bg-orange-50 text-orange-700 text-sm px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-orange-100/50 print:text-xs print:px-2 print:py-1">
                  <Clock className="h-4 w-4" />
                  {filteredLeaves.length} Records Found
                </span>
              </div>
            </div>

            {filteredLeaves.length === 0 ? (
              <div className="text-center py-16 print:py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 print:hidden">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 print:text-base">No leave records found</h3>
                <p className="text-gray-600 max-w-md mx-auto text-base px-4 print:text-sm print:px-2">
                  No leave applications found for your children.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 print:grid-cols-1 print:gap-3 print:p-3">
                {filteredLeaves.map((leave, index) => (
                  <div key={index} className="bg-white rounded-2xl border border-gray-200/60 p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-orange-300 print:p-3 print:break-inside-avoid"
                    onClick={() => setExpandedRecord(expandedRecord === index ? null : index)}>
                    <div className="flex items-start justify-between mb-4 print:mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-3 print:gap-2 print:mb-1">
                          <h3 className="font-bold text-gray-900 text-base group-hover:text-orange-600 transition-colors truncate print:text-sm">
                            {leave.fullname}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap print:text-[10px] print:px-1.5 ${leave.status === "Approved" ? "bg-green-50 text-green-700 border-green-200" :
                            leave.status === "Pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                              "bg-red-50 text-red-700 border-red-200"
                            }`}>
                            {leave.status}
                          </span>
                        </div>

                        <div className="space-y-2.5 text-sm print:text-xs print:space-y-1.5">
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Leave Type:</span>
                            <span className="font-bold text-slate-900">{leave.leave_type}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Duration:</span>
                            <span className="text-slate-900 font-medium">{leave.start_date} to {leave.end_date}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Class:</span>
                            <span className="text-slate-900 font-medium">{leave.class_name} • {leave.section}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 print:mt-2">
                          <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider print:text-[10px]">Reason</span>
                          <p className="text-slate-700 mt-1 line-clamp-2 text-sm leading-relaxed print:text-[10px]">{leave.reason}</p>
                        </div>
                      </div>

                      <div className="ml-2 flex flex-col justify-between h-full print:hidden">
                        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${expandedRecord === index ? "rotate-180" : ""} group-hover:text-orange-600`} />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedRecord === index && (
                      <div className="mt-5 border-t border-gray-100 pt-5 bg-slate-50/50 rounded-xl p-4 print:mt-2 print:pt-2 print:p-2">
                        <div className="space-y-4 print:space-y-2">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2 print:text-xs print:mb-1">
                              <User className="h-4 w-4 text-blue-500" />
                              Student Information
                            </h4>
                            <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Email:</span>
                                <span className="text-gray-900 font-bold truncate ml-4">{leave.applicant_email}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2 print:text-xs print:mb-1">
                              <Target className="h-4 w-4 text-orange-500" />
                              Approval Status
                            </h4>
                            <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Approved By:</span>
                                <span className="text-gray-900 font-bold">{leave.approved_by || "Pending Action"}</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-slate-50">
                                <span className="text-gray-500">Applied On:</span>
                                <span className="text-gray-900 font-bold">{new Date(leave.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {leave.remarks && (
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2 print:text-xs print:mb-1">
                                <FileText className="h-4 w-4 text-slate-500" />
                                Official Remarks
                              </h4>
                              <p className="text-slate-700 bg-white p-4 rounded-xl border border-slate-200/60 text-xs leading-relaxed shadow-sm">
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