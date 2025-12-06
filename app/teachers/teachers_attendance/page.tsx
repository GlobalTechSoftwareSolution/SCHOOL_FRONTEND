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
  subject?: number;
  period?: string; // Add period field
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
  const [selectedPeriod, setSelectedPeriod] = useState<string>('10-11'); // Add period state

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
    console.log("🔍 Loading teacher attendance for date:", selectedDate);
    setLoading(true);
    
    try {
      // Fetch attendance records for the selected date
      const res = await axios.get(`${API}/attendance/?date=${selectedDate}`);
      console.log("📥 Teacher attendance response:", res.data);
      
      // Filter by user email
      const filtered = res.data.filter((a: any) => {
        const emailMatch = a.user_email === userEmail;
        console.log(`🔍 Filtering record - Email match: ${emailMatch}`);
        return emailMatch;
      });
      
      console.log("✅ Filtered teacher attendance records:", filtered.length);
      setAttendance(filtered);
    } catch (error) {
      console.error("❌ Error loading teacher attendance:", error);
      setAttendance([]);
    } finally {
      setLoading(false);
      console.log("🏁 Teacher attendance loading completed");
    }
  };

  /* ============================ 2) Classes ============================ */
  const loadTeacherClasses = async () => {
    console.log("🔍 Loading teacher classes...");
    setLoading(true);
    
    try {
      const timeRes = await axios.get(`${API}/timetable/`);
      console.log("📥 Timetable response:", timeRes.data);
      
      const timetableEntries: TimetableEntry[] = timeRes.data || [];
      const teacherClasses = timetableEntries.filter(
        (t: TimetableEntry) => {
          const isMatch = t.teacher === userEmail;
          console.log(`🔍 Timetable entry - Teacher: ${t.teacher}, Match: ${isMatch}`);
          return isMatch;
        }
      );

      const uniqueClassIds = [
        ...new Set(teacherClasses.map((cls: any) => cls.class_id)),
      ];
      console.log("📋 Unique class IDs:", uniqueClassIds);

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
      console.log("📚 Subjects by class:", subjectsByClass);

      const classRes = await axios.get(`${API}/classes/`);
      console.log("📥 Classes response:", classRes.data);
      
      const classes = classRes.data.filter((cls: any) => {
        const isIncluded = uniqueClassIds.includes(cls.id);
        console.log(`🔍 Class ${cls.id} - Included: ${isIncluded}`);
        return isIncluded;
      });

      setClassesList(classes);
      setClassSubjectsMap(subjectsByClass);

      if (classes.length > 0) {
        const defaultClassId = classes[0].id;
        console.log("🎯 Setting default class:", defaultClassId);
        setSelectedClass(defaultClassId);
        const defaultSubjects = subjectsByClass[defaultClassId];
        if (defaultSubjects?.length) {
          console.log("🎯 Setting default subject:", defaultSubjects[0].id);
          setSelectedSubject(defaultSubjects[0].id);
        }
      }
      
      console.log("✅ Teacher classes loaded:", classes.length);
    } catch (error) {
      console.error("❌ Error loading classes:", error);
    } finally {
      setLoading(false);
      console.log("🏁 Teacher classes loading completed");
    }
  };

  /* ============================ 3) Students ============================ */
  const loadStudents = async () => {
    if (!selectedClass) {
      console.warn("⚠️ No class selected, skipping student load");
      return;
    }
    
    console.log(`🔍 Loading students for class: ${selectedClass}`);
    setLoading(true);
    
    try {
      const classRes = await axios.get(`${API}/classes/`);
      console.log("📥 Class details response:", classRes.data);
      
      setClassInfo(
        classRes.data.find((c: any) => {
          const isMatch = c.id === selectedClass;
          console.log(`🔍 Checking class ${c.id} === ${selectedClass}, Match: ${isMatch}`);
          return isMatch;
        }) || null
      );

      const stuRes = await axios.get(`${API}/students/`);
      console.log("📥 Students response:", stuRes.data);
      
      const filteredStudents = stuRes.data.filter((s: any) => {
        const isMatch = s.class_id === selectedClass;
        console.log(`🔍 Student ${s.id} class ${s.class_id} === ${selectedClass}, Match: ${isMatch}`);
        return isMatch;
      });
      
      console.log("✅ Filtered students:", filteredStudents.length);
      setStudents(filteredStudents);
    } catch (error) {
      console.error("❌ Error loading students:", error);
    } finally {
      setLoading(false);
      console.log("🏁 Students loading completed");
    }
  };

  /* ============================ 4) Attendance ============================ */
  const loadStudentAttendance = async () => {
    if (!selectedSubject) {
      console.warn("⚠️ No subject selected, clearing attendance");
      setAttendance([]);
      setLoading(false);
      return;
    }

    console.log(`🔍 Loading student attendance for subject: ${selectedSubject}`);
    setLoading(true);
    
    try {
      // Use student_attendance for student records
      const res = await axios.get(`${API}/student_attendance/`);
      console.log("📥 Student attendance response:", res.data);
      
      const filtered = res.data.filter((a: any) => {
        if (a.date !== selectedDate) {
          console.log(`⏭️ Skipping record with date ${a.date} !== ${selectedDate}`);
          return false;
        }
        if (selectedSubject && a.subject !== selectedSubject) {
          console.log(`⏭️ Skipping record with subject ${a.subject} !== ${selectedSubject}`);
          return false;
        }
        // Filter by selected period if it exists in the record
        if (a.period && a.period !== selectedPeriod) {
          console.log(`⏭️ Skipping record with period ${a.period} !== ${selectedPeriod}`);
          return false;
        }

        // Match by student email field from API
        const recordEmail = (a.student || a.student_email || a.user_email)?.toLowerCase();
        if (!recordEmail) {
          console.log("⏭️ Skipping record with no email");
          return false;
        }

        const isStudentMatch = students.some((stu: StudentInfo) => {
          const stuEmail = stu.email?.toLowerCase();
          const isMatch = stuEmail === recordEmail;
          console.log(`🔍 Student email ${stuEmail} === ${recordEmail}, Match: ${isMatch}`);
          return isMatch;
        });
        
        console.log(`✅ Record filtered - Date: ${a.date}, Subject: ${a.subject}, Period: ${a.period}, Student match: ${isStudentMatch}`);
        return isStudentMatch;
      });

      console.log("✅ Filtered student attendance records:", filtered.length);
      setAttendance(filtered);
    } catch (error) {
      console.error("❌ Error loading student attendance:", error);
    } finally {
      setLoading(false);
      console.log("🏁 Student attendance loading completed");
    }
  };

  /* ============================ 5) Mark Attendance LOCALLY ============================ */
  const markAttendance = (email: string | null | undefined, status: string) => {
    console.log(`📝 Marking attendance locally - Email: ${email}, Status: ${status}`);
    
    if (!email || !selectedSubject) {
      console.warn("⚠️ Cannot mark attendance without both email and selected subject");
      return;
    }
    
    const normalizedEmail = email.toLowerCase();
    setPendingAttendance((prev) => {
      const updated = { ...prev, [normalizedEmail]: status };
      console.log("✅ Pending attendance updated:", updated);
      return updated;
    });
    
    // Remove from submitted if it was there
    if (submittedAttendance[normalizedEmail]) {
      const newSubmitted = { ...submittedAttendance };
      delete newSubmitted[normalizedEmail];
      setSubmittedAttendance(newSubmitted);
    }
  };

  /* ============================ Mark Teacher Attendance ============================ */
  const markTeacherAttendance = async () => {
    console.log("📝 Marking teacher attendance...");
    
    try {
      if (!userEmail) {
        console.warn("⚠️ No teacher email found in localStorage");
        return;
      }
      
      // Check if attendance already exists for today
      const today = new Date().toISOString().split("T")[0];
      const existingRecord = attendance.find(a => 
        a.user_email === userEmail && 
        String(a.date || "").split("T")[0] === today
      );
      
      if (existingRecord) {
        console.log("✅ Teacher attendance already marked for today");
        setTeacherAttendanceMarked(true);
        return;
      }
      
      // Create new attendance record
      const payload = {
        user_email: userEmail,
        date: today,
        status: "Present",
        check_in: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      console.log("📦 Teacher attendance payload:", payload);
      
      const res = await axios.post(`${API}/attendance/`, payload);
      console.log("📥 Teacher attendance response:", res.data);
      
      setTeacherAttendanceMarked(true);
      await loadTeacherAttendance();
      
      console.log("✅ Teacher attendance marked successfully");
    } catch (error) {
      console.error("❌ Error marking teacher attendance:", error);
      alert("Failed to mark attendance. Please try again.");
    }
  };

  /* ============================ 6) Submit Attendance to API ============================ */
  const submitAttendance = async () => {
    console.log("📤 Submitting attendance to API...");
    
    try {
      if (!userEmail) {
        console.warn("⚠️ No teacher email found in localStorage");
        return;
      }
      if (!selectedClass) {
        console.warn("⚠️ No class selected");
        return;
      }
      if (!selectedSubject) {
        console.warn("⚠️ No subject selected");
        return;
      }

      const emails = Object.keys(pendingAttendance);
      console.log("📧 Emails to submit:", emails);
      
      if (emails.length === 0) {
        console.warn("⚠️ No attendance records to submit");
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
        period: selectedPeriod, // Add period to payload
      }));
      
      console.log("📦 Attendance payload:", payload);

      // Use bulk create endpoint for better performance
      const resp = await axios.post(`${API}/student_attendance/bulk_create/`, payload);
      console.log("📥 Attendance submission response:", resp.data);
      
      setPendingAttendance({});
      setSubmittedAttendance(prev => ({ ...prev, ...payload.reduce((acc, curr) => ({ ...acc, [curr.student]: curr.status }), {}) }));
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      await loadStudentAttendance();
      console.log("✅ Attendance submitted successfully");
    } catch (err: any) {
      console.error("❌ Error submitting attendance:", err);
      if (err.response) {
        console.error("❌ Backend error status:", err.response.status);
        console.error("❌ Backend error data:", err.response.data);
        setErrorMessage(`Submission failed: ${err.response.data?.detail || err.response.statusText || 'Unknown error'}`);
      } else {
        setErrorMessage('Network error. Please check your connection and try again.');
      }
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 5000);
    }
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
        return "bg-green-100 text-green-700 border-green-200";
      case "Absent":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusButtonStyles = (status: string | null, targetStatus: string) => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm";
    if (status === targetStatus) {
      return targetStatus === "Present" 
        ? `${baseClasses} bg-green-500 text-white shadow-md`
        : `${baseClasses} bg-red-500 text-white shadow-md`;
    }
    return targetStatus === "Present"
      ? `${baseClasses} bg-green-100 text-green-700 hover:bg-green-200 border border-green-200`
      : `${baseClasses} bg-red-100 text-red-700 hover:bg-red-200 border border-red-200`;
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

  // Reset teacher attendance marked status when date changes
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
  }, [section, selectedClass]);

  useEffect(() => {
    if (section === "student") {
      const run = async () => {
        await loadStudentAttendance();
      };
      run();
    }
  }, [students, selectedDate, selectedSubject, selectedPeriod]);

  useEffect(() => {
    // Clear any local selections when date/class/section/period changes
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
  }, [section, selectedDate, userEmail]);

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
                className={`flex-1 md:flex-none px-5 py-3 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
                  section === "teacher" 
                    ? "bg-white text-blue-600 shadow-sm border border-gray-200" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                👨‍🏫 Teacher Attendance
              </button>
              <button
                onClick={() => setSection("student")}
                className={`flex-1 md:flex-none px-5 py-3 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
                  section === "student" 
                    ? "bg-white text-green-600 shadow-sm border border-gray-200" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                👥 Student Attendance
              </button>
            </div>

            {/* Date Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2.5 flex-1">
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
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm ${
                    teacherAttendanceMarked 
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
                  <option value="10-11">09:00 AM - 10:00 AM</option>
                  <option value="11-12">10:00 AM - 11:00 PM</option>
                  <option value="11-12">11:00 AM - 11:30 PM Short Break</option>
                  <option value="12-13">11:30 PM - 12:30 PM</option>
                  <option value="12-13">12:30 PM - 01:30 PM Lunch Break</option>
                  <option value="12-13">01:30 PM - 02:30 PM</option>
                  <option value="13-14">02:30 PM - 03:30 PM</option>
                  <option value="14-15">03:30 PM - 04:30 PM</option>  
                  <option value="15-16">04:30 PM - 05:30 PM</option>
                </select>
              </div>
              {selectedClass && subjectOptions.length === 0 && (
                <div className="md:col-span-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  No subjects are assigned to you for this class. Please contact the admin team.
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
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                          a.status === 'Present' 
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
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              a.check_in ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {a.check_in ?? "Not Recorded"}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              a.check_out ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
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
                      className={`px-6 py-3 rounded-lg font-medium ${
                        teacherAttendanceMarked 
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="bg-blue-50 rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Students</p>
                    <p className="text-xl font-bold text-blue-600">{students.length}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={submitAttendance}
                      disabled={Object.keys(pendingAttendance).length === 0}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                        Object.keys(pendingAttendance).length > 0
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
                              <img
                                src={stu.profile_picture}
                                alt={stu.fullname}
                                className="w-12 h-12 rounded-full object-cover border"
                              />
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
                          className={getStatusButtonStyles(status, "Present")}
                          disabled={!!submittedAttendance[stu.email?.toLowerCase() || '']}
                        >
                          ✓ Present
                        </button>
                        <button
                          onClick={() => markAttendance(stu.email, "Absent")}
                          className={getStatusButtonStyles(status, "Absent")}
                          disabled={!!submittedAttendance[stu.email?.toLowerCase() || '']}
                        >
                          ✗ Absent
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