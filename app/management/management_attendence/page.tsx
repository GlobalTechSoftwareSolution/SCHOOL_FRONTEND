"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Calendar as LucideCalendar,
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
  Crown,
  Shield,
  Settings,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  Book,
  Layers,
  ChevronDown,
  X
} from "lucide-react";

// Type definitions
interface Student {
  id: number;
  fullname: string;
  email: string;
  class_id: number;
  section: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  department_name: string;
}

interface Class {
  id: number;
  class_name: string;
  sec?: string;
  section?: string;
}

interface AttendanceRecord {
  id: number;
  user_email: string;
  user_name: string;
  role: string;
  status: string;
  date: string;
  check_in?: string;
  check_out?: string;
}

const API = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export default function AttendanceByRole() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ui
  const [mode, setMode] = useState<
    "students" | "teachers" | "principal" | "management" | "admin"
  >("students");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateStr = useMemo(() => {
    return selectedDate.toISOString().slice(0, 10);
  }, [selectedDate]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // New state for filtering
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique classes and sections
  const availableClasses = useMemo(() => {
    const classMap = new Map<number, { id: number; name: string; sections: Set<string> }>();

    classes.forEach(cls => {
      if (cls.id && cls.class_name) {
        classMap.set(cls.id, {
          id: cls.id,
          name: cls.class_name,
          sections: new Set()
        });
      }
    });

    // Add sections from students
    students.forEach(student => {
      if (student.class_id && student.section) {
        const cls = classMap.get(student.class_id);
        if (cls) {
          cls.sections.add(student.section);
        }
      }
    });

    return Array.from(classMap.values());
  }, [classes, students]);

  // Extract unique departments
  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    teachers.forEach(teacher => {
      if (teacher.department_name) {
        depts.add(teacher.department_name);
      }
    });
    return Array.from(depts).sort();
  }, [teachers]);

  // helper: normalize role
  const normalizeRole = (r: unknown) => (r ? String(r).toLowerCase() : "");

  // helper to resolve student->class
  const resolveClassForEmail = useCallback((email: string | undefined | null) => {
    // Normalize email to lowercase for comparison
    if (!email) return null;
    const normalizedEmail = email.toLowerCase();
    const student = students.find((s) => s.email && s.email.toLowerCase() === normalizedEmail);

    if (!student) {
      return null;
    }

    const cls = classes.find((c) => c.id === student.class_id);

    if (!cls) {
      return { student, classObj: null };
    }

    return { student, classObj: cls || null };
  }, [students, classes]);

  // helper to resolve teacher department by email
  const resolveTeacherDeptForEmail = (email: string | undefined | null) => {
    if (!email) return null;
    const lower = String(email).toLowerCase();
    const teacher = teachers.find((t) => String(t.email || "").toLowerCase() === lower);
    if (!teacher) return null;
    return teacher.department_name || null;
  };

  // Get display name for row
  const getDisplayName = React.useCallback((row: AttendanceRecord) => {
    const role = normalizeRole(row.role);
    const isStudent = role === "student";

    if (isStudent) {
      const resolved = resolveClassForEmail(row.user_email);
      if (resolved && resolved.student) {
        return resolved.student.fullname || row.user_name || row.user_email;
      }
    }
    return row.user_name || row.user_email;
  }, [resolveClassForEmail]);

  useEffect(() => {
    const load = async () => {
      try {
        // Load all necessary data
        const [stuRes, teaRes, clsRes] = await Promise.all([
          axios.get(`${API}/students/`),
          axios.get(`${API}/teachers/`),
          axios.get(`${API}/classes/`),
        ]);

        setStudents(stuRes.data || []);
        setTeachers(teaRes.data || []);
        setClasses(clsRes.data || []);
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    };

    load();
  }, []);

  // Load attendance data based on mode
  useEffect(() => {
    const loadAttendance = async () => {
      if (loading) return; // Don't load attendance if initial data is still loading

      try {
        // Use different APIs based on mode
        const endpoint = mode === "students"
          ? `${API}/student_attendance/`
          : `${API}/attendance/`;

        // Optimized fetching: append date parameter
        const attRes = await axios.get(`${endpoint}?date=${dateStr}`);

        let normalizedAttendance = [];

        if (mode === "students") {
          normalizedAttendance = (attRes.data || []).map((item: unknown) => {
            const i = item as {
              id: number;
              student?: string;
              student_email?: string;
              email?: string;
              student_name?: string;
              user_name?: string;
              status?: string;
              date?: string;
              check_in?: string;
              check_out?: string;
            };
            return {
              id: i.id || 0,
              role: "student",
              user_email: i.student || i.student_email || i.email || "",
              user_name: i.student_name || i.user_name || "",
              status: i.status || "",
              date: i.date || "",
              check_in: i.check_in,
              check_out: i.check_out,
            } as AttendanceRecord;
          });
        } else {
          // For other roles, normalize the data accordingly
          normalizedAttendance = (attRes.data || []).map((item: unknown) => {
            const i = item as {
              id: number;
              role?: string;
              user_email?: string;
              email?: string;
              user_name?: string;
              name?: string;
              status?: string;
              date?: string;
              check_in?: string;
              check_out?: string;
            };
            // Determine role based on the data or set default based on mode
            const role = i.role || mode;

            return {
              id: i.id || 0,
              role: role,
              user_email: i.user_email || i.email || "",
              user_name: i.user_name || i.name || "",
              status: i.status || "",
              date: i.date || "",
              check_in: i.check_in,
              check_out: i.check_out,
            } as AttendanceRecord;
          });
        }

        setAttendance(normalizedAttendance);
        setAttendance(normalizedAttendance);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    };

    loadAttendance();
  }, [mode, loading, dateStr]);

  // No longer need client-side date filtering since we fetch by date
  const attendanceForDate = attendance;

  // compute rows based on mode with class/section/department filtering
  const filteredByMode = useMemo(() => {
    let rows = attendanceForDate.filter((a) => {
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

    // Apply class/section filtering for students
    if (mode === "students") {
      if (selectedClass !== "all") {
        const classId = parseInt(selectedClass);
        // Get students in this class
        const studentsInClass = students.filter(s => s.class_id === classId);
        const studentEmails = new Set(studentsInClass.map(s => s.email?.toLowerCase()));

        rows = rows.filter(row =>
          studentEmails.has(row.user_email?.toLowerCase())
        );

        // Apply section filtering if a specific section is selected
        if (selectedSection !== "all") {
          const studentsInSection = students.filter(s =>
            s.class_id === classId && s.section === selectedSection
          );
          const sectionStudentEmails = new Set(studentsInSection.map(s => s.email?.toLowerCase()));

          rows = rows.filter(row =>
            sectionStudentEmails.has(row.user_email?.toLowerCase())
          );
        }
      }
    }

    // Apply department filtering for teachers
    if (mode === "teachers" && selectedDepartment !== "all") {
      const teachersInDept = teachers.filter(t =>
        t.department_name === selectedDepartment
      );
      const teacherEmails = new Set(teachersInDept.map(t => t.email?.toLowerCase()));

      rows = rows.filter(row =>
        teacherEmails.has(row.user_email?.toLowerCase())
      );
    }

    return rows;
  }, [attendanceForDate, mode, selectedClass, selectedSection, selectedDepartment, students, teachers]);

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
  }, [filteredByMode, searchTerm, getDisplayName]);



  // Get available sections for selected class
  const availableSectionsForClass = useMemo(() => {
    if (selectedClass === "all") return [];
    const classId = parseInt(selectedClass);
    const cls = availableClasses.find(c => c.id === classId);
    return cls ? Array.from(cls.sections).sort() : [];
  }, [selectedClass, availableClasses]);

  // prev / next date handlers
  const addDays = (d: Date, delta: number) => {
    const newDate = new Date(d);
    newDate.setDate(newDate.getDate() + delta);
    return newDate;
  };

  const gotoPrev = () => setSelectedDate((cur) => addDays(cur, -1));
  const gotoNext = () => setSelectedDate((cur) => addDays(cur, 1));

  // Clear all filters
  const clearFilters = () => {
    setSelectedClass("all");
    setSelectedSection("all");
    setSelectedDepartment("all");
    setSearchTerm("");
  };

  // Statistics
  const stats = useMemo(() => {
    const total = filteredByMode.length;
    const present = filteredByMode.filter(a => a.status === "Present").length;
    const absent = filteredByMode.filter(a => a.status === "Absent").length;
    const leaves = filteredByMode.filter(a => a.status === "Leave").length;
    const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, leaves, presentPercentage };
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 px-2 sm:px-4 py-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl shadow-lg">
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    Attendance Dashboard
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-1">
                    Comprehensive attendance tracking and analytics
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button className="hidden sm:flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 shadow-sm text-xs sm:text-sm">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  Export
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-white border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 shadow-sm text-xs sm:text-sm"
                >
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  <span className="sm:hidden">Filter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total {modeConfig[mode].label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    <span className="text-xs sm:text-sm text-blue-600 font-medium">On {dateStr}</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Present</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.present}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    <span className="text-xs sm:text-sm text-emerald-600 font-medium">{stats.presentPercentage}% attendance</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg sm:rounded-xl">
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Absent</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.absent}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <UserX className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    <span className="text-xs sm:text-sm text-red-600 font-medium">{stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% absent</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-lg sm:rounded-xl">
                  <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Leaves</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.leaves}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    <span className="text-xs sm:text-sm text-yellow-600 font-medium">{stats.total > 0 ? Math.round((stats.leaves / stats.total) * 100) : 0}% on leave</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg sm:rounded-xl">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Date</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{new Date(dateStr).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}</p>
                  <div className="hidden sm:flex items-center gap-1 mt-2">
                    <LucideCalendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                    <span className="text-xs sm:text-sm text-purple-600 font-medium">Selected date</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg sm:rounded-xl">
                  <LucideCalendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-1">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <FiltersSection
                  mode={mode}
                  selectedClass={selectedClass}
                  setSelectedClass={setSelectedClass}
                  selectedSection={selectedSection}
                  setSelectedSection={setSelectedSection}
                  selectedDepartment={selectedDepartment}
                  setSelectedDepartment={setSelectedDepartment}
                  availableClasses={availableClasses}
                  availableSectionsForClass={availableSectionsForClass}
                  availableDepartments={availableDepartments}
                  clearFilters={clearFilters}
                  isMobile={true}
                />
              </div>
            </div>
          )}

          {/* Controls Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
              {/* Role Selection */}
              <div className="flex-1 w-full">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">View Attendance For</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {Object.entries(modeConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setMode(key as keyof typeof modeConfig)}
                      className={`flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm ${mode === key
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {config.icon && <config.icon className="h-3 w-3 sm:h-4 sm:w-4" />}
                      <span className="truncate">{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Filters */}
              <div className="hidden lg:block w-full lg:w-2/3">
                <FiltersSection
                  mode={mode}
                  selectedClass={selectedClass}
                  setSelectedClass={setSelectedClass}
                  selectedSection={selectedSection}
                  setSelectedSection={setSelectedSection}
                  selectedDepartment={selectedDepartment}
                  setSelectedDepartment={setSelectedDepartment}
                  availableClasses={availableClasses}
                  availableSectionsForClass={availableSectionsForClass}
                  availableDepartments={availableDepartments}
                  clearFilters={clearFilters}
                  isMobile={false}
                />
              </div>
            </div>

            {/* Bottom Row - Date & Search */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              {/* Date Navigation */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full sm:w-auto">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={gotoPrev}
                    className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl transition-colors duration-200"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </button>

                  <button
                    onClick={() => setShowCalendarModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 text-xs sm:text-sm font-medium text-gray-700 shadow-sm"
                  >
                    <LucideCalendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    {selectedDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </button>

                  <button
                    onClick={gotoNext}
                    className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl transition-colors duration-200"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </button>
                </div>

                {/* Active Filters Badge for Mobile */}
                <div className="lg:hidden flex flex-wrap gap-2">
                  {(selectedClass !== "all" || selectedSection !== "all" || selectedDepartment !== "all") && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                      <Filter className="h-3 w-3" />
                      <span>Filters Active</span>
                      <button
                        onClick={() => setShowFilters(true)}
                        className="text-blue-700 hover:text-blue-900"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200 w-full sm:w-48 md:w-64 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-wrap gap-2">
              {mode === "students" && selectedClass !== "all" && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs sm:text-sm">
                  <Book className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Class: {availableClasses.find(c => c.id === parseInt(selectedClass))?.name}</span>
                  <button
                    onClick={() => setSelectedClass("all")}
                    className="ml-1 text-blue-700 hover:text-blue-900"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              )}
              {mode === "students" && selectedSection !== "all" && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs sm:text-sm">
                  <Layers className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Section: {selectedSection}</span>
                  <button
                    onClick={() => setSelectedSection("all")}
                    className="ml-1 text-indigo-700 hover:text-indigo-900"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              )}
              {mode === "teachers" && selectedDepartment !== "all" && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm">
                  <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Dept: {selectedDepartment}</span>
                  <button
                    onClick={() => setSelectedDepartment("all")}
                    className="ml-1 text-green-700 hover:text-green-900"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              )}
              {(selectedClass !== "all" || selectedSection !== "all" || selectedDepartment !== "all") && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs sm:text-sm transition-colors"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Cards View for Small Devices */}
          <div className="sm:hidden mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Attendance Records</h3>
              <span className="text-sm text-gray-600">{filteredBySearch.length} records</span>
            </div>

            {filteredBySearch.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 text-center">
                <UserX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No Records Found</h3>
                <p className="text-gray-600 text-sm">
                  {searchTerm
                    ? `No ${modeConfig[mode].label.toLowerCase()} found matching "${searchTerm}"`
                    : `No attendance records found for ${modeConfig[mode].label.toLowerCase()}`
                  }
                  {(selectedClass !== "all" || selectedSection !== "all" || selectedDepartment !== "all") && " with current filters"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredBySearch.map((row) => {
                  const role = normalizeRole(row.role);
                  const isStudent = role === "student";
                  const isTeacher = role === "teacher";

                  const displayName = getDisplayName(row);
                  let className = "-";
                  let section = "-";
                  let department = "-";

                  if (isStudent) {
                    const resolved = resolveClassForEmail(row.user_email);

                    if (resolved && resolved.classObj) {
                      className = resolved.classObj.class_name || "-";
                      // Check both 'sec' and 'section' properties for section data
                      section = resolved.classObj.sec || resolved.classObj.section || "-";
                    }
                  } else if (isTeacher) {
                    const dept = resolveTeacherDeptForEmail(row.user_email);
                    if (dept) department = dept;
                  }

                  return (
                    <div key={row.id} className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{displayName}</h4>
                            <p className="text-gray-500 text-sm">{row.user_email}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${row.status === "Present"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : row.status === "Absent"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          }`}>
                          {row.status === "Present" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : row.status === "Absent" ? (
                            <XCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {row.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Role</p>
                          <p className="text-sm font-medium capitalize">{row.role}</p>
                        </div>

                        {mode === "students" && (
                          <>
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                              <p className="text-xs text-blue-600 font-medium">Class</p>
                              <p className="text-sm font-semibold text-gray-900">{className}</p>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                              <p className="text-xs text-indigo-600 font-medium">Section</p>
                              <p className="text-sm font-semibold text-gray-900">{section}</p>
                            </div>
                          </>
                        )}
                        {mode === "teachers" && (
                          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                            <p className="text-xs text-green-600 font-medium">Department</p>
                            <p className="text-sm font-semibold text-gray-900">{department}</p>
                          </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Check In</p>
                          <p className="text-sm font-medium">{row.check_in || "-"}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Status</p>
                          <p className="text-sm font-medium">{row.status}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table View for Larger Devices */}
          <div className="hidden sm:block bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            {/* Table Header */}
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Attendance Records</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {filteredBySearch.length} {modeConfig[mode].label.toLowerCase()} found
                      {(selectedClass !== "all" || selectedSection !== "all" || selectedDepartment !== "all") ? " with current filters" : ""} on {dateStr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  <span>{stats.presentPercentage}% Overall Attendance</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Person
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                      Contact
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    {mode === "students" && (
                      <>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                          Class
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                          Section
                        </th>
                      </>
                    )}
                    {mode === "teachers" && (
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                        Department
                      </th>
                    )}
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gay-700 uppercase tracking-wider hidden sm:table-cell">
                      Timing
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredBySearch.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <UserX className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4" />
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No Records Found</h3>
                          <p className="text-gray-600 text-xs sm:text-sm max-w-md px-2">
                            {searchTerm
                              ? `No ${modeConfig[mode].label.toLowerCase()} found matching "${searchTerm}" for ${dateStr}`
                              : `No attendance records found for ${modeConfig[mode].label.toLowerCase()} on ${dateStr}`
                            }
                            {(selectedClass !== "all" || selectedSection !== "all" || selectedDepartment !== "all") && " with current filters"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBySearch.map((row) => {
                      const role = normalizeRole(row.role);
                      const isStudent = role === "student";
                      const isTeacher = role === "teacher";

                      const displayName = getDisplayName(row);
                      let className = "-";
                      let section = "-";
                      let department = "-";

                      if (isStudent) {
                        const resolved = resolveClassForEmail(row.user_email);
                        if (resolved && resolved.classObj) {
                          className = resolved.classObj.class_name || "-";
                          section = resolved.classObj.sec || resolved.classObj.section || "-";
                        }
                      } else if (isTeacher) {
                        const dept = resolveTeacherDeptForEmail(row.user_email);
                        if (dept) department = dept;
                      }

                      return (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs sm:text-sm">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-xs sm:text-sm">{displayName}</div>
                                <div className="text-gray-500 text-xs hidden sm:block">{row.user_email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                            <div className="text-gray-900 text-xs sm:text-sm">{row.user_email}</div>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {row.role}
                            </span>
                          </td>

                          {mode === "students" && (
                            <>
                              <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                                <div className="text-gray-900 text-xs sm:text-sm">{className}</div>
                              </td>
                              <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {section}
                                </span>
                              </td>
                            </>
                          )}

                          {mode === "teachers" && (
                            <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                              <div className="text-gray-900 text-xs sm:text-sm">{department}</div>
                            </td>
                          )}

                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                            <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold ${row.status === "Present"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : row.status === "Absent"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              }`}>
                              {row.status === "Present" ? (
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              ) : row.status === "Absent" ? (
                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              )} <br />
                              {row.status}
                            </span>
                          </td>

                          <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-900 text-xs sm:text-sm">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                              {row.check_in || "-"}
                            </div>
                          </td>

                          <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-900 text-xs sm:text-sm">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                              {row.check_out || "-"}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <div>
                  Showing <span className="font-semibold">{filteredBySearch.length}</span> of{" "}
                  <span className="font-semibold">{filteredByMode.length}</span> records
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                  <span>Present: <span className="font-semibold text-emerald-600">{stats.present}</span></span>
                  <span>Absent: <span className="font-semibold text-red-600">{stats.absent}</span></span>
                  <span>Leaves: <span className="font-semibold text-yellow-600">{stats.leaves}</span></span>
                  <span>Rate: <span className="font-semibold text-blue-600">{stats.presentPercentage}%</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCalendarModal(false)}
          />
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md transform transition-all">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Select Date</h3>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="attendance-calendar-wrapper">
              <Calendar
                onChange={(val) => {
                  setSelectedDate(val as Date);
                  setShowCalendarModal(false);
                }}
                value={selectedDate}
                className="w-full border-none shadow-none rounded-2xl"
              />
            </div>

            <button
              onClick={() => {
                setSelectedDate(new Date());
                setShowCalendarModal(false);
              }}
              className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
            >
              Today
            </button>
          </div>
        </div>
      )}

      {/* Global Calendar Styles */}
      <style jsx global>{`
        .attendance-calendar-wrapper .react-calendar {
          width: 100% !important;
          max-width: 100% !important;
          background: white;
          border: none;
          font-family: inherit;
        }
        .attendance-calendar-wrapper .react-calendar__navigation {
          height: 44px;
          margin-bottom: 1rem;
        }
        .attendance-calendar-wrapper .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          border-radius: 12px;
        }
        .attendance-calendar-wrapper .react-calendar__navigation button:enabled:hover,
        .attendance-calendar-wrapper .react-calendar__navigation button:enabled:focus {
          background-color: #f3f4f6;
        }
        .attendance-calendar-wrapper .react-calendar__month-view__weekdays {
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .attendance-calendar-wrapper .react-calendar__month-view__weekdays__weekday {
          padding: 0.5em;
        }
        .attendance-calendar-wrapper .react-calendar__tile {
          padding: 0.75em 0.5em;
          border-radius: 12px;
          transition: all 0.2s;
          font-weight: 500;
        }
        .attendance-calendar-wrapper .react-calendar__tile:enabled:hover,
        .attendance-calendar-wrapper .react-calendar__tile:enabled:focus {
          background-color: #f3f4f6;
          color: #3b82f6;
        }
        .attendance-calendar-wrapper .react-calendar__tile--now {
          background: #eff6ff;
          color: #3b82f6;
        }
        .attendance-calendar-wrapper .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white !important;
          box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
        }
        @media (max-width: 640px) {
          .attendance-calendar-wrapper .react-calendar__tile {
            padding: 0.5em 0.25em;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

// Filters Section Component
function FiltersSection({
  mode,
  selectedClass,
  setSelectedClass,
  selectedSection,
  setSelectedSection,
  selectedDepartment,
  setSelectedDepartment,
  availableClasses,
  availableSectionsForClass,
  availableDepartments,
  clearFilters,
  isMobile
}: {
  mode: string;
  selectedClass: string;
  setSelectedClass: (val: string) => void;
  selectedSection: string;
  setSelectedSection: (val: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (val: string) => void;
  availableClasses: { id: number; name: string; sections: Set<string> }[];
  availableSectionsForClass: string[];
  availableDepartments: string[];
  clearFilters: () => void;
  isMobile: boolean;
}) {
  const filterStyle = isMobile ? "mb-4" : "flex flex-col sm:flex-row gap-3 sm:gap-4";

  return (
    <div className={filterStyle}>
      {/* Class Filter (for students mode) */}
      {mode === "students" && (
        <div className={isMobile ? "mb-4" : "flex-1"}>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Filter by Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection("all"); // Reset section when class changes
            }}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-xs sm:text-sm"
          >
            <option value="all">All Classes</option>
            {availableClasses.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Section Filter (for students mode, when class is selected) */}
      {mode === "students" && selectedClass !== "all" && (
        <div className={isMobile ? "mb-4" : "flex-1"}>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Filter by Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-xs sm:text-sm"
          >
            <option value="all">All Sections</option>
            {availableSectionsForClass.map(section => (
              <option key={section} value={section}>
                Section {section}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Department Filter (for teachers mode) */}
      {mode === "teachers" && (
        <div className={isMobile ? "mb-4" : "flex-1"}>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Filter by Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-xs sm:text-sm"
          >
            <option value="all">All Departments</option>
            {availableDepartments.map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear Filters Button (for mobile) */}
      {isMobile && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm"
          >
            Apply Filters
          </button>
          {(selectedClass !== "all" || selectedSection !== "all" || selectedDepartment !== "all") && (
            <button
              onClick={clearFilters}
              className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
