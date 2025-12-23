"use client";

import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Send,
  User,
  Mail,
  Book,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Download,
  Users,
  FileText,
  RefreshCw,
  Award,
  BookOpen,
  Hash,
  Home,
  Shield,
  UserCheck,
  ShieldCheck,
  MailCheck
} from "lucide-react";
import { isAuthenticated } from '@/app/utils/auth';

interface Teacher {
  id: number;
  email: string;
  is_class_teacher: boolean;
  first_name: string;
  last_name: string;
  subjects?: string[] | Subject[];
  [key: string]: unknown;
}

interface Subject {
  id: number;
  subject_name: string;
  teacher_email?: string;
  [key: string]: unknown;
}

interface Class {
  id: number;
  class_name: string;
  sec: string;
  class_teacher?: string;
  class_teacher_email?: string;
  [key: string]: unknown;
}

interface Student {
  id: number;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  full_name: string;
  class_id: number;
  section: string;
  student_section: string;
  student_id: string;
  phone?: string;
  address?: string;
  enrollment_date?: string;
  date_of_birth?: string;
  gender?: string;
  parent?: string | { email?: string };
  parent_name?: string;
  parent_phone?: string;
  blood_group?: string;
  nationality?: string;
  previous_school?: string;
  academic_year?: string;
  profile_image?: string;
  profile_picture?: string;
  image?: string;
  avatar?: string;
  [key: string]: unknown;
}

interface Grade {
  id: number;
  student: string;
  subject_name: string;
  marks_obtained: number;
  total_marks: number;
  exam_type: string;
  teacher: string;
  teacher_email?: string;
  subject_id?: number;
  [key: string]: unknown;
}

interface TimetableItem {
  id: number;
  teacher: string;
  class_id: number;
  subject?: string;
  subject_name?: string;
  subject_id?: number;
  [key: string]: string | number | boolean | undefined;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
}

export default function MarksManager() {
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
    }
  }, []);

  // Helper function to get profile image URL from student object
  const getStudentProfileImage = useCallback((student: Student): string | null => {
    if (!student) return null;

    // Check all possible image fields
    const imageSources = [
      student.profile_image,
      student.profile_picture,
      student.image,
      student.avatar
    ];

    for (const source of imageSources) {
      if (source) {
        // If it's already a full URL or data URL
        if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('data:'))) {
          return source;
        }

        // If it's a relative path, construct full URL
        if (typeof source === 'string' && source.startsWith('/')) {
          const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/', '') || '';
          return `${apiBase}${source.substring(1)}`;
        }

        // If it's just a filename, construct the full URL
        if (typeof source === 'string') {
          return `${process.env.NEXT_PUBLIC_API_BASE_URL}media/${source}`;
        }
      }
    }

    return null; // No image found
  }, []);

  // Enhanced helper function to get student profile image with fallback
  const getStudentProfileImageWithFallback = useCallback((student: Student): string | null => {
    // First try to get image from student object
    const imageUrl = getStudentProfileImage(student);
    if (imageUrl) return imageUrl;

    // If no image found, return null to trigger initials fallback
    return null;
  }, [getStudentProfileImage]);

  // Enhanced helper function to get student initials with better error handling
  const getStudentInitialsWithFallback = useCallback((student: Student): string => {
    try {
      if (!student) return 'ST';

      const firstName = student.first_name || student.name || '';
      const lastName = student.last_name || '';
      const firstInitial = firstName.charAt(0).toUpperCase();
      const lastInitial = lastName.charAt(0).toUpperCase();

      // If we have at least one initial, return it
      if (firstInitial) {
        return lastInitial ? `${firstInitial}${lastInitial}` : firstInitial;
      }

      // Fallback to email first letter if no name
      if (student.email) {
        return student.email.charAt(0).toUpperCase();
      }

      // Ultimate fallback
      return 'ST';
    } catch (error) {
      console.error('Error getting student initials:', error);
      return 'ST';
    }
  }, []);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  // basic data
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);
  const [teacherRecord, setTeacherRecord] = useState<Teacher | null>(null);

  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);  // UI state
  const [editing, setEditing] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  // const [sortConfig, _setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null); // Unused variable
  // const [selectedSection, _setSelectedSection] = useState<string | null>(null); // Unused variable
  const [showStudentDetails, setShowStudentDetails] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSectionName, setSelectedSectionName] = useState<string | null>(null);

  // reports
  const [reportType, setReportType] = useState("quarterly");
  const [showSendModal, setShowSendModal] = useState(false);
  const [modalClassId, setModalClassId] = useState<number | null>(null);
  const [modalSection, setModalSection] = useState<string | null>(null);
  const [selectedStudentsForSend, setSelectedStudentsForSend] = useState<number[]>([]);
  const [parentOverrides, setParentOverrides] = useState<Record<number, string>>({});
  const [sending, setSending] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Stats
  const [overallStats, setOverallStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    averagePercentage: 0,
    topPerformer: { name: "", percentage: 0 },
    subjectsGraded: 0
  });

  // Add notification function
  const addNotification = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();
    const newNotification = {
      id,
      title,
      message,
      type,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 5));

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // -------------------- extract teacher email --------------------
  useEffect(() => {
    try {
      const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (info?.email) {
        setTeacherEmail(info.email);
        return;
      }
      const data = JSON.parse(localStorage.getItem("userData") || "{}");
      if (data?.email) {
        setTeacherEmail(data.email);
        return;
      }
    } catch (e) {
      console.error('Error parsing localStorage data:', e);
    }
    setTeacherEmail(null);
  }, []);

  // Calculate grades for a student
  const gradesForStudent = useCallback((studentEmail: string) => {
    if (!studentEmail || !Array.isArray(grades)) return [];
    return grades.filter((g) => (g.student || "").toLowerCase() === studentEmail.toLowerCase());
  }, [grades]);

  // report filtering
  const filterByReportType = useCallback((grade: Grade) => {
    if (!grade) return false;
    const et = (grade.exam_type || "").toLowerCase();
    if (reportType === "quarterly") {
      return et === "quiz" || et === "quarterly";
    }
    if (reportType === "annual") {
      return et === "final" || et === "annual";
    }
    return true;
  }, [reportType]);

  // Calculate student average
  const calculateStudentAverage = useCallback((email: string) => {
    const studentGrades = gradesForStudent(email).filter(filterByReportType);
    if (studentGrades.length === 0) return 0;

    const totalPercentage = studentGrades.reduce((sum, grade) => {
      const percentage = (grade.marks_obtained / grade.total_marks) * 100;
      return sum + (isNaN(percentage) ? 0 : percentage);
    }, 0);

    return Math.round(totalPercentage / studentGrades.length);
  }, [gradesForStudent, filterByReportType]);

  function generateReportForStudentEmail(email: string) {
    return gradesForStudent(email).filter(filterByReportType);
  }

  // Get grade color based on percentage
  const getGradeColor = useCallback((percentage: number) => {
    if (percentage >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (percentage >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (percentage >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (percentage >= 50) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  }, []);

  // Get grade badge text
  const getGradeBadge = useCallback((percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  }, []);

  // -------------------- load all data --------------------
  useEffect(() => {
    if (!teacherEmail) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const [timetableRes, classesRes, studentsRes, gradesRes, teachersRes, subjectsRes] =
          await Promise.all([
            fetch(`${API}/timetable/`),
            fetch(`${API}/classes/`),
            fetch(`${API}/students/`),
            fetch(`${API}/grades/`),
            fetch(`${API}/teachers/`),
            fetch(`${API}/subjects/`),
          ]);

        const [tt, cl, st, gr, teachers, sub] = await Promise.all([
          timetableRes.json(),
          classesRes.json(),
          studentsRes.json(),
          gradesRes.json(),
          teachersRes.json(),
          subjectsRes.json(),
        ]);

        setTimetable(Array.isArray(tt) ? tt : []);
        setClasses(Array.isArray(cl) ? cl : []);
        setStudents(Array.isArray(st) ? st : []);
        setGrades(Array.isArray(gr) ? gr : []);
        setSubjects(Array.isArray(sub) ? sub : []);

        const record = (Array.isArray(teachers) ? teachers : []).find(
          (t) => t.email?.toLowerCase() === teacherEmail.toLowerCase()
        );
        setTeacherRecord(record || null);
        addNotification("Data Loaded", "All student marks and class data has been loaded successfully.", "success");
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        addNotification("Data Load Failed", "Failed to load data. Please refresh the page.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [teacherEmail, API, addNotification]);

  // -------------------- Get teacher's subjects from timetable --------------------
  const teacherSubjects = useMemo(() => {
    if (!Array.isArray(timetable) || !teacherEmail) return new Set<string>();
    const subjectSet = new Set<string>();

    timetable.forEach((item) => {
      if (String(item.teacher || "").toLowerCase() === teacherEmail.toLowerCase()) {
        if (item.subject_name) subjectSet.add(item.subject_name.toLowerCase());
        if (item.subject) {
          // If subject is an object, get the name
          if (typeof item.subject === 'object' && (item.subject as Subject).subject_name) {
            subjectSet.add((item.subject as Subject).subject_name.toLowerCase());
          } else if (typeof item.subject === 'string') {
            subjectSet.add(item.subject.toLowerCase());
          }
        }
      }
    });

    return subjectSet;
  }, [timetable, teacherEmail]);

  // -------------------- find classIds assigned to teacher --------------------
  const assignedClassIds = useMemo(() => {
    if (!Array.isArray(timetable) || !teacherEmail) return [];
    const matched = timetable.filter(
      (t) => String(t.teacher || "").toLowerCase() === teacherEmail.toLowerCase()
    );
    return Array.from(new Set(matched.map((m) => m.class_id))).filter(Boolean) as number[];
  }, [timetable, teacherEmail]);

  // -------------------- Get teacher's classes where they are class teacher --------------------
  const teacherClassTeacherClasses = useMemo(() => {
    if (!teacherRecord?.is_class_teacher) return new Set<number>();

    const classTeacherClasses = new Set<number>();
    classes.forEach((cls) => {
      // Check if this teacher is the class teacher for this class
      const classTeacherEmail = cls.class_teacher_email || cls.class_teacher;
      if (classTeacherEmail && classTeacherEmail.toLowerCase() === teacherEmail?.toLowerCase()) {
        classTeacherClasses.add(cls.id);
      }
    });

    return classTeacherClasses;
  }, [classes, teacherRecord, teacherEmail]);

  // -------------------- Check if teacher can edit a grade --------------------
  const canEditGrade = useCallback((grade: Grade): boolean => {
    if (!teacherEmail || !grade) return false;

    // 1. If teacher is a class teacher AND this grade is for their class
    if (teacherRecord?.is_class_teacher) {
      // Find the student for this grade
      const student = students.find(s =>
        s.email?.toLowerCase() === grade.student?.toLowerCase()
      );

      if (student) {
        // Check if this teacher is class teacher for this student's class
        const isClassTeacherForStudentClass = teacherClassTeacherClasses.has(student.class_id);
        if (isClassTeacherForStudentClass) {
          return true; // Class teacher can edit all grades in their class
        }
      }
    }

    // 2. For subject teachers (or class teachers editing grades in other classes)
    // They can only edit grades for subjects they teach

    // Check if this teacher teaches this subject
    const teachesSubject = teacherSubjects.has(grade.subject_name?.toLowerCase() || '');

    // Subject teacher can edit if they teach this subject
    return teachesSubject;
  }, [teacherEmail, teacherRecord, students, teacherClassTeacherClasses, teacherSubjects]);

  // -------------------- Check if teacher can edit a specific subject --------------------
  // const canEditSubject = useCallback((subjectName: string, classId: number): boolean => {
  //   if (!teacherEmail) return false;
  //   
  //   // 1. If teacher is a class teacher for this class, they can edit all subjects
  //   if (teacherRecord?.is_class_teacher && teacherClassTeacherClasses.has(classId)) {
  //     return true;
  //   }
  //   
  //   // 2. If teacher is a subject teacher for this subject, they can edit
  //   return teacherSubjects.has(subjectName?.toLowerCase() || '');
  // }, [teacherEmail, teacherRecord, teacherClassTeacherClasses, teacherSubjects]); // Unused function

  // -------------------- Check if teacher is class teacher for a specific class --------------------
  const isClassTeacherForClassId = useCallback((classId: number): boolean => {
    if (!teacherRecord?.is_class_teacher) return false;
    return teacherClassTeacherClasses.has(classId);
  }, [teacherRecord, teacherClassTeacherClasses]);

  // -------------------- Check if teacher is class teacher for a specific class (for display) --------------------
  const isClassTeacherForClass = useCallback((classId: number): boolean => {
    return isClassTeacherForClassId(classId);
  }, [isClassTeacherForClassId]);

  // -------------------- group students by class -> section --------------------
  const grouped = useMemo(() => {
    const map: Record<number, { classObj: Class; sections: Record<string, Student[]> }> = {};
    const idxClass: Record<number, Class> = {};

    classes.forEach((c) => {
      idxClass[c.id] = c;
      if (assignedClassIds.includes(c.id)) {
        map[c.id] = { classObj: c, sections: {} };
      }
    });

    students.forEach((s) => {
      const cid = s.class_id;
      if (!assignedClassIds.includes(cid)) return;
      if (!map[cid]) {
        map[cid] = { classObj: idxClass[cid] || { id: cid } as Class, sections: {} };
      }
      const sectionName = s.section || s.student_section || idxClass[cid]?.sec || "Default";
      if (!map[cid].sections[sectionName]) {
        map[cid].sections[sectionName] = [];
      }
      map[cid].sections[sectionName].push(s);
    });

    return map;
  }, [classes, students, assignedClassIds]);

  // Toggle section expansion for mobile
  const toggleSection = useCallback((classId: number, sectionName: string) => {
    const key = `${classId}-${sectionName}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  // Calculate overall statistics
  useEffect(() => {
    if (students.length > 0 && grades.length > 0 && Object.keys(grouped).length > 0) {
      // Filter classes based on selection
      const filteredGrouped: Record<number, { classObj: Class; sections: Record<string, Student[]> }> = {};
      if (selectedClassId) {
        Object.keys(grouped).forEach(key => {
          const classId = Number(key);
          if (classId === selectedClassId) {
            filteredGrouped[classId] = grouped[classId];
          }
        });
      } else {
        Object.assign(filteredGrouped, grouped);
      }

      // Filter sections based on selection
      let filteredSections = filteredGrouped;
      if (selectedClassId && selectedSectionName) {
        if (filteredSections[selectedClassId]) {
          filteredSections = {
            ...filteredSections,
            [selectedClassId]: {
              ...filteredSections[selectedClassId],
              sections: {
                [selectedSectionName]: filteredSections[selectedClassId].sections[selectedSectionName] || []
              }
            }
          };
        }
      }

      const totalClasses = Object.keys(filteredGrouped).length;

      // Calculate total students based on filtered data
      let totalStudents = 0;
      Object.values(filteredSections).forEach(classBlock => {
        Object.values(classBlock.sections).forEach(studentsList => {
          totalStudents += studentsList.length;
        });
      });

      // Get all students from filtered sections
      const filteredStudents: Student[] = [];
      Object.values(filteredSections).forEach(classBlock => {
        Object.values(classBlock.sections).forEach(studentsList => {
          filteredStudents.push(...studentsList);
        });
      });

      // Calculate average percentage across filtered students
      let totalPercentage = 0;
      let studentCount = 0;
      let maxPercentage = 0;
      let topPerformerName = "";
      const subjectsSet = new Set<string>();

      filteredStudents.forEach(student => {
        const studentGrades = gradesForStudent(student.email || '');
        if (studentGrades.length > 0) {
          const studentAvg = calculateStudentAverage(student.email || '');
          totalPercentage += studentAvg;
          studentCount++;

          if (studentAvg > maxPercentage) {
            maxPercentage = studentAvg;
            topPerformerName = student.name || student.first_name || student.email || "";
          }
        }

        studentGrades.forEach(grade => {
          if (grade.subject_name) {
            subjectsSet.add(grade.subject_name);
          }
        });
      });

      const averagePercentage = studentCount > 0 ? Math.round(totalPercentage / studentCount) : 0;

      setOverallStats({
        totalClasses,
        totalStudents,
        averagePercentage,
        topPerformer: {
          name: topPerformerName,
          percentage: maxPercentage
        },
        subjectsGraded: subjectsSet.size
      });
    }
  }, [students, grades, grouped, assignedClassIds, reportType, selectedClassId, selectedSectionName, calculateStudentAverage, gradesForStudent]);

  // START / CANCEL edit
  const startEdit = useCallback((grade: Grade) => {
    setEditing((p) => ({ ...p, [grade.id]: grade.marks_obtained }));
  }, []);

  const cancelEdit = useCallback((gradeId: number) => {
    setEditing((p) => {
      const copy = { ...p };
      delete copy[gradeId];
      return copy;
    });
  }, []);

  // save using PATCH
  const saveEdit = useCallback(async (grade: Grade) => {
    const id = grade.id;
    const newMarks = editing[id];

    // Check if teacher can edit this grade
    if (!canEditGrade(grade)) {
      addNotification("Permission Denied", "You don't have permission to edit this grade.", "error");
      cancelEdit(id);
      return;
    }

    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(`${API}/grades/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marks_obtained: newMarks }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Save failed");
      }
      const updated = await res.json();
      setGrades((prev) => prev.map((g) => (g.id === id ? updated : g)));
      cancelEdit(id);
      addNotification("Marks Updated", "Student marks have been updated successfully.", "success");
    } catch (err: unknown) {
      console.error("saveEdit error:", err);
      addNotification("Update Failed", "Failed to save marks: " + ((err as Error).message || "Unknown error"), "error");
    } finally {
      setSaving((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    }
  }, [editing, API, canEditGrade, addNotification, cancelEdit]);

  // -------------------- SEND REPORT MODAL HANDLERS --------------------
  const openSendModal = useCallback((classId: number, sectionName: string | null) => {
    setModalClassId(classId);
    setModalSection(sectionName);
    setSelectedStudentsForSend([]);
    setParentOverrides({});
    setShowSendModal(true);
  }, []);

  // prefill parentOverrides
  useEffect(() => {
    if (!showSendModal || !modalClassId || !modalSection) return;

    const sectionStudents = (grouped[modalClassId as number]?.sections[modalSection as string] || []) as Student[];
    const po: Record<number, string> = {};
    sectionStudents.forEach((s: Student) => {
      let p: string = "";
      if (!s.parent) {
        p = "";
      } else if (typeof s.parent === "string") {
        p = s.parent;
      } else if (typeof s.parent === "object" && s.parent.email) {
        p = s.parent.email;
      }
      po[s.id] = p;
    });
    setParentOverrides(po);
    setSelectedStudentsForSend([]);
  }, [showSendModal, modalClassId, modalSection, grouped]);

  const toggleStudentSelection = useCallback((studentId: number) => {
    setSelectedStudentsForSend((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }, []);

  const setParentForStudent = useCallback((studentId: number, email: string) => {
    setParentOverrides((p) => ({ ...p, [studentId]: email }));
  }, []);

  // send reports to selected parents
  const sendReportToParents = useCallback(async () => {
    if (selectedStudentsForSend.length === 0) {
      addNotification("Selection Required", "Select at least one student to send the report.", "warning");
      return;
    }

    setSending(true);
    try {
      const tasks = selectedStudentsForSend.map(async (studentId) => {
        const st = students.find((s) => s.id === studentId);
        if (!st) return { studentId, ok: false, message: "Student not found" };

        let parentEmail = parentOverrides[studentId];
        if (!parentEmail) {
          const p = st.parent;
          if (p && typeof p === "object" && 'email' in p) {
            parentEmail = p.email || "";
          } else if (typeof p === "string") {
            parentEmail = p || "";
          } else {
            parentEmail = "";
          }
        }

        const body = {
          email: st.email || '',
          parent_email: parentEmail,
          report_type: reportType,
          from_teacher: teacherEmail,
          student_id: st.student_id || st.id || '',
          student_name: st.name || st.full_name || st.first_name || ''
        };

        const res = await fetch(`${API}/marks_card/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(body),
          credentials: 'include'
        });

        if (!res.ok) {
          const txt = await res.text();
          return { studentId, ok: false, message: txt || `${res.status}` };
        }
        return { studentId, ok: true };
      });

      const results = await Promise.all(tasks);
      const failures = results.filter((r) => !r.ok);
      if (failures.length === 0) {
        addNotification("Reports Sent", `Reports sent successfully to ${results.length} parent(s).`, "success");
      } else {
        addNotification("Partial Success", `${failures.length} reports failed to send.`, "warning");
      }
      setShowSendModal(false);
    } catch (err: unknown) {
      console.error("sendReportToParents error:", err);
      addNotification("Send Failed", "Failed to send reports: " + ((err as Error).message || "Unknown error"), "error");
    } finally {
      setSending(false);
    }
  }, [selectedStudentsForSend, students, parentOverrides, reportType, teacherEmail, API, addNotification]);

  // -------------------- small helpers --------------------
  const studentParentEmail = useCallback((student: Student) => {
    if (!student) return "";
    if (!student.parent) return "";
    if (typeof student.parent === "string") return student.parent;
    if (typeof student.parent === "object" && 'email' in student.parent && student.parent.email) {
      return student.parent.email;
    }
    return "";
  }, []);

  // -------------------- Get teacher's subjects list for display --------------------
  const teacherSubjectsList = useMemo(() => {
    return Array.from(teacherSubjects).map(subject =>
      subject.charAt(0).toUpperCase() + subject.slice(1)
    );
  }, [teacherSubjects]);

  // -------------------- render --------------------
  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <BookOpen className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">Loading Marks Management</p>
              <p className="text-sm text-gray-600 mt-1">Fetching student data and grades...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!teacherEmail) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Your teacher credentials could not be found. Please log in again to access the marks management system.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              Go to Login
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!assignedClassIds || assignedClassIds.length === 0) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Book className="h-12 w-12 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No Classes Assigned</h2>
              <p className="text-gray-600 mb-6">You don&apos;t have any classes assigned in the timetable. Please contact the administrator to get assigned to classes.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Dashboard
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        {/* Notifications Container - Enhanced */}
        <div className="fixed top-6 right-6 z-50 space-y-3 max-w-md">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-right-8 duration-300 ${notification.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500'
                  : notification.type === 'error'
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500'
                    : notification.type === 'warning'
                      ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500'
                      : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500'
                }`}
            >
              <div className={`p-1.5 rounded-full ${notification.type === 'success' ? 'bg-emerald-100' :
                  notification.type === 'error' ? 'bg-red-100' :
                    notification.type === 'warning' ? 'bg-amber-100' :
                      'bg-blue-100'
                }`}>
                {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                {notification.type === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                {notification.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-600" />}
                {notification.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-600" />}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold text-sm ${notification.type === 'success' ? 'text-emerald-800' :
                    notification.type === 'error' ? 'text-red-800' :
                      notification.type === 'warning' ? 'text-amber-800' :
                        'text-blue-800'
                  }`}>
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 md:p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Marks Management System</h1>
                    <p className="text-blue-100 text-sm md:text-base">
                      Manage and distribute student academic reports
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {teacherRecord?.first_name} {teacherRecord?.last_name}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm ${teacherRecord?.is_class_teacher
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}>
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {teacherRecord?.is_class_teacher ? 'Class Teacher (Can edit all subjects)' : 'Subject Teacher (Limited edit access)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm truncate max-w-xs">{teacherEmail}</span>
                  </div>
                </div>

                {/* Show teacher's subjects if subject teacher */}
                {!teacherRecord?.is_class_teacher && teacherSubjectsList.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-blue-200" />
                      <span className="text-sm text-blue-200">Subjects You Teach:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teacherSubjectsList.map((subject, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/20 text-white text-xs rounded-lg backdrop-blur-sm"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show class teacher classes if class teacher */}
                {teacherRecord?.is_class_teacher && teacherClassTeacherClasses.size > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-purple-200" />
                      <span className="text-sm text-purple-200">Your Class Teacher Classes:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(teacherClassTeacherClasses).map((classId) => {
                        const classObj = classes.find(c => c.id === classId);
                        return (
                          <span
                            key={classId}
                            className="px-2 py-1 bg-purple-500/30 text-white text-xs rounded-lg backdrop-blur-sm"
                          >
                            {classObj?.class_name || `Class ${classId}`} - {classObj?.sec || 'All Sections'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-200">Report Type</p>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="bg-transparent border-none outline-none text-lg font-bold text-white mt-1"
                      >
                        <option value="quarterly" className="text-gray-900">Quarterly Report</option>
                        <option value="annual" className="text-gray-900">Annual Report</option>
                      </select>
                    </div>
                    <FileText className="h-8 w-8 text-white/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{overallStats.totalClasses}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 h-2 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  style={{ width: `${Math.min(100, (overallStats.totalClasses / 10) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{overallStats.totalStudents}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-3 h-2 bg-green-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                  style={{ width: `${Math.min(100, (overallStats.totalStudents / 100) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search students by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Class Selection Dropdown */}
                <select
                  value={selectedClassId || ""}
                  onChange={(e) => {
                    const classId = e.target.value ? Number(e.target.value) : null;
                    setSelectedClassId(classId);
                    // Reset section selection when class changes
                    setSelectedSectionName(null);
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
                >
                  <option value="">All Classes</option>
                  {Object.keys(grouped).map((cidKey) => {
                    const cid = Number(cidKey);
                    const classObj = grouped[cid].classObj || {};
                    return (
                      <option key={cid} value={cid}>
                        {classObj.class_name || `Class ${cid}`} - {classObj.sec || "All Sections"}
                      </option>
                    );
                  })}
                </select>

                {/* Section Selection Dropdown */}
                <select
                  value={selectedSectionName || ""}
                  onChange={(e) => setSelectedSectionName(e.target.value || null)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
                  disabled={!selectedClassId}
                >
                  <option value="">All Sections</option>
                  {selectedClassId && grouped[selectedClassId] && Object.keys(grouped[selectedClassId].sections).map((sectionName) => (
                    <option key={sectionName} value={sectionName}>
                      Section {sectionName}
                    </option>
                  ))}
                </select>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedClassId(null);
                      setSelectedSectionName(null);
                    }}
                    className="px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium flex items-center gap-2 transition-all hover:shadow"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear Filter</span>
                  </button>
                  <button className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium flex items-center gap-2 transition-all hover:shadow-lg shadow-blue-200">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Classes and Sections Grid */}
        <div className="max-w-7xl mx-auto space-y-8">
          {Object.keys(grouped)
            .filter(cidKey => !selectedClassId || Number(cidKey) === selectedClassId)
            .map((cidKey) => {
              const cid = Number(cidKey);
              const classBlock = grouped[cid];
              const classObj = classBlock.classObj || {};

              // Check if teacher is class teacher for this class
              const isClassTeacherForThisClass = isClassTeacherForClass(cid);

              // Filter sections based on selected section
              const filteredSections = selectedSectionName
                ? { [selectedSectionName]: classBlock.sections[selectedSectionName] || [] }
                : classBlock.sections;

              const classStudentsCount = Object.values(filteredSections).flat().length;

              // Skip rendering if filtering results in no students
              if (selectedSectionName && !classBlock.sections[selectedSectionName]) {
                return null;
              }

              return (
                <div key={cid} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Class Header */}
                  <div className={`p-6 border-b ${isClassTeacherForThisClass
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100'
                    }`}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isClassTeacherForThisClass
                              ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            }`}>
                            <Book className="h-6 w-6 text-white" />
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">{Object.keys(filteredSections).length}</span>
                          </div>
                          {isClassTeacherForThisClass && (
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                              <ShieldCheck className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {classObj.class_name || `Class ${cid}`}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              • Section {classObj.sec || "All"}
                            </span>
                            {isClassTeacherForThisClass && (
                              <span className="ml-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                Your Class (Class Teacher)
                              </span>
                            )}
                            {!isClassTeacherForThisClass && teacherRecord?.is_class_teacher && (
                              <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                Subject Teacher
                              </span>
                            )}
                          </h2>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                              Class ID: {cid}
                            </span>
                            <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {classStudentsCount} Students
                            </span>
                            {classObj.class_teacher && (
                              <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${teacherEmail && classObj.class_teacher_email?.toLowerCase() === teacherEmail.toLowerCase()
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-700'
                                }`}>
                                <User className="h-3 w-3" />
                                {classObj.class_teacher}
                                {teacherEmail && classObj.class_teacher_email?.toLowerCase() === teacherEmail.toLowerCase() && (
                                  <span className="ml-1 text-xs">(You)</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Class Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const firstSection = Object.keys(filteredSections)[0] || null;
                            openSendModal(cid, firstSection);
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all hover:shadow-lg shadow-green-200"
                        >
                          <Send className="h-4 w-4" />
                          <span className="hidden sm:inline">Send Reports</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="p-6">
                    {Object.keys(filteredSections).length > 0 ? (
                      <div className="space-y-6">
                        {Object.keys(filteredSections).map((sectionName) => {
                          const studList = filteredSections[sectionName] || [];
                          const sectionKey = `${cid}-${sectionName}`;
                          const isExpanded = expandedSections[sectionKey] || false;

                          return (
                            <div key={sectionKey} className="border border-gray-200 rounded-xl overflow-hidden">
                              {/* Section Header */}
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex justify-between items-center border-b">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white border border-gray-200 rounded-lg">
                                    <Users className="h-5 w-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900">Section: {sectionName}</h3>
                                    <p className="text-sm text-gray-600">
                                      {studList.length} students • {generateReportForStudentEmail(studList[0]?.email || '').length} subjects graded
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => openSendModal(cid, sectionName)}
                                    className="px-4 py-2 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                                  >
                                    <Send className="h-4 w-4" />
                                    <span className="hidden sm:inline">Send Section</span>
                                  </button>
                                  <button
                                    onClick={() => toggleSection(cid, sectionName)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                  >
                                    {isExpanded ?
                                      <ChevronUp className="h-5 w-5 text-gray-600" /> :
                                      <ChevronDown className="h-5 w-5 text-gray-600" />
                                    }
                                  </button>
                                </div>
                              </div>

                              {/* Students Grid */}
                              <div className={`${isExpanded ? 'block' : 'hidden md:block'} p-4 bg-white`}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {studList.map((s, index) => {
                                    const studentAvg = calculateStudentAverage(s.email || '');
                                    const studentGrades = generateReportForStudentEmail(s.email || '');
                                    const gradeBadge = getGradeBadge(studentAvg);
                                    const gradeColor = getGradeColor(studentAvg);
                                    const gradeColorClass = gradeColor.split(' ')[0];
                                    const gradeBgColorClass = gradeColor.split(' ')[1];

                                    return (
                                      <div key={s.id || s.email || s.student_id || `student-${index}`} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white">
                                        {/* Student Header */}
                                        <div className="flex items-start justify-between mb-4">
                                          <div className="flex items-center gap-3">
                                            {/* Student Profile Picture */}
                                            <div className="relative">
                                              {getStudentProfileImageWithFallback(s) ? (
                                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                                  <Image
                                                    src={getStudentProfileImageWithFallback(s) as string}
                                                    alt={`${s.first_name || ''} ${s.last_name || ''}`}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                      // If image fails to load, show initials
                                                      const target = e.currentTarget;
                                                      target.style.display = 'none';
                                                      const parent = target.parentElement;
                                                      if (parent) {
                                                        const initials = getStudentInitialsWithFallback(s);
                                                        parent.innerHTML = '<div class="w-10 h-10 rounded-full flex items-center justify-center ' + gradeBgColorClass + '"><span class="text-xs font-bold text-white">' + initials + '</span></div>';
                                                      }
                                                    }}
                                                  />
                                                </div>
                                              ) : (
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${gradeBgColorClass}`}>
                                                  <span className="font-bold text-sm text-white">{getStudentInitialsWithFallback(s)}</span>
                                                </div>
                                              )}
                                              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${gradeColorClass}`}>
                                                {gradeBadge}
                                              </div>
                                            </div>
                                            <div>
                                              <h4 className="font-bold text-gray-900">
                                                {s.full_name || s.name || `${s.first_name || ''} ${s.last_name || ''}` || s.email || 'Unknown Student'}
                                              </h4>
                                              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                                {s.email || 'No email provided'}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className={`text-lg font-bold ${gradeColorClass}`}>
                                              {studentAvg}%
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {studentGrades.length} subjects
                                            </div>
                                          </div>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="mb-4">
                                          <div className="flex items-center justify-between text-xs mb-2">
                                            <span className="text-gray-600">Performance</span>
                                            <span className={`font-medium ${gradeColorClass}`}>
                                              {studentAvg >= 80 ? 'Excellent' : studentAvg >= 60 ? 'Good' : 'Needs Improvement'}
                                            </span>
                                          </div>
                                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                              className={`h-full rounded-full ${gradeColorClass.replace('text-', 'bg-')}`}
                                              style={{ width: `${studentAvg}%` }}
                                            ></div>
                                          </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mb-4">
                                          <button
                                            onClick={() => setShowStudentDetails(showStudentDetails === s.id ? null : s.id)}
                                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                                          >
                                            {showStudentDetails === s.id ?
                                              <ChevronUp className="h-4 w-4" /> :
                                              <ChevronDown className="h-4 w-4" />
                                            }
                                            Details
                                          </button>
                                          <button
                                            onClick={async () => {
                                              const studentName = s.name || s.first_name || s.full_name || s.email;
                                              const parentEmail = studentParentEmail(s);

                                              if (!parentEmail) {
                                                addNotification("Parent Email Missing", `Parent email required for ${studentName}`, "warning");
                                                return;
                                              }

                                              try {
                                                const body = {
                                                  email: s.email || '',
                                                  parent_email: parentEmail,
                                                  report_type: reportType,
                                                  from_teacher: teacherEmail,
                                                  student_id: s.student_id || s.id || '',
                                                  student_name: s.name || s.full_name || s.first_name || ''
                                                };

                                                const res = await fetch(`${API}/marks_card/`, {
                                                  method: "POST",
                                                  headers: {
                                                    "Content-Type": "application/json",
                                                    "Accept": "application/json"
                                                  },
                                                  body: JSON.stringify(body),
                                                  credentials: 'include'
                                                });

                                                if (!res.ok) {
                                                  throw new Error(`Failed to send: ${res.status}`);
                                                }

                                                addNotification("Report Sent", `Report sent to ${parentEmail}`, "success");
                                              } catch (err: unknown) {
                                                addNotification("Send Failed", `Failed to send report: ${(err as Error).message}`, "error");
                                              }
                                            }}
                                            className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                                          >
                                            <Send className="h-4 w-4" />
                                            Send
                                          </button>
                                        </div>

                                        {/* Student Details Panel */}
                                        {showStudentDetails === s.id && (
                                          <div className="border-t pt-4">
                                            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                              {s.student_id && (
                                                <div className="flex items-center gap-2">
                                                  <Hash className="h-4 w-4 text-gray-400" />
                                                  <div>
                                                    <div className="text-xs text-gray-500">Student ID</div>
                                                    <div className="font-medium">{s.student_id}</div>
                                                  </div>
                                                </div>
                                              )}
                                              {s.phone && (
                                                <div className="flex items-center gap-2">
                                                  <Mail className="h-4 w-4 text-gray-400" />
                                                  <div>
                                                    <div className="text-xs text-gray-500">Phone</div>
                                                    <div className="font-medium">{s.phone}</div>
                                                  </div>
                                                </div>
                                              )}
                                              {s.parent_name && (
                                                <div className="col-span-2 flex items-center gap-2">
                                                  <UserCheck className="h-4 w-4 text-gray-400" />
                                                  <div>
                                                    <div className="text-xs text-gray-500">Parent</div>
                                                    <div className="font-medium">{s.parent_name}</div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>

                                            {/* Marks Table */}
                                            <div className="mt-4">
                                              <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-semibold text-gray-700">
                                                  Marks ({reportType})
                                                </span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                  {studentGrades.length} records
                                                </span>
                                              </div>

                                              {studentGrades.length === 0 ? (
                                                <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                                                  <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                  <p className="text-sm text-gray-500">No marks recorded</p>
                                                </div>
                                              ) : (
                                                <div className="space-y-2">
                                                  {studentGrades.map((g) => {
                                                    const canEditThisGrade = canEditGrade(g);
                                                    const isSubjectTeacherGrade = teacherSubjects.has(g.subject_name?.toLowerCase() || '');
                                                    // const _isCreatedByTeacher = g.teacher?.toLowerCase() === teacherEmail?.toLowerCase(); // Unused variable
                                                    const isClassTeacherGrade = isClassTeacherForThisClass;

                                                    return (
                                                      <div key={g.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                        <div className="flex-1">
                                                          <div className="font-medium text-gray-900">{g.subject_name}</div>
                                                          <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                                                            <span>Exam: {g.exam_type}</span>
                                                            {isSubjectTeacherGrade && (
                                                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                                                Your Subject
                                                              </span>
                                                            )}
                                                            {isClassTeacherGrade && (
                                                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                                                Class Teacher Access
                                                              </span>
                                                            )}
                                                            {!canEditThisGrade && (
                                                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                                                View Only
                                                              </span>
                                                            )}
                                                          </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                          <div className="text-right">
                                                            <div className="font-bold text-gray-900">
                                                              {editing[g.id] !== undefined ? (
                                                                <input
                                                                  type="number"
                                                                  min="0"
                                                                  max={g.total_marks}
                                                                  className="w-20 px-2 py-1 border rounded text-sm text-center"
                                                                  value={editing[g.id]}
                                                                  onChange={(e) =>
                                                                    setEditing((p) => ({ ...p, [g.id]: Number(e.target.value) }))
                                                                  }
                                                                  onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') saveEdit(g);
                                                                    if (e.key === 'Escape') cancelEdit(g.id);
                                                                  }}
                                                                />
                                                              ) : (
                                                                <span>{g.marks_obtained}</span>
                                                              )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">/ {g.total_marks}</div>
                                                          </div>
                                                          {canEditThisGrade ? (
                                                            editing[g.id] !== undefined ? (
                                                              <div className="flex gap-2">
                                                                <button
                                                                  onClick={() => saveEdit(g)}
                                                                  disabled={!!saving[g.id]}
                                                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                                                                >
                                                                  {saving[g.id] ? (
                                                                    <div className="flex items-center gap-1">
                                                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                    </div>
                                                                  ) : "Save"}
                                                                </button>
                                                                <button
                                                                  onClick={() => cancelEdit(g.id)}
                                                                  className="px-3 py-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium"
                                                                >
                                                                  Cancel
                                                                </button>
                                                              </div>
                                                            ) : (
                                                              <div className="relative group">
                                                                <button
                                                                  onClick={() => startEdit(g)}
                                                                  disabled={!canEditThisGrade}
                                                                  className={`px-3 py-1 rounded-lg text-sm font-medium ${isClassTeacherForThisClass
                                                                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                                                      : isSubjectTeacherGrade
                                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                        : 'bg-gray-400 cursor-not-allowed'
                                                                    }`}
                                                                  title={isClassTeacherForThisClass
                                                                    ? "Class Teacher: Edit all subjects in your class"
                                                                    : isSubjectTeacherGrade
                                                                      ? "Subject Teacher: Edit " + g.subject_name + " marks"
                                                                      : "View Only: You don't teach " + g.subject_name}
                                                                >
                                                                  Edit
                                                                </button>
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
                                                                  <div className="text-center">
                                                                    {isClassTeacherForThisClass
                                                                      ? 'As Class Teacher, you can edit all subjects in this class'
                                                                      : isSubjectTeacherGrade
                                                                        ? `As Subject Teacher, you can only edit ${g.subject_name} marks`
                                                                        : `View Only: You don't teach ${g.subject_name}`
                                                                    }
                                                                  </div>
                                                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                                </div>
                                                              </div>
                                                            )
                                                          ) : (
                                                            <span className="text-xs text-gray-400 italic">View only</span>
                                                          )}
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-12 w-12 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          No students are currently enrolled in this class. Students will appear here once they are added to the system.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Send Report Modal */}
        {showSendModal && modalClassId != null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <MailCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Send Reports to Parents</h2>
                      <p className="text-emerald-100 text-sm mt-1">
                        Select students and specify parent emails for {reportType} reports
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                {/* Class Info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border border-blue-200 rounded-lg">
                        <Book className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {classes.find((c) => c.id === modalClassId)?.class_name || `Class ${modalClassId}`}
                          <span className="font-normal text-gray-600 ml-2">• Section {modalSection}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Report Type: <span className="font-medium capitalize">{reportType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm text-blue-700 font-medium">
                      {teacherRecord?.is_class_teacher ? 'Class Teacher (Full Access)' : 'Subject Teacher (Limited Access)'}
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Select Students</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const sectionStudents = grouped[modalClassId]?.sections[modalSection || ''] || [];
                          setSelectedStudentsForSend(sectionStudents.map((s: Student) => s.id));
                        }}
                        className="text-xs px-3 py-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedStudentsForSend([])}
                        className="text-xs px-3 py-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {modalClassId && modalSection && (grouped[modalClassId]?.sections[modalSection] || []).map((st: Student) => {
                    const studentAvg = calculateStudentAverage(st.email || '');
                    const gradeColorClass = getGradeColor(studentAvg).split(' ')[0];
                    // const _gradeBgColorClass = getGradeColor(studentAvg).split(' ')[1]; // Unused variable

                    return (
                      <div key={st.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={selectedStudentsForSend.includes(st.id)}
                            onChange={() => toggleStudentSelection(st.id)}
                            className="mt-1 h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {/* Student Profile Picture */}
                                <div className="relative">
                                  {getStudentProfileImageWithFallback(st) ? (
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                      <Image
                                        src={getStudentProfileImageWithFallback(st) as string}
                                        alt={`${st.first_name || ''} ${st.last_name || ''}`}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          // If image fails to load, show initials
                                          const target = e.currentTarget;
                                          target.style.display = 'none';
                                          const parent = target.parentElement;
                                          if (parent) {
                                            const initials = getStudentInitialsWithFallback(st);
                                            parent.innerHTML = '<div class="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500"><span class="text-xs font-bold text-white">' + initials + '</span></div>';
                                          }
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500">
                                      <span className="font-bold text-sm text-white">{getStudentInitialsWithFallback(st)}</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {st.full_name || st.name || `${st.first_name || ''} ${st.last_name || ''}` || st.email || 'Unknown Student'}
                                  </h4>
                                  <p className="text-sm text-gray-500">{st.email || 'No email provided'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-bold ${gradeColorClass}`}>
                                  {studentAvg}%
                                </div>
                                <div className="text-xs text-gray-500">Average</div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 min-w-24">
                                  Parent Email:
                                </label>
                                <div className="flex-1">
                                  <input
                                    type="email"
                                    value={parentOverrides[st.id] ?? studentParentEmail(st)}
                                    onChange={(e) => setParentForStudent(st.id, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="parent@example.com"
                                  />
                                  {!studentParentEmail(st) && !parentOverrides[st.id] && (
                                    <p className="text-xs text-amber-600 mt-1">
                                      Parent email not found. Please enter manually.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{selectedStudentsForSend.length}</span> students selected
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSendModal(false)}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendReportToParents}
                      disabled={sending || selectedStudentsForSend.length === 0}
                      className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${selectedStudentsForSend.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                        }`}
                    >
                      {sending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending Reports...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Selected Reports
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editing Permissions Note */}
        <div className="max-w-7xl mx-auto mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Editing Permissions</h3>
              <p className="text-sm text-blue-800">
                {teacherRecord?.is_class_teacher
                  ? 'As a Class Teacher, you can edit marks for all subjects in your assigned classes.'
                  : 'As a Subject Teacher, you can only edit marks for subjects you teach.'}
                <br />
                <span className="font-medium">Grayed-out &quot;View only&quot; buttons indicate restricted access.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-400" />
              <span>Marks Management System • Secure Teacher Portal</span>
            </div>
            <div className="mt-2 md:mt-0">
              <span>Last updated: {new Date().toLocaleDateString()} • </span>
              <button onClick={() => window.location.reload()} className="text-blue-600 hover:text-blue-800 font-medium">
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}