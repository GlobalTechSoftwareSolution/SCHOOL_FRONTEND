"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

// ✅ Added type definition
interface AttendanceRecord {
  id: number;
  student_name: string;
  student?: string;
  date: string;
  status: "Present" | "Absent" | "Late" | string;
  marked_by_role?: string;
  remarks?: string;
}

const AttendancePage = () => {
  // ✅ Added type to useState
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const API_URL =
    "https://globaltechsoftwaresolutions.cloud/school-api/api/attendance/";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedEmail =
      localStorage.getItem("userEmail") ||
      JSON.parse(localStorage.getItem("userData") || "{}")?.email ||
      JSON.parse(localStorage.getItem("userInfo") || "{}")?.email;

    const storedRole =
      localStorage.getItem("userRole") ||
      JSON.parse(localStorage.getItem("userData") || "{}")?.role ||
      JSON.parse(localStorage.getItem("userInfo") || "{}")?.role;

    if (!storedEmail) {
      setError("⚠️ No logged-in user found. Please log in again.");
      return;
    }

    setUserEmail(storedEmail);
    setUserRole(storedRole || "Student");

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(API_URL);
        const allRecords: AttendanceRecord[] = response.data;

        const filteredRecords =
          storedRole === "Admin"
            ? allRecords
            : allRecords.filter(
                (rec) =>
                  rec.student &&
                  rec.student.toLowerCase() === storedEmail.toLowerCase()
              );

        if (filteredRecords.length === 0) {
          setError("No attendance records found for your account.");
        }

        setAttendanceData(filteredRecords);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError("Failed to fetch attendance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // ✅ No more TS errors
  const presentCount = attendanceData.filter(
    (att) => att.status === "Present"
  ).length;
  const absentCount = attendanceData.filter(
    (att) => att.status === "Absent"
  ).length;
  const totalCount = attendanceData.length;
  const attendancePercentage =
    totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

  const filteredData = attendanceData.filter((att) => {
    if (!att.date) return false;
    const date = new Date(att.date);
    return (
      date.getMonth() + 1 === selectedMonth &&
      date.getFullYear() === selectedYear
    );
  });

  const months = [
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
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">📅</span>
                  </div>
                  Attendance Dashboard
                </h1>
                {userEmail && (
                  <p className="text-gray-600 mt-2">
                    Welcome back,{" "}
                    <span className="font-semibold text-blue-600">
                      {userEmail}
                    </span>
                    <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {userRole}
                    </span>
                  </p>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {presentCount}
                  </div>
                  <div className="text-sm text-green-800 font-medium">
                    Present
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-rose-100 rounded-xl p-4 border border-red-200 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {absentCount}
                  </div>
                  <div className="text-sm text-red-800 font-medium">Absent</div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-100 rounded-xl p-4 border border-blue-200 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalCount}
                  </div>
                  <div className="text-sm text-blue-800 font-medium">Total</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-violet-100 rounded-xl p-4 border border-purple-200 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {attendancePercentage}%
                  </div>
                  <div className="text-sm text-purple-800 font-medium">
                    Percentage
                  </div>
                </div>
              </div>
            </div>
          </div>


        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Month & Year
              </label>
              <div className="flex gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="flex justify-center items-center gap-3">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading your attendance records...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-100 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        {filteredData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Marked By
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((att: any) => (
                    <tr 
                      key={att.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 group-hover:bg-white transition-colors">
                          {att.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {att.student_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          {att.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          att.status === "Present"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : att.status === "Absent"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        }`}>
                          {att.status === "Present" && "✅ "}
                          {att.status === "Absent" && "❌ "}
                          {att.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          {att.marked_by_role}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {att.remarks || (
                          <span className="text-gray-400 italic">No remarks</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredData.length === 0 && attendanceData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No records found</h3>
            <p className="text-gray-500 mb-6">
              No attendance records found for {months[selectedMonth - 1]} {selectedYear}
            </p>
            <button 
              onClick={() => {
                setSelectedMonth(new Date().getMonth() + 1);
                setSelectedYear(new Date().getFullYear());
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Show Current Month
            </button>
          </div>
        )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;