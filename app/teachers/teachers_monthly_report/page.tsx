"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Search,
  Users,
  BookOpen,
  User,
  XCircle,
  Calendar,
  Award,
  Target,
  TrendingUp,
  Clock,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Book,
  Hash,
  Shield,
  Globe,
  UserCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/`;

interface ClassInfo {
  id: number;
  class_name: string;
  sec: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  class_id: number;
  fullname?: string;
  phone?: string;
  contact_number?: string;
  mobile_number?: string;
  address?: string;
  residential_address?: string;
  permanent_address?: string;
  enrollment_date?: string;
  admission_date?: string;
  date_of_admission?: string;
  student_id?: string;
  roll_number?: string;
  registration_number?: string;
  date_of_birth?: string;
  dob?: string;
  gender?: string;
  parent_name?: string;
  father_name?: string;
  mother_name?: string;
  parent_phone?: string;
  parent_contact?: string;
  father_mobile?: string;
  mother_mobile?: string;
  blood_group?: string;
  nationality?: string;
  previous_school?: string;
  academic_year?: string;
  year?: string;
  profile_image?: string;
  profile_picture?: string;
  image?: string;
  avatar?: string;
}

interface AttendanceRecord {
  id?: number;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
  student?: string;
  student_email?: string;
  user_email?: string;
}

interface LeaveRecord {
  id?: number;
  leave_type?: string;
  reason?: string;
  start_date: string;
  end_date: string;
  duration?: number;
  status?: 'Approved' | 'Rejected' | 'Pending';
  applicant_email?: string;
  student_email?: string;
  email?: string;
  user_email?: string;
  student?: string;
}

interface GradeRecord {
  id?: number;
  subject_name?: string;
  subject?: string;
  marks_obtained?: string | number;
  grade?: string | number;
  total_marks?: string | number;
  percentage?: string | number;
  student?: string;
  student_email?: string;
  email?: string;
}

interface TimetableRecord {
  id?: number;
  teacher: string;
  class_id: number;
  subject?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
}

interface StudentPerformance {
  attendance: AttendanceRecord[];
  leaves: LeaveRecord[];
  grades: GradeRecord[];
}

const TeacherMonthlyreport = () => {
  // Removed unused teacherEmail state
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [performance, setPerformance] = useState<StudentPerformance | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);
  const [expandedPerformance, setExpandedPerformance] = useState<number | null>(null);

  // Create refs for scrolling
  const performanceSectionRef = useRef<HTMLDivElement>(null);
  const studentsListRef = useRef<HTMLDivElement>(null);

  // ✅ Helper function to get profile image URL from student object
  const getStudentProfileImage = (student: Student): string | null => {
    // Check all possible image fields
    const imageSources = [
      student.profile_image,
      student.profile_picture,
      student.image,
      student.avatar
    ];

    for (const source of imageSources) {
      if (source) {
        // If it's already a full URL or data URL
        if (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('data:')) {
          return source;
        }

        // If it's a relative path, construct full URL
        if (source.startsWith('/')) {
          return `${API_BASE.replace('/api/', '')}${source.substring(1)}`;
        }

        // If it's just a filename, construct the full URL
        return `${API_BASE}media/${source}`;
      }
    }

    return null; // No image found
  };

  // ✅ Helper function to get student initials
  const getStudentInitials = (student: Student): string => {
    const firstInitial = student.first_name?.[0] || '';
    const lastInitial = student.last_name?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // ✅ Step 1: Fetch teacher's timetable and linked classes
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("userData");
        if (!storedUser) {
          setError("No user data found in localStorage.");
          return;
        }

        const user = JSON.parse(storedUser);

        const timetableRes = await axios.get(`${API_BASE}timetable/`);
        const timetable = timetableRes.data;

        // Filter teacher's timetable
        const teacherTimetables = timetable.filter(
          (t: TimetableRecord) => t.teacher === user.email
        );

        if (teacherTimetables.length === 0) {
          console.warn("⚠️ No classes found for this teacher.");
          setError("No classes found for this teacher.");
          return;
        }

        const classIds = [
          ...new Set(teacherTimetables.map((t: TimetableRecord) => t.class_id)),
        ];

        // Fetch class details
        const classesRes = await axios.get(`${API_BASE}classes/`);
        const allClasses = classesRes.data;

        const teacherClasses = allClasses.filter((cls: ClassInfo) =>
          classIds.includes(cls.id)
        );

        setClasses(teacherClasses);
      } catch (err) {
        console.error("❌ Error fetching teacher data:", err);
        setError("Failed to fetch teacher classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, []);

  // ✅ Step 2: Fetch students for selected class from students API with enhanced details
  const fetchStudents = async (classInfo: ClassInfo) => {
    try {
      setSelectedClass(classInfo);
      setStudents([]);
      setSelectedStudent(null);
      setPerformance(null);
      setExpandedStudent(null);
      setLoadingStudents(true);

      // Fetch all students from students API
      const res = await axios.get(`${API_BASE}students/`);
      const allStudents = res.data;

      // Filter students by class_id
      const classStudents = allStudents.filter(
        (s: Student) => s.class_id === classInfo.id
      );

      // Format student data with enhanced details including all possible image fields
      const formattedStudents: Student[] = classStudents.map((student: Student) => ({
        id: student.id,
        first_name: student.first_name || student.fullname?.split(' ')[0] || 'Unknown',
        last_name: student.last_name || student.fullname?.split(' ').slice(1).join(' ') || 'Student',
        email: student.email,
        class_id: student.class_id,
        fullname: student.fullname || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
        phone: student.phone || student.contact_number || student.mobile_number || 'Not provided',
        address: student.address || student.residential_address || student.permanent_address || 'Not provided',
        enrollment_date: student.enrollment_date || student.admission_date || student.date_of_admission || 'Unknown',
        student_id: student.student_id || student.roll_number || student.registration_number,
        date_of_birth: student.date_of_birth || student.dob,
        gender: student.gender,
        parent_name: student.parent_name || student.father_name || student.mother_name || 'Not provided',
        parent_phone: student.parent_phone || student.parent_contact || student.father_mobile || student.mother_mobile,
        blood_group: student.blood_group,
        nationality: student.nationality,
        previous_school: student.previous_school,
        academic_year: student.academic_year || student.year,
        // Store all possible image fields
        profile_image: student.profile_image,
        profile_picture: student.profile_picture,
        image: student.image,
        avatar: student.avatar
      }));

      setStudents(formattedStudents);

      // Scroll to students section
      setTimeout(() => {
        studentsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error("❌ Error fetching students:", err);
      setError("Failed to fetch students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // ✅ Step 3: Fetch student performance (based on student email) and scroll to performance section
  const fetchStudentPerformance = async (student: Student) => {
    try {
      setSelectedStudent(student);
      setPerformance(null);
      setLoadingPerformance(true);

      // Fetch all data from APIs
      const [attendanceRes, leavesRes, gradesRes] = await Promise.all([
        axios.get(`${API_BASE}student_attendance/`),
        axios.get(`${API_BASE}leaves/`),
        axios.get(`${API_BASE}grades/`),
      ]);

      // Filter attendance by student email
      const attendance = attendanceRes.data.filter((a: AttendanceRecord) => {
        const stuEmail = (
          a.student ||
          a.student_email ||
          a.user_email
        )?.toLowerCase();
        if (!stuEmail || !student.email) return false;
        return stuEmail === student.email.toLowerCase();
      });

      // Filter leaves by student email
      const leaves = leavesRes.data.filter(
        (l: LeaveRecord) =>
          l.applicant_email?.toLowerCase() === student.email.toLowerCase() ||
          l.student_email?.toLowerCase() === student.email.toLowerCase() ||
          l.email?.toLowerCase() === student.email.toLowerCase() ||
          l.user_email?.toLowerCase() === student.email.toLowerCase() ||
          l.student?.toLowerCase() === student.email.toLowerCase()
      );

      // Filter grades by student email
      const grades = gradesRes.data.filter(
        (g: GradeRecord) =>
          g.student?.toLowerCase() === student.email.toLowerCase() ||
          g.student_email?.toLowerCase() === student.email.toLowerCase() ||
          g.email?.toLowerCase() === student.email.toLowerCase()
      );

      setPerformance({ attendance, leaves, grades });

      // Scroll to performance section after data is loaded
      setTimeout(() => {
        performanceSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    } catch (err) {
      console.error("❌ Error fetching performance:", err);
      setError("Failed to fetch performance data.");
    } finally {
      setLoadingPerformance(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Data for charts
  const attendanceData = performance?.attendance?.map((a: AttendanceRecord) => ({
    date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    status: a.status === "Present" ? 1 : 0,
  })) || [];

  const gradesData = performance?.grades?.map((g: GradeRecord) => ({
    subject: g.subject_name || g.subject || 'Unknown Subject',
    grade: parseFloat(String(g.marks_obtained)) || parseFloat(String(g.grade)) || 0,
    totalMarks: parseFloat(String(g.total_marks)) || 100,
    percentage: g.percentage ? parseFloat(String(g.percentage)) :
      Math.round(((parseFloat(String(g.marks_obtained)) || parseFloat(String(g.grade)) || 0) / (parseFloat(String(g.total_marks)) || 100)) * 100),
  })) || [];

  // Performance metrics
  const attendanceSummary = performance?.attendance ? {
    present: performance.attendance.filter(a => a.status === 'Present').length,
    absent: performance.attendance.filter(a => a.status === 'Absent').length,
    leave: performance.attendance.filter(a => a.status === 'Leave').length,
    total: performance.attendance.length,
    attendanceRate: performance.attendance.length > 0 ?
      Math.round((performance.attendance.filter(a => a.status === 'Present').length / performance.attendance.length) * 100) : 0
  } : { present: 0, absent: 0, leave: 0, total: 0, attendanceRate: 0 };

  const gradeSummary = performance?.grades ? {
    average: performance.grades.length > 0 ?
      Math.round(performance.grades.reduce((acc, g) => {
        const marks = parseFloat(String(g.marks_obtained)) || parseFloat(String(g.grade)) || 0;
        const total = parseFloat(String(g.total_marks)) || 100;
        return acc + (marks / total) * 100;
      }, 0) / performance.grades.length) : 0,
    highest: Math.max(...performance.grades.map(g => {
      const marks = parseFloat(String(g.marks_obtained)) || parseFloat(String(g.grade)) || 0;
      const total = parseFloat(String(g.total_marks)) || 100;
      return Math.round((marks / total) * 100);
    })) || 0,
    lowest: Math.min(...performance.grades.map(g => {
      const marks = parseFloat(String(g.marks_obtained)) || parseFloat(String(g.grade)) || 0;
      const total = parseFloat(String(g.total_marks)) || 100;
      return Math.round((marks / total) * 100);
    })) || 0
  } : { average: 0, highest: 0, lowest: 0 };

  const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];

  if (loading)
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 text-xl font-bold mb-2">Loading Dashboard</p>
            <p className="text-gray-500">Please wait while we prepare your data...</p>
            <div className="mt-6 w-48 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-progress" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gray-50">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <XCircle className="text-red-500 w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-8 max-w-md text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg font-semibold"
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Retry Loading
            </span>
          </button>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        <style jsx global>{`
          .professional-card {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border-radius: 12px;
            transition: all 0.3s ease;
            border: 1px solid #e5e7eb;
          }
          .professional-card:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
            transform: translateY(-2px);
          }
          .stat-card {
            border-radius: 10px;
            transition: all 0.2s ease;
          }
          .stat-card:hover {
            transform: scale(1.02);
          }
          .student-card {
            border-radius: 10px;
            transition: all 0.2s ease;
          }
          .student-card:hover {
            border-color: #3b82f6;
          }
          .performance-metric {
            border-radius: 8px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          }
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          .animate-progress {
            animation: progress 3s ease-in-out infinite;
          }
          /* Smooth scroll behavior for the entire page */
          html {
            scroll-behavior: smooth;
          }
        `}</style>

        {/* Header Section */}
        <div className="bg-white professional-card p-4 mb-4">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 text-sm mt-1 max-w-md">
                Manage your classes and track student progress
              </p>
            </div>
          </div>

          {/* Stats Cards - Professional Design */}
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800 text-xs font-semibold uppercase tracking-wide">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{classes.length}</p>
                </div>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 text-xs font-semibold uppercase tracking-wide">Active Class</p>
                  <p className="text-lg font-bold text-gray-900 mt-1 truncate">
                    {selectedClass ? `${selectedClass.class_name}-${selectedClass.sec}` : 'None'}
                  </p>
                </div>
                <div className="p-2 bg-green-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-800 text-xs font-semibold uppercase tracking-wide">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{students.length}</p>
                </div>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100 p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-800 text-xs font-semibold uppercase tracking-wide">Selected Student</p>
                  <p className="text-lg font-bold text-gray-900 mt-1 truncate">
                    {selectedStudent ? selectedStudent.first_name : 'None'}
                  </p>
                </div>
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Section - Professional Card Format */}
        {classes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Your Classes</h2>
                <p className="text-gray-600 text-sm">Select a class to view students</p>
              </div>
            </div>

            {/* Professional Classes Grid */}
            <div className="grid grid-cols-1 gap-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => fetchStudents(cls)}
                  className={`professional-card cursor-pointer p-4 transition-all duration-200 ${selectedClass?.id === cls.id
                    ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50"
                    : "bg-white hover:border-blue-300"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${selectedClass?.id === cls.id
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                        : "bg-gray-100"
                        }`}>
                        <BookOpen className={`w-5 h-5 ${selectedClass?.id === cls.id ? "text-white" : "text-gray-600"
                          }`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {cls.class_name} - {cls.sec}
                        </h3>
                        <p className="text-gray-500 text-sm">Class ID: {cls.id}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${selectedClass?.id === cls.id ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students Section - Professional Design */}
        {selectedClass && (
          <div ref={studentsListRef} className="professional-card bg-white p-4 mb-6">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Students in {selectedClass.class_name} - {selectedClass.sec}
                  </h2>
                  <p className="text-gray-600 text-sm">Click on a student to view detailed performance</p>
                </div>
              </div>

              {/* Search Bar - Enhanced Design */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            {loadingStudents ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3"></div>
                  <p className="text-gray-700 font-medium">Loading students...</p>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">No Students Found</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  {searchTerm ? 'No students match your search criteria.' : 'No students found for this class.'}
                </p>
              </div>
            ) : (
              // Professional Student Cards with Individual Profile Images
              <div className="space-y-3">
                {filteredStudents.map((student) => {
                  const profileImageUrl = getStudentProfileImage(student);
                  const initials = getStudentInitials(student);

                  return (
                    <div
                      key={student.id}
                      className={`student-card transition-all duration-200 ${selectedStudent?.id === student.id
                        ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50"
                        : "bg-white"
                        }`}
                    >
                      {/* Student Card Header - Enhanced Design with Individual Profile Image */}
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => {
                          if (expandedStudent === student.id) {
                            setExpandedStudent(null);
                          } else {
                            setExpandedStudent(student.id);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Individual Student Profile Image */}
                            <div className="relative">
                              {profileImageUrl ? (
                                <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm border-2 border-white">
                                  <Image
                                    src={profileImageUrl}
                                    alt={`${student.first_name} ${student.last_name}`}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // If image fails to load, show initials
                                      e.currentTarget.style.display = 'none';
                                      const placeholder = document.createElement('div');
                                      placeholder.className = `w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${selectedStudent?.id === student.id
                                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                        : "bg-gradient-to-r from-blue-500 to-indigo-600"
                                        }`;
                                      if (initials) {
                                        placeholder.innerHTML = `<span class="text-white font-bold text-sm">${initials}</span>`;
                                      } else {
                                        placeholder.innerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                                      }
                                      e.currentTarget.parentElement?.appendChild(placeholder);
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${selectedStudent?.id === student.id
                                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
                                  }`}>
                                  {initials ? (
                                    <span className="text-white font-bold text-sm">{initials}</span>
                                  ) : (
                                    <User className="w-6 h-6 text-white" />
                                  )}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">
                                {student.first_name} {student.last_name}
                              </h3>
                              <p className="text-gray-500 text-sm">{student.email || 'No email'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {student.student_id && (
                              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                ID: {student.student_id}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchStudentPerformance(student);
                              }}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm"
                            >
                              View Performance
                            </button>
                            {expandedStudent === student.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Student Details - Card Format */}
                      {expandedStudent === student.id && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg shadow-sm">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">{student.phone || 'Not provided'}</span>
                              </div>

                              {student.parent_name && (
                                <div className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg shadow-sm">
                                  <UserCheck className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium">Parent: {student.parent_name}</span>
                                </div>
                              )}

                              {(student.gender || student.date_of_birth) && (
                                <div className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg shadow-sm">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium">
                                    {student.gender} {student.date_of_birth ? `• ${student.date_of_birth}` : ''}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg shadow-sm">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Enrolled: {student.enrollment_date || 'Unknown'}</span>
                              </div>

                              {student.blood_group && (
                                <div className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg shadow-sm">
                                  <Shield className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium">Blood: {student.blood_group}</span>
                                </div>
                              )}

                              {student.nationality && (
                                <div className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg shadow-sm">
                                  <Globe className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium">Nationality: {student.nationality}</span>
                                </div>
                              )}

                              {student.previous_school && (
                                <div className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg shadow-sm">
                                  <Book className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium">Prev: {student.previous_school}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Loading Performance */}
        {loadingPerformance && (
          <div className="professional-card p-6 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-700 font-bold text-lg mb-2">Loading Performance Data</p>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Please wait while we fetch the student&apos;s performance details...
              </p>
              <div className="mt-4 w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Student Performance Section - Professional Design with ref for scrolling */}
        {performance && selectedStudent && (
          <div ref={performanceSectionRef} id="performance-section" className="professional-card bg-white p-4 space-y-6">
            {/* Student Header - Enhanced Design with Individual Profile Image */}
            <div className="professional-card p-5 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-start gap-4">
                {/* Individual Student Profile Image in Performance Section */}
                <div className="relative">
                  {getStudentProfileImage(selectedStudent) ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md border-4 border-white">
                      <Image
                        src={getStudentProfileImage(selectedStudent) as string}
                        alt={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, show placeholder
                          e.currentTarget.style.display = 'none';
                          const placeholder = document.createElement('div');
                          placeholder.className = "w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md";
                          const initials = getStudentInitials(selectedStudent);
                          if (initials) {
                            placeholder.innerHTML = `<span class="text-white font-bold text-lg">${initials}</span>`;
                          } else {
                            placeholder.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                          }
                          e.currentTarget.parentElement?.appendChild(placeholder);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      {getStudentInitials(selectedStudent) ? (
                        <span className="text-white font-bold text-lg">{getStudentInitials(selectedStudent)}</span>
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h2>

                  {/* Student Info - Card Format */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{selectedStudent.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{selectedStudent.phone || 'Not provided'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{selectedStudent.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Student Info - Enhanced Expandable Section */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <button
                  className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors"
                  onClick={() => setExpandedPerformance(expandedPerformance === selectedStudent.id ? null : selectedStudent.id)}
                >
                  {expandedPerformance === selectedStudent.id ? (
                    <>
                      <span>Show Less Details</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Show More Details</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>

                {expandedPerformance === selectedStudent.id && (
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {selectedStudent.student_id && (
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <span>Student ID: {selectedStudent.student_id}</span>
                      </div>
                    )}

                    {selectedStudent.gender && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Gender: {selectedStudent.gender}</span>
                      </div>
                    )}

                    {selectedStudent.date_of_birth && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>DOB: {selectedStudent.date_of_birth}</span>
                      </div>
                    )}

                    {selectedStudent.parent_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <UserCheck className="w-4 h-4 text-gray-500" />
                        <span>Parent: {selectedStudent.parent_name}</span>
                      </div>
                    )}

                    {selectedStudent.parent_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>Parent Contact: {selectedStudent.parent_phone}</span>
                      </div>
                    )}

                    {selectedStudent.blood_group && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span>Blood Group: {selectedStudent.blood_group}</span>
                      </div>
                    )}

                    {selectedStudent.nationality && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span>Nationality: {selectedStudent.nationality}</span>
                      </div>
                    )}

                    {selectedStudent.previous_school && (
                      <div className="flex items-center gap-2 text-sm">
                        <Book className="w-4 h-4 text-gray-500" />
                        <span>Previous School: {selectedStudent.previous_school}</span>
                      </div>
                    )}

                    {selectedStudent.academic_year && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Academic Year: {selectedStudent.academic_year}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Performance Stats - Professional Layout */}
            <div className="grid grid-cols-1 gap-4">
              <div className="performance-metric bg-gradient-to-br from-blue-50 to-blue-100 p-5 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Attendance Summary</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                    <p className="text-green-700 text-sm font-semibold">Present</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{attendanceSummary.present}</p>
                    <p className="text-gray-500 text-xs mt-1">days</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                    <p className="text-red-700 text-sm font-semibold">Absent</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{attendanceSummary.absent}</p>
                    <p className="text-gray-500 text-xs mt-1">days</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                    <p className="text-yellow-700 text-sm font-semibold">On Leave</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{attendanceSummary.leave}</p>
                    <p className="text-gray-500 text-xs mt-1">days</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                    <p className="text-gray-700 text-sm font-semibold">Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{attendanceSummary.total}</p>
                    <p className="text-gray-500 text-xs mt-1">days</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Attendance Rate</span>
                    <span className="text-2xl font-bold text-gray-900">{attendanceSummary.attendanceRate}%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${attendanceSummary.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="performance-metric bg-gradient-to-br from-green-50 to-green-100 p-5 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Grade Performance</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <p className="text-blue-700 text-sm font-semibold">Average Score</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{gradeSummary.average}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <p className="text-green-700 text-sm font-semibold">Highest Score</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{gradeSummary.highest}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <p className="text-orange-700 text-sm font-semibold">Lowest Score</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{gradeSummary.lowest}%</p>
                  </div>
                </div>
              </div>

              <div className="performance-metric bg-gradient-to-br from-purple-50 to-purple-100 p-5 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Leave Status</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <p className="text-green-700 text-sm font-semibold">Approved</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {performance.leaves.filter(l => l.status === 'Approved').length}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <p className="text-yellow-700 text-sm font-semibold">Pending</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {performance.leaves.filter(l => l.status === 'Pending' || !l.status).length}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <p className="text-red-700 text-sm font-semibold">Rejected</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {performance.leaves.filter(l => l.status === 'Rejected').length}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-100 text-center">
                  <p className="font-bold text-gray-900 text-lg">
                    Total Leaves: {performance.leaves.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Section - Enhanced Visualization */}
            <div className="space-y-5">
              {/* Attendance Chart Card */}
              <div className="professional-card p-5 bg-white">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Attendance Trend</h3>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-blue-700">{attendanceSummary.attendanceRate}% Rate</span>
                  </div>
                </div>
                {attendanceData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={attendanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="#6B7280"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#6B7280"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 1]}
                          tickCount={2}
                          tickFormatter={(value) => value === 1 ? 'Present' : 'Absent'}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value) => [value === 1 ? 'Present' : 'Absent', 'Status']}
                          labelStyle={{ fontWeight: 'bold', color: '#1F2937' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="status"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 8, fill: '#2563EB' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No attendance data available.</p>
                  </div>
                )}
              </div>

              {/* Grades Chart Card */}
              <div className="professional-card p-5 bg-white">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Grade Distribution</h3>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-purple-700">Performance</span>
                  </div>
                </div>
                {gradesData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gradesData}
                          dataKey="grade"
                          nameKey="subject"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={45}
                          paddingAngle={3}
                          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                          {gradesData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value) => [`${value}%`, 'Score']}
                          labelStyle={{ fontWeight: 'bold', color: '#1F2937' }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ paddingTop: '20px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No grade data available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tables Section - Professional Design */}
            <div className="space-y-5">
              {/* Grades Table Card */}
              <div className="professional-card overflow-hidden bg-white">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Academic Performance</h3>
                </div>
                {performance?.grades && performance.grades.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-3 text-left font-semibold text-gray-700 uppercase text-xs tracking-wider">Subject</th>
                          <th className="p-3 text-center font-semibold text-gray-700 uppercase text-xs tracking-wider">Marks</th>
                          <th className="p-3 text-center font-semibold text-gray-700 uppercase text-xs tracking-wider">Total</th>
                          <th className="p-3 text-center font-semibold text-gray-700 uppercase text-xs tracking-wider">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {performance.grades.map((grade, index) => {
                          const marks = parseFloat(String(grade.marks_obtained)) || parseFloat(String(grade.grade)) || 0;
                          const total = parseFloat(String(grade.total_marks)) || 100;
                          const percentage = grade.percentage !== undefined ? Number(grade.percentage) : Math.round((marks / total) * 100);

                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="p-3 font-medium text-gray-900">
                                {grade.subject_name || grade.subject || 'Unknown'}
                              </td>
                              <td className="p-3 text-center font-bold text-gray-900">{marks}</td>
                              <td className="p-3 text-center text-gray-600">{total}</td>
                              <td className="p-3 text-center">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${percentage >= 80 ? 'bg-green-100 text-green-800' :
                                  percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                  {percentage}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No grades data available.</p>
                  </div>
                )}
              </div>

              {/* Leave Applications Card */}
              <div className="professional-card overflow-hidden bg-white">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Leave Applications</h3>
                </div>
                {performance?.leaves && performance.leaves.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {performance.leaves.map((leave, index) => (
                      <div key={index} className="p-5 hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {leave.leave_type || 'Leave Application'}
                          </h4>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {leave.status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 italic">
                          &ldquo;{leave.reason || 'No reason provided'}&rdquo;
                        </p>
                        <div className="flex flex-wrap gap-5 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <span className="font-medium">From:</span> {leave.start_date}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <span className="font-medium">To:</span> {leave.end_date}
                            </div>
                          </div>
                          {leave.duration && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <div>
                                <span className="font-medium">Duration:</span> {leave.duration} days
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No leave applications found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom responsive styles for small devices */}
        <style jsx global>{`
          @media (max-width: 640px) {
            .grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            
            .text-sm {
              font-size: 0.8125rem;
              line-height: 1.25rem;
            }
            
            .p-4 {
              padding: 0.875rem;
            }
            
            .gap-4 {
              gap: 0.875rem;
            }
            
            .min-h-screen {
              min-height: calc(100vh - 1rem);
            }
            
            table {
              font-size: 0.75rem;
            }
            
            th, td {
              padding: 0.5rem !important;
            }
          }
          
          @media (max-width: 480px) {
            .grid-cols-2 {
              grid-template-columns: repeat(1, minmax(0, 1fr));
            }
            
            .text-lg {
              font-size: 1.125rem;
              line-height: 1.5rem;
            }
            
            .p-4 {
              padding: 0.75rem;
            }
            
            .gap-4 {
              gap: 0.75rem;
            }
          }
          
          @media (max-width: 360px) {
            .text-base {
              font-size: 0.875rem;
              line-height: 1.25rem;
            }
            
            .text-sm {
              font-size: 0.75rem;
              line-height: 1rem;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default TeacherMonthlyreport;
