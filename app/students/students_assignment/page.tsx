"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios, { AxiosError } from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { Calendar, Clock, AlertCircle, FileText, Download, Send, MessageSquare } from "lucide-react";

// API Constants
const API_ENDPOINTS = {
  STUDENTS: "https://globaltechsoftwaresolutions.cloud/school-api/api/students/",
  ASSIGNMENTS: "https://globaltechsoftwaresolutions.cloud/school-api/api/assignments/",
} as const;

// TypeScript Interfaces
interface Student {
  id: number;
  email: string;
  fullname: string;
  grade?: string;
  class_name?: string;
  section?: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  subject_name: string;
  class_name: string;
  section: string;
  due_date: string;
  attachment?: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

type TabType = "all" | "pending" | "overdue";

// Custom Hooks
const useStudentData = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStudentEmail = (): string | null => {
    if (typeof window === "undefined") return null;

    try {
      const userInfo = localStorage.getItem("userInfo");
      const userData = localStorage.getItem("userData");
      const directEmail = localStorage.getItem("email");

      const parsed = userInfo && JSON.parse(userInfo);
      const parsedData = userData && JSON.parse(userData);

      return directEmail || parsed?.email || parsedData?.email || null;
    } catch (err) {
      console.error("Error reading user data from localStorage:", err);
      return null;
    }
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const email = getStudentEmail();
      if (!email) {
        throw new Error("Student email not found. Please login again.");
      }

      const response = await axios.get<Student[]>(API_ENDPOINTS.STUDENTS);
      const students = response.data || [];

      const studentData = students.find(
        (s) => s.email?.toLowerCase() === email.toLowerCase()
      );

      if (!studentData) {
        throw new Error("Student profile not found in the system.");
      }

      setStudent(studentData);
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorData = axiosError.response?.data as any;
      const message = errorData?.message || axiosError.message || "Failed to fetch student data";
      setError(message);
      console.error("Student data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  return { student, loading, error, refetch: fetchStudentData };
};

const useAssignments = (student: Student | null) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    if (!student) return;

    try {
      setLoading(true);
      setError(null);

      const studentGrade = student.grade || student.class_name || "";
      const studentSection = student.section || "";

      if (!studentGrade || !studentSection) {
        throw new Error("Student grade or section information is missing.");
      }

      const response = await axios.get<Assignment[]>(API_ENDPOINTS.ASSIGNMENTS);
      const allAssignments = response.data || [];

      const filteredAssignments = allAssignments.filter(
        (assignment) =>
          assignment.class_name?.toLowerCase() === studentGrade.toLowerCase() &&
          assignment.section?.toLowerCase() === studentSection.toLowerCase()
      );

      setAssignments(filteredAssignments);
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorData = axiosError.response?.data as any;
      const message = errorData?.message || axiosError.message || "Failed to fetch assignments";
      setError(message);
      console.error("Assignments fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [student]);

  return { assignments, loading, error, refetch: fetchAssignments };
};

// Utility Functions
const AssignmentUtils = {
  getStatus: (dueDate: string): { label: string; color: string; variant: "danger" | "warning" | "success" } => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (due < now) {
      return {
        label: "Overdue",
        color: "text-red-700 bg-red-100 border-red-200",
        variant: "danger",
      };
    }

    if (daysUntilDue <= 2) {
      return {
        label: "Due Soon",
        color: "text-orange-700 bg-orange-100 border-orange-200",
        variant: "warning",
      };
    }

    return {
      label: "On Time",
      color: "text-green-700 bg-green-100 border-green-200",
      variant: "success",
    };
  },

  calculateDaysLeft: (dueDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  },

  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },
};

// Components
const SubmitAssignmentModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  assignment: Assignment | null; 
}> = ({ isOpen, onClose, assignment }) => {
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file to submit");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // TODO: Implement actual API call to submit assignment
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Assignment submitted:", {
        assignmentId: assignment?.id,
        subject: assignment?.subject_name,
        fileName: file.name,
        fileSize: file.size,
        comment: comment.trim()
      });

      // Success feedback
      alert("Assignment submitted successfully!");
      setFile(null);
      setComment("");
      onClose();
    } catch (err) {
      setError("Failed to submit assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Submit Assignment</h2>
              <p className="text-green-100">
                {assignment.subject_name} - {assignment.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File *
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                disabled={submitting}
              />
              {file && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG, ZIP (Max 10MB)
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any comments or notes about your submission..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
              rows={3}
              disabled={submitting}
            />
          </div>

          {/* Assignment Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Assignment Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Subject:</strong> {assignment.subject_name}</p>
              <p><strong>Title:</strong> {assignment.title}</p>
              <p><strong>Due Date:</strong> {AssignmentUtils.formatDate(assignment.due_date)}</p>
              <p><strong>Status:</strong> {AssignmentUtils.getStatus(assignment.due_date).label}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                "Submit Assignment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ContactTeacherModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  assignment: Assignment | null; 
}> = ({ isOpen, onClose, assignment }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setSending(true);
    setError("");

    try {
      // TODO: Implement actual API call to send message to teacher
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Message sent:", {
        assignmentId: assignment?.id,
        subject: assignment?.subject_name,
        message: message.trim()
      });

      // Success feedback
      alert("Message sent to teacher successfully!");
      setMessage("");
      onClose();
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Contact Teacher</h2>
              <p className="text-blue-100">
                {assignment.subject_name} - {assignment.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your question or concern here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              rows={5}
              disabled={sending}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Assignment Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Assignment Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Subject:</strong> {assignment.subject_name}</p>
              <p><strong>Title:</strong> {assignment.title}</p>
              <p><strong>Due Date:</strong> {AssignmentUtils.formatDate(assignment.due_date)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={sending}
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignmentCard: React.FC<{ assignment: Assignment }> = ({ assignment }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const status = AssignmentUtils.getStatus(assignment.due_date);
  const daysLeft = AssignmentUtils.calculateDaysLeft(assignment.due_date);

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const handleContactTeacher = () => {
    setShowContactModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
        {/* Status Bar */}
        <div className={`h-1 ${status.variant === "danger" ? "bg-red-500" : status.variant === "warning" ? "bg-orange-500" : "bg-green-500"}`} />
        
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            {/* Assignment Details */}
            <div className="flex-1 space-y-4">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {status.label}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <FileText className="w-3 h-3 mr-1" />
                  {assignment.subject_name}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  {assignment.class_name} • {assignment.section}
                </span>
              </div>

              {/* Title and Description */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                  {assignment.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {assignment.description}
                </p>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Due: {AssignmentUtils.formatDate(assignment.due_date)}</span>
                {daysLeft >= 0 && (
                  <span className="font-medium text-gray-900">
                    ({daysLeft === 0 ? "Today" : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`})
                  </span>
                )}
              </div>

              {/* Attachment */}
              {assignment.attachment && (
                <a
                  href={assignment.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  View Attachment
                </a>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              {daysLeft >= 0 ? (
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Submit Assignment
                </button>
              ) : (
                <div className="inline-flex items-center justify-center gap-2 bg-red-50 text-red-700 font-medium py-3 px-4 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4" />
                  Overdue
                </div>
              )}
              
              <button
                onClick={handleContactTeacher}
                className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Teacher
              </button>
            </div>
          </div>
        </div>
      </div>

      <SubmitAssignmentModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        assignment={assignment}
      />

      <ContactTeacherModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        assignment={assignment}
      />
    </>
  );
};

const EmptyState: React.FC<{ activeTab: TabType }> = ({ activeTab }) => {
  const getEmptyStateContent = () => {
    switch (activeTab) {
      case "pending":
        return {
          icon: "⏰",
          title: "No Pending Assignments",
          description: "You're all caught up! No assignments are currently pending.",
        };
      case "overdue":
        return {
          icon: "✅",
          title: "No Overdue Assignments",
          description: "Great job! You haven't missed any deadlines.",
        };
      default:
        return {
          icon: "📚",
          title: "No Assignments Found",
          description: "You don't have any assignments at the moment.",
        };
    }
  };

  const { icon, title, description } = getEmptyStateContent();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mx-auto">{description}</p>
    </div>
  );
};

// Main Component
const StudentAssignment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const { student, loading: studentLoading, error: studentError } = useStudentData();
  const { assignments, loading: assignmentsLoading, error: assignmentsError } = useAssignments(student);

  const loading = studentLoading || assignmentsLoading;
  const error = studentError || assignmentsError;

  const filteredAssignments = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return assignments.filter((assignment) => new Date(assignment.due_date) >= new Date());
      case "overdue":
        return assignments.filter((assignment) => new Date(assignment.due_date) < new Date());
      default:
        return assignments;
    }
  }, [assignments, activeTab]);

  const tabCounts = useMemo(() => ({
    all: assignments.length,
    pending: assignments.filter((a) => new Date(a.due_date) >= new Date()).length,
    overdue: assignments.filter((a) => new Date(a.due_date) < new Date()).length,
  }), [assignments]);

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading your assignments...</div>
            <p className="text-gray-500 mt-2">Please wait while we fetch your tasks</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-red-600 font-semibold text-lg mb-2">Error Loading Assignments</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Assignments
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Stay on top of your coursework and never miss a deadline
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 font-medium">Total Assignments</div>
                  <div className="text-3xl font-bold text-gray-900">{tabCounts.all}</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 font-medium">Pending</div>
                  <div className="text-3xl font-bold text-orange-600">{tabCounts.pending}</div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 font-medium">Overdue</div>
                  <div className="text-3xl font-bold text-red-600">{tabCounts.overdue}</div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-2 mb-8 border border-white/50">
            <div className="flex gap-2">
              {(["all", "pending", "overdue"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {tabCounts[tab]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Assignments List */}
          {filteredAssignments.length > 0 ? (
            <div className="space-y-6">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          ) : (
            <EmptyState activeTab={activeTab} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignment;
