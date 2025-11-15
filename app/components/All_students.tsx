"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  Download,
  Filter,
  Search,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock4,
  GraduationCap
} from "lucide-react";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

const StudentsPage = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [attendanceFilter, setAttendanceFilter] = useState("all");

  // Fetch students and classes initially
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsRes, classesRes] = await Promise.all([
          axios.get(`${API_BASE}/students/`),
          axios.get(`${API_BASE}/classes/`)
        ]);

        setStudents(studentsRes.data || []);
        setClasses(classesRes.data || []);
      } catch (error) {
        console.error("Error fetching students/classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch student details dynamically
  const fetchStudentDetails = async (student: any) => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      const [attendanceRes, leavesRes, gradesRes] = await Promise.all([
        // Use student_attendance API for student records
        axios.get(`${API_BASE}/student_attendance/`).catch(err => { 
          console.log('student_attendance API failed:', err.message); 
          return { data: [] }; 
        }),

        axios.get(`${API_BASE}/leaves/`).catch(err => { 
          console.log('Leaves API failed:', err.message); 
          return { data: [] }; 
        }),
        axios.get(`${API_BASE}/grades/?student=${student.email}`).catch(err => { 
          console.log('Grades API failed:', err.message); 
          return { data: [] }; 
        }),
      ]);

      // student_attendance rows have: student (email), student_name, class_id, class_name, section, date, status, created_time
      const studentAttendance = (attendanceRes.data || []).filter((a: any) => {
        const email = student.email?.toLowerCase();
        if (!email) return false;

        const recordEmail = a.student?.toLowerCase();
        return recordEmail === email;
      });

      const studentLeaves = (leavesRes.data || []).filter(
        (l: any) => l.applicant_email === student.email
      );

      const studentGrades = gradesRes.data || [];

      setAttendance(studentAttendance);
      setLeaves(studentLeaves);
      setGrades(studentGrades);
    } catch (error) {
      console.error("Error fetching student details:", error);
      setAttendance([]);
      setLeaves([]);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setSelectedStudent(null);
    setAttendance([]);
    setLeaves([]);
    setGrades([]);
    setActiveTab("overview");
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === "Present").length;
    const absentDays = attendance.filter(a => a.status === "Absent").length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;
    
    const approvedLeaves = leaves.filter(l => l.status === "Approved").length;
    const pendingLeaves = leaves.filter(l => l.status === "Pending").length;
    
    const averageGrade = grades.length > 0 
      ? (grades.reduce((sum, grade) => sum + parseFloat(grade.grade || 0), 0) / grades.length).toFixed(1)
      : 0;

    // Calculate grade distribution
    const excellentGrades = grades.filter(g => parseFloat(g.grade) >= 4.0).length;
    const goodGrades = grades.filter(g => parseFloat(g.grade) >= 3.0 && parseFloat(g.grade) < 4.0).length;
    const averageGrades = grades.filter(g => parseFloat(g.grade) >= 2.0 && parseFloat(g.grade) < 3.0).length;
    const poorGrades = grades.filter(g => parseFloat(g.grade) < 2.0).length;

    return {
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage,
      approvedLeaves,
      pendingLeaves,
      averageGrade,
      totalSubjects: grades.length,
      excellentGrades,
      goodGrades,
      averageGrades,
      poorGrades
    };
  };

  const stats = selectedStudent ? calculateStats() : {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    attendancePercentage: 0,
    approvedLeaves: 0,
    pendingLeaves: 0,
    averageGrade: 0,
    totalSubjects: 0,
    excellentGrades: 0,
    goodGrades: 0,
    averageGrades: 0,
    poorGrades: 0
  };

  // Helper: resolve class info from classes list using class_id
  const getClassInfoForStudent = (student: any) => {
    if (!student?.class_id) return null;
    return classes.find((cls: any) => cls.id === student.class_id) || null;
  };

  // Get unique classes for filter from classes API
  const uniqueClasses = [...new Set(classes.map((cls: any) => cls.class_name).filter(Boolean))];

  // Get sections for the selected class
  const uniqueSectionsForSelectedClass = classFilter === "all"
    ? []
    : [...new Set(
        classes
          .filter((cls: any) => cls.class_name === classFilter)
          .map((cls: any) => cls.sec)
          .filter(Boolean)
      )];

  // Filter students based on search, class and section (via class_id -> classes)
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const classInfo = getClassInfoForStudent(student);
    const className = classInfo?.class_name;
    const section = classInfo?.sec;

    const matchesClass = classFilter === "all" || className === classFilter;
    const matchesSection =
      sectionFilter === "all" || sectionFilter === "" || section === sectionFilter;

    return matchesSearch && matchesClass && matchesSection;
  });

  // Export student data
  const exportStudentData = () => {
    const data = {
      student: selectedStudent,
      attendance,
      leaves,
      grades,
      stats
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedStudent.fullname}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Students Grid View */}
          {!selectedStudent ? (
            <>
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Student Management
                  </h1>
                </div>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Comprehensive student monitoring and management system with advanced analytics
                </p>
              </div>

              {/* Search and Filter Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 w-full lg:max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search students by name, email, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="flex flex-wrap gap-3">
                      <select
                        value={classFilter}
                        onChange={(e) => {
                          setClassFilter(e.target.value);
                          setSectionFilter("all");
                        }}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      >
                        <option value="all">Select Class</option>
                        {uniqueClasses.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>

                      {classFilter !== "all" && (
                        <select
                          value={sectionFilter}
                          onChange={(e) => setSectionFilter(e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                        >
                          <option value="all">All Sections</option>
                          {uniqueSectionsForSelectedClass.map(sec => (
                            <option key={sec} value={sec}>{sec}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Filter className="w-4 h-4" />
                      <span>{filteredStudents.length} students</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Students Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading student data...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredStudents.map((student, index) => (
                    <div
                      key={student.id ?? student.email ?? index}

                      onClick={() => fetchStudentDetails(student)}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200/60 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="p-6 relative z-10">
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-4">
                            <img
                              src={student.profile_picture || "https://i.pravatar.cc/150?img=3"}
                              alt={student.fullname}
                              className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg group-hover:border-emerald-100 transition-colors"
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                            {student.fullname}
                          </h3>
                          
                          <p className="text-sm text-emerald-600 font-semibold mt-1">
                            {(() => {
                              const classInfo = getClassInfoForStudent(student);
                              if (!classInfo) return "Class info unavailable";

                              return (
                                <>
                                  {classInfo.class_name && <>Class {classInfo.class_name}</>}
                                  {classInfo.class_name && classInfo.sec && " • "}
                                  {classInfo.sec && <>Sec {classInfo.sec}</>}
                                </>
                              );
                            })()}
                          </p>
                          
                          <p className="text-xs text-gray-500 mt-2 line-clamp-1">{student.email}</p>
                          
                          <div className="mt-4 flex gap-2 flex-wrap justify-center">
                            <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium border border-blue-200">
                              ID: {student.student_id}
                            </span>
                            {student.gender && (
                              <span className="bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-full font-medium border border-purple-200">
                                {student.gender}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && filteredStudents.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-lg border border-gray-200">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-gray-700 font-semibold text-lg mb-2">No Students Found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                    <button
                      onClick={() => { setSearchTerm(""); setClassFilter("all"); }}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // ✅ Selected Student Details View
            <div className="space-y-6">
              {/* Header with Back and Actions */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <button
                  onClick={goBack}
                  className="flex items-center gap-3 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors group"
                >
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </div>
                  <span>Back to Students</span>
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={exportStudentData}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                </div>
              </div>

              {/* Student Header */}
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-6">
                  <div className="relative">
                    <img
                      src={selectedStudent.profile_picture || "https://i.pravatar.cc/150?img=9"}
                      alt={selectedStudent.fullname}
                      className="w-32 h-32 rounded-2xl border-4 border-white/80 shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 border-2 border-white rounded-full shadow-lg"></div>
                  </div>
                  
                  <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-3xl font-bold mb-2">{selectedStudent.fullname}</h1>
                    <p className="text-emerald-100 text-lg mb-4 font-medium">
                      Class {selectedStudent.class_name} • Section {selectedStudent.section}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-200">Student ID:</span>
                        <span className="font-mono">{selectedStudent.student_id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-200" />
                        <span>{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-200" />
                        <span>{selectedStudent.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-200">Gender:</span>
                        <span>{selectedStudent.gender}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-200">Date of Birth:</span>
                        <span>{selectedStudent.date_of_birth}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-200">Academic Year:</span>
                        <span>{selectedStudent.academic_year || "2024"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center group hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">{stats.attendancePercentage}%</div>
                  <div className="text-sm text-gray-600 font-medium">Attendance Rate</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center group hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalSubjects}</div>
                  <div className="text-sm text-gray-600 font-medium">Subjects</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center group hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{stats.averageGrade}</div>
                  <div className="text-sm text-gray-600 font-medium">Avg Grade</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center group hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{stats.approvedLeaves}</div>
                  <div className="text-sm text-gray-600 font-medium">Approved Leaves</div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                  <nav className="flex overflow-x-auto">
                    {["overview", "attendance", "leaves", "grades", "analytics"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 px-8 py-4 font-medium text-sm transition-all whitespace-nowrap border-b-2 ${
                          activeTab === tab
                            ? "text-emerald-600 border-emerald-600 bg-emerald-50/50"
                            : "text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-50"
                        }`}
                      >
                        {tab === "overview" && <User className="w-4 h-4" />}
                        {tab === "attendance" && <Calendar className="w-4 h-4" />}
                        {tab === "leaves" && <Clock className="w-4 h-4" />}
                        {tab === "grades" && <Award className="w-4 h-4" />}
                        {tab === "analytics" && <BarChart3 className="w-4 h-4" />}
                        {tab === "overview" && "Overview"}
                        {tab === "attendance" && "Attendance"}
                        {tab === "leaves" && "Leave History"}
                        {tab === "grades" && "Academic Performance"}
                        {tab === "analytics" && "Analytics"}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* ✅ Overview Tab */}
                  {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-xl">
                            <User className="w-5 h-5 text-emerald-600" />
                          </div>
                          Personal Information
                        </h3>
                        <div className="space-y-4">
                          {[
                            { label: "Full Name", value: selectedStudent.fullname },
                            { label: "Student ID", value: selectedStudent.student_id },
                            { label: "Class & Section", value: `${selectedStudent.class_name} - ${selectedStudent.section}` },
                            { label: "Gender", value: selectedStudent.gender },
                            { label: "Date of Birth", value: selectedStudent.date_of_birth },
                            { label: "Blood Group", value: selectedStudent.blood_group || "N/A" }
                          ].map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <span className="text-gray-600 font-medium">{item.label}:</span>
                              <span className="font-semibold text-gray-800">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <Phone className="w-5 h-5 text-blue-600" />
                          </div>
                          Contact Information
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">Email</div>
                              <div className="font-semibold">{selectedStudent.email || "N/A"}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">Phone</div>
                              <div className="font-semibold">{selectedStudent.phone}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">Residential Address</div>
                              <div className="font-semibold">{selectedStudent.residential_address || "N/A"}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm lg:col-span-2">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                          </div>
                          Performance Overview
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { value: stats.presentDays, label: "Days Present", color: "text-emerald-600", bg: "bg-emerald-50" },
                            { value: stats.absentDays, label: "Days Absent", color: "text-red-600", bg: "bg-red-50" },
                            { value: stats.totalSubjects, label: "Subjects", color: "text-blue-600", bg: "bg-blue-50" },
                            { value: stats.averageGrade, label: "Avg Grade", color: "text-purple-600", bg: "bg-purple-50" }
                          ].map((stat, index) => (
                            <div key={index} className={`p-4 rounded-2xl ${stat.bg} text-center group hover:scale-105 transition-transform`}>
                              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ✅ Attendance Tab */}
                  {activeTab === "attendance" && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-xl">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                          </div>
                          Attendance Records
                        </h3>
                        <div className="flex gap-2">
                          <select
                            value={attendanceFilter}
                            onChange={(e) => setAttendanceFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm"
                          >
                            <option value="all">All Status</option>
                            <option value="present">Present Only</option>
                            <option value="absent">Absent Only</option>
                          </select>
                        </div>
                      </div>

                      {loading ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
                            <p className="text-gray-500">Loading attendance records...</p>
                          </div>
                        </div>
                      ) : attendance.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  {["Date", "Day", "Status", "Check-in Time"].map((header) => (
                                    <th
                                      key={header}
                                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {attendance
                                  .filter(record => 
                                    attendanceFilter === "all" || 
                                    (attendanceFilter === "present" && record.status === "Present") ||
                                    (attendanceFilter === "absent" && record.status === "Absent")
                                  )
                                  .map((record, index) => (
                                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {record.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                        record.status === "Present" 
                                          ? "bg-green-100 text-green-800 border border-green-200"
                                          : "bg-red-100 text-red-800 border border-red-200"
                                      }`}>
                                        {record.status === "Present" ? (
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                        ) : (
                                          <XCircle className="w-3 h-3 mr-1" />
                                        )}
                                        {record.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                      {record.check_in_time || (
                                        <span className="text-gray-400">Not recorded</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-gray-700 font-semibold mb-2">No Attendance Records</h4>
                          <p className="text-gray-500">No attendance records found for this student.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ✅ Leaves Tab */}
                  {activeTab === "leaves" && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-xl">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        Leave History
                      </h3>
                      {loading ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
                            <p className="text-gray-500">Loading leave records...</p>
                          </div>
                        </div>
                      ) : leaves.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  {["Leave Type", "Start Date", "End Date", "Reason", "Status"].map((header) => (
                                    <th
                                      key={header}
                                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {leaves.map((leave, index) => (
                                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {leave.leave_type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                      {leave.start_date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                      {leave.end_date}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                      <div className="line-clamp-2">{leave.reason}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                        leave.status === "Approved" 
                                          ? "bg-green-100 text-green-800 border border-green-200"
                                          : leave.status === "Pending"
                                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                          : "bg-red-100 text-red-800 border border-red-200"
                                      }`}>
                                        {leave.status === "Approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                                        {leave.status === "Pending" && <Clock4 className="w-3 h-3 mr-1" />}
                                        {leave.status === "Rejected" && <XCircle className="w-3 h-3 mr-1" />}
                                        {leave.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-gray-700 font-semibold mb-2">No Leave Records</h4>
                          <p className="text-gray-500">No leave records found for this student.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ✅ Grades Tab */}
                  {activeTab === "grades" && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-xl">
                          <Award className="w-5 h-5 text-purple-600" />
                        </div>
                        Academic Performance
                      </h3>
                      {loading ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
                            <p className="text-gray-500">Loading grade records...</p>
                          </div>
                        </div>
                      ) : grades.length > 0 ? (
                        <div className="space-y-6">
                          {/* Grades Table */}
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="min-w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    {["Subject", "TotalMarks", "Grade", "Remarks"].map((header) => (
                                      <th
                                        key={header}
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                      >
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {grades.map((grade, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {grade.subject_name}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {grade.total_marks}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                          {grade.marks_obtained}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-600">
                                        {grade.remarks || (
                                          <span className="text-gray-400">No remarks</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          
                          {/* Performance Summary */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                              <h4 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {[
                                  { value: stats.totalSubjects, label: "Total Subjects", color: "text-blue-600", bg: "bg-blue-50" },
                                  { value: stats.averageGrade, label: "Average Grade", color: "text-purple-600", bg: "bg-purple-50" },
                                  { value: stats.excellentGrades, label: "Excellent (A)", color: "text-emerald-600", bg: "bg-emerald-50" },
                                  { value: stats.goodGrades, label: "Good (B)", color: "text-green-600", bg: "bg-green-50" },
                                  { value: stats.averageGrades, label: "Average (C)", color: "text-yellow-600", bg: "bg-yellow-50" },
                                  { value: stats.poorGrades, label: "Needs Improvement", color: "text-red-600", bg: "bg-red-50" }
                                ].map((stat, index) => (
                                  <div key={index} className={`p-3 rounded-xl ${stat.bg} text-center group hover:scale-105 transition-transform`}>
                                    <div className={`text-xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                                    <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                              <h4 className="text-lg font-semibold text-gray-800 mb-4">Grade Distribution</h4>
                              <div className="space-y-3">
                                {[
                                  { label: "Excellent (4.0+)", count: stats.excellentGrades, color: "bg-emerald-500", width: (stats.excellentGrades / stats.totalSubjects) * 100 },
                                  { label: "Good (3.0-3.9)", count: stats.goodGrades, color: "bg-green-500", width: (stats.goodGrades / stats.totalSubjects) * 100 },
                                  { label: "Average (2.0-2.9)", count: stats.averageGrades, color: "bg-yellow-500", width: (stats.averageGrades / stats.totalSubjects) * 100 },
                                  { label: "Needs Improvement (<2.0)", count: stats.poorGrades, color: "bg-red-500", width: (stats.poorGrades / stats.totalSubjects) * 100 }
                                ].map((item, index) => (
                                  <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">{item.label}</span>
                                      <span className="font-semibold">{item.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                                        style={{ width: `${item.width}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-gray-700 font-semibold mb-2">No Grade Records</h4>
                          <p className="text-gray-500">No grade records found for this student.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ✅ Analytics Tab */}
                  {activeTab === "analytics" && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                          <BarChart3 className="w-5 h-5 text-indigo-600" />
                        </div>
                        Student Analytics
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Attendance Analytics */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">Attendance Overview</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Total Days Recorded</span>
                              <span className="font-semibold">{stats.totalDays}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Present Days</span>
                              <span className="font-semibold text-emerald-600">{stats.presentDays}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Absent Days</span>
                              <span className="font-semibold text-red-600">{stats.absentDays}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                              <div
                                className="h-3 rounded-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${stats.attendancePercentage}%` }}
                              ></div>
                            </div>
                            <div className="text-center text-sm text-gray-600">
                              Attendance Rate: <span className="font-semibold">{stats.attendancePercentage}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Academic Analytics */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">Academic Summary</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Subjects Enrolled</span>
                              <span className="font-semibold">{stats.totalSubjects}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Average Grade</span>
                              <span className="font-semibold text-purple-600">{stats.averageGrade}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Performance Level</span>
                             <span
  className={`font-semibold ${
    parseFloat(String(stats.averageGrade)) >= 3.5
      ? "text-emerald-600"
      : parseFloat(String(stats.averageGrade)) >= 2.5
      ? "text-yellow-600"
      : "text-red-600"
  }`}
>
  {parseFloat(String(stats.averageGrade)) >= 3.5
    ? "Excellent"
    : parseFloat(String(stats.averageGrade)) >= 2.5
    ? "Average"
    : "Needs Improvement"}
</span>

                            </div>
                          </div>
                        </div>

                        {/* Leave Analytics */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm lg:col-span-2">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">Leave Statistics</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-emerald-50 rounded-xl">
                              <div className="text-2xl font-bold text-emerald-600">{stats.approvedLeaves}</div>
                              <div className="text-sm text-gray-600">Approved</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-xl">
                              <div className="text-2xl font-bold text-yellow-600">{stats.pendingLeaves}</div>
                              <div className="text-sm text-gray-600">Pending</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-xl">
                              <div className="text-2xl font-bold text-blue-600">{stats.approvedLeaves + stats.pendingLeaves}</div>
                              <div className="text-sm text-gray-600">Total Leaves</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    
  );
};

export default StudentsPage;