"use client";

import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  BookOpen,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  User
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL as string;

/* ===================== TYPES ===================== */

interface Student {
  email: string;
  fullname: string;
  profile_picture?: string;
  class_id: number;
  student_id?: string;
  parent: string;
  class_name?: string;
  section?: string;
  class_teacher?: string;
  teacher_email?: string;
}

interface ClassData {
  id: number;
  class_name: string;
  sec: string;
  class_teacher_name?: string;
  teacher_email?: string;
}

interface AttendanceRecord {
  student: string;
  student_name?: string;
  status: "Present" | "Absent";
  date: string;
  remarks?: string;
  teacher?: string;
  teacher_name?: string;
  created_time?: string;
  class_id?: number;
  class_name?: string;
  section?: string;
}

interface UIAttendanceRecord {
  status: "Present" | "Absent";
  fullname: string;
  email: string;
  class_name: string;
  section: string;
  class_teacher: string;
  teacher_email: string;
  profile_picture?: string;
  student_data?: Student;
  class_data?: {
    class_id?: number;
    class_name?: string;
    section?: string;
  };
  date: string;
  remarks?: string;
  created_at?: string;
  marked_by?: string;
}

/* ===================== COMPONENT ===================== */

const ParentAttendance = () => {
  const [attendanceData, setAttendanceData] = useState<UIAttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [parentEmail] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        try {
          const parsedData: { email: string } = JSON.parse(storedUserData);
          return parsedData.email;
        } catch (error) {
          console.error("Failed to parse user data:", error);
          return null;
        }
      }
    }
    return null;
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);


  /* ===================== FETCH STUDENTS ===================== */
  useEffect(() => {
    if (!parentEmail) return;

    const fetchParentStudents = async () => {
      try {
        const [studentRes, classesRes] = await Promise.all([
          axios.get<Student[]>(`${API_BASE}/students/`),
          axios.get<ClassData[]>(`${API_BASE}/classes/`)
        ]);

        const parentStudents = studentRes.data.filter(
          (student) => student.parent === parentEmail
        );

        const enrichedStudents: Student[] = parentStudents.map((student) => {
          const classDetail = classesRes.data.find(
            (c) => c.id === student.class_id
          );

          return {
            ...student,
            class_name: classDetail?.class_name,
            section: classDetail?.sec,
            class_teacher: classDetail?.class_teacher_name,
            teacher_email: classDetail?.teacher_email
          };
        });

        setStudents(enrichedStudents);
      } catch (error) {
        console.error("❌ Error fetching students:", error);
      }
    };

    fetchParentStudents();
  }, [parentEmail]);

  /* ===================== FETCH ATTENDANCE ===================== */
  useEffect(() => {
    if (students.length === 0) return;

    const fetchAttendance = async () => {
      try {
        const attendanceRes = await axios.get<AttendanceRecord[]>(
          `${API_BASE}/student_attendance/`
        );

        const filteredAttendance = attendanceRes.data.filter((record) =>
          students.some((stu) => stu.email === record.student)
        );

        const merged: UIAttendanceRecord[] = filteredAttendance.map((att) => {
          const stu = students.find((s) => s.email === att.student);

          return {
            status: att.status || "Present",
            fullname: att.student_name || stu?.fullname || "Unknown Student",
            email: att.student,
            class_name: att.class_name || stu?.class_name || "N/A",
            section: att.section || stu?.section || "N/A",
            class_teacher: stu?.class_teacher || att.teacher_name || "N/A",
            teacher_email: att.teacher || stu?.teacher_email || "N/A",
            profile_picture: stu?.profile_picture,
            student_data: stu,
            class_data: {
              class_id: att.class_id,
              class_name: att.class_name,
              section: att.section
            },
            date: att.date,
            remarks: att.remarks,
            created_at: att.created_time
          };
        });

        setAttendanceData(merged);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching attendance:", error);
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [students]);

  /* ===================== STATS ===================== */
  const getAttendanceStats = () => {
    const present = attendanceData.filter((i) => i.status === "Present").length;
    const absent = attendanceData.filter((i) => i.status === "Absent").length;
    const total = present + absent;
    return {
      present,
      absent,
      total,
      percentage: total ? Math.round((present / total) * 100) : 0
    };
  };

  const getStudentStats = (email: string) => {
    const list = attendanceData.filter((i) => i.email === email);
    const present = list.filter((i) => i.status === "Present").length;
    return {
      present,
      total: list.length,
      percentage: list.length ? Math.round((present / list.length) * 100) : 0
    };
  };

  /* ===================== FILTER ===================== */
  const filteredAttendance = attendanceData.filter((item) => {
    return (
      (selectedStudent === "all" || item.email === selectedStudent) &&
      (!dateFilter || item.date === dateFilter) &&
      (statusFilter === "all" || item.status === statusFilter) &&
      (
        item.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const stats = getAttendanceStats();

  /* ===================== UI ===================== */
  if (loading) {
    return (
      <DashboardLayout role="parents">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
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
          <p className="text-gray-600 mt-2">Track and monitor your children&apos;s school attendance</p>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-600" />
                Your Children
              </h2>
              {selectedStudent !== "all" && (
                <button
                  onClick={() => setSelectedStudent("all")}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student, index) => {
                const studentStat = getStudentStats(student.email);
                const isSelected = selectedStudent === student.email;
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedStudent(student.email)}
                    className={`border rounded-xl p-6 transition-all cursor-pointer ${isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:shadow-md"
                      }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isSelected ? "bg-blue-200" : "bg-blue-100"
                        }`}>
                        {student.profile_picture ? (
                          <Image
                            src={student.profile_picture}
                            alt={student.fullname}
                            width={64}
                            height={64}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{student.fullname}</h3>
                        <p className="text-sm text-gray-600">{student.class_name} - {student.section}</p>
                        <p className="text-xs text-gray-500 mt-1">Roll No: {student.student_id || "N/A"}</p>
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
                          <Image
                            src={record.profile_picture}
                            alt={record.fullname}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{record.fullname}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${record.status === "Present"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : record.status === "Absent"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
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
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span title={record.teacher_email}>Class Teacher: {record.class_teacher}</span>
                          </div>
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
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Student Profile</h4>
                          <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                              {record.profile_picture ? (
                                <Image
                                  src={record.profile_picture}
                                  alt={record.fullname}
                                  width={96}
                                  height={96}
                                  className="object-cover"
                                />
                              ) : (
                                <User className="h-12 w-12 text-blue-600" />
                              )}
                            </div>
                          </div>
                        </div>
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
