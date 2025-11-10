"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import axios from "axios";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

const PrincipalMonthlyReport = () => {
  const [view, setView] = useState<"teachers" | "students" | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
const [selectedSubject, setSelectedSubject] = useState<any>(null);
const [filteredTimetable, setFilteredTimetable] = useState<any[]>([]);
const [allClasses, setAllClasses] = useState<any[]>([]);
const [attendanceMonth, setAttendanceMonth] = useState(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
});
const [leaveMonth, setLeaveMonth] = useState(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
});
const [studentExtra, setStudentExtra] = useState<{ 
  leaves: any[]; 
  grades: any[]; 
  attendance: any[];
  notices: any[];
}>({
  leaves: [],
  grades: [],
  attendance: [],
  notices: [],
});
const [selectedLeave, setSelectedLeave] = useState<any>(null);
const [showLeaveDetails, setShowLeaveDetails] = useState(false);
const [selectedGrade, setSelectedGrade] = useState<any>(null);
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
  leaves: any[];
  classes: any[];
  reports: any[];
  subjects: any[];
  attendance: any[];
}>({
  leaves: [],
  classes: [],
  reports: [],
  subjects: [],
  attendance: [],
});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

// ✅ Updated handleSubjectClick with debugging
const handleSubjectClick = (subject: any) => {
  setSelectedSubject(subject);
  
  console.log("🔍 Clicked Subject:", subject);
  console.log("📅 All Classes:", teacherExtra.classes);
  
  // Show sample entry to understand the data structure
  if (teacherExtra.classes.length > 0) {
    console.log("📊 Sample timetable entry:", teacherExtra.classes[0]);
  }
  
  // Filter timetable for this specific subject - check multiple possible field names
  const subjectTimetable = teacherExtra.classes.filter((entry: any) => {
    const possibleFields = [
      entry.subject_id,
      entry.subjectId, 
      entry.subject,
      entry.subject_name,
      entry.subject_code,
      entry.subject_name_id
    ];
    
    console.log("🎯 Comparing - Subject ID:", subject.id, "Entry fields:", possibleFields);
    
    return possibleFields.some(field => field === subject.id) ||
           possibleFields.some(field => field === subject.subject_name) ||
           possibleFields.some(field => field === subject.subject_code);
  });
  
  console.log("✅ Filtered Timetable:", subjectTimetable);
  setFilteredTimetable(subjectTimetable);
};

// ✅ Add debug function to show all available data
const showAllTimetableData = () => {
  console.log("🔍 All Teacher Extra Data:", teacherExtra);
  console.log("📚 All Subjects:", teacherExtra.subjects);
  console.log("🏫 All Classes:", teacherExtra.classes);
  
  // Show sample entries to understand the data structure
  if (teacherExtra.classes.length > 0) {
    console.log("📊 Sample Class Entry:", teacherExtra.classes[0]);
  }
};

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
  const calculateStudentStats = (extra: { leaves: any[]; grades: any[] }) => {
    const totalLeaves = extra.leaves.length;
    const totalGrades = extra.grades.length;
    
    // Calculate attendance percentage (assuming 30 days in month, subtract leaves)
    const attendancePercentage = Math.max(0, Math.round(((30 - totalLeaves) / 30) * 100));
    
    // Calculate average grade
    const averageGrade = totalGrades > 0 
      ? (extra.grades.reduce((sum: number, grade: any) => sum + (parseFloat(grade.grade) || 0), 0) / totalGrades).toFixed(1)
      : '0';
    
    return {
      attendancePercentage,
      totalGrades,
      totalLeaves,
      averageGrade
    };
  };

  // Calculate teacher statistics
  const calculateTeacherStats = (extra: { leaves: any[]; classes: any[]; subjects: any[]; attendance: any[] }) => {
    const totalLeaves = extra.leaves.length;
    const totalClasses = extra.classes.length;
    const totalSubjects = extra.subjects.length;
    
    // Calculate attendance from actual attendance data
    const presentDays = extra.attendance.filter((a: any) => a.status === "Present").length;
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
    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/students/`);
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  
// ✅ Try different timetable API endpoints
const fetchTeacherDetails = async (teacher: any) => {
  setSelectedTeacher(teacher);
  setLoading(true);

  try {
    // Use teacher's subject list from the teacher object
    const subjects = teacher.subject_list || [];
    const teacherSubjectIds = subjects.map((subject: any) => subject.id);
    
    console.log("🔍 Teacher Subjects:", subjects);
    console.log("🎯 Teacher Subject IDs:", teacherSubjectIds);

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

    let allTimetableEntries: any[] = [];

    for (let endpoint of endpoints) {
      try {
        console.log("🔍 Trying endpoint:", endpoint);
        const response = await axios.get(endpoint);
        const data = response.data || [];
        console.log("📊 Data from", endpoint, ":", data);
        
        if (Array.isArray(data) && data.length > 0) {
          allTimetableEntries = data;
          console.log("✅ Found data from:", endpoint);
          break;
        }
      } catch (err: any) {
        console.log("❌ Failed for endpoint:", endpoint, err?.response?.status || err);
      }
    }

    // If still no data, try to fetch all timetable entries and filter
    if (allTimetableEntries.length === 0) {
      try {
        console.log("🔍 Trying to fetch all timetable entries...");
        const allResponse = await axios.get(`${API_BASE}/timetable/`);
        const allData = allResponse.data || [];
        console.log("📊 All timetable data:", allData);
        
        if (Array.isArray(allData)) {
          // Filter by teacher email or teacher ID
          allTimetableEntries = allData.filter((entry: any) => 
            entry.teacher_email === teacher.email || 
            entry.teacher_id === teacher.teacher_id ||
            entry.teacher === teacher.teacher_id
          );
          console.log("🎯 Filtered by teacher:", allTimetableEntries);
        }
      } catch (err) {
        console.log("❌ Failed to fetch all timetable:", err);
      }
    }

    // Final filtering by subject IDs - check multiple possible field names
    const classes = allTimetableEntries.filter((entry: any) => {
      const possibleFields = [
        entry.subject_id,
        entry.subjectId, 
        entry.subject,
        entry.subject_name,
        entry.subject_code,
        entry.subject_name_id
      ];
      
      const matches = possibleFields.some(field => 
        teacherSubjectIds.includes(field)
      );
      
      if (matches) {
        console.log("✅ Matched entry:", entry);
      }
      return matches;
    });

    console.log("🎯 Final filtered classes:", classes);

    // Fetch leaves and attendance for the specific teacher
    let leaves: any[] = [];
    let attendance: any[] = [];

    try {
      // Fetch leaves with month/year filter
      const [leaveYear, leaveMonthNum] = leaveMonth.split("-");
      const leavesResponse = await axios.get(
        `${API_BASE}/leaves/?email=${teacher.email}&year=${leaveYear}&month=${leaveMonthNum}`
      );
      leaves = leavesResponse.data || [];
    } catch (err) {
      console.log("❌ Failed to fetch leaves:", err);
    }

    // Try multiple attendance endpoints for teachers with month/year filter
    const [attendanceYear, attendanceMonthNum] = attendanceMonth.split("-");
    const attendanceEndpoints = [
      `${API_BASE}/attendance/?teacher_email=${teacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
      `${API_BASE}/attendance/?teacher=${teacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
      `${API_BASE}/attendance/?email=${teacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
      `${API_BASE}/teacher-attendance/?email=${teacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
      `${API_BASE}/staff-attendance/?email=${teacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
    ];

    for (let endpoint of attendanceEndpoints) {
      try {
        console.log("🔍 Trying attendance endpoint:", endpoint);
        const attendanceResponse = await axios.get(endpoint);
        const data = attendanceResponse.data || [];
        console.log("📊 Attendance data from", endpoint, ":", data);
        
        if (Array.isArray(data) && data.length > 0) {
          // Check if this is teacher data (should have teacher fields, not student fields)
          const hasTeacherData = data.some((record: any) => 
            record.teacher_email || record.teacher_name || !record.student_email
          );
          
          if (hasTeacherData) {
            attendance = data;
            console.log("✅ Found teacher attendance data from:", endpoint);
            break;
          } else {
            console.log("⚠️ This endpoint returns student data, not teacher data");
          }
        }
      } catch (err: any) {
        console.log("❌ Failed for attendance endpoint:", endpoint, err?.response?.status || err);
      }
    }

    console.log("📝 Final Teacher Leaves:", leaves);
    console.log("📊 Final Teacher Attendance:", attendance);

    setTeacherExtra({
      leaves: leaves,
      subjects: subjects,
      classes: classes,
      reports: [],
      attendance: attendance,
    });
  } catch (err) {
    console.error("❌ Error in fetchTeacherDetails:", err);
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

// Refresh attendance data when month/year changes
const refreshAttendanceData = async () => {
  if (!selectedTeacher) return;
  
  try {
    const [attendanceYear, attendanceMonthNum] = attendanceMonth.split("-");
    const attendanceEndpoints = [
      `${API_BASE}/attendance/?teacher_email=${selectedTeacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
      `${API_BASE}/attendance/?teacher=${selectedTeacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
      `${API_BASE}/attendance/?email=${selectedTeacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
      `${API_BASE}/teacher-attendance/?email=${selectedTeacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
      `${API_BASE}/staff-attendance/?email=${selectedTeacher.email}&year=${attendanceYear}&month=${attendanceMonthNum}`,
    ];

    let attendance: any[] = [];
    for (let endpoint of attendanceEndpoints) {
      try {
        const response = await axios.get(endpoint);
        const data = response.data || [];
        
        if (Array.isArray(data) && data.length > 0) {
          const hasTeacherData = data.some((record: any) => 
            record.teacher_email || record.teacher_name || !record.student_email
          );
          
          if (hasTeacherData) {
            attendance = data;
            break;
          }
        }
      } catch (err) {
        console.log("Failed attendance endpoint:", endpoint);
      }
    }

    setTeacherExtra(prev => ({ ...prev, attendance }));
  } catch (err) {
    console.error("Error refreshing attendance:", err);
  }
};

// Refresh leaves data when month/year changes
const refreshLeavesData = async () => {
  if (!selectedTeacher) return;
  
  try {
    const [leaveYear, leaveMonthNum] = leaveMonth.split("-");
    const response = await axios.get(
      `${API_BASE}/leaves/?email=${selectedTeacher.email}&year=${leaveYear}&month=${leaveMonthNum}`
    );
    const leaves = response.data || [];
    
    setTeacherExtra(prev => ({ ...prev, leaves }));
  } catch (err) {
    console.error("Error refreshing leaves:", err);
  }
};

// Refresh data when month/year changes
useEffect(() => {
  if (selectedTeacher) {
    refreshAttendanceData();
  }
}, [attendanceMonth]);

useEffect(() => {
  if (selectedTeacher) {
    refreshLeavesData();
  }
}, [leaveMonth]);

// Refresh student attendance data when month changes
useEffect(() => {
  if (selectedStudent) {
    refreshStudentAttendanceData();
  }
}, [studentAttendanceMonth]);

// Refresh student leaves data when month changes
useEffect(() => {
  if (selectedStudent) {
    refreshStudentLeavesData();
  }
}, [studentLeaveMonth]);

const refreshStudentAttendanceData = async () => {
  if (!selectedStudent) return;
  
  const [year, month] = studentAttendanceMonth.split("-");
  let attendance: any[] = [];

  try {
    console.log("🔄 Refreshing student attendance data for:", studentAttendanceMonth);
    
    // Try attendance endpoints with new month
    try {
      console.log("🔍 Trying primary attendance endpoint:", `${API_BASE}/attendance/?student_email=${selectedStudent.email}&year=${year}&month=${month}`);
      const attendanceResponse = await axios.get(`${API_BASE}/attendance/?student_email=${selectedStudent.email}&year=${year}&month=${month}`);
      const rawAttendance = attendanceResponse.data || [];
      
      // Filter client-side
      attendance = rawAttendance.filter((record: any) => 
        record.student_email === selectedStudent.email ||
        record.email === selectedStudent.email ||
        record.student_id === selectedStudent.email
      );
      
      console.log("✅ Updated student attendance:", attendance);
    } catch (err: any) {
      console.log("❌ Primary attendance failed, trying alternatives");
      try {
        const attendanceResponse = await axios.get(`${API_BASE}/attendance/?student_email=${selectedStudent.email}`);
        const rawAttendance = attendanceResponse.data || [];
        
        attendance = rawAttendance.filter((record: any) => 
          record.student_email === selectedStudent.email ||
          record.email === selectedStudent.email ||
          record.student_id === selectedStudent.email
        );
      } catch (err2: any) {
        console.log("❌ All attendance endpoints failed");
      }
    }

    // Update state with new attendance data
    setStudentExtra(prev => ({
      ...prev,
      attendance: attendance,
    }));
    
  } catch (err) {
    console.error("Error refreshing student attendance:", err);
  }
};

const refreshStudentLeavesData = async () => {
  if (!selectedStudent) return;
  
  const [year, month] = studentLeaveMonth.split("-");
  let leaves: any[] = [];

  try {
    console.log("🔄 Refreshing student leaves data for:", studentLeaveMonth);
    
    // Try leaves endpoints with new month
    try {
      console.log("🔍 Trying primary leaves endpoint:", `${API_BASE}/leaves/?applicant_email=${selectedStudent.email}&year=${year}&month=${month}`);
      const leavesResponse = await axios.get(`${API_BASE}/leaves/?applicant_email=${selectedStudent.email}&year=${year}&month=${month}`);
      const rawLeaves = leavesResponse.data || [];
      
      // Filter client-side
      leaves = rawLeaves.filter((leave: any) => 
        leave.applicant_email === selectedStudent.email ||
        leave.email === selectedStudent.email ||
        leave.student_email === selectedStudent.email
      );
      
      console.log("✅ Updated student leaves:", leaves);
    } catch (err: any) {
      console.log("❌ Primary leaves failed, trying alternatives");
      try {
        const leavesResponse = await axios.get(`${API_BASE}/leaves/?applicant_email=${selectedStudent.email}`);
        const rawLeaves = leavesResponse.data || [];
        
        leaves = rawLeaves.filter((leave: any) => 
          leave.applicant_email === selectedStudent.email ||
          leave.email === selectedStudent.email ||
          leave.student_email === selectedStudent.email
        );
      } catch (err2: any) {
        console.log("❌ All leaves endpoints failed");
      }
    }

    // Update state with new leaves data
    setStudentExtra(prev => ({
      ...prev,
      leaves: leaves,
    }));
    
  } catch (err) {
    console.error("Error refreshing student leaves:", err);
  }
};

const fetchClasses = async (subjectId: number) => {
  try {
    const res = await axios.get(`${API_BASE}/classes?subject_id=${subjectId}`);
    console.log('All Classes:', res.data);
    setAllClasses(res.data); // Make sure this state exists
  } catch (err) {
    console.error('Error fetching classes:', err);
  }
};


  // Fetch student details
  const fetchStudentDetails = async (student: any) => {
    setSelectedStudent(student);
    setLoading(true);
    
    const [year, month] = selectedMonth.split("-");
    
    try {
      // Try multiple endpoint variations for each API
      let leaves: any[] = [];
      let grades: any[] = [];
      let attendance: any[] = [];
      let fees: any[] = [];

      // Try leaves endpoints
      try {
        console.log("🔍 Trying primary leaves endpoint:", `${API_BASE}/leaves/?applicant_email=${student.email}&year=${year}&month=${month}`);
        const leavesResponse = await axios.get(`${API_BASE}/leaves/?applicant_email=${student.email}&year=${year}&month=${month}`);
        const rawLeaves = leavesResponse.data || [];
        console.log("📊 Raw leaves data from primary endpoint:", rawLeaves);
        
        // Always filter client-side to ensure we only get student's leaves
        leaves = rawLeaves.filter((leave: any) => {
          const matches = leave.applicant_email === student.email ||
                         leave.email === student.email ||
                         leave.student_email === student.email ||
                         leave.student_id === student.email;
          
          if (matches) {
            console.log("✅ Matched leave record:", leave);
          }
          return matches;
        });
        
        console.log("🎯 Filtered leaves for student", student.email, ":", leaves);
        
      } catch (err: any) {
        console.log("❌ Leaves API failed, trying alternatives:", err?.response?.status);
        try {
          console.log("🔍 Trying alternative leaves endpoint:", `${API_BASE}/leaves/?applicant_email=${student.email}`);
          const leavesResponse = await axios.get(`${API_BASE}/leaves/?applicant_email=${student.email}`);
          const rawLeaves = leavesResponse.data || [];
          console.log("📊 Raw leaves data from alternative endpoint:", rawLeaves);
          
          // Filter client-side
          leaves = rawLeaves.filter((leave: any) => 
            leave.applicant_email === student.email ||
            leave.email === student.email ||
            leave.student_email === student.email ||
            leave.student_id === student.email
          );
          
          console.log("🎯 Filtered leaves from alternative:", leaves);
          
        } catch (err2: any) {
          console.log("❌ Alternative leaves API also failed");
          // Try fetching all leaves and filter client-side
          try {
            console.log("🔍 Trying all leaves endpoint for client-side filtering");
            const allLeavesResponse = await axios.get(`${API_BASE}/leaves/`);
            const allLeaves = allLeavesResponse.data || [];
            console.log("📊 Raw leaves data from all endpoint:", allLeaves);
            console.log("👤 Looking for student email:", student.email);
            
            // Filter by applicant_email with detailed logging
            const filteredLeaves = allLeaves.filter((leave: any) => {
              const matches = leave.applicant_email === student.email ||
                             leave.email === student.email ||
                             leave.student_email === student.email ||
                             leave.student_id === student.email;
              
              if (matches) {
                console.log("✅ Found matching leave:", leave);
              }
              return matches;
            });
            
            if (filteredLeaves.length > 0) {
              leaves = filteredLeaves;
              console.log("✅ Found leaves via client-side filtering:", filteredLeaves);
            } else {
              console.log("⚠️ No leaves found for student:", student.email);
              // Show sample of available leaves for debugging
              console.log("📝 Sample available leaves (first 3):", allLeaves.slice(0, 3));
            }
          } catch (err3: any) {
            console.log("❌ All leaves endpoint also failed:", err3?.response?.status);
          }
        }
      }

      // Try grades endpoints
      try {
        console.log("🔍 Trying primary grades endpoint:", `${API_BASE}/grades/?student=${student.email}&year=${year}&month=${month}`);
        console.log("👤 Student email being searched:", student.email);
        console.log("📅 Year/Month being searched:", year, month);
        
        const gradesResponse = await axios.get(`${API_BASE}/grades/?student=${student.email}&year=${year}&month=${month}`);
        const rawGrades = gradesResponse.data || [];
        console.log("📊 Raw grades data from primary endpoint:");
        console.log("  - Type:", typeof rawGrades);
        console.log("  - Length:", rawGrades.length);
        console.log("  - Data:", rawGrades);
        
        if (rawGrades.length > 0) {
          console.log("🔍 Sample grades record structure:");
          console.log("  - First record keys:", Object.keys(rawGrades[0] || {}));
          console.log("  - First record:", rawGrades[0]);
        }
        
        // Always filter client-side to ensure we only get student's grades
        grades = rawGrades.filter((record: any) => {
          console.log("🔍 Checking grades record:", record);
          
          const matches = record.student === student.email ||
                         record.student_email === student.email ||
                         record.email === student.email ||
                         record.student_id === student.email ||
                         record.studentid === student.email;
          
          console.log("🎯 Matching check:");
          console.log("  - record.student:", record.student, "==", student.email, ":", record.student === student.email);
          console.log("  - record.student_email:", record.student_email, "==", student.email, ":", record.student_email === student.email);
          console.log("  - record.email:", record.email, "==", student.email, ":", record.email === student.email);
          console.log("  - Final match result:", matches);
          
          if (matches) {
            console.log("✅ Matched grades record:", record);
          }
          return matches;
        });
        
        console.log("🎯 Filtered grades for student", student.email, ":", grades);
        console.log("📈 Grades summary:");
        console.log("  - Total records:", grades.length);
        if (grades.length > 0) {
          console.log("  - Subjects:", grades.map((g: any) => g.subject_name || g.subject || 'Unknown'));
        }
        
      } catch (err: any) {
        console.log("❌ Grades API failed, trying alternatives:", err?.response?.status);
        console.log("❌ Error details:", err);
        
        const gradeEndpoints = [
          `${API_BASE}/grades/?student=${student.email}&year=${year}&month=${month}`,
          `${API_BASE}/grades/?student=${student.email}`,
          `${API_BASE}/grades/?student_email=${student.email}&year=${year}&month=${month}`,
          `${API_BASE}/grades/?student_id=${student.email}&year=${year}&month=${month}`,
          `${API_BASE}/grades/?email=${student.email}&year=${year}&month=${month}`,
          `${API_BASE}/grades/`,
        ];
        
        for (let endpoint of gradeEndpoints) {
          try {
            console.log("🔍 Trying grades endpoint:", endpoint);
            const gradesResponse = await axios.get(endpoint);
            const data = gradesResponse.data || [];
            console.log("📊 Raw grades data from", endpoint, ":", data);
            
            if (Array.isArray(data) && data.length > 0) {
              // If we got all grades, filter by student email
              const filteredGrades = endpoint.includes('?') 
                ? data.filter((grade: any) => {
                    const matches = grade.student === student.email ||
                                   grade.student_email === student.email ||
                                   grade.email === student.email ||
                                   grade.student_id === student.email;
                    
                    if (matches) {
                      console.log("✅ Matched grade record:", grade);
                    }
                    return matches;
                  })
                : data.filter((grade: any) => {
                    const matches = grade.student === student.email ||
                                   grade.student_email === student.email ||
                                   grade.email === student.email ||
                                   grade.student_id === student.email;
                    
                    if (matches) {
                      console.log("✅ Matched grade record:", grade);
                    }
                    return matches;
                  });
              
              if (filteredGrades.length > 0) {
                grades = filteredGrades;
                console.log("✅ Found grades data from:", endpoint, "- Filtered:", filteredGrades);
                break;
              } else {
                console.log("⚠️ Data found but no matching student records for:", endpoint);
                console.log("🔍 Available student fields in sample:");
                data.slice(0, 3).forEach((record: any, index: number) => {
                  console.log(`  - Record ${index + 1}:`, {
                    student: record.student,
                    student_email: record.student_email,
                    email: record.email,
                    student_id: record.student_id
                  });
                });
              }
            }
          } catch (err: any) {
            console.log("❌ Failed grades endpoint:", endpoint, "- Status:", err?.response?.status);
          }
        }
      }

      // Try attendance endpoints
      try {
        console.log("🔍 Trying primary attendance endpoint:", `${API_BASE}/attendance/?student_email=${student.email}&year=${year}&month=${month}`);
        console.log("👤 Student email being searched:", student.email);
        console.log("📅 Year/Month being searched:", year, month);
        
        const attendanceResponse = await axios.get(`${API_BASE}/attendance/`);
        const rawAttendance = attendanceResponse.data || [];
        console.log("📊 Raw attendance data from primary endpoint:");
        console.log("  - Type:", typeof rawAttendance);
        console.log("  - Length:", rawAttendance.length);
        console.log("  - Data:", rawAttendance);
        
        if (rawAttendance.length > 0) {
          console.log("🔍 Sample attendance record structure:");
          console.log("  - First record keys:", Object.keys(rawAttendance[0] || {}));
          console.log("  - First record:", rawAttendance[0]);
        }
        
        // Always filter client-side to ensure we only get student's attendance
        attendance = rawAttendance.filter((record: any) => {
          console.log("🔍 Checking attendance record:", record);
          
          // Extract clean email from student_email field (remove "(Student) - Approved" etc.)
          const cleanStudentEmail = record.student_email ? record.student_email.split(' (')[0] : null;
          const cleanEmail = record.email ? record.email.split(' (')[0] : null;
          
          console.log("🎯 Matching check:");
          console.log("  - Original student_email:", record.student_email);
          console.log("  - Clean student_email:", cleanStudentEmail);
          console.log("  - Looking for:", student.email);
          
          const matches = cleanStudentEmail === student.email ||
                         record.student_email === student.email ||
                         cleanEmail === student.email ||
                         record.email === student.email ||
                         record.student_id === student.email ||
                         record.studentid === student.email ||
                         record.user_email === student.email;
          
          console.log("  - cleanStudentEmail === student.email:", cleanStudentEmail, "==", student.email, ":", cleanStudentEmail === student.email);
          console.log("  - record.student_email === student.email:", record.student_email, "==", student.email, ":", record.student_email === student.email);
          console.log("  - Final match result:", matches);
          
          if (matches) {
            console.log("✅ Matched attendance record:", record);
          }
          return matches;
        });
        
        console.log("🎯 Filtered attendance for student", student.email, ":", attendance);
        console.log("📈 Attendance summary:");
        console.log("  - Total records:", attendance.length);
        if (attendance.length > 0) {
          const present = attendance.filter((a: any) => a.status === "Present").length;
          const absent = attendance.filter((a: any) => a.status === "Absent").length;
          const late = attendance.filter((a: any) => a.status === "Late").length;
          console.log("  - Present:", present);
          console.log("  - Absent:", absent);
          console.log("  - Late:", late);
        }
        
      } catch (err: any) {
        console.log("❌ Attendance API failed, trying alternatives:", err?.response?.status);
        console.log("❌ Error details:", err);
        
        try {
          console.log("🔍 Trying alternative attendance endpoint:", `${API_BASE}/attendance/?student_email=${student.email}`);
          const attendanceResponse = await axios.get(`${API_BASE}/attendance/?student_email=${student.email}`);
          const rawAttendance = attendanceResponse.data || [];
          console.log("📊 Raw attendance data from alternative endpoint:", rawAttendance);
          
          // Filter client-side with clean email extraction
          attendance = rawAttendance.filter((record: any) => {
            const cleanStudentEmail = record.student_email ? record.student_email.split(' (')[0] : null;
            return cleanStudentEmail === student.email ||
                   record.student_email === student.email ||
                   record.email === student.email ||
                   record.student_id === student.email;
          });
          
          console.log("🎯 Filtered attendance from alternative:", attendance);
          
        } catch (err2: any) {
          console.log("❌ Alternative attendance API also failed");
          // Try fetching all attendance and filter client-side
          try {
            console.log("🔍 Trying all attendance endpoint for client-side filtering");
            const allAttendanceResponse = await axios.get(`${API_BASE}/attendance/`);
            const allAttendance = allAttendanceResponse.data || [];
            console.log("📊 Raw attendance data from all endpoint:");
            console.log("  - Total records in DB:", allAttendance.length);
            console.log("  - Sample records:", allAttendance.slice(0, 3));
            console.log("👤 Looking for student email:", student.email);
            
            // Filter by student_email with detailed logging and clean email extraction
            const filteredAttendance = allAttendance.filter((record: any) => {
              console.log("🔍 Checking record:", record);
              const cleanStudentEmail = record.student_email ? record.student_email.split(' (')[0] : null;
              
              const matches = cleanStudentEmail === student.email ||
                             record.student_email === student.email ||
                             record.email === student.email ||
                             record.student_id === student.email;
              
              if (matches) {
                console.log("✅ Found matching attendance record:", record);
              }
              return matches;
            });
            
            if (filteredAttendance.length > 0) {
              attendance = filteredAttendance;
              console.log("✅ Found attendance via client-side filtering:", filteredAttendance);
            } else {
              console.log("⚠️ No attendance found for student:", student.email);
              // Show sample of available attendance for debugging
              console.log("📝 Sample available attendance (first 3):", allAttendance.slice(0, 3));
              console.log("🔍 Available student emails in sample:");
              allAttendance.slice(0, 3).forEach((record: any, index: number) => {
                const cleanStudentEmail = record.student_email ? record.student_email.split(' (')[0] : null;
                console.log(`  - Record ${index + 1}:`, {
                  original: record.student_email,
                  cleaned: cleanStudentEmail,
                  email: record.email,
                  student_id: record.student_id
                });
              });
            }
          } catch (err3: any) {
            console.log("❌ All attendance endpoint also failed:", err3?.response?.status);
          }
        }
      }

      console.log("📊 Final Student Data:");
      console.log("  - Leaves:", leaves);
      console.log("  - Grades:", grades);
      console.log("  - Attendance:", attendance);

      setStudentExtra({
        leaves: leaves,
        grades: grades, // Store grades data from API
        attendance: attendance, // Store attendance data
        notices: [], // Initialize notices as empty array
      });
    } catch (err) {
      console.error("Error fetching student details:", err);
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

  return (
    <DashboardLayout role="principal">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Principal Monthly Report
              </h1>
              <button
                onClick={refreshData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                {loading ? "Refreshing..." : "🔄 Refresh"}
              </button>
            </div>
            <p className="text-gray-600 text-lg">
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
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                view === "teachers"
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
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                view === "students"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teachers.map((teacher) => (
               // ✅ In your teachers grid - make sure onClick passes the full teacher object
<div
  key={teacher.teacher_id}
  onClick={() => fetchTeacherDetails(teacher)} // Pass full teacher object
  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-200"
>
                  <div className="p-6 text-center">
                    <img
                      src={teacher.profile_picture || "https://i.pravatar.cc/150"}
                      alt={teacher.fullname}
                      className="w-20 h-20 rounded-full border-4 border-blue-100 shadow-md mx-auto"
                    />
                    <h3 className="mt-4 text-lg font-bold text-gray-800">{teacher.fullname}</h3>
                    <p className="text-sm text-blue-600 font-medium">{teacher.department_name}</p>
                    <p className="text-xs text-gray-500 mt-1">{teacher.qualification}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Teacher Details */}
          {selectedTeacher && teacherExtra && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-6 text-white">
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
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4"
                >
                  <span>←</span>
                  <span>Back to Teachers</span>
                </button>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <img
                    src={selectedTeacher.profile_picture || "https://i.pravatar.cc/150"}
                    alt={selectedTeacher.fullname}
                    className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg"
                  />
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">{selectedTeacher.fullname}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div><b>Teacher ID:</b> {selectedTeacher.teacher_id}</div>
                      <div><b>Department:</b> {selectedTeacher.department_name}</div>
                      <div><b>Qualification:</b> {selectedTeacher.qualification}</div>
                      <div><b>Experience:</b> {selectedTeacher.experience_years} years</div>
                      <div><b>Phone:</b> {selectedTeacher.phone}</div>
                      <div><b>email:</b> {selectedTeacher.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Stats Cards */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const stats = calculateTeacherStats(teacherExtra);
                    return (
                      <>
                        <div className="bg-green-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.attendancePercentage}%</div>
                          <div className="text-sm text-gray-600">Attendance</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.totalClasses}</div>
                          <div className="text-sm text-gray-600">Classes</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-purple-600">{stats.totalSubjects}</div>
                          <div className="text-sm text-gray-600">Subjects</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-orange-600">{stats.totalLeaves}</div>
                          <div className="text-sm text-gray-600">Leaves</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Detailed Information */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Subjects */}
                  {/* Subjects */}
<div className="bg-gray-50 p-6 rounded-xl">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
      📚 Subjects Taught
    </h3>
    <button
      onClick={showAllTimetableData}
      className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors"
    >
      🔍 Debug Data
    </button>
  </div>
  <div className="space-y-3">
    {teacherExtra.subjects.map((sub: any) => (
      <div 
        key={sub.id} 
        onClick={() => handleSubjectClick(sub)}
        className={`bg-white p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
          selectedSubject?.id === sub.id 
            ? "border-blue-500 ring-2 ring-blue-300 bg-blue-50" 
            : "border-gray-200 hover:border-blue-300"
        }`}
      >
        <div className="font-semibold text-gray-800">{sub.subject_name}</div>
        <div className="text-sm text-gray-600">Code: {sub.subject_code}</div>
        <div className="text-sm text-gray-600">ID: {sub.id}</div>
      </div>
    ))}
  </div>
  
  {/* Debug Info */}
  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
    <p className="text-xs text-yellow-800">
      <strong>Debug:</strong> Total Subjects: {teacherExtra.subjects.length} | 
      Total Classes: {teacherExtra.classes.length}
    </p>
  </div>
</div>

  {/* Timetable for Selected Subject */}
{selectedSubject && (
  <div className="bg-gray-50 p-6 rounded-xl lg:col-span-2">
    <h3 className="text-xl font-bold text-gray-800 mb-4">
      🕒 Timetable for {selectedSubject.subject_name}
    </h3>
    
    {/* Debug info - remove after it works */}
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
      <p className="text-sm text-yellow-800">
        <strong>Debug Info:</strong> Selected Subject ID: {selectedSubject.id} | 
        Filtered Entries: {filteredTimetable.length}
      </p>
    </div>
    
    {filteredTimetable.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTimetable.map((entry: any, index: number) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">{entry.class_name}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div><strong>Section:</strong> {entry.section}</div>
              <div><strong>Day:</strong> {entry.day_of_week}</div>
              <div><strong>Time:</strong> {entry.start_time} - {entry.end_time}</div>
              {entry.room_number && <div><strong>Room:</strong> {entry.room_number}</div>}
              {/* Debug info */}
              <div className="mt-2 text-xs text-gray-400">
                Subject ID: {entry.subject_id} | Entry ID: {entry.id}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📅</div>
        <p className="text-gray-500">No timetable entries found for this subject.</p>
        <p className="text-sm text-gray-400 mt-2">
          Subject ID: {selectedSubject.id} | No matching entries in timetable
        </p>
      </div>
    )}
  </div>
)}

                  {/* Attendance Summary */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        🗓️ Monthly Attendance
                      </h3>
                      <input
                        type="month"
                        value={attendanceMonth}
                        onChange={(e) => setAttendanceMonth(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {(() => {
                      const attendanceData = teacherExtra.attendance || [];
                      const present = attendanceData.filter((a: any) => a.status === "Present").length;
                      const absent = attendanceData.filter((a: any) => a.status === "Absent").length;
                      const late = attendanceData.filter((a: any) => a.status === "Late").length;
                      const total = attendanceData.length;
                      
                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Total Days:</span>
                            <span className="font-semibold">{total}</span>
                          </div>
                          <div className="flex justify-between items-center text-green-600">
                            <span>Present:</span>
                            <span className="font-semibold">{present}</span>
                          </div>
                          <div className="flex justify-between items-center text-red-600">
                            <span>Absent:</span>
                            <span className="font-semibold">{absent}</span>
                          </div>
                          <div className="flex justify-between items-center text-yellow-600">
                            <span>Late:</span>
                            <span className="font-semibold">{late}</span>
                          </div>
                          <div className="flex justify-between items-center text-blue-600 font-semibold">
                            <span>Attendance Rate:</span>
                            <span>{total > 0 ? Math.round((present / total) * 100) : 0}%</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Leaves Summary */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        📝 Leave History
                      </h3>
                      <input
                        type="month"
                        value={leaveMonth}
                        onChange={(e) => setLeaveMonth(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-green-600">
                        <span>Approved Leaves:</span>
                        <span className="font-semibold">
                          {teacherExtra.leaves.filter((l: any) => l.status === "Approved").length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-yellow-600">
                        <span>Pending Leaves:</span>
                        <span className="font-semibold">
                          {teacherExtra.leaves.filter((l: any) => l.status === "Pending").length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-red-600">
                        <span>Rejected Leaves:</span>
                        <span className="font-semibold">
                          {teacherExtra.leaves.filter((l: any) => l.status === "Rejected").length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          

          {/* Students Grid */}
          {view === "students" && !selectedStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {students.map((student, index) => (
                <div
                  key={student.id || index}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-200"
                  onClick={() => fetchStudentDetails(student)}
                >
                  <div className="p-6 text-center">
                    <img
                      src={student.profile_picture || "https://i.pravatar.cc/150"}
                      alt={student.fullname}
                      className="w-20 h-20 rounded-full border-4 border-green-100 shadow-md mx-auto"
                    />
                    <h3 className="mt-4 text-lg font-bold text-gray-800">{student.fullname}</h3>
                    <p className="text-sm text-green-600 font-medium">
                      {student.class_name} - {student.section}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Student Details */}
          {selectedStudent && studentExtra && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-6 text-white">
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
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4"
                >
                  <span>←</span>
                  <span>Back to Students</span>
                </button>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <img
                      src={selectedStudent.profile_picture || "https://i.pravatar.cc/150"}
                      alt={selectedStudent.fullname}
                      className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg"
                    />
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedStudent.fullname}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div><b>Student ID:</b> {selectedStudent.student_id}</div>
                        <div><b>Class:</b> {selectedStudent.class_name}</div>
                        <div><b>Section:</b> {selectedStudent.section}</div>
                        <div><b>Roll No:</b> {selectedStudent.roll_number}</div>
                        <div><b>Gender:</b> {selectedStudent.gender}</div>
                        <div><b>DOB:</b> {selectedStudent.date_of_birth}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const stats = calculateStudentStats(studentExtra);
                    return (
                      <>
                        <div className="bg-green-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.attendancePercentage}%</div>
                          <div className="text-sm text-gray-600">Attendance</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.totalGrades}</div>
                          <div className="text-sm text-gray-600">Grades</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-orange-600">{stats.totalLeaves}</div>
                          <div className="text-sm text-gray-600">Leaves</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-purple-600">{stats.averageGrade}</div>
                          <div className="text-sm text-gray-600">Avg Grade</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Detailed Information */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">👤 Personal Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Full Name:</span>
                        <span className="font-semibold">{selectedStudent.fullname}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="font-semibold">{selectedStudent.date_of_birth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-semibold">{selectedStudent.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nationality:</span>
                        <span className="font-semibold">{selectedStudent.nationality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Religion:</span>
                        <span className="font-semibold">{selectedStudent.religion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blood Group:</span>
                        <span className="font-semibold">{selectedStudent.blood_group}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">📞 Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-semibold">{selectedStudent.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">email:</span>
                        <span className="font-semibold">{selectedStudent.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-semibold text-right">{selectedStudent.residential_address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">👨‍👩‍👧 Parent Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Father's Name:</span>
                        <span className="font-semibold">{selectedStudent.father_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mother's Name:</span>
                        <span className="font-semibold">{selectedStudent.mother_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Parent email:</span>
                        <span className="font-semibold">{selectedStudent.parent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Parent Phone:</span>
                        <span className="font-semibold">{selectedStudent.parent_phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">🚨 Emergency Contact</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact Name:</span>
                        <span className="font-semibold">{selectedStudent.emergency_contact_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Relationship:</span>
                        <span className="font-semibold">{selectedStudent.emergency_contact_relationship}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-semibold">{selectedStudent.emergency_contact_no}</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Performance */}
                  <div className="bg-gray-50 p-6 rounded-xl lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      📊 Monthly Performance - {selectedMonth}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Attendance */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-gray-800">🗓️ Attendance</h4>
                          <input
                            type="month"
                            value={studentAttendanceMonth}
                            onChange={(e) => setStudentAttendanceMonth(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                          />
                        </div>
                        {(() => {
                          console.log("🔍 Student Extra Data:", studentExtra);
                          console.log("📊 Raw Student Attendance:", studentExtra?.attendance);
                          console.log("📊 Attendance data type:", typeof studentExtra?.attendance);
                          console.log("📊 Attendance length:", studentExtra?.attendance?.length);
                          
                          if (studentExtra?.attendance && studentExtra.attendance.length > 0) {
                            console.log("🔍 Sample attendance record structure:");
                            console.log("  - First record keys:", Object.keys(studentExtra.attendance[0] || {}));
                            console.log("  - First record:", studentExtra.attendance[0]);
                            console.log("🔍 All attendance records:");
                            studentExtra.attendance.forEach((attendance: any, index: number) => {
                              console.log(`  - Attendance ${index + 1}:`, attendance);
                            });
                          }
                          
                          const [year, month] = studentAttendanceMonth.split("-");
                          console.log("📅 Split year/month for attendance - Year:", year, "Month:", month);
                          console.log("📅 Student Attendance Month:", studentAttendanceMonth);
                          
                          const monthlyAttendance = (studentExtra?.attendance || []).filter((a: any) => {
                            console.log("🔍 Checking attendance record:", a);
                            const hasDate = a.date && a.date.startsWith(`${year}-${month.padStart(2, "0")}`);
                            console.log("  - Has date matching", `${year}-${month.padStart(2, "0")}:`, hasDate);
                            console.log("  - Record date:", a.date);
                            console.log("  - Expected prefix:", `${year}-${month.padStart(2, "0")}`);
                            return hasDate;
                          });

                          console.log("🗓️ Monthly Attendance Filtered:", monthlyAttendance);
                          console.log("📊 Attendance Filtering Summary:");
                          console.log("  - Total raw records:", studentExtra?.attendance?.length || 0);
                          console.log("  - Total filtered records:", monthlyAttendance.length);
                          
                          if (monthlyAttendance.length === 0 && studentExtra?.attendance?.length > 0) {
                            console.log("⚠️ Attendance exists but none match the selected month!");
                            console.log("🔍 Available attendance dates:");
                            studentExtra.attendance.forEach((attendance: any, index: number) => {
                              console.log(`  - Attendance ${index + 1} date:`, attendance.date);
                            });
                          }

                          const present = monthlyAttendance.filter((a: any) => a.status === "Present").length;
                          const absent = monthlyAttendance.filter((a: any) => a.status === "Absent").length;
                          const late = monthlyAttendance.filter((a: any) => a.status === "Late").length;
                          
                          console.log("✅ Student Attendance Counts - Present:", present, "Absent:", absent, "Late:", late);
                          
                          return (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Total Days:</span>
                                <span className="font-semibold">{monthlyAttendance.length}</span>
                              </div>
                              <div className="flex justify-between text-green-600">
                                <span>Present:</span>
                                <span className="font-semibold">{present}</span>
                              </div>
                              <div className="flex justify-between text-red-600">
                                <span>Absent:</span>
                                <span className="font-semibold">{absent}</span>
                              </div>
                              <div className="flex justify-between text-yellow-600">
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
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3">📈 Grades</h4>
                        {(() => {
                          console.log("🔍 Student Extra Data for Grades:", studentExtra);
                          console.log("📊 Raw Student Grades:", studentExtra?.grades);
                          console.log("📊 Grades data type:", typeof studentExtra?.grades);
                          console.log("📊 Grades length:", studentExtra?.grades?.length);
                          
                          if (studentExtra?.grades && studentExtra.grades.length > 0) {
                            console.log("🔍 Sample grades record structure:");
                            console.log("  - First record keys:", Object.keys(studentExtra.grades[0] || {}));
                            console.log("  - First record:", studentExtra.grades[0]);
                            console.log("🔍 All grades records:");
                            studentExtra.grades.forEach((grade: any, index: number) => {
                              console.log(`  - Grade ${index + 1}:`, grade);
                            });
                          }
                          
                          // Display ALL grades (no month filtering)
                          const allGrades = studentExtra.grades || [];
                          
                          console.log("📈 All Grades (No Filtering):", allGrades);
                          console.log("📈 Total Grades Count:", allGrades.length);
                          
                          return allGrades.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                              {allGrades.map((grade: any) => (
                                <div 
                                  key={grade.id} 
                                  onClick={() => {
                                    setSelectedGrade(grade);
                                    setShowGradeDetails(true);
                                  }}
                                  className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                                >
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                      {grade.subject_name || grade.subject || 'Unknown Subject'} - Click for details
                                    </div>
                                    {grade.date && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Date: {grade.date}
                                      </div>
                                    )}
                                  </div>
                                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-semibold">
                                    {grade.grade || 'N/A'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <p className="text-gray-500 text-sm">No grades found</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Check if grades data is being fetched correctly
                              </p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Leaves */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-gray-800">📝 Leaves</h4>
                          <input
                            type="month"
                            value={studentLeaveMonth}
                            onChange={(e) => setStudentLeaveMonth(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                          />
                        </div>
                        {(() => {
                          const [year, month] = studentLeaveMonth.split("-");
                          const monthlyLeaves = studentExtra.leaves.filter((l: any) =>
                            l.start_date && l.start_date.startsWith(`${year}-${month.padStart(2, "0")}`)
                          );
                          
                          console.log("📅 Student Leave Month:", studentLeaveMonth);
                          console.log("🗓️ Monthly Leaves Filtered:", monthlyLeaves);
                          
                          return monthlyLeaves.length > 0 ? (
                            <div className="space-y-2">
                              {monthlyLeaves.slice(0, 3).map((leave: any) => (
                                <div 
                                  key={leave.id} 
                                  onClick={() => {
                                    setSelectedLeave(leave);
                                    setShowLeaveDetails(true);
                                  }}
                                  className="text-sm p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                                >
                                  <div className="font-medium text-blue-600 hover:text-blue-800">
                                    {leave.leave_type} - Click for details
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {leave.start_date} to {leave.end_date}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Status: <span className={`font-semibold ${
                                      leave.status === 'Approved' ? 'text-green-600' : 
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
                            <p className="text-gray-500 text-sm">No leaves this month</p>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Recent Notices */}
                  {studentExtra.notices && studentExtra.notices.length > 0 && (
                    <div className="bg-gray-50 p-6 rounded-xl lg:col-span-2">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">📢 Recent Notices</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studentExtra.notices.slice(0, 4).map((notice: any) => (
                          <div key={notice.id} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-800">{notice.title}</h4>
                              {notice.important && (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                                  Important
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{notice.message}</p>
                            <div className="text-xs text-gray-500">
                              By: {notice.notice_by} • {new Date(notice.posted_date).toLocaleDateString()}
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
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-6 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">📈 Grade Details</h2>
                    <button
                      onClick={() => {
                        setShowGradeDetails(false);
                        setSelectedGrade(null);
                      }}
                      className="text-white/90 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grade Information */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Student Name</label>
                        <div className="font-semibold text-lg">{selectedGrade.student_name || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Subject</label>
                        <div className="font-semibold text-lg">{selectedGrade.subject_name || selectedGrade.subject || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Teacher Name</label>
                        <div className="font-semibold">{selectedGrade.teacher_name || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Exam Type</label>
                        <div className="font-semibold">{selectedGrade.exam_type || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Exam Date</label>
                        <div className="font-semibold">{selectedGrade.exam_date || selectedGrade.date || 'N/A'}</div>
                      </div>
                    </div>
                    
                    {/* Score Details */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Marks Obtained</label>
                        <div className="font-semibold text-2xl text-green-600">
                          {selectedGrade.marks_obtained || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Total Marks</label>
                        <div className="font-semibold text-2xl text-blue-600">
                          {selectedGrade.total_marks || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Percentage</label>
                        <div className="font-semibold text-3xl text-purple-600">
                          {selectedGrade.percentage ? `${selectedGrade.percentage}%` : 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Student Email</label>
                        <div className="font-semibold text-sm">{selectedGrade.student || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Teacher Email</label>
                        <div className="font-semibold text-sm">{selectedGrade.teacher || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Performance Indicator */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Performance Level</span>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        (selectedGrade.percentage >= 90) ? 'bg-green-100 text-green-800' :
                        (selectedGrade.percentage >= 80) ? 'bg-blue-100 text-blue-800' :
                        (selectedGrade.percentage >= 70) ? 'bg-yellow-100 text-yellow-800' :
                        (selectedGrade.percentage >= 60) ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {(selectedGrade.percentage >= 90) ? 'Excellent' :
                         (selectedGrade.percentage >= 80) ? 'Very Good' :
                         (selectedGrade.percentage >= 70) ? 'Good' :
                         (selectedGrade.percentage >= 60) ? 'Average' : 'Needs Improvement'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Remarks */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Remarks/Comments</label>
                      <div className="font-semibold text-gray-800 mt-1">
                        {selectedGrade.remarks || 'No remarks provided'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Timestamps */}
                  <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-gray-500">
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
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setShowGradeDetails(false);
                        setSelectedGrade(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
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
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-2xl p-6 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">📝 Leave Details</h2>
                    <button
                      onClick={() => {
                        setShowLeaveDetails(false);
                        setSelectedLeave(null);
                      }}
                      className="text-white/90 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Leave Information */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Leave Type</label>
                        <div className="font-semibold text-lg">{selectedLeave.leave_type || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Status</label>
                        <div className={`font-semibold text-lg ${
                          selectedLeave.status === 'Approved' ? 'text-green-600' : 
                          selectedLeave.status === 'Pending' ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {selectedLeave.status || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Duration</label>
                        <div className="font-semibold">
                          {selectedLeave.start_date || 'N/A'} to {selectedLeave.end_date || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Total Days</label>
                        <div className="font-semibold text-lg">
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
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Applied Date</label>
                        <div className="font-semibold">{selectedLeave.applied_date || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Reason</label>
                        <div className="font-semibold">{selectedLeave.reason || 'No reason provided'}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Approved By</label>
                        <div className="font-semibold">{selectedLeave.approved_by || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Remarks</label>
                        <div className="font-semibold">{selectedLeave.remarks || 'No remarks'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setShowLeaveDetails(false);
                        setSelectedLeave(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                    >
                      Close
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
