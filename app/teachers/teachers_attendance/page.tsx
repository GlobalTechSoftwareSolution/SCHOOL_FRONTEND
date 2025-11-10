"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Search,
  Filter,
  Calendar,
  User,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
  MoreVertical,
  FileText,
  TrendingUp,
  AlertCircle
} from "lucide-react";

const TeachersAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [attendanceType, setAttendanceType] = useState<'teacher' | 'student'>('teacher');
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);

  const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/attendance/";

  const fetchTeacherAttendance = async (teacherEmail: string) => {
    try {
      console.log("🔍 Fetching teacher attendance for:", teacherEmail);
      const response = await axios.get(API_URL);
      const allAttendance = response.data;
      
      console.log("📊 All attendance records:", allAttendance.length);
      console.log("📋 Sample record:", allAttendance[0]);

      // Filter records marked by this teacher
      const teacherAttendance = allAttendance.filter(
        (record: any) =>
          record.marked_by_role === "Teacher" &&
          record.marked_by_email === teacherEmail
      );

      console.log("✅ Teacher attendance records found:", teacherAttendance.length);
      console.log("📝 Teacher records:", teacherAttendance);

      return teacherAttendance;
    } catch (error) {
      console.error("Error fetching teacher attendance:", error);
      throw error;
    }
  };

  const fetchStudentAttendance = async (teacherEmail: string) => {
    try {
      console.log("🔍 Fetching student attendance for teacher:", teacherEmail);
      
      // First, get teacher's classes from timetable
      const timetableResponse = await axios.get(
        "https://globaltechsoftwaresolutions.cloud/school-api/api/timetable/"
      );
      console.log("📚 Timetable data:", timetableResponse.data.length, "records");
      
      const teacherTimetable = timetableResponse.data.filter(
        (item: any) => item.teacher === teacherEmail
      );
      console.log("👨‍🏫 Teacher's timetable entries:", teacherTimetable.length);
      console.log("📋 Teacher timetable:", teacherTimetable);
      
      // Get unique classes taught by this teacher
      const uniqueClasses = Array.from(
        new Map(
          teacherTimetable.map((t: any) => [
            `${t.class_name}-${t.section || "N/A"}`,
            { class_name: t.class_name, section: t.section || "N/A" },
          ])
        ).values()
      );
      
      console.log("🎯 Teacher's unique classes:", uniqueClasses);
      setTeacherClasses(uniqueClasses);

      // Fetch all attendance records
      const response = await axios.get(API_URL);
      const allAttendance = response.data;
      console.log("📊 All attendance records:", allAttendance.length);
      console.log("📋 Sample attendance record:", allAttendance[0]);

      // Filter attendance for students in teacher's classes
      const teacherClassesSet = new Set();
      
      uniqueClasses.forEach((cls: any) => {
        // Add multiple variations of class names to the set
        teacherClassesSet.add(`${cls.class_name}-${cls.section}`);
        teacherClassesSet.add(`${cls.class_name}`);
        
        // If class_name contains "Grade", also add without "Grade"
        if (cls.class_name.includes('Grade ')) {
          const classWithoutGrade = cls.class_name.replace('Grade ', '');
          teacherClassesSet.add(`${classWithoutGrade}-${cls.section}`);
          teacherClassesSet.add(`${classWithoutGrade}`);
        }
        
        // If class_name is like "10", also add "Grade 10"
        if (!cls.class_name.includes('Grade') && /^\d+$/.test(cls.class_name)) {
          teacherClassesSet.add(`Grade ${cls.class_name}-${cls.section}`);
          teacherClassesSet.add(`Grade ${cls.class_name}`);
        }
      });
      
      console.log("🔍 Teacher classes set (all variations):", Array.from(teacherClassesSet));

      const studentAttendance = allAttendance.filter((record: any) => {
        const recordClassKey = `${record.class_name}-${record.section || "N/A"}`;
        const gradeClassKey = `Grade ${record.class_name}-${record.section || "N/A"}`;
        
        // Also try matching with different variations
        const classVariations = [
          recordClassKey,
          gradeClassKey,
          `${record.class_name}`, // Just class name
          `Grade ${record.class_name}`, // Grade + class name
        ];
        
        console.log(`🔍 Checking record: ${record.student_name} - Class: "${record.class_name}", Section: "${record.section || "N/A"}"`);
        console.log(`📋 Trying variations:`, classVariations);
        console.log(`🎯 Against teacher classes:`, Array.from(teacherClassesSet));
        
        const matches = classVariations.some(variation => teacherClassesSet.has(variation));
        
        if (matches) {
          console.log(`✅ Match found: ${record.student_name} - ${recordClassKey}`);
        } else {
          console.log(`❌ No match for: ${record.student_name} - ${recordClassKey}`);
        }
        
        return matches;
      });

      console.log("✅ Student attendance records found:", studentAttendance.length);
      console.log("📝 Student records:", studentAttendance);

      return studentAttendance;
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError("");
        console.log("🚀 Starting attendance fetch, type:", attendanceType);

        // Get teacher info from localStorage
        const storedUser = localStorage.getItem("userData");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const teacherEmail = parsedUser?.email;

        console.log("👤 Teacher email from localStorage:", teacherEmail);
        console.log("📦 Full user data:", parsedUser);

        if (!teacherEmail) {
          setError("No teacher email found in local storage.");
          setLoading(false);
          return;
        }

        let attendanceRecords;
        if (attendanceType === 'teacher') {
          console.log("📊 Fetching teacher attendance mode");
          attendanceRecords = await fetchTeacherAttendance(teacherEmail);
        } else {
          console.log("👨‍🎓 Fetching student attendance mode");
          attendanceRecords = await fetchStudentAttendance(teacherEmail);
        }

        console.log("🎯 Final attendance records to display:", attendanceRecords.length);
        setAttendanceData(attendanceRecords);
      } catch (err: any) {
        console.error("❌ Error fetching attendance:", err);
        setError("Failed to fetch attendance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [attendanceType]);

  // Calculate statistics
  const stats = {
    totalRecords: attendanceData.length,
    present: attendanceData.filter(item => item.status === "Present").length,
    absent: attendanceData.filter(item => item.status === "Absent").length,
    presentPercentage: attendanceData.length > 0 ? 
      Math.round((attendanceData.filter(item => item.status === "Present").length / attendanceData.length) * 100) : 0
  };

  // Filter and sort data
  const filteredData = attendanceData
    .filter(item => {
      const matchesSearch = 
        item.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesClass = classFilter === "all" || item.class_name === classFilter;
      const matchesDate = !dateFilter || item.date === dateFilter;

      return matchesSearch && matchesStatus && matchesClass && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "student":
          return a.student_name.localeCompare(b.student_name);
        case "class":
          return a.class_name.localeCompare(b.class_name);
        default:
          return 0;
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Absent":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-50 text-green-700 border-green-200";
      case "Absent":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-500";
      case "Absent":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading attendance records...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium"
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
      <div className="min-h-screen bg-gray-50/30 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
              <p className="text-gray-600 mt-2">
                {attendanceType === 'teacher' 
                  ? 'View attendance records you have marked'
                  : 'View attendance records for students in your classes'
                }
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
          
          {/* Attendance Type Toggle Buttons */}
          <div className="mt-6 flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setAttendanceType('teacher')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                attendanceType === 'teacher'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="h-4 w-4" />
              Teacher Attendance
            </button>
            <button
              onClick={() => setAttendanceType('student')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                attendanceType === 'student'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4" />
              Student Attendance
            </button>
          </div>
          
          {/* Show teacher's classes when viewing student attendance */}
          {attendanceType === 'student' && teacherClasses.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Your Classes:</h3>
              <div className="flex flex-wrap gap-2">
                {teacherClasses.map((cls: any, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    {cls.class_name} - {cls.section}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalRecords}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.present}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">{stats.presentPercentage}% of total</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.absent}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.presentPercentage}%</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by student name, class, or remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>


              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Filter by date"
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="student">Student Name</option>
                <option value="class">Class</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {attendanceData.length === 0 ? "No Attendance Records" : "No Matching Records"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {attendanceData.length === 0 
                  ? "You haven't marked any attendance records yet. Start marking attendance to see records here."
                  : "Try adjusting your search or filters to find what you're looking for."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredData.map((item, index) => (
                <div
                  key={item.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedRecord(expandedRecord === item.id ? null : item.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg">{item.student_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{item.class_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(item.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          {item.remarks && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="truncate">{item.remarks}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRecord(expandedRecord === item.id ? null : item.id);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {expandedRecord === item.id ? 
                          <ChevronUp className="h-4 w-4 text-gray-600" /> : 
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedRecord === item.id && (
                    <div className="mt-4 pl-9 border-t pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Record Details</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Student ID:</span>
                              <span className="text-gray-900 font-medium">{item.student_id || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Marked By:</span>
                              <span className="text-gray-900 font-medium">You</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Marked Date:</span>
                              <span className="text-gray-900 font-medium">
                                {new Date(item.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Remarks</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                            {item.remarks || "No remarks provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredData.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredData.length}</span> of{" "}
                  <span className="font-semibold">{attendanceData.length}</span> records
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Present: {stats.present}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Absent: {stats.absent}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeachersAttendancePage;