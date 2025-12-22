"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
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

interface Student {
  id?: number;
  email?: string;
  fullname?: string;
  student_id?: string;
  class_id?: number;
  class_name?: string;
  section?: string;
  gender?: string;
  date_of_birth?: string;
  blood_group?: string;
  phone?: string;
  residential_address?: string;
  academic_year?: string;
  profile_picture?: string;
}

interface Class {
  id: number;
  class_name?: string;
  sec?: string;
}

interface AttendanceRecord {
  id?: number;
  date?: string;
  status?: string;
  check_in_time?: string;
  student?: string;
}

interface LeaveRecord {
  id?: number;
  applicant_email?: string;
  leave_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
}

interface GradeRecord {
  id?: number;
  subject_name?: string;
  marks_obtained?: string;
  grade?: string;
  total_marks?: string;
  remarks?: string;
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
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
          axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/`),
          axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/`)
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
  const fetchStudentDetails = async (student: Student) => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      const [attendanceRes, leavesRes, gradesRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student_attendance/`).catch(() => { 
          return { data: [] }; 
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leaves/`).catch(() => { 
          return { data: [] }; 
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/grades/?student=${student.email}`).catch(() => { 
          return { data: [] }; 
        }),
      ]);

      const studentAttendance = (attendanceRes.data || []).filter((a: AttendanceRecord) => {
        const email = student.email?.toLowerCase();
        if (!email) return false;

        const recordEmail = a.student?.toLowerCase();
        return recordEmail === email;
      });

      const studentLeaves = (leavesRes.data || []).filter(
        (l: LeaveRecord) => l.applicant_email?.toLowerCase() === student.email?.toLowerCase()
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
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0";
    
    const approvedLeaves = leaves.filter(l => l.status === "Approved").length;
    const pendingLeaves = leaves.filter(l => l.status === "Pending").length;
    
    const averageGrade = grades.length > 0 
      ? (grades.reduce((sum, grade) => sum + parseFloat(grade.grade || grade.marks_obtained || "0"), 0) / grades.length).toFixed(1)
      : "0";

    // Calculate grade distribution
    const excellentGrades = grades.filter(g => parseFloat(g.grade || g.marks_obtained || "0") >= 4.0).length;
    const goodGrades = grades.filter(g => {
      const gradeVal = parseFloat(g.grade || g.marks_obtained || "0");
      return gradeVal >= 3.0 && gradeVal < 4.0;
    }).length;
    const averageGrades = grades.filter(g => {
      const gradeVal = parseFloat(g.grade || g.marks_obtained || "0");
      return gradeVal >= 2.0 && gradeVal < 3.0;
    }).length;
    const poorGrades = grades.filter(g => parseFloat(g.grade || g.marks_obtained || "0") < 2.0).length;

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
    attendancePercentage: "0",
    approvedLeaves: 0,
    pendingLeaves: 0,
    averageGrade: "0",
    totalSubjects: 0,
    excellentGrades: 0,
    goodGrades: 0,
    averageGrades: 0,
    poorGrades: 0
  };

  // Helper: resolve class info from classes list using class_id
  const getClassInfoForStudent = (student: Student) => {
    if (!student?.class_id) return null;
    return classes.find((cls: Class) => cls.id === student.class_id) || null;
  };

  // Get unique classes for filter from classes API
  const uniqueClasses = [...new Set(classes.map((cls: Class) => cls.class_name).filter(Boolean))];

  // Get sections for the selected class
  const uniqueSectionsForSelectedClass = classFilter === "all"
    ? []
    : [...new Set(
        classes
          .filter((cls: Class) => cls.class_name === classFilter)
          .map((cls: Class) => cls.sec)
          .filter(Boolean)
      )];

  // Filter students based on search, class and section (via class_id -> classes)
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    if (!selectedStudent) return;
    
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
    a.download = `${selectedStudent.fullname?.replace(/[^a-z0-9]/gi, '_') || 'student'}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Students Grid View */}
        {!selectedStudent ? (
          <>
            {/* Header Section */}
            <div className="text-center mb-4 xs:mb-5 sm:mb-6 md:mb-8">
              <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 mb-2 xs:mb-3">
                <div className="p-2 xs:p-2.5 sm:p-3 md:p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg xs:rounded-xl sm:rounded-2xl shadow-md xs:shadow-lg">
                  <GraduationCap className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Student Management
                </h1>
              </div>
              <p className="text-gray-600 text-xs xs:text-sm sm:text-base max-w-2xl mx-auto px-2 xs:px-3 md:px-0">
                Comprehensive student monitoring and management system with advanced analytics
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 xs:p-4 sm:p-5 md:p-6 mb-3 xs:mb-4 sm:mb-5 md:mb-6">
              <div className="flex flex-col lg:flex-row gap-3 xs:gap-4 sm:gap-6 items-stretch lg:items-center justify-between">
                <div className="flex-1 w-full lg:max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 xs:pl-10 pr-3 xs:pr-4 py-2 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col xs:flex-row flex-wrap gap-2 xs:gap-3 sm:gap-4 w-full lg:w-auto">
                  <div className="flex flex-wrap gap-2 xs:gap-3 sm:gap-4">
                    <div className="relative flex-1 xs:flex-none min-w-[140px] xs:min-w-[160px]">
                      <select
                        value={classFilter}
                        onChange={(e) => {
                          setClassFilter(e.target.value);
                          setSectionFilter("all");
                        }}
                        className="w-full px-3 xs:px-4 py-2 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white appearance-none"
                      >
                        <option value="all">All Classes</option>
                        {uniqueClasses.map(cls => (
                          <option key={cls} value={cls}>Class {cls}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>

                    {classFilter !== "all" && (
                      <div className="relative flex-1 xs:flex-none min-w-[140px] xs:min-w-[160px]">
                        <select
                          value={sectionFilter}
                          onChange={(e) => setSectionFilter(e.target.value)}
                          className="w-full px-3 xs:px-4 py-2 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white appearance-none"
                        >
                          <option value="all">All Sections</option>
                          {uniqueSectionsForSelectedClass.map(sec => (
                            <option key={sec} value={sec}>Section {sec}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs xs:text-sm text-gray-600 px-1 self-center">
                    <Filter className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
                    <span className="font-medium">{filteredStudents.length} students</span>
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
              <>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4">
                  {filteredStudents.map((student, index) => {
                    const classInfo = getClassInfoForStudent(student);
                    return (
                      <div
                        key={student.id ?? student.email ?? index}
                        onClick={() => fetchStudentDetails(student)}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="p-3 xs:p-4 sm:p-5 relative z-10">
                          <div className="flex flex-col items-center text-center">
                            <div className="relative mb-3 xs:mb-4">
                              <Image
                                src={student.profile_picture || "https://i.pravatar.cc/150?img=3"}
                                alt={student.fullname || "Student"}
                                width={80}
                                height={80}
                                className="rounded-lg xs:rounded-xl border-2 xs:border-3 border-white shadow-md sm:shadow-lg group-hover:border-emerald-100 transition-colors mx-auto"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://i.pravatar.cc/150?img=3";
                                }}
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 xs:w-6 xs:h-6 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                            </div>
                            
                            <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-1 mb-1">
                              {student.fullname || "Unknown Student"}
                            </h3>
                            
                            <p className="text-xs xs:text-sm text-emerald-600 font-semibold mb-1.5 xs:mb-2">
                              {classInfo ? (
                                <>
                                  {classInfo.class_name && <>Class {classInfo.class_name}</>}
                                  {classInfo.class_name && classInfo.sec && " • "}
                                  {classInfo.sec && <>Sec {classInfo.sec}</>}
                                </>
                              ) : (
                                "Class info unavailable"
                              )}
                            </p>
                            
                            <p className="text-xs text-gray-500 mb-3 xs:mb-4 line-clamp-1">{student.email || "No email"}</p>
                            
                            <div className="flex gap-1 xs:gap-2 flex-wrap justify-center">
                              <span className="bg-blue-50 text-blue-700 text-[10px] xs:text-xs px-2 py-1 rounded-full font-medium border border-blue-200">
                                ID: {student.student_id || "N/A"}
                              </span>
                              {student.gender && (
                                <span className="bg-purple-50 text-purple-700 text-[10px] xs:text-xs px-2 py-1 rounded-full font-medium border border-purple-200">
                                  {student.gender}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!loading && filteredStudents.length === 0 && (
                  <div className="text-center py-10 xs:py-12 sm:py-16 md:py-20">
                    <div className="bg-white rounded-xl xs:rounded-2xl p-4 xs:p-6 sm:p-8 md:p-12 max-w-md mx-auto shadow-lg border border-gray-200">
                      <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4">
                        <GraduationCap className="w-8 h-8 xs:w-10 xs:h-10 text-gray-400" />
                      </div>
                      <h3 className="text-gray-700 font-semibold text-base xs:text-lg sm:text-xl mb-2">No Students Found</h3>
                      <p className="text-gray-500 text-sm xs:text-base mb-4">Try adjusting your search or filters</p>
                      <button
                        onClick={() => { setSearchTerm(""); setClassFilter("all"); setSectionFilter("all"); }}
                        className="px-4 xs:px-6 py-2 xs:py-3 text-sm xs:text-base bg-emerald-500 text-white rounded-lg xs:rounded-xl hover:bg-emerald-600 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          // ✅ Selected Student Details View
          <div className="space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
            {/* Header with Back and Actions */}
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors group text-sm"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
                <span className="text-sm">Back to Students</span>
              </button>

              <div className="flex gap-2 w-full xs:w-auto mt-2 xs:mt-0">
                <button
                  onClick={exportStudentData}
                  className="flex items-center gap-2 px-3 xs:px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm w-full xs:w-auto justify-center"
                  disabled={!selectedStudent}
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs xs:text-sm">Export Data</span>
                </button>
              </div>
            </div>

            {/* Student Header Card */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-lg sm:rounded-xl p-3 xs:p-4 sm:p-5 text-white shadow-lg sm:shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex flex-col xs:flex-row items-center xs:items-start gap-4 xs:gap-5">
                <div className="relative flex-shrink-0">
                  <Image
                    src={selectedStudent.profile_picture || "https://i.pravatar.cc/150?img=9"}
                    alt={selectedStudent.fullname || "Student"}
                    width={96}
                    height={96}
                    className="rounded-lg xs:rounded-xl border-2 xs:border-3 border-white/80 shadow-lg mx-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://i.pravatar.cc/150?img=9";
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 xs:w-5 xs:h-5 bg-green-400 border-2 border-white rounded-full shadow-lg"></div>
                </div>
                
                <div className="flex-1 text-center xs:text-left w-full min-w-0 mt-2 xs:mt-0">
                  <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold mb-2 xs:mb-3 break-words">
                    {selectedStudent.fullname || "Unknown Student"}
                  </h1>
                  <p className="text-emerald-100 text-xs xs:text-sm sm:text-base mb-2 xs:mb-3 font-medium">
                    {selectedStudent.class_name ? `Class ${selectedStudent.class_name}` : "Class not specified"} 
                    {selectedStudent.section && ` • Section ${selectedStudent.section}`}
                  </p>
                  
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-1.5 xs:gap-2 sm:gap-2.5 text-xs xs:text-sm">
                    <div className="flex items-center gap-1 justify-center xs:justify-start min-w-0">
                      <span className="font-semibold text-emerald-200 flex-shrink-0">ID:</span>
                      <span className="font-mono break-all text-xs">{selectedStudent.student_id || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center xs:justify-start min-w-0">
                      <Mail className="w-3 h-3 xs:w-4 xs:h-4 text-emerald-200 flex-shrink-0" />
                      <span className="break-all truncate text-xs">{selectedStudent.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center xs:justify-start">
                      <Phone className="w-3 h-3 xs:w-4 xs:h-4 text-emerald-200 flex-shrink-0" />
                      <span className="break-all text-xs">{selectedStudent.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center xs:justify-start">
                      <span className="font-semibold text-emerald-200 flex-shrink-0">Gender:</span>
                      <span className="break-all text-xs">{selectedStudent.gender || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center xs:justify-start min-w-0">
                      <span className="font-semibold text-emerald-200 flex-shrink-0">DOB:</span>
                      <span className="break-all text-xs">{selectedStudent.date_of_birth || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center xs:justify-start">
                      <span className="font-semibold text-emerald-200 flex-shrink-0">Year:</span>
                      <span className="break-all text-xs">{selectedStudent.academic_year || "2024"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-3">
              {[
                { 
                  value: `${stats.attendancePercentage}%`, 
                  label: "Attendance", 
                  icon: TrendingUp, 
                  color: "text-emerald-600", 
                  bg: "bg-emerald-50",
                  iconBg: "bg-emerald-100"
                },
                { 
                  value: stats.totalSubjects, 
                  label: "Subjects", 
                  icon: BookOpen, 
                  color: "text-blue-600", 
                  bg: "bg-blue-50",
                  iconBg: "bg-blue-100"
                },
                { 
                  value: stats.averageGrade, 
                  label: "Avg Grade", 
                  icon: Award, 
                  color: "text-purple-600", 
                  bg: "bg-purple-50",
                  iconBg: "bg-purple-100"
                },
                { 
                  value: stats.approvedLeaves, 
                  label: "Approved Leaves", 
                  icon: CheckCircle, 
                  color: "text-orange-600", 
                  bg: "bg-orange-50",
                  iconBg: "bg-orange-100"
                }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-lg p-3 xs:p-4 shadow-md border border-gray-200 text-center group hover:shadow-lg transition-all">
                  <div className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 ${stat.iconBg} rounded-md sm:rounded-lg flex items-center justify-center mx-auto mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-4 h-4 xs:w-5 xs:h-5" />
                  </div>
                  <div className={`text-xs sm:text-sm font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] xs:text-xs text-gray-600 font-medium mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'overview', label: 'Overview', icon: User },
                    { id: 'attendance', label: 'Attendance', icon: Calendar },
                    { id: 'leaves', label: 'Leaves', icon: Clock },
                    { id: 'grades', label: 'Grades', icon: Award },
                    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1 px-2 py-2 xs:px-2.5 xs:py-2.5 sm:px-3 sm:py-3 font-medium text-xs xs:text-sm transition-all whitespace-nowrap border-b-2 flex-shrink-0 ${
                        activeTab === tab.id
                          ? 'text-emerald-600 border-emerald-600 bg-emerald-50/50'
                          : 'text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="w-3 h-3 xs:w-4 xs:h-4" />
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-2.5 xs:p-3 sm:p-4 md:p-5">
                {/* ✅ Overview Tab */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
                    {/* Personal Information Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 xs:p-4 sm:p-5 border border-gray-200 shadow-sm">
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <User className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-emerald-600" />
                        </div>
                        Personal Information
                      </h3>
                      <div className="space-y-2 xs:space-y-3">
                        {[
                          { label: "Full Name", value: selectedStudent.fullname || "N/A" },
                          { label: "Student ID", value: selectedStudent.student_id || "N/A" },
                          { 
                            label: "Class & Section", 
                            value: `${selectedStudent.class_name || "N/A"} - ${selectedStudent.section || "N/A"}` 
                          },
                          { label: "Gender", value: selectedStudent.gender || "N/A" },
                          { label: "Date of Birth", value: selectedStudent.date_of_birth || "N/A" },
                          { label: "Blood Group", value: selectedStudent.blood_group || "N/A" }
                        ].map((item, index) => (
                          <div key={index} className="flex flex-col xs:flex-row xs:justify-between xs:items-center py-2 border-b border-gray-100 last:border-b-0 gap-1">
                            <span className="text-gray-600 font-medium text-xs">{item.label}:</span>
                            <span className="font-semibold text-gray-800 text-xs break-words">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 xs:p-4 sm:p-5 border border-gray-200 shadow-sm">
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        Contact Information
                      </h3>
                      <div className="space-y-2 xs:space-y-3">
                        <div className="flex items-center gap-2 p-2 xs:p-3 bg-white rounded-lg border border-gray-200">
                          <Mail className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-gray-500">Email</div>
                            <div className="font-semibold text-xs break-words">{selectedStudent.email || "N/A"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 xs:p-3 bg-white rounded-lg border border-gray-200">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-gray-500">Phone</div>
                            <div className="font-semibold text-xs break-all">{selectedStudent.phone || "N/A"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 xs:p-3 bg-white rounded-lg border border-gray-200">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-gray-500">Residential Address</div>
                            <div className="font-semibold text-xs break-words">{selectedStudent.residential_address || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Overview Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-md sm:rounded-lg p-2.5 xs:p-3 sm:p-4 border border-gray-200 shadow-sm col-span-1 sm:col-span-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <TrendingUp className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-purple-600" />
                        </div>
                        Performance Overview
                      </h3>
                      <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5 xs:gap-2 sm:gap-2.5">
                        {[
                          { value: stats.presentDays, label: "Days Present", color: "text-emerald-600", bg: "bg-emerald-50" },
                          { value: stats.absentDays, label: "Days Absent", color: "text-red-600", bg: "bg-red-50" },
                          { value: stats.totalSubjects, label: "Subjects", color: "text-blue-600", bg: "bg-blue-50" },
                          { value: stats.averageGrade, label: "Avg Grade", color: "text-purple-600", bg: "bg-purple-50" }
                        ].map((stat, index) => (
                          <div key={index} className={`p-2 xs:p-3 rounded-lg ${stat.bg} text-center group hover:scale-105 transition-transform`}>
                            <div className={`text-xs sm:text-sm font-bold ${stat.color} mb-0.5`}>{stat.value}</div>
                            <div className="text-[10px] xs:text-xs text-gray-600 font-medium">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Attendance Tab */}
                {activeTab === "attendance" && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 xs:p-4 sm:p-5 border border-gray-200 shadow-sm">
                    <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-3 gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-1.5 xs:gap-2">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Calendar className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-emerald-600" />
                        </div>
                        Attendance Records
                      </h3>
                      <div className="flex gap-2 w-full xs:w-auto">
                        <select
                          value={attendanceFilter}
                          onChange={(e) => setAttendanceFilter(e.target.value)}
                          className="px-2 py-1.5 xs:px-2.5 xs:py-2 text-xs border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white w-full xs:w-auto"
                        >
                          <option value="all">All Status</option>
                          <option value="present">Present Only</option>
                          <option value="absent">Absent Only</option>
                        </select>
                      </div>
                    </div>

                    {loading ? (
                      <div className="flex justify-center items-center py-4 xs:py-6">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                          <p className="text-gray-500 text-xs">Loading attendance records...</p>
                        </div>
                      </div>
                    ) : attendance.length > 0 ? (
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-3">
                        {attendance
                          .filter(record => 
                            attendanceFilter === "all" || 
                            (attendanceFilter === "present" && record.status === "Present") ||
                            (attendanceFilter === "absent" && record.status === "Absent")
                          )
                          .map((record, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-800">{record.date}</span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold ${
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
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex justify-between">
                                <span>Day:</span>
                                <span className="font-medium">
                                  {record.date ? new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' }) : "Unknown"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Check-in:</span>
                                <span className="font-medium">{record.check_in_time || "Not recorded"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 xs:py-6">
                        <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Calendar className="w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
                        </div>
                        <h4 className="text-gray-700 font-semibold text-xs mb-1">No Attendance Records</h4>
                        <p className="text-gray-500 text-xs">No attendance records found for this student.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Leaves Tab */}
                {activeTab === "leaves" && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 xs:p-4 sm:p-5 border border-gray-200 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="p-1.5 xs:p-2 bg-orange-100 rounded-md sm:rounded-lg">
                        <Clock className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-orange-600" />
                      </div>
                      Leave History
                    </h3>
                    {loading ? (
                      <div className="flex justify-center items-center py-4 xs:py-6">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                          <p className="text-gray-500 text-xs">Loading leave records...</p>
                        </div>
                      </div>
                    ) : leaves.length > 0 ? (
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-3">
                        {leaves.map((leave, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-800">{leave.leave_type || "Leave"}</span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                                leave.status === "Approved" 
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : leave.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}>
                                {leave.status === "Approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                                {leave.status === "Pending" && <Clock4 className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-0.5" />}
                                {leave.status === "Rejected" && <XCircle className="w-3 h-3 mr-1" />}
                                {leave.status}
                              </span>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600 mb-1.5 xs:mb-2">
                              <div className="flex justify-between">
                                <span>From:</span>
                                <span className="font-medium">{leave.start_date || "N/A"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>To:</span>
                                <span className="font-medium">{leave.end_date || "N/A"}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-700">
                              <div className="font-medium mb-1">Reason:</div>
                              <div className="line-clamp-2">{leave.reason || "No reason provided"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 xs:py-6">
                        <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Clock className="w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
                        </div>
                        <h4 className="text-gray-700 font-semibold text-xs mb-1">No Leave Records</h4>
                        <p className="text-gray-500 text-xs">No leave records found for this student.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Grades Tab */}
                {activeTab === "grades" && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 xs:p-4 sm:p-5 border border-gray-200 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Award className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-purple-600" />
                      </div>
                      Academic Performance
                    </h3>
                    {loading ? (
                      <div className="flex justify-center items-center py-4 xs:py-6">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                          <p className="text-gray-500 text-xs">Loading grade records...</p>
                        </div>
                      </div>
                    ) : grades.length > 0 ? (
                      <div className="space-y-3 xs:space-y-4">
                        {/* Grades Cards */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-3">
                          {grades.map((grade, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                              <div className="text-center mb-1.5 xs:mb-2">
                                <div className="text-base xs:text-lg font-bold text-purple-600 mb-1">
                                  {grade.marks_obtained || grade.grade || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">Grade</div>
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Subject:</span>
                                  <span className="font-semibold text-gray-800">{grade.subject_name || "Unknown"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total Marks:</span>
                                  <span className="font-semibold text-gray-800">{grade.total_marks || "N/A"}</span>
                                </div>
                                {grade.remarks && (
                                  <div>
                                    <div className="text-gray-600 mb-1">Remarks:</div>
                                    <div className="text-gray-700 text-xs line-clamp-2">{grade.remarks}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Performance Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                          <div className="bg-white rounded-lg p-3 xs:p-4 border border-gray-200 shadow-sm">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 xs:mb-2.5">Performance Summary</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 xs:gap-2">
                              {[
                                { value: stats.totalSubjects, label: "Total Subjects", color: "text-blue-600", bg: "bg-blue-50" },
                                { value: stats.averageGrade, label: "Average Grade", color: "text-purple-600", bg: "bg-purple-50" },
                                { value: stats.excellentGrades, label: "Excellent (A)", color: "text-emerald-600", bg: "bg-emerald-50" },
                                { value: stats.goodGrades, label: "Good (B)", color: "text-green-600", bg: "bg-green-50" },
                                { value: stats.averageGrades, label: "Average (C)", color: "text-yellow-600", bg: "bg-yellow-50" },
                                { value: stats.poorGrades, label: "Needs Improvement", color: "text-red-600", bg: "bg-red-50" }
                              ].map((stat, index) => (
                                <div key={index} className={`p-2 rounded-lg ${stat.bg} text-center group hover:scale-105 transition-transform`}>
                                  <div className={`text-xs font-bold ${stat.color} mb-0.5`}>{stat.value}</div>
                                  <div className="text-[10px] xs:text-xs text-gray-600 font-medium">{stat.label}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-3 xs:p-4 border border-gray-200 shadow-sm">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 xs:mb-2.5">Grade Distribution</h4>
                            <div className="space-y-2">
                              {[
                                { label: "Excellent (4.0+)", count: stats.excellentGrades, color: "bg-emerald-500", width: stats.totalSubjects > 0 ? (stats.excellentGrades / stats.totalSubjects) * 100 : 0 },
                                { label: "Good (3.0-3.9)", count: stats.goodGrades, color: "bg-green-500", width: stats.totalSubjects > 0 ? (stats.goodGrades / stats.totalSubjects) * 100 : 0 },
                                { label: "Average (2.0-2.9)", count: stats.averageGrades, color: "bg-yellow-500", width: stats.totalSubjects > 0 ? (stats.averageGrades / stats.totalSubjects) * 100 : 0 },
                                { label: "Needs Improvement (<2.0)", count: stats.poorGrades, color: "bg-red-500", width: stats.totalSubjects > 0 ? (stats.poorGrades / stats.totalSubjects) * 100 : 0 }
                              ].map((item, index) => (
                                <div key={index} className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600 break-all">{item.label}</span>
                                    <span className="font-semibold break-all">{item.count}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 xs:h-2">
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
                      <div className="text-center py-6 xs:py-8">
                        <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Award className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400" />
                        </div>
                        <h4 className="text-gray-700 font-semibold text-xs xs:text-sm mb-1">No Grade Records</h4>
                        <p className="text-gray-500 text-xs">No grade records found for this student.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Analytics Tab */}
                {activeTab === "analytics" && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 xs:p-4 sm:p-5 border border-gray-200 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="p-1.5 xs:p-2 bg-indigo-100 rounded-md sm:rounded-lg">
                        <BarChart3 className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-indigo-600" />
                      </div>
                      Student Analytics
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                      {/* Attendance Analytics Card */}
                      <div className="bg-white rounded-lg p-3 xs:p-4 border border-gray-200 shadow-sm">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 xs:mb-2.5">Attendance Overview</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-xs">Total Days Recorded</span>
                            <span className="font-semibold text-xs">{stats.totalDays}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-xs">Present Days</span>
                            <span className="font-semibold text-emerald-600 text-xs">{stats.presentDays}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-xs">Absent Days</span>
                            <span className="font-semibold text-red-600 text-xs">{stats.absentDays}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 xs:h-2 mt-1.5 xs:mt-2">
                            <div
                              className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                              style={{ width: `${parseFloat(stats.attendancePercentage)}%` }}
                            ></div>
                          </div>
                          <div className="text-center text-xs text-gray-600">
                            Attendance Rate: <span className="font-semibold">{stats.attendancePercentage}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Academic Analytics Card */}
                      <div className="bg-white rounded-lg p-3 xs:p-4 border border-gray-200 shadow-sm">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 xs:mb-2.5">Academic Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-xs">Subjects Enrolled</span>
                            <span className="font-semibold text-xs">{stats.totalSubjects}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-xs">Average Grade</span>
                            <span className="font-semibold text-purple-600 text-xs">{stats.averageGrade}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-xs">Performance Level</span>
                            <span
                              className={`font-semibold text-xs ${
                                parseFloat(stats.averageGrade) >= 3.5
                                  ? "text-emerald-600"
                                  : parseFloat(stats.averageGrade) >= 2.5
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {parseFloat(stats.averageGrade) >= 3.5
                                ? "Excellent"
                                : parseFloat(stats.averageGrade) >= 2.5
                                ? "Average"
                                : "Needs Improvement"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Leave Analytics Card */}
                      <div className="bg-white rounded-md sm:rounded-lg p-2.5 xs:p-3 sm:p-4 border border-gray-200 shadow-sm sm:col-span-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 xs:mb-2.5">Leave Statistics</h4>
                        <div className="grid grid-cols-1 xs:grid-cols-3 gap-1.5 xs:gap-2">
                          <div className="text-center p-2 xs:p-2.5 bg-emerald-50 rounded-md sm:rounded-lg">
                            <div className="text-xs sm:text-sm font-bold text-emerald-600">{stats.approvedLeaves}</div>
                            <div className="text-xs text-gray-600">Approved</div>
                          </div>
                          <div className="text-center p-2 xs:p-2.5 bg-yellow-50 rounded-md sm:rounded-lg">
                            <div className="text-base sm:text-lg font-bold text-yellow-600">{stats.pendingLeaves}</div>
                            <div className="text-xs text-gray-600">Pending</div>
                          </div>
                          <div className="text-center p-2 xs:p-2.5 bg-blue-50 rounded-md sm:rounded-lg">
                            <div className="text-base sm:text-lg font-bold text-blue-600">{stats.approvedLeaves + stats.pendingLeaves}</div>
                            <div className="text-xs text-gray-600">Total Leaves</div>
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
      
      {/* Global Responsive Styles */}
      <style jsx global>{`
        /* Mobile First Approach */
        @media (max-width: 480px) {
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
          
          .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
          
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        }
        
        /* Tablet (640px+) */
        @media (min-width: 640px) {
          .sm\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          
          .sm\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          
          .sm\\:col-span-2 {
            grid-column: span 2 / span 2;
          }
        }
        
        /* Desktop (768px+) */
        @media (min-width: 768px) {
          .md\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          
          .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        /* Large Desktop (1024px+) */
        @media (min-width: 1024px) {
          .lg\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
          
          .lg\\:max-w-md {
            max-width: 28rem;
          }
        }
        
        /* Extra Large (1280px+) */
        @media (min-width: 1280px) {
          .xl\\:grid-cols-5 {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }
        
        /* Custom scrollbar for larger screens */
        @media (min-width: 768px) {
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentsPage;