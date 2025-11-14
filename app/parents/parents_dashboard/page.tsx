"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Award,
  FileText,
  Download,
  Eye,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

const ParentDashboard = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentEmail, setParentEmail] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // ✅ Get parent email from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setParentEmail(parsedData.email);
    }
  }, []);

  // ✅ Fetch all data for parent
  useEffect(() => {
    if (!parentEmail) return;

    const fetchParentData = async () => {
      try {
        setLoading(true);
        
        const [studentsRes, attendanceRes, gradesRes, leavesRes, classesRes] = await Promise.all([
          axios.get(`${API_BASE}/students/`),
          axios.get(`${API_BASE}/attendance/`),
          axios.get(`${API_BASE}/grades/`),
          axios.get(`${API_BASE}/leaves/`),
          axios.get(`${API_BASE}/classes/`)
        ]);

        // Filter students by parent email
        const parentStudents = studentsRes.data.filter(
          (student: any) => student.parent === parentEmail
        );

        // Enrich students with class information
        const enrichedStudents = parentStudents.map((student: any) => {
          const classDetail = classesRes.data.find(
            (c: any) => c.id === student.class_id
          );
          
          return {
            ...student,
            class_name: classDetail?.class_name ,
            section: classDetail?.sec,
            class_teacher: classDetail?.class_teacher_name ,
            teacher_email: classDetail?.teacher_email 
          };
        });

        setStudents(enrichedStudents);

        // Filter attendance for parent's students
        const filteredAttendance = attendanceRes.data.filter((record: any) =>
          enrichedStudents.some(
            (stu: any) =>
              stu.email === record.user_email || stu.student_id === record.user_email
          )
        );

        // Merge student info with attendance
        const mergedAttendance = filteredAttendance.map((att: any) => {
          const stu = enrichedStudents.find(
            (s: any) =>
              s.email === att.user_email || s.student_id === att.user_email
          );
          return {
            ...att,
            fullname: stu?.fullname ,
            email: stu?.email,
            class_name: stu?.class_name ,
            section: stu?.sec ,
            profile_picture: stu?.profile_picture,
            student_data: stu
          };
        });

        setAttendanceData(mergedAttendance);

        // Filter grades for parent's students
        const studentGrades = gradesRes.data.filter((grade: any) =>
          enrichedStudents.some((student: any) => student.email === grade.student)
        );

        // Enrich grades with student information
        const enrichedGrades = studentGrades.map((grade: any) => {
          const student = enrichedStudents.find((s: any) => s.email === grade.student);
          return {
            ...grade,
            fullname: student?.fullname ,
            email: student?.email ,
            section: student?.sec ,
            class_name: student?.class_name 
          };
        });

        setGrades(enrichedGrades);

        // Filter leaves for parent's students
        const studentLeaves = leavesRes.data.filter((leave: any) =>
          enrichedStudents.some((student: any) => student.email === leave.applicant_email)
        );

        // Enrich leaves with student information
        const enrichedLeaves = studentLeaves.map((leave: any) => {
          const student = enrichedStudents.find((s: any) => s.email === leave.applicant_email);
          return {
            ...leave,
            fullname: student?.fullname ,
            email: student?.email ,
            section: student?.sec ,
            class_name: student?.class_name 
          };
        });

        setLeaves(enrichedLeaves);

        setLoading(false);
      } catch (error) {
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
      item.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.remarks?.toLowerCase().includes(searchTerm.toLowerCase());

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

  // Get grade distribution for charts
  const getGradeDistribution = () => {
    const distribution = {
      'A+ (90-100)': 0,
      'A (80-89)': 0,
      'B (70-79)': 0,
      'C (60-69)': 0,
      'D (50-59)': 0,
      'F (0-49)': 0
    };

    filteredGrades.forEach(grade => {
      const percentage = grade.percentage || 0;
      if (percentage >= 90) distribution['A+ (90-100)']++;
      else if (percentage >= 80) distribution['A (80-89)']++;
      else if (percentage >= 70) distribution['B (70-79)']++;
      else if (percentage >= 60) distribution['C (60-69)']++;
      else if (percentage >= 50) distribution['D (50-59)']++;
      else distribution['F (0-49)']++;
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return (
      <DashboardLayout role="parents">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your children's data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parents">
      <div className="min-h-screen bg-gray-50/30 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your children's academic progress and school activities</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Children</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{overallStats.totalStudents}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{overallStats.attendancePercentage}%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">{stats.present} present out of {stats.total}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{overallStats.avgGrade}%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leave Applications</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{overallStats.totalLeaves}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            {["overview", "attendance", "grades", "leaves"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Children Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  Your Children
                </h2>
                {selectedStudent !== "all" && (
                  <button
                    onClick={() => setSelectedStudent("all")}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition-colors"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student, index) => {
                  const studentStat = getStudentStats(student.email);
                  const isSelected = selectedStudent === student.email;
                  return (
                    <div 
                      key={index} 
                      onClick={() => setSelectedStudent(student.email)}
                      className={`border rounded-xl p-6 transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          isSelected ? "bg-blue-200" : "bg-blue-100"
                        }`}>
                          {student.profile_picture ? (
                            <img
                              src={student.profile_picture}
                              alt={student.fullname}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-8 w-8 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{student.fullname}</h3>
                          <p className="text-sm text-gray-600">{student.class_name}</p>
                          <p className="text-sm text-gray-600">{student.section}</p>
                          <p className="text-xs text-gray-500 mt-1">Roll No: {student.student_id}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{studentStat.percentage}%</p>
                          <p className="text-xs text-gray-600">Attendance</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">{studentStat.avgGrade}%</p>
                          <p className="text-xs text-gray-600">Avg Grade</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-orange-600">{studentStat.totalLeaves}</p>
                          <p className="text-xs text-gray-600">Leaves</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Attendance Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Present Days</span>
                    <span className="font-semibold text-green-600">{stats.present}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Absent Days</span>
                    <span className="font-semibold text-red-600">{stats.absent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overall Attendance</span>
                    <span className="font-semibold text-blue-600">{stats.percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Academic Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Grades</span>
                    <span className="font-semibold text-purple-600">{overallStats.totalGrades}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Performance</span>
                    <span className="font-semibold text-purple-600">{overallStats.avgGrade}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Leave Applications</span>
                    <span className="font-semibold text-orange-600">{overallStats.totalLeaves}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-600" />
                Attendance Records
              </h2>
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No attendance records found</h3>
                <p className="text-gray-600">
                  {attendanceData.length === 0 
                    ? "No attendance records available for your children."
                    : "Try adjusting your filters to find what you're looking for."
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredAttendance.map((record, index) => (
                  <div
                    key={index}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedRecord(expandedRecord === index ? null : index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {record.profile_picture ? (
                            <img
                              src={record.profile_picture}
                              alt={record.fullname}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{record.fullname}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                              record.status === "Present" 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                              {record.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <span>{record.class_name} - {record.section}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(record.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            {record.remarks && (
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="truncate">{record.remarks}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRecord(expandedRecord === index ? null : index);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {expandedRecord === index ? 
                            <ChevronUp className="h-4 w-4 text-gray-600" /> : 
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedRecord === index && (
                      <div className="mt-4 pl-16 border-t pt-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Record Details</h4>
                            <div className="space-y-2 text-sm">
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
                                <span className="text-gray-900 font-medium">{record.email}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Remarks</h4>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                              {record.remarks || "No additional remarks provided."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === "grades" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Award className="h-6 w-6 text-purple-600" />
                Academic Grades
              </h2>
            </div>

            {filteredGrades.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No grade records found</h3>
                <p className="text-gray-600">No grade records available for your children.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredGrades.map((grade, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          {/* Student Name and Subject Row */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{grade.subject_name}</h3>
                              <p className="text-sm text-gray-600">{grade.fullname}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border whitespace-nowrap ${
                              grade.percentage >= 80 ? "bg-green-50 text-green-700 border-green-200" :
                              grade.percentage >= 60 ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-red-50 text-red-700 border-red-200"
                            }`}>
                              {grade.percentage}%
                            </span>
                          </div>
                          
                          {/* Email and Class/Section Row */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span className="truncate" title={grade.email}>{grade.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <span>{grade.class_name} - {grade.section}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>{grade.exam_type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(grade.exam_date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Marks Row */}
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">Marks:</span> {grade.marks_obtained}/{grade.total_marks}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leaves Tab */}
        {activeTab === "leaves" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="h-6 w-6 text-orange-600" />
                Leave Applications
              </h2>
            </div>

            {filteredLeaves.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No leave records found</h3>
                <p className="text-gray-600">No leave applications found for your children.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredLeaves.map((leave, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setExpandedRecord(expandedRecord === index ? null : index)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header with Student Name and Status */}
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg">{leave.fullname}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            leave.status === "Approved" ? "bg-green-50 text-green-700 border-green-200" :
                            leave.status === "Pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {leave.status}
                          </span>
                        </div>
                        
                        {/* Main Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span><span className="font-medium text-gray-900">{leave.class_name}</span> - {leave.section}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="truncate" title={leave.email}>{leave.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{leave.start_date} to {leave.end_date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{leave.leave_type} Leave</span>
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="text-sm grid grid-cols-2">
                          <span className="text-gray-600 font-medium">Reason:   {leave.reason}</span>
                          {/* <p className="text-gray-700 mr-5"></p> */}
                        </div>
                      </div>

                      {/* Expand Button */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRecord(expandedRecord === index ? null : index);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {expandedRecord === index ? 
                            <ChevronUp className="h-4 w-4 text-gray-600" /> : 
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedRecord === index && (
                      <div className="mt-6 border-t pt-6">
                        <div className="grid md:grid-cols-4 gap-6">
                          {/* Student Information Section */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Student Information</h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium block">Name</span>
                                <span className="text-gray-900">{leave.fullname}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium block">Email</span>
                                <span className="text-gray-900 break-all">{leave.email}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium block">Class</span>
                                <span className="text-gray-900">{leave.class_name}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium block">Section</span>
                                <span className="text-gray-900">{leave.section}</span>
                              </div>
                            </div>
                          </div>

                          {/* Leave Details Section */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Leave Details</h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium block">Leave Type</span>
                                <span className="text-gray-900">{leave.leave_type}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium block">Start Date</span>
                                <span className="text-gray-900">{leave.start_date}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium block">End Date</span>
                                <span className="text-gray-900">{leave.end_date}</span>
                              </div>
                            </div>
                          </div>

                          {/* Approval Details Section */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Approval Details</h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium block">Status</span>
                                <span className={`font-semibold inline-block px-2 py-1 rounded ${
                                  leave.status === "Approved" ? "text-green-600 bg-green-50" :
                                  leave.status === "Pending" ? "text-yellow-600 bg-yellow-50" :
                                  "text-red-600 bg-red-50"
                                }`}>
                                  {leave.status}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium block">Approved By</span>
                                <span className="text-gray-900">{leave.approved_by || "Pending Approval"}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium block">Applied On</span>
                                <span className="text-gray-900">{new Date(leave.created_at).toLocaleDateString()}</span>
                              </div>
                              {leave.approved_at && (
                                <div>
                                  <span className="text-gray-600 font-medium block">Approved On</span>
                                  <span className="text-gray-900">{new Date(leave.approved_at).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Reason Section */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Additional Information</h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium block">Reason</span>
                                <p className="text-gray-700 bg-gray-50 p-2 rounded mt-1">{leave.reason}</p>
                              </div>
                              {leave.remarks && (
                                <div>
                                  <span className="text-gray-600 font-medium block">Remarks</span>
                                  <p className="text-gray-700 bg-gray-50 p-2 rounded mt-1">{leave.remarks}</p>
                                </div>
                              )}
                            </div>
                          </div>
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