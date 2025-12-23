"use client";
import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import axios from "axios";
import Image from "next/image";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

interface Teacher {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  department?: string;
  subjects?: string[];
  teacher_id?: string;
  department_name?: string;
  subject_list?: Subject[];
  fullname?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface Student {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  class?: string;
  section?: string;
  roll_number?: string;
  class_id?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface Subject {
  id: number;
  subject_name: string;
  subject_code?: string;
  subject_id?: number;
  [key: string]: string | number | undefined;
}

interface Class {
  id: number;
  class_name: string;
  section?: string;
  sec?: string;
  [key: string]: string | number | undefined;
}

interface AttendanceRecord {
  id: number;
  date: string;
  status: 'present' | 'absent' | 'leave' | 'Present' | 'Absent' | 'Late' | 'late';
  email?: string;
  teacher_email?: string;
  staff_email?: string;
  user_email?: string;
  role?: string;
  user_type?: string;
  student?: string;
  student_email?: string;
  student_id?: string;
  attendance_date?: string;
  [key: string]: string | number | undefined;
}

interface LeaveRecord {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'Pending' | 'Approved' | 'Rejected' | 'rejected';
  leave_type?: string;
  email?: string;
  applicant_email?: string;
  teacher_email?: string;
  staff_email?: string;
  student_email?: string;
  [key: string]: string | number | undefined;
}

interface GradeRecord {
  id: number;
  student: string;
  subject: string;
  marks_obtained: number;
  total_marks: number;
  exam_type?: string;
  grade?: string;
  [key: string]: string | number | undefined;
}

interface TimetableEntry {
  id: number;
  teacher: string;
  subject: string;
  class_name: string;
  section: string;
  day: string;
  start_time: string;
  end_time: string;
  teacher_email?: string;
  teacher_id?: string;
  subject_id?: number;
  subjectId?: number;
  subject_name?: string;
  subject_code?: string;
  subject_name_id?: number;
  [key: string]: string | number | undefined;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  [key: string]: string | number | undefined;
}

interface Report {
  id: number;
  title: string;
  content: string;
  date: string;
  [key: string]: string | number | undefined;
}

const PrincipalMonthlyReport = () => {
  const [view, setView] = useState<"teachers" | "students" | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filteredTimetable, setFilteredTimetable] = useState<TimetableEntry[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [attendanceMonth, setAttendanceMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [leaveMonth, setLeaveMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Category filter based on teacher ID prefix
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Class teacher assignment states
  const [showAssignClassModal, setShowAssignClassModal] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [selectedClassForAssignment, setSelectedClassForAssignment] = useState<Class | null>(null);
  const [assigningClass, setAssigningClass] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string>("");

  const [studentExtra, setStudentExtra] = useState<{
    leaves: LeaveRecord[];
    grades: GradeRecord[];
    attendance: AttendanceRecord[];
    notices: Notice[];
  }>({
    leaves: [],
    grades: [],
    attendance: [],
    notices: [],
  });
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null);
  const [showLeaveDetails, setShowLeaveDetails] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeRecord | null>(null);
  const [showGradeDetails, setShowGradeDetails] = useState(false);
  const [studentAttendanceMonth, setStudentAttendanceMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [studentLeaveMonth, setStudentLeaveMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [teacherExtra, setTeacherExtra] = useState<{
    leaves: LeaveRecord[];
    classes: TimetableEntry[];
    reports: Report[];
    subjects: Subject[];
    attendance: AttendanceRecord[];
  }>({
    leaves: [],
    classes: [],
    reports: [],
    subjects: [],
    attendance: [],
  });
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Class / Section filters for students view
  const [studentClassFilter, setStudentClassFilter] = useState<string>("all");
  const [studentSectionFilter, setStudentSectionFilter] = useState<string>("all");

  // Function to get category from teacher ID
  const getTeacherCategory = (teacherId: string): string => {
    if (!teacherId) return "Unknown";

    const firstChar = teacherId.charAt(0).toUpperCase();

    switch (firstChar) {
      case 'N': return "Nursery";
      case 'P': return "Higher Primary";
      case 'S': return "School";
      case 'H': return "School";
      case 'L': return "College";
      default: return "Other";
    }
  };

  // Function to get category for filtering
  const getCategoryForFilter = (teacherId: string): string => {
    if (!teacherId) return "other";

    const firstChar = teacherId.charAt(0).toUpperCase();

    switch (firstChar) {
      case 'N': return "nursery";
      case 'P': return "primary";
      case 'S': return "school";
      case 'H': return "highschool";
      case 'L': return "college";
      default: return "other";
    }
  };

  // Get unique categories from teachers
  const uniqueCategories = Array.from(
    new Set(
      teachers
        .map((teacher: Teacher) => getCategoryForFilter(teacher.teacher_id || ""))
        .filter((cat: string) => Boolean(cat))
    )
  ).filter(cat => cat !== "other");

  // Add "all" option to the beginning
  const allCategories = ["all", ...uniqueCategories];

  // Get unique departments for filtered teachers
  const uniqueDepartments = Array.from(
    new Set(
      teachers
        .filter((teacher: Teacher) => {
          const category = getCategoryForFilter(teacher.teacher_id || "");
          return categoryFilter === "all" || category === categoryFilter;
        })
        .map((teacher: Teacher) => teacher.department_name)
        .filter((dept: string | undefined) => Boolean(dept))
    )
  );

  // Teachers filtered by category and department
  const filteredTeachersByCategoryAndDepartment = teachers.filter((teacher: Teacher) => {
    const category = getCategoryForFilter(teacher.teacher_id || "");
    const matchesCategory = categoryFilter === "all" || category === categoryFilter;
    const matchesDepartment = departmentFilter === "all" || teacher.department_name === departmentFilter;

    return matchesCategory && matchesDepartment;
  });

  // ✅ Updated handleSubjectClick with debugging
  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);

    // Filter timetable for this specific subject - check multiple possible field names
    const subjectTimetable = teacherExtra.classes.filter((entry: TimetableEntry) => {
      const possibleFields = [
        entry.subject_id,
        entry.subjectId,
        entry.subject,
        entry.subject_name,
        entry.subject_code,
        entry.subject_name_id
      ];

      return possibleFields.some(field => field === subject.id) ||
        possibleFields.some(field => field === subject.subject_name) ||
        possibleFields.some(field => field === subject.subject_code);
    });

    setFilteredTimetable(subjectTimetable);
  };

  // ✅ Add debug function to show all available data
  // const showAllTimetableData = () => {
  //   // This function was used for debugging and can be removed or kept as a placeholder
  // };

  // Refresh data based on current view
  const refreshData = async () => {
    if (view === "teachers" && selectedTeacher) {
      await fetchTeacherDetails(selectedTeacher);
    } else if (view === "students" && selectedStudent) {
      await fetchStudentDetails(selectedStudent);
    } else if (view === "teachers") {
      await fetchTeachers();
    } else if (view === "students") {
      await fetchStudents();
    }
  };

  // Calculate student statistics
  const calculateStudentStats = (extra: { leaves: LeaveRecord[]; grades: GradeRecord[] }) => {
    const totalLeaves = extra.leaves.length;
    const totalGrades = extra.grades.length;

    // Calculate attendance percentage (assuming 30 days in month, subtract leaves)
    const attendancePercentage = Math.max(0, Math.round(((30 - totalLeaves) / 30) * 100));

    // Calculate average grade
    const averageGrade = totalGrades > 0
      ? (extra.grades.reduce((sum: number, grade: GradeRecord) => sum + (parseFloat(grade.grade || '0') || 0), 0) / totalGrades).toFixed(1)
      : '0';

    return {
      attendancePercentage,
      totalGrades,
      totalLeaves,
      averageGrade
    };
  };

  // Calculate teacher statistics
  const calculateTeacherStats = (extra: { leaves: LeaveRecord[]; classes: TimetableEntry[]; subjects: Subject[]; attendance: AttendanceRecord[] }) => {
    const totalLeaves = extra.leaves.length;
    const totalClasses = extra.classes.length;
    const totalSubjects = extra.subjects.length;

    // Calculate attendance from actual attendance data
    const presentDays = extra.attendance.filter((a: AttendanceRecord) => a.status === "Present").length;
    const totalAttendanceDays = extra.attendance.length;
    const attendancePercentage = totalAttendanceDays > 0
      ? Math.round((presentDays / totalAttendanceDays) * 100)
      : Math.max(0, Math.round(((30 - totalLeaves) / 30) * 100)); // fallback to leave-based calculation

    return {
      attendancePercentage,
      totalClasses,
      totalSubjects,
      totalLeaves,
      presentDays,
      totalAttendanceDays
    };
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/teachers/`);
      setTeachers(res.data);
    } catch (err: unknown) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        axios.get(`${API_BASE}/students/`),
        axios.get(`${API_BASE}/classes/`),
      ]);

      setStudents(studentsRes.data || []);
      setAllClasses(classesRes.data || []);
    } catch (err: unknown) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all classes for assignment
  const fetchAvailableClasses = async () => {
    try {
      console.log("📚 Fetching all classes for assignment...");
      const response = await axios.get(`${API_BASE}/classes/`);
      const classesData = response.data || [];

      console.log("✅ Available classes:", classesData);
      setAvailableClasses(classesData);
    } catch (err: unknown) {
      console.error("❌ Error fetching classes:", err);
    }
  };

  // Assign class teacher
  const assignClassTeacher = async (classId: string) => {
    if (!selectedTeacher || !classId) {
      setError("Please select a teacher and class first");
      return;
    }

    setAssigningClass(true);
    setAssignmentSuccess("");
    setError("");

    try {
      console.log("📝 Assigning class teacher:", {
        teacherEmail: selectedTeacher.email,
        classId: classId
      });

      // Find the class info
      const selectedClass = availableClasses.find(cls => Number(cls.id) === Number(classId));

      if (!selectedClass) {
        setError("Class not found");
        setAssigningClass(false);
        return;
      }

      // Prepare the request body
      const requestBody = {
        class_teacher: selectedTeacher.email
      };

      console.log("📤 Sending PATCH request to:", `${API_BASE}/classes/${classId}/`);
      console.log("📦 Request body:", requestBody);

      // Make PATCH request to assign class teacher
      const response = await axios.patch(
        `${API_BASE}/classes/${classId}/`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Assignment response:", response.data);

      // Show success message
      setAssignmentSuccess(
        `Successfully assigned ${selectedTeacher.fullname} as class teacher for ${selectedClass.class_name} - ${selectedClass.sec}`
      );

      // Refresh classes data
      await fetchAvailableClasses();

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowAssignClassModal(false);
        setAssignmentSuccess("");
      }, 2000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("❌ Error assigning class teacher:", err);
      console.error("❌ Error details:", err instanceof Error ? err.message : String(err));

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to assign class teacher. Please try again."
      );
    } finally {
      setAssigningClass(false);
    }
  };

  // Open assign class modal
  const openAssignClassModal = async () => {
    if (!selectedTeacher) return;

    setShowAssignClassModal(true);
    setSelectedClassForAssignment(null);
    setAssignmentSuccess("");
    setError("");

    // Fetch available classes
    await fetchAvailableClasses();
  };

  // ✅ Try different timetable API endpoints
  const fetchTeacherDetails = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setLoading(true);

    try {
      // Use teacher's subject list from the teacher object if available
      const subjectsFromTeacher = Array.isArray(teacher.subject_list) ? teacher.subject_list : [];
      const teacherSubjectIds = subjectsFromTeacher.map((subject: Subject) => subject.id);

      // Try multiple timetable endpoints with different parameters
      const endpoints = [
        `${API_BASE}/timetable/`,
        `${API_BASE}/timetable/?teacher_email=${teacher.email}`,
        `${API_BASE}/timetable/?teacher_id=${teacher.teacher_id}`,
        `${API_BASE}/timetable/?email=${teacher.email}`,
        `${API_BASE}/timetable/?teacher=${teacher.teacher_id}`,
        `${API_BASE}/class-timetable/`,
        `${API_BASE}/class-timetable/?teacher_email=${teacher.email}`,
      ];

      let allTimetableEntries: TimetableEntry[] = [];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint);
          const data = response.data || [];

          if (Array.isArray(data) && data.length > 0) {
            allTimetableEntries = data;
            break;
          }
        } catch {
          // Endpoint failed, continue to next
        }
      }

      // If still no data, try to fetch all timetable entries and filter
      if (allTimetableEntries.length === 0) {
        try {
          const allResponse = await axios.get(`${API_BASE}/timetable/`);
          const allData = allResponse.data || [];

          if (Array.isArray(allData)) {
            // Filter by teacher email or teacher ID
            allTimetableEntries = allData.filter((entry: TimetableEntry) =>
              entry.teacher_email === teacher.email ||
              entry.teacher_id === teacher.teacher_id ||
              entry.teacher === teacher.teacher_id
            );
          }
        } catch (_err) {
          console.log("❌ Failed to fetch all timetable:", _err);
        }
      }

      // If we don't have explicit subject IDs from the teacher, keep all timetable entries
      let classes = allTimetableEntries;

      // If teacherSubjectIds is available, further filter classes by those subject IDs
      if (teacherSubjectIds.length > 0) {
        classes = allTimetableEntries.filter((entry: TimetableEntry) => {
          const possibleFields = [
            entry.subject_id,
            entry.subjectId,
            entry.subject,
            entry.subject_name_id
          ];

          const matches = possibleFields.some(field =>
            teacherSubjectIds.includes(Number(field) || 0)
          );

          return matches;
        });
      }

      // 🔥 FIXED: Fetch leaves for the specific teacher
      let leaves: LeaveRecord[] = [];
      try {


        const [leaveYear, leaveMonthNum] = leaveMonth.split("-");

        // Try multiple leaves endpoints
        const leaveEndpoints = [
          `${API_BASE}/leaves/?email=${teacher.email}&year=${leaveYear}&month=${leaveMonthNum}`,
          `${API_BASE}/leaves/?applicant_email=${teacher.email}&year=${leaveYear}&month=${leaveMonthNum}`,
          `${API_BASE}/leaves/?teacher_email=${teacher.email}&year=${leaveYear}&month=${leaveMonthNum}`,
          `${API_BASE}/leaves/?staff_email=${teacher.email}&year=${leaveYear}&month=${leaveMonthNum}`,
        ];

        for (const endpoint of leaveEndpoints) {
          try {
            const leavesResponse = await axios.get(endpoint);
            const data = leavesResponse.data || [];

            if (Array.isArray(data) && data.length > 0) {
              // Filter to ensure we only get this teacher's leaves
              const filteredLeaves = data.filter((leave: LeaveRecord) => {
                const matchesEmail =
                  leave.email === teacher.email ||
                  leave.applicant_email === teacher.email ||
                  leave.teacher_email === teacher.email ||
                  leave.staff_email === teacher.email;

                return matchesEmail;
              });

              if (filteredLeaves.length > 0) {
                leaves = filteredLeaves;
                break;
              }
            }
          } catch { // Line 609 - unused err
            // Endpoint failed, continue to next
          }
        }

        // If still no leaves, try to fetch all leaves and filter client-side
        if (leaves.length === 0) {
          try {
            const allLeavesResponse = await axios.get(`${API_BASE}/leaves/`);
            const allLeaves = allLeavesResponse.data || [];

            // Filter by teacher email
            leaves = allLeaves.filter((leave: LeaveRecord) => {
              const matchesEmail =
                leave.email === teacher.email ||
                leave.applicant_email === teacher.email ||
                leave.teacher_email === teacher.email ||
                leave.staff_email === teacher.email;

              // Also filter by month if available
              if (matchesEmail && leave.start_date) {
                const leaveDate = new Date(leave.start_date);
                const leaveYearMonth = `${leaveDate.getFullYear()}-${String(leaveDate.getMonth() + 1).padStart(2, '0')}`;
                return leaveYearMonth === leaveMonth;
              }

              return matchesEmail;
            });
          } catch { // Line 637 - unused err
            // Failed to fetch all leaves
          }
        }


      } catch (_err) {
        console.log("❌ Failed to fetch leaves:", _err);
      }

      // 🔥 FIXED: Fetch attendance for the specific teacher
      let attendance: AttendanceRecord[] = [];
      try {


        const [attendanceYear, attendanceMonthNum] = attendanceMonth.split("-");

        // Try multiple attendance endpoints for teachers
        const attendanceEndpoints = [
          `${API_BASE}/attendance/?email=${teacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
          `${API_BASE}/teacher-attendance/?email=${teacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
          `${API_BASE}/staff-attendance/?email=${teacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
          `${API_BASE}/attendance/?teacher_email=${teacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
        ];

        for (const endpoint of attendanceEndpoints) {
          try {
            const attendanceResponse = await axios.get(endpoint);
            const data = attendanceResponse.data || [];

            if (Array.isArray(data) && data.length > 0) {
              // Filter to ensure we only get this teacher's attendance
              const filteredAttendance = data.filter((record: AttendanceRecord) => {
                const matchesEmail =
                  record.email === teacher.email ||
                  record.teacher_email === teacher.email ||
                  record.staff_email === teacher.email ||
                  record.user_email === teacher.email;

                // Also check role if available
                const role = (record.role || record.user_type || '').toString().toLowerCase();
                const isTeacherRole = !role || role.includes('teacher') || role.includes('staff');

                return matchesEmail && isTeacherRole;
              });

              if (filteredAttendance.length > 0) {
                attendance = filteredAttendance;
                break;
              }
            }
          } catch { // Line 688 - unused err
            // Endpoint failed, continue to next
          }
        }

        // If still no attendance, try to fetch all attendance and filter client-side
        if (attendance.length === 0) {
          try {
            const allAttendanceResponse = await axios.get(`${API_BASE}/attendance/`);
            const allAttendance = allAttendanceResponse.data || [];

            // Filter by teacher email and month
            attendance = allAttendance.filter((record: AttendanceRecord) => {
              const matchesEmail =
                record.email === teacher.email ||
                record.teacher_email === teacher.email ||
                record.staff_email === teacher.email;

              const isTeacherRole = !record.role ||
                record.role.toString().toLowerCase().includes('teacher') ||
                record.role.toString().toLowerCase().includes('staff');

              // Filter by month if date is available
              if (matchesEmail && isTeacherRole && record.date) {
                const recordDate = new Date(record.date);
                const recordYearMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
                return recordYearMonth === attendanceMonth;
              }

              return matchesEmail && isTeacherRole;
            });
          } catch {
            // Failed to fetch all attendance
          }
        }


      } catch (err) {
        console.log("❌ Failed to fetch attendance:", err);
      }

      // Ensure we have full class info (class_name, sec) for timetable entries
      let currentClasses = allClasses;
      if (currentClasses.length === 0) {
        try {
          const classesRes = await axios.get(`${API_BASE}/classes/`);
          currentClasses = classesRes.data || [];
          setAllClasses(currentClasses);
        } catch (_err) {
          console.log("❌ Failed to load classes for timetable view:", _err);
        }
      }

      // Derive teacher subjects from timetable entries + subjects API
      let derivedSubjects: Subject[] = [];
      try {
        const subjectsRes = await axios.get(`${API_BASE}/subjects/`);
        const allSubjects = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];

        const seen = new Set<number | string>();
        classes.forEach((entry: TimetableEntry) => {
          const subjectId = entry.subject_id ?? entry.subjectId ?? entry.subject ?? entry.subject_name_id;
          if (!subjectId || seen.has(subjectId)) return;
          seen.add(subjectId);

          const subj = allSubjects.find((s: Subject) => s.id === subjectId || s.subject_id === subjectId);
          if (subj) {
            derivedSubjects.push(subj);
          } else {
            // Fallback subject object from timetable entry
            derivedSubjects.push({
              id: Number(subjectId),
              subject_name: entry.subject_name || String(subjectId),
              subject_code: entry.subject_code || '',
            });
          }
        });
      } catch { // Line 765 - unused err
        derivedSubjects = [];
      }

      // Prefer derived subjects; if empty, fall back to any subjects from teacher object
      const finalSubjects = derivedSubjects.length > 0 ? derivedSubjects : subjectsFromTeacher;

      setTeacherExtra({
        leaves: leaves,
        subjects: finalSubjects,
        classes: classes,
        reports: [],
        attendance: attendance,
      });
    } catch {
      setTeacherExtra({
        leaves: [],
        subjects: teacher.subject_list || [],
        classes: [],
        reports: [],
        attendance: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIXED: Refresh attendance data when month/year changes
  const refreshAttendanceData = useCallback(async () => {
    if (!selectedTeacher) return;

    try {
      const [attendanceYear, attendanceMonthNum] = attendanceMonth.split("-");
      let attendance: AttendanceRecord[] = [];

      // Try multiple attendance endpoints
      const attendanceEndpoints = [
        `${API_BASE}/attendance/?email=${selectedTeacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
        `${API_BASE}/teacher-attendance/?email=${selectedTeacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
        `${API_BASE}/staff-attendance/?email=${selectedTeacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
      ];

      for (const endpoint of attendanceEndpoints) {
        try {
          const response = await axios.get(endpoint);
          const data = response.data || [];

          if (Array.isArray(data) && data.length > 0) {
            // Filter by teacher email
            const filteredAttendance = data.filter((record: AttendanceRecord) => {
              const matchesEmail =
                record.email === selectedTeacher.email ||
                record.teacher_email === selectedTeacher.email ||
                record.staff_email === selectedTeacher.email;

              return matchesEmail;
            });

            if (filteredAttendance.length > 0) {
              attendance = filteredAttendance;
              break;
            }
          }
        } catch {
          // Endpoint failed, continue to next
        }
      }

      // Update teacher extra data
      setTeacherExtra(prev => ({ ...prev, attendance }));
    } catch { // Line 835 - unused err
      // Error refreshing attendance
    }
  }, [selectedTeacher, attendanceMonth]);

  // 🔥 FIXED: Refresh leaves data when month/year changes
  const refreshLeavesData = useCallback(async () => {
    if (!selectedTeacher) return;

    try {
      const [leaveYear, leaveMonthNum] = leaveMonth.split("-");
      let leaves: LeaveRecord[] = [];

      // Try multiple leaves endpoints
      const leaveEndpoints = [
        `${API_BASE}/leaves/?email=${selectedTeacher.email}&year=${leaveYear}&month=${leaveMonthNum}`,
        `${API_BASE}/leaves/?applicant_email=${selectedTeacher.email}&year=${leaveYear}&month=${leaveMonthNum}`,
        `${API_BASE}/leaves/?teacher_email=${selectedTeacher.email}&year=${leaveYear}&month=${leaveMonthNum}`,
      ];

      for (const endpoint of leaveEndpoints) {
        try {
          const response = await axios.get(endpoint);
          const data = response.data || [];

          if (Array.isArray(data) && data.length > 0) {
            // Filter by teacher email
            const filteredLeaves = data.filter((leave: LeaveRecord) => {
              const matchesEmail =
                leave.email === selectedTeacher.email ||
                leave.applicant_email === selectedTeacher.email ||
                leave.teacher_email === selectedTeacher.email;

              return matchesEmail;
            });

            if (filteredLeaves.length > 0) {
              leaves = filteredLeaves;
              break;
            }
          }
        } catch {
          // Endpoint failed, continue to next
        }
      }

      // Update teacher extra data
      setTeacherExtra(prev => ({ ...prev, leaves }));
    } catch { // Line 883 - unused err
      // Error refreshing leaves
    }
  }, [selectedTeacher, leaveMonth]);

  // Refresh data when month/year changes
  useEffect(() => {
    if (selectedTeacher) {
      refreshAttendanceData();
    }
  }, [attendanceMonth, refreshAttendanceData, selectedTeacher]);

  useEffect(() => {
    if (selectedTeacher) {
      refreshLeavesData();
    }
  }, [leaveMonth, refreshLeavesData, selectedTeacher]);

  const refreshStudentAttendanceData = useCallback(async () => {
    if (!selectedStudent) return;

    let attendance: AttendanceRecord[] = [];

    try {
      // Fetch all student_attendance records, then filter by email + month/year client-side
      const attendanceResponse = await axios.get(`${API_BASE}/student_attendance/`);
      let rawAttendance = attendanceResponse.data || [];

      // Some backends may return an object instead of array
      if (!Array.isArray(rawAttendance)) {
        rawAttendance = Object.values(rawAttendance);
      }

      attendance = rawAttendance.filter((record: AttendanceRecord) => {
        const emailMatch =
          record.student === selectedStudent.email ||
          record.student_email === selectedStudent.email ||
          record.email === selectedStudent.email ||
          record.student_id === selectedStudent.email;

        // Match by year-month using the date string (e.g. "2025-11-15")
        const recordDate = record.date || record.attendance_date;
        let monthMatch = true;
        if (recordDate && typeof recordDate === 'string') {
          const recMonth = recordDate.split('T')[0]?.slice(0, 7); // YYYY-MM
          monthMatch = recMonth === studentAttendanceMonth;
        }

        return emailMatch && monthMatch;
      });

      // Update state with new attendance data
      setStudentExtra(prev => ({
        ...prev,
        attendance: attendance,
      }));

    } catch {
      // Error refreshing student attendance
    }
  }, [selectedStudent, studentAttendanceMonth]);

  const refreshStudentLeavesData = useCallback(async () => {
    if (!selectedStudent) return;

    const [year, month] = studentLeaveMonth.split("-");
    let leaves: LeaveRecord[] = [];

    try {
      // Try leaves endpoints with new month
      try {
        const leavesResponse = await axios.get(`${API_BASE}/leaves/?applicant_email=${selectedStudent.email}&year=${year}&month=${month}`);
        const rawLeaves = leavesResponse.data || [];

        // Filter client-side
        leaves = rawLeaves.filter((leave: LeaveRecord) =>
          leave.applicant_email === selectedStudent.email ||
          leave.email === selectedStudent.email ||
          leave.student_email === selectedStudent.email
        );
      } catch {
        try {
          const leavesResponse = await axios.get(`${API_BASE}/leaves/?applicant_email=${selectedStudent.email}`);
          const rawLeaves = leavesResponse.data || [];

          leaves = rawLeaves.filter((leave: LeaveRecord) =>
            leave.applicant_email === selectedStudent.email ||
            leave.email === selectedStudent.email ||
            leave.student_email === selectedStudent.email
          );
        } catch {
          // All leaves endpoints failed
        }
      }

      // Update state with new leaves data
      setStudentExtra(prev => ({
        ...prev,
        leaves: leaves,
      }));

    } catch {
      // Error refreshing student leaves
    }
  }, [selectedStudent, studentLeaveMonth]);


  // Refresh student attendance data when month changes
  useEffect(() => {
    if (selectedStudent) {
      refreshStudentAttendanceData();
    }
  }, [studentAttendanceMonth, refreshStudentAttendanceData, selectedStudent]);

  // Refresh student leaves data when month changes
  useEffect(() => {
    if (selectedStudent) {
      refreshStudentLeavesData();
    }
  }, [studentLeaveMonth, refreshStudentLeavesData, selectedStudent]);


  // Helper: resolve class info for a student using class_id and allClasses
  const getClassInfoForStudent = (student: Student) => {
    if (!student?.class_id) return null;
    return allClasses.find((cls: Class) => cls.id === student.class_id) || null;
  };

  // Derived lists for student filters
  const studentUniqueClasses = Array.from(
    new Set(
      allClasses
        .map((cls: Class) => cls.class_name)
        .filter((name: string) => Boolean(name))
    )
  );

  const studentUniqueSectionsForClass = studentClassFilter === "all"
    ? []
    : Array.from(
      new Set(
        allClasses
          .filter((cls: Class) => cls.class_name === studentClassFilter)
          .map((cls: Class) => cls.sec)
          .filter((sec: string | undefined): sec is string => Boolean(sec))
      )
    );

  // Students filtered by class/section
  const filteredStudentsByClass = students.filter((student: Student) => {
    const classInfo = getClassInfoForStudent(student);
    const className = classInfo?.class_name;
    const section = classInfo?.sec;

    const matchesClass =
      studentClassFilter === "all" || className === studentClassFilter;
    const matchesSection =
      studentSectionFilter === "all" || studentSectionFilter === "" || section === studentSectionFilter;

    return matchesClass && matchesSection;
  });

  // Fetch student details
  const fetchStudentDetails = async (student: Student) => {
    setSelectedStudent(student);
    setLoading(true);

    const [year, month] = selectedMonth.split("-");

    try {
      // Try multiple endpoint variations for each API
      let leaves: LeaveRecord[] = [];
      let grades: GradeRecord[] = [];
      let attendance: AttendanceRecord[] = [];

      // Try leaves endpoints
      try {
        const leavesResponse = await axios.get(`${API_BASE}/leaves/?applicant_email=${student.email}&year=${year}&month=${month}`);
        const rawLeaves = leavesResponse.data || [];

        // Always filter client-side to ensure we only get student's leaves
        leaves = rawLeaves.filter((leave: LeaveRecord) => {
          const matches = leave.applicant_email === student.email ||
            leave.email === student.email ||
            leave.student_email === student.email ||
            leave.student_id === student.email;

          return matches;
        });

      } catch {
        try {
          const leavesResponse = await axios.get(`${API_BASE}/leaves/?applicant_email=${student.email}`);
          const rawLeaves = leavesResponse.data || [];

          // Filter client-side
          leaves = rawLeaves.filter((leave: LeaveRecord) =>
            leave.applicant_email === student.email ||
            leave.email === student.email ||
            leave.student_email === student.email ||
            leave.student_id === student.email
          );

        } catch {
          // Try fetching all leaves and filter client-side
          try {
            const allLeavesResponse = await axios.get(`${API_BASE}/leaves/`);
            const allLeaves = allLeavesResponse.data || [];

            // Filter by applicant_email with detailed logging
            const filteredLeaves = allLeaves.filter((leave: LeaveRecord) => {
              const matches = leave.applicant_email === student.email ||
                leave.email === student.email ||
                leave.student_email === student.email ||
                leave.student_id === student.email;

              return matches;
            });

            if (filteredLeaves.length > 0) {
              leaves = filteredLeaves;
            }
          } catch {
            // All leaves endpoint also failed
          }
        }
      }

      // Try grades endpoints
      try {
        const gradesResponse = await axios.get(`${API_BASE}/grades/?student=${student.email}&year=${year}&month=${month}`);
        const rawGrades = gradesResponse.data || [];

        // Always filter client-side to ensure we only get student's grades
        grades = rawGrades.filter((record: GradeRecord) => {
          const matches = record.student === student.email ||
            record.student_email === student.email ||
            record.email === student.email ||
            record.student_id === student.email ||
            record.studentid === student.email;

          return matches;
        });

      } catch {
        const gradeEndpoints = [
          `${API_BASE}/grades/?student=${student.email}&year=${year}&month=${month}`,
          `${API_BASE}/grades/?student=${student.email}`,
          `${API_BASE}/grades/?student_email=${student.email}&year=${year}&month=${month}`,
          `${API_BASE}/grades/?student_id=${student.email}&year=${year}&month=${month}`,
          `${API_BASE}/grades/?email=${student.email}&year=${year}&month=${month}`,
          `${API_BASE}/grades/`,
        ];

        for (const endpoint of gradeEndpoints) {
          try {
            const gradesResponse = await axios.get(endpoint);
            const data = gradesResponse.data || [];

            if (Array.isArray(data) && data.length > 0) {
              // If we got all grades, filter by student email
              const filteredGrades = endpoint.includes('?')
                ? data.filter((grade: GradeRecord) => {
                  const matches = grade.student === student.email ||
                    grade.student_email === student.email ||
                    grade.email === student.email ||
                    grade.student_id === student.email;

                  return matches;
                })
                : data.filter((grade: GradeRecord) => {
                  const matches = grade.student === student.email ||
                    grade.student_email === student.email ||
                    grade.email === student.email ||
                    grade.student_id === student.email;

                  return matches;
                });

              if (filteredGrades.length > 0) {
                grades = filteredGrades;
                break;
              }
            }
          } catch {
            // Endpoint failed, continue to next
          }
        }
      }

      // Fetch attendance from student_attendance and filter by email + selected month
      try {
        const attendanceResponse = await axios.get(`${API_BASE}/student_attendance/`);
        let rawAttendance = attendanceResponse.data || [];

        // Some backends may return an object instead of array
        if (!Array.isArray(rawAttendance)) {
          rawAttendance = Object.values(rawAttendance);
        }

        attendance = rawAttendance.filter((record: AttendanceRecord) => {
          const emailMatch =
            record.student === student.email ||
            record.student_email === student.email ||
            record.email === student.email ||
            record.student_id === student.email;

          const recordDate = record.date || record.attendance_date;
          let monthMatch = true;
          if (recordDate && typeof recordDate === "string") {
            const recMonth = recordDate.split("T")[0]?.slice(0, 7); // YYYY-MM
            monthMatch = recMonth === selectedMonth;
          }

          return emailMatch && monthMatch;
        });

      } catch {
        // student_attendance API failed
      }



      setStudentExtra({
        leaves: leaves,
        grades: grades, // Store grades data from API
        attendance: attendance, // Store attendance data
        notices: [], // Initialize notices as empty array
      });
    } catch {
      // Set empty data on error to prevent crashes
      setStudentExtra({
        leaves: [],
        grades: [],
        attendance: [], // Include empty attendance array
        notices: [], // Include empty notices array
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to get category display name
  const getCategoryDisplayName = (category: string): string => {
    switch (category) {
      case 'nursery': return 'Nursery';
      case 'primary': return 'Higher Primary';
      case 'school': return 'School';
      case 'highschool': return 'School';
      case 'college': return 'College';
      case 'all': return 'All Categories';
      default: return category;
    }
  };

  return (
    <DashboardLayout role="principal">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div></div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Principal Monthly Report
              </h1>
              <button
                onClick={refreshData}
                disabled={loading}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium flex items-center gap-2 transition-colors text-sm sm:text-base"
              >
                {loading ? "Refreshing..." : "🔄 Refresh"}
              </button>
            </div>
            <p className="text-gray-600 text-base sm:text-lg">
              Comprehensive overview of teachers and students performance
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => {
                setView("teachers");
                setSelectedTeacher(null);
                fetchTeachers();
              }}
              className={`px-4 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 ${view === "teachers"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-300 hover:border-blue-500"
                }`}
            >
              👨‍🏫 View Teachers Report
            </button>
            <button
              onClick={() => {
                setView("students");
                setSelectedStudent(null);
                fetchStudents();
              }}
              className={`px-4 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 ${view === "students"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-300 hover:border-green-500"
                }`}
            >
              👨‍🎓 View Students Report
            </button>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Teachers Grid */}
          {view === "teachers" && !selectedTeacher && (
            <>
              {/* Category and Department Filters */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setDepartmentFilter("all");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
                    >
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {getCategoryDisplayName(cat)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
                      disabled={categoryFilter === "all" && departmentFilter === "all"}
                    >
                      <option value="all">All Departments</option>
                      {uniqueDepartments.map((dept) => (
                        <option key={dept as string} value={dept as string}>
                          {dept as string}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredTeachersByCategoryAndDepartment.length}</span> teachers
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredTeachersByCategoryAndDepartment.map((teacher, index) => {
                  const category = getTeacherCategory(teacher.teacher_id || "");
                  const categoryColor = {
                    "Nursery": "bg-pink-100 border-pink-300",
                    "Higher Primary": "bg-green-100 border-green-300",
                    "School": "bg-blue-100 border-blue-300",
                    "College": "bg-purple-100 border-purple-300",
                    "Other": "bg-gray-100 border-gray-300"
                  }[category] || "bg-gray-100 border-gray-300";

                  return (
                    <div
                      key={`teacher-${teacher.teacher_id ?? teacher.email ?? teacher.id ?? index}`}
                      onClick={() => fetchTeacherDetails(teacher)}
                      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 ${categoryColor}`}
                    >
                      <div className="p-4 sm:p-6 text-center">
                        <div className="relative">
                          <Image
                            src={teacher.profile_picture || "https://i.pravatar.cc/150"}
                            alt={teacher.fullname || "Teacher"}
                            width={80}
                            height={80}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-md mx-auto"
                          />
                          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 border">
                            <span className="text-xs font-semibold px-1">
                              {teacher.teacher_id?.charAt(0) || "?"}
                            </span>
                          </div>
                        </div>
                        <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-bold text-gray-800">{teacher.fullname}</h3>
                        <p className="text-xs sm:text-sm text-blue-600 font-medium">{teacher.department_name}</p>
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${category === "Nursery" ? "bg-pink-100 text-pink-800" :
                            category === "Higher Primary" ? "bg-green-100 text-green-800" :
                              category === "School" ? "bg-blue-100 text-blue-800" :
                                category === "College" ? "bg-purple-100 text-purple-800" :
                                  "bg-gray-100 text-gray-800"
                            }`}>
                            {category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{teacher.qualification}</p>
                        <p className="text-xs text-gray-500 mt-0.5">ID: {teacher.teacher_id}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Teacher Details */}
          {selectedTeacher && teacherExtra && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-4 sm:p-6 text-white">
                <button
                  onClick={() => {
                    setSelectedTeacher(null);
                    setTeacherExtra({
                      leaves: [],
                      classes: [],
                      reports: [],
                      subjects: [],
                      attendance: [],
                    });
                  }}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4 text-sm sm:text-base"
                >
                  <span>←</span>
                  <span>Back to Teachers</span>
                </button>
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
                  <div className="relative">
                    <Image
                      src={selectedTeacher.profile_picture || "https://i.pravatar.cc/150"}
                      alt={selectedTeacher.fullname || "Teacher"}
                      width={128}
                      height={128}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg mx-auto md:mx-0"
                    />
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 border shadow-md">
                      <span className="text-sm font-bold text-blue-600">
                        {selectedTeacher.teacher_id?.charAt(0) || "?"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center md:text-left">{selectedTeacher.fullname}</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTeacherCategory(selectedTeacher.teacher_id || "") === "Nursery" ? "bg-pink-100 text-pink-800" :
                        getTeacherCategory(selectedTeacher.teacher_id || "") === "Higher Primary" ? "bg-green-100 text-green-800" :
                          getTeacherCategory(selectedTeacher.teacher_id || "") === "School" ? "bg-blue-100 text-blue-800" :
                            getTeacherCategory(selectedTeacher.teacher_id || "") === "College" ? "bg-purple-100 text-purple-800" :
                              "bg-gray-100 text-gray-800"
                        }`}>
                        {getTeacherCategory(selectedTeacher.teacher_id || "")}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div><b>Teacher ID:</b> {selectedTeacher.teacher_id}</div>
                      <div><b>Department:</b> {selectedTeacher.department_name}</div>
                      <div><b>Qualification:</b> {selectedTeacher.qualification}</div>
                      <div><b>Experience:</b> {selectedTeacher.experience_years} years</div>
                      <div><b>Phone:</b> {selectedTeacher.phone}</div>
                      <div><b>Email:</b> {selectedTeacher.email}</div>
                    </div>

                    {/* Assign Class Teacher Button */}
                    <div className="mt-4">
                      <button
                        onClick={openAssignClassModal}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                      >
                        🏫 Make Class Teacher
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Stats Cards */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {(() => {
                    const stats = calculateTeacherStats(teacherExtra);
                    return (
                      <>
                        <div className="bg-green-50 p-3 sm:p-4 rounded-xl text-center">
                          <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.attendancePercentage}%</div>
                          <div className="text-xs sm:text-sm text-gray-600">Attendance</div>
                        </div>
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-xl text-center">
                          <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalClasses}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Classes</div>
                        </div>
                        <div className="bg-purple-50 p-3 sm:p-4 rounded-xl text-center">
                          <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.totalSubjects}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Subjects</div>
                        </div>
                        <div className="bg-orange-50 p-3 sm:p-4 rounded-xl text-center">
                          <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.totalLeaves}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Leaves</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Detailed Information */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Subjects */}
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                      📚 Subjects Taught
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {teacherExtra.subjects.map((sub: Subject) => (
                        <div
                          key={sub.id}
                          onClick={() => handleSubjectClick(sub)}
                          className={`bg-white p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedSubject?.id === sub.id
                            ? "border-blue-500 ring-2 ring-blue-300 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                            }`}
                        >
                          <div className="font-semibold text-gray-800 text-sm sm:text-base">{sub.subject_name}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Code: {sub.subject_code}</div>
                          <div className="text-xs sm:text-sm text-gray-600">ID: {sub.id}</div>
                        </div>
                      ))}
                    </div>


                  </div>

                  {/* Timetable for Selected Subject */}
                  {selectedSubject && (
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-xl lg:col-span-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                        🕒 Timetable for {selectedSubject.subject_name}
                      </h3>



                      {filteredTimetable.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {filteredTimetable.map((entry: TimetableEntry, index: number) => {
                            const classInfo = allClasses.find((cls: Class) => cls.id === entry.class_id);
                            const className = classInfo?.class_name || entry.class_name || "Unknown Class";
                            const section = classInfo?.sec || entry.sec || entry.section || "-";

                            return (
                              <div key={index} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{className}</h4>
                                <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                                  <div><strong>Section:</strong> {section}</div>
                                  <div><strong>Day:</strong> {entry.day_of_week}</div>
                                  <div><strong>Time:</strong> {entry.start_time} - {entry.end_time}</div>
                                  {entry.room_number && <div><strong>Room:</strong> {entry.room_number}</div>}

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-8">
                          <div className="text-3xl sm:text-4xl mb-2">📅</div>
                          <p className="text-gray-500 text-sm sm:text-base">No timetable entries found for this subject.</p>
                          <p className="text-xs sm:text-sm text-gray-400 mt-2">
                            Subject ID: {selectedSubject.id} | No matching entries in timetable
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Attendance Summary */}
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                        🗓️ Monthly Attendance ({attendanceMonth})
                      </h3>
                      <input
                        type="month"
                        value={attendanceMonth}
                        onChange={(e) => setAttendanceMonth(e.target.value)}
                        className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                    {(() => {
                      const attendanceData = teacherExtra.attendance || [];
                      const present = attendanceData.filter((a: AttendanceRecord) => (a.status as string) === "Present" || (a.status as string) === "present").length;
                      const absent = attendanceData.filter((a: AttendanceRecord) => (a.status as string) === "Absent" || (a.status as string) === "absent").length;
                      const late = attendanceData.filter((a: AttendanceRecord) => (a.status as string) === "Late" || (a.status as string) === "late").length;
                      const total = attendanceData.length;

                      return (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center text-sm sm:text-base">
                            <span>Total Days:</span>
                            <span className="font-semibold">{total}</span>
                          </div>
                          <div className="flex justify-between items-center text-green-600 text-sm sm:text-base">
                            <span>Present:</span>
                            <span className="font-semibold">{present}</span>
                          </div>
                          <div className="flex justify-between items-center text-red-600 text-sm sm:text-base">
                            <span>Absent:</span>
                            <span className="font-semibold">{absent}</span>
                          </div>
                          <div className="flex justify-between items-center text-yellow-600 text-sm sm:text-base">
                            <span>Late:</span>
                            <span className="font-semibold">{late}</span>
                          </div>
                          <div className="flex justify-between items-center text-blue-600 font-semibold text-sm sm:text-base">
                            <span>Attendance Rate:</span>
                            <span>{total > 0 ? Math.round((present / total) * 100) : 0}%</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Leaves Summary */}
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                        📝 Leave History ({leaveMonth})
                      </h3>
                      <input
                        type="month"
                        value={leaveMonth}
                        onChange={(e) => setLeaveMonth(e.target.value)}
                        className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center text-green-600 text-sm sm:text-base">
                        <span>Approved Leaves:</span>
                        <span className="font-semibold">
                          {Array.isArray(teacherExtra.leaves) ? teacherExtra.leaves.filter((l: LeaveRecord) => l.status === "Approved").length : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-yellow-600 text-sm sm:text-base">
                        <span>Pending Leaves:</span>
                        <span className="font-semibold">
                          {Array.isArray(teacherExtra.leaves) ? teacherExtra.leaves.filter((l: LeaveRecord) => (l.status as string) === "Pending" || (l.status as string) === "pending").length : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-red-600 text-sm sm:text-base">
                        <span>Rejected Leaves:</span>
                        <span className="font-semibold">
                          {Array.isArray(teacherExtra.leaves) ? teacherExtra.leaves.filter((l: LeaveRecord) => (l.status as string) === "Rejected" || (l.status as string) === "rejected").length : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Filters + Grid */}
          {view === "students" && !selectedStudent && (
            <>
              {/* Filters */}
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select
                      value={studentClassFilter}
                      onChange={(e) => {
                        setStudentClassFilter(e.target.value);
                        setStudentSectionFilter("all");
                      }}
                      className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 text-xs sm:text-sm"
                    >
                      <option value="all">All Classes</option>
                      {studentUniqueClasses.map((clsName) => (
                        <option key={clsName as string} value={clsName as string}>
                          {clsName as string}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Section</label>
                    <select
                      value={studentSectionFilter}
                      onChange={(e) => setStudentSectionFilter(e.target.value)}
                      className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 text-xs sm:text-sm"
                      disabled={studentClassFilter === "all"}
                    >
                      <option value="all">All Sections</option>
                      {studentUniqueSectionsForClass.map((sec) => (
                        <option key={sec as string} value={sec as string}>
                          {sec as string}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-0">
                  Showing <span className="font-semibold">{filteredStudentsByClass.length}</span> students
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredStudentsByClass.map((student, index) => (
                  (() => {
                    const classInfo = getClassInfoForStudent(student);
                    const className = classInfo?.class_name;
                    const section = classInfo?.sec;

                    return (
                      <div
                        key={student.id || index}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-200"
                        onClick={() => fetchStudentDetails(student)}
                      >
                        <div className="p-4 sm:p-6 text-center">
                          <Image
                            src={student.profile_picture || "https://i.pravatar.cc/150"}
                            alt={student.fullname || "Student"}
                            width={80}
                            height={80}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-green-100 shadow-md mx-auto"
                          />
                          <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-bold text-gray-800">{student.fullname}</h3>
                          <p className="text-xs sm:text-sm text-green-600 font-semibold mt-1">
                            {className || "Class ?"} {section ? `• Sec ${section}` : ""}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {student.student_id || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    );
                  })()
                ))}
              </div>
            </>
          )}

          {/* Student Details */}
          {selectedStudent && studentExtra && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-4 sm:p-6 text-white">
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentExtra({
                      leaves: [],
                      grades: [],
                      attendance: [],
                      notices: [],
                    });
                  }}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4 text-sm sm:text-base"
                >
                  <span>←</span>
                  <span>Back to Students</span>
                </button>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 mb-4">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start w-full">
                    <Image
                      src={selectedStudent.profile_picture || "https://i.pravatar.cc/150"}
                      alt={selectedStudent.fullname || "Student"}
                      width={120}
                      height={120}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg mx-auto sm:mx-0"
                    />
                    <div className="w-full">
                      <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center sm:text-left">{selectedStudent.fullname}</h2>
                      {(() => {
                        const classInfo = getClassInfoForStudent(selectedStudent);
                        const className = classInfo?.class_name;
                        const section = classInfo?.sec;

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div><b>Student ID:</b> {selectedStudent.student_id}</div>
                            <div><b>Class:</b> {className || "Class ?"}</div>
                            <div><b>Section:</b> {section || "-"}</div>
                            <div><b>Roll No:</b> {selectedStudent.student_id}</div>
                            <div><b>Gender:</b> {selectedStudent.gender}</div>
                            <div><b>DOB:</b> {selectedStudent.date_of_birth}</div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {(() => {
                    const stats = calculateStudentStats(studentExtra);
                    return (
                      <>
                        <div className="bg-green-50 p-3 sm:p-4 rounded-xl text-center">
                          <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.attendancePercentage}%</div>
                          <div className="text-xs sm:text-sm text-gray-600">Attendance</div>
                        </div>
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-xl text-center">
                          <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalGrades}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Grades</div>
                        </div>
                        <div className="bg-orange-50 p-3 sm:p-4 rounded-xl text-center">
                          <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.totalLeaves}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Leaves</div>
                        </div>
                        <div className="bg-purple-50 p-3 sm:p-4 rounded-xl text-center">
                          <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.averageGrade}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Avg Grade</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Detailed Information */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Personal Information */}
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">👤 Personal Information</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Full Name:</span>
                        <span className="font-semibold">{selectedStudent.fullname}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="font-semibold">{selectedStudent.date_of_birth}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-semibold">{selectedStudent.gender}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Nationality:</span>
                        <span className="font-semibold">{selectedStudent.nationality}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Religion:</span>
                        <span className="font-semibold">{selectedStudent.religion}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Blood Group:</span>
                        <span className="font-semibold">{selectedStudent.blood_group}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">📞 Contact Information</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-semibold">{selectedStudent.phone}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">email:</span>
                        <span className="font-semibold">{selectedStudent.email}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-semibold text-right">{selectedStudent.residential_address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">👨‍👩‍👧 Parent Information</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Father&apos;s Name:</span>
                        <span className="font-semibold">{selectedStudent.father_name}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Mother&apos;s Name:</span>
                        <span className="font-semibold">{selectedStudent.mother_name}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Parent email:</span>
                        <span className="font-semibold">{selectedStudent.parent}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Parent Phone:</span>
                        <span className="font-semibold">{selectedStudent.parent_phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">🚨 Emergency Contact</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Contact Name:</span>
                        <span className="font-semibold">{selectedStudent.emergency_contact_name}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Relationship:</span>
                        <span className="font-semibold">{selectedStudent.emergency_contact_relationship}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-semibold">{selectedStudent.emergency_contact_no}</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Performance */}
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl lg:col-span-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                      📊 Monthly Performance - {selectedMonth}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      {/* Attendance */}
                      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base">🗓️ Attendance</h4>
                          <input
                            type="month"
                            value={studentAttendanceMonth}
                            onChange={(e) => setStudentAttendanceMonth(e.target.value)}
                            className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-xs sm:text-sm"
                          />
                        </div>
                        {(() => {
                          const [year, month] = studentAttendanceMonth.split("-");

                          const monthlyAttendance = (studentExtra?.attendance || []).filter((a: AttendanceRecord) => {
                            const hasDate = a.date && a.date.startsWith(`${year}-${month.padStart(2, "0")}`);
                            return hasDate;
                          });

                          const present = monthlyAttendance.filter((a: AttendanceRecord) => (a.status as string) === "Present" || (a.status as string) === "present").length;
                          const absent = monthlyAttendance.filter((a: AttendanceRecord) => (a.status as string) === "Absent" || (a.status as string) === "absent").length;
                          const late = monthlyAttendance.filter((a: AttendanceRecord) => (a.status as string) === "Late" || (a.status as string) === "late").length;

                          return (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span>Total Days:</span>
                                <span className="font-semibold">{monthlyAttendance.length}</span>
                              </div>
                              <div className="flex justify-between text-green-600 text-xs sm:text-sm">
                                <span>Present:</span>
                                <span className="font-semibold">{present}</span>
                              </div>
                              <div className="flex justify-between text-red-600 text-xs sm:text-sm">
                                <span>Absent:</span>
                                <span className="font-semibold">{absent}</span>
                              </div>
                              <div className="flex justify-between text-yellow-600 text-xs sm:text-sm">
                                <span>Late:</span>
                                <span className="font-semibold">{late}</span>
                              </div>
                              {monthlyAttendance.length === 0 && (
                                <div className="text-xs text-gray-500 mt-2">
                                  No attendance records found for {studentAttendanceMonth}
                                  {studentExtra?.attendance?.length > 0 && (
                                    <span className="block mt-1">
                                      ({studentExtra.attendance.length} total records in database)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Grades */}
                      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">📈 Grades</h4>
                        {(() => {
                          // Display ALL grades (no month filtering)
                          const allGrades = studentExtra.grades || [];

                          return allGrades.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                              {allGrades.map((grade: GradeRecord) => (
                                <div
                                  key={grade.id}
                                  onClick={() => {
                                    setSelectedGrade(grade);
                                    setShowGradeDetails(true);
                                  }}
                                  className="flex justify-between items-center p-2 sm:p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                                >
                                  <div className="flex-1">
                                    <div className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800">
                                      {grade.subject_name || grade.subject || 'Unknown Subject'} - Click for details
                                    </div>
                                    {grade.date && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Date: {grade.date}
                                      </div>
                                    )}
                                  </div>
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm font-semibold">
                                    {grade.grade || 'N/A'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <p className="text-gray-500 text-xs sm:text-sm">No grades found</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Check if grades data is being fetched correctly
                              </p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Leaves */}
                      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base">📝 Leaves</h4>
                          <input
                            type="month"
                            value={studentLeaveMonth}
                            onChange={(e) => setStudentLeaveMonth(e.target.value)}
                            className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-xs sm:text-sm"
                          />
                        </div>
                        {(() => {
                          const [year, month] = studentLeaveMonth.split("-");
                          const monthlyLeaves = studentExtra.leaves.filter((l: LeaveRecord) =>
                            l.start_date && l.start_date.startsWith(`${year}-${month.padStart(2, "0")}`)
                          );



                          return monthlyLeaves.length > 0 ? (
                            <div className="space-y-2">
                              {monthlyLeaves.slice(0, 3).map((leave: LeaveRecord) => (
                                <div
                                  key={leave.id}
                                  onClick={() => {
                                    setSelectedLeave(leave);
                                    setShowLeaveDetails(true);
                                  }}
                                  className="text-xs sm:text-sm p-2 sm:p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                                >
                                  <div className="font-medium text-blue-600 hover:text-blue-800">
                                    {leave.leave_type} - Click for details
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {leave.start_date} to {leave.end_date}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Status: <span className={`font-semibold ${leave.status === 'Approved' ? 'text-green-600' :
                                      leave.status === 'Pending' ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`}>{leave.status}</span>
                                  </div>
                                </div>
                              ))}
                              {monthlyLeaves.length > 3 && (
                                <div className="text-center text-xs text-gray-500 mt-2">
                                  +{monthlyLeaves.length - 3} more leaves
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-xs sm:text-sm">No leaves this month</p>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Recent Notices */}
                  {studentExtra.notices && studentExtra.notices.length > 0 && (
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-xl lg:col-span-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">📢 Recent Notices</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {studentExtra.notices.slice(0, 4).map((notice: Notice) => (
                          <div key={notice.id} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{notice.title}</h4>
                              {notice.important && (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                                  Important
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{notice.message}</p>
                            <div className="text-xs text-gray-500">
                              By: {notice.notice_by} • {new Date(notice.posted_date || '').toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Grade Details Modal */}
          {showGradeDetails && selectedGrade && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-4 sm:p-6 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl sm:text-2xl font-bold">📈 Grade Details</h2>
                    <button
                      onClick={() => {
                        setShowGradeDetails(false);
                        setSelectedGrade(null);
                      }}
                      className="text-white/90 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Grade Information */}
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Student Name</label>
                        <div className="font-semibold text-base sm:text-lg">{selectedGrade.student_name || 'N/A'}</div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Subject</label>
                        <div className="font-semibold text-base sm:text-lg">{selectedGrade.subject_name || selectedGrade.subject || 'N/A'}</div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Teacher Name</label>
                        <div className="font-semibold text-sm sm:text-base">{selectedGrade.teacher_name || 'N/A'}</div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Exam Type</label>
                        <div className="font-semibold text-sm sm:text-base">{selectedGrade.exam_type || 'N/A'}</div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Exam Date</label>
                        <div className="font-semibold text-sm sm:text-base">{selectedGrade.exam_date || selectedGrade.date || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Score Details */}
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Marks Obtained</label>
                        <div className="font-semibold text-xl sm:text-2xl text-green-600">
                          {selectedGrade.marks_obtained || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Total Marks</label>
                        <div className="font-semibold text-xl sm:text-2xl text-blue-600">
                          {selectedGrade.total_marks || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Percentage</label>
                        <div className="font-semibold text-2xl sm:text-3xl text-purple-600">
                          {selectedGrade.percentage ? `${selectedGrade.percentage}%` : 'N/A'}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Student Email</label>
                        <div className="font-semibold text-xs sm:text-sm">{selectedGrade.student || 'N/A'}</div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Teacher Email</label>
                        <div className="font-semibold text-xs sm:text-sm">{selectedGrade.teacher || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Indicator */}
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Performance Level</span>
                      <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold ${(Number(selectedGrade.percentage || 0) >= 90) ? 'bg-green-100 text-green-800' :
                        (Number(selectedGrade.percentage || 0) >= 80) ? 'bg-blue-100 text-blue-800' :
                          (Number(selectedGrade.percentage || 0) >= 70) ? 'bg-yellow-100 text-yellow-800' :
                            (Number(selectedGrade.percentage || 0) >= 60) ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                        }`}>
                        {(Number(selectedGrade.percentage || 0) >= 90) ? 'Excellent' :
                          (Number(selectedGrade.percentage || 0) >= 80) ? 'Very Good' :
                            (Number(selectedGrade.percentage || 0) >= 70) ? 'Good' :
                              (Number(selectedGrade.percentage || 0) >= 60) ? 'Average' : 'Needs Improvement'}
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Remarks/Comments</label>
                      <div className="font-semibold text-gray-800 mt-1 text-sm">
                        {selectedGrade.remarks || 'No remarks provided'}
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs text-gray-500">
                    <div>
                      <label className="font-medium">Created:</label>
                      <div>{selectedGrade.created_at || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="font-medium">Last Updated:</label>
                      <div>{selectedGrade.updated_at || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 sm:mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setShowGradeDetails(false);
                        setSelectedGrade(null);
                      }}
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors text-sm sm:text-base"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leave Details Modal */}
          {showLeaveDetails && selectedLeave && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-2xl p-4 sm:p-6 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl sm:text-2xl font-bold">📝 Leave Details</h2>
                    <button
                      onClick={() => {
                        setShowLeaveDetails(false);
                        setSelectedLeave(null);
                      }}
                      className="text-white/90 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Leave Information */}
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Leave Type</label>
                        <div className="font-semibold text-base sm:text-lg">{selectedLeave.leave_type || 'N/A'}</div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Status</label>
                        <div className={`font-semibold text-base sm:text-lg ${selectedLeave.status === 'Approved' ? 'text-green-600' :
                          selectedLeave.status === 'Pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                          {selectedLeave.status || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Duration</label>
                        <div className="font-semibold text-sm sm:text-base">
                          {selectedLeave.start_date || 'N/A'} to {selectedLeave.end_date || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Total Days</label>
                        <div className="font-semibold text-base sm:text-lg">
                          {(() => {
                            if (selectedLeave.start_date && selectedLeave.end_date) {
                              const start = new Date(selectedLeave.start_date);
                              const end = new Date(selectedLeave.end_date);
                              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                              return `${days} days`;
                            }
                            return 'N/A';
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Applied Date</label>
                        <div className="font-semibold text-sm sm:text-base">{selectedLeave.applied_date || 'N/A'}</div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Reason</label>
                        <div className="font-semibold text-sm sm:text-base">{selectedLeave.reason || 'No reason provided'}</div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Approved By</label>
                        <div className="font-semibold text-sm sm:text-base">{selectedLeave.approved_by || 'N/A'}</div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm text-gray-600">Remarks</label>
                        <div className="font-semibold text-sm sm:text-base">{selectedLeave.remarks || 'No remarks'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 sm:mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setShowLeaveDetails(false);
                        setSelectedLeave(null);
                      }}
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors text-sm sm:text-base"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assign Class Teacher Modal */}
          {showAssignClassModal && selectedTeacher && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-4 sm:p-6 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl sm:text-2xl font-bold">🏫 Assign Class Teacher</h2>
                    <button
                      onClick={() => {
                        setShowAssignClassModal(false);
                        setSelectedClassForAssignment(null);
                        setAssignmentSuccess("");
                        setError("");
                      }}
                      className="text-white/90 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Teacher Information</h3>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Image
                          src={selectedTeacher.profile_picture || "https://i.pravatar.cc/150"}
                          alt={selectedTeacher.fullname || "Teacher"}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">{selectedTeacher.fullname}</h4>
                          <p className="text-sm text-gray-600">{selectedTeacher.email}</p>
                          <p className="text-xs text-gray-500">ID: {selectedTeacher.teacher_id}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Select Class to Assign</h3>

                    {assignmentSuccess && (
                      <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg">
                        ✅ {assignmentSuccess}
                      </div>
                    )}

                    {error && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg">
                        ❌ {error}
                      </div>
                    )}

                    {availableClasses.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="text-3xl mb-2">📚</div>
                        <p className="text-gray-500">Loading classes...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-64 overflow-y-auto pr-2">
                        {availableClasses.map((classItem: Class) => (
                          <div
                            key={classItem.id}
                            onClick={() => setSelectedClassForAssignment(classItem)}
                            className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${selectedClassForAssignment?.id === classItem.id
                              ? "border-green-500 ring-2 ring-green-200 bg-green-50"
                              : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  {classItem.class_name} - {classItem.sec}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">Class ID: {classItem.id}</p>
                                {classItem.class_teacher && (
                                  <p className="text-xs text-yellow-600 mt-1">
                                    Current Teacher: {classItem.class_teacher}
                                  </p>
                                )}
                              </div>
                              {selectedClassForAssignment?.id === classItem.id && (
                                <span className="text-green-500">✓</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowAssignClassModal(false);
                        setSelectedClassForAssignment(null);
                        setAssignmentSuccess("");
                        setError("");
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (selectedClassForAssignment) {
                          assignClassTeacher(selectedClassForAssignment.id.toString());
                        } else {
                          setError("Please select a class first");
                        }
                      }}
                      disabled={!selectedClassForAssignment || assigningClass}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {assigningClass ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Assigning...
                        </>
                      ) : (
                        "Assign as Class Teacher"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrincipalMonthlyReport;