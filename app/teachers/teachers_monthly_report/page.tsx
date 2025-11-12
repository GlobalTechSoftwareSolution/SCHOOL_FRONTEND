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

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api/";

interface ClassInfo {
  id: number;
  class_name: string;
  section: string;
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
        console.log("👨‍🏫 Logged-in Teacher:", user.email);

        const timetableRes = await axios.get(`${API_BASE}timetable/`);
        const timetable = timetableRes.data;
        console.log("📚 Total timetable entries fetched:", timetable.length);

        // Filter teacher's timetable
        const teacherTimetables = timetable.filter(
          (t: any) => t.teacher === user.email
        );
        console.log("🎯 Teacher's timetable entries:", teacherTimetables);

        if (teacherTimetables.length === 0) {
          console.warn("⚠️ No classes found for this teacher.");
          setError("No classes found for this teacher.");
          return;
        }

        const classIds = [
          ...new Set(teacherTimetables.map((t: any) => t.class_id)),
        ];
        console.log("🆔 Class IDs from timetable:", classIds);

        // Fetch class details
        const classesRes = await axios.get(`${API_BASE}classes/`);
        const allClasses = classesRes.data;
        console.log("🏫 Total classes fetched:", allClasses.length);

        const teacherClasses = allClasses.filter((cls: any) =>
          classIds.includes(cls.id)
        );
        console.log("✅ Filtered classes for teacher:", teacherClasses);

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
      console.log("📘 Fetching students for class:", classInfo);
      setSelectedClass(classInfo);
      setStudents([]);
      setSelectedStudent(null);
      setPerformance(null);
      setLoadingStudents(true);

      // Fetch all students from students API
      const res = await axios.get(`${API_BASE}students/`);
      const allStudents = res.data;
      console.log("👥 Total students fetched from API:", allStudents.length);

      // Filter students by class_id
      const classStudents = allStudents.filter(
        (s: any) => s.class_id === classInfo.id
      );
      console.log(`🎓 Students in class_id ${classInfo.id}:`, classStudents);

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
      console.log("📊 Fetching performance for:", student);
      setSelectedStudent(student);
      setPerformance(null);
      setLoadingPerformance(true);

      // Fetch all data from APIs
      const [attendanceRes, leavesRes, gradesRes] = await Promise.all([
        axios.get(`${API_BASE}attendance/`),
        axios.get(`${API_BASE}leaves/`),
        axios.get(`${API_BASE}grades/`),
      ]);

      console.log("📁 All API responses received");
      console.log("📊 Raw attendance data:", attendanceRes.data.length);
      console.log("📊 Raw leaves data:", leavesRes.data.length);
      console.log("📊 Raw grades data:", gradesRes.data.length);

      // Filter attendance by student email
      const attendance = attendanceRes.data.filter(
        (a: any) => a.user_email?.toLowerCase() === student.email.toLowerCase()
      );

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

      console.log("✅ Filtered attendance records:", attendance.length);
      console.log("✅ Filtered leave records:", leaves.length);
      console.log("✅ Filtered grades:", grades.length);

      // Log sample data for debugging
      if (attendance.length > 0) {
        console.log("🔍 Sample attendance record:", attendance[0]);
      }
      if (leaves.length > 0) {
        console.log("🔍 Sample leave record:", leaves[0]);
      }
      if (grades.length > 0) {
        console.log("🔍 Sample grade record:", grades[0]);
      }

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-white/50 backdrop-blur-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Teacher Dashboard
                </h1>
                <p className="text-gray-600 text-lg mt-2">
                  Welcome back! Manage your classes and track student progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700 font-medium">{teacherEmail}</span>
            </div>
          </div>
          
          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Classes</p>
                  <p className="text-3xl font-bold mt-2">{classes.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Class</p>
                  <p className="text-lg font-bold mt-2">
                    {selectedClass ? `${selectedClass.class_name}-${selectedClass.section}` : 'Not Selected'}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold mt-2">{students.length}</p>
                </div>
                <User className="w-8 h-8 text-purple-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Selected Student</p>
                  <p className="text-lg font-bold mt-2">
                    {selectedStudent ? selectedStudent.first_name : 'None'}
                  </p>
                </div>
                <Award className="w-8 h-8 text-orange-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Classes Section */}
        {classes.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Your Classes</h2>
                <p className="text-gray-600">Select a class to view students</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => fetchStudents(cls)}
                  className={`cursor-pointer border-2 rounded-3xl p-6 shadow-lg transition-all duration-300 hover:scale-105 group ${
                    selectedClass?.id === cls.id
                      ? "border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-blue-200"
                      : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-xl"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      selectedClass?.id === cls.id
                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                        : "bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-blue-400 group-hover:to-blue-500"
                    }`}>
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">
                        {cls.class_name} - {cls.section}
                      </h3>
                      <p className="text-sm text-gray-600">Class ID: {cls.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>View Students</span>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
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
          <div className="bg-white rounded-3xl p-8 border mb-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Students in {selectedClass.class_name} - {selectedClass.section}
                  </h2>
                  <p className="text-gray-600">Click on a student to view detailed performance</p>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {loadingStudents ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-green-600 font-semibold text-lg">Loading students...</p>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Students Found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm ? 'No students match your search criteria.' : 'No students found for this class.'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => fetchStudentPerformance(student)}
                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group ${
                      selectedStudent?.id === student.id
                        ? "border-green-600 bg-gradient-to-br from-green-50 to-emerald-100 shadow-green-200"
                        : "border-gray-200 bg-white hover:border-green-400"
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 ${
                        selectedStudent?.id === student.id
                          ? "bg-gradient-to-br from-green-500 to-green-600"
                          : "bg-gradient-to-br from-blue-500 to-blue-600"
                      }`}>
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {student.first_name} {student.last_name}
                        </h3>
                        <p className="text-gray-500 text-sm font-medium truncate">{student.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-400 text-xs">Enrolled: {student.enrollment_date}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Student Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="truncate">{student.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{student.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <BarChart3 className="w-4 h-4" />
                        <span>View Performance</span>
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
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-purple-600 font-semibold text-lg mb-2">Loading Performance Data</p>
              <p className="text-gray-500">Please wait while we fetch the student's performance details...</p>
            </div>
          </div>
        )}

        {/* Enhanced Student Performance Section */}
        {performance && selectedStudent && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/50 backdrop-blur-lg">
            {/* Student Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{selectedStudent.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{selectedStudent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{selectedStudent.address}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Performance Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                  <p className="text-blue-600 text-sm font-medium">Attendance</p>
                  <p className="text-2xl font-bold text-blue-800">{attendanceSummary.attendanceRate}%</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                  <p className="text-green-600 text-sm font-medium">Avg. Grade</p>
                  <p className="text-2xl font-bold text-green-800">{gradeSummary.average}%</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                  <p className="text-purple-600 text-sm font-medium">Leaves</p>
                  <p className="text-2xl font-bold text-purple-800">{performance.leaves.length}</p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Enhanced Attendance Chart */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-blue-800">
                    Attendance Trend
                  </h3>
                  <div className="flex items-center gap-2 text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-medium">{attendanceSummary.attendanceRate}% Rate</span>
                  </div>
                </div>
                {attendanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="status" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#1D4ED8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No attendance data available.</p>
                  </div>
                )}
              </div>

              {/* Enhanced Grades Chart */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-purple-800">
                    Grade Distribution
                  </h3>
                  <div className="flex items-center gap-2 text-purple-600">
                    <Target className="w-5 h-5" />
                    <span className="text-sm font-medium">Performance</span>
                  </div>
                </div>
                {gradesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={gradesData}
                        dataKey="grade"
                        nameKey="subject"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={2}
                        label={({ subject, percentage }) => `${subject}: ${percentage}%`}
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
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No grade data available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Attendance Summary */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Attendance Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">Present</span>
                    <span className="font-bold text-green-800">{attendanceSummary.present} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-700">Absent</span>
                    <span className="font-bold text-red-800">{attendanceSummary.absent} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-700">On Leave</span>
                    <span className="font-bold text-yellow-800">{attendanceSummary.leave} days</span>
                  </div>
                  <div className="pt-3 border-t border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-green-800 font-semibold">Total Recorded</span>
                      <span className="font-bold text-green-900">{attendanceSummary.total} days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grade Performance */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Grade Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Average Score</span>
                    <span className="font-bold text-blue-800">{gradeSummary.average}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">Highest Score</span>
                    <span className="font-bold text-green-800">{gradeSummary.highest}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-700">Lowest Score</span>
                    <span className="font-bold text-orange-800">{gradeSummary.lowest}%</span>
                  </div>
                  <div className="pt-3 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800 font-semibold">Total Subjects</span>
                      <span className="font-bold text-blue-900">{performance.grades.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Status */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Leave Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">Approved</span>
                    <span className="font-bold text-green-800">
                      {performance.leaves.filter(l => l.status === 'Approved').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-700">Pending</span>
                    <span className="font-bold text-yellow-800">
                      {performance.leaves.filter(l => l.status === 'Pending' || !l.status).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-700">Rejected</span>
                    <span className="font-bold text-red-800">
                      {performance.leaves.filter(l => l.status === 'Rejected').length}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-orange-200">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-800 font-semibold">Total Applications</span>
                      <span className="font-bold text-orange-900">{performance.leaves.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Tables */}
            <div className="space-y-8">
              {/* Enhanced Grades Table */}
              <div className="bg-gray-50 rounded-2xl p-6 border">
                <h3 className="text-xl font-semibold mb-6 text-purple-800 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6" />
                  Academic Performance Details
                </h3>
                {performance?.grades && performance.grades.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                          <th className="text-left p-4 font-semibold rounded-tl-xl">Subject</th>
                          <th className="text-center p-4 font-semibold">Marks Obtained</th>
                          <th className="text-center p-4 font-semibold">Total Marks</th>
                          <th className="text-center p-4 font-semibold">Percentage</th>
                          <th className="text-left p-4 font-semibold rounded-tr-xl">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performance.grades.map((grade, index) => {
                          const marks = parseFloat(grade.marks_obtained) || parseFloat(grade.grade) || 0;
                          const total = parseFloat(grade.total_marks) || 100;
                          const percentage = grade.percentage || Math.round((marks / total) * 100);
                          
                          return (
                            <tr 
                              key={index} 
                              className="border-b hover:bg-white transition-colors duration-200 even:bg-gray-50/50"
                            >
                              <td className="p-4 font-medium text-gray-900">
                                {grade.subject_name || grade.subject || 'Unknown'}
                              </td>
                              <td className="text-center p-4 font-semibold">{marks}</td>
                              <td className="text-center p-4 text-gray-600">{total}</td>
                              <td className="text-center p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  percentage >= 80 ? 'bg-green-100 text-green-700 border border-green-200' :
                                  percentage >= 60 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                  'bg-red-100 text-red-700 border border-red-200'
                                }`}>
                                  {percentage}%
                                </span>
                              </td>
                              <td className="p-4 text-gray-600">{grade.remarks || 'No remarks'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No grades data available.</p>
                  </div>
                )}
              </div>

              {/* Enhanced Leave Applications */}
              <div className="bg-gray-50 rounded-2xl p-6 border">
                <h3 className="text-xl font-semibold mb-6 text-orange-800 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Leave Applications History
                </h3>
                {performance?.leaves && performance.leaves.length > 0 ? (
                  <div className="space-y-4">
                    {performance.leaves.map((leave, index) => (
                      <div 
                        key={index} 
                        className="bg-white rounded-xl p-6 border hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {leave.leave_type || 'Leave Application'}
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                leave.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                                leave.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                                'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              }`}>
                                {leave.status || 'Pending'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{leave.reason || 'No reason provided'}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>From: {leave.start_date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>To: {leave.end_date}</span>
                              </div>
                              {leave.duration && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
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
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No leave applications found.</p>
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