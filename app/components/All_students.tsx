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

const API_BASE = "http://school.globaltechsoftwaresolutions.cloud";

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
        axios.get(`${API_BASE}/student_attendance/`).catch(err => { 
          return { data: [] }; 
        }),
        axios.get(`${API_BASE}/leaves/`).catch(err => { 
          return { data: [] }; 
        }),
        axios.get(`${API_BASE}/grades/?student=${student.email}`).catch(err => { 
          return { data: [] }; 
        }),
      ]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Students Grid View */}
        {!selectedStudent ? (
          <>
            {/* Header Section */}
            <div className="text-center mb-5 xs:mb-6 sm:mb-8 md:mb-10">
              <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 mb-2 xs:mb-3 sm:mb-4">
                <div className="p-2 xs:p-3 sm:p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl xs:rounded-2xl shadow-lg">
                  <GraduationCap className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Student Management
                </h1>
              </div>
              <p className="text-gray-600 text-xs xs:text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-3 xs:px-4">
                Comprehensive student monitoring and management system with advanced analytics
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl xs:rounded-2xl shadow-sm border border-gray-200 p-3 xs:p-4 sm:p-6 md:p-8 mb-3 xs:mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col lg:flex-row gap-3 xs:gap-4 sm:gap-6 items-stretch lg:items-center justify-between">
                <div className="flex-1 w-full lg:max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 xs:w-5 xs:h-5" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 xs:pl-10 pr-3 xs:pr-4 py-2 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col xs:flex-row flex-wrap gap-2 xs:gap-3 sm:gap-4 w-full lg:w-auto">
                  <div className="flex flex-wrap gap-2 xs:gap-3 sm:gap-4">
                    <select
                      value={classFilter}
                      onChange={(e) => {
                        setClassFilter(e.target.value);
                        setSectionFilter("all");
                      }}
                      className="flex-1 xs:flex-none px-3 xs:px-4 py-2 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white min-w-[140px] xs:min-w-[160px]"
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
                        className="flex-1 xs:flex-none px-3 xs:px-4 py-2 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white min-w-[140px] xs:min-w-[160px]"
                      >
                        <option value="all">All Sections</option>
                        {uniqueSectionsForSelectedClass.map(sec => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs xs:text-sm text-gray-600 px-1">
                    <Filter className="w-3 h-3 xs:w-4 xs:h-4" />
                    <span>{filteredStudents.length} students</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Students Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12 xs:py-16 sm:py-20 md:py-24">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 xs:h-12 xs:w-12 sm:h-16 sm:w-16 border-b-2 border-emerald-500 mx-auto mb-3 xs:mb-4"></div>
                  <p className="text-gray-600 text-sm xs:text-base">Loading student data...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
                {filteredStudents.map((student, index) => (
                  <div
                    key={student.id ?? student.email ?? index}
                    onClick={() => fetchStudentDetails(student)}
                    className="bg-white rounded-xl xs:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 xs:hover:-translate-y-2 cursor-pointer border border-gray-200/60 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-3 xs:p-4 sm:p-5 md:p-6 relative z-10">
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-3 xs:mb-4">
                          <img
                            src={student.profile_picture || "https://i.pravatar.cc/150?img=3"}
                            alt={student.fullname}
                            className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl xs:rounded-2xl border-4 border-white shadow-lg group-hover:border-emerald-100 transition-colors"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 xs:w-6 xs:h-6 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                        </div>
                        
                        <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-1 px-1 xs:px-2 break-all">
                          {student.fullname}
                        </h3>
                        
                        <p className="text-xs xs:text-sm sm:text-base text-emerald-600 font-semibold mt-1 px-1 xs:px-2">
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
                        
                        <p className="text-xs xs:text-sm text-gray-500 mt-2 line-clamp-1 px-1 xs:px-2 break-all">{student.email}</p>
                        
                        <div className="mt-3 xs:mt-4 flex gap-1 xs:gap-2 flex-wrap justify-center">
                          <span className="bg-blue-50 text-blue-700 text-xs xs:text-sm px-2 xs:px-3 py-1 xs:py-1.5 rounded-full font-medium border border-blue-200 break-all">
                            ID: {student.student_id}
                          </span>
                          {student.gender && (
                            <span className="bg-purple-50 text-purple-700 text-xs xs:text-sm px-2 xs:px-3 py-1 xs:py-1.5 rounded-full font-medium border border-purple-200">
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
              <div className="text-center py-10 xs:py-12 sm:py-16 md:py-20">
                <div className="bg-white rounded-xl xs:rounded-2xl p-4 xs:p-6 sm:p-8 md:p-12 max-w-md mx-auto shadow-lg border border-gray-200">
                  <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4">
                    <GraduationCap className="w-8 h-8 xs:w-10 xs:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-gray-700 font-semibold text-base xs:text-lg sm:text-xl mb-2">No Students Found</h3>
                  <p className="text-gray-500 text-sm xs:text-base mb-4">Try adjusting your search or filters</p>
                  <button
                    onClick={() => { setSearchTerm(""); setClassFilter("all"); }}
                    className="px-4 xs:px-6 py-2 xs:py-3 text-sm xs:text-base bg-emerald-500 text-white rounded-lg xs:rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          // ✅ Selected Student Details View - CARDS FORMAT
          <div className="space-y-3 xs:space-y-4 sm:space-y-6 md:space-y-8">
            {/* Header with Back and Actions */}
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-3 sm:gap-4">
              <button
                onClick={goBack}
                className="flex items-center gap-2 xs:gap-3 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors group text-xs xs:text-sm sm:text-base"
              >
                <div className="p-1 xs:p-2 bg-white rounded-lg xs:rounded-xl shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow">
                  <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5 group-hover:-translate-x-1 transition-transform" />
                </div>
                <span>Back to Students</span>
              </button>

              <div className="flex gap-2 xs:gap-3 w-full xs:w-auto mt-2 xs:mt-0">
                <button
                  onClick={exportStudentData}
                  className="flex items-center gap-1 xs:gap-2 px-3 xs:px-4 sm:px-6 py-2 xs:py-3 text-xs xs:text-sm sm:text-base bg-white border border-gray-300 text-gray-700 rounded-lg xs:rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex-1 xs:flex-none justify-center"
                >
                  <Download className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>

            {/* Student Header Card */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-xl xs:rounded-2xl p-4 xs:p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-3 xs:gap-4 sm:gap-6 md:gap-8">
                <div className="relative flex-shrink-0">
                  <img
                    src={selectedStudent.profile_picture || "https://i.pravatar.cc/150?img=9"}
                    alt={selectedStudent.fullname}
                    className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl xs:rounded-2xl border-4 border-white/80 shadow-2xl"
                  />
                  <div className="absolute -bottom-1 -right-1 xs:-bottom-2 xs:-right-2 w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-400 border-2 border-white rounded-full shadow-lg"></div>
                </div>
                
                <div className="flex-1 text-center lg:text-left w-full min-w-0 mt-3 xs:mt-0">
                  <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 break-words">{selectedStudent.fullname}</h1>
                  <p className="text-emerald-100 text-sm xs:text-base sm:text-lg md:text-xl mb-3 xs:mb-4 sm:mb-6 font-medium">
                    Class {selectedStudent.class_name} • Section {selectedStudent.section}
                  </p>
                  
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 text-xs xs:text-sm md:text-base">
                    <div className="flex items-center gap-1 xs:gap-2 justify-center lg:justify-start min-w-0">
                      <span className="font-semibold text-emerald-200 flex-shrink-0">Student ID:</span>
                      <span className="font-mono break-all">{selectedStudent.student_id}</span>
                    </div>
                    <div className="flex items-center gap-1 xs:gap-2 justify-center lg:justify-start min-w-0">
                      <Mail className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-emerald-200 flex-shrink-0" />
                      <span className="break-all">{selectedStudent.email}</span>
                    </div>
                    <div className="flex items-center gap-1 xs:gap-2 justify-center lg:justify-start">
                      <Phone className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-emerald-200 flex-shrink-0" />
                      <span className="break-all">{selectedStudent.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 xs:gap-2 justify-center lg:justify-start">
                      <span className="font-semibold text-emerald-200 flex-shrink-0">Gender:</span>
                      <span className="break-all">{selectedStudent.gender}</span>
                    </div>
                    <div className="flex items-center gap-1 xs:gap-2 justify-center lg:justify-start min-w-0">
                      <span className="font-semibold text-emerald-200 flex-shrink-0">DOB:</span>
                      <span className="break-all">{selectedStudent.date_of_birth}</span>
                    </div>
                    <div className="flex items-center gap-1 xs:gap-2 justify-center lg:justify-start">
                      <span className="font-semibold text-emerald-200 flex-shrink-0">Year:</span>
                      <span className="break-all">{selectedStudent.academic_year || "2024"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 min-[360px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-6">
              <div className="bg-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-gray-200 text-center group hover:shadow-xl transition-all">
                <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-emerald-50 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-2 xs:mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 xs:w-6 xs:h-6 text-emerald-600" />
                </div>
                <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600">{stats.attendancePercentage}%</div>
                <div className="text-xs xs:text-sm text-gray-600 font-medium">Attendance Rate</div>
              </div>
              
              <div className="bg-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-gray-200 text-center group hover:shadow-xl transition-all">
                <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-2 xs:mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 xs:w-6 xs:h-6 text-blue-600" />
                </div>
                <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{stats.totalSubjects}</div>
                <div className="text-xs xs:text-sm text-gray-600 font-medium">Subjects</div>
              </div>
              
              <div className="bg-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-gray-200 text-center group hover:shadow-xl transition-all">
                <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-purple-50 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-2 xs:mb-3 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5 xs:w-6 xs:h-6 text-purple-600" />
                </div>
                <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">{stats.averageGrade}</div>
                <div className="text-xs xs:text-sm text-gray-600 font-medium">Avg Grade</div>
              </div>
              
              <div className="bg-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-gray-200 text-center group hover:shadow-xl transition-all">
                <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-orange-50 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-2 xs:mb-3 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-5 h-5 xs:w-6 xs:h-6 text-orange-600" />
                </div>
                <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-orange-600">{stats.approvedLeaves}</div>
                <div className="text-xs xs:text-sm text-gray-600 font-medium">Approved Leaves</div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-xl xs:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto scrollbar-hide">
                  {["overview", "attendance", "leaves", "grades", "analytics"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-1 xs:gap-2 px-3 xs:px-4 sm:px-6 md:px-8 py-3 xs:py-4 font-medium text-xs xs:text-sm transition-all whitespace-nowrap border-b-2 flex-shrink-0 ${
                        activeTab === tab
                          ? "text-emerald-600 border-emerald-600 bg-emerald-50/50"
                          : "text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-50"
                      }`}
                    >
                      {tab === "overview" && <User className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />}
                      {tab === "attendance" && <Calendar className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />}
                      {tab === "leaves" && <Clock className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />}
                      {tab === "grades" && <Award className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />}
                      {tab === "analytics" && <BarChart3 className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />}
                      <span className="hidden xs:inline">{tab === "overview" && "Overview"}</span>
                      <span className="hidden xs:inline">{tab === "attendance" && "Attendance"}</span>
                      <span className="hidden xs:inline">{tab === "leaves" && "Leave History"}</span>
                      <span className="hidden xs:inline">{tab === "grades" && "Academic Performance"}</span>
                      <span className="hidden xs:inline">{tab === "analytics" && "Analytics"}</span>
                      <span className="xs:hidden">{tab === "overview" && "Overview"}</span>
                      <span className="xs:hidden">{tab === "attendance" && "Attend"}</span>
                      <span className="xs:hidden">{tab === "leaves" && "Leaves"}</span>
                      <span className="xs:hidden">{tab === "grades" && "Grades"}</span>
                      <span className="xs:hidden">{tab === "analytics" && "Stats"}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-3 xs:p-4 sm:p-6 md:p-8">
                {/* ✅ Overview Tab - CARDS FORMAT */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-6 md:gap-8">
                    {/* Personal Information Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 flex items-center gap-2 xs:gap-3">
                        <div className="p-1 xs:p-2 bg-emerald-100 rounded-lg xs:rounded-xl">
                          <User className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-emerald-600" />
                        </div>
                        Personal Information
                      </h3>
                      <div className="space-y-3 xs:space-y-4 sm:space-y-5">
                        {[
                          { label: "Full Name", value: selectedStudent.fullname },
                          { label: "Student ID", value: selectedStudent.student_id },
                          { label: "Class & Section", value: `${selectedStudent.class_name} - ${selectedStudent.section}` },
                          { label: "Gender", value: selectedStudent.gender },
                          { label: "Date of Birth", value: selectedStudent.date_of_birth },
                          { label: "Blood Group", value: selectedStudent.blood_group || "N/A" }
                        ].map((item, index) => (
                          <div key={index} className="flex flex-col xs:flex-row xs:justify-between xs:items-center py-1 xs:py-2 border-b border-gray-100 last:border-b-0 gap-1 xs:gap-0">
                            <span className="text-gray-600 font-medium text-sm xs:text-base">{item.label}:</span>
                            <span className="font-semibold text-gray-800 text-sm xs:text-base break-words">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 flex items-center gap-2 xs:gap-3">
                        <div className="p-1 xs:p-2 bg-blue-100 rounded-lg xs:rounded-xl">
                          <Phone className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        Contact Information
                      </h3>
                      <div className="space-y-3 xs:space-y-4 sm:space-y-5">
                        <div className="flex items-center gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-white rounded-lg xs:rounded-xl border border-gray-200">
                          <Mail className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs xs:text-sm text-gray-500">Email</div>
                            <div className="font-semibold text-sm xs:text-base break-words">{selectedStudent.email || "N/A"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-white rounded-lg xs:rounded-xl border border-gray-200">
                          <Phone className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs xs:text-sm text-gray-500">Phone</div>
                            <div className="font-semibold text-sm xs:text-base break-all">{selectedStudent.phone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-white rounded-lg xs:rounded-xl border border-gray-200">
                          <MapPin className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs xs:text-sm text-gray-500">Residential Address</div>
                            <div className="font-semibold text-sm xs:text-base break-words">{selectedStudent.residential_address || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Overview Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm lg:col-span-2">
                      <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 flex items-center gap-2 xs:gap-3">
                        <div className="p-1 xs:p-2 bg-purple-100 rounded-lg xs:rounded-xl">
                          <TrendingUp className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                        Performance Overview
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-6">
                        {[
                          { value: stats.presentDays, label: "Days Present", color: "text-emerald-600", bg: "bg-emerald-50" },
                          { value: stats.absentDays, label: "Days Absent", color: "text-red-600", bg: "bg-red-50" },
                          { value: stats.totalSubjects, label: "Subjects", color: "text-blue-600", bg: "bg-blue-50" },
                          { value: stats.averageGrade, label: "Avg Grade", color: "text-purple-600", bg: "bg-purple-50" }
                        ].map((stat, index) => (
                          <div key={index} className={`p-2 xs:p-3 sm:p-4 md:p-6 rounded-lg xs:rounded-xl ${stat.bg} text-center group hover:scale-105 transition-transform`}>
                            <div className={`text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${stat.color} mb-1 xs:mb-2`}>{stat.value}</div>
                            <div className="text-xs xs:text-sm text-gray-600 font-medium">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Attendance Tab - CARDS FORMAT */}
                {activeTab === "attendance" && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 xs:mb-4 sm:mb-6 gap-3 xs:gap-4 sm:gap-6">
                      <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 xs:gap-3">
                        <div className="p-1 xs:p-2 bg-emerald-100 rounded-lg xs:rounded-xl">
                          <Calendar className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-emerald-600" />
                        </div>
                        Attendance Records
                      </h3>
                      <div className="flex gap-2 xs:gap-3 w-full lg:w-auto">
                        <select
                          value={attendanceFilter}
                          onChange={(e) => setAttendanceFilter(e.target.value)}
                          className="px-3 xs:px-4 py-2 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white flex-1 lg:flex-none"
                        >
                          <option value="all">All Status</option>
                          <option value="present">Present Only</option>
                          <option value="absent">Absent Only</option>
                        </select>
                      </div>
                    </div>

                    {loading ? (
                      <div className="flex justify-center items-center py-8 xs:py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 xs:h-8 xs:w-8 border-b-2 border-emerald-500 mx-auto mb-2 xs:mb-3"></div>
                          <p className="text-gray-500 text-sm xs:text-base">Loading attendance records...</p>
                        </div>
                      </div>
                    ) : attendance.length > 0 ? (
                      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                        {attendance
                          .filter(record => 
                            attendanceFilter === "all" || 
                            (attendanceFilter === "present" && record.status === "Present") ||
                            (attendanceFilter === "absent" && record.status === "Absent")
                          )
                          .map((record, index) => (
                          <div key={index} className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-2 xs:mb-3">
                              <span className="text-sm xs:text-base font-semibold text-gray-800 break-all">{record.date}</span>
                              <span className={`inline-flex items-center px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-semibold ${
                                record.status === "Present" 
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}>
                                {record.status === "Present" ? (
                                  <CheckCircle className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />
                                ) : (
                                  <XCircle className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />
                                )}
                                {record.status}
                              </span>
                            </div>
                            <div className="space-y-1 xs:space-y-2 text-xs xs:text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Day:</span>
                                <span className="font-medium break-all">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Check-in:</span>
                                <span className="font-medium break-all">{record.check_in_time || "Not recorded"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 xs:py-12">
                        <div className="w-12 h-12 xs:w-16 xs:h-16 bg-gray-100 rounded-lg xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4">
                          <Calendar className="w-6 h-6 xs:w-8 xs:h-8 text-gray-400" />
                        </div>
                        <h4 className="text-gray-700 font-semibold text-sm xs:text-base mb-1 xs:mb-2">No Attendance Records</h4>
                        <p className="text-gray-500 text-xs xs:text-sm">No attendance records found for this student.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Leaves Tab - CARDS FORMAT */}
                {activeTab === "leaves" && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 flex items-center gap-2 xs:gap-3">
                      <div className="p-1 xs:p-2 bg-orange-100 rounded-lg xs:rounded-xl">
                        <Clock className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-orange-600" />
                      </div>
                      Leave History
                    </h3>
                    {loading ? (
                      <div className="flex justify-center items-center py-8 xs:py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 xs:h-8 xs:w-8 border-b-2 border-emerald-500 mx-auto mb-2 xs:mb-3"></div>
                          <p className="text-gray-500 text-sm xs:text-base">Loading leave records...</p>
                        </div>
                      </div>
                    ) : leaves.length > 0 ? (
                      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                        {leaves.map((leave, index) => (
                          <div key={index} className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-2 xs:mb-3">
                              <span className="text-sm xs:text-base font-semibold text-gray-800 break-all">{leave.leave_type}</span>
                              <span className={`inline-flex items-center px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-semibold ${
                                leave.status === "Approved" 
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : leave.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}>
                                {leave.status === "Approved" && <CheckCircle className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />}
                                {leave.status === "Pending" && <Clock4 className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />}
                                {leave.status === "Rejected" && <XCircle className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />}
                                {leave.status}
                              </span>
                            </div>
                            <div className="space-y-1 xs:space-y-2 text-xs xs:text-sm text-gray-600 mb-3 xs:mb-4">
                              <div className="flex justify-between">
                                <span>From:</span>
                                <span className="font-medium break-all">{leave.start_date}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>To:</span>
                                <span className="font-medium break-all">{leave.end_date}</span>
                              </div>
                            </div>
                            <div className="text-xs xs:text-sm text-gray-700">
                              <div className="font-medium mb-1 xs:mb-2">Reason:</div>
                              <div className="line-clamp-2 break-words">{leave.reason}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 xs:py-12">
                        <div className="w-12 h-12 xs:w-16 xs:h-16 bg-gray-100 rounded-lg xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4">
                          <Clock className="w-6 h-6 xs:w-8 xs:h-8 text-gray-400" />
                        </div>
                        <h4 className="text-gray-700 font-semibold text-sm xs:text-base mb-1 xs:mb-2">No Leave Records</h4>
                        <p className="text-gray-500 text-xs xs:text-sm">No leave records found for this student.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Grades Tab - CARDS FORMAT */}
                {activeTab === "grades" && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 flex items-center gap-2 xs:gap-3">
                      <div className="p-1 xs:p-2 bg-purple-100 rounded-lg xs:rounded-xl">
                        <Award className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-purple-600" />
                      </div>
                      Academic Performance
                    </h3>
                    {loading ? (
                      <div className="flex justify-center items-center py-8 xs:py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 xs:h-8 xs:w-8 border-b-2 border-emerald-500 mx-auto mb-2 xs:mb-3"></div>
                          <p className="text-gray-500 text-sm xs:text-base">Loading grade records...</p>
                        </div>
                      </div>
                    ) : grades.length > 0 ? (
                      <div className="space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-8">
                        {/* Grades Cards */}
                        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                          {grades.map((grade, index) => (
                            <div key={index} className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                              <div className="text-center mb-3 xs:mb-4">
                                <div className="text-lg xs:text-xl sm:text-2xl font-bold text-purple-600 mb-1 xs:mb-2">{grade.marks_obtained}</div>
                                <div className="text-xs xs:text-sm text-gray-500">Grade</div>
                              </div>
                              <div className="space-y-2 xs:space-y-3 text-xs xs:text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Subject:</span>
                                  <span className="font-semibold text-gray-800 break-all">{grade.subject_name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total Marks:</span>
                                  <span className="font-semibold text-gray-800 break-all">{grade.total_marks}</span>
                                </div>
                                {grade.remarks && (
                                  <div>
                                    <div className="text-gray-600 mb-1 xs:mb-2">Remarks:</div>
                                    <div className="text-gray-700 text-xs xs:text-sm line-clamp-2 break-words">{grade.remarks}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Performance Summary Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                          <div className="bg-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm">
                            <h4 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-800 mb-3 xs:mb-4 sm:mb-6">Performance Summary</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
                              {[
                                { value: stats.totalSubjects, label: "Total Subjects", color: "text-blue-600", bg: "bg-blue-50" },
                                { value: stats.averageGrade, label: "Average Grade", color: "text-purple-600", bg: "bg-purple-50" },
                                { value: stats.excellentGrades, label: "Excellent (A)", color: "text-emerald-600", bg: "bg-emerald-50" },
                                { value: stats.goodGrades, label: "Good (B)", color: "text-green-600", bg: "bg-green-50" },
                                { value: stats.averageGrades, label: "Average (C)", color: "text-yellow-600", bg: "bg-yellow-50" },
                                { value: stats.poorGrades, label: "Needs Improvement", color: "text-red-600", bg: "bg-red-50" }
                              ].map((stat, index) => (
                                <div key={index} className={`p-2 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl ${stat.bg} text-center group hover:scale-105 transition-transform`}>
                                  <div className={`text-base xs:text-lg sm:text-xl md:text-2xl font-bold ${stat.color} mb-1 xs:mb-2`}>{stat.value}</div>
                                  <div className="text-xs xs:text-sm text-gray-600 font-medium">{stat.label}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm">
                            <h4 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-800 mb-3 xs:mb-4 sm:mb-6">Grade Distribution</h4>
                            <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                              {[
                                { label: "Excellent (4.0+)", count: stats.excellentGrades, color: "bg-emerald-500", width: (stats.excellentGrades / stats.totalSubjects) * 100 },
                                { label: "Good (3.0-3.9)", count: stats.goodGrades, color: "bg-green-500", width: (stats.goodGrades / stats.totalSubjects) * 100 },
                                { label: "Average (2.0-2.9)", count: stats.averageGrades, color: "bg-yellow-500", width: (stats.averageGrades / stats.totalSubjects) * 100 },
                                { label: "Needs Improvement (<2.0)", count: stats.poorGrades, color: "bg-red-500", width: (stats.poorGrades / stats.totalSubjects) * 100 }
                              ].map((item, index) => (
                                <div key={index} className="space-y-1 xs:space-y-2">
                                  <div className="flex justify-between text-sm xs:text-base">
                                    <span className="text-gray-600 break-all">{item.label}</span>
                                    <span className="font-semibold break-all">{item.count}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 xs:h-3">
                                    <div
                                      className={`h-2 xs:h-3 rounded-full ${item.color} transition-all duration-500`}
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
                      <div className="text-center py-8 xs:py-12">
                        <div className="w-12 h-12 xs:w-16 xs:h-16 bg-gray-100 rounded-lg xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4">
                          <Award className="w-6 h-6 xs:w-8 xs:h-8 text-gray-400" />
                        </div>
                        <h4 className="text-gray-700 font-semibold text-sm xs:text-base mb-1 xs:mb-2">No Grade Records</h4>
                        <p className="text-gray-500 text-xs xs:text-sm">No grade records found for this student.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Analytics Tab - CARDS FORMAT */}
                {activeTab === "analytics" && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 flex items-center gap-2 xs:gap-3">
                      <div className="p-1 xs:p-2 bg-indigo-100 rounded-lg xs:rounded-xl">
                        <BarChart3 className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-indigo-600" />
                      </div>
                      Student Analytics
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                      {/* Attendance Analytics Card */}
                      <div className="bg-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-800 mb-3 xs:mb-4 sm:mb-6">Attendance Overview</h4>
                        <div className="space-y-3 xs:space-y-4 sm:space-y-5">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm xs:text-base">Total Days Recorded</span>
                            <span className="font-semibold text-sm xs:text-base">{stats.totalDays}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm xs:text-base">Present Days</span>
                            <span className="font-semibold text-emerald-600 text-sm xs:text-base">{stats.presentDays}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm xs:text-base">Absent Days</span>
                            <span className="font-semibold text-red-600 text-sm xs:text-base">{stats.absentDays}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 xs:h-4 mt-2 xs:mt-3">
                            <div
                              className="h-3 xs:h-4 rounded-full bg-emerald-500 transition-all duration-500"
                              style={{ width: `${stats.attendancePercentage}%` }}
                            ></div>
                          </div>
                          <div className="text-center text-sm xs:text-base text-gray-600">
                            Attendance Rate: <span className="font-semibold">{stats.attendancePercentage}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Academic Analytics Card */}
                      <div className="bg-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-800 mb-3 xs:mb-4 sm:mb-6">Academic Summary</h4>
                        <div className="space-y-3 xs:space-y-4 sm:space-y-5">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm xs:text-base">Subjects Enrolled</span>
                            <span className="font-semibold text-sm xs:text-base">{stats.totalSubjects}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm xs:text-base">Average Grade</span>
                            <span className="font-semibold text-purple-600 text-sm xs:text-base">{stats.averageGrade}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm xs:text-base">Performance Level</span>
                           <span
  className={`font-semibold text-sm xs:text-base ${
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

                      {/* Leave Analytics Card */}
                      <div className="bg-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm lg:col-span-2">
                        <h4 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-800 mb-3 xs:mb-4 sm:mb-6">Leave Statistics</h4>
                        <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 md:gap-6">
                          <div className="text-center p-3 xs:p-4 sm:p-6 bg-emerald-50 rounded-lg xs:rounded-2xl">
                            <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600">{stats.approvedLeaves}</div>
                            <div className="text-xs xs:text-sm text-gray-600">Approved</div>
                          </div>
                          <div className="text-center p-3 xs:p-4 sm:p-6 bg-yellow-50 rounded-lg xs:rounded-2xl">
                            <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600">{stats.pendingLeaves}</div>
                            <div className="text-xs xs:text-sm text-gray-600">Pending</div>
                          </div>
                          <div className="text-center p-3 xs:p-4 sm:p-6 bg-blue-50 rounded-lg xs:rounded-2xl">
                            <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{stats.approvedLeaves + stats.pendingLeaves}</div>
                            <div className="text-xs xs:text-sm text-gray-600">Total Leaves</div>
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