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
  GraduationCap,
  Users,
  BookMarked,
  Building,
  Contact,
  Eye
} from "lucide-react";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

interface Teacher {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  fullname?: string; // alternative name field
  phone?: string;
  residential_address?: string; // for selected teacher view
  address?: string;
  date_of_birth?: string;
  gender?: string;
  department?: string;
  department_name?: string;
  department_id?: number;
  qualification?: string;
  education?: string;
  experience?: string;
  experience_years?: string | number; // for display
  joining_date?: string;
  date_joined?: string; // alternative field name
  salary?: number;
  profile_image?: string;
  profile_picture?: string; // alternative field name
  is_active?: boolean;
  is_classteacher?: boolean;
  subjects?: string[];
  classes?: string[];
  class_teacher_info?: Class[];
  teacher_id?: number;
  education_level?: string;
  education_level_display?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_no?: string;
  nationality?: string;
  blood_group?: string;
  subject_list?: Subject[];
  // Add other properties that might be used
  [key: string]: unknown;
}

interface Department {
  id: number;
  name: string;
  head?: string;
  description?: string;
  [key: string]: string | number | undefined;
}

interface Class {
  id: number;
  class_name: string;
  section?: string;
  teacher_id?: number;
  [key: string]: string | number | undefined;
}

interface Subject {
  id: number;
  subject_name?: string;
  subject_code?: string;
  description?: string;
}

interface AttendanceRecord {
  id: number;
  teacher_id: number;
  date: string;
  status: 'present' | 'absent' | 'leave';
  check_in_time?: string;
  check_out_time?: string;
  [key: string]: string | number | undefined;
}

interface LeaveRecord {
  id: number;
  teacher_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  [key: string]: string | number | undefined;
}

interface TimetableEntry {
  id: number;
  teacher_id: number;
  class_id: number;
  subject: string;
  day: string;
  start_time: string;
  end_time: string;
  room?: string;
  [key: string]: string | number | undefined;
}

interface Subject {
  id: number;
  subject_name?: string;
  subject_code?: string;
  [key: string]: string | number | undefined;
}

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [filteredTimetable, setFilteredTimetable] = useState<TimetableEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [educationLevelFilter, setEducationLevelFilter] = useState("all");
  const [subjectEducationLevelFilter, setSubjectEducationLevelFilter] = useState("all");

  const handleSubjectSelect = async (subject: Subject) => {
    setSelectedSubject(subject);
    setTimetableLoading(true);

    try {
      // Get the teacher's email for matching
      const teacherEmail = selectedTeacher?.email?.toLowerCase();

      // Filter timetable entries that match both the teacher and the selected subject
      const filtered = timetable.filter((item) => {
        // Match teacher - try multiple possible field names
        const itemTeacher = String(item.teacher || item.teacher_email || '').toLowerCase();
        const matchesTeacher = teacherEmail && itemTeacher === teacherEmail;

        // Match subject - check if any of the timetable item's subject fields match the selected subject
        const itemSubjectId = item.subject ?? item.subject_id ?? item.subject_name_id ?? null;

        // Check for matches using subject ID
        const matchesSubject = itemSubjectId !== null && Number(itemSubjectId) === subject.id;

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
        // Try multiple endpoints to get timetable data
        const endpoints = [
          `${API_BASE}/timetable/`
        ];

        let timetableData = [];

        for (const endpoint of endpoints) {
          try {
            const res = await axios.get(endpoint);
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
              timetableData = res.data;
              break;
            }
          } catch {
          }
        }

        setTimetable(timetableData);
      } catch (error) {
        console.error("Error fetching timetable:", error);
        setTimetable([]); // Set to empty array on error
      }
    };
    fetchTimetable();
  }, []);

  // Fetch all teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        // Fetch teachers, departments, and classes in parallel
        const [teachersRes, departmentsRes, classesRes] = await Promise.all([
          axios.get(`${API_BASE}/teachers/`),
          axios.get(`${API_BASE}/departments/`).catch(err => {
            console.error("Error fetching departments:", err);
            return { data: [] };
          }),
          axios.get(`${API_BASE}/classes/`).catch(err => {
            console.error("Error fetching classes:", err);
            return { data: [] };
          })
        ]);

        setTeachers(teachersRes.data || []);
        setDepartments(departmentsRes.data || []);
        setClasses(classesRes.data || []);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // ✅ Helper function to get education level from teacher ID
  const getEducationLevelFromId = (teacherId: string) => {
    if (!teacherId) return "other";

    const idLower = teacherId.toLowerCase();

    if (idLower.startsWith('n')) return "nursery";
    if (idLower.startsWith('p')) return "primary";
    if (idLower.startsWith('h')) return "highschool";
    if (idLower.startsWith('l')) return "college";
    if (idLower.startsWith('s')) return "school";

    return "other";
  };

  // ✅ Helper function to get education level display name
  const getEducationLevelDisplayName = (level: string) => {
    switch (level) {
      case "nursery": return "Nursery School";
      case "primary": return "Primary School";
      case "highschool": return "High School";
      case "college": return "College";
      case "school": return "School";
      default: return "Other";
    }
  };



  // ✅ Helper function to get education level color
  const getEducationLevelColor = (level: string) => {
    switch (level) {
      case "nursery": return "from-pink-500 to-rose-500";
      case "primary": return "from-green-500 to-emerald-500";
      case "highschool": return "from-blue-500 to-indigo-500";
      case "college": return "from-purple-500 to-violet-500";
      case "school": return "from-orange-500 to-amber-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  // ✅ Helper function to get education level badge color
  const getEducationLevelBadgeColor = (level: string) => {
    switch (level) {
      case "nursery": return "bg-pink-100 text-pink-800 border-pink-200";
      case "primary": return "bg-green-100 text-green-800 border-green-200";
      case "highschool": return "bg-blue-100 text-blue-800 border-blue-200";
      case "college": return "bg-purple-100 text-purple-800 border-purple-200";
      case "school": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Fetch teacher details dynamically
  const fetchTeacherDetails = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setLoading(true);
    setActiveTab("overview");
    setSelectedSubject(null);
    setFilteredTimetable([]);

    try {
      // Try to fetch teacher-specific data
      const teacherEmail = teacher.email?.toLowerCase();

      // Fetch all required data in parallel
      const [attendanceRes, leavesRes, timetableRes, subjectsRes] = await Promise.all([
        axios.get(`${API_BASE}/attendance/`).catch(err => {
          console.error("[TEACHER DETAILS] Error fetching attendance:", err);
          return { data: [] };
        }),
        axios.get(`${API_BASE}/leaves/`).catch(err => {
          console.error("[TEACHER DETAILS] Error fetching leaves:", err);
          return { data: [] };
        }),
        axios.get(`${API_BASE}/timetable/`).catch(err => {
          console.error("[TEACHER DETAILS] Error fetching timetable:", err);
          return { data: [] };
        }),
        axios.get(`${API_BASE}/subjects/`).catch(err => {
          console.error("[TEACHER DETAILS] Error fetching subjects:", err);
          return { data: [] };
        }),
      ]);

      // If the teacher is a class teacher, fetch class information
      let classTeacherInfo = null;
      if (teacher.is_classteacher === true) {
        // Find classes where this teacher is the class teacher
        classTeacherInfo = classes.filter(cls =>
          String(cls.class_teacher_email)?.toLowerCase() === teacherEmail ||
          String(cls.class_teacher_name)?.toLowerCase() === String(teacher.fullname)?.toLowerCase()
        );
      }

      const allAttendance = attendanceRes.data || [];
      const allLeaves = leavesRes.data || [];
      const allTimetable = timetableRes.data || [];
      const allSubjects = subjectsRes.data || [];


      // Filter timetable for this specific teacher
      const teacherTimetable = allTimetable.filter((t: TimetableEntry) => {
        const itemTeacher = String(t.teacher || t.teacher_email || '').toLowerCase();
        const isMatch = itemTeacher === teacherEmail;
        return isMatch;
      });


      // Match attendance records by user_email or user_id (DB may expose either)
      const teacherAttendance = allAttendance.filter((a: AttendanceRecord) => {
        const email = teacher.email?.toLowerCase();
        if (!email) return false;

        const userEmail = String(a.user_email ?? a.user_id ?? '').toLowerCase();
        return userEmail === email;
      });

      const teacherLeaves = allLeaves.filter(
        (l: LeaveRecord) => l.applicant_email === teacher.email
      );

      // Enhance teacher data with department name if needed
      const enhancedTeacher = { ...teacher };
      if (teacher.department_id && !teacher.department_name) {
        const dept = departments.find(d => d.id === teacher.department_id);
        if (dept) {
          enhancedTeacher.department_name = dept.name;
        }
      }

      // Get education level from teacher ID
      enhancedTeacher.education_level = getEducationLevelFromId(String(teacher.teacher_id ?? ''));
      enhancedTeacher.education_level_display = getEducationLevelDisplayName(enhancedTeacher.education_level);

      // Get subjects for this teacher from timetable
      const teacherSubjectIds = [...new Set(teacherTimetable.map((item: TimetableEntry) =>
        item.subject ?? item.subject_id ?? item.subject_name_id
      ).filter(Boolean))];

      const teacherSubjects = teacherSubjectIds.map(id => {
        const subject = allSubjects.find((s: { id: number; subject_name?: string; subject_code?: string }) => s.id === id);
        return subject || { id, subject_name: `Subject ${id}`, subject_code: '' };
      });

      // Add subjects to teacher data
      enhancedTeacher.subject_list = teacherSubjects;

      // Add class teacher information if applicable
      if (classTeacherInfo && classTeacherInfo.length > 0) {
        enhancedTeacher.class_teacher_info = classTeacherInfo;
      }

      setSelectedTeacher(enhancedTeacher);
      setAttendance(teacherAttendance);
      setLeaves(teacherLeaves);
      setTimetable(teacherTimetable); // Set teacher-specific timetable

    } catch (error) {
      console.error("Error fetching teacher details:", error);
      setAttendance([]);
      setLeaves([]);
      setTimetable([]); // Clear timetable on error
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
    const teacherAttendance = attendance.filter((a: AttendanceRecord) => {
      const email = selectedTeacher?.email?.toLowerCase();
      if (!email) return false;

      const userEmail = String(a.user_email ?? a.user_id ?? '').toLowerCase();
      return userEmail === email;
    });

    const totalDays = teacherAttendance.length;
    const presentDays = teacherAttendance.filter((a: AttendanceRecord) => a.status === "present").length;
    const absentDays = teacherAttendance.filter((a: AttendanceRecord) => a.status === "absent").length;
    const approvedLeaves = leaves.filter((l: LeaveRecord) => l.status === "approved").length;
    const pendingLeaves = leaves.filter((l: LeaveRecord) => l.status === "pending").length;

    const subjectList = Array.isArray(selectedTeacher?.subject_list) ? selectedTeacher?.subject_list : [];
    const totalSubjects = subjectList.length;

    // Classes should be counted only where this teacher actually teaches
    const teacherEmail = selectedTeacher?.email?.toLowerCase();

    const teacherClasses = timetable.filter((item: TimetableEntry) => {
      // More flexible teacher matching
      const itemTeacher = String(item.teacher || item.teacher_email || '').toLowerCase();
      const matchesTeacher = teacherEmail ? itemTeacher === teacherEmail : false;

      // If we don't have subject list, we can't filter by subject, so just match teacher
      if (subjectList.length === 0) {
        return matchesTeacher;
      }

      // Match by subject if we have subject list
      const itemSubjectId = item.subject ?? item.subject_id ?? item.subject_name_id;
      const teacherSubjectIds = subjectList.map((subject) => {
        // Handle both string arrays and object arrays
        if (typeof subject === 'object' && subject !== null && 'id' in subject) {
          return (subject as { id: number }).id;
        }
        return subject;
      });
      const matchesSubject = teacherSubjectIds.some(id => id == Number(itemSubjectId));

      return matchesTeacher && matchesSubject;
    });

    // Treat each class+section pair as a distinct class
    const uniqueClasses = [
      ...new Set(
        teacherClasses.map((item: TimetableEntry) => {
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
      attendancePercentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0.0",
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
    const matchesSearch = String(teacher.fullname)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(teacher.teacher_id)?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = departmentFilter === "all" || teacher.department_name === departmentFilter;

    // Filter by education level based on teacher ID prefix
    const teacherEducationLevel = getEducationLevelFromId(String(teacher.teacher_id ?? ''));
    const matchesEducationLevel = educationLevelFilter === "all" || teacherEducationLevel === educationLevelFilter;

    return matchesSearch && matchesDepartment && matchesEducationLevel;
  });

  // Get unique departments for filter
  const uniqueDepartments = [...new Set(teachers.map(teacher => {
    // If teacher has department_name, use it directly
    if (teacher.department_name) return teacher.department_name;

    // If teacher has department_id, try to find department name
    if (teacher.department_id) {
      const dept = departments.find(d => d.id === teacher.department_id);
      return dept ? dept.department_name : `Department ${teacher.department_id}`;
    }

    return "General Department";
  }))];

  // Export teacher data
  const exportTeacherData = () => {
    if (!selectedTeacher) return;

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
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, ID or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium min-w-[180px]"
                  >
                    <option value="all">All Departments</option>
                    {uniqueDepartments.filter(dept => typeof dept === 'string').map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>

                  <select
                    value={educationLevelFilter}
                    onChange={(e) => setEducationLevelFilter(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium min-w-[180px]"
                  >
                    <option value="all">All Levels</option>
                    <option value="school">School</option>
                    <option value="college">College</option>
                  </select>

                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm">
                    <Filter className="w-4 h-4" />
                    <span>{filteredTeachers.length} Matches</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTeachers.map((teacher) => {
                  const educationLevel = getEducationLevelFromId(String(teacher.teacher_id ?? ''));
                  const educationLevelDisplay = getEducationLevelDisplayName(educationLevel);
                  const educationLevelBadgeColor = getEducationLevelBadgeColor(educationLevel);

                  return (
                    <div
                      key={teacher.id || teacher.email}
                      onClick={() => fetchTeacherDetails(teacher)}
                      className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:border-blue-100 overflow-hidden flex flex-col items-center p-6 cursor-pointer relative"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${educationLevelBadgeColor} border`}>
                          {educationLevelDisplay}
                        </span>
                      </div>

                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                        <Image
                          src={typeof teacher.profile_picture === 'string' ? teacher.profile_picture : "https://i.pravatar.cc/150?img=12"}
                          alt={typeof teacher.fullname === 'string' ? teacher.fullname : "Teacher"}
                          width={100}
                          height={100}
                          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full z-20 shadow-sm" />
                      </div>

                      <div className="text-center w-full space-y-2 relative z-10">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {typeof teacher.fullname === 'string' ? teacher.fullname : "Teacher"}
                        </h3>
                        <p className="text-sm font-bold text-blue-500 uppercase tracking-wide">
                          {teacher.department_name || (teacher.department_id ? `Dept ${teacher.department_id}` : (teacher.department || "General"))}
                        </p>
                        <p className="text-gray-500 text-xs line-clamp-2 max-w-[200px] mx-auto min-h-[32px]">
                          {teacher.qualification || teacher.education || "Qualification N/A"}
                        </p>

                        <div className="pt-6 flex items-center justify-center gap-2 border-t border-gray-50 mt-4">
                          <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">
                            Exp: {teacher.experience_years}y
                          </span>
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">
                            ID: {teacher.teacher_id}
                          </span>
                        </div>

                        {teacher.is_classteacher === true && (
                          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-center gap-2 text-purple-600">
                            <GraduationCap className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Class Teacher</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                    onClick={() => {
                      setSearchTerm("");
                      setDepartmentFilter("all");
                      setEducationLevelFilter("all");
                    }}
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
            <div className={`bg-gradient-to-br ${getEducationLevelColor(selectedTeacher.education_level || 'default')} rounded-3xl p-6 sm:p-8 md:p-12 text-white shadow-2xl relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative flex-shrink-0">
                  <Image
                    src={selectedTeacher.profile_picture || "https://i.pravatar.cc/150?img=12"}
                    alt={selectedTeacher.fullname || 'Teacher Profile'}
                    width={160}
                    height={160}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] border-4 border-white/50 shadow-2xl mx-auto md:mx-0 object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-white rounded-full shadow-lg" />
                </div>

                <div className="flex-1 text-center md:text-left space-y-6">
                  <div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                      <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20">
                        {selectedTeacher.education_level_display}
                      </span>
                      {selectedTeacher.is_classteacher && (
                        <span className="px-4 py-1.5 bg-purple-500/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20 flex items-center gap-2">
                          <GraduationCap className="w-3 h-3" />
                          Class Teacher
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2">{selectedTeacher.fullname}</h1>
                    <p className="text-blue-100 text-lg sm:text-xl font-bold uppercase tracking-widest opacity-90">
                      {selectedTeacher.department_name || "General Department"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <div className="p-2 bg-white/10 rounded-xl">
                        <Mail className="w-5 h-5 text-blue-200" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Email Address</p>
                        <p className="font-medium truncate max-w-[200px]">{selectedTeacher.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <div className="p-2 bg-white/10 rounded-xl">
                        <Phone className="w-5 h-5 text-blue-200" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Phone Number</p>
                        <p className="font-medium">{selectedTeacher.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <div className="p-2 bg-white/10 rounded-xl">
                        <MapPin className="w-5 h-5 text-blue-200" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Residential</p>
                        <p className="font-medium truncate max-w-[200px]">{selectedTeacher.residential_address || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: "Attendance", value: `${stats.attendancePercentage}%`, icon: TrendingUp, color: "blue" },
                { label: "Subjects", value: stats.totalSubjects, icon: BookOpen, color: "green" },
                { label: "Classes", value: stats.totalClasses, icon: Building, color: "purple" },
                { label: "Leaves", value: stats.approvedLeaves, icon: CheckCircle, color: "orange" }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 flex items-center gap-6 group hover:scale-[1.02] transition-all">
                  <div className={`p-4 bg-${stat.color}-500/10 rounded-2xl group-hover:bg-${stat.color}-500/20 transition-colors`}>
                    <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto pb-1">
                  {['overview', 'subjects', 'attendance', 'leaves', 'contact', 'analytics'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm transition-all whitespace-nowrap border-b-2 ${activeTab === tab
                        ? "text-blue-600 border-blue-600 bg-blue-50/50"
                        : "text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-50"
                        }`}
                    >
                      {tab === "overview" && <User className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
                      {tab === "subjects" && <BookMarked className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
                      {tab === "attendance" && <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
                      {tab === "leaves" && <Clock className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
                      {tab === "contact" && <Contact className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
                      {tab === "analytics" && <BarChart3 className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
                      {tab === "overview" && <span className="hidden xs:inline">Overview</span>}
                      {tab === "subjects" && <span className="hidden xs:inline">Subjects & Classes</span>}
                      {tab === "attendance" && <span className="hidden xs:inline">Attendance</span>}
                      {tab === "leaves" && <span className="hidden xs:inline">Leave History</span>}
                      {tab === "contact" && <span className="hidden xs:inline">Contact Info</span>}
                      {tab === "analytics" && <span className="hidden xs:inline">Analytics</span>}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* ✅ Overview Tab */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                          <User className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">Personal Details</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { label: "Full Name", value: selectedTeacher.fullname },
                          { label: "Level", value: selectedTeacher.education_level_display },
                          { label: "Gender", value: selectedTeacher.gender },
                          { label: "DOB", value: selectedTeacher.date_of_birth },
                          { label: "Nationality", value: selectedTeacher.nationality },
                          { label: "Blood Group", value: selectedTeacher.blood_group }
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                            <p className="font-bold text-gray-900">{item.value || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Professional Info */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-500/10 rounded-2xl text-green-600">
                          <Award className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">Professional Details</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { label: "Teacher ID", value: selectedTeacher.teacher_id },
                          { label: "Department", value: selectedTeacher.department_name },
                          { label: "Qualification", value: selectedTeacher.qualification || selectedTeacher.education },
                          { label: "Experience", value: `${selectedTeacher.experience_years} Years` },
                          { label: "Joined Date", value: selectedTeacher.date_joined }
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                            <p className="font-bold text-gray-900">{item.value || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Subjects & Classes Tab - Same as before */}
                {activeTab === "subjects" && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Class Teacher Information */}
                    {selectedTeacher.is_classteacher === true && (
                      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600">
                            <GraduationCap className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-black text-gray-900">Class Responsibilities</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {selectedTeacher.class_teacher_info?.map((cls: Class, i: number) => (
                            <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 group hover:bg-white hover:shadow-xl transition-all">
                              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned Class</div>
                              <div className="text-lg font-black text-gray-900 mb-4">{cls.class_name}</div>
                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="text-xs font-bold text-gray-500">SECTION {cls.sec || "N/A"}</div>
                                <div className="text-[10px] text-gray-400 font-mono">ID: {cls.id}</div>
                              </div>
                            </div>
                          )) || (
                              <div className="col-span-full py-12 text-center text-gray-500 font-bold">No assigned classes found</div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Subjects */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-500/10 rounded-2xl text-green-600">
                            <BookMarked className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-black text-gray-900">Expertise & Subjects</h3>
                        </div>
                        <select
                          value={subjectEducationLevelFilter}
                          onChange={(e) => setSubjectEducationLevelFilter(e.target.value)}
                          className="px-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="all">All Levels</option>
                          <option value="school">School</option>
                          <option value="college">College</option>
                        </select>
                      </div>

                      {selectedTeacher.subject_list && selectedTeacher.subject_list.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                          {selectedTeacher.subject_list
                            .filter((subject: Subject) => {
                              if (subjectEducationLevelFilter === "all") return true;

                              // Check if subject education matches filter
                              // Determination logic (approximated for UI cleanup):
                              const isCollege = subject.subject_name?.toLowerCase().includes('college') ||
                                selectedTeacher.education_level === 'college';
                              const isSchool = !isCollege;

                              return (subjectEducationLevelFilter === "college" && isCollege) ||
                                (subjectEducationLevelFilter === "school" && isSchool);
                            })
                            .map((subject: Subject, i: number) => (
                              <div
                                key={i}
                                onClick={() => handleSubjectSelect(subject)}
                                className={`p-6 rounded-2xl border transition-all cursor-pointer relative group ${selectedSubject?.id === subject.id
                                  ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200"
                                  : "bg-gray-50 border-gray-100 hover:bg-white hover:shadow-xl hover:border-blue-100"
                                  }`}
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${selectedSubject?.id === subject.id ? "text-blue-100" : "text-gray-400"}`}>Subject Code: {subject.subject_code}</div>
                                    <div className={`text-lg font-black ${selectedSubject?.id === subject.id ? "text-white" : "text-gray-900"}`}>{subject.subject_name}</div>
                                  </div>
                                  <div className={`p-2 rounded-lg ${selectedSubject?.id === subject.id ? "bg-white/20" : "bg-blue-500/10 text-blue-600"}`}>
                                    <Eye className="w-4 h-4" />
                                  </div>
                                </div>
                                <div className={`text-xs font-bold ${selectedSubject?.id === subject.id ? "text-blue-100" : "text-gray-500"}`}>
                                  ID: {subject.id}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="py-20 text-center space-y-4">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <BookMarked className="w-8 h-8 text-gray-200" />
                          </div>
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No subjects assigned</p>
                        </div>
                      )}
                    </div>

                    {/* Classes from Timetable for selected subject */}
                    {selectedSubject && (
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg sm:rounded-xl">
                              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            </div>
                            Classes Assigned — <span className="text-blue-600 ml-1.5 sm:ml-2 text-sm sm:text-base">{selectedSubject.subject_name}</span>
                          </h3>
                          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full w-fit">
                            {filteredTimetable.length} classes
                          </span>
                        </div>

                        {timetableLoading ? (
                          <div className="flex justify-center items-center py-8 sm:py-12">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-2 sm:mb-3"></div>
                              <p className="text-gray-500 text-sm sm:text-base">Loading classes...</p>
                            </div>
                          </div>
                        ) : filteredTimetable.length > 0 ? (
                          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {filteredTimetable.map((item: TimetableEntry, index: number) => (
                              <div
                                key={`${item.id || index}-${item.class_name || 'unknown'}-${item.section || 'unknown'}`}
                                className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                              >
                                <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors text-sm sm:text-base">
                                  {item.class_name || 'Unnamed Class'}
                                </h4>
                                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">Section:</span>
                                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium">
                                      {item.section || item.sec || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Day:</span>
                                    <span className="text-gray-800 font-medium">{item.day_of_week || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Time:</span>
                                    <span className="text-gray-800 font-medium">
                                      {item.start_time ? `${item.start_time} - ${item.end_time || 'N/A'}` : 'Time not set'}
                                    </span>
                                  </div>
                                  {item.room_number && (
                                    <div className="flex justify-between">
                                      <span className="font-medium">Room:</span>
                                      <span className="text-gray-800 font-medium">{item.room_number}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}                            </div>
                        ) : (
                          <div className="text-center py-8 sm:py-12">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                              <Building className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                            <h4 className="text-gray-700 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">No Classes Found</h4>
                            <p className="text-gray-500 text-xs sm:text-sm">No timetable entries found for this subject. This could be because:</p>
                            <ul className="text-gray-500 text-xs sm:text-sm mt-2 text-left list-disc list-inside max-w-md mx-auto">
                              <li>The teacher hasn&apos;t been assigned classes for this subject</li>
                              <li>Timetable data hasn&apos;t been configured yet</li>
                              <li>There might be a data mismatch between teacher and timetable records</li>
                            </ul>
                          </div>)}
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Attendance Tab - Same as before */}
                {activeTab === "attendance" && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg sm:rounded-xl">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      Attendance Records
                    </h3>
                    {loading ? (
                      <div className="flex justify-center items-center py-8 sm:py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-2 sm:mb-3"></div>
                          <p className="text-gray-500 text-sm sm:text-base">Loading attendance records...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* ✅ Attendance Tab */}
                        {activeTab === "attendance" && (
                          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                                <Calendar className="w-6 h-6" />
                              </div>
                              <h3 className="text-xl font-black text-gray-900">Attendance Log</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {attendance
                                .filter((record: AttendanceRecord) => {
                                  const email = selectedTeacher.email?.toLowerCase();
                                  return email && String(record.user_email)?.toLowerCase() === email;
                                })
                                .map((record, i) => (
                                  <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 group hover:bg-white hover:shadow-xl transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                        </div>
                                        <div className="text-lg font-black text-gray-900">{record.date}</div>
                                      </div>
                                      <div className={`p-2 rounded-lg ${record.status === "present" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                                        {record.status === "present" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Check-in Time</div>
                                      <div className="text-xs font-black text-gray-900">{record.check_in_time || record.check_in || "Absent"}</div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ✅ Leaves Tab */}
                {activeTab === "leaves" && (
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-600">
                        <Clock className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">Leave History</h3>
                    </div>
                    {leaves.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {leaves.map((leave, i) => (
                          <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{leave.leave_type}</div>
                                <div className="text-lg font-black text-gray-900">{leave.start_date} - {leave.end_date}</div>
                              </div>
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${leave.status === "approved" ? "bg-green-50 text-green-700 border-green-100" :
                                leave.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                                  "bg-red-50 text-red-700 border-red-100"
                                }`}>
                                {leave.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 italic">&quot; {leave.reason} &quot;</p>
                            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600">
                                {String(leave.approved_by_email || "?").charAt(0).toUpperCase()}
                              </div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Approved by: <span className="text-gray-900 ml-1">{leave.approved_by_email || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                          <Clock className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No leave records</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Contact Tab */}
                {activeTab === "contact" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                          <Contact className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">Communication</h3>
                      </div>
                      <div className="space-y-6">
                        {[
                          { label: "Email Address", value: selectedTeacher.email, icon: Mail, color: "blue" },
                          { label: "Phone Number", value: selectedTeacher.phone, icon: Phone, color: "green" },
                          { label: "Residential", value: selectedTeacher.residential_address, icon: MapPin, color: "orange" }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-6 group">
                            <div className={`p-4 bg-${item.color}-500/10 rounded-2xl text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                              <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                              <p className="font-black text-gray-900">{item.value || "Not set"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-2xl text-red-600">
                          <User className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">Emergency Contact</h3>
                      </div>
                      <div className="space-y-6">
                        {[
                          { label: "Contact Person", value: selectedTeacher.emergency_contact_name, color: "red" },
                          { label: "Relationship", value: selectedTeacher.emergency_contact_relationship, color: "orange" },
                          { label: "Emergency Phone", value: selectedTeacher.emergency_contact_no, color: "yellow" }
                        ].map((item, i) => (
                          <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="font-black text-gray-900">{item.value || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Analytics Tab */}
                {activeTab === "analytics" && (
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-12">
                      <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">Performance Analytics</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <div>
                          <div className="flex justify-between items-end mb-4">
                            <div className="text-sm font-black text-gray-900">Attendance Rate</div>
                            <div className="text-2xl font-black text-blue-600">{stats.attendancePercentage}%</div>
                          </div>
                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-1000"
                              style={{ width: `${stats.attendancePercentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          {[
                            { label: "Total Days", value: stats.totalDays, color: "gray" },
                            { label: "Present", value: stats.presentDays, color: "green" },
                            { label: "Absent", value: stats.absentDays, color: "red" }
                          ].map((item, i) => (
                            <div key={i} className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                              <div className={`text-xl font-black text-${item.color}-600`}>{item.value}</div>
                              <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 space-y-6">
                          <h4 className="text-lg font-black uppercase tracking-widest opacity-60">Insight Summary</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center py-4 border-b border-white/10">
                              <span className="font-bold">Experience Rating</span>
                              <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black">Expert</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/10">
                              <span className="font-bold">Workload Status</span>
                              <span className="px-4 py-1 bg-green-500/40 rounded-full text-xs font-black">Balanced</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                              <span className="font-bold">Reliability Index</span>
                              <span className="px-4 py-1 bg-blue-500/40 rounded-full text-xs font-black">High</span>
                            </div>
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
