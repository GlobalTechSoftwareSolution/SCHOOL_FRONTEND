"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Search,
  Users,
  BookOpen,
  Award,
  FileText,
  Calendar,
  User,
  Clock,
  XCircle,
  Download,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api/";

interface ClassInfo {
  class_name: string;
  section: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roll_number?: string;
  section?: string;
  class_name: string;
}

interface StudentDetails {
  studentInfo: Student;
  attendance: any[];
  leaves: any[];
  awards: any[];
  documents: any[];
  grades: any[];
  projects: any[];
  tasks: any[];
  reports: any[];
}

const TeachersClassReportsPage = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // ✅ Step 1: Fetch timetable for logged-in teacher
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        console.log('🚀 [TEACHER_MONTHLY_REPORT] Starting timetable fetch...');
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem("userData");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const teacherEmail = parsedUser?.email;

        console.log('👤 [TEACHER_MONTHLY_REPORT] Teacher data:', {
          storedUser: parsedUser,
          teacherEmail: teacherEmail
        });

        if (!teacherEmail) {
          console.error('❌ [TEACHER_MONTHLY_REPORT] No teacher email found in localStorage');
          setError("No teacher email found in local storage.");
          return;
        }

        console.log(`📡 [TEACHER_MONTHLY_REPORT] Fetching timetable from: ${API_BASE}timetable/`);
        const response = await axios.get(`${API_BASE}timetable/`);
        const allTimetables = response.data;
        
        console.log(`📊 [TEACHER_MONTHLY_REPORT] Total timetable entries fetched:`, allTimetables.length);

        const teacherTimetable = allTimetables.filter(
          (item: any) => item.teacher === teacherEmail
        );

        console.log(`🎯 [TEACHER_MONTHLY_REPORT] Filtered timetable entries for teacher ${teacherEmail}:`, teacherTimetable.length);
        console.log('📋 [TEACHER_MONTHLY_REPORT] Teacher timetable entries:', teacherTimetable);

        const uniqueClasses = Array.from(
          new Map(
            teacherTimetable.map((t: any) => [
              `${t.class_name}-${t.section || "N/A"}`,
              { class_name: t.class_name, section: t.section || "N/A" },
            ])
          ).values()
        );

        console.log('🏫 [TEACHER_MONTHLY_REPORT] Unique classes extracted:', uniqueClasses);
        setClasses(uniqueClasses);
      } catch (err) {
        console.error('❌ [TEACHER_MONTHLY_REPORT] Error fetching timetable:', err);
        setError("Failed to fetch timetable.");
      } finally {
        setLoading(false);
        console.log('✅ [TEACHER_MONTHLY_REPORT] Timetable fetch completed');
      }
    };

    fetchTimetable();
  }, []);

  // ✅ Step 2: Fetch students when class is selected
  const fetchStudents = async (class_name: string, section: string) => {
    try {
      console.log(`🎓 [TEACHER_MONTHLY_REPORT] Fetching students for class: ${class_name}, section: ${section}`);
      setSelectedClass({ class_name, section });
      setSelectedStudent(null);
      setStudentDetails(null);
      setStudents([]);
      setLoadingStudents(true);
      
      // First try the direct query
      let url = `${API_BASE}students/`;
      let params: any = { class_name };
      
      if (section && section !== "N/A") {
        params.section = section;
      }
      
      console.log(`📡 [TEACHER_MONTHLY_REPORT] Fetching students with params:`, params);
      
      let res = await axios.get(url, { params });
      
      // If no students found, try alternative class name formats
      if (res.data.length === 0) {
        console.log('🔄 [TEACHER_MONTHLY_REPORT] No students found, trying alternative class name formats...');
        
        const alternativeNames = [];
        
        // Try removing "Grade " prefix
        if (class_name.includes('Grade ')) {
          alternativeNames.push(class_name.replace('Grade ', '').trim());
        }
        
        // Try adding "Grade " prefix if not present
        if (!class_name.includes('Grade ')) {
          alternativeNames.push(`Grade ${class_name}`);
        }
        
        // Try with different capitalization
        alternativeNames.push(class_name.toUpperCase());
        alternativeNames.push(class_name.toLowerCase());
        
        // Try each alternative name
        for (const altName of alternativeNames) {
          if (res.data.length > 0) break; // Stop if we found students
          
          const altParams = { ...params, class_name: altName };
          console.log(`🔄 [TEACHER_MONTHLY_REPORT] Trying alternative class name: "${altName}"`);
          
          try {
            const altRes = await axios.get(url, { params: altParams });
            if (altRes.data.length > 0) {
              console.log(`✅ [TEACHER_MONTHLY_REPORT] Found ${altRes.data.length} students with alternative class name "${altName}"!`);
              res = altRes;
              break;
            }
          } catch (altErr) {
            console.warn('⚠️ [TEACHER_MONTHLY_REPORT] Alternative query failed:', altErr);
          }
        }
      }
      
      console.log(`👥 [TEACHER_MONTHLY_REPORT] Final result: ${res.data.length} students fetched`);
      console.log('📋 [TEACHER_MONTHLY_REPORT] Student data:', res.data);
      
      setStudents(res.data);
    } catch (err) {
      console.error('❌ [TEACHER_MONTHLY_REPORT] Error fetching students:', err);
      setError("Failed to fetch students.");
    } finally {
      setLoadingStudents(false);
      console.log('✅ [TEACHER_MONTHLY_REPORT] Student fetch completed');
    }
  };

  // ✅ Step 3: Fetch full student details (attendance + all other data)
  const fetchStudentDetails = async (student: Student) => {
    try {
      console.log(`📊 [TEACHER_MONTHLY_REPORT] Fetching detailed analytics for student: ${student.first_name} ${student.last_name} (${student.email})`);
      setLoadingDetails(true);
      setSelectedStudent(student);

      // Build API requests with correct parameters based on working patterns
      const requests = [
        // Attendance - fetch all then filter by student_email (API parameter not working)
        axios.get(`${API_BASE}attendance/`).catch((err) => {
          console.warn(`⚠️ [TEACHER_MONTHLY_REPORT] Failed to fetch attendance:`, err.response?.status || err.message);
          return { data: [] };
        }),
        
        // Leaves - fetch all then filter by applicant_email
        axios.get(`${API_BASE}leaves/`).catch((err) => {
          console.warn(`⚠️ [TEACHER_MONTHLY_REPORT] Failed to fetch leaves:`, err.response?.status || err.message);
          return { data: [] };
        }),
        
        // Grades - uses student parameter (not student_email)
        axios.get(`${API_BASE}grades/?student=${student.email}`).catch((err) => {
          console.warn(`⚠️ [TEACHER_MONTHLY_REPORT] Failed to fetch grades:`, err.response?.status || err.message);
          return { data: [] };
        }),
        
        // Other endpoints - try with student_email first, then fallback
        axios.get(`${API_BASE}awards/?student_email=${student.email}`).catch((err) => {
          console.warn(`⚠️ [TEACHER_MONTHLY_REPORT] Failed to fetch awards:`, err.response?.status || err.message);
          return { data: [] };
        }),
        
        axios.get(`${API_BASE}documents/?student_email=${student.email}`).catch((err) => {
          console.warn(`⚠️ [TEACHER_MONTHLY_REPORT] Failed to fetch documents:`, err.response?.status || err.message);
          return { data: [] };
        }),
        
        axios.get(`${API_BASE}projects/?student_email=${student.email}`).catch((err) => {
          console.warn(`⚠️ [TEACHER_MONTHLY_REPORT] Failed to fetch projects:`, err.response?.status || err.message);
          return { data: [] };
        }),
        
        axios.get(`${API_BASE}tasks/?student_email=${student.email}`).catch((err) => {
          console.warn(`⚠️ [TEACHER_MONTHLY_REPORT] Failed to fetch tasks:`, err.response?.status || err.message);
          return { data: [] };
        }),
        
        axios.get(`${API_BASE}reports/?student_email=${student.email}`).catch((err) => {
          console.warn(`⚠️ [TEACHER_MONTHLY_REPORT] Failed to fetch reports:`, err.response?.status || err.message);
          return { data: [] };
        }),
      ];

      console.log('🔗 [TEACHER_MONTHLY_REPORT] Executing API requests for student data...');

      const [
        attendance,
        leaves,
        grades,
        awards,
        documents,
        projects,
        tasks,
        reports,
      ] = await Promise.all(requests);

      // Filter leaves by applicant_email (based on working pattern from All_students.tsx)
      const studentLeaves = (leaves.data || []).filter(
        (leave: any) => leave.applicant_email === student.email
      );

      // Filter attendance by student_email (handle emails with extra text)
      console.log('🔍 [TEACHER_MONTHLY_REPORT] Debugging attendance data:');
      console.log('  - Looking for student email:', student.email);
      console.log('  - Total attendance records:', (attendance.data || []).length);
      
      const studentAttendance = (attendance.data || []).filter((record: any) => {
        // Extract clean email from attendance record (remove extra text like " (Student) - Approved")
        const cleanAttendanceEmail = record.student_email?.split(' (Student)')[0]?.trim();
        const matches = cleanAttendanceEmail === student.email || record.student_email?.includes(student.email);
        
        console.log(`  - Record email: "${record.student_email}" -> Clean: "${cleanAttendanceEmail}"`);
        console.log(`  - Matches student email "${student.email}": ${matches}`);
        
        return matches;
      });
      
      console.log('  - Filtered attendance records:', studentAttendance.length);

      const studentDetailsData: StudentDetails = {
        attendance: studentAttendance,
        leaves: studentLeaves,
        awards: awards.data || [],
        documents: documents.data || [],
        grades: grades.data || [],
        projects: projects.data || [],
        tasks: tasks.data || [],
        reports: reports.data || [],
        studentInfo: student
      };

      console.log('📈 [TEACHER_MONTHLY_REPORT] Student analytics data summary:', {
        attendance: studentAttendance.length,
        leaves: studentLeaves.length,
        awards: (awards.data || []).length,
        documents: (documents.data || []).length,
        grades: (grades.data || []).length,
        projects: (projects.data || []).length,
        tasks: (tasks.data || []).length,
        reports: (reports.data || []).length
      });

      console.log('📊 [TEACHER_MONTHLY_REPORT] Full student details compiled:', studentDetailsData);
      setStudentDetails(studentDetailsData);
    } catch (err) {
      console.error('❌ [TEACHER_MONTHLY_REPORT] Error fetching student details:', err);
      setError("Failed to fetch student details.");
    } finally {
      setLoadingDetails(false);
      console.log('✅ [TEACHER_MONTHLY_REPORT] Student details fetch completed');
    }
  };

  // ✅ Step 4: Prepare chart data
  const getAttendanceChartData = () => {
    if (!studentDetails?.attendance) return [];
    const monthly = studentDetails.attendance.reduce((acc: any, record: any) => {
      const month = new Date(record.date).toLocaleString("default", {
        month: "short",
      });
      if (!acc[month]) acc[month] = { month, Present: 0, Absent: 0 };
      if (record.status === "Present") acc[month].Present += 1;
      else acc[month].Absent += 1;
      return acc;
    }, {});
    return Object.values(monthly);
  };

  const getPerformanceChartData = () => {
    if (!studentDetails?.grades) return [];
    const subjects = studentDetails.grades.reduce((acc: any, grade: any) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = { subject: grade.subject, grade: 0, count: 0 };
      }
      acc[grade.subject].grade += parseFloat(grade.grade);
      acc[grade.subject].count += 1;
      return acc;
    }, {});

    return Object.values(subjects).map((item: any) => ({
      subject: item.subject,
      grade: Math.round(item.grade / item.count)
    }));
  };

  const getAttendanceStats = () => {
    if (!studentDetails?.attendance) return { present: 0, absent: 0, percentage: 0 };
    const present = studentDetails.attendance.filter((a: any) => a.status === "Present").length;
    const absent = studentDetails.attendance.filter((a: any) => a.status === "Absent").length;
    const total = present + absent;
    return {
      present,
      absent,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  };

  const filteredStudents = students.filter(student =>
    `${student.first_name} ${student.last_name} ${student.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Group students by section for better organization
  const getStudentsBySection = () => {
    const sectionGroups: { [key: string]: Student[] } = {};
    
    filteredStudents.forEach(student => {
      const section = student.section || 'No Section';
      if (!sectionGroups[section]) {
        sectionGroups[section] = [];
      }
      sectionGroups[section].push(student);
    });
    
    return sectionGroups;
  };

  const studentsBySection = getStudentsBySection();
  const sectionCount = Object.keys(studentsBySection).length;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium text-lg">Loading your classes...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your teaching schedule</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Data</h3>
            <p className="text-gray-600 mb-6 text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Class Analytics
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Comprehensive insights and reports for your classes and students</p>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {classes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Teaching Classes</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200">
                <Users className="h-4 w-4" />
                <span>{classes.length} classes assigned</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {classes.map((cls, i) => (
                <div
                  key={i}
                  onClick={() => fetchStudents(cls.class_name, cls.section)}
                  className={`bg-white rounded-3xl shadow-lg border-2 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    selectedClass?.class_name === cls.class_name &&
                    selectedClass?.section === cls.section
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 ring-4 ring-blue-200"
                      : "border-white hover:border-blue-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${
                        selectedClass?.class_name === cls.class_name 
                          ? "bg-blue-600" 
                          : "bg-blue-100"
                      }`}>
                        <BookOpen className={`h-6 w-6 ${
                          selectedClass?.class_name === cls.class_name 
                            ? "text-white" 
                            : "text-blue-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl">{cls.class_name}</h3>
                        <p className="text-gray-600">Section {cls.section}</p>
                      </div>
                    </div>
                    <div className={`p-2 rounded-full ${
                      selectedClass?.class_name === cls.class_name 
                        ? "bg-blue-100" 
                        : "bg-gray-100"
                    }`}>
                      <ChevronRight className={`h-5 w-5 ${
                        selectedClass?.class_name === cls.class_name 
                          ? "text-blue-600" 
                          : "text-gray-400"
                      }`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                    <Users className="h-4 w-4" />
                    <span>View student roster</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students Section */}
        {selectedClass && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-4 lg:mb-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedClass.class_name} - Section {selectedClass.section}
                    </h2>
                    <p className="text-gray-600 mt-1 text-lg">
                      Student Roster • {students.length} students
                      {loadingStudents && " (Loading...)"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-4 w-full lg:w-80 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            {loadingStudents ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading students for {selectedClass.class_name}...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {students.length === 0 ? "No Students Found" : "No Matching Students"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {students.length === 0 
                    ? `No students found for ${selectedClass.class_name}, Section ${selectedClass.section}. The class might be empty or there might be a data mismatch.`
                    : "No students match your search criteria. Try adjusting your search terms."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(studentsBySection).map(([section, sectionStudents], sectionIndex) => (
                  <div key={section} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-3 rounded-xl ${
                        sectionIndex === 0 ? 'bg-blue-100' : 
                        sectionIndex === 1 ? 'bg-green-100' : 
                        sectionIndex === 2 ? 'bg-purple-100' : 'bg-orange-100'
                      }`}>
                        <Users className={`h-6 w-6 ${
                          sectionIndex === 0 ? 'text-blue-600' : 
                          sectionIndex === 1 ? 'text-green-600' : 
                          sectionIndex === 2 ? 'text-purple-600' : 'text-orange-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {section === 'No Section' ? 'General' : `Section ${section}`}
                        </h3>
                        <p className="text-gray-600 text-sm">{sectionStudents.length} students</p>
                      </div>
                      <div className="ml-auto">
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          sectionIndex === 0 ? 'bg-blue-100 text-blue-700' : 
                          sectionIndex === 1 ? 'bg-green-100 text-green-700' : 
                          sectionIndex === 2 ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          Group {sectionIndex + 1}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {sectionStudents.map((student, i) => (
                        <div
                          key={i}
                          onClick={() => fetchStudentDetails(student)}
                          className={`group p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-102 ${
                            selectedStudent?.email === student.email
                              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200"
                              : "border-white hover:border-blue-300 hover:shadow-md bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              selectedStudent?.email === student.email
                                ? "bg-blue-600"
                                : "bg-blue-100 group-hover:bg-blue-600"
                            }`}>
                              <User className={`h-6 w-6 transition-all duration-300 ${
                                selectedStudent?.email === student.email
                                  ? "text-white"
                                  : "text-blue-600 group-hover:text-white"
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-sm truncate">
                                {student.first_name} {student.last_name}
                              </h3>
                              <p className="text-gray-600 text-xs truncate">{student.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                  Roll: {student.roll_number || "N/A"}
                                </span>
                                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Active
                                </span>
                              </div>
                            </div>
                            <ChevronRight className={`h-4 w-4 transition-all duration-300 ${
                              selectedStudent?.email === student.email
                                ? "text-blue-600"
                                : "text-gray-400 group-hover:text-blue-600"
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student Details Loading */}
        {loadingDetails && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Loading Student Analytics</h3>
              <p className="text-gray-600">Compiling comprehensive performance data...</p>
            </div>
          </div>
        )}

        {/* Student Details Dashboard */}
        {studentDetails && (
          <div className="space-y-8">
            {/* Student Header */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-6 mb-6 lg:mb-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {studentDetails.studentInfo.first_name} {studentDetails.studentInfo.last_name}
                    </h2>
                    <p className="text-gray-600 text-lg mt-1">{studentDetails.studentInfo.email}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                        <BookOpen className="h-4 w-4" />
                        <span>Roll No: {studentDetails.studentInfo.roll_number || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                        <Users className="h-4 w-4" />
                        <span>{selectedClass?.class_name} • Section {selectedClass?.section}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3">
                  <Download className="h-5 w-5" />
                  Export Full Report
                </button>
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-1 px-8 pt-6">
                  {[
                    { id: "overview", label: "Overview", icon: Activity },
                    { id: "attendance", label: "Attendance", icon: Calendar },
                    { id: "academics", label: "Academics", icon: Award }                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-3 py-4 px-6 rounded-t-2xl text-lg font-semibold transition-all duration-200 ${
                        activeTab === id
                          ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm font-medium">Attendance Rate</p>
                            <p className="text-3xl font-bold mt-2">{getAttendanceStats().percentage}%</p>
                          </div>
                          <Calendar className="h-8 w-8 text-blue-200" />
                        </div>
                        <div className="w-full bg-blue-400 rounded-full h-2 mt-4">
                          <div 
                            className="bg-white h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${getAttendanceStats().percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm font-medium">Awards & Honors</p>
                            <p className="text-3xl font-bold mt-2">{studentDetails.awards.length}</p>
                          </div>
                          <Award className="h-8 w-8 text-green-200" />
                        </div>
                        <p className="text-green-200 text-sm mt-3">
                          Academic achievements
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm font-medium">Projects</p>
                            <p className="text-3xl font-bold mt-2">{studentDetails.projects.length}</p>
                          </div>
                          <FileText className="h-8 w-8 text-purple-200" />
                        </div>
                        <p className="text-purple-200 text-sm mt-3">
                          Completed assignments
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-100 text-sm font-medium">Leave Days</p>
                            <p className="text-3xl font-bold mt-2">{studentDetails.leaves.length}</p>
                          </div>
                          <Clock className="h-8 w-8 text-orange-200" />
                        </div>
                        <p className="text-orange-200 text-sm mt-3">
                          Total absences
                        </p>
                      </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Attendance Trend */}
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">Monthly Attendance Trend</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={getAttendanceChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '12px', 
                                border: 'none',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Bar dataKey="Present" fill="#4CAF50" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Absent" fill="#F44336" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Subject Performance */}
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-purple-100 rounded-xl">
                            <PieChartIcon className="h-6 w-6 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">Subject Performance Distribution</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={getPerformanceChartData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ subject, grade }) => `${subject}: ${grade}`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="grade"
                            >
                              {getPerformanceChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '12px', 
                                border: 'none',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attendance Tab */}
                {activeTab === "attendance" && (
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Attendance Analytics</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">Monthly Overview</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getAttendanceChartData()}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="month" stroke="#6b7280" />
                              <YAxis stroke="#6b7280" />
                              <Tooltip />
                              <Bar dataKey="Present" fill="#4CAF50" radius={[6, 6, 0, 0]} />
                              <Bar dataKey="Absent" fill="#F44336" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-6">
                          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3">Attendance Summary</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Present Days</span>
                                <span className="font-bold text-green-600">{getAttendanceStats().present}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Absent Days</span>
                                <span className="font-bold text-red-600">{getAttendanceStats().absent}</span>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-gray-800 font-semibold">Overall Percentage</span>
                                <span className="font-bold text-blue-600 text-lg">{getAttendanceStats().percentage}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Academics Tab */}
                {activeTab === "academics" && (
                  <div className="space-y-6">
<h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
  Students Grades
</h2>
                    {studentDetails.grades.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {studentDetails.grades.map((grade: any, index: number) => (
                          <div key={index} className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-gray-900 text-lg">{grade.subject}</h4>
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <span className="font-bold text-blue-600 text-lg">{grade.grade}</span>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Term:</span>
                                <span className="font-medium">{grade.term}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Exam Type:</span>
                                <span className="font-medium">{grade.exam_type}</span>
                              </div>
                              {grade.remarks && (
                                <div className="pt-2 border-t border-gray-200">
                                  <span className="text-gray-500">{grade.remarks}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No Grade Records</h3>
                        <p className="text-gray-600">No academic records found for this student.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedClass && classes.length === 0 && !loading && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Classes Assigned</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
              You are not currently assigned to any teaching classes. Please contact the administration for class assignments.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200">
              Contact Administration
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeachersClassReportsPage;