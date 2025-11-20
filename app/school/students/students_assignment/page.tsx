"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Download, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Search,
  Filter,
  BookOpen,
  Users,
  CalendarDays,
  ChevronDown,
  Upload,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

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
}

interface Student {
  id: number;
  email: string;
  fullname: string;
  class_id: number;
  class_name: string;
  section: string;
}

interface SubmittedAssignment {
  id: number;
  assignment: number;
  student: string;
  submission_file: string;
  feedback: string;
  is_late: boolean;
  submission_date: string;
}

type TabType = "all" | "pending" | "overdue" | "submitted";
type SortType = "due_date" | "title" | "subject" | "created_at";

const getUserEmail = (): string | null => {
  try {
    const userInfo = localStorage.getItem("userInfo");
    const userData = localStorage.getItem("userData");
    if (userInfo) return JSON.parse(userInfo)?.email;
    if (userData) return JSON.parse(userData)?.email;
    return null;
  } catch {
    return null;
  }
};

const AssignmentUtils = {
  getStatus: (dueDate: string, submitted?: boolean) => {
    if (submitted) return { label: "Submitted", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 };
    
    const due = new Date(dueDate);
    const now = new Date();
    const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (due < now) return { label: "Overdue", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle };
    if (days <= 1) return { label: "Due Today", color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock };
    if (days <= 2) return { label: "Due Tomorrow", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock };
    if (days <= 7) return { label: "This Week", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Calendar };
    
    return { label: "Upcoming", color: "bg-gray-100 text-gray-700 border-gray-200", icon: CalendarDays };
  },
  
  formatDate: (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  
  formatTime: (d: string) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    }),
  
  getDaysLeft: (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
};

// ✅ Enhanced Popup Component
const Popup: React.FC<{ message: string; type: "success" | "error"; onClose: () => void }> = ({
  message,
  type,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-lg text-white z-50 min-w-80 ${
          type === "success" ? "bg-green-600" : "bg-red-600"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {type === "success" ? 
              <CheckCircle2 className="w-5 h-5" /> : 
              <XCircle className="w-5 h-5" />
            }
          </div>
          <p className="flex-1 text-sm font-medium">{message}</p>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// 📤 Enhanced Submit Modal
const SubmitAssignmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  student: Student | null;
  onSuccess: () => void;
}> = ({ isOpen, onClose, assignment, student, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment || !student || !file) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("student", student.email);
      formData.append("assignment", assignment.id.toString());
      formData.append("file", file);
      formData.append("feedback", comment);

      await axios.post(`${API_BASE}/submitted_assignments/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        "Failed to submit assignment. Please check your class or try again.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen || !assignment) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-lg shadow-xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Submit Assignment</h2>
                  <p className="text-green-100 text-sm mt-1">{assignment.title}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Due Date Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 text-blue-800">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Due: {AssignmentUtils.formatDate(assignment.due_date)} at {AssignmentUtils.formatTime(assignment.due_date)}
                </span>
                <span className="text-xs bg-blue-200 px-2 py-1 rounded-full">
                  {AssignmentUtils.getDaysLeft(assignment.due_date)} days left
                </span>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload Your Work *
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive 
                    ? "border-green-500 bg-green-50" 
                    : "border-gray-300 hover:border-gray-400 bg-gray-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className={`w-12 h-12 mx-auto mb-3 ${
                  dragActive ? "text-green-500" : "text-gray-400"
                }`} />
                <p className="text-gray-600 mb-2">
                  {file ? file.name : "Drag & drop your file here"}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse (PDF, DOC, DOCX, PNG, JPG, ZIP)
                </p>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.png,.jpg,.zip"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Choose File
                </label>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Comments (Optional)
              </label>
              <textarea
                placeholder="Add any comments or notes for your teacher..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                rows={4}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !file}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Assignment
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// 📘 Enhanced Assignment Card
const AssignmentCard: React.FC<{
  assignment: Assignment;
  student: Student | null;
  submitted?: boolean;
  onSubmitted: () => Promise<void>;
}> = ({ assignment, student, submitted, onSubmitted }) => {
  const [open, setOpen] = useState(false);
  const status = AssignmentUtils.getStatus(assignment.due_date, submitted);
  const StatusIcon = status.icon;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-xl transition-all duration-300 group ${
          submitted ? "border-green-200" : "border-gray-200 hover:border-green-300"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
              {assignment.title}
            </h3>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {assignment.subject_name}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full border text-sm font-medium flex items-center gap-1.5 ${status.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {assignment.description}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Due: {AssignmentUtils.formatDate(assignment.due_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{AssignmentUtils.formatTime(assignment.due_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{assignment.class_name} - {assignment.section}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays className="w-4 h-4" />
            <span>Created: {AssignmentUtils.formatDate(assignment.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          {assignment.attachment && (
            <a
              href={assignment.attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Files
            </a>
          )}
          
          <div className="flex-1"></div>
          
          {submitted ? (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium border border-green-200">
              <CheckCircle2 className="w-4 h-4" />
              Submitted
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-green-200"
            >
              <Send className="w-4 h-4" />
              Submit Now
            </motion.button>
          )}
        </div>
      </motion.div>

      <SubmitAssignmentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        assignment={assignment}
        student={student}
        onSuccess={onSubmitted}
      />
    </>
  );
};

// 🌟 Enhanced Main Page
const StudentAssignmentsPage = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submitted, setSubmitted] = useState<SubmittedAssignment[]>([]);
  const [tab, setTab] = useState<TabType>("all");
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("due_date");
  const [showFilters, setShowFilters] = useState(false);

  const fetchStudent = async () => {
    const email = getUserEmail();
    if (!email) throw new Error("No student email found.");
    const res = await axios.get(`${API_BASE}/students/${email}/`);
    return res.data;
  };

  const fetchAssignments = async (class_id: number) => {
    const res = await axios.get(`${API_BASE}/assignments/?class_id=${class_id}`);
    return res.data;
  };

  const fetchSubmittedAssignments = async (email: string) => {
    const res = await axios.get(`${API_BASE}/submitted_assignments/`).catch((err) => {
      return { data: [] };
    });

    const data: SubmittedAssignment[] = Array.isArray(res.data) ? res.data : [res.data];
    const filtered = data.filter(
      (record) => record?.student?.toLowerCase?.() === email.toLowerCase()
    );
    return filtered;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const studentData = await fetchStudent();
      setStudent(studentData);
      const [assignList, submittedList] = await Promise.all([
        fetchAssignments(studentData.class_id),
        fetchSubmittedAssignments(studentData.email),
      ]);
      setAssignments(assignList);
      setSubmitted(submittedList);
    } catch (err) {
      setPopup({ message: "Failed to load assignments. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmissionSuccess = useCallback(async () => {
    await loadData();
    setPopup({ message: "Assignment submitted successfully!", type: "success" });
  }, [loadData]);

  const isSubmitted = (assignmentId: number) =>
    submitted.some((s) => s.assignment === assignmentId);

  const filteredAndSortedAssignments = useMemo(() => {
    let filtered = assignments.filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.subject_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const submittedStatus = isSubmitted(assignment.id);
      
      if (tab === "pending") return matchesSearch && !submittedStatus && new Date(assignment.due_date) >= new Date();
      if (tab === "overdue") return matchesSearch && !submittedStatus && new Date(assignment.due_date) < new Date();
      if (tab === "submitted") return matchesSearch && submittedStatus;
      
      return matchesSearch;
    });

    // Sort assignments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "due_date":
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "subject":
          return a.subject_name.localeCompare(b.subject_name);
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [assignments, tab, submitted, searchTerm, sortBy]);

  const stats = useMemo(() => ({
    total: assignments.length,
    pending: assignments.filter(a => !isSubmitted(a.id) && new Date(a.due_date) >= new Date()).length,
    overdue: assignments.filter(a => !isSubmitted(a.id) && new Date(a.due_date) < new Date()).length,
    submitted: assignments.filter(a => isSubmitted(a.id)).length,
  }), [assignments, submitted]);

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading your assignments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mb-6 shadow-lg"
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-gray-900 mb-3"
            >
              My Assignments
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Manage and submit your academic assignments in one place
            </motion.p>
            
            {/* Student Info */}
            {student && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-gray-200"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">
                  {student.fullname} • {student.class_name} - {student.section}
                </span>
              </motion.div>
            )}
          </div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { label: "Total", value: stats.total, color: "bg-blue-500" },
              { label: "Pending", value: stats.pending, color: "bg-yellow-500" },
              { label: "Overdue", value: stats.overdue, color: "bg-red-500" },
              { label: "Submitted", value: stats.submitted, color: "bg-green-500" },
            ].map((stat, index) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Controls Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search assignments by title, description, or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:w-48 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-gray-200"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Tabs */}
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Filter by Status
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {([
                          { key: "all", label: "All Assignments", count: stats.total },
                          { key: "pending", label: "Pending", count: stats.pending },
                          { key: "overdue", label: "Overdue", count: stats.overdue },
                          { key: "submitted", label: "Submitted", count: stats.submitted },
                        ] as const).map(({ key, label, count }) => (
                          <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              tab === key
                                ? "bg-green-600 text-white shadow-lg shadow-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {label} <span className="ml-1 opacity-80">({count})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sort */}
                    <div className="lg:w-64">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortType)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      >
                        <option value="due_date">Due Date</option>
                        <option value="title">Title</option>
                        <option value="subject">Subject</option>
                        <option value="created_at">Recently Added</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Assignments Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {filteredAndSortedAssignments.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    student={student}
                    submitted={isSubmitted(assignment.id)}
                    onSubmitted={handleSubmissionSuccess}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {searchTerm || tab !== "all" ? "No matching assignments" : "No assignments yet"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || tab !== "all" 
                    ? "Try adjusting your search or filter criteria to find what you're looking for."
                    : "You don't have any assignments at the moment. They will appear here once your teachers create them."
                  }
                </p>
                {(searchTerm || tab !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setTab("all");
                    }}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Footer Info */}
          {filteredAndSortedAssignments.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-gray-500 bg-white/50 backdrop-blur-sm py-4 rounded-2xl"
            >
              Showing {filteredAndSortedAssignments.length} of {assignments.length} assignments
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignmentsPage;