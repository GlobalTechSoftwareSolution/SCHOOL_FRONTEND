"use client";
import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import axios from "axios";
import { 
  Calendar, 
  Users, 
  TrendingDown, 
  Filter,
  Download
} from "lucide-react";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

const AbsentStudentsReport = () => {
  interface Student {
    id?: number;
    email?: string;
    fullname?: string;
    name?: string;
    class_name?: string;
    class?: string;
    sec?: string;
    section?: string;
  }

  interface AttendanceRecord {
    id?: number;
    student_email?: string;
    student?: string;
    status?: string;
  }

  interface AbsentStudent {
    id?: number;
    student_name: string;
    date: string;
    class_name?: string;
    sec?: string;
    student_email?: string;
    status?: string;
    remarks?: string;
  }

  const [attendance, setAttendance] = useState<AbsentStudent[]>([]);
  const [filteredAbsentees, setFilteredAbsentees] = useState<AbsentStudent[]>([]);
  // Commented out unused state
  // const [filterType, setFilterType] = useState("day");
  const [loading, setLoading] = useState(true);
  // Commented out unused state
  // const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // ✅ Get date range based on filter
  // Commented out unused function
  // const getDateRange = (type: string) => {
  //   const today = new Date();
  //   let startDate = new Date();
  //
  //   switch (type) {
  //     case "week":
  //       startDate.setDate(today.getDate() - 6);
  //       break;
  //     case "month":
  //       startDate.setMonth(today.getMonth() - 1);
  //       break;
  //     case "year":
  //       startDate.setFullYear(today.getFullYear() - 1);
  //       break;
  //     default:
  //       startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  //   }
  //
  //   return { startDate, endDate: today };
  // };

  // ✅ Filter absentees based on selected year/month and class/section
  const filterAbsentees = useCallback((data: AbsentStudent[]) => {
    return data.filter(() => {
      // For absent students, we're already filtering by today's date in fetchAttendance
      // But we still need to apply class/section/year/month filters if needed
      
      const matchesYear = selectedYear
        ? new Date().getFullYear().toString() === selectedYear
        : true;

      const matchesMonth =
        selectedMonth !== ""
          ? new Date().getMonth() === Number(selectedMonth)
          : true;

      return matchesYear && matchesMonth;
    });
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (attendance.length > 0) {
      const filtered = filterAbsentees(attendance);
      setFilteredAbsentees(filtered);
    }
  }, [attendance, selectedYear, selectedMonth, filterAbsentees]);

  // ✅ Fetch Students and Attendance to calculate absentees
  const fetchAttendance = useCallback(async () => {
    // setRefreshing(true); // Commented out unused state
    try {
      // Fetch all students
      const studentsRes = await axios.get(`${API_BASE}/students/`);
      const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      
      // Fetch today's attendance records
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await axios.get(`${API_BASE}/student_attendance/?date=${today}`);
      const attendanceData = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];

      // Create a set of present student emails for quick lookup
      const presentStudentEmails = new Set(
        attendanceData
          .filter((record: AttendanceRecord) => record.status?.toLowerCase() === 'present')
          .map((record: AttendanceRecord) => (record.student_email || record.student || '').toLowerCase())
      );

      // Calculate absent students: all students minus present students
      const absentStudents = studentsData
        .filter((student: Student) => {
          const studentEmail = (student.email || '').toLowerCase();
          return studentEmail && !presentStudentEmails.has(studentEmail);
        })
        .map((student: Student) => ({
          id: student.id,
          student_name: student.fullname || student.name || 'Unknown Student',
          date: today,
          class_name: student.class_name || student.class || '',
          sec: student.sec || student.section || '',
          student_email: student.email || '',
          status: 'Absent',
          remarks: 'Absent today'
        }));

      setAttendance(absentStudents);
    } catch {
      // Error handling for student attendance fetch
      console.error("Error fetching attendance data");
    } finally {
      setLoading(false);
      // setRefreshing(false); // Commented out unused state
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // ✅ Apply filter whenever attendance or filterType changes
  useEffect(() => {
    if (attendance.length > 0) {
      const filtered = filterAbsentees(attendance);
      setFilteredAbsentees(filtered);
    }
  }, [attendance, selectedYear, selectedMonth, filterAbsentees]);

  // ✅ Export to CSV
  const exportToCSV = () => {
    const headers = ["Date", "Student Name", "Class", "Section", "Reason"];
    const csvData = filteredAbsentees.map((att: AbsentStudent) => [
      att.date,
      att.student_name || "N/A",
      att.class_name || "-",
      att.sec || "-",
      att.remarks || "—"
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `absent-students-daily-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout role="principal">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-lg">Loading attendance data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="principal">
      <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              Absent Students Report
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">View students who are absent today</p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm sm:text-base w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{attendance.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Current Filter</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 capitalize">Daily</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
                <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Absent Students</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{filteredAbsentees.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-red-50 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                  {attendance.length > 0 
                    ? `${Math.round(((attendance.length - filteredAbsentees.length) / attendance.length) * 100)}%`
                    : "0%"
                  }
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              Filter Absentees
            </h2>
          </div>

          {/* 🎯 Year & Month Selectors */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
            {/* Year Dropdown */}
            <div className="flex flex-col flex-1 min-w-0">
              <label className="text-sm font-medium text-gray-700 mb-1">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">All Years</option>
                {[2023, 2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Dropdown */}
            <div className="flex flex-col flex-1 min-w-0">
              <label className="text-sm font-medium text-gray-700 mb-1">Select Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">All Months</option>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-800 font-medium text-sm sm:text-base">
                  Showing absentees for{" "}
                  {selectedMonth !== ""
                    ? [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ][Number(selectedMonth)]
                    : "all months"}{" "}
                  {selectedYear || "all years"}
                </p>
                <p className="text-blue-600 text-xs sm:text-sm">
                  Found <span className="font-bold text-blue-800">{filteredAbsentees.length}</span> student(s)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Format for Absent Students */}
        {filteredAbsentees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="text-center py-12">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Absentees Found</h3>
              <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
                🎉 Excellent! No students were absent during the selected period.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header for Cards Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Absent Students ({filteredAbsentees.length})
              </h2>
              <div className="text-sm text-gray-600">
                Filtered by: <span className="font-semibold text-blue-600 capitalize">Daily</span>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAbsentees.map((att: AbsentStudent, idx: number) => (
                <div 
                  key={att.id || idx}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Student Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {att.student_name || "N/A"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{att.date}</p>
                    </div>
                  </div>

                  {/* Class & Section */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Class: {att.class_name || "-"}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Sec: {att.sec || "-"}
                    </span>
                  </div>

                  {/* Reason */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-600 mb-1">Status:</p>
                    <p className="text-sm text-gray-800 line-clamp-2">
                      Absent today
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Table for smaller screens as fallback */}
            <div className="block sm:hidden bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Name", "Date", "Class", "Reason"].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAbsentees.slice(0, 5).map((att: AbsentStudent, idx: number) => (
                      <tr 
                        key={att.id || idx} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[80px]">
                            {att.student_name || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {att.date}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {att.class_name || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-600 truncate max-w-[100px]">
                            {att.remarks || "-"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredAbsentees.length > 5 && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    Showing 5 of {filteredAbsentees.length} records. Use cards view for full details.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for responsive breakpoints */}
      <style jsx>{`
        /* Custom breakpoint for extra small devices */
        @media (min-width: 475px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 0fr));
          }
        }
        
        /* Ensure proper truncation */
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

export default AbsentStudentsReport;