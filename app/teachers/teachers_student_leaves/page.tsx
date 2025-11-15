"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

interface LeaveApplication {
  id: number;
  applicant: string; // Student email who applied for leave
  applicant_email: string;
  approved_by_email: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Enhanced fields we'll add
  student_name?: string;
  class_name?: string;
  section?: string;
  applied_date?: string;
  teacher_remarks?: string;
}

interface TimetableEntry {
  teacher: string;
  class_id: number;
}

interface TeacherClass {
  class_name: string;
  section: string;
}

const TeachersStudentLeavePage = () => {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    class: "all",
    search: ""
  });

  // Fetch teacher's classes and leave applications
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get teacher email from localStorage
        const storedUser = localStorage.getItem("userData");
        if (!storedUser) {
          setError("Teacher information not found. Please login again.");
          setLoading(false);
          return;
        }

        const { email: teacherEmail } = JSON.parse(storedUser);
        if (!teacherEmail) {
          setError("Teacher email not found. Please login again.");
          setLoading(false);
          return;
        }

        // Fetch teacher's timetable to get their classes
        const timetableResponse = await axios.get(
          "https://globaltechsoftwaresolutions.cloud/school-api/api/timetable/"
        );
        
        const teacherTimetable: TimetableEntry[] = timetableResponse.data.filter(
          (item: any) => item.teacher === teacherEmail
        );

        // Collect unique class_ids from timetable
        const classIds = Array.from(
          new Set(teacherTimetable.map((t: any) => t.class_id))
        ).filter(Boolean);

        // Fetch classes from classes API and keep only those for this teacher
        const classesRes = await axios.get(
          "https://globaltechsoftwaresolutions.cloud/school-api/api/classes/"
        );
        const allClasses = classesRes.data || [];

        const uniqueClasses: TeacherClass[] = allClasses
          .filter((cls: any) => classIds.includes(cls.id))
          .map((cls: any) => ({
            class_name: cls.class_name,
            section: cls.sec || "N/A",
          }));

        setTeacherClasses(uniqueClasses);

        // Fetch student_attendance records (we will derive "leave" entries from these)
        const attendanceResponse = await axios.get(
          "https://globaltechsoftwaresolutions.cloud/school-api/api/student_attendance/"
        );

        console.log("📋 Raw student_attendance records:", attendanceResponse.data);

        // Create teacher classes set for filtering
        const teacherClassesSet = new Set(
          uniqueClasses.map((cls: TeacherClass) => `${cls.class_name}-${cls.section}`)
        );

        console.log("📋 Teacher classes set:", Array.from(teacherClassesSet));

        // Fetch all students first to avoid 404 errors
        console.log("📋 Fetching all students data...");
        const studentsResponse = await axios.get(
          "https://globaltechsoftwaresolutions.cloud/school-api/api/students/"
        );
        
        // Create a map of students by email for quick lookup
        const studentsMap = new Map();
        studentsResponse.data.forEach((student: any) => {
          studentsMap.set(student.email, student);
        });
        
        console.log(`📋 Loaded ${studentsMap.size} students for lookup`);

        // Enhance attendance rows with student information and filter to this teacher's classes
        const enhancedLeaves: LeaveApplication[] = [];
        
        for (const att of attendanceResponse.data) {
          try {
            // Only consider rows belonging to this teacher
            if (att.teacher && att.teacher !== teacherEmail) {
              continue;
            }

            // Only consider absences (treat them as leave-like entries)
            if (!att.status || att.status.toLowerCase() !== "absent") {
              continue;
            }

            const studentEmail = att.student;
            if (!studentEmail) {
              console.log(`⚠️ Skipping attendance ${att.id} - no student email`);
              continue;
            }

            // Look up student information from the students map
            console.log(`📋 Looking up student data for: ${studentEmail}`);
            const studentData = studentsMap.get(studentEmail);
            
            if (!studentData) {
              console.log(`⚠️ Student not found for email: ${studentEmail}`);
              // Try to create a basic leave entry with available information
              const basicLeave: LeaveApplication = {
                id: att.id,
                applicant: studentEmail,
                applicant_email: studentEmail,
                approved_by_email: null,
                leave_type: att.subject_name || "Attendance - Absent",
                start_date: att.date,
                end_date: att.date,
                reason: "Marked absent in attendance",
                status: att.status,
                created_at: att.created_time,
                updated_at: att.created_time,
                student_name: att.student_name || studentEmail,
                class_name: att.class_name || "Unknown",
                section: att.section || "Unknown",
                applied_date: att.created_time,
                teacher_remarks: "",
              };
              console.log(`📋 Created basic leave-like entry for unknown student: ${basicLeave.student_name}`);
              // still continue to class filter below
              // no "continue" here so we can still check class match
            }
            
            if (studentData) {
              console.log(`📋 Student data for ${studentEmail}:`, studentData);
            }
            
            // Enhance attendance row with student information, mapping into LeaveApplication shape
            const enhancedLeave: LeaveApplication = {
              id: att.id,
              applicant: studentEmail,
              applicant_email: studentEmail,
              approved_by_email: null,
              leave_type: att.subject_name || "Attendance - Absent",
              start_date: att.date,
              end_date: att.date,
              reason: "Marked absent in attendance",
              status: att.status,
              created_at: att.created_time,
              updated_at: att.created_time,
              student_name:
                att.student_name ||
                studentData?.fullname ||
                studentData?.name ||
                studentEmail,
              class_name: att.class_name || studentData?.class_name || studentData?.class,
              section: att.section || studentData?.section || "N/A",
              applied_date: att.created_time,
              teacher_remarks: "",
            };

            // Check if this student is in teacher's classes
            const leaveClassKey = `${enhancedLeave.class_name}-${enhancedLeave.section}`;
            // Also try with "Grade" prefix for compatibility
            const gradeClassKey = `Grade ${enhancedLeave.class_name}-${enhancedLeave.section}`;
            
            console.log(`📋 Checking leave: ${enhancedLeave.student_name} - Class: "${enhancedLeave.class_name}" Section: "${enhancedLeave.section}"`);
            console.log(`📋 Trying keys: "${leaveClassKey}" and "${gradeClassKey}"`);
            
            const matches = teacherClassesSet.has(leaveClassKey) || teacherClassesSet.has(gradeClassKey);
            console.log(`📋 Matches teacher classes: ${matches}`);
            
            if (matches) {
              enhancedLeaves.push(enhancedLeave);
            }
          } catch (error) {
            console.error(`❌ Error processing attendance row for student: ${att?.student}`, error);
            // Skip this leave if we can't process it
          }
        }

        console.log("📋 Teacher's classes:", uniqueClasses);
        console.log("📋 Enhanced and filtered leave applications:", enhancedLeaves);
        setLeaves(enhancedLeaves);

      } catch (error) {
        console.error("❌ Error fetching teacher data:", error);
        setError("Failed to fetch leave applications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  // Handle leave action (approve/reject)
  const handleLeaveAction = async (action: "approve" | "reject") => {
    if (!selectedLeave) return;

    try {
      setActionLoading(true);
      
      const token = localStorage.getItem("accessToken");
      const updateData = {
        status: action === "approve" ? "Approved" : "Rejected",
        teacher_remarks: remarks
      };

      await axios.patch(
        `https://globaltechsoftwaresolutions.cloud/school-api/api/leaves/${selectedLeave.id}/`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setLeaves(prevLeaves =>
        prevLeaves.map(leave =>
          leave.id === selectedLeave.id
            ? {
                ...leave,
                status: action === "approve" ? "Approved" : "Rejected",
                teacher_remarks: remarks
              }
            : leave
        )
      );

      setShowActionModal(false);
      setRemarks("");
      setSelectedLeave(null);

    } catch (error) {
      console.error("❌ Error updating leave application:", error);
      setError("Failed to update leave application. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter leaves based on filters
  const filteredLeaves = leaves.filter(leave => {
    const matchesStatus = filters.status === "all" || leave.status === filters.status;
    const matchesClass = filters.class === "all" || leave.class_name === filters.class;
    const matchesSearch = (leave.student_name?.toLowerCase() || "").includes(filters.search.toLowerCase()) ||
                         (leave.leave_type?.toLowerCase() || "").includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesClass && matchesSearch;
  });

  // Statistics (map API status values to display values)
  const stats = {
    total: leaves.length,
    pending: leaves.filter(leave => leave.status?.toLowerCase() === "pending").length,
    approved: leaves.filter(leave => leave.status?.toLowerCase() === "approved").length,
    rejected: leaves.filter(leave => leave.status?.toLowerCase() === "rejected").length,
  };

  // Get unique classes for filter
  const uniqueClasses = Array.from(new Set(leaves.map(leave => leave.class_name).filter(Boolean)));

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading leave applications...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Classes - Student Leave Management</h1>
                <p className="text-gray-600">Review and manage leave applications from students in your classes</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Leave Coordinator</h3>
                      <p className="text-sm text-gray-600">{stats.pending} pending applications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by student or leave type..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Class Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  value={filters.class}
                  onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Classes</option>
                  {uniqueClasses.map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Leave Applications Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Leave Applications</h2>
              <p className="text-gray-600 text-sm mt-1">
                Showing {filteredLeaves.length} of {leaves.length} applications
              </p>
            </div>

            {filteredLeaves.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class & Section</th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{leave.student_name || 'N/A'}</div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap flex flex-col-2">
                          <div className="text-sm text-gray-900 ml-2">{leave.class_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500 ml-3">{leave.section || 'N/A'}</div>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{leave.leave_type || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {leave.start_date && leave.end_date 
                              ? `${new Date(leave.start_date).toLocaleDateString()} - ${new Date(leave.end_date).toLocaleDateString()}`
                              : 'N/A'
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            {leave.start_date && leave.end_date 
                              ? `${Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days`
                              : 'N/A'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {leave.applied_date ? new Date(leave.applied_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            leave.status?.toLowerCase() === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : leave.status?.toLowerCase() === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {leave.status || 'Pending'}
                          </span>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setShowActionModal(true);
                            }}
                            disabled={leave.status !== 'Pending'}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              leave.status !== 'Pending'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            Review
                          </button>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No leave applications found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filters.status !== 'all' || filters.class !== 'all' || filters.search !== '' 
                    ? 'Try adjusting your filters' 
                    : 'No leave applications have been submitted yet.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Modal */}
        {showActionModal && selectedLeave && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">Review Leave Application</h2>
                    <p className="text-blue-100">Take action on this leave request</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowActionModal(false);
                      setRemarks("");
                      setSelectedLeave(null);
                    }}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Student Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Student Name</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedLeave.student_name || 'N/A'}</p>
                  </div>
                  {/* <div>
                    <label className="text-sm font-medium text-gray-500">Class & Section</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedLeave.class_name || 'N/A'} • {selectedLeave.section || 'N/A'}</p>
                  </div> */}
                </div>

                {/* Leave Details */}
                <div className="border-t border-b border-gray-200 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Leave Type</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedLeave.leave_type || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Duration</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedLeave.start_date && selectedLeave.end_date 
                          ? `${Math.ceil((new Date(selectedLeave.end_date).getTime() - new Date(selectedLeave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days`
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-sm font-medium text-gray-500">Date Range</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedLeave.start_date && selectedLeave.end_date 
                        ? `${new Date(selectedLeave.start_date).toLocaleDateString()} - ${new Date(selectedLeave.end_date).toLocaleDateString()}`
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason for Leave</label>
                  <p className="text-gray-900 mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {selectedLeave.reason || 'No reason provided'}
                  </p>
                </div>

                {/* Teacher Remarks */}
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">
                    Your Remarks {selectedLeave.teacher_remarks && `(Previous: "${selectedLeave.teacher_remarks}")`}
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter your remarks or feedback for the student..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleLeaveAction("reject")}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Reject"}
                  </button>
                  <button
                    onClick={() => handleLeaveAction("approve")}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Approve"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeachersStudentLeavePage;