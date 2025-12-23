"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
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
  parent_name?: string;
  parent_phone?: string;
  blood_group?: string;
  nationality?: string;
  previous_school?: string;
  academic_year?: string;
  [key: string]: string | number | boolean | undefined;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  subject_name: string;
  class_id: number;
  class_name: string;
  section: string;
  due_date: string;
  attachment?: string;
  created_at: string;
  status?: string;
  assigned_by?: string;
  sec?: string;
}

interface Class {
  id: number;
  class_name: string;
  section?: string;
  [key: string]: string | number | boolean | undefined;
}

interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  student_name: string;
  submission_date: string;
  file_attachment?: string;
  grade?: string;
  feedback?: string;
  submitted_at?: string;
  is_late?: boolean;
  student_email?: string;
  student?: string;
  assignment?: number;
  submission_file?: string;
  [key: string]: string | number | boolean | undefined;
}

interface Subject {
  id: number;
  subject_name: string;
  [key: string]: string | number | boolean | undefined;
}

import {
  Plus,
  Search,
  Calendar,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  User,
  Mail,
  Book,
  ArrowLeft
} from "lucide-react";

const TeachersAssignmentsPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [expandedAssignment, setExpandedAssignment] = useState<number | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedAssignments, setSubmittedAssignments] = useState<Submission[]>([]);
  const [showSubmittedAssignments, setShowSubmittedAssignments] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [loadingSubmittedAssignments, setLoadingSubmittedAssignments] = useState(false);
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [classesData, setClassesData] = useState<Class[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [teacherClasses, setTeacherClasses] = useState<Class[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [teacherStudents, setTeacherStudents] = useState<Student[]>([]);
  const [viewMode, setViewMode] = useState<'assignments' | 'total' | 'pending' | 'completed' | 'overdue'>('assignments');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [currentAssignmentTitle, setCurrentAssignmentTitle] = useState("");
  const [currentAssignmentClass, setCurrentAssignmentClass] = useState<{ class_name: string | undefined, section: string | undefined } | null>(null);
  const [currentAssignmentId, setCurrentAssignmentId] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [teacherSubjects, setTeacherSubjects] = useState<Subject[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<Record<string, Submission[]>>({});

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    subject: "",
    class_name: "",
    section: "",
    due_date: "",
    description: "",
  });

  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/assignments/`;

  // Show popup function
  const showPopup = (type: 'success' | 'error', message: string) => {
    setPopupMessage(message);
    if (type === 'success') {
      setShowSuccessPopup(true);
    } else {
      setShowErrorPopup(true);
    }
    setTimeout(() => {
      setShowSuccessPopup(false);
      setShowErrorPopup(false);
    }, 4000);
  };

  // ✅ Fetch teacher's data (classes and subjects they teach)
  const fetchTeacherData = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("userData");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const teacherEmail = parsedUser?.email;

      if (!teacherEmail) {
        setError("No teacher email found in local storage.");
        return;
      }


      // Fetch teacher's details to get subject_list
      const teacherResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teachers/?email=${teacherEmail}`);
      if (teacherResponse.data.length > 0) {
        const teacher = teacherResponse.data[0];
        setTeacherSubjects(teacher.subject_list || []);
      }

      // Fetch all classes to filter by teacher
      const allClassesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/`);
      const classesData = allClassesResponse.data || [];
      setClassesData(classesData);

      // Fetch all students
      const studentsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/`);
      const allStudents = studentsResponse.data || [];
      setStudentsData(allStudents);

    } catch {
      showPopup('error', "Failed to load teacher information.");
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("userData");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const teacherEmail = parsedUser?.email;

      if (!teacherEmail) {
        setError("No teacher email found in local storage.");
        setLoading(false);
        return;
      }

      const response = await axios.get(API_URL);

      const teacherAssignments = response.data.filter(
        (item: Assignment) => item.assigned_by === teacherEmail
      );

      setAssignments(teacherAssignments);
    } catch {
      setError("Failed to fetch assignments.");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // ✅ Filter students by teacher's classes
  const getTeacherStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);

      const storedUser = localStorage.getItem("userData");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const teacherEmail = parsedUser?.email;


      if (!teacherEmail) return [];

      // Get all students
      const studentsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/`);
      const allStudents = studentsResponse.data || [];

      // Get teacher's assignments to know which classes they teach
      const assignmentsResponse = await axios.get(API_URL);
      const teacherAssignments = assignmentsResponse.data.filter(
        (item: Assignment) => item.assigned_by === teacherEmail
      );

      // Extract unique classes taught by this teacher from assignments
      const teacherClassesSet = new Set<string>();
      teacherAssignments.forEach((assignment: Assignment) => {
        if (assignment.class_name && assignment.sec) {
          teacherClassesSet.add(`${assignment.class_name}-${assignment.sec}`);
        }
      });

      // Filter students based on teacher's classes
      // If no classes found in assignments, show all students
      const filtered = teacherClassesSet.size > 0
        ? allStudents.filter((student: Student) => {
          // Get student's class info
          const studentClass = classesData.find(cls => cls.id === student.class_id);

          if (!studentClass) {
            return false;
          }

          const classKey = `${studentClass.class_name}-${studentClass.sec}`;
          return teacherClassesSet.has(classKey);
        })
        : allStudents;

      setTeacherStudents(filtered);
      return filtered;
    } catch {
      showPopup('error', "Failed to load students data.");
      return [];
    } finally {
      setLoadingStudents(false);
    }
  }, [classesData, API_URL]);

  // ✅ Fetch Assignments
  useEffect(() => {
    fetchAssignments();
    fetchTeacherData();
  }, [fetchAssignments, fetchTeacherData]);

  // Fetch submissions when component mounts
  useEffect(() => {
    const fetchAllSubmissions = async () => {
      try {
        const submittedResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/submitted_assignments/`);
        const allSubmissions = submittedResponse.data || [];

        // Organize submissions by student email
        const submissionsByStudent: Record<string, Submission[]> = {};
        allSubmissions.forEach((submission: Submission) => {
          const studentEmail = String(submission.student_email || submission.student || "");
          if (studentEmail) {
            if (!submissionsByStudent[studentEmail]) {
              submissionsByStudent[studentEmail] = [];
            }
            submissionsByStudent[studentEmail].push(submission);
          }
        });
        setStudentSubmissions(submissionsByStudent);
      } catch {
        showPopup('error', "Failed to load submission data.");
      }
    };

    fetchAllSubmissions();
  }, []);





  // ✅ Handle card clicks for all assignments
  const handleCardClick = async (cardType: 'total' | 'pending' | 'completed' | 'overdue') => {
    setViewMode(cardType);

    // Get teacher's students first
    const teacherStudentsList = await getTeacherStudents();

    if (!teacherStudentsList || teacherStudentsList.length === 0) {
      showPopup('error', "No students found for your classes.");
      return;
    }

    // Fetch all submitted assignments
    try {
      const submittedResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/submitted_assignments/`);
      const allSubmissions = submittedResponse.data || [];

      // Update student submissions state
      const submissionsByStudent: Record<string, Submission[]> = {};
      allSubmissions.forEach((submission: Submission) => {
        const studentEmail = String(submission.student_email || submission.student || "");
        if (studentEmail) {
          if (!submissionsByStudent[studentEmail]) {
            submissionsByStudent[studentEmail] = [];
          }
          submissionsByStudent[studentEmail].push(submission);
        }
      });
      setStudentSubmissions(submissionsByStudent);

      let filteredStudentsList: Student[] = [];

      switch (cardType) {
        case 'total':
          // Show all students taught by teacher
          filteredStudentsList = teacherStudentsList;
          break;

        case 'pending':
          // Show students who haven't submitted ANY assignment
          filteredStudentsList = teacherStudentsList.filter((student: Student) => {
            const hasSubmission = allSubmissions.some(
              (submission: Submission) =>
                submission.student_email === student.email ||
                submission.student === student.email
            );
            return !hasSubmission;
          });
          break;

        case 'completed':
          // Show students who have submitted at least one assignment
          filteredStudentsList = teacherStudentsList.filter((student: Student) => {
            const hasSubmission = allSubmissions.some(
              (submission: Submission) =>
                submission.student_email === student.email ||
                submission.student === student.email
            );
            return hasSubmission;
          });
          break;

        case 'overdue':
          // Show students who submitted after due date
          filteredStudentsList = teacherStudentsList.filter((student: Student) => {
            const studentSubmissions = allSubmissions.filter(
              (submission: Submission) =>
                (submission.student_email === student.email ||
                  submission.student === student.email) &&
                submission.is_late === true
            );
            return studentSubmissions.length > 0;
          });
          break;
      }

      setFilteredStudents(filteredStudentsList);
    } catch (error) {
      console.error("Error filtering students:", error);
      showPopup('error', "Failed to filter students.");
    }
  };

  // ✅ Handle assignment-specific card clicks (only students from specific class)
  const handleAssignmentCardClick = async (
    cardType: 'total' | 'pending' | 'completed' | 'overdue',
    assignmentClassName: string | undefined,
    assignmentSection: string | undefined,
    assignmentId: number
  ) => {

    setViewMode(cardType);
    setLoadingStudents(true);
    setCurrentAssignmentClass({ class_name: assignmentClassName, section: assignmentSection });
    setCurrentAssignmentId(assignmentId);

    try {
      // Find the assignment to get due date and title
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        showPopup('error', "Assignment not found.");
        setLoadingStudents(false);
        return;
      }

      setCurrentAssignmentTitle(assignment.title || `Assignment ${assignmentId}`);
      const assignmentDueDate = new Date(assignment.due_date);
      assignmentDueDate.setHours(23, 59, 59, 999); // Set to end of day for comparison

      // Step 1: Fetch students from students API filtered by class_name and section
      const studentsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/`);
      const allStudents = studentsResponse.data || [];

      // Filter students by class_name and section
      const classSpecificStudents = allStudents.filter((student: Student) => {
        // Find the student's class info from classesData
        const studentClass = classesData.find(cls => cls.id === student.class_id);

        if (!studentClass) {
          // If class not found in classesData, try to match directly
          const directMatch = (
            student.class_name === assignmentClassName &&
            (student.section === assignmentSection || student.student_section === assignmentSection)
          );
          return directMatch;
        }

        // Match with assignment's class and section
        const classMatch = (
          studentClass.class_name === assignmentClassName &&
          studentClass.sec === assignmentSection
        );

        return classMatch;
      });

      if (classSpecificStudents.length === 0) {
        showPopup('error', `No students found for class ${assignmentClassName} section ${assignmentSection}.`);
        setLoadingStudents(false);
        return;
      }

      // Step 2: Fetch submissions from submitted_assignments API filtered by assignment_id
      const submittedResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/submitted_assignments/`);
      const allSubmissions = submittedResponse.data || [];

      // Filter submissions for THIS specific assignment
      const assignmentSubmissions = allSubmissions.filter((submission: Submission) => {
        const submissionAssignmentId = submission.assignment || submission.assignment_id;
        const matches = submissionAssignmentId === assignmentId;
        return matches;
      });

      // Create a map of student email to their submission for this assignment
      const studentSubmissionMap: Record<string, Submission> = {};
      assignmentSubmissions.forEach((submission: Submission) => {
        const studentEmail = String(submission.student_email || submission.student || "");
        if (studentEmail) {
          // Store the submission (if multiple, keep the latest one)
          if (!studentSubmissionMap[studentEmail] ||
            new Date(String(submission.submission_date || submission.submitted_at)) >
            new Date(String(studentSubmissionMap[studentEmail].submission_date || studentSubmissionMap[studentEmail].submitted_at))) {
            studentSubmissionMap[studentEmail] = submission;
          }
        }
      });

      // Update student submissions state (preserve existing submissions and add for this assignment)
      setStudentSubmissions(prevSubmissions => {
        const updatedSubmissions = { ...prevSubmissions };
        assignmentSubmissions.forEach((submission: Submission) => {
          const studentEmail = String(submission.student_email || submission.student || "");
          if (studentEmail) {
            if (!updatedSubmissions[studentEmail]) {
              updatedSubmissions[studentEmail] = [];
            }
            // Check if this submission already exists to avoid duplicates
            const existingIndex = updatedSubmissions[studentEmail].findIndex(
              (sub: Submission) => sub.id === submission.id
            );
            if (existingIndex >= 0) {
              updatedSubmissions[studentEmail][existingIndex] = submission;
            } else {
              updatedSubmissions[studentEmail].push(submission);
            }
          }
        });
        return updatedSubmissions;
      });

      // Step 3: Categorize students based on submission status
      let filteredStudentsList: Student[] = [];

      switch (cardType) {
        case 'total':
          // Show all students for this specific class
          filteredStudentsList = classSpecificStudents;
          break;

        case 'pending':
          // Show students who haven't submitted THIS specific assignment
          filteredStudentsList = classSpecificStudents.filter((student: Student) => {
            const studentEmail = student.email;
            const hasSubmission = !!studentSubmissionMap[studentEmail];
            return !hasSubmission;
          });
          break; case 'completed':
          // Show students who submitted THIS assignment ON TIME (submission_date <= due_date)
          filteredStudentsList = classSpecificStudents.filter((student: Student) => {
            const studentEmail = student.email;
            const submission = studentSubmissionMap[studentEmail];

            if (!submission) {
              return false;
            }

            // Check if submission was on time
            const submissionDate = new Date(String(submission.submission_date || submission.submitted_at || ""));
            const isOnTime = submissionDate <= assignmentDueDate && !submission.is_late;

            return isOnTime;
          });
          break;
        case 'overdue':
          // Show students who submitted THIS assignment AFTER the due date OR haven't submitted at all but due date passed
          // Get current date for checking if assignment is overdue
          const currentDate = new Date();
          const isAssignmentOverdue = assignmentDueDate < currentDate;

          if (isAssignmentOverdue) {
            // If assignment is overdue, show:
            // 1. Students who submitted late
            // 2. Students who haven't submitted at all
            filteredStudentsList = classSpecificStudents.filter((student: Student) => {
              const studentEmail = student.email;
              const submission = studentSubmissionMap[studentEmail];

              if (!submission) {
                // Student hasn't submitted at all and assignment is overdue
                return true;
              }

              // Student submitted but check if it was late
              const submissionDate = new Date(String(submission.submission_date || submission.submitted_at || ""));
              const isLate = submissionDate > assignmentDueDate || submission.is_late === true;

              return isLate;
            });
          } else {
            // Assignment is not overdue yet, but we still want to show students who submitted late
            filteredStudentsList = classSpecificStudents.filter((student: Student) => {
              const studentEmail = student.email;
              const submission = studentSubmissionMap[studentEmail];

              if (!submission) {
                return false; // Not submitted yet, not overdue
              }

              // Check if submission was after due date
              const submissionDate = new Date(String(submission.submission_date || submission.submitted_at || ""));
              const isLate = submissionDate > assignmentDueDate || submission.is_late === true;

              return isLate;
            });
          }
          break;
      }

      setFilteredStudents(filteredStudentsList);
    } catch {
      showPopup('error', "Failed to fetch students data.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // ✅ Add Assignment
  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const storedUser = localStorage.getItem("userData");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const teacherEmail = parsedUser?.email;

      if (!teacherEmail) {
        showPopup('error', "Teacher email not found.");
        return;
      }

      // Prepare assignment data
      const assignmentData = {
        title: newAssignment.title,
        description: newAssignment.description,
        class_name: newAssignment.class_name,
        section: newAssignment.section,
        due_date: newAssignment.due_date,
        subject: Number(newAssignment.subject),
        assigned_by: teacherEmail,
        attachment: null,
      };

      await axios.post(API_URL, assignmentData);
      showPopup('success', "Assignment added successfully!");
      setShowForm(false);
      setNewAssignment({
        title: "",
        subject: "",
        class_name: "",
        section: "",
        due_date: "",
        description: "",
      });
      fetchAssignments();
    } catch (err: unknown) {
      let errorMessage = "Failed to add assignment. Please check the form data.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      showPopup('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalAssignments: assignments.length,
    pending: assignments.filter(item => item.status === "Pending").length,
    completed: assignments.filter(item => item.status === "Completed").length,
    overdue: assignments.filter(item => {
      if (!item.due_date) return false;
      return new Date(item.due_date) < new Date() && item.status !== "Completed";
    }).length
  };

  // Get unique classes and subjects for filters
  const uniqueClasses = [...new Set(assignments.map(item => item.class_name))];
  const uniqueSubjects = [...new Set(assignments.map(item => item.subject_name))];

  // Filter assignments
  const filteredAssignments = assignments
    .filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.class_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesClass = classFilter === "all" || item.class_name === classFilter;
      const matchesSubject = subjectFilter === "all" || item.subject_name === subjectFilter;

      return matchesSearch && matchesStatus && matchesClass && matchesSubject;
    })
    .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());

  const getStatusIcon = (status: string | undefined, dueDate: string | undefined) => {
    const isOverdue = dueDate ? (new Date(dueDate) < new Date() && status !== "Completed") : false;

    if (isOverdue) return <AlertCircle className="h-5 w-5 text-red-600" />;

    switch (status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string | undefined, dueDate: string | undefined) => {
    const isOverdue = dueDate ? (new Date(dueDate) < new Date() && status !== "Completed") : false;

    if (isOverdue) return "bg-red-50 text-red-700 border-red-200";

    switch (status) {
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const isAssignmentOverdue = (dueDate: string | undefined, status: string | undefined) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && status !== "Completed";
  };

  // ✅ Fetch Submitted Assignments for specific assignment
  const fetchSubmittedAssignments = async (assignmentId: number) => {
    try {
      setLoadingSubmittedAssignments(true);
      setSelectedAssignmentId(assignmentId);

      // Get assignment title
      const assignment = assignments.find(a => a.id === assignmentId);
      setCurrentAssignmentTitle(assignment?.title || `Assignment ${assignmentId}`);

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/submitted_assignments/`);

      // Filter by assignment ID (handle different possible field names)
      const assignmentSubmissions = response.data.filter(
        (item: Submission) => {
          const itemAssignmentId = item.assignment || item.assignment_id || item.assignmentId;
          return itemAssignmentId === assignmentId;
        }
      );

      setSubmittedAssignments(assignmentSubmissions);
      setShowSubmittedAssignments(true);
    } catch {
      showPopup('error', "Failed to fetch submitted assignments.");
    } finally {
      setLoadingSubmittedAssignments(false);
    }
  };

  // ✅ Get Student Class by Email
  const getStudentClass = (studentEmail: string) => {
    const student = studentsData.find(s => s.email === studentEmail);
    if (!student) return { class_id: null, class_name: 'Unknown', section: '' };

    const classInfo = classesData.find(cls => cls.id === student.class_id);
    return classInfo || { class_id: student.class_id, class_name: 'Unknown', section: '' };
  };

  // ✅ Get student's assignment status
  // const getStudentAssignmentStatus = (studentEmail: string) => { // Unused
  //   // This would require fetching specific assignment submissions
  //   // For now, return placeholder data
  //   return "Pending";
  // };

  // ✅ Render Students List View
  const renderStudentsView = () => {

    let viewTitle = "";
    let viewDescription = "";
    let icon = <Users className="h-6 w-6" />;
    let bgColor = "bg-blue-50";

    switch (viewMode) {
      case 'total':
        viewTitle = "All Students";
        viewDescription = "Students in the specific class for this assignment";
        icon = <Users className="h-6 w-6 text-blue-600" />;
        bgColor = "bg-blue-50";
        break;
      case 'pending':
        viewTitle = "Pending Students";
        viewDescription = "Students in this assignment's class who haven't submitted";
        icon = <Clock className="h-6 w-6 text-yellow-600" />;
        bgColor = "bg-yellow-50";
        break;
      case 'completed':
        viewTitle = "Completed Students";
        viewDescription = "Students in this assignment's class who have submitted";
        icon = <CheckCircle className="h-6 w-6 text-green-600" />;
        bgColor = "bg-green-50";
        break;
      case 'overdue':
        viewTitle = "Overdue Students";
        viewDescription = "Students in this assignment's class with late submissions";
        icon = <AlertCircle className="h-6 w-6 text-red-600" />;
        bgColor = "bg-red-50";
        break;
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('assignments')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className={`p-3 rounded-lg ${bgColor}`}>
              {icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{viewTitle}</h2>
              <p className="text-gray-600 text-sm mt-1">{viewDescription}</p>
              {currentAssignmentTitle && (
                <p className="text-purple-600 text-sm font-semibold mt-1">
                  Assignment: {currentAssignmentTitle}
                </p>
              )}
              {currentAssignmentClass && (
                <p className="text-blue-600 text-sm font-medium mt-1">
                  Class: {currentAssignmentClass.class_name} - {currentAssignmentClass.section}
                </p>
              )}
            </div>
          </div>
          <div className="text-sm">
            <span className="font-semibold">{filteredStudents.length}</span> students
          </div>
        </div>

        {/* Students Grid */}
        {loadingStudents ? (
          <div key="loading-spinner" className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div key="no-students-found" className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {viewMode === 'pending' ? "All students have submitted assignments." :
                viewMode === 'completed' ? "No students have submitted assignments yet." :
                  viewMode === 'overdue' ? "No students have submitted assignments after due date." :
                    "No students found for your classes."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student, index) => (
              <div key={student.id || student.email || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {student.fullname || student.name || student.full_name || "Unknown Student"}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      <Mail className="h-3 w-3 inline mr-1" />
                      {student.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Book className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {getStudentClass(student.email).class_name} - {getStudentClass(student.email).section}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student ID:</span>
                    <span className="font-medium">{student.student_id || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Roll No:</span>
                    <span className="font-medium">{student.roll_number || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${viewMode === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      viewMode === 'completed' ? 'bg-green-100 text-green-700' :
                        viewMode === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                      }`}>
                      {viewMode === 'pending' ? 'Pending' :
                        viewMode === 'completed' ? 'Completed' :
                          viewMode === 'overdue' ? 'Overdue' : 'Active'}
                    </span>
                  </div>
                  {/* Display submission information for this assignment */}
                  {currentAssignmentId && (() => {
                    // Get submission for this specific assignment
                    const assignmentSubmission = studentSubmissions[student.email]?.find(
                      (sub: Submission) => {
                        // Handle different possible field names for assignment ID
                        const submissionAssignmentId = sub.assignment || sub.assignment_id || sub.assignmentId;
                        return submissionAssignmentId === currentAssignmentId;
                      }
                    );

                    if (assignmentSubmission) {
                      const submissionDate = new Date(String(assignmentSubmission.submission_date || assignmentSubmission.submitted_at || ""));
                      const assignment = assignments.find(a => a.id === currentAssignmentId);
                      const dueDate = assignment ? new Date(assignment.due_date) : null;
                      dueDate?.setHours(23, 59, 59, 999);
                      const isLate = dueDate && submissionDate > dueDate;

                      return (
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Submitted: {submissionDate.toLocaleDateString()} {submissionDate.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <span className={`px-2 py-1 rounded font-semibold ${isLate || assignmentSubmission.is_late
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                              }`}>
                              {isLate || assignmentSubmission.is_late ? 'Late Submission' : 'On Time'}
                            </span>
                            {assignmentSubmission.grade && (
                              <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">
                                Grade: {assignmentSubmission.grade}
                              </span>
                            )}
                          </div>
                          {dueDate && (
                            <div className="text-xs text-gray-400 mt-1">
                              Due: {dueDate.toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      );
                    } else if (viewMode === 'pending' || viewMode === 'total') {
                      return (
                        <div className="pt-2 border-t border-gray-100">
                          <div className="text-xs text-yellow-600 font-medium">
                            ⚠️ Not submitted yet
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ✅ Render Assignments View (default)
  const renderAssignmentsView = () => (
    <>
      {/* Statistics Cards - For all assignments */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => handleCardClick('total')}
          className="bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalAssignments}</p>
              <p className="text-xs text-gray-500 mt-2 hover:text-blue-600 transition-colors">
                Click to view all students →
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* <div 
          onClick={() => handleCardClick('pending')}
          className="bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              <p className="text-xs text-gray-500 mt-2 hover:text-yellow-600 transition-colors">
                Click to view pending students →
              </p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleCardClick('completed')}
          className="bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.completed}</p>
              <p className="text-xs text-gray-500 mt-2 hover:text-green-600 transition-colors">
                Click to view completed students →
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleCardClick('overdue')}
          className="bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.overdue}</p>
              <p className="text-xs text-gray-500 mt-2 hover:text-red-600 transition-colors">
                Click to view overdue students →
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div> */}
      </div>

      {/* Info text */}
      {/* <div className="mb-6 text-center text-sm text-gray-500">
        <p>👆 Click above cards to view students across all your assignments</p>
        <p>👇 Within each assignment card, click the colored buttons to view students for that specific class only</p>
      </div> */}

      {/* Rest of the assignments view code remains the same */}
      {/* Filters and Search */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div>
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {assignments.length === 0 ? "No Assignments Created" : "No Matching Assignments"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {assignments.length === 0
                ? "Get started by creating your first assignment for students."
                : "Try adjusting your search or filters to find what you're looking for."
              }
            </p>
            {assignments.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create First Assignment
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="p-4 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="mt-1">
                        {getStatusIcon(assignment.status || "", assignment.due_date || "")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{assignment.title}</h3>
                        <p className="text-xs text-gray-500 truncate">{assignment.subject_name}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status || "", assignment.due_date || "")}`}>
                      {isAssignmentOverdue(assignment.due_date || "", assignment.status || "") ? "Overdue" : assignment.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Class & Section */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{assignment.class_name} - {assignment.sec}</span>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                  </div>

                  {/* Description */}
                  <div className="text-sm text-gray-700">
                    <p className="line-clamp-2">{assignment.description}</p>
                  </div>

                  {/* Overdue Warning */}
                  {isAssignmentOverdue(assignment.due_date || "", assignment.status || "") && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Assignment is overdue</span>
                    </div>
                  )}

                  {/* Days Remaining */}
                  <div className="text-sm">
                    <span className="text-gray-600">Days Remaining: </span>
                    <span className={`font-medium ${isAssignmentOverdue(assignment.due_date, assignment.status)
                      ? 'text-red-600'
                      : 'text-green-600'
                      }`}>
                      {isAssignmentOverdue(assignment.due_date, assignment.status)
                        ? 'Overdue'
                        : Math.ceil((new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' days'
                      }
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex flex-wrap gap-2">
                    {/* View Submissions Button */}
                    <button
                      onClick={() => fetchSubmittedAssignments(assignment.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">View Submissions</span>
                      <span className="sm:hidden">View</span>
                    </button>

                    {/* View Students Buttons - Specific to Assignment's Class */}
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => handleAssignmentCardClick('total', assignment.class_name, assignment.sec, assignment.id)}
                        className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded transition-colors"
                        title={`View all students in ${assignment.class_name} - ${assignment.sec}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => handleAssignmentCardClick('pending', assignment.class_name, assignment.sec, assignment.id)}
                        className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-medium rounded transition-colors"
                        title={`View pending students in ${assignment.class_name} - ${assignment.sec}`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleAssignmentCardClick('completed', assignment.class_name, assignment.sec, assignment.id)}
                        className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded transition-colors"
                        title={`View completed students in ${assignment.class_name} - ${assignment.sec}`}
                      >
                        Completed
                      </button>
                      <button
                        onClick={() => handleAssignmentCardClick('overdue', assignment.class_name, assignment.sec, assignment.id)}
                        className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded transition-colors"
                        title={`View overdue students in ${assignment.class_name} - ${assignment.sec}`}
                      >
                        Overdue
                      </button>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setExpandedAssignment(expandedAssignment === assignment.id ? null : assignment.id)}
                      className="ml-auto flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm"
                    >
                      {expandedAssignment === assignment.id ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          <span className="hidden sm:inline">Less Details</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          <span className="hidden sm:inline">More Details</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedAssignment === assignment.id && (
                  <div className="p-4 border-t">
                    <div className="space-y-3 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Assignment Details</h4>
                        <div className="space-y-2 bg-gray-50 p-3 rounded">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created By:</span>
                            <span className="text-gray-900 font-medium">You</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created Date:</span>
                            <span className="text-gray-900 font-medium">
                              {new Date(String(assignment.created_at || "")).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Due Date:</span>
                            <span className="text-gray-900 font-medium">
                              {new Date(String(assignment.due_date || "")).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Full Description</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">
                          {assignment.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading assignments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-80">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-800 font-medium">Success</p>
                <p className="text-green-700 text-sm">{popupMessage}</p>
              </div>
              <button onClick={() => setShowSuccessPopup(false)} className="text-green-600 hover:text-green-800">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error Popup */}
        {showErrorPopup && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-80">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{popupMessage}</p>
              </div>
              <button onClick={() => setShowErrorPopup(false)} className="text-red-600 hover:text-red-800">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {viewMode === 'assignments' ? 'Assignments' :
                  viewMode === 'total' ? 'All Students' :
                    viewMode === 'pending' ? 'Pending Students' :
                      viewMode === 'completed' ? 'Completed Students' :
                        'Overdue Students'}
              </h1>
              <p className="text-gray-600 mt-1">
                {viewMode === 'assignments' ? 'Create and manage assignments for your students' :
                  viewMode === 'total' ? 'Students in the specific class for this assignment' :
                    viewMode === 'pending' ? 'Students in this assignment\'s class who haven\'t submitted' :
                      viewMode === 'completed' ? 'Students in this assignment\'s class who have submitted' :
                        'Students in this assignment\'s class with late submissions'}
              </p>
            </div>
            {viewMode === 'assignments' && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors whitespace-nowrap w-full sm:w-auto justify-center"
              >
                <Plus className="h-5 w-5" />
                Create Assignment
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'assignments' ? renderAssignmentsView() : renderStudentsView()}

        {/* Create Assignment Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create New Assignment</h2>
                  <p className="text-gray-600 text-sm mt-1">Fill in the details for your new assignment</p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleAddAssignment} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter assignment title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject ID *
                    </label>
                    <input
                      type="number"
                      placeholder="Enter subject ID (e.g., 132)"
                      value={newAssignment.subject}
                      onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter class name (e.g., Grade 10)"
                      value={newAssignment.class_name}
                      onChange={(e) => setNewAssignment({ ...newAssignment, class_name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter section (e.g., A)"
                      value={newAssignment.section}
                      onChange={(e) => setNewAssignment({ ...newAssignment, section: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={newAssignment.due_date}
                      onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      placeholder="Provide detailed assignment description..."
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      rows={4}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      "Create Assignment"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Submitted Assignments Modal */}
        {showSubmittedAssignments && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Submitted Assignments</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {currentAssignmentTitle} • {submittedAssignments.length} submissions
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSubmittedAssignments(false);
                    setSubmittedAssignments([]);
                    setSelectedAssignmentId(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                {loadingSubmittedAssignments ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading submitted assignments...</p>
                  </div>
                ) : submittedAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Found</h3>
                    <p className="text-gray-600">No students have submitted this assignment yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {submittedAssignments.map((submission) => (
                      <div key={submission.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {submission.student_name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {submission.student_email}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>Subject: {submission.subject_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Class: {getStudentClass(submission.student_email || "").class_name} - {getStudentClass(submission.student_email || "").section}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted: {new Date(String(submission.submission_date || "")).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm mb-3">
                          <div className="flex-1">
                            <span className="font-medium text-gray-700">Grade: </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${submission.grade ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                              {submission.grade || 'Not Graded'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-700">Status: </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${submission.is_late ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                              {submission.is_late ? 'Late' : 'On Time'}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <span className="font-medium text-gray-700 text-sm">Feedback: </span>
                          <p className="text-gray-600 text-sm mt-1">
                            {submission.feedback || 'No feedback provided'}
                          </p>
                        </div>

                        {submission.submission_file && (
                          <a
                            href={submission.submission_file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <Download className="h-4 w-4" />
                            Download Submission File
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeachersAssignmentsPage;