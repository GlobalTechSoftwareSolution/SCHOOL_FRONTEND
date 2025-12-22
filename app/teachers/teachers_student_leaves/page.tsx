"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

interface ClassInfo {
  id: number;
  class_name: string;
  sec: string;
  class_teacher_name: string;
  class_teacher_email: string;
}

interface Student {
  id: number;
  email: string;
  fullname: string;
  class_id: number;
  roll_number: string;
  section: string;
  profile_picture: string;
}

interface LeaveApplication {
  id: number;
  applicant: string;
  applicant_email: string;
  approved_by_email: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
}

interface TeacherClass {
  class_id: number;
  class_name: string;
  section: string;
}

const TeachersStudentLeavePage = () => {
  // const [classes, setClasses] = useState<ClassInfo[]>([]); // Not currently used
  // const [students, setStudents] = useState<Student[]>([]); // Not currently used
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch teacher's classes
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

        // Fetch teacher's timetable to get class IDs
        const timetableResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/timetable/`
        );

        const teacherTimetable = timetableResponse.data.filter(
          (item: { teacher: string }) => item.teacher === teacherEmail
        );

        // Collect unique class_ids from timetable
        const classIds = Array.from(
          new Set(teacherTimetable.map((t: { class_id: number }) => t.class_id))
        ).filter((id): id is number => Boolean(id));

        // Fetch classes from classes API
        const classesRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/`
        );
        const allClasses = classesRes.data || [];

        // Filter classes to only those taught by this teacher
        const teacherClassesData: TeacherClass[] = allClasses
          .filter((cls: ClassInfo) => classIds.includes(cls.id))
          .map((cls: ClassInfo) => ({
            class_id: cls.id,
            class_name: cls.class_name,
            section: cls.sec || "N/A",
          }));

        // setClasses(allClasses); // Not currently used
        setTeacherClasses(teacherClassesData);
      } catch (error) {
        console.error("❌ Error fetching teacher data:", error);
        setError("Failed to fetch class data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  // Fetch students and leaves when a class is selected
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedClass) {
        // Clear data when no class is selected
        // setStudents([]); // Not currently used
        setLeaves([]);
        return;
      }

      try {
        setLoading(true);

        // Fetch students from students API filtered by class_id
        const studentsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/students/`
        );

        const classStudents = studentsResponse.data.filter(
          (student: Student) => student.class_id === selectedClass
        );

        // setStudents(classStudents); // Not currently used

        // Fetch leaves from leaves API
        const leavesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/leaves/`
        );

        // Filter leaves to only those from students in this class
        const classStudentEmails = new Set(classStudents.map((s: Student) => s.email));
        const classLeaves = leavesResponse.data.filter(
          (leave: LeaveApplication) => classStudentEmails.has(leave.applicant)
        );

        // Enhance leaves with student names
        const enhancedLeaves = classLeaves.map((leave: LeaveApplication) => {
          const student = classStudents.find((s: Student) => s.email === leave.applicant);
          return {
            ...leave,
            student_name: student ? student.fullname : leave.applicant
          };
        });

        setLeaves(enhancedLeaves);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setError("Failed to fetch leave data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedClass]);

  if (loading && teacherClasses.length === 0) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading classes...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Student Leave Applications</h1>
                <p className="text-gray-600 text-sm sm:text-base">Manage leave applications from students in your classes</p>
              </div>

              <div className="w-full sm:w-auto">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">Leave Management</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{leaves.length} applications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Class Selector */}
          {teacherClasses.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <select
                  value={selectedClass ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedClass(v === "" ? null : Number(v));
                  }}
                  className="w-full sm:w-1/2 md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Filter by class"
                >
                  <option value="">All Classes</option>
                  {teacherClasses.map((cls) => (
                    <option key={cls.class_id} value={cls.class_id}>
                      {cls.class_name} - {cls.section}
                    </option>
                  ))}
                </select>

                {/* small helper text on the right on larger screens */}
                <div className="text-xs text-gray-500 sm:ml-2">
                  {selectedClass ? "Showing selected class only" : "Showing applications across all classes"}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Leaves View */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Leave Applications</h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                {selectedClass 
                  ? `${leaves.length} applications from selected class` 
                  : `${leaves.length} total applications across all your classes`}
              </p>
            </div>

            {leaves.length > 0 ? (
              <div className="p-4 sm:p-6">
                {/* Responsive grid: 1 col mobile, 2 sm, 3 md+, 4 xl */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {leaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-col justify-between min-h-[150px]"
                    >
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{leave.student_name || leave.applicant}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{leave.applicant}</p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                            leave.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : leave.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                          aria-hidden
                        >
                          {leave.status || "Pending"}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="text-gray-600 text-xs sm:text-sm">Type:</span>
                          <span className="font-medium text-sm">{leave.leave_type || "N/A"}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="text-gray-600 text-xs sm:text-sm">Dates:</span>
                          <span className="font-medium text-sm break-words">
                            {leave.start_date} to {leave.end_date}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-600 text-xs sm:text-sm">Reason:</span>
                          <p className="mt-1 text-gray-900 text-sm overflow-hidden" style={{ wordBreak: "break-word" }}>
                            {leave.reason || "No reason provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading leave applications...</p>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 px-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No leave applications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedClass 
                    ? "No students in this class have submitted leave applications." 
                    : "No leave applications found across your classes."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeachersStudentLeavePage;
