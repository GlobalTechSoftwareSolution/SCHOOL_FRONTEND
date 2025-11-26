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
  GraduationCap,
  Users,
  BookMarked,
  Building,
  Contact,
  Eye
} from "lucide-react";

const API_BASE = "http://school.globaltechsoftwaresolutions.cloud";

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [timetable, setTimetable] = useState<any[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [filteredTimetable, setFilteredTimetable] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const handleSubjectSelect = async (subject: any) => {
    setSelectedSubject(subject);
    setTimetableLoading(true);

    try {
      const teacherEmail = selectedTeacher?.email?.toLowerCase();

      const filtered = timetable.filter((item) => {
        const itemTeacher = item.teacher?.toLowerCase();
        const matchesTeacher = teacherEmail && itemTeacher === teacherEmail;

        const itemSubjectId = item.subject ?? item.subject_id;
        const matchesSubject =
          itemSubjectId === subject.id ||
          item.subject_name?.toLowerCase() === subject.subject_name?.toLowerCase() ||
          item.subject_code?.toLowerCase() === subject.subject_code?.toLowerCase();

        return matchesTeacher && matchesSubject;
      });

      setFilteredTimetable(filtered);
    } catch (error) {
      console.error("Error filtering timetable:", error);
    } finally {
      setTimetableLoading(false);
    }
  };

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await axios.get(`${API_BASE}/timetable/`);
        setTimetable(res.data || []);
      } catch (error) {
        console.error("Error fetching timetable:", error);
      }
    };
    fetchTimetable();
  }, []);

  // Fetch all teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/teachers/`);
        setTeachers(response.data || []);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // Fetch teacher details dynamically
  const fetchTeacherDetails = async (teacher: any) => {
    setSelectedTeacher(teacher);
    setLoading(true);
    setActiveTab("overview");
    setSelectedSubject(null);
    setFilteredTimetable([]);

    try {
      const [attendanceRes, leavesRes] = await Promise.all([
        axios.get(`${API_BASE}/attendance/`).catch(err => { 
          return { data: [] }; 
        }),
        axios.get(`${API_BASE}/leaves/`).catch(err => { 
          return { data: [] }; 
        }),
      ]);

      const allAttendance = attendanceRes.data || [];
      const allLeaves = leavesRes.data || [];

      // Match attendance records by user_email or user_id (DB may expose either)
      const teacherAttendance = allAttendance.filter((a: any) => {
        const email = teacher.email?.toLowerCase();
        if (!email) return false;

        const userEmail = a.user_email ?? a.user_id;
        return userEmail?.toLowerCase() === email;
      });

      const teacherLeaves = allLeaves.filter(
        (l: any) => l.applicant_email === teacher.email
      );

      setAttendance(teacherAttendance);
      setLeaves(teacherLeaves);
    } catch (error) {
      console.error("Error fetching teacher details:", error);
      setAttendance([]);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setSelectedTeacher(null);
    setAttendance([]);
    setLeaves([]);
    setActiveTab("overview");
    setSelectedSubject(null);
    setFilteredTimetable([]);
  };

  // Calculate statistics
  const calculateStats = () => {
    const teacherAttendance = attendance.filter((a: any) => {
      const email = selectedTeacher?.email?.toLowerCase();
      if (!email) return false;

      const userEmail = a.user_email ?? a.user_id;
      return userEmail?.toLowerCase() === email;
    });

    const totalDays = teacherAttendance.length;
    const presentDays = teacherAttendance.filter((a: any) => a.status === "Present").length;
    const absentDays = teacherAttendance.filter((a: any) => a.status === "Absent").length;
    const approvedLeaves = leaves.filter((l: any) => l.status === "Approved").length;
    const pendingLeaves = leaves.filter((l: any) => l.status === "Pending").length;

    const subjectList = selectedTeacher?.subject_list || [];
    const totalSubjects = subjectList.length;

    // Classes should be counted only where this teacher actually teaches
    const teacherSubjectIds = subjectList.map((subject: any) => subject.id);
    const teacherEmail = selectedTeacher?.email?.toLowerCase();

    const teacherClasses = timetable.filter((item: any) => {
      const itemSubjectId = item.subject ?? item.subject_id;
      const matchesSubject = teacherSubjectIds.includes(itemSubjectId);

      const itemTeacher = item.teacher?.toLowerCase();
      const matchesTeacher = teacherEmail ? itemTeacher === teacherEmail : false;
      return matchesSubject && matchesTeacher;
    });

    // Treat each class+section pair as a distinct class
    const uniqueClasses = [
      ...new Set(
        teacherClasses.map((item: any) => {
          const name = item.class_name || "";
          const section = (item.section || item.sec || "").toString();
          return `${name}__${section}`;
        })
      ),
    ];

    return {
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0,
      approvedLeaves,
      pendingLeaves,
      totalSubjects,
      totalClasses: uniqueClasses.length,
    };
  };

  const stats = selectedTeacher ? calculateStats() : {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    attendancePercentage: 0,
    approvedLeaves: 0,
    pendingLeaves: 0,
    totalSubjects: 0,
    totalClasses: 0,
  };

  // Filter teachers based on search and filters
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.teacher_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || teacher.department_name === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filter
  const uniqueDepartments = [...new Set(teachers.map(teacher => teacher.department_name))];

  // Export teacher data
  const exportTeacherData = () => {
    const data = {
      teacher: selectedTeacher,
      attendance,
      leaves,
      stats
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTeacher.fullname}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {!selectedTeacher ? (
            <>
              {/* Header Section */}
              <div className="text-center mb-3 xs:mb-4 sm:mb-6 md:mb-8">
                <div className="flex items-center justify-center gap-2 xs:gap-2 sm:gap-3 mb-2 xs:mb-3 sm:mb-4">
                  <div className="p-2 xs:p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg">
                    <Users className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Faculty Management
                  </h1>
                </div>
                <p className="text-gray-600 text-xs xs:text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-3 xs:px-4">
                  Comprehensive faculty monitoring and management system with advanced analytics
                </p>
              </div>

              {/* Search and Filter Section */}
              <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 xs:p-4 sm:p-5 md:p-6 mb-3 xs:mb-4 sm:mb-5 md:mb-6">
                <div className="flex flex-col lg:flex-row gap-2 xs:gap-3 sm:gap-4 items-center justify-between">
                  <div className="flex-1 w-full lg:max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="text"
                        placeholder="Search teachers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[160px]">
                      <option value="all">All Departments</option>
                      {uniqueDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 px-1">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{filteredTeachers.length} teachers</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teachers Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-10 xs:py-12 sm:py-16 md:py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 xs:h-12 xs:w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-b-2 border-blue-500 mx-auto mb-2 xs:mb-3 sm:mb-4"></div>
                    <p className="text-gray-600 text-xs xs:text-sm sm:text-base">Loading faculty data...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
                  {filteredTeachers.map((teacher) => (
                    <div
                      key={teacher.id || teacher.email}
                      onClick={() => fetchTeacherDetails(teacher)}
                      className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer border border-gray-200/60 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="p-3 xs:p-4 sm:p-5 md:p-6 relative z-10">
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-3 sm:mb-4">
                            <img
                              src={teacher.profile_picture || "https://i.pravatar.cc/150?img=12"}
                              alt={teacher.fullname}
                              className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white shadow-lg group-hover:border-blue-100 transition-colors"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                          </div>
                          
                          <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1 px-2">
                            {teacher.fullname}
                          </h3>
                          
                          <p className="text-xs sm:text-sm text-blue-600 font-semibold mt-1 px-2 line-clamp-1">
                            {teacher.department_name || "General Department"}
                          </p>
                          
                          <p className="text-xs text-gray-500 mt-2 line-clamp-1 px-2">{teacher.qualification}</p>
                          
                          <div className="mt-3 sm:mt-4 flex gap-1.5 sm:gap-2 flex-wrap justify-center">
                            <span className="bg-blue-50 text-blue-700 text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium border border-blue-200">
                              {teacher.experience_years} yrs
                            </span>
                            <span className="bg-green-50 text-green-700 text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium border border-green-200">
                              ID: {teacher.teacher_id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && filteredTeachers.length === 0 && (
                <div className="text-center py-8 xs:py-10 sm:py-12 md:py-16">
                  <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-6 sm:p-8 md:p-12 max-w-md mx-auto shadow-lg border border-gray-200">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                    </div>
                    <h3 className="text-gray-700 font-semibold text-base sm:text-lg mb-2">No Teachers Found</h3>
                    <p className="text-gray-500 text-sm sm:text-base mb-4">Try adjusting your search or filters</p>
                    <button
                      onClick={() => { setSearchTerm(""); setDepartmentFilter("all"); }}
                      className="px-4 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // ✅ Selected Teacher Details View
            <div className="space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
              {/* Header with Back and Actions */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 xs:gap-3 sm:gap-4">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 text-blue-600 hover:text-blue-700 font-semibold transition-colors group text-xs xs:text-sm sm:text-base"
                >
                  <div className="p-1 xs:p-1.5 sm:p-2 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow">
                    <ArrowLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                  </div>
                  <span>Back to All Teachers</span>
                </button>

                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={exportTeacherData}
                    className="flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 text-xs xs:text-sm sm:text-base bg-white border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex-1 sm:flex-none justify-center"
                  >
                    <Download className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                    Export Data
                  </button>
                </div>
              </div>

              {/* Teacher Header */}
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-3 xs:gap-4 sm:gap-5 md:gap-6">
                  <div className="relative flex-shrink-0">
                    <img
                      src={selectedTeacher.profile_picture || "https://i.pravatar.cc/150?img=12"}
                      alt={selectedTeacher.fullname}
                      className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-lg xs:rounded-xl sm:rounded-2xl border-2 xs:border-2 sm:border-4 border-white/80 shadow-2xl"
                    />
                    <div className="absolute -bottom-1 xs:-bottom-1 sm:-bottom-2 -right-1 xs:-right-1 sm:-right-2 w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-400 border-2 border-white rounded-full shadow-lg"></div>
                  </div>
                  
                  <div className="flex-1 text-center lg:text-left w-full min-w-0">
                    <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold mb-1 xs:mb-2 truncate">{selectedTeacher.fullname}</h1>
                    <p className="text-blue-100 text-xs xs:text-sm sm:text-base md:text-lg mb-2 xs:mb-3 sm:mb-4 font-medium truncate">
                      {selectedTeacher.department_name}
                    </p>
                    
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 xs:gap-2 justify-center lg:justify-start min-w-0">
                        <span className="font-semibold text-blue-200 flex-shrink-0">Teacher ID:</span>
                        <span className="font-mono truncate">{selectedTeacher.teacher_id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 xs:gap-2 justify-center lg:justify-start min-w-0">
                        <Mail className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-blue-200 flex-shrink-0" />
                        <span className="truncate">{selectedTeacher.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 xs:gap-2 justify-center lg:justify-start">
                        <Phone className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-blue-200 flex-shrink-0" />
                        <span>{selectedTeacher.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 xs:gap-2 justify-center lg:justify-start">
                        <span className="font-semibold text-blue-200 flex-shrink-0">Exp:</span>
                        <span>{selectedTeacher.experience_years} yrs</span>
                      </div>
                      <div className="flex items-center gap-1.5 xs:gap-2 justify-center lg:justify-start min-w-0">
                        <span className="font-semibold text-blue-200 flex-shrink-0">Qual:</span>
                        <span className="truncate">{selectedTeacher.qualification}</span>
                      </div>
                      <div className="flex items-center gap-1.5 xs:gap-2 justify-center lg:justify-start">
                        <span className="font-semibold text-blue-200 flex-shrink-0">Joined:</span>
                        <span className="truncate">{selectedTeacher.date_joined}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
                <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 shadow-lg border border-gray-200 text-center group hover:shadow-xl transition-all">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-blue-50 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1.5 xs:mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-600">{stats.attendancePercentage}%</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Attendance</div>
                </div>
                
                <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 shadow-lg border border-gray-200 text-center group hover:shadow-xl transition-all">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-green-50 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1.5 xs:mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-green-600" />
                  </div>
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold text-green-600">{stats.totalSubjects}</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Subjects</div>
                </div>
                
                <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 shadow-lg border border-gray-200 text-center group hover:shadow-xl transition-all">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-purple-50 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1.5 xs:mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                    <Building className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold text-purple-600">{stats.totalClasses}</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Classes</div>
                </div>
                
                <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 shadow-lg border border-gray-200 text-center group hover:shadow-xl transition-all">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-orange-50 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1.5 xs:mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-orange-600" />
                  </div>
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold text-orange-600">{stats.approvedLeaves}</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Leaves</div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                  <nav className="flex overflow-x-auto">
                    {["overview", "subjects", "attendance", "leaves", "contact", "analytics"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 px-8 py-4 font-medium text-sm transition-all whitespace-nowrap border-b-2 ${
                          activeTab === tab
                            ? "text-blue-600 border-blue-600 bg-blue-50/50"
                            : "text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-50"
                        }`}
                      >
                        {tab === "overview" && <User className="w-4 h-4" />}
                        {tab === "subjects" && <BookMarked className="w-4 h-4" />}
                        {tab === "attendance" && <Calendar className="w-4 h-4" />}
                        {tab === "leaves" && <Clock className="w-4 h-4" />}
                        {tab === "contact" && <Contact className="w-4 h-4" />}
                        {tab === "analytics" && <BarChart3 className="w-4 h-4" />}
                        {tab === "overview" && "Overview"}
                        {tab === "subjects" && "Subjects & Classes"}
                        {tab === "attendance" && "Attendance"}
                        {tab === "leaves" && "Leave History"}
                        {tab === "contact" && "Contact Info"}
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
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          Personal Information
                        </h3>
                        <div className="space-y-4">
                          {[
                            { label: "Full Name", value: selectedTeacher.fullname },
                            { label: "Gender", value: selectedTeacher.gender },
                            { label: "Date of Birth", value: selectedTeacher.date_of_birth },
                            { label: "Nationality", value: selectedTeacher.nationality || "N/A" },
                            { label: "Blood Group", value: selectedTeacher.blood_group || "N/A" }
                          ].map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <span className="text-gray-600 font-medium">{item.label}:</span>
                              <span className="font-semibold text-gray-800">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-xl">
                            <Award className="w-5 h-5 text-green-600" />
                          </div>
                          Professional Details
                        </h3>
                        <div className="space-y-4">
                          {[
                            { label: "Teacher ID", value: selectedTeacher.teacher_id },
                            { label: "Department", value: selectedTeacher.department_name },
                            { label: "Qualification", value: selectedTeacher.qualification },
                            { label: "Experience", value: `${selectedTeacher.experience_years} years` },
                            { label: "Date Joined", value: selectedTeacher.date_joined }
                          ].map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <span className="text-gray-600 font-medium">{item.label}:</span>
                              <span className="font-semibold text-gray-800">{item.value}</span>
                            </div>
                          ))}
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
                            { value: stats.presentDays, label: "Days Present", color: "text-blue-600", bg: "bg-blue-50" },
                            { value: stats.absentDays, label: "Days Absent", color: "text-red-600", bg: "bg-red-50" },
                            { value: stats.totalSubjects, label: "Subjects", color: "text-green-600", bg: "bg-green-50" },
                            { value: stats.totalClasses, label: "Classes", color: "text-purple-600", bg: "bg-purple-50" }
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

                  {/* ✅ Subjects & Classes Tab */}
                  {activeTab === "subjects" && (
                    <div className="space-y-6">
                      {/* Subjects */}
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-xl">
                            <BookMarked className="w-5 h-5 text-green-600" />
                          </div>
                          Subjects Taught
                        </h3>

                        {selectedTeacher.subject_list && selectedTeacher.subject_list.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedTeacher.subject_list.map((subject: any, index: number) => (
                              <div
                                key={index}
                                onClick={() => handleSubjectSelect(subject)}
                                className={`bg-white rounded-xl p-4 border cursor-pointer transition-all shadow-sm hover:shadow-md group ${
                                  selectedSubject?.id === subject.id ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200 hover:border-blue-300"
                                }`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                    {subject.subject_name}
                                  </h4>
                                  <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div className="flex justify-between">
                                    <span className="font-medium">Subject ID:</span>
                                    <span className="font-mono text-xs">{subject.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Code:</span>
                                    <span>{subject.subject_code}</span>
                                  </div>
                                  {subject.description && (
                                    <div>
                                      <span className="font-medium">Description:</span>
                                      <p className="text-xs mt-1 text-gray-500 line-clamp-2">{subject.description}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <BookMarked className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-gray-700 font-semibold mb-2">No Subjects Assigned</h4>
                            <p className="text-gray-500">No subjects assigned to this teacher.</p>
                          </div>
                        )}
                      </div>

                      {/* Classes from Timetable for selected subject */}
                      {selectedSubject && (
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                              <div className="p-2 bg-purple-100 rounded-xl">
                                <Building className="w-5 h-5 text-purple-600" />
                              </div>
                              Classes Assigned — <span className="text-blue-600 ml-2">{selectedSubject.subject_name}</span>
                            </h3>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {filteredTimetable.length} classes
                            </span>
                          </div>

                          {timetableLoading ? (
                            <div className="flex justify-center items-center py-12">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                                <p className="text-gray-500">Loading classes...</p>
                              </div>
                            </div>
                          ) : filteredTimetable.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {filteredTimetable.map((item: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                                >
                                  <h4 className="font-semibold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
                                    {item.class_name}
                                  </h4>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                      <span className="font-medium">Section:</span>
                                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                        {item.section}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium">Day:</span>
                                      <span className="text-gray-800 font-medium">{item.day_of_week}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium">Time:</span>
                                      <span className="text-gray-800 font-medium">{item.start_time} - {item.end_time}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Building className="w-8 h-8 text-gray-400" />
                              </div>
                              <h4 className="text-gray-700 font-semibold mb-2">No Classes Found</h4>
                              <p className="text-gray-500">No timetable entries found for this subject.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ✅ Attendance Tab */}
                  {activeTab === "attendance" && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        Attendance Records
                      </h3>
                      {loading ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                            <p className="text-gray-500">Loading attendance records...</p>
                          </div>
                        </div>
                      ) : attendance.filter((a: any) => {
                          const email = selectedTeacher.email?.toLowerCase();
                          if (!email) return false;

                          return a.user_email?.toLowerCase() === email;
                        }).length > 0 ? (
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
                                  .filter((record: any) => {
                                    const email = selectedTeacher.email?.toLowerCase();
                                    if (!email) return false;

                                    return record.user_email?.toLowerCase() === email;
                                  })
                                  .map((record: any, index: number) => (
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
                                        {record.check_in_time || record.check_in || (
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
                          <p className="text-gray-500">No attendance records found for this teacher.</p>
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
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                            <p className="text-gray-500">Loading leave records...</p>
                          </div>
                        </div>
                      ) : leaves.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  {["Leave Type", "Start Date", "End Date", "Reason", "Status", "Approved By"].map((header) => (
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
                                {leaves.map((leave: any, index: number) => (
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
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                      {leave.approved_by_email || (
                                        <span className="text-gray-400">Not specified</span>
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
                            <Clock className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-gray-700 font-semibold mb-2">No Leave Records</h4>
                          <p className="text-gray-500">No leave records found for this teacher.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ✅ Contact Tab */}
                  {activeTab === "contact" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Contact Information */}
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <Contact className="w-5 h-5 text-blue-600" />
                          </div>
                          Contact Information
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">Email</div>
                              <div className="font-semibold">{selectedTeacher.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">Phone</div>
                              <div className="font-semibold">{selectedTeacher.phone}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">Residential Address</div>
                              <div className="font-semibold">{selectedTeacher.residential_address || "N/A"}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-xl">
                            <User className="w-5 h-5 text-red-600" />
                          </div>
                          Emergency Contact
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Contact Person</div>
                              <div className="font-semibold">{selectedTeacher.emergency_contact_name || "N/A"}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Contact className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Relationship</div>
                              <div className="font-semibold">{selectedTeacher.emergency_contact_relationship || "N/A"}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <Phone className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Emergency Phone</div>
                              <div className="font-semibold">{selectedTeacher.emergency_contact_no || "N/A"}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ✅ Analytics Tab */}
                  {activeTab === "analytics" && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                          <BarChart3 className="w-5 h-5 text-indigo-600" />
                        </div>
                        Teacher Analytics
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
                              <span className="font-semibold text-green-600">{stats.presentDays}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Absent Days</span>
                              <span className="font-semibold text-red-600">{stats.absentDays}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                              <div
                                className="h-3 rounded-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${stats.attendancePercentage}%` }}
                              ></div>
                            </div>
                            <div className="text-center text-sm text-gray-600">
                              Attendance Rate: <span className="font-semibold">{stats.attendancePercentage}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Workload Analytics */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">Workload Summary</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Subjects Assigned</span>
                              <span className="font-semibold">{stats.totalSubjects}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Classes Assigned</span>
                              <span className="font-semibold text-purple-600">{stats.totalClasses}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Teaching Experience</span>
                              <span className="font-semibold text-green-600">{selectedTeacher.experience_years} years</span>
                            </div>
                          </div>
                        </div>

                        {/* Leave Analytics */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm lg:col-span-2">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">Leave Statistics</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-xl">
                              <div className="text-2xl font-bold text-green-600">{stats.approvedLeaves}</div>
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

export default TeachersPage;