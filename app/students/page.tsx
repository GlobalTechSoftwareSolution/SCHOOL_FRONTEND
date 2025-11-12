"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";

interface DashboardData {
  attendance: any[];
  assignments: any[];
  leaves: any[];
  notices: any[];
  marks: any[];
  statistics: {
    attendancePercentage: number;
    pendingAssignments: number;
    totalLeaves: number;
    averageMarks: number;
  };
}

interface StudentInfo {
  email: string;
  classId: string;
  section: string;
  name?: string;
  rollNumber?: string;
}

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    attendance: [],
    assignments: [],
    leaves: [],
    notices: [],
    marks: [],
    statistics: {
      attendancePercentage: 0,
      pendingAssignments: 0,
      totalLeaves: 0,
      averageMarks: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("overview");

  const getLocalJSON = useCallback((key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  const calculateStatistics = useCallback((data: Omit<DashboardData, 'statistics'>) => {
    // Attendance percentage
    const totalAttendance = data.attendance.length;
    const presentDays = data.attendance.filter(a => a.status?.toLowerCase() === 'present').length;
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0;

    // Pending assignments
    const pendingAssignments = data.assignments.filter(a => 
      a.status?.toLowerCase() !== 'submitted' && a.status?.toLowerCase() !== 'completed'
    ).length;

    // Total leaves
    const totalLeaves = data.leaves.length;

    // Average marks
    const validMarks = data.marks.filter(m => m.marks_obtained && !isNaN(parseFloat(m.marks_obtained)));
    const averageMarks = validMarks.length > 0 
      ? Math.round(validMarks.reduce((sum, m) => sum + parseFloat(m.marks_obtained), 0) / validMarks.length)
      : 0;

    return {
      attendancePercentage,
      pendingAssignments,
      totalLeaves,
      averageMarks
    };
  }, []);

  const safeFetch = async (url: string, headers: any, label: string) => {
    console.log(`🌐 Fetching ${label} from:`, url);
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error(`❌ Invalid JSON in ${label}:`, text);
        return [];
      }
    } catch (err) {
      console.error(`❌ Network error for ${label}:`, err);
      return [];
    }
  };

  const fetchDashboardData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const userData = getLocalJSON("userData") || getLocalJSON("userInfo") || {};
      const studentEmail = userData?.email || localStorage.getItem("email");
      const studentClass = userData?.class || userData?.class_name || "10";
      const studentSection = userData?.section || "A";
      const studentName = userData?.name || userData?.full_name || "Student";
      const token = localStorage.getItem("accessToken");

      if (!studentEmail) {
        setError("Student information not found. Please log in again.");
        return;
      }

      setStudentInfo({
        email: studentEmail,
        classId: studentClass,
        section: studentSection,
        name: studentName,
        rollNumber: userData?.roll_number
      });

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Parallel API calls for better performance
      const [
        attendanceData,
        assignData,
        leaveData,
        noticeData,
        gradesData
      ] = await Promise.all([
        safeFetch("https://globaltechsoftwaresolutions.cloud/school-api/api/attendance/", headers, "Attendance"),
        safeFetch("https://globaltechsoftwaresolutions.cloud/school-api/api/assignments/", headers, "Assignments"),
        safeFetch("https://globaltechsoftwaresolutions.cloud/school-api/api/leaves/", headers, "Leaves"),
        safeFetch("https://globaltechsoftwaresolutions.cloud/school-api/api/notices/", headers, "Notices"),
        safeFetch("https://globaltechsoftwaresolutions.cloud/school-api/api/grades/", headers, "Grades")
      ]);

      // Filter and process data
      const filteredAttendance = Array.isArray(attendanceData) 
        ? attendanceData.filter((a: any) => 
            a.user_email?.toLowerCase() === studentEmail.toLowerCase()
          ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : [];

      const filteredAssignments = Array.isArray(assignData)
        ? assignData.filter((a: any) => a.subject_name && a.title && a.description)
             .sort((a: any, b: any) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())
        : [];

      const filteredLeaves = Array.isArray(leaveData)
        ? leaveData.filter((l: any) => 
            l.applicant_email?.toLowerCase() === studentEmail.toLowerCase()
          ).sort((a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
        : [];

      const filteredNotices = Array.isArray(noticeData)
        ? noticeData
            .filter((n: any) => {
              const isGlobal = n.notice_to_email === null;
              const isPersonal = n.notice_to_email?.toLowerCase() === studentEmail.toLowerCase();
              const isClassWide = n.class === studentClass && n.section === studentSection;
              return isGlobal || isPersonal || isClassWide;
            })
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        : [];

      const filteredMarks = Array.isArray(gradesData)
        ? gradesData.filter((g: any) =>
            g.student_class?.toString() === studentClass.toString() &&
            g.student_section?.toLowerCase() === studentSection.toLowerCase()
          )
        : [];

      const baseData = {
        attendance: filteredAttendance,
        assignments: filteredAssignments,
        leaves: filteredLeaves,
        notices: filteredNotices,
        marks: filteredMarks
      };

      const statistics = calculateStatistics(baseData);

      setDashboardData({ ...baseData, statistics });

    } catch (err: any) {
      console.error("❌ Dashboard fetch failed:", err);
      setError(err.message || "Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getLocalJSON, calculateStatistics]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const StatCard = ({ title, value, subtitle, icon, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your academic dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Academic Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Welcome back, {studentInfo?.name || 'Student'} • Class {studentInfo?.classId}-{studentInfo?.section}
                  {studentInfo?.rollNumber && ` • Roll No: ${studentInfo.rollNumber}`}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="text-red-600 text-lg">⚠️</div>
                <div>
                  <h3 className="text-red-800 font-semibold">Unable to Load Dashboard</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Attendance"
              value={`${dashboardData.statistics.attendancePercentage}%`}
              subtitle="Overall Presence"
              icon="📊"
              color="border-l-4 border-l-green-500"
            />
            <StatCard
              title="Pending Assignments"
              value={dashboardData.statistics.pendingAssignments}
              subtitle="Need Attention"
              icon="📚"
              color="border-l-4 border-l-blue-500"
            />
            <StatCard
              title="Leave Applications"
              value={dashboardData.statistics.totalLeaves}
              subtitle="This Semester"
              icon="📝"
              color="border-l-4 border-l-yellow-500"
            />
            <StatCard
              title="Average Marks"
              value={dashboardData.statistics.averageMarks}
              subtitle="Current Performance"
              icon="🎯"
              color="border-l-4 border-l-purple-500"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex overflow-x-auto">
              {['overview', 'attendance', 'assignments', 'leaves', 'notices', 'marks'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedSection(tab)}
                  className={`flex-1 min-w-0 px-6 py-4 font-medium transition-colors ${
                    selectedSection === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Overview Section */}
              {selectedSection === 'overview' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recent Attendance */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      📅 Recent Attendance
                    </h3>
                    {dashboardData.attendance.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No attendance records found.</p>
                    ) : (
                      <div className="space-y-3">
                        {dashboardData.attendance.slice(0, 5).map((record, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{formatDate(record.date)}</p>
                              <p className="text-sm text-gray-600">{record.subject || 'General'}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                              {record.status || 'Present'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upcoming Assignments */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      📚 Upcoming Assignments
                    </h3>
                    {dashboardData.assignments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No assignments found.</p>
                    ) : (
                      <div className="space-y-3">
                        {dashboardData.assignments.slice(0, 5).map((assignment, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-blue-700">{assignment.subject_name}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                {assignment.status || 'Pending'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{assignment.title}</p>
                            {assignment.due_date && (
                              <p className="text-xs text-gray-500">
                                Due: {formatDate(assignment.due_date)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Notices */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      📢 Recent Notices
                    </h3>
                    {dashboardData.notices.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No notices found.</p>
                    ) : (
                      <div className="space-y-3">
                        {dashboardData.notices.slice(0, 5).map((notice, index) => (
                          <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{notice.title || 'Notice'}</h4>
                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                {formatDate(notice.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mb-2">{notice.description || 'No description provided.'}</p>
                            {notice.notice_by_email && (
                              <p className="text-xs text-gray-600">By: {notice.notice_by_email}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Sections */}
              {selectedSection !== 'overview' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 capitalize">
                    {selectedSection}
                  </h3>
                  
                  {selectedSection === 'attendance' && (
                    <AttendanceSection data={dashboardData.attendance} />
                  )}
                  
                  {selectedSection === 'assignments' && (
                    <AssignmentsSection data={dashboardData.assignments} />
                  )}
                  
                  {selectedSection === 'leaves' && (
                    <LeavesSection data={dashboardData.leaves} />
                  )}
                  
                  {selectedSection === 'notices' && (
                    <NoticesSection data={dashboardData.notices} />
                  )}
                  
                  {selectedSection === 'marks' && (
                    <MarksSection data={dashboardData.marks} />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Detailed Section Components
const AttendanceSection = ({ data }: { data: any[] }) => (
  <div className="overflow-x-auto">
    {data.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No attendance records available.</p>
    ) : (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(record.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.subject || 'General'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  record.status === 'Present' ? 'bg-green-100 text-green-800' :
                  record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {record.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {record.remarks || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const AssignmentsSection = ({ data }: { data: any[] }) => (
  <div className="space-y-4">
    {data.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No assignments available.</p>
    ) : (
      data.map((assignment, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-lg text-gray-900">{assignment.subject_name}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  assignment.status === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {assignment.status || 'Pending'}
                </span>
              </div>
              <h4 className="text-md font-medium text-gray-800 mb-2">{assignment.title}</h4>
              <p className="text-gray-600 mb-3">{assignment.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {assignment.due_date && (
                  <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                )}
                {assignment.teacher_name && (
                  <span>Teacher: {assignment.teacher_name}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

const LeavesSection = ({ data }: { data: any[] }) => (
  <div className="space-y-4">
    {data.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No leave applications found.</p>
    ) : (
      data.map((leave, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-gray-900">{leave.leave_type}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {leave.status || 'Pending'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
              </div>
              {leave.reason && (
                <p className="text-gray-700">{leave.reason}</p>
              )}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

const NoticesSection = ({ data }: { data: any[] }) => (
  <div className="space-y-4">
    {data.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No notices available.</p>
    ) : (
      data.map((notice, index) => (
        <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-3">
            <h4 className="font-semibold text-gray-900 text-lg">{notice.title || 'Notice'}</h4>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {new Date(notice.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 mb-3">{notice.description || 'No description provided.'}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {notice.notice_by_email && (
              <span>From: {notice.notice_by_email}</span>
            )}
            {notice.priority && (
              <span className={`px-2 py-1 rounded ${
                notice.priority === 'High' ? 'bg-red-100 text-red-800' :
                notice.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {notice.priority} Priority
              </span>
            )}
          </div>
        </div>
      ))
    )}
  </div>
);

const MarksSection = ({ data }: { data: any[] }) => (
  <div className="overflow-x-auto">
    {data.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No marks data available.</p>
    ) : (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((mark, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {mark.subject}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {mark.subject_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {mark.marks_obtained}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {mark.total_marks || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {mark.percentage}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  parseFloat(mark.percentage) >= 80 ? 'bg-green-100 text-green-800' :
                  parseFloat(mark.percentage) >= 60 ? 'bg-blue-100 text-blue-800' :
                  parseFloat(mark.percentage) >= 40 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {mark.grade || 'N/A'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);