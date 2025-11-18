"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

type AttendanceRecord = {
  id?: number;
  student?: string;
  student_email?: string;
  user_email?: string;
  status?: string;
  date?: string;
  check_in?: string;
  check_out?: string;
};

type ClassInfoType = {
  id: number;
  class_name?: string;
  sec?: string;
};

type StudentInfo = {
  email?: string;
  fullname?: string;
};

type SubjectOption = {
  id: number;
  name: string;
};

type TimetableEntry = {
  class_id: number;
  subject: number;
  subject_name?: string;
  teacher?: string;
};

const API = "https://globaltechsoftwaresolutions.cloud/school-api/api";

export default function Attendance() {
  const [section, setSection] = useState<"teacher" | "student">("teacher");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [classesList, setClassesList] = useState<ClassInfoType[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfoType | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingAttendance, setPendingAttendance] = useState<Record<string, string>>({});
  const [classSubjectsMap, setClassSubjectsMap] = useState<Record<number, SubjectOption[]>>({});
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  let userEmail = null;

  if (typeof window !== "undefined") {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      userEmail = userData?.email || userInfo?.email || null;
    } catch {}
  }

  /* ============================ 1) Teacher Attendance ============================ */
  const loadTeacherAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/attendance/`);
      const filtered = res.data.filter((a: any) => {
        const emailMatch = a.user_email === userEmail;
        const dateStr = String(a.date || "").split("T")[0];
        const dateMatch = dateStr === selectedDate;
        return emailMatch && dateMatch;
      });
      setAttendance(filtered);
    } catch (error) {
      console.error("Error loading teacher attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ============================ 2) Classes ============================ */
  const loadTeacherClasses = async () => {
    setLoading(true);
    try {
      const timeRes = await axios.get(`${API}/timetable/`);
      const timetableEntries: TimetableEntry[] = timeRes.data || [];
      const teacherClasses = timetableEntries.filter(
        (t: TimetableEntry) => t.teacher === userEmail
      );

      const uniqueClassIds = [
        ...new Set(teacherClasses.map((cls: any) => cls.class_id)),
      ];

      const subjectsByClass = teacherClasses.reduce(
        (acc: Record<number, SubjectOption[]>, entry: TimetableEntry) => {
          const subject: SubjectOption = {
            id: entry.subject,
            name: entry.subject_name || `Subject ${entry.subject}`,
          };

          if (!acc[entry.class_id]) {
            acc[entry.class_id] = [subject];
          } else if (!acc[entry.class_id].some((s: SubjectOption) => s.id === subject.id)) {
            acc[entry.class_id].push(subject);
          }

          return acc;
        },
        {} as Record<number, SubjectOption[]>
      );

      const classRes = await axios.get(`${API}/classes/`);
      const classes = classRes.data.filter((cls: any) =>
        uniqueClassIds.includes(cls.id)
      );

      setClassesList(classes);
      setClassSubjectsMap(subjectsByClass);

      if (classes.length > 0) {
        const defaultClassId = classes[0].id;
        setSelectedClass(defaultClassId);
        const defaultSubjects = subjectsByClass[defaultClassId];
        if (defaultSubjects?.length) {
          setSelectedSubject(defaultSubjects[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ============================ 3) Students ============================ */
  const loadStudents = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const classRes = await axios.get(`${API}/classes/`);
      setClassInfo(
        classRes.data.find((c: any) => c.id === selectedClass) || null
      );

      const stuRes = await axios.get(`${API}/students/`);
      setStudents(stuRes.data.filter((s: any) => s.class_id === selectedClass));
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ============================ 4) Attendance ============================ */
  const loadStudentAttendance = async () => {
    if (!selectedSubject) {
      setAttendance([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Use student_attendance for student records
      const res = await axios.get(`${API}/student_attendance/`);
      const filtered = res.data.filter((a: any) => {
        if (a.date !== selectedDate) return false;
        if (selectedSubject && a.subject !== selectedSubject) return false;

        // Match by student email field from API
        const recordEmail = (a.student || a.student_email || a.user_email)?.toLowerCase();
        if (!recordEmail) return false;

        return students.some((stu: StudentInfo) => stu.email?.toLowerCase() === recordEmail);
      });

      setAttendance(filtered);
    } catch (error) {
      console.error("Error loading student attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ============================ 5) Mark Attendance LOCALLY ============================ */
  const markAttendance = (email: string | null | undefined, status: string) => {
    if (!email || !selectedSubject) {
      console.warn("Cannot mark attendance without both email and selected subject");
      return;
    }
    const normalizedEmail = email.toLowerCase();
    setPendingAttendance((prev) => ({ ...prev, [normalizedEmail]: status }));
  };

  /* ============================ 6) Submit Attendance to API ============================ */
  const submitAttendance = async () => {
    try {
      if (!userEmail) {
        console.warn("No teacher email found in localStorage; cannot submit attendance");
        return;
      }
      if (!selectedClass) {
        console.warn("No class selected; cannot submit attendance");
        return;
      }
      if (!selectedSubject) {
        console.warn("No subject selected; cannot submit attendance");
        return;
      }

      const emails = Object.keys(pendingAttendance);
      if (emails.length === 0) {
        return;
      }

      const classSubjects = classSubjectsMap[selectedClass] || [];
      const subjectMeta = classSubjects.find((s) => s.id === selectedSubject);

      const payload = emails.map((email) => ({
        student: email,
        // Teacher email comes from localStorage (userEmail)
        teacher: userEmail,
        class_id: selectedClass,
        date: selectedDate,
        status: pendingAttendance[email],
        subject: selectedSubject,
        subject_name: subjectMeta?.name,
        class_name: classInfo?.class_name,
        section: classInfo?.sec,
        student_name: students.find((stu) => stu.email?.toLowerCase() === email)?.fullname,
      }));

      const resp = await axios.post(`${API}/student_attendance/bulk_create/`, payload);

      // Extra logging if backend returns partial-success structure
      if (resp.data && typeof resp.data === "object") {
        if (Array.isArray(resp.data.errors) && resp.data.errors.length > 0) {
          console.warn("⚠️ Validation errors from bulk_create:", resp.data.errors);
        }
      }

      setPendingAttendance({});
      await loadStudentAttendance();
    } catch (err: any) {
      console.error("❌ Error submitting attendance:", err);
      if (err.response) {
        console.error("❌ Backend error status:", err.response.status);
        console.error("❌ Backend error data:", err.response.data);
      }
    }
  };

  /* ============================ 7) Helpers ============================ */
  const getStudentStatus = (email: string | null | undefined) => {
    if (!email) return null;
    const normalizedEmail = email.toLowerCase();

    if (pendingAttendance[normalizedEmail]) {
      return pendingAttendance[normalizedEmail];
    }

    const record = attendance.find((a) => {
      const recordEmail = (a.student || a.student_email || a.user_email)?.toLowerCase();
      return recordEmail === normalizedEmail;
    });

    return record?.status || null;
  };

  const getStatusStyles = (status: string | null) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700";
      case "Absent":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const subjectOptions = selectedClass ? classSubjectsMap[selectedClass] || [] : [];
  const currentSubjectName =
    subjectOptions.find((s) => s.id === selectedSubject)?.name || null;

  /* ============================ FIXED useEffect calls ============================ */
  useEffect(() => {
    const run = async () => {
      await loadTeacherClasses();
    };
    run();
  }, []);

  useEffect(() => {
    if (section === "student") {
      const run = async () => {
        await loadStudents();
      };
      run();
    }
  }, [section, selectedClass]);

  useEffect(() => {
    if (section === "student") {
      const run = async () => {
        await loadStudentAttendance();
      };
      run();
    }
  }, [students, selectedDate, selectedSubject]);

  useEffect(() => {
    // Clear any local selections when date/class/section changes
    setPendingAttendance({});
  }, [selectedDate, selectedClass, section, selectedSubject]);
  useEffect(() => {
    if (!selectedClass) {
      setSelectedSubject(null);
      return;
    }

    const subjects = classSubjectsMap[selectedClass];
    if (subjects?.length) {
      setSelectedSubject((prev) => {
        if (prev && subjects.some((s) => s.id === prev)) {
          return prev;
        }
        return subjects[0].id;
      });
    } else {
      setSelectedSubject(null);
    }
  }, [selectedClass, classSubjectsMap]);


  useEffect(() => {
    if (section === "teacher") {
      const run = async () => {
        await loadTeacherAttendance();
      };
      run();
    }
  }, [section, selectedDate]);

  /* ============================ ENHANCED UI ============================ */
  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Attendance Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Track and manage attendance records</p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Section Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex gap-1 sm:gap-2 bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
              <button
                onClick={() => setSection("teacher")}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                  section === "teacher" 
                    ? "bg-white text-blue-600 shadow-sm border border-gray-200" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                👨‍🏫 Teacher
              </button>
              <button
                onClick={() => setSection("student")}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                  section === "student" 
                    ? "bg-white text-green-600 shadow-sm border border-gray-200" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                👥 Student
              </button>
            </div>

            {/* Date Controls */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 flex-1">
                <span className="text-gray-500 text-sm">📅</span>
                <input
                  type="date"
                  className="outline-none bg-transparent w-full text-sm sm:text-base"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium text-xs sm:text-sm"
              >
                Today
              </button>
            </div>
          </div>

          {/* Class Selector for Student Section */}
          {section === "student" && (
            <div className="flex flex-col gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="font-semibold text-gray-700 min-w-fit text-sm">Select Class:</label>
                <select
                  value={selectedClass ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedClass(value ? parseInt(value, 10) : null);
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.class_name} {c.sec}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="font-semibold text-gray-700 min-w-fit text-sm">Select Subject:</label>
                <select
                  value={selectedSubject ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedSubject(value ? parseInt(value, 10) : null);
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={!selectedClass || !(classSubjectsMap[selectedClass]?.length)}
                >
                  {(classSubjectsMap[selectedClass || -1] || []).map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedClass && subjectOptions.length === 0 && (
                <div className="text-xs sm:text-sm text-red-600">
                  No subjects are assigned to you for this class. Please contact the admin team.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* ============================ TEACHER ATTENDANCE ============================ */}
        {section === "teacher" && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                📊 Your Attendance Records
              </h2>
            </div>
            
            {attendance.length > 0 ? (
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {attendance.map((a) => (
                    <div
                      key={a.id}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg">Attendance Record</h3>
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          a.status === 'Present' 
                            ? 'bg-green-100 text-green-800' 
                            : a.status === 'Absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Date</p>
                          <p className="text-sm font-semibold text-gray-900">{a.date}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500">Check In</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              a.check_in ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {a.check_in ?? "Not Recorded"}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Check Out</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              a.check_out ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {a.check_out ?? "Not Recorded"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
                <p className="text-base sm:text-lg">No attendance records found</p>
              </div>
            )}
          </div>
        )}

        {/* ============================ STUDENT ATTENDANCE ============================ */}
        {section === "student" && !loading && (
          <div className="space-y-4 sm:space-y-6">
            {/* Class Info Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                    Students of {classInfo?.class_name} {classInfo?.sec}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {currentSubjectName
                      ? `Manage attendance for ${currentSubjectName} on ${selectedDate}`
                      : "Select a subject assigned to you before marking attendance"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="text-center sm:text-right">
                    <div className="text-xs sm:text-sm text-gray-500">Total Students</div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{students.length}</div>
                  </div>
                  <button
                    onClick={submitAttendance}
                    className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
                  >
                    Submit Attendance
                  </button>
                </div>
              </div>
            </div>

            {/* Students Cards Grid */}
            {students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {students.map((stu, index) => {
                  const status = getStudentStatus(stu.email);
                  const isPresent = status === "Present";
                  const isAbsent = status === "Absent";
                  const rowKey = stu.email || `${stu.fullname || "student"}-${index}`;

                  return (
                    <div
                      key={rowKey}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all duration-200 group"
                    >
                      {/* Student Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                            {stu.fullname?.charAt(0) || 'S'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                              {stu.fullname}
                            </h3>
                            <p className="text-gray-600 text-xs sm:text-sm truncate">
                              {stu.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Current Status */}
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(status)}`}>
                          {status || "Not Marked"}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => markAttendance(stu.email, "Present")}
                          className={`w-full px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                            isPresent
                              ? "bg-green-500 text-white shadow-sm"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          ✓ Present
                        </button>
                        <button
                          onClick={() => markAttendance(stu.email, "Absent")}
                          className={`w-full px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                            isAbsent
                              ? "bg-red-500 text-white shadow-sm"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          ✗ Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">👥</div>
                <p className="text-base sm:text-lg text-gray-500">No students found for this class</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}