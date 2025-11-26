"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

const API = "https://school.globaltechsoftwaresolutions.cloud/api";

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
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]); // for teachers/principal/admin
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]); // from /student_attendance/
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("students");
  const [adminEmail, setAdminEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const t = new Date();
    return t.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  // READ ADMIN EMAIL FROM LOCALSTORAGE
  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        setAdminEmail(parsed.email);
      }
    } catch (err) {
      // silently ignore localStorage errors
    }
  }, []);

  // FETCH ALL APIs
  useEffect(() => {
    const loadData = async () => {
      try {
        const s = await axios.get(`${API}/students/`);
        setStudents(s.data);

        const t = await axios.get(`${API}/teachers/`);
        setTeachers(t.data);

        try {
          const p = await axios.get(`${API}/principal/`);
          setPrincipal(Array.isArray(p.data) ? p.data[0] : p.data);
        } catch (err) {
          // principal API may legitimately be missing; ignore
        }

        try {
          const ad = await axios.get(`${API}/admin/`);
          setAdmin(Array.isArray(ad.data) ? ad.data[0] : ad.data);
        } catch (err) {
          // admin API may legitimately be missing; ignore
        }

        const c = await axios.get(`${API}/classes/`);
        setClasses(c.data);

        const sa = await axios.get(`${API}/student_attendance/`);
        setStudentAttendance(sa.data);

        const a = await axios.get(`${API}/attendance/`);
        setAttendance(a.data);

        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // MERGE STUDENTS + CLASS + ATTENDANCE WITH PROFILE PICTURES (filtered by selectedDate)
  const getMergedAttendance = () => {
    const merged = studentAttendance
      .map((att: any) => {
        // student_attendance: student (email), student_name, class_id, class_name, section, date, status, created_time
        const student = students.find((s) => s.email === att.student);

        const classId = att.class_id ?? student?.class_id;
        const cls = classes.find((c) => c.id === classId);

        return {
          id: att.id,
          fullname: att.student_name || student?.fullname || "Unknown Student",
          email: att.student || student?.email,
          student_id: student?.student_id,
          class_id: classId,
          class_name: att.class_name || cls?.class_name,
          section: att.section || cls?.sec,
          class_teacher: cls?.class_teacher_name || "Not Assigned",
          date: att.date,
          check_in: att.check_in, // may be undefined in student_attendance
          check_out: att.check_out, // may be undefined in student_attendance
          status: att.status,
          profile_picture: student?.profile_picture || null,
        };
      })
      .filter((item): item is Exclude<typeof item, null> => item !== null)
      .filter((item) => {
        // Ensure date is compared as YYYY-MM-DD
        const d = String(item.date || "").split("T")[0];
        return d === selectedDate;
      });
    return merged;
  };

  // STUDENT FILTER (by class + selectedDate via getMergedAttendance)
  const filteredStudentAttendance = selectedClassId
    ? getMergedAttendance().filter((i) => i.class_id === parseInt(selectedClassId as string))
    : [];

  // TEACHER FILTER WITH PROFILE PICTURE (filtered by selectedDate)
  const teacherAttendance = attendance
    .map((a) => {
      const teacher = teachers.find((t) => t.email === a.user_email);
      return {
        ...a,
        user_name: teacher?.fullname || a.user_name,
        profile_picture: teacher?.profile_picture || null,
      };
    })
    .filter((a) => a.role?.toLowerCase() === "teacher")
    .filter((a) => String(a.date || "").split("T")[0] === selectedDate);

  // PRINCIPAL FILTER WITH PROFILE PICTURE (filtered by selectedDate)
  const principalAttendance = attendance
    .map((a) => {
      return {
        ...a,
        user_name: principal?.fullname || a.user_name,
        profile_picture: principal?.profile_picture || null,
      };
    })
    .filter((a) => a.role?.toLowerCase() === "principal")
    .filter((a) => String(a.date || "").split("T")[0] === selectedDate);

  // ADMIN ATTENDANCE FILTER WITH PROFILE PICTURE (filtered by selectedDate)
  const adminAttendance = attendance
    .map((a) => {
      return {
        ...a,
        user_name: admin?.fullname || a.user_name,
        profile_picture: admin?.profile_picture || null,
      };
    })
    .filter((a) => a.user_email === adminEmail)
    .filter((a) => String(a.date || "").split("T")[0] === selectedDate);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex justify-center items-center min-h-[60vh] sm:min-h-screen px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="admin-attendance-page px-4 py-4 sm:px-6 sm:py-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl lg:max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 text-center md:text-left">
                Attendance Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 text-center md:text-left">
                View and manage attendance records for all users
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center sm:text-left">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Mode Selection Cards */}
          <div className="mode-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { key: "students", label: "Students", icon: "👨‍🎓", color: "blue" },
              { key: "teachers", label: "Teachers", icon: "👨‍🏫", color: "green" },
              { key: "principal", label: "Principal", icon: "👨‍💼", color: "purple" },
              { key: "admin", label: "Admin", icon: "🛠️", color: "orange" },
            ].map(({ key, label, icon, color }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`p-4 sm:p-5 rounded-xl shadow-sm border-2 transition-all duration-200 ${
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
          <div className="content-area bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Students Section */}
            {mode === "students" && (
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Student Attendance</h2>
                    <p className="text-sm sm:text-base text-gray-600">Select a class to view student attendance records</p>
                  </div>
                  <select
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[200px] text-sm sm:text-base"
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
                    <div className="text-center py-10 sm:py-12 px-4">
                      <div className="text-gray-400 text-5xl sm:text-6xl mb-4">📊</div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
                      <p className="text-sm sm:text-base text-gray-500">No attendance records found for the selected class.</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-10 sm:py-12 px-4">
                    <div className="text-gray-400 text-5xl sm:text-6xl mb-4">🏫</div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Select a Class</h3>
                    <p className="text-sm sm:text-base text-gray-500">Please select a class to view attendance records.</p>
                  </div>
                )}
              </div>
            )}

            {/* Teachers Section */}
            {mode === "teachers" && (
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Teacher Attendance</h2>
                  <p className="text-sm sm:text-base text-gray-600">Attendance records for teaching staff</p>
                </div>
                {teacherAttendance.length > 0 ? (
                  <AttendanceTable data={teacherAttendance} includeClass={false} />
                ) : (
                  <div className="text-center py-10 sm:py-12 px-4">
                    <div className="text-gray-400 text-5xl sm:text-6xl mb-4">👨‍🏫</div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Teacher Records</h3>
                    <p className="text-sm sm:text-base text-gray-500">No attendance records found for teachers.</p>
                  </div>
                )}
              </div>
            )}

            {/* Principal Section */}
            {mode === "principal" && (
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Principal Attendance</h2>
                  <p className="text-sm sm:text-base text-gray-600">Attendance records for principal</p>
                </div>
                {principalAttendance.length > 0 ? (
                  <AttendanceTable data={principalAttendance} includeClass={false} />
                ) : (
                  <div className="text-center py-10 sm:py-12 px-4">
                    <div className="text-gray-400 text-5xl sm:text-6xl mb-4">👨‍💼</div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Principal Records</h3>
                    <p className="text-sm sm:text-base text-gray-500">No attendance records found for principal.</p>
                  </div>
                )}
              </div>
            )}

            {/* Admin Section */}
            {mode === "admin" && (
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Admin Attendance</h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Your attendance records ({adminEmail || "Not logged in"})
                  </p>
                </div>
                {adminAttendance.length > 0 ? (
                  <AttendanceTable data={adminAttendance} includeClass={false} />
                ) : (
                  <div className="text-center py-10 sm:py-12 px-4">
                    <div className="text-gray-400 text-5xl sm:text-6xl mb-4">🛠️</div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Admin Records</h3>
                    <p className="text-sm sm:text-base text-gray-500">No attendance records found for admin account.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{`
        .admin-attendance-page .attendance-table table {
          width: 100%;
        }

        /* Content area card: responsive spacing & radius without affecting other cards */
        .admin-attendance-page .content-area {
          margin-top: 0.5rem;
        }
        @media (min-width: 768px) {
          .admin-attendance-page .content-area {
            margin-top: 1rem;
          }
        }
        @media (min-width: 1024px) {
          .admin-attendance-page .content-area {
            margin-top: 1.5rem;
            border-radius: 1rem;
          }
        }

        /* Slightly reduce top padding on medium / smaller desktops */
        @media (max-width: 1280px) {
          .admin-attendance-page {
            padding-top: 1.5rem;
          }
        }

        /* Mode cards grid: desktop / laptop / tablet / mobile */
        @media (min-width: 1280px) {
          .admin-attendance-page .mode-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) and (max-width: 1279px) {
          .admin-attendance-page .mode-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .admin-attendance-page .mode-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 639px) {
          .admin-attendance-page .mode-grid {
            grid-template-columns: 1fr;
          }
          .admin-attendance-page .mode-grid button {
            text-align: left;
          }
        }

        /* Small-screen typography and inputs */
        @media (max-width: 768px) {
          .admin-attendance-page h1 {
            font-size: 1.75rem;
          }
          .admin-attendance-page input[type='date'],
          .admin-attendance-page select {
            width: 100% !important;
          }
          .admin-attendance-page .attendance-table {
            overflow-x: auto;
          }
          .admin-attendance-page .attendance-table table {
            min-width: 720px;
          }
        }
        @media (max-width: 480px) {
          .admin-attendance-page h1 {
            font-size: 1.5rem;
          }
          .admin-attendance-page .mode-grid button {
            padding: 0.9rem;
          }
          .admin-attendance-page .attendance-table table {
            min-width: 640px;
          }
        }
      `}</style>
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
    <div className="attendance-table overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-xs sm:text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[0.65rem] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Photo
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[0.65rem] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[0.65rem] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email
            </th>
            {includeClass && (
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[0.65rem] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Class
              </th>
            )}
            {includeClass && (
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[0.65rem] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Section
              </th>
            )}
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[0.65rem] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[0.65rem] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Check In
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[0.65rem] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Check Out
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
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
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{item.user_name || item.fullname}</div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-600 max-w-[220px] sm:max-w-none break-words">
                {item.user_email || item.email}
              </td>
              {includeClass && (
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-600">
                  {item.class_name}
                </td>
              )}
              {includeClass && (
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-600">
                  {item.section}
                </td>
              )}
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                <span className={`font-medium ${item.check_in ? "text-green-600" : "text-gray-400"}`}>
                  {item.check_in || "Not checked in"}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
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
