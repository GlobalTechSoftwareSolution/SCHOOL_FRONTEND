"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Filter,
  Search,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  User
} from "lucide-react";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

const ParentAttendance = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentEmail, setParentEmail] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);

  // ✅ Step 1: Get parent email from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setParentEmail(parsedData.email);
    }
  }, []);

  // ✅ Step 2: Fetch students linked to this parent
  useEffect(() => {
    if (!parentEmail) return;

    const fetchParentStudents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/students/`);
        const allStudents = res.data;

        // ✅ Filter students by parent email
        const parentStudents = allStudents.filter(
          (student: any) => student.parent === parentEmail
        );

        setStudents(parentStudents);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchParentStudents();
  }, [parentEmail]);

  // ✅ Step 3: Fetch attendance for only those students
  useEffect(() => {
    if (students.length === 0) return;

    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`${API_BASE}/attendance/`);
        const allAttendance = res.data;

        // ✅ Keep only attendance matching these students
        const filteredAttendance = allAttendance.filter((record: any) =>
          students.some(
            (stu: any) =>
              stu.email === record.student || stu.student_id === record.student
          )
        );

        // ✅ Merge student info for easier display
        const merged = filteredAttendance.map((att: any) => {
          const stu = students.find(
            (s: any) =>
              s.email === att.student || s.student_id === att.student
          );
          return {
            ...att,
            fullname: stu?.fullname || "Unknown Student",
            email: stu?.email || "N/A",
            class_name: stu?.class_name || "N/A",
            section: stu?.section || "N/A",
            profile_picture: stu?.profile_picture || "",
            student_data: stu
          };
        });

        setAttendanceData(merged);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [students]);

  // Calculate statistics
  const getAttendanceStats = () => {
    const present = attendanceData.filter(item => item.status === "Present").length;
    const absent = attendanceData.filter(item => item.status === "Absent").length;
    const total = present + absent;
    return {
      present,
      absent,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      total
    };
  };

  const getStudentStats = (studentEmail: string) => {
    const studentAttendance = attendanceData.filter(item => item.email === studentEmail);
    const present = studentAttendance.filter(item => item.status === "Present").length;
    const total = studentAttendance.length;
    return {
      present,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  };

  // Filter data
  const filteredAttendance = attendanceData.filter(item => {
    const matchesStudent = selectedStudent === "all" || item.email === selectedStudent;
    const matchesDate = !dateFilter || item.date === dateFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch = 
      item.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.remarks?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStudent && matchesDate && matchesStatus && matchesSearch;
  });

  const stats = getAttendanceStats();

  if (loading) {
    return (
      <DashboardLayout role="parents">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading attendance data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parents">
      <div className="min-h-screen bg-gray-50/30 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Children Attendance</h1>
          <p className="text-gray-600 mt-2">Track and monitor your children's school attendance</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Children</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{students.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.percentage}%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">{stats.present} present out of {stats.total}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Days</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.present}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent Days</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.absent}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Children Overview */}
        {students.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              Your Children
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student, index) => {
                const studentStat = getStudentStats(student.email);
                return (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        {student.profile_picture ? (
                          <img
                            src={student.profile_picture}
                            alt={student.fullname}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{student.fullname}</h3>
                        <p className="text-sm text-gray-600">{student.class_name} - {student.section}</p>
                        <p className="text-xs text-gray-500 mt-1">Roll No: {student.roll_number || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{studentStat.percentage}%</p>
                        <p className="text-xs text-gray-600">Attendance Rate</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {studentStat.present}/{studentStat.total} days
                        </p>
                        <p className="text-xs text-gray-500">Present/Total</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Children</option>
                {students.map(student => (
                  <option key={student.email} value={student.email}>
                    {student.fullname}
                  </option>
                ))}
              </select>

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
              />
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              Attendance Records
            </h2>
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          {filteredAttendance.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No attendance records found</h3>
              <p className="text-gray-600">
                {attendanceData.length === 0 
                  ? "No attendance records available for your children."
                  : "Try adjusting your filters to find what you're looking for."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAttendance.map((record, index) => (
                <div
                  key={index}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedRecord(expandedRecord === index ? null : index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {record.profile_picture ? (
                          <img
                            src={record.profile_picture}
                            alt={record.fullname}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{record.fullname}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            record.status === "Present" 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {record.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{record.class_name} - {record.section}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(record.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          {record.remarks && (
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              <span className="truncate">{record.remarks}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRecord(expandedRecord === index ? null : index);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {expandedRecord === index ? 
                          <ChevronUp className="h-4 w-4 text-gray-600" /> : 
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedRecord === index && (
                    <div className="mt-4 pl-16 border-t pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Record Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Marked By:</span>
                              <span className="text-gray-900 font-medium">{record.marked_by || "Teacher"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Marked Date:</span>
                              <span className="text-gray-900 font-medium">
                                {new Date(record.created_at || record.date).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Student Email:</span>
                              <span className="text-gray-900 font-medium">{record.email}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Remarks</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                            {record.remarks || "No additional remarks provided."}
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
        {filteredAttendance.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredAttendance.length}</span> of{" "}
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
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>Overall: {stats.percentage}%</span>
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

export default ParentAttendance;