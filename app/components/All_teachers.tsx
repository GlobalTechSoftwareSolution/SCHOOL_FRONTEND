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
  GraduationCap,
  Users,
  BookMarked,
  Building,
  Contact,
  Eye,
  School,
  GraduationCap as GraduationCapIcon,
  BookOpen as BookOpenIcon,
  Building as BuildingIcon
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

  // ✅ Helper function to get education level icon
  const getEducationLevelIcon = (level: string) => {
    switch (level) {
      case "nursery": return <BookOpenIcon className="w-4 h-4" />;
      case "primary": return <GraduationCapIcon className="w-4 h-4" />;
      case "highschool": return <School className="w-4 h-4" />;
      case "college": return <BuildingIcon className="w-4 h-4" />;
      case "school": return <School className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
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
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[160px]"
                  >
                    <option value="all">All Departments</option>
                    {uniqueDepartments.filter(dept => typeof dept === 'string').map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>

                  <select
                    value={educationLevelFilter}
                    onChange={(e) => setEducationLevelFilter(e.target.value)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[160px]"
                  >
                    <option value="all">All Education Levels</option>
                    <option value="school">School</option>
                    <option value="college">College</option>
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
              <div className="grid grid-cols-1 xs:grid-cols-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
                {filteredTeachers.map((teacher) => {
                  const educationLevel = getEducationLevelFromId(String(teacher.teacher_id ?? ''));
                  const educationLevelDisplay = getEducationLevelDisplayName(educationLevel);
                  const educationLevelBadgeColor = getEducationLevelBadgeColor(educationLevel);

                  return (
                    <div
                      key={teacher.id || teacher.email}
                      onClick={() => fetchTeacherDetails(teacher)}
                      className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer border border-gray-200/60 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="p-3 xs:p-4 sm:p-5 md:p-6 relative z-10">
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-3 sm:mb-4">
                            <Image
                              src={typeof teacher.profile_picture === 'string' ? teacher.profile_picture : "https://i.pravatar.cc/150?img=12"}
                              alt={typeof teacher.fullname === 'string' ? teacher.fullname : "Teacher"}
                              width={80}
                              height={80}
                              className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white shadow-lg group-hover:border-blue-100 transition-colors"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1 px-2">
                            {typeof teacher.fullname === 'string' ? teacher.fullname : "Teacher"}
                          </h3>

                          <p className="text-xs sm:text-sm text-blue-600 font-semibold mt-1 px-2 line-clamp-1">
                            {teacher.department_name || (teacher.department_id ? `Department ${teacher.department_id}` : (teacher.department || "General Department"))}
                          </p>

                          {/* Education Level Badge */}
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${educationLevelBadgeColor} border`}>
                              {getEducationLevelIcon(educationLevel)}
                              <span className="ml-1">{educationLevelDisplay}</span>
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 mt-2 line-clamp-1 px-2">{teacher.qualification || teacher.education || "Qualification not specified"}</p>

                          {/* Show class teacher information */}
                          {teacher.is_classteacher === true && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                Class Teacher
                              </span>
                            </div>
                          )}

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
            <div className={`bg-gradient-to-r ${getEducationLevelColor(selectedTeacher.education_level || 'default')} rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 md:p-8 text-white shadow-xl relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-3 xs:gap-4 sm:gap-5 md:gap-6">
                <div className="relative flex-shrink-0">
                  <Image
                    src={selectedTeacher.profile_picture || "https://i.pravatar.cc/150?img=12"}
                    alt={selectedTeacher.fullname || 'Teacher Profile'}
                    width={128}
                    height={128}
                    className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-lg xs:rounded-xl sm:rounded-2xl border-2 xs:border-2 sm:border-4 border-white/80 shadow-2xl mx-auto lg:mx-0"
                  />
                  <div className="absolute -bottom-1 xs:-bottom-1 sm:-bottom-2 -right-1 xs:-right-1 sm:-right-2 w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-400 border-2 border-white rounded-full shadow-lg"></div>
                </div>

                <div className="flex-1 text-center lg:text-left w-full min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-1">
                    <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold truncate">{selectedTeacher.fullname}</h1>
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                      {/* Education Level Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30`}>
                        {getEducationLevelIcon(selectedTeacher.education_level || 'default')}
                        <span className="ml-1">{selectedTeacher.education_level_display}</span>
                      </span>

                      {selectedTeacher.is_classteacher === true && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          Class Teacher
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-blue-100 text-xs xs:text-sm sm:text-base md:text-lg mb-2 xs:mb-3 sm:mb-4 font-medium truncate">
                    {selectedTeacher.department_name || (selectedTeacher.department_id ? `Department ${selectedTeacher.department_id}` : "General Department")}
                  </p>

                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 xs:gap-2 justify-center lg:justify-start min-w-0">
                      <span className="font-semibold text-blue-200 flex-shrink-0 text-xs">Teacher ID:</span>
                      <span className="font-mono truncate text-xs">{selectedTeacher.teacher_id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 xs:gap-2 justify-center lg:justify-start min-w-0">
                      <Mail className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-blue-200 flex-shrink-0" />
                      <span className="truncate text-xs">{selectedTeacher.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 xs:gap-2 justify-center lg:justify-start">
                      <Phone className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-blue-200 flex-shrink-0" />
                      <span className="text-xs">{selectedTeacher.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 xs:gap-2 justify-center lg:justify-start">
                      <span className="font-semibold text-blue-200 flex-shrink-0 text-xs">Exp:</span>
                      <span className="text-xs">{selectedTeacher.experience_years} yrs</span>
                    </div>
                    <div className="flex items-center gap-1.5 xs:gap-2 justify-center lg:justify-start min-w-0">
                      <span className="font-semibold text-blue-200 flex-shrink-0 text-xs">Qualification:</span>
                      <span className="truncate text-xs">{selectedTeacher.qualification || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 xs:gap-2 justify-center lg:justify-start">
                      <span className="font-semibold text-blue-200 flex-shrink-0 text-xs">Joined:</span>
                      <span className="truncate text-xs">{selectedTeacher.date_joined}</span>
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
                {/* ✅ Overview Tab - Same as before */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Personal Information */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg sm:rounded-xl">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        Personal Information
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        {[
                          { label: "Full Name", value: selectedTeacher.fullname || "N/A" },
                          { label: "Education Level", value: selectedTeacher.education_level_display || "N/A" },
                          { label: "Gender", value: selectedTeacher.gender || "N/A" },
                          { label: "Date of Birth", value: selectedTeacher.date_of_birth || "N/A" },
                          { label: "Nationality", value: selectedTeacher.nationality || "N/A" },
                          { label: "Blood Group", value: selectedTeacher.blood_group || "N/A" }
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-gray-600 font-medium text-sm sm:text-base">{item.label}:</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg sm:rounded-xl">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </div>
                        Professional Details
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        {[
                          { label: "Teacher ID", value: selectedTeacher.teacher_id || "N/A" },
                          { label: "Department", value: selectedTeacher.department_name || (selectedTeacher.department_id ? `Department ${selectedTeacher.department_id}` : "N/A") },
                          { label: "Qualification", value: selectedTeacher.qualification || selectedTeacher.education || "Not specified" },
                          { label: "Experience", value: `${selectedTeacher.experience_years || 0} years` },
                          { label: "Date Joined", value: selectedTeacher.date_joined || "N/A" }
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-gray-600 font-medium text-sm sm:text-base">{item.label}:</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{item.value}</span>
                          </div>
                        ))}
                        {/* Show class teacher information */}
                        {selectedTeacher.is_classteacher === true && selectedTeacher.class_teacher_info && (
                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex justify-between items-start py-1.5 sm:py-2">
                              <span className="text-gray-600 font-medium text-sm sm:text-base">Class Teacher Of:</span>
                              <div className="text-right">
                                {selectedTeacher.class_teacher_info.map((cls: Class, idx: number) => (
                                  <div key={idx} className="font-semibold text-gray-800 text-sm sm:text-base">
                                    {cls.class_name} - Section {cls.sec || "N/A"}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm md:col-span-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg sm:rounded-xl">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </div>
                        Performance Overview
                      </h3>
                      <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 sm:gap-4">
                        {[
                          { value: stats.presentDays, label: "Days Present", color: "text-blue-600", bg: "bg-blue-50" },
                          { value: stats.absentDays, label: "Days Absent", color: "text-red-600", bg: "bg-red-50" },
                          { value: stats.totalSubjects, label: "Subjects", color: "text-green-600", bg: "bg-green-50" },
                          { value: stats.totalClasses, label: "Classes", color: "text-purple-600", bg: "bg-purple-50" }
                        ].map((stat, index) => (
                          <div key={index} className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${stat.bg} text-center group hover:scale-105 transition-transform`}>
                            <div className={`text-xl sm:text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                            <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
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
                      selectedTeacher.class_teacher_info && selectedTeacher.class_teacher_info.length > 0 ? (
                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg sm:rounded-xl">
                              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            </div>
                            Class Teacher Responsibilities
                          </h3>
                          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {selectedTeacher.class_teacher_info.map((cls: Class, index: number) => (
                              <div key={index} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                                <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors text-sm sm:text-base">
                                  {cls.class_name}
                                </h4>
                                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">Section:</span>
                                    <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium">
                                      {cls.sec || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Class ID:</span>
                                    <span className="font-mono text-xs">{cls.id}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg sm:rounded-xl">
                              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            </div>
                            Class Teacher Responsibilities
                          </h3>
                          <div className="text-center py-6">
                            <GraduationCap className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                            <p className="text-gray-600">This teacher is marked as a class teacher, but no class assignments were found.</p>
                          </div>
                        </div>
                      )
                    )}

                    {/* Subjects */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg sm:rounded-xl">
                          <BookMarked className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </div>
                        Subjects Taught
                        {/* Education Level Filter for Subjects */}
                        <div className="ml-auto">
                          <select
                            value={subjectEducationLevelFilter}
                            onChange={(e) => setSubjectEducationLevelFilter(e.target.value)}
                            className="px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value="all">All Levels</option>
                            <option value="school">School</option>
                            <option value="college">College</option>
                          </select>
                        </div>
                      </h3>

                      {selectedTeacher.subject_list && selectedTeacher.subject_list.length > 0 ? (
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {selectedTeacher.subject_list
                            .filter((subject: Subject) => {
                              // If filter is "all", show all subjects
                              if (subjectEducationLevelFilter === "all") return true;

                              // Filter subjects based on the selected education level
                              // We'll determine subject education level by checking associated classes
                              // For each subject, check if it's taught in classes that belong to the selected education level

                              // Get all timetable entries for this subject
                              const subjectTimetableEntries = timetable.filter((item: TimetableEntry) => {
                                const itemSubjectId = item.subject ?? item.subject_id ?? item.subject_name_id ?? null;
                                return itemSubjectId !== null && Number(itemSubjectId) === subject.id;
                              });

                              // If no timetable entries, show based on teacher's education level
                              if (subjectTimetableEntries.length === 0) {
                                return selectedTeacher.education_level === subjectEducationLevelFilter;
                              }

                              // Check if any of the classes for this subject match the selected education level
                              for (const entry of subjectTimetableEntries) {
                                const classInfo = classes.find((cls: Class) => cls.id === entry.class_id);
                                if (classInfo) {
                                  // Get education level from class teacher ID or class name prefix
                                  const classTeacherId = String(classInfo.class_teacher_id || '');
                                  const classEducationLevel = classTeacherId.toLowerCase().startsWith('l') ? 'college' :
                                    classTeacherId.toLowerCase().startsWith('s') ? 'school' :
                                      selectedTeacher.education_level;

                                  if (classEducationLevel === subjectEducationLevelFilter) {
                                    return true;
                                  }
                                }
                              }

                              // Fallback to teacher's education level
                              return selectedTeacher.education_level === subjectEducationLevelFilter;
                            })
                            .map((subject: Subject, index: number) => (
                              <div
                                key={index}
                                onClick={() => handleSubjectSelect(subject)}
                                className={`bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border cursor-pointer transition-all shadow-sm hover:shadow-md group ${selectedSubject?.id === subject.id ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200 hover:border-blue-300"
                                  }`}
                              >
                                <div className="flex items-start justify-between mb-2 sm:mb-3">
                                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                                    {subject.subject_name}
                                  </h4>
                                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                                </div>
                                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
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
                        <div className="text-center py-8 sm:py-12">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <BookMarked className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                          </div>
                          <h4 className="text-gray-700 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">No Subjects Assigned</h4>
                          <p className="text-gray-500 text-xs sm:text-sm">No subjects assigned to this teacher.</p>
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
                        {/* Table view for larger screens */}
                        <div className="hidden sm:block bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  {['Date', 'Day', 'Status', 'Check-in Time'].map((header) => (
                                    <th
                                      key={header}
                                      className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {attendance
                                  .filter((record: AttendanceRecord) => {
                                    const email = selectedTeacher.email?.toLowerCase();
                                    if (!email) return false;

                                    return String(record.user_email)?.toLowerCase() === email;
                                  })
                                  .map((record: AttendanceRecord, index: number) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                                        {record.date}
                                      </td>
                                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                      </td>
                                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold capitalize ${record.status === "present"
                                          ? "bg-green-100 text-green-800 border border-green-200"
                                          : "bg-red-100 text-red-800 border border-red-200"
                                          }`}>
                                          {record.status === "present" ? (
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                          ) : (
                                            <XCircle className="w-3 h-3 mr-1" />
                                          )}
                                          {record.status}
                                        </span>
                                      </td>
                                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                                        {record.check_in_time || record.check_in || (
                                          <span className="text-gray-400 text-xs">Not recorded</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Card view for small screens */}
                        <div className="sm:hidden grid grid-cols-1 gap-3">
                          {attendance
                            .filter((record: AttendanceRecord) => {
                              const email = selectedTeacher.email?.toLowerCase();
                              if (!email) return false;

                              return String(record.user_email)?.toLowerCase() === email;
                            })
                            .map((record: AttendanceRecord, index: number) => (
                              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">{record.date}</h4>
                                    <p className="text-xs text-gray-600">
                                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                    </p>
                                  </div>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold capitalize ${record.status === "present"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                    }`}>
                                    {record.status === "present" ? (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    ) : (
                                      <XCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {record.status}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Check-in:</span>
                                  <span className="ml-1">
                                    {record.check_in_time || record.check_in || "Not recorded"}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ✅ Leaves Tab - Same as before */}
                {activeTab === "leaves" && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg sm:rounded-xl">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      </div>
                      Leave History
                    </h3>
                    {loading ? (
                      <div className="flex justify-center items-center py-8 sm:py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-2 sm:mb-3"></div>
                          <p className="text-gray-500 text-sm sm:text-base">Loading leave records...</p>
                        </div>
                      </div>
                    ) : leaves.length > 0 ? (
                      <>
                        {/* Table view for larger screens */}
                        <div className="hidden sm:block bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  {["Leave Type", "Start Date", "End Date", "Reason", "Status", "Approved By"].map((header) => (
                                    <th
                                      key={header}
                                      className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {leaves.map((leave: LeaveRecord, index: number) => (
                                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                                      {leave.leave_type}
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                                      {leave.start_date}
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                                      {leave.end_date}
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 max-w-xs">
                                      <div className="line-clamp-2">{leave.reason}</div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold capitalize ${leave.status === "approved"
                                        ? "bg-green-100 text-green-800 border border-green-200"
                                        : leave.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                          : "bg-red-100 text-red-800 border border-red-200"
                                        }`}>
                                        {leave.status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                                        {leave.status === "pending" && <Clock4 className="w-3 h-3 mr-1" />}
                                        {leave.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                                        {leave.status}
                                      </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                                      {leave.approved_by_email || (
                                        <span className="text-gray-400 text-xs">Not specified</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Card view for small screens */}
                        <div className="sm:hidden grid grid-cols-1 gap-3">
                          {leaves.map((leave: LeaveRecord, index: number) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-sm">{leave.leave_type}</h4>
                                  <p className="text-xs text-gray-600">
                                    {leave.start_date} to {leave.end_date}
                                  </p>
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold capitalize ${leave.status === "approved"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : leave.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                  }`}>
                                  {leave.status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {leave.status === "pending" && <Clock4 className="w-3 h-3 mr-1" />}
                                  {leave.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                                  {leave.status}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 mb-1.5">
                                <span className="font-medium">Reason:</span>
                                <span className="ml-1">{leave.reason}</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Approved by:</span>
                                <span className="ml-1">
                                  {leave.approved_by_email || "Not specified"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <h4 className="text-gray-700 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">No Leave Records</h4>
                        <p className="text-gray-500 text-xs sm:text-sm">No leave records found for this teacher.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Contact Tab - Same as before */}
                {activeTab === "contact" && (
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Contact Information */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg sm:rounded-xl">
                          <Contact className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        Contact Information
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200">
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                          <div>
                            <div className="text-xs sm:text-sm text-gray-500">Email</div>
                            <div className="font-semibold text-sm sm:text-base">{selectedTeacher.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200">
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                          <div>
                            <div className="text-xs sm:text-sm text-gray-500">Phone</div>
                            <div className="font-semibold text-sm sm:text-base">{selectedTeacher.phone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                          <div>
                            <div className="text-xs sm:text-sm text-gray-500">Residential Address</div>
                            <div className="font-semibold text-sm sm:text-base">{selectedTeacher.residential_address || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg sm:rounded-xl">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        </div>
                        Emergency Contact
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm text-gray-500">Contact Person</div>
                            <div className="font-semibold text-sm sm:text-base">{selectedTeacher.emergency_contact_name || "N/A"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Contact className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm text-gray-500">Relationship</div>
                            <div className="font-semibold text-sm sm:text-base">{selectedTeacher.emergency_contact_relationship || "N/A"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm text-gray-500">Emergency Phone</div>
                            <div className="font-semibold text-sm sm:text-base">{selectedTeacher.emergency_contact_no || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Analytics Tab - Same as before */}
                {activeTab === "analytics" && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                      </div>
                      Teacher Analytics
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {/* Attendance Analytics */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Attendance Overview</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Total Days Recorded</span>
                            <span className="font-semibold">{stats.totalDays}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Present Days</span>
                            <span className="font-semibold text-green-600">{stats.presentDays}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Absent Days</span>
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
                      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Workload Summary</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Subjects Assigned</span>
                            <span className="font-semibold">{stats.totalSubjects}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Classes Assigned</span>
                            <span className="font-semibold text-purple-600">{stats.totalClasses}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Teaching Experience</span>
                            <span className="font-semibold text-green-600">{selectedTeacher.experience_years} years</span>
                          </div>
                        </div>
                      </div>

                      {/* Leave Analytics */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm md:col-span-2">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Leave Statistics</h4>
                        <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
                          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl">
                            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.approvedLeaves}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Approved</div>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-xl">
                            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendingLeaves}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Pending</div>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-xl">
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.approvedLeaves + stats.pendingLeaves}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Total Leaves</div>
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
