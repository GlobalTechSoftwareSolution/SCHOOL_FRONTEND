"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AttendanceRecord = {
  id?: number;
  student?: string;
  student_email?: string;
  user_email?: string;
  status?: string;
  date?: string;
  check_in?: string;
  check_out?: string;
  subject?: number;
  period?: string;
};

type ClassInfoType = {
  id: number;
  class_name?: string;
  sec?: string;
};

type StudentInfo = {
  email?: string;
  fullname?: string;
  profile_picture?: string;
  class_id?: number;
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

const API = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export default function Attendance() {
  const [section, setSection] = useState<"teacher" | "student">("teacher");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [classesList, setClassesList] = useState<ClassInfoType[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfoType | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingAttendance, setPendingAttendance] = useState<Record<string, string>>({});
  const [submittedAttendance, setSubmittedAttendance] = useState<Record<string, string>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [classSubjectsMap, setClassSubjectsMap] = useState<Record<number, SubjectOption[]>>({});
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [teacherAttendanceMarked, setTeacherAttendanceMarked] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('10-11');
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, leave: 0 });

  let userEmail = null;

  if (typeof window !== "undefined") {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      userEmail = userData?.email || userInfo?.email || null;
    } catch { }
  }

  /* ============================ 1) Teacher Attendance ============================ */
  const loadTeacherAttendance = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axios.get<AttendanceRecord[]>(`${API}/attendance/?date=${selectedDate}`);

      const filtered = res.data.filter((a) => {
        const emailMatch = a.user_email === userEmail;
        const recordDate = String(a.date || "").split("T")[0];
        const dateMatch = recordDate === selectedDate;
        return emailMatch && dateMatch;
      });

      setAttendance(filtered);
    } catch (error) {
      console.error("❌ Error loading teacher attendance:", error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, userEmail]);

  /* ============================ 2) Classes ============================ */
  const loadTeacherClasses = useCallback(async () => {
    setLoading(true);

    try {
      const timeRes = await axios.get<TimetableEntry[]>(`${API}/timetable/`);

      const timetableEntries: TimetableEntry[] = timeRes.data || [];
      const teacherClasses = timetableEntries.filter(
        (t: TimetableEntry) => {
          const isMatch = t.teacher === userEmail;
          return isMatch;
        }
      );

      const uniqueClassIds = [
        ...new Set(teacherClasses.map((cls) => cls.class_id)),
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

      const classRes = await axios.get<ClassInfoType[]>(`${API}/classes/`);

      const classes = classRes.data.filter((cls) => {
        const isIncluded = uniqueClassIds.includes(cls.id);
        return isIncluded;
      });

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
      console.error("❌ Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  /* ============================ 3) Students ============================ */
  const loadStudents = useCallback(async () => {
    if (!selectedClass) {
      return;
    }

    setLoading(true);

    try {
      const classRes = await axios.get<ClassInfoType[]>(`${API}/classes/`);

      setClassInfo(
        classRes.data.find((c) => {
          const isMatch = c.id === selectedClass;
          return isMatch;
        }) || null
      );

      const stuRes = await axios.get<StudentInfo[]>(`${API}/students/`);

      const filteredStudents = stuRes.data.filter((s) => {
        const isMatch = s.class_id === selectedClass;
        return isMatch;
      });

      setStudents(filteredStudents);
    } catch (error) {
      console.error("❌ Error loading students:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  /* ============================ 4) Attendance ============================ */
  const loadStudentAttendance = useCallback(async () => {
    console.log('🔵 Loading student attendance for:', { selectedDate, selectedClass, selectedSubject });
    if (!selectedSubject || !selectedClass) {
      console.log('❌ Missing subject or class, returning empty attendance');
      setAttendance([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      console.log('📡 Fetching students for class:', selectedClass);
      // First, get all students in the class
      const studentsResponse = await axios.get<StudentInfo[]>(`${API}/students/`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      console.log('📋 Students response:', studentsResponse.data);
      const classStudents = studentsResponse.data.filter(s => s.class_id === selectedClass);
      console.log('👥 Filtered class students:', classStudents);

      // Format the selected date
      const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
      console.log('📅 Formatted date for API:', formattedDate);

      // Fetch attendance for this date, class, and subject
      console.log('📡 Fetching attendance from API:', `${API}/student_attendance/?date=${formattedDate}&class_id=${selectedClass}&subject=${selectedSubject}`);
      const response = await axios.get<AttendanceRecord[]>(
        `${API}/student_attendance/?date=${formattedDate}&class_id=${selectedClass}&subject=${selectedSubject}`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      console.log('📘 Attendance API response:', response.data);
      console.log('📥 Attendance records retrieved from API:', `${API}/student_attendance/`);
      console.log('📊 Number of records found:', response.data.length);

      // Create a map of student emails to their attendance status
      const attendanceMap = new Map<string, string>();

      // Process attendance records
      response.data.forEach(record => {
        const email = (record.student || record.student_email || record.user_email)?.toLowerCase();
        if (email && record.status) {
          attendanceMap.set(email, record.status);
        }
      });

      // For each student in the class, set their status and count statuses
      const studentAttendance: Record<string, string> = {};
      const stats = { present: 0, absent: 0, leave: 0 };

      // First, process existing attendance
      classStudents.forEach(student => {
        if (student.email) {
          const email = student.email.toLowerCase();
          const status = attendanceMap.get(email) || 'Not Marked';
          studentAttendance[email] = status;

          // Update counts
          if (status === 'Present') stats.present++;
          else if (status === 'Absent') stats.absent++;
          else if (status === 'Leave') stats.leave++;
        }
      });

      // Then, apply any pending attendance that hasn't been saved yet
      Object.entries(pendingAttendance).forEach(([email, status]) => {
        if (studentAttendance[email]) {
          // Update the status and adjust counts
          const oldStatus = studentAttendance[email];
          if (oldStatus === 'Present') stats.present--;
          else if (oldStatus === 'Absent') stats.absent--;
          else if (oldStatus === 'Leave') stats.leave--;

          studentAttendance[email] = status;

          if (status === 'Present') stats.present++;
          else if (status === 'Absent') stats.absent++;
          else if (status === 'Leave') stats.leave++;
        }
      });

      // Update state
      setSubmittedAttendance(studentAttendance);
      setAttendance(response.data);
      setAttendanceStats(stats);

    } catch (error) {
      console.error("❌ Error loading student attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedClass, selectedSubject, pendingAttendance]);

  /* ============================ 5) Mark Attendance LOCALLY ============================ */
  const markAttendance = (email: string | null | undefined, status: string) => {
    if (!email || !selectedSubject) {
      return;
    }

    const normalizedEmail = email.toLowerCase();

    // Update pending attendance
    setPendingAttendance(prev => {
      const updated = { ...prev, [normalizedEmail]: status };
      return updated;
    });

    // Update submitted attendance immediately for better UX
    setSubmittedAttendance(prev => {
      const updated = { ...prev, [normalizedEmail]: status };

      // Update attendance stats
      setAttendanceStats(prevStats => {
        const newStats = { ...prevStats };

        // Decrement the old status count if it exists in submittedAttendance
        const oldStatus = prev[normalizedEmail];
        if (oldStatus === 'Present') newStats.present--;
        else if (oldStatus === 'Absent') newStats.absent--;
        else if (oldStatus === 'Leave') newStats.leave--;

        // Increment the new status count
        if (status === 'Present') newStats.present++;
        else if (status === 'Absent') newStats.absent++;
        else if (status === 'Leave') newStats.leave++;

        return newStats;
      });

      return updated;
    });
  };

  /* ============================ Mark Teacher Attendance ============================ */
  const markTeacherAttendance = async () => {
    try {
      if (!userEmail) {
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const existingRecord = attendance.find(a =>
        a.user_email === userEmail &&
        String(a.date || "").split("T")[0] === today
      );

      if (existingRecord) {
        setTeacherAttendanceMarked(true);
        return;
      }

      const payload = {
        user_email: userEmail,
        date: today,
        status: "Present",
        check_in: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      await axios.post(`${API}/attendance/`, payload);

      setTeacherAttendanceMarked(true);
      await loadTeacherAttendance();

    } catch (error) {
      console.error("❌ Error marking teacher attendance:", error);
      alert("Failed to mark attendance. Please try again.");
    }
  };

  /* ============================ 6) Submit Attendance to API ============================ */
  const submitAttendance = async () => {

    const emails = Object.keys(pendingAttendance);

    if (emails.length === 0) {
      return;
    }

    try {
      setLoading(true);

      if (!userEmail || !selectedClass || !selectedSubject) {
        console.log('❌ Missing required data for submission');
        return;
      }

      const classSubjects = classSubjectsMap[selectedClass] || [];
      const subjectMeta = classSubjects.find((s) => s.id === selectedSubject);

      // Prepare the payload as a bare array (not wrapped in an object)
      const payload = emails.map((email) => ({
        student: email,
        teacher: userEmail,
        class_id: selectedClass,
        date: selectedDate,
        status: pendingAttendance[email] || 'Present', // Ensure status is valid
        subject: selectedSubject,
        period: selectedPeriod,
        student_name: students.find((stu) => stu.email?.toLowerCase() === email)?.fullname || '',
        class_name: classInfo?.class_name || '',
        section: classInfo?.sec || '',
        subject_name: subjectMeta?.name || ''
      }));



      try {
        const response = await axios.post(
          `${API}/student_attendance/bulk_create/`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );



        if (response.data.success || response.status === 207 || response.status === 201) {
          // Handle partial success (207) or full success (201/200)
          const errorCount = response.data.errors?.length || 0;

          if (errorCount > 0) {
            console.warn(`⚠️ ${errorCount} records had issues:`, response.data.errors);
            // Still show success but log the errors
            response.data.errors.forEach((error: { data?: { student?: string }; errors?: unknown }) => {
              console.error(`❌ Error for ${error.data?.student}:`, error.errors);
            });
          }

          // Clear pending attendance
          setPendingAttendance({});

          // Update UI to reflect submitted status
          setSubmittedAttendance(prev => ({
            ...prev,
            ...Object.fromEntries(emails.map(email => [email, pendingAttendance[email]]))
          }));

          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 5000);

          // Refresh the attendance data
          await loadStudentAttendance();
        } else {
          throw new Error(response.data.message || 'Failed to save attendance');
        }
      } catch (error: unknown) {
        console.error("❌ Error in API call:", error);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { errors?: unknown } } };
          if (axiosError.response?.data?.errors) {
            console.error("Detailed errors:", axiosError.response.data.errors);
          }
        }
        throw error; // Re-throw to be caught by the outer catch
      }
    } catch (error: unknown) {
      console.error("❌ Error submitting attendance:", error);

      let errorMessage = 'Failed to save attendance. Please try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; detail?: string } } };
        errorMessage = axiosError.response?.data?.message ||
          axiosError.response?.data?.detail ||
          errorMessage;
      }

      setErrorMessage(errorMessage);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 5000);
    }
  };

  /* ============================ CALENDAR HELPERS ============================ */
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const startDay = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isSameDay = (date1: Date | null, date2: string | null) => {
    if (!date1 || !date2) return false;
    return formatDate(date1) === date2;
  };

  const handleDateSelect = (date: Date | null) => {
    if (date) {
      // Format the date as YYYY-MM-DD before setting it
      const formattedDate = date.toISOString().split('T')[0];
      setSelectedDate(formattedDate);
      setShowCalendar(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  /* ============================ 7) Helpers ============================ */
  const getStudentStatus = (email: string | null | undefined) => {
    if (!email) return null;
    const normalizedEmail = email.toLowerCase();

    if (pendingAttendance[normalizedEmail]) {
      return pendingAttendance[normalizedEmail];
    }

    if (submittedAttendance[normalizedEmail]) {
      return submittedAttendance[normalizedEmail];
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
        return "bg-green-100 text-green-700 border-2 border-green-500";
      case "Absent":
        return "bg-red-100 text-red-700 border-2 border-red-500";
      case "Leave":
        return "bg-yellow-100 text-yellow-700 border-2 border-yellow-500";
      default:
        return "bg-gray-100 text-gray-600 border-2 border-gray-300";
    }
  };

  const getStatusButtonStyles = (email: string | null | undefined, targetStatus: string) => {
    if (!email) return '';
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm";
    const currentStatus = submittedAttendance[email.toLowerCase()] || pendingAttendance[email.toLowerCase()];

    if (currentStatus === targetStatus) {
      return targetStatus === "Present"
        ? `${baseClasses} bg-green-500 text-white shadow-md hover:bg-green-600`
        : targetStatus === "Absent"
          ? `${baseClasses} bg-red-500 text-white shadow-md hover:bg-red-600`
          : `${baseClasses} bg-yellow-500 text-white shadow-md hover:bg-yellow-600`;
    }

    return targetStatus === "Present"
      ? `${baseClasses} bg-white text-green-600 hover:bg-green-50 border border-green-300`
      : targetStatus === "Absent"
        ? `${baseClasses} bg-white text-red-600 hover:bg-red-50 border border-red-300`
        : `${baseClasses} bg-white text-yellow-600 hover:bg-yellow-50 border border-yellow-300`;
  };

  const subjectOptions = selectedClass ? classSubjectsMap[selectedClass] || [] : [];
  const currentSubjectName =
    subjectOptions.find((s) => s.id === selectedSubject)?.name || null;

  /* ============================ useEffect calls ============================ */
  useEffect(() => {
    const run = async () => {
      await loadTeacherClasses();
    };
    run();
  }, [loadTeacherClasses]);

  useEffect(() => {
    setTeacherAttendanceMarked(false);
  }, [selectedDate]);

  useEffect(() => {
    if (section === "student") {
      const run = async () => {
        await loadStudents();
      };
      run();
    }
  }, [section, selectedClass, loadStudents]);

  useEffect(() => {
    if (section === "student" && selectedClass && selectedSubject) {
      const run = async () => {
        await loadStudentAttendance();
      };
      run();
    }
  }, [students, selectedDate, selectedClass, selectedSubject, selectedPeriod, section, loadStudentAttendance]);

  useEffect(() => {
    setPendingAttendance({});
    setSubmittedAttendance({});
  }, [selectedDate, selectedClass, section, selectedSubject, selectedPeriod]);

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
  }, [section, selectedDate, userEmail, loadTeacherAttendance]);

  /* ============================ ENHANCED UI ============================ */
  return (
    <DashboardLayout role="teachers">
      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 3s ease-in-out forwards;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex justify-start mb-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Attendance Management</h1>
              <p className="text-gray-600 mt-1">Track and manage attendance records efficiently</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
              <p className="text-sm font-medium text-gray-700">
                Today: {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 md:p-6 mb-6">
          {/* Section Toggle */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-full md:w-auto">
              <button
                onClick={() => setSection("teacher")}
                className={`flex-1 md:flex-none px-5 py-3 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${section === "teacher"
                  ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                👨‍🏫 Teacher Attendance
              </button>
              <button
                onClick={() => setSection("student")}
                className={`flex-1 md:flex-none px-5 py-3 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${section === "student"
                  ? "bg-white text-green-600 shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                👥 Student Attendance
              </button>
            </div>

            {/* Date Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2.5">
                  <span className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    className="outline-none bg-transparent w-full text-base"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>

                {/* Calendar Popup */}
                {showCalendar && (
                  <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-full max-w-xs">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={goToPreviousMonth}
                        className="p-1 rounded-lg hover:bg-gray-100"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-semibold text-gray-800">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        onClick={goToNextMonth}
                        className="p-1 rounded-lg hover:bg-gray-100"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(currentMonth).map((date, index) => {
                        if (!date) {
                          return <div key={`empty-${index}`} className="h-8" />;
                        }

                        const isToday = isSameDay(date, new Date().toISOString().split('T')[0]);
                        const isSelected = isSameDay(date, selectedDate);

                        return (
                          <button
                            key={index}
                            onClick={() => handleDateSelect(date)}
                            className={`h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors ${isSelected
                              ? 'bg-blue-500 text-white'
                              : isToday
                                ? 'bg-blue-100 text-blue-600 font-bold'
                                : 'hover:bg-gray-100'
                              }`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setSelectedDate(today);
                }}
                className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium text-sm"
              >
                Today
              </button>
              {section === "teacher" && (
                <button
                  onClick={markTeacherAttendance}
                  disabled={teacherAttendanceMarked}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm ${teacherAttendanceMarked
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                    }`}
                >
                  {teacherAttendanceMarked ? "Attendance Marked" : "Mark Attendance"}
                </button>
              )}
            </div>
          </div>

          {/* Class Selector for Student Section */}
          {section === "student" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2">Select Class</label>
                <select
                  value={selectedClass ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedClass(value ? parseInt(value, 10) : null);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a class</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.class_name} - Section {c.sec}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2">Select Subject</label>
                <select
                  value={selectedSubject ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedSubject(value ? parseInt(value, 10) : null);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selectedClass || !(classSubjectsMap[selectedClass]?.length)}
                >
                  <option value="">Choose a subject</option>
                  {(classSubjectsMap[selectedClass || -1] || []).map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2">Select Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="10-11">Select Period</option>
                  <option value="09:00-10:00">09:00 AM - 10:00 AM</option>
                  <option value="10:00-11:00">10:00 AM - 11:00 AM</option>
                  <option value="11:00-11:30">11:00 AM - 11:30 AM Short Break</option>
                  <option value="11:30-12:30">11:30 AM - 12:30 PM</option>
                  <option value="12:30-13:30">12:30 PM - 01:30 PM Lunch Break</option>
                  <option value="13:30-14:30">01:30 PM - 02:30 PM</option>
                  <option value="14:30-15:30">02:30 PM - 03:30 PM</option>
                  <option value="15:30-16:30">03:30 PM - 04:30 PM</option>
                  <option value="16:30-17:30">04:30 PM - 05:30 PM</option>
                </select>
              </div>
              {selectedClass && subjectOptions.length === 0 && (
                <div className="md:col-span-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  No subjects are assigned to you for this class. Please contact admin team.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* ============================ TEACHER ATTENDANCE ============================ */}
        {section === "teacher" && !loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Your Attendance Records
              </h2>
            </div>

            {attendance.length > 0 ? (
              <div className="p-5 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {attendance.map((a) => (
                    <div
                      key={a.id}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-lg">Attendance Record</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${a.status === 'Present'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : a.status === 'Absent'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                          {a.status}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</p>
                          <p className="text-base font-semibold text-gray-900">{a.date}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${a.check_in ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                              }`}>
                              {a.check_in ?? "Not Recorded"}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${a.check_out ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
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
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No attendance records found</h3>
                <p className="text-gray-500">There are no attendance records for the selected date.</p>
                {selectedDate === new Date().toISOString().split("T")[0] && (
                  <div className="mt-6">
                    <button
                      onClick={markTeacherAttendance}
                      disabled={teacherAttendanceMarked}
                      className={`px-6 py-3 rounded-lg font-medium ${teacherAttendanceMarked
                        ? "bg-green-500 text-white"
                        : "bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                        }`}
                    >
                      {teacherAttendanceMarked ? "Today's Attendance Marked" : "Mark Today's Attendance"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================ STUDENT ATTENDANCE ============================ */}
        {section === "student" && !loading && (
          <div className="space-y-6">
            {/* Class Info Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                    Students of {classInfo?.class_name} - Section {classInfo?.sec}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {currentSubjectName
                      ? `Managing attendance for ${currentSubjectName} on ${new Date(selectedDate).toLocaleDateString()} (${selectedPeriod})`
                      : "Select a subject assigned to you before marking attendance"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-blue-50 rounded-lg px-4 py-2 text-center min-w-[100px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                    <p className="text-xl font-bold text-blue-600">{students.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg px-4 py-2 text-center min-w-[100px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Present</p>
                    <p className="text-xl font-bold text-green-600">{attendanceStats.present}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg px-4 py-2 text-center min-w-[100px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Absent</p>
                    <p className="text-xl font-bold text-red-600">{attendanceStats.absent}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg px-4 py-2 text-center min-w-[100px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Leave</p>
                    <p className="text-xl font-bold text-yellow-600">{attendanceStats.leave}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={submitAttendance}
                      disabled={Object.keys(pendingAttendance).length === 0}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-colors text-sm ${Object.keys(pendingAttendance).length > 0
                        ? "bg-green-500 text-white hover:bg-green-600 shadow-md"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      Submit Attendance
                    </button>
                    {showSuccessMessage && (
                      <div className="absolute top-full mt-2 left-0 right-0 bg-green-500 text-white text-sm py-2 px-4 rounded-lg shadow-lg animate-fadeInOut">
                        Attendance submitted successfully!
                      </div>
                    )}
                    {showErrorMessage && (
                      <div className="absolute top-full mt-2 left-0 right-0 bg-red-500 text-white text-sm py-2 px-4 rounded-lg shadow-lg animate-fadeInOut">
                        {errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Students Cards Grid */}
            {students.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {students.map((stu, index) => {
                  const status = getStudentStatus(stu.email);
                  const rowKey = stu.email || `${stu.fullname || "student"}-${index}`;

                  return (
                    <div
                      key={rowKey}
                      className={`${submittedAttendance[stu.email?.toLowerCase() || ''] ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} rounded-2xl p-5 hover:shadow-md transition-all duration-200 border`}
                    >
                      {/* Student Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">

                          {/* Profile Image or Initial */}
                          {stu.profile_picture ? (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border">
                              <Image
                                src={stu.profile_picture}
                                alt={stu.fullname || "Student"}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {stu.fullname?.charAt(0) || "S"}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-base truncate">
                              {stu.fullname || "Unnamed Student"}
                            </h3>
                            <p className="text-gray-600 text-sm truncate">{stu.email}</p>
                          </div>
                        </div>
                      </div>


                      <span className={`inline-flex items-center mb-5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
                        {status || "Not Marked"}
                        {submittedAttendance[stu.email?.toLowerCase() || ''] && (
                          <span className="ml-1 text-green-500">✓ Submitted</span>
                        )}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => markAttendance(stu.email, "Present")}
                          className={getStatusButtonStyles(stu.email, "Present")}
                        >
                          ✓ Present
                        </button>
                        <button
                          onClick={() => markAttendance(stu.email, "Absent")}
                          className={getStatusButtonStyles(stu.email, "Absent")}
                        >
                          ✗ Absent
                        </button>
                        <button
                          onClick={() => markAttendance(stu.email, "Leave")}
                          className={getStatusButtonStyles(stu.email, "Leave")}
                        >
                          ⟳ Leave
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No students found</h3>
                <p className="text-gray-500">There are no students enrolled in this class.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
