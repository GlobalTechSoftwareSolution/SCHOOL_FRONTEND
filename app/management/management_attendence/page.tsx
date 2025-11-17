"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { 
  Calendar, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  BarChart3,
  Filter,
  Download,
  Search,
  GraduationCap,
  BookOpen,
  Crown,
  Shield,
  Settings,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  FileText
} from "lucide-react";

const API = "https://globaltechsoftwaresolutions.cloud/school-api/api";

export default function AttendanceByRole() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ui
  const [mode, setMode] = useState<
    "students" | "teachers" | "principal" | "management" | "admin"
  >("students");
  const [dateStr, setDateStr] = useState(() => {
    const t = new Date();
    return t.toISOString().slice(0, 10);
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("🔄 AttendanceByRole: starting fetch for student attendance, students, classes");
    const load = async () => {
      try {
        const [attRes, stuRes, teaRes, clsRes] = await Promise.all([
          axios.get(`${API}/student_attendance/`),
          axios.get(`${API}/students/`),
          axios.get(`${API}/teachers/`),
          axios.get(`${API}/classes/`),
        ]);

        const normalizedAttendance = (attRes.data || []).map((item: any) => ({
          ...item,
          // ensure fields used by the existing UI are present
          role: "student",
          user_email: item.student || item.student_email || item.email || "",
          user_name: item.student_name || item.user_name || "",
        }));

        console.log("📅 student attendance count:", normalizedAttendance.length);
        console.log("🎓 students count:", stuRes.data.length);
        console.log("👩‍🏫 teachers count:", teaRes.data.length);
        console.log("🏫 classes count:", clsRes.data.length);

        setAttendance(normalizedAttendance);
        setStudents(stuRes.data || []);
        setTeachers(teaRes.data || []);
        setClasses(clsRes.data || []);
        setLoading(false);
      } catch (e) {
        console.error("❌ fetch error:", e);
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    };

    load();
  }, []);

  // helper: normalize role
  const normalizeRole = (r: unknown) => (r ? String(r).toLowerCase() : "");

  // compute filtered attendance by selected date
  const attendanceForDate = useMemo(() => {
    console.log("📆 Filtering attendance for date:", dateStr);
    return attendance.filter((a) => {
      return String(a.date || "").startsWith(dateStr);
    });
  }, [attendance, dateStr]);

  // compute rows based on mode
  const filteredByMode = useMemo(() => {
    const rows = attendanceForDate.filter((a) => {
      const role = normalizeRole(a.role);

      if (mode === "students") {
        return role === "student";
      }

      if (mode === "teachers") {
        return role === "teacher";
      }

      if (mode === "principal") {
        return role === "principal";
      }

      if (mode === "management") {
        return role === "management";
      }

      if (mode === "admin") {
        return role === "admin";
      }

      return false;
    });

    console.log(`🔎 Rows for mode=${mode}:`, rows.length);
    return rows;
  }, [attendanceForDate, mode]);

  // Apply search filter
  const filteredBySearch = useMemo(() => {
    if (!searchTerm.trim()) return filteredByMode;
    
    const query = searchTerm.toLowerCase();
    return filteredByMode.filter((row) => {
      const displayName = getDisplayName(row);
      return (
        displayName.toLowerCase().includes(query) ||
        (row.user_email || "").toLowerCase().includes(query) ||
        (row.role || "").toLowerCase().includes(query)
      );
    });
  }, [filteredByMode, searchTerm]);

  // helper to resolve student->class
  const resolveClassForEmail = (email: string | undefined | null) => {
    const student = students.find((s) => s.email === email);
    if (!student) return null;
    const cls = classes.find((c) => c.id === student.class_id);
    return { student, classObj: cls || null };
  };

  // helper to resolve teacher department by email
  const resolveTeacherDeptForEmail = (email: string | undefined | null) => {
    if (!email) return null;
    const lower = String(email).toLowerCase();
    const teacher = teachers.find((t) => String(t.email || "").toLowerCase() === lower);
    if (!teacher) return null;
    return teacher.department_name || null;
  };

  // Get display name for row
  const getDisplayName = (row: any) => {
    const role = normalizeRole(row.role);
    const isStudent = role === "student";
    
    if (isStudent) {
      const resolved = resolveClassForEmail(row.user_email);
      if (resolved && resolved.student) {
        return resolved.student.fullname || row.user_name || row.user_email;
      }
    }
    return row.user_name || row.user_email;
  };

  // prev / next date handlers
  const addDays = (dStr: string, delta: number) => {
    const d = new Date(dStr + "T00:00:00");
    d.setDate(d.getDate() + delta);
    return d.toISOString().slice(0, 10);
  };

  const gotoPrev = () => setDateStr((cur) => addDays(cur, -1));
  const gotoNext = () => setDateStr((cur) => addDays(cur, 1));

  // Statistics
  const stats = useMemo(() => {
    const total = filteredByMode.length;
    const present = filteredByMode.filter(a => a.status === "Present").length;
    const absent = filteredByMode.filter(a => a.status === "Absent").length;
    const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { total, present, absent, presentPercentage };
  }, [filteredByMode]);

  // Mode configuration
  const modeConfig = {
    students: { label: "Students", icon: GraduationCap, color: "blue" },
    teachers: { label: "Teachers", icon: Users, color: "green" },
    principal: { label: "Principal", icon: Crown, color: "purple" },
    management: { label: "Management", icon: Shield, color: "orange" },
    admin: { label: "Admin", icon: Settings, color: "red" }
  };

  if (loading) {
    return (
      <DashboardLayout role="management">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading Attendance Data...</div>
            <div className="text-sm text-gray-500 mt-2">Please wait while we fetch all records</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="management">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600">Please check your connection and try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="management">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg">
                  <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    Attendance Dashboard
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">
                    Comprehensive attendance tracking and analytics
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 shadow-sm">
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 shadow-sm">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total {modeConfig[mode].label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <div className="flex items-center gap-1 mt-3">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600 font-medium">On {dateStr}</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Present</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.present}</p>
                  <div className="flex items-center gap-1 mt-3">
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-emerald-600 font-medium">{stats.presentPercentage}% attendance</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                  <UserCheck className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Absent</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.absent}</p>
                  <div className="flex items-center gap-1 mt-3">
                    <UserX className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600 font-medium">{stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% absent</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Date</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(dateStr).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <div className="flex items-center gap-1 mt-3">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-purple-600 font-medium">Selected date</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Role Selection */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-3">View Attendance For</label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(modeConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setMode(key as any)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                        mode === key 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {config.icon && <config.icon className="h-4 w-4" />}
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Navigation */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={gotoPrev}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                    />
                  </div>
                  
                  <button 
                    onClick={gotoNext}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            {/* Table Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Attendance Records</h3>
                    <p className="text-sm text-gray-600">
                      {filteredBySearch.length} records found for {modeConfig[mode].label.toLowerCase()} on {dateStr}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>{stats.presentPercentage}% Overall Attendance</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Person
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                      Contact
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    {mode === "students" && (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                          Class
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                          Section
                        </th>
                      </>
                    )}
                    {mode === "teachers" && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                        Department
                      </th>
                    )}
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                      Check In
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                      Check Out
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                      Remarks
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredBySearch.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <UserX className="w-16 h-16 text-gray-300 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Records Found</h3>
                          <p className="text-gray-600 max-w-md">
                            {searchTerm 
                              ? `No ${modeConfig[mode].label.toLowerCase()} found matching "${searchTerm}" for ${dateStr}`
                              : `No attendance records found for ${modeConfig[mode].label.toLowerCase()} on ${dateStr}`
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBySearch.map((row) => {
                      const role = normalizeRole(row.role);
                      const isStudent = role === "student";
                      const isTeacher = role === "teacher";
                      
                      let displayName = getDisplayName(row);
                      let className = "-";
                      let section = "-";
                      let department = "-";

                      if (isStudent) {
                        const resolved = resolveClassForEmail(row.user_email);
                        if (resolved && resolved.classObj) {
                          className = resolved.classObj.class_name || "-";
                          section = resolved.classObj.sec || "-";
                        }
                      } else if (isTeacher) {
                        const dept = resolveTeacherDeptForEmail(row.user_email);
                        if (dept) department = dept;
                      }

                      return (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{displayName}</div>
                                <div className="text-sm text-gray-500">{row.user_email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="text-sm text-gray-900">{row.user_email}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {row.role}
                            </span>
                          </td>
                          
                          {mode === "students" && (
                            <>
                              <td className="px-6 py-4 hidden md:table-cell">
                                <div className="text-sm text-gray-900">{className}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {section}
                                </span>
                              </td>
                            </>
                          )}
                          
                          {mode === "teachers" && (
                            <td className="px-6 py-4 hidden md:table-cell">
                              <div className="text-sm text-gray-900">{department}</div>
                            </td>
                          )}
                          
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              row.status === "Present" 
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                                : "bg-red-100 text-red-700 border border-red-200"
                            }`}>
                              {row.status === "Present" ? (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              {row.status}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {row.check_in || "-"}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {row.check_out || "-"}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {row.remarks || "-"}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-600">
                <div>
                  Showing <span className="font-semibold">{filteredBySearch.length}</span> of{" "}
                  <span className="font-semibold">{filteredByMode.length}</span> records
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <span>Present: <span className="font-semibold text-emerald-600">{stats.present}</span></span>
                  <span>Absent: <span className="font-semibold text-red-600">{stats.absent}</span></span>
                  <span>Rate: <span className="font-semibold text-blue-600">{stats.presentPercentage}%</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}