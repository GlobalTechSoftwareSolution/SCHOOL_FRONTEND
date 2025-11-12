"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

interface AttendanceRecord {
  id: number;
  student_name: string;
  date: string;
  status: "Present" | "Absent" | "Late" | string;
  marked_by_role?: string;
  remarks?: string;
  section?: string;
  class_id?: number;
}

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

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

        console.log("===================================");
        console.log("🎓 Fetching attendance for:", storedEmail);
        console.log("===================================");

        // STEP 1️⃣ — Get student details
        const studentRes = await axios.get(
          `${API_BASE}/students/?email=${encodeURIComponent(storedEmail)}`
        );
        const studentData = Array.isArray(studentRes.data)
          ? studentRes.data[0]
          : studentRes.data;

        if (!studentData) {
          setError("No student data found.");
          return;
        }

        const { fullname, class_id } = studentData;
        console.log("✅ Student found:", { fullname, class_id });

        // STEP 2️⃣ — Get class details based on class_id
        const classRes = await axios.get(`${API_BASE}/classes/`);
        const classList = classRes.data || [];

        const matchedClass = classList.find(
          (cls: any) => cls.id === class_id
        );

        if (!matchedClass) {
          console.warn("⚠️ Class not found for class_id:", class_id);
        }

        const studentClass = matchedClass?.class_name || "Unknown";
        const studentSection = matchedClass?.sec || "Unknown";

        console.log("🏫 Matched Class:", {
          class_name: studentClass,
          section: studentSection,
        });

        // STEP 3️⃣ — Fetch attendance data
        const attendanceRes = await axios.get(`${API_BASE}/attendance/`);
        const allAttendance: AttendanceRecord[] = attendanceRes.data || [];
        console.log("📋 Total Attendance Records:", allAttendance.length);

        // STEP 4️⃣ — Filter attendance for the student
const filteredAttendance = allAttendance.filter((rec) => {
  if (!rec) return false;

  const sameClass = rec.class_id?.toString() === class_id?.toString();
  const sameSection =
    rec.section?.toLowerCase() === studentSection.toLowerCase();

  // Sometimes attendance has student_email or user_email
  const sameEmail =
    rec.student_email?.toLowerCase() === storedEmail.toLowerCase() ||
    rec.user_email?.toLowerCase() === storedEmail.toLowerCase();

  // ✅ Priority 1: match by email
  if (sameEmail) {
    console.log("📧 Email match found for:", storedEmail, "=> Record ID:", rec.id);
    return true;
  }

  // ✅ Priority 2: fallback — match by class & section
  if (sameClass && (studentSection === "Unknown" || sameSection)) {
    console.log("🏫 Class/Section match:", {
      recordId: rec.id,
      recClass: rec.class_id,
      recSection: rec.section,
    });
    return true;
  }

  return false;
});


        console.log(
          "✅ Filtered Attendance Records:",
          filteredAttendance.length
        );

        if (filteredAttendance.length === 0) {
          setError(
            `No attendance found for class ${studentClass} - ${studentSection}`
          );
        }

        setAttendanceData(filteredAttendance);
      } catch (err) {
        console.error("❌ Error fetching attendance:", err);
        setError("Failed to fetch attendance data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Stats
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                📅
              </div>
              Attendance Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome,{" "}
              <span className="font-semibold text-blue-600">{userEmail}</span>
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {userRole}
              </span>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 border border-green-200 rounded-xl text-center">
              <p className="text-2xl font-bold text-green-700">{presentCount}</p>
              <p className="text-sm font-medium text-green-700">Present</p>
            </div>
            <div className="bg-red-50 p-4 border border-red-200 rounded-xl text-center">
              <p className="text-2xl font-bold text-red-700">{absentCount}</p>
              <p className="text-sm font-medium text-red-700">Absent</p>
            </div>
            <div className="bg-blue-50 p-4 border border-blue-200 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-700">{totalCount}</p>
              <p className="text-sm font-medium text-blue-700">Total</p>
            </div>
            <div className="bg-purple-50 p-4 border border-purple-200 rounded-xl text-center">
              <p className="text-2xl font-bold text-purple-700">
                {attendancePercentage}%
              </p>
              <p className="text-sm font-medium text-purple-700">Percentage</p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-3 border border-gray-300 rounded-xl"
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
                className="px-4 py-3 border border-gray-300 rounded-xl"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendance Table */}
          {loading ? (
            <p className="text-center text-gray-600">Loading attendance...</p>
          ) : error ? (
            <div className="text-center text-red-600 font-semibold">{error}</div>
          ) : filteredData.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Marked By
                    </th>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((att) => (
                    <tr key={att.id} className="hover:bg-blue-50">
                      <td className="px-6 py-4">{att.id}</td>
                      <td className="px-6 py-4">{att.user_name}</td>
                      <td className="px-6 py-4">{att.date}</td>
                      <td className="px-6 py-4">{att.status}</td>
                      <td className="px-6 py-4">{att.marked_by_role}</td>
                      <td className="px-6 py-4">
                        {att.remarks || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">
              No attendance records found.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
