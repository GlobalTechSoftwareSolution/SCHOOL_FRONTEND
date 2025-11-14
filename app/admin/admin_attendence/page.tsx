"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

const API = "https://globaltechsoftwaresolutions.cloud/school-api/api";

interface Student {
  id: number;
  email: string;
  fullname: string;
  student_id: string;
  class_id: number;
  profile_picture?: string | null;
  [key: string]: any;
}

interface Teacher {
  id: number;
  email: string;
  fullname: string;
  profile_picture?: string | null;
  [key: string]: any;
}

interface Principal {
  id: number;
  email: string;
  fullname: string;
  profile_picture?: string | null;
  [key: string]: any;
}

interface Admin {
  id: number;
  email: string;
  fullname: string;
  profile_picture?: string | null;
  [key: string]: any;
}

interface ClassData {
  id: number;
  class_name: string;
  sec?: string;
  class_id?: number;
  class_teacher_name?: string;
  [key: string]: any;
}

interface AttendanceRecord {
  id: number;
  user_email: string;
  user_name?: string;
  date: string;
  status: string;
  check_in?: string;
  check_out?: string;
  role?: string;
  profile_picture?: string | null;
  [key: string]: any;
}

export default function ClassWiseAttendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("students");
  const [adminEmail, setAdminEmail] = useState("");

  // READ ADMIN EMAIL FROM LOCALSTORAGE
  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        setAdminEmail(parsed.email);
        console.log("👨‍💼 Admin Logged In:", parsed.email);
      }
    } catch (err) {
      console.error("❌ Error reading localStorage userData:", err);
    }
  }, []);

  // FETCH ALL APIs
  useEffect(() => {
    console.log("🔄 Starting API Fetch...");

    const loadData = async () => {
      try {
        console.log("📡 Fetching Students API...");
        const s = await axios.get(`${API}/students/`);
        console.log("✅ Students Fetched:", s.data);
        setStudents(s.data);

        console.log("📡 Fetching Teachers API...");
        const t = await axios.get(`${API}/teachers/`);
        console.log("✅ Teachers Fetched:", t.data);
        setTeachers(t.data);

        console.log("📡 Fetching Principal API...");
        try {
          const p = await axios.get(`${API}/principal/`);
          console.log("✅ Principal Fetched:", p.data);
          setPrincipal(Array.isArray(p.data) ? p.data[0] : p.data);
        } catch (err) {
          console.warn("⚠️ Principal API failed:", err);
        }

        console.log("📡 Fetching Admin API...");
        try {
          const ad = await axios.get(`${API}/admin/`);
          console.log("✅ Admin Fetched:", ad.data);
          setAdmin(Array.isArray(ad.data) ? ad.data[0] : ad.data);
        } catch (err) {
          console.warn("⚠️ Admin API failed:", err);
        }

        console.log("📡 Fetching Classes API...");
        const c = await axios.get(`${API}/classes/`);
        console.log("✅ Classes Fetched:", c.data);
        setClasses(c.data);

        console.log("📡 Fetching Attendance API...");
        const a = await axios.get(`${API}/attendance/`);
        console.log("✅ Attendance Fetched:", a.data);
        setAttendance(a.data);

        console.log("🎉 All API Data Loaded");
        setLoading(false);
      } catch (err) {
        console.error("❌ API Fetch Error:", err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // MERGE STUDENTS + CLASS + ATTENDANCE WITH PROFILE PICTURES
  const getMergedAttendance = () => {
    console.log("🔄 Merging Students + Classes + Attendance...");

    const merged = attendance
      .map((att) => {
        const student = students.find((s) => s.email === att.user_email);
        if (!student) {
          return null;
        }

        const cls = classes.find((c) => c.id === student.class_id);

        return {
          id: att.id,
          fullname: student.fullname,
          email: student.email,
          student_id: student.student_id,
          class_id: student.class_id,
          class_name: cls?.class_name,
          section: cls?.sec,
          class_teacher: cls?.class_teacher_name || "Not Assigned",
          date: att.date,
          check_in: att.check_in,
          check_out: att.check_out,
          status: att.status,
          profile_picture: student.profile_picture || null,
        };
      })
      .filter((item): item is Exclude<typeof item, null> => item !== null);

    console.log("✅ Merged Attendance:", merged);
    return merged;
  };

  // STUDENT FILTER
  const filteredStudentAttendance = selectedClassId
    ? getMergedAttendance().filter((i) => i.class_id === parseInt(selectedClassId as string))
    : [];

  // TEACHER FILTER WITH PROFILE PICTURE
  const teacherAttendance = attendance
    .map((a) => {
      const teacher = teachers.find((t) => t.email === a.user_email);
      return {
        ...a,
        user_name: teacher?.fullname || a.user_name,
        profile_picture: teacher?.profile_picture || null,
      };
    })
    .filter((a) => a.role?.toLowerCase() === "teacher");

  // PRINCIPAL FILTER WITH PROFILE PICTURE
  const principalAttendance = attendance
    .map((a) => {
      return {
        ...a,
        user_name: principal?.fullname || a.user_name,
        profile_picture: principal?.profile_picture || null,
      };
    })
    .filter((a) => a.role?.toLowerCase() === "principal");

  // ADMIN ATTENDANCE FILTER WITH PROFILE PICTURE
  const adminAttendance = attendance
    .map((a) => {
      return {
        ...a,
        user_name: admin?.fullname || a.user_name,
        profile_picture: admin?.profile_picture || null,
      };
    })
    .filter((a) => a.user_email === adminEmail);

  console.log("👨‍💼 Admin Attendance Records:", adminAttendance);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
            <p className="text-gray-600">View and manage attendance records for all users</p>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { key: "students", label: "Students", icon: "👨‍🎓", color: "blue" },
              { key: "teachers", label: "Teachers", icon: "👨‍🏫", color: "green" },
              { key: "principal", label: "Principal", icon: "👨‍💼", color: "purple" },
              { key: "admin", label: "Admin", icon: "🛠️", color: "orange" },
            ].map(({ key, label, icon, color }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`p-4 rounded-xl shadow-sm border-2 transition-all duration-200 ${
                  mode === key
                    ? `bg-${color}-50 border-${color}-500 text-${color}-700 shadow-md`
                    : "bg-white border-gray-200 text-gray-700 hover:shadow-md hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{label}</div>
                    <div className="text-sm text-gray-500">
                      {key === "students" && filteredStudentAttendance.length}
                      {key === "teachers" && teacherAttendance.length}
                      {key === "principal" && principalAttendance.length}
                      {key === "admin" && adminAttendance.length} records
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Students Section */}
            {mode === "students" && (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Student Attendance</h2>
                    <p className="text-gray-600">Select a class to view student attendance records</p>
                  </div>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[200px]"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.class_name} - {cls.sec || "N/A"}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClassId ? (
                  filteredStudentAttendance.length > 0 ? (
                    <AttendanceTable data={filteredStudentAttendance} includeClass={true} />
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📊</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
                      <p className="text-gray-500">No attendance records found for the selected class.</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🏫</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Class</h3>
                    <p className="text-gray-500">Please select a class to view attendance records.</p>
                  </div>
                )}
              </div>
            )}

            {/* Teachers Section */}
            {mode === "teachers" && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Teacher Attendance</h2>
                  <p className="text-gray-600">Attendance records for teaching staff</p>
                </div>
                {teacherAttendance.length > 0 ? (
                  <AttendanceTable data={teacherAttendance} includeClass={false} />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">👨‍🏫</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Teacher Records</h3>
                    <p className="text-gray-500">No attendance records found for teachers.</p>
                  </div>
                )}
              </div>
            )}

            {/* Principal Section */}
            {mode === "principal" && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Principal Attendance</h2>
                  <p className="text-gray-600">Attendance records for principal</p>
                </div>
                {principalAttendance.length > 0 ? (
                  <AttendanceTable data={principalAttendance} includeClass={false} />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">👨‍💼</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Principal Records</h3>
                    <p className="text-gray-500">No attendance records found for principal.</p>
                  </div>
                )}
              </div>
            )}

            {/* Admin Section */}
            {mode === "admin" && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Attendance</h2>
                  <p className="text-gray-600">
                    Your attendance records ({adminEmail || "Not logged in"})
                  </p>
                </div>
                {adminAttendance.length > 0 ? (
                  <AttendanceTable data={adminAttendance} includeClass={false} />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🛠️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Admin Records</h3>
                    <p className="text-gray-500">No attendance records found for admin account.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* TABLE COMPONENT */
interface AttendanceTableProps {
  data: any[];
  includeClass: boolean;
}

function AttendanceTable({ data, includeClass }: AttendanceTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: string }> = {
      Present: { color: "bg-green-100 text-green-800", icon: "✅" },
      Absent: { color: "bg-red-100 text-red-800", icon: "❌" },
      Late: { color: "bg-yellow-100 text-yellow-800", icon: "⏰" },
      Halfday: { color: "bg-orange-100 text-orange-800", icon: "🕑" },
    };

    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", icon: "❓" };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <span>{config.icon}</span>
        {status}
      </span>
    );
  };

  const getInitials = (name: string) => {
    return (name || "?")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Photo
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email
            </th>
            {includeClass && (
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Class
              </th>
            )}
            {includeClass && (
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Section
              </th>
            )}
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Check In
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Check Out
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                {item.profile_picture ? (
                  <img
                    src={item.profile_picture}
                    alt={item.user_name || item.fullname}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    onError={(e) => {
                      (e.currentTarget).style.display = "none";
                    }}
                  />
                ) : null}
                {!item.profile_picture && (
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(item.user_name || item.fullname || "?")}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{item.user_name || item.fullname}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {item.user_email || item.email}
              </td>
              {includeClass && (
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {item.class_name}
                </td>
              )}
              {includeClass && (
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {item.section}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`font-medium ${item.check_in ? "text-green-600" : "text-gray-400"}`}>
                  {item.check_in || "Not checked in"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`font-medium ${item.check_out ? "text-blue-600" : "text-gray-400"}`}>
                  {item.check_out || "Not checked out"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
