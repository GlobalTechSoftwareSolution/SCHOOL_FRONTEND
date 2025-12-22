"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { isAuthenticated } from "@/app/utils/auth";
import { useRouter } from "next/navigation";

// Interfaces
interface Attendance {
  id: number;
  student?: string;
  student_name?: string;
  student_email?: string;
  user_email?: string;
  date: string;
  status: string;
  subject_name?: string;
  class_name?: string;
  section?: string;
}
interface Mark {
  id: number;
  student?: string;
  student_id?: string | number;
  subject: string;
  marks_obtained: number;
  total_marks: number;
  exam_type: string;
  percentage: number;
}
interface Notice {
  id: number;
  title: string;
  message: string;
  created_at: string;
  created_by: string;
  priority: "high" | "medium" | "low";
  notice_to?: string;
}
interface Leave {
  id: number;
  status: string;
  start_date: string;
  end_date: string;
  applicant_email?: string;
}

interface StudentInfo {
  email?: string;
  fullname?: string;
  first_name?: string;
  name?: string;
  student_id?: string | number;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/`;

const StudentDashboard = () => {
  const router = useRouter();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?callbackUrl=/students/students_dashboard');
      return;
    }
  }, [router]);

  // ✅ STEP 1: Fetch the student info from API by matching email
  const fetchStudentInfo = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("userInfo");
      if (!storedUser) {
        setLoading(false);
        return;
      }

      const parsedUser: { email?: string } = JSON.parse(storedUser);
      const email = parsedUser.email;

      const response = await axios.get<StudentInfo[]>(`${API_BASE}students/`);
      const allStudents: StudentInfo[] = Array.isArray(response.data)
        ? response.data
        : [response.data];

      // ✅ Match by email (case-insensitive)
      const matchedStudent = allStudents.find(
        (student) => student.email?.toLowerCase() === email?.toLowerCase()
      );

      if (matchedStudent) {
        setStudentInfo(matchedStudent);
      }
    } catch {
      // Silent error handling
    }
  }, []);

  // ✅ STEP 2: Fetch dashboard data after student info is available
  useEffect(() => {
    if (!studentInfo) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Attendance (student specific)
        const attendanceRes = await axios
          .get<Attendance[]>(`${API_BASE}student_attendance/`, { headers })
          .catch(() => {
          return { data: [] };
        });
        const attendanceData: Attendance[] = Array.isArray(attendanceRes.data)
          ? attendanceRes.data
          : [attendanceRes.data as Attendance];
        const emailLower = studentInfo.email?.toLowerCase();
        const studentAttendance = attendanceData.filter((record) => {
          const recordEmail = (record.student || record.student_email || record.user_email)?.toLowerCase?.();
          return recordEmail && recordEmail === emailLower;
        });
        setAttendance(studentAttendance);
        // Marks
        const marksRes = await axios
          .get<Mark[]>(`${API_BASE}grades/`, { headers })
          .catch(() => {
          return { data: [] };
        });
        const marksData: Mark[] = Array.isArray(marksRes.data)
          ? marksRes.data
          : [marksRes.data as Mark];
        const studentMarks = marksData.filter(
          (m: Mark) =>
            m.student?.toLowerCase?.() === studentInfo.email?.toLowerCase() ||
            m.student_id === studentInfo.student_id
        );
        setMarks(studentMarks);

        // Notices
        const noticesRes = await axios
          .get<Notice[]>(`${API_BASE}notices/`, { headers })
          .catch(() => {
          return { data: [] };
        });
        
        // Filter notices for the specific student only
        const allNotices: Notice[] = Array.isArray(noticesRes.data)
          ? noticesRes.data
          : [noticesRes.data as Notice];
        const studentNotices = allNotices.filter((notice) => {
          const noticeTo = (notice.notice_to || "").trim().toLowerCase();
          const studentEmail = studentInfo.email?.toLowerCase();
          return noticeTo === studentEmail;
        });
        
        setNotices(studentNotices);

        // Leaves
        const leavesRes = await axios
          .get<Leave[]>(`${API_BASE}leaves/`, { headers })
          .catch(() => {
          return { data: [] };
        });
        
        const leavesData: Leave[] = Array.isArray(leavesRes.data)
          ? leavesRes.data
          : [leavesRes.data as Leave];
        
        // Filter leaves by student email using applicant_email field
        const studentLeaves = leavesData.filter((leave) => {
          return leave.applicant_email?.toLowerCase?.() === studentInfo.email?.toLowerCase();
        });
        
        setLeaves(studentLeaves);
      } catch {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [studentInfo]);

  // ✅ Initial load – get student info first
  useEffect(() => {
    fetchStudentInfo();
  }, [fetchStudentInfo]);

  // Attendance calculations
  const totalDays = attendance.length;
  const presentDays = attendance.filter(
    (a) => a.status?.toLowerCase?.() === "present"
  ).length;
  const absentDays = totalDays - presentDays;
  const attendancePercentage =
    totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  const validMarks = marks.filter((m) => m.percentage !== undefined);
  const averageMarks =
    validMarks.length > 0
      ? validMarks.reduce((acc, m) => acc + m.percentage, 0) /
      validMarks.length
      : 0;

  const latestNotices = notices.slice(0, 3);

  // ✅ Leave calculations
  const approvedLeaves = leaves.filter(
    (leave) => leave.status?.toLowerCase() === "approved"
  ).length;

  const pendingLeaves = leaves.filter(
    (leave) => leave.status?.toLowerCase() === "pending"
  ).length;


  // ✅ Utility function for notice badge color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "low":
        return "bg-green-100 text-green-700 border border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };
  // ✅ Add this below your notice color helper

  // ✅ Loading screen
  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
          <div className="animate-spin h-10 w-10 border-2 border-blue-600 rounded-full border-t-transparent mb-4"></div>
          <p>Loading your dashboard...</p>
          <p className="text-sm text-gray-500">Getting everything ready for you</p>
        </div>
      </DashboardLayout>
    );
  }

  // ✅ Main dashboard UI
  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Welcome Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {studentInfo?.fullname || studentInfo?.first_name || studentInfo?.name || "Student"}!
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome to your Student Dashboard
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Attendance Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Attendance</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {attendancePercentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {presentDays} present • {absentDays} absent
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">⭐</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Average Marks</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {averageMarks.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {marks.length} subjects
                  </div>
                </div>
              </div>
            </div>

            {/* Leaves Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">📅</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Leaves</div>
                  <div className="text-2xl font-bold text-gray-900">{approvedLeaves}</div>
                  <div className="text-xs text-gray-500">
                    {pendingLeaves} pending
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Quick Links */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
                <div className="space-y-3">
                  <a href="/students/students_tasks" className="flex items-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group">
                    <span className="text-2xl mr-3">🎯</span>
                    <span className="font-medium text-gray-900 group-hover:text-blue-600">Task Manager</span>
                  </a>
                  <a href="/students/students_assignment" className="flex items-center p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group">
                    <span className="text-2xl mr-3">📝</span>
                    <span className="font-medium text-gray-900 group-hover:text-green-600">Assignments</span>
                  </a>
                  <a href="/students/students_marks" className="flex items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group">
                    <span className="text-2xl mr-3">📊</span>
                    <span className="font-medium text-gray-900 group-hover:text-purple-600">Academic Performance</span>
                  </a>
                  <a href="/students/students_leaves" className="flex items-center p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors group">
                    <span className="text-2xl mr-3">📅</span>
                    <span className="font-medium text-gray-900 group-hover:text-orange-600">Leave Management</span>
                  </a>
                  <a href="/students/students_docs" className="flex items-center p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors group">
                    <span className="text-2xl mr-3">📁</span>
                    <span className="font-medium text-gray-900 group-hover:text-red-600">My Documents</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Notices and Assignments */}
            <div className="lg:col-span-2 space-y-8">

              {/* Latest Notices */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Latest Notices</h2>
                  <a href="/student/notices" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </a>
                </div>
                <div className="space-y-4">
                  {latestNotices.length > 0 ? latestNotices.map((notice) => (
                    <div key={notice.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notice.priority)}`}>
                          {notice.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{notice.message}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>By: {notice.created_by}</span>
                        <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-gray-500">
                      No notices available
                    </div>
                  )}
                </div>
              </div>


            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{attendance.length}</div>
                <div className="text-sm text-gray-600">Attendance Records</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{marks.length}</div>
                <div className="text-sm text-gray-600">Marks Entries</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{notices.length}</div>
                <div className="text-sm text-gray-600">Notices</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">{leaves.length}</div>
                <div className="text-sm text-gray-600">Leave Applications</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
    </DashboardLayout>
  );
};

export default StudentDashboard;