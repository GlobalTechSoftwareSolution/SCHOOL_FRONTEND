"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock4,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Download,
  FileText,
  User,
  Clock,
  AlertCircle,
  X
} from "lucide-react";

interface Leave {
  id: number;
  applicant_email: string;
  approved_by_email: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
  updated_at: string;
  applicant?: string;
  approved_by?: string;
}

const API_BASE_URL =
  "https://school.globaltechsoftwaresolutions.cloud/api/leaves/";

const TeacherLeavesPage = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewLeaveForm, setShowNewLeaveForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedLeave, setExpandedLeave] = useState<number | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [newLeave, setNewLeave] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const leaveTypes = ["Sick", "Casual", "Vacation",  "Other"];

  useEffect(() => {
    fetchLeaves();
  }, []);

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

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem("userData");
      if (!userData) throw new Error("No user data found");
      const { email } = JSON.parse(userData);

      const response = await axios.get(API_BASE_URL);
      const teacherLeaves = response.data.filter(
        (leave: Leave) => leave.applicant_email === email
      );
      setLeaves(teacherLeaves);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      showPopup('error', "Failed to load leave applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const userData = localStorage.getItem("userData");
      if (!userData) throw new Error("User data not found");
      const { email } = JSON.parse(userData);

      const leaveData = {
        applicant: email,
        leave_type: newLeave.leave_type,
        start_date: newLeave.start_date,
        end_date: newLeave.end_date,
        reason: newLeave.reason,
      };

      const res = await axios.post(API_BASE_URL, leaveData);

      if (res.status === 201 || res.status === 200) {
        showPopup('success', "Leave application submitted successfully!");
        fetchLeaves();
        setShowNewLeaveForm(false);
        setNewLeave({ leave_type: "", start_date: "", end_date: "", reason: "" });
      }
    } catch (error: any) {
      console.error("Error submitting leave:", error.response?.data || error.message);
      showPopup('error', "Failed to submit leave application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLeave = async (leaveId: number) => {
    if (!confirm("Are you sure you want to delete this leave application?")) return;
    try {
      await axios.delete(`${API_BASE_URL}${leaveId}/`);
      showPopup('success', "Leave application deleted successfully");
      fetchLeaves();
    } catch (error) {
      console.error("Error deleting leave:", error);
      showPopup('error', "Failed to delete leave application");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock4 className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500";
      case "Rejected":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const filteredLeaves = leaves
    .filter((leave) => {
      const matchesSearch =
        leave.leave_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || leave.status === statusFilter;
      const matchesType =
        typeFilter === "all" || leave.leave_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "start_date":
          return (
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          );
        default:
          return 0;
      }
    });

  const stats = [
    { 
      label: "Total Applications", 
      value: leaves.length, 
      color: "blue",
      icon: FileText
    },
    {
      label: "Pending",
      value: leaves.filter((l) => l.status === "Pending").length,
      color: "yellow",
      icon: Clock
    },
    {
      label: "Approved",
      value: leaves.filter((l) => l.status === "Approved").length,
      color: "green",
      icon: CheckCircle
    },
    {
      label: "Rejected",
      value: leaves.filter((l) => l.status === "Rejected").length,
      color: "red",
      icon: XCircle
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
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
              <h1 className="text-3xl font-bold text-gray-900">Teacher Leave Management</h1>
              <p className="text-gray-600 mt-2">
                Manage your leave applications and track their status
              </p>
            </div>
            <button
              onClick={() => setShowNewLeaveForm(true)}
              className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Apply for Leave
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                    <IconComponent className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by leave type or reason..."
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
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="start_date">Start Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leaves List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredLeaves.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No leave applications found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by applying for your first leave application."}
              </p>
              <button
                onClick={() => setShowNewLeaveForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Apply for Leave
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedLeave(expandedLeave === leave.id ? null : leave.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getStatusIcon(leave.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {leave.leave_type} Leave
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                              leave.status
                            )}`}
                          >
                            {leave.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock4 className="h-4 w-4" />
                            <span>{calculateDays(leave.start_date, leave.end_date)} days</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Applied: {new Date(leave.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 line-clamp-2">{leave.reason}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedLeave(expandedLeave === leave.id ? null : leave.id);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {expandedLeave === leave.id ? 
                          <ChevronUp className="h-4 w-4 text-gray-600" /> : 
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        }
                      </button>
                      
                      {leave.status === "Pending" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLeave(leave.id);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          title="Delete application"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedLeave === leave.id && (
                    <div className="mt-4 pl-9 border-t pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Application Details</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Applied On:</span>
                              <span className="text-gray-900 font-medium">
                                {new Date(leave.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Last Updated:</span>
                              <span className="text-gray-900 font-medium">
                                {new Date(leave.updated_at).toLocaleString()}
                              </span>
                            </div>
                            {leave.approved_by && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Approved By:</span>
                                <span className="text-gray-900 font-medium">{leave.approved_by}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Reason</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                            {leave.reason}
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

        {/* Leave Form Modal */}
        {showNewLeaveForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Apply for Leave</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Fill in the details for your leave application
                  </p>
                </div>
                <button
                  onClick={() => setShowNewLeaveForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSubmitLeave} className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Leave Type *
                    </label>
                    <select
                      required
                      value={newLeave.leave_type}
                      onChange={(e) =>
                        setNewLeave({ ...newLeave, leave_type: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Leave Type</option>
                      {leaveTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={newLeave.start_date}
                        onChange={(e) =>
                          setNewLeave({ ...newLeave, start_date: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={newLeave.end_date}
                        onChange={(e) =>
                          setNewLeave({ ...newLeave, end_date: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {newLeave.start_date && newLeave.end_date && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-blue-800 font-medium">
                          Total Leave Duration: {calculateDays(newLeave.start_date, newLeave.end_date)} days
                        </p>
                        <p className="text-blue-700 text-sm">
                          From {new Date(newLeave.start_date).toLocaleDateString()} to {new Date(newLeave.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Reason for Leave *
                  </label>
                  <textarea
                    required
                    value={newLeave.reason}
                    onChange={(e) =>
                      setNewLeave({ ...newLeave, reason: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Please provide a detailed reason for your leave application..."
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowNewLeaveForm(false)}
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
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherLeavesPage;