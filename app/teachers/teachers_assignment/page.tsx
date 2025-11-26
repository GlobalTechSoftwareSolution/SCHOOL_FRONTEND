"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";

const TeachersAssignmentsPage = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
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
  const [submittedAssignments, setSubmittedAssignments] = useState<any[]>([]);
  const [showSubmittedAssignments, setShowSubmittedAssignments] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [loadingSubmittedAssignments, setLoadingSubmittedAssignments] = useState(false);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [classesData, setClassesData] = useState<any[]>([]);

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    subject: "",
    class_name: "",
    section: "",
    due_date: "",
    description: "",
  });

  const API_URL = "https://school.globaltechsoftwaresolutions.cloud/api/assignments/";

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

  // ✅ Fetch Assignments
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
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
        (item: any) => item.assigned_by === teacherEmail
      );

      setAssignments(teacherAssignments);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to fetch assignments.");
    } finally {
      setLoading(false);
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
    } catch (err: any) {
      console.error("Error adding assignment:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || "Failed to add assignment. Please check the form data.";
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

  const getStatusIcon = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== "Completed";
    
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

  const getStatusColor = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== "Completed";
    
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

  const isAssignmentOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== "Completed";
  };

  // ✅ Fetch Submitted Assignments
  const fetchSubmittedAssignments = async (assignmentId: number) => {
    try {
      setLoadingSubmittedAssignments(true);
      setSelectedAssignmentId(assignmentId);
      
      // Fetch students data if not already loaded
      if (studentsData.length === 0) {
        const studentsResponse = await axios.get(`${API_URL.replace('assignments/', 'students/')}`);
        setStudentsData(studentsResponse.data);
      }
      
      // Fetch classes data if not already loaded
      if (classesData.length === 0) {
        const classesResponse = await axios.get(`${API_URL.replace('assignments/', 'classes/')}`);
        setClassesData(classesResponse.data);
      }
      
      const response = await axios.get(`https://school.globaltechsoftwaresolutions.cloud/api/submitted_assignments/`);
      
      // Filter by assignment ID
      const assignmentSubmissions = response.data.filter(
        (item: any) => item.assignment === assignmentId || item.assignment_id === assignmentId
      );
      
      setSubmittedAssignments(assignmentSubmissions);
      setShowSubmittedAssignments(true);
    } catch (err) {
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
      <div className="min-h-screen bg-gray-50/30 p-6">
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
              <p className="text-gray-600 mt-2">Create and manage assignments for your students</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Create Assignment
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalAssignments}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.overdue}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by title, description, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Classes</option>
                {uniqueClasses.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>

              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-16">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Create First Assignment
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedAssignment(expandedAssignment === assignment.id ? null : assignment.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getStatusIcon(assignment.status, assignment.due_date)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{assignment.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(assignment.status, assignment.due_date)}`}>
                            {isAssignmentOverdue(assignment.due_date, assignment.status) ? "Overdue" : assignment.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{assignment.subject_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{assignment.class_name} - {assignment.sec}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                          </div>
                          {isAssignmentOverdue(assignment.due_date, assignment.status) && (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="font-medium">Overdue</span>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-700 line-clamp-2">{assignment.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchSubmittedAssignments(assignment.id);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        View Submissions
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedAssignment(expandedAssignment === assignment.id ? null : assignment.id);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {expandedAssignment === assignment.id ? 
                          <ChevronUp className="h-4 w-4 text-gray-600" /> : 
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedAssignment === assignment.id && (
                    <div className="mt-4 pl-9 border-t pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Assignment Details</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Created By:</span>
                              <span className="text-gray-900 font-medium">You</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Created Date:</span>
                              <span className="text-gray-900 font-medium">
                                {new Date(assignment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Due Date:</span>
                              <span className="text-gray-900 font-medium">
                                {new Date(assignment.due_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Days Remaining:</span>
                              <span className={`font-medium ${
                                isAssignmentOverdue(assignment.due_date, assignment.status) 
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
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Full Description</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
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

        {/* Create Assignment Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Assignment</h2>
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
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Assignment Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter assignment title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Subject ID *
                    </label>
                    <input
                      type="number"
                      placeholder="Enter subject ID (e.g., 132)"
                      value={newAssignment.subject}
                      onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Class Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter class name (e.g., Grade 10)"
                      value={newAssignment.class_name}
                      onChange={(e) => setNewAssignment({ ...newAssignment, class_name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Section *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter section (e.g., A)"
                      value={newAssignment.section}
                      onChange={(e) => setNewAssignment({ ...newAssignment, section: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={newAssignment.due_date}
                      onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Description *
                    </label>
                    <textarea
                      placeholder="Provide detailed assignment description..."
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      rows={4}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Submitted Assignments</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Assignment ID: {selectedAssignmentId} • {submittedAssignments.length} submissions
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
                  <div className="space-y-4">
                    {submittedAssignments.map((submission) => (
                      <div key={submission.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {submission.student_name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {submission.student_email}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                <span>Subject: {submission.subject_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>Class: {getStudentClass(submission.student_email).class_name} - {getStudentClass(submission.student_email).sec}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Submitted: {new Date(submission.submission_date).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Time: {new Date(submission.submission_date).toLocaleTimeString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  submission.is_late ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {submission.is_late ? 'Late Submission' : 'On Time'}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <span className="font-medium text-gray-700">Grade: </span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  submission.grade ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {submission.grade || 'Not Graded'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Feedback: </span>
                                <span className="text-gray-600">
                                  {submission.feedback || 'No feedback provided'}
                                </span>
                              </div>
                            </div>

                            {submission.submission_file && (
                              <div className="flex items-center gap-2">
                                <Download className="h-4 w-4 text-blue-600" />
                                <a 
                                  href={submission.submission_file} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                                >
                                  Download Submission File
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
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