"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Search,
  Users,
  BookOpen,
  BarChart3,
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
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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

const API_BASE = "https://school.globaltechsoftwaresolutions.cloud/api/";

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
  address?: string;
  enrollment_date?: string;
}

interface StudentPerformance {
  attendance: any[];
  leaves: any[];
  grades: any[];
}

const TeacherMonthlyreport = () => {
  const [teacherEmail, setTeacherEmail] = useState("");
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
        setTeacherEmail(user.email);

        const timetableRes = await axios.get(`${API_BASE}timetable/`);
        const timetable = timetableRes.data;

        // Filter teacher's timetable
        const teacherTimetables = timetable.filter(
          (t: any) => t.teacher === user.email
        );

        if (teacherTimetables.length === 0) {
          console.warn("⚠️ No classes found for this teacher.");
          setError("No classes found for this teacher.");
          return;
        }

        const classIds = [
          ...new Set(teacherTimetables.map((t: any) => t.class_id)),
        ];

        // Fetch class details
        const classesRes = await axios.get(`${API_BASE}classes/`);
        const allClasses = classesRes.data;

        const teacherClasses = allClasses.filter((cls: any) =>
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

  // ✅ Step 2: Fetch students for selected class from students API
  const fetchStudents = async (classInfo: ClassInfo) => {
    try {
      setSelectedClass(classInfo);
      setStudents([]);
      setSelectedStudent(null);
      setPerformance(null);
      setLoadingStudents(true);

      // Fetch all students from students API
      const res = await axios.get(`${API_BASE}students/`);
      const allStudents = res.data;

      // Filter students by class_id
      const classStudents = allStudents.filter(
        (s: any) => s.class_id === classInfo.id
      );

      // Format student data properly
      const formattedStudents: Student[] = classStudents.map((student: any) => ({
        id: student.id,
        first_name: student.first_name || student.fullname?.split(' ')[0] || 'Unknown',
        last_name: student.last_name || student.fullname?.split(' ').slice(1).join(' ') || 'Student',
        email: student.email,
        class_id: student.class_id,
        fullname: student.fullname || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
        phone: student.phone || student.contact_number || 'Not provided',
        address: student.address || student.residential_address || 'Not provided',
        enrollment_date: student.enrollment_date || student.admission_date || 'Unknown'
      }));

      setStudents(formattedStudents);
    } catch (err) {
      console.error("❌ Error fetching students:", err);
      setError("Failed to fetch students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // ✅ Step 3: Fetch student performance (based on student email)
  const fetchStudentPerformance = async (student: Student) => {
    try {
      setSelectedStudent(student);
      setPerformance(null);
      setLoadingPerformance(true);

      // Fetch all data from APIs
      const [attendanceRes, leavesRes, gradesRes] = await Promise.all([
        // ✅ Use student_attendance for student records
        axios.get(`${API_BASE}student_attendance/`),
        axios.get(`${API_BASE}leaves/`),
        axios.get(`${API_BASE}grades/`),
      ]);

      // Filter attendance by student email (student_attendance fields)
      const attendance = attendanceRes.data.filter((a: any) => {
        const stuEmail = (
          a.student ||
          a.student_email ||
          a.user_email
        )?.toLowerCase();

        if (!stuEmail || !student.email) return false;
        return stuEmail === student.email.toLowerCase();
      });

      // Filter leaves by student email (check multiple possible fields)
      const leaves = leavesRes.data.filter(
        (l: any) =>
          l.applicant_email?.toLowerCase() === student.email.toLowerCase() ||
          l.student_email?.toLowerCase() === student.email.toLowerCase() ||
          l.email?.toLowerCase() === student.email.toLowerCase() ||
          l.user_email?.toLowerCase() === student.email.toLowerCase() ||
          l.student?.toLowerCase() === student.email.toLowerCase()
      );

      // Filter grades by student email (check multiple possible fields)
      const grades = gradesRes.data.filter(
        (g: any) =>
          g.student?.toLowerCase() === student.email.toLowerCase() ||
          g.student_email?.toLowerCase() === student.email.toLowerCase() ||
          g.email?.toLowerCase() === student.email.toLowerCase()
      );

      setPerformance({ attendance, leaves, grades });
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
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Data for charts
  const attendanceData = performance?.attendance?.map((a: any) => ({
    date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    status: a.status === "Present" ? 1 : 0,
  })) || [];

  const gradesData = performance?.grades?.map((g: any) => ({
    subject: g.subject_name || g.subject || 'Unknown Subject',
    grade: parseFloat(g.marks_obtained) || parseFloat(g.grade) || 0,
    totalMarks: parseFloat(g.total_marks) || 100,
    percentage: parseFloat(g.percentage) ||
      Math.round(((parseFloat(g.marks_obtained) || parseFloat(g.grade) || 0) / (parseFloat(g.total_marks) || 100)) * 100),
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
        const marks = parseFloat(g.marks_obtained) || parseFloat(g.grade) || 0;
        const total = parseFloat(g.total_marks) || 100;
        return acc + (marks / total) * 100;
      }, 0) / performance.grades.length) : 0,
    highest: Math.max(...performance.grades.map(g => {
      const marks = parseFloat(g.marks_obtained) || parseFloat(g.grade) || 0;
      const total = parseFloat(g.total_marks) || 100;
      return Math.round((marks / total) * 100);
    })) || 0,
    lowest: Math.min(...performance.grades.map(g => {
      const marks = parseFloat(g.marks_obtained) || parseFloat(g.grade) || 0;
      const total = parseFloat(g.total_marks) || 100;
      return Math.round((marks / total) * 100);
    })) || 0
  } : { average: 0, highest: 0, lowest: 0 };

  const COLORS = ["#00C49F", "#0088FE", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  if (loading)
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600 text-lg font-semibold">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="text-red-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6 max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            Retry Loading
          </button>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl lg:shadow-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 border border-white/50 backdrop-blur-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl lg:shadow-2xl">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Teacher Dashboard
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg mt-1 sm:mt-2">
                  Welcome back! Manage your classes and track student progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-lg sm:rounded-xl lg:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <span className="text-gray-700 font-medium text-sm sm:text-base truncate">{teacherEmail}</span>
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 text-white shadow-md sm:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Classes</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">{classes.length}</p>
                </div>
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 text-white shadow-md sm:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm font-medium">Active Class</p>
                  <p className="text-sm sm:text-base md:text-lg font-bold mt-1 sm:mt-2 truncate">
                    {selectedClass ? `${selectedClass.class_name}-${selectedClass.sec}` : 'Not Selected'}
                  </p>
                </div>
                <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 text-white shadow-md sm:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm font-medium">Total Students</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">{students.length}</p>
                </div>
                <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 text-white shadow-md sm:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs sm:text-sm font-medium">Selected Student</p>
                  <p className="text-sm sm:text-base md:text-lg font-bold mt-1 sm:mt-2 truncate">
                    {selectedStudent ? selectedStudent.first_name : 'None'}
                  </p>
                </div>
                <Award className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-orange-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Classes Section */}
        {classes.length > 0 && (
          <div key="classes-section" className="mb-6 sm:mb-8 md:mb-10">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Your Classes</h2>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base">Select a class to view students</p>
              </div>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => fetchStudents(cls)}
                  className={`cursor-pointer border-2 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 md:p-6 shadow-lg transition-all duration-300 hover:scale-105 group ${
                    selectedClass?.id === cls.id
                      ? "border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-blue-200"
                      : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-xl"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className={`w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      selectedClass?.id === cls.id
                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                        : "bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-blue-400 group-hover:to-blue-500"
                    }`}>
                      <BookOpen className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">
                        {cls.class_name} - {cls.sec}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">Class ID: {cls.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>View Students</span>
                    </div>
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      selectedClass?.id === cls.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students Section */}
        {selectedClass && (
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 border mb-4 sm:mb-6 md:mb-8 shadow-lg sm:shadow-xl lg:shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 sm:mb-5 md:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
                    Students in {selectedClass.class_name} - {selectedClass.sec}
                  </h2>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base">Click on a student to view detailed performance</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-72 xl:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                />
              </div>
            </div>

            {loadingStudents ? (
              <div key="loading" className="flex justify-center items-center py-12 sm:py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-3 sm:mb-4"></div>
                  <p className="text-green-600 font-semibold text-base sm:text-lg">Loading students...</p>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div key="no-students" className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-5 md:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 text-gray-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No Students Found</h3>
                <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                  {searchTerm ? 'No students match your search criteria.' : 'No students found for this class.'}
                </p>
              </div>
            ) : (
              <div key="student-grid" className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => fetchStudentPerformance(student)}
                    className={`p-4 sm:p-5 md:p-6 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group ${
                      selectedStudent?.id === student.id
                        ? "border-green-600 bg-gradient-to-br from-green-50 to-emerald-100 shadow-green-200"
                        : "border-gray-200 bg-white hover:border-green-400"
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className={`w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 ${
                        selectedStudent?.id === student.id
                          ? "bg-gradient-to-br from-green-500 to-green-600"
                          : "bg-gradient-to-br from-blue-500 to-blue-600"
                      }`}>
                        <User className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg truncate">
                          {student.first_name} {student.last_name}
                        </h3>
                        <p className="text-gray-500 text-xs sm:text-sm font-medium truncate">{student.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-400 text-xs truncate">Enrolled: {student.enrollment_date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Student Contact Info */}
                    <div className="space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{student.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{student.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium">
                        <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">View Performance</span>
                        <span className="xs:hidden">View</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        selectedStudent?.id === student.id ? 'bg-green-600' : 'bg-gray-300'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading Performance */}
        {loadingPerformance && (
          <div key="loading-performance" className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 text-center shadow-lg sm:shadow-xl lg:shadow-2xl">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-b-2 border-purple-600 mb-3 sm:mb-4"></div>
              <p className="text-purple-600 font-semibold text-base sm:text-lg md:text-xl mb-2">Loading Performance Data</p>
              <p className="text-gray-500 text-sm sm:text-base md:text-lg max-w-md mx-auto">
                Please wait while we fetch the student's performance details...
              </p>
            </div>
          </div>
        )}

        {/* Enhanced Student Performance Section */}
        {performance && selectedStudent && (
          <div key="performance-section" className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl lg:shadow-2xl p-4 sm:p-6 md:p-8 border border-white/50 backdrop-blur-lg">
            {/* Student Header */}
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl lg:shadow-2xl">
                  <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 md:mb-3 truncate">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base">
                    <div className="flex items-center gap-2 text-gray-600 truncate">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                      <span className="truncate">{selectedStudent.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 truncate">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                      <span className="truncate">{selectedStudent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 truncate">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                      <span className="truncate">{selectedStudent.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 text-center border border-blue-200">
                  <p className="text-blue-600 text-xs sm:text-sm md:text-base font-medium">Attendance</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-800">{attendanceSummary.attendanceRate}%</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 text-center border border-green-200">
                  <p className="text-green-600 text-xs sm:text-sm md:text-base font-medium">Avg. Grade</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-800">{gradeSummary.average}%</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 text-center border border-purple-200">
                  <p className="text-purple-600 text-xs sm:text-sm md:text-base font-medium">Leaves</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-purple-800">{performance.leaves.length}</p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              {/* Enhanced Attendance Chart */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-800">
                    Attendance Trend
                  </h3>
                  <div className="flex items-center gap-2 text-blue-600">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    <span className="text-xs sm:text-sm md:text-base font-medium">{attendanceSummary.attendanceRate}% Rate</span>
                  </div>
                </div>
                {attendanceData.length > 0 ? (
                  <div className="h-64 sm:h-72 md:h-80 lg:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="date"
                          stroke="#6B7280"
                          fontSize={10}
                          tick={{ fill: '#6B7280' }}
                        />
                        <YAxis
                          stroke="#6B7280"
                          fontSize={10}
                          tick={{ fill: '#6B7280' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            fontSize: '12px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="status"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 5, fill: '#1D4ED8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 md:py-16">
                    <Calendar className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base md:text-lg">No attendance data available.</p>
                  </div>
                )}
              </div>

              {/* Enhanced Grades Chart */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-purple-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-purple-800">
                    Grade Distribution
                  </h3>
                  <div className="flex items-center gap-2 text-purple-600">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    <span className="text-xs sm:text-sm md:text-base font-medium">Performance</span>
                  </div>
                </div>
                {gradesData.length > 0 ? (
                  <div className="h-64 sm:h-72 md:h-80 lg:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gradesData}
                          dataKey="grade"
                          nameKey="subject"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={30}
                          paddingAngle={2}
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                        >
                          {gradesData.map((entry, i) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={COLORS[i % COLORS.length]}
                              stroke="#FFFFFF"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} marks`, name]}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            fontSize: '12px'
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            fontSize: '10px',
                            paddingTop: '10px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 md:py-16">
                    <Award className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base md:text-lg">No grade data available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              {/* Attendance Summary */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-100">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-green-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  Attendance Summary
                </h3>
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 text-sm sm:text-base md:text-lg">Present</span>
                    <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg">{attendanceSummary.present} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-700 text-sm sm:text-base md:text-lg">Absent</span>
                    <span className="font-bold text-red-800 text-sm sm:text-base md:text-lg">{attendanceSummary.absent} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-700 text-sm sm:text-base md:text-lg">On Leave</span>
                    <span className="font-bold text-yellow-800 text-sm sm:text-base md:text-lg">{attendanceSummary.leave} days</span>
                  </div>
                  <div className="pt-2 sm:pt-3 md:pt-4 border-t border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-green-800 font-semibold text-sm sm:text-base md:text-lg">Total Recorded</span>
                      <span className="font-bold text-green-900 text-sm sm:text-base md:text-lg">{attendanceSummary.total} days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grade Performance */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  Grade Performance
                </h3>
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 text-sm sm:text-base md:text-lg">Average Score</span>
                    <span className="font-bold text-blue-800 text-sm sm:text-base md:text-lg">{gradeSummary.average}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 text-sm sm:text-base md:text-lg">Highest Score</span>
                    <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg">{gradeSummary.highest}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-700 text-sm sm:text-base md:text-lg">Lowest Score</span>
                    <span className="font-bold text-orange-800 text-sm sm:text-base md:text-lg">{gradeSummary.lowest}%</span>
                  </div>
                  <div className="pt-2 sm:pt-3 md:pt-4 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800 font-semibold text-sm sm:text-base md:text-lg">Total Subjects</span>
                      <span className="font-bold text-blue-900 text-sm sm:text-base md:text-lg">{performance.grades.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Status */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-100">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-orange-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  Leave Status
                </h3>
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 text-sm sm:text-base md:text-lg">Approved</span>
                    <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg">
                      {performance.leaves.filter(l => l.status === 'Approved').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-700 text-sm sm:text-base md:text-lg">Pending</span>
                    <span className="font-bold text-yellow-800 text-sm sm:text-base md:text-lg">
                      {performance.leaves.filter(l => l.status === 'Pending' || !l.status).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-700 text-sm sm:text-base md:text-lg">Rejected</span>
                    <span className="font-bold text-red-800 text-sm sm:text-base md:text-lg">
                      {performance.leaves.filter(l => l.status === 'Rejected').length}
                    </span>
                  </div>
                  <div className="pt-2 sm:pt-3 md:pt-4 border-t border-orange-200">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-800 font-semibold text-sm sm:text-base md:text-lg">Total Applications</span>
                      <span className="font-bold text-orange-900 text-sm sm:text-base md:text-lg">{performance.leaves.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Tables */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Enhanced Grades Table */}
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-purple-800 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  Academic Performance Details
                </h3>
                {performance?.grades && performance.grades.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg sm:rounded-xl">
                    <table className="w-full text-xs sm:text-sm md:text-base">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                          <th className="text-left p-2 sm:p-3 md:p-4 font-semibold rounded-tl-lg sm:rounded-tl-xl">Subject</th>
                          <th className="text-center p-2 sm:p-3 md:p-4 font-semibold">Marks</th>
                          <th className="text-center p-2 sm:p-3 md:p-4 font-semibold">Total</th>
                          <th className="text-center p-2 sm:p-3 md:p-4 font-semibold">Percentage</th>
                          <th className="text-left p-2 sm:p-3 md:p-4 font-semibold rounded-tr-lg sm:rounded-tr-xl">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performance.grades.map((grade, index) => {
                          const marks = parseFloat(grade.marks_obtained) || parseFloat(grade.grade) || 0;
                          const total = parseFloat(grade.total_marks) || 100;
                          const percentage = grade.percentage || Math.round((marks / total) * 100);

                          return (
                            <tr
                              key={grade.id || `${grade.subject_name || grade.subject || 'subject'}-${grade.exam_type || 'exam'}-${index}`}
                              className="border-b hover:bg-white transition-colors duration-200 even:bg-gray-50/50"
                            >
                              <td className="p-2 sm:p-3 md:p-4 font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                {grade.subject_name || grade.subject || 'Unknown'}
                              </td>
                              <td className="text-center p-2 sm:p-3 md:p-4 font-semibold">{marks}</td>
                              <td className="text-center p-2 sm:p-3 md:p-4 text-gray-600">{total}</td>
                              <td className="text-center p-2 sm:p-3 md:p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  percentage >= 80 ? 'bg-green-100 text-green-700 border border-green-200' :
                                  percentage >= 60 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                  'bg-red-100 text-red-700 border border-red-200'
                                }`}>
                                  {percentage}%
                                </span>
                              </td>
                              <td className="p-2 sm:p-3 md:p-4 text-gray-600 text-xs sm:text-sm md:text-base truncate max-w-[100px] sm:max-w-none">
                                {grade.remarks || 'No remarks'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 md:py-12">
                    <Award className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base md:text-lg">No grades data available.</p>
                  </div>
                )}
              </div>

              {/* Enhanced Leave Applications */}
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-orange-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  Leave Applications History
                </h3>
                {performance?.leaves && performance.leaves.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    {performance.leaves.map((leave, index) => (
                      <div
                        key={leave.id || `${leave.start_date || 'start'}-${leave.end_date || 'end'}-${index}`}
                        className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3 sm:gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
                              <h4 className="font-semibold text-gray-900 text-base sm:text-lg md:text-xl truncate">
                                {leave.leave_type || 'Leave Application'}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                                leave.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                                leave.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                                'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              }`}>
                                {leave.status || 'Pending'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-2 sm:mb-3 md:mb-4">
                              {leave.reason || 'No reason provided'}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4 xl:gap-6 text-xs sm:text-sm md:text-base text-gray-500">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                <span>From: {leave.start_date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                <span>To: {leave.end_date}</span>
                              </div>
                              {leave.duration && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                  <span>{leave.duration} days</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 md:py-12">
                    <Calendar className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base md:text-lg">No leave applications found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherMonthlyreport;