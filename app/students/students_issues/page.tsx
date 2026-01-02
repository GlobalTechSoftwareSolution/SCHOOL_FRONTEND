"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiSearch,
  FiX,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiEye,
  FiMessageSquare,
  FiUser,
  FiCalendar,
  FiSend,
  FiArchive,
  FiAlertCircle,
  FiTrendingUp
} from "react-icons/fi";
import DashboardLayout from "@/app/components/DashboardLayout";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/issues/`;

interface Issue {
  id: number;
  subject: string;
  status: string;
  description: string;
  priority: string;
  created_at: string;
  updated_at: string;
  raised_by: string | null;
  raised_to: string | null;
  closed_description?: string;
}

interface ApiError {
  message?: string;
  code?: string;
  response?: {
    data?: unknown;
    status?: number;
  };
}

const Issues_Page = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [search, setSearch] = useState("");
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  // Stats calculation
  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === "Open").length,
    inProgress: issues.filter(i => i.status === "In Progress").length,
    closed: issues.filter(i => i.status === "Closed").length,
    highPriority: issues.filter(i => i.priority === "High").length,
  };

  // ✅ Fetch all issues
  const fetchIssues = async () => {
    try {
      setLoading(true);

      // Get user email from localStorage
      const userEmail = localStorage.getItem("email") ||
        JSON.parse(localStorage.getItem("userData") || "{}")?.email ||
        JSON.parse(localStorage.getItem("userInfo") || "{}")?.email;


      if (!userEmail) {
        console.error("No user email found in localStorage");
        setLoading(false);
        return;
      }

      // Fetch all issues
      const res = await axios.get(API_URL);


      // Check if we got data
      if (!res.data || !Array.isArray(res.data)) {
        console.error("Invalid data received from API:", res.data);
        setIssues([]);
        return;
      }

      // Filter issues to show those raised to the current user OR raised by the current user
      const userIssues = res.data.filter((issue: Issue) => {
        const issueRaisedTo = issue.raised_to?.toLowerCase().trim();
        const issueRaisedBy = issue.raised_by?.toLowerCase().trim();
        const userEmailLower = userEmail.toLowerCase().trim();
        const matches = issueRaisedTo === userEmailLower || issueRaisedBy === userEmailLower;
        return matches;
      });


      setIssues(userIssues);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error("Error fetching issues:", apiError);
      console.error("Error details:", {
        message: apiError.message,
        code: apiError.code,
        response: apiError.response?.data,
        status: apiError.response?.status
      });

      // Set empty array on error to avoid infinite loading
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔍 Checking localStorage values:");
    console.log("email:", localStorage.getItem("email"));
    console.log("userData:", localStorage.getItem("userData"));
    console.log("userInfo:", localStorage.getItem("userInfo"));

    fetchIssues();
  }, []);

  // ✅ Update status
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await axios.patch(`${API_URL}${id}/`, { status: newStatus });
      fetchIssues();
      if (selectedIssue && selectedIssue.id === id) {
        setSelectedIssue({ ...selectedIssue, status: newStatus });
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error("Error updating status:", apiError);
      console.error("Error details:", {
        message: apiError.message,
        code: apiError.code,
        response: apiError.response?.data,
        status: apiError.response?.status
      });
      alert("Failed to update issue status.");
    }
  };

  // ✅ Add comment/description update with email
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedIssue) return;

    try {
      // 🔹 Get commenter email from localStorage
      const commenterEmail = localStorage.getItem("email") ||
        JSON.parse(localStorage.getItem("userData") || "{}")?.email ||
        JSON.parse(localStorage.getItem("userInfo") || "{}")?.email ||
        "admin@school.com";

      // 🔹 Format the comment with email + timestamp
      const updatedDescription =
        selectedIssue.description +
        `\n\n--- Comment by ${commenterEmail} [${new Date().toLocaleString()}] ---\n${newComment}`;

      // 🔹 Update issue in API
      await axios.patch(`${API_URL}${selectedIssue.id}/`, {
        description: updatedDescription,
      });

      // 🔹 Refresh current issue details from API
      const res = await axios.get(`${API_URL}${selectedIssue.id}/`);
      setSelectedIssue(res.data);
      setNewComment("");
      fetchIssues(); // Refresh list silently
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error("Error adding comment:", apiError);
      console.error("Error details:", {
        message: apiError.message,
        code: apiError.code,
        response: apiError.response?.data,
        status: apiError.response?.status
      });
      // Instead of alert, show smooth inline message
      setNewComment("❌ Failed to add comment. Try again.");
      setTimeout(() => setNewComment(""), 2000);
    }
  };

  // ✅ Delete issue
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this issue?")) return;
    try {
      await axios.delete(`${API_URL}${id}/`);
      fetchIssues();
      if (selectedIssue && selectedIssue.id === id) {
        setShowView(false);
        setSelectedIssue(null);
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error("Error deleting issue:", apiError);
      console.error("Error details:", {
        message: apiError.message,
        code: apiError.code,
        response: apiError.response?.data,
        status: apiError.response?.status
      });
      alert("Failed to delete issue.");
    }
  };

  // ✅ View issue
  const handleView = async (issue: Issue) => {
    setSelectedIssue(issue);
    setShowView(true);
    setActiveTab("details");

    // Fetch full issue details
    try {
      const res = await axios.get(`${API_URL}${issue.id}/`);
      setSelectedIssue(res.data);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error("Error fetching issue details:", apiError);
      console.error("Error details:", {
        message: apiError.message,
        code: apiError.code,
        response: apiError.response?.data,
        status: apiError.response?.status
      });
    }
  };

  const filteredIssues = issues.filter(
    (i) =>
      i.subject.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Closed": return "bg-green-100 text-green-800 border-green-200";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Open": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Closed": return <FiCheckCircle className="w-4 h-4" />;
      case "In Progress": return <FiClock className="w-4 h-4" />;
      case "Open": return <FiAlertTriangle className="w-4 h-4" />;
      default: return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  // Issue Card Component
  const IssueCard = ({ issue }: { issue: Issue }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-base line-clamp-2 flex-1 pr-2">
            {issue.subject}
          </h3>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => handleView(issue)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg transition-colors"
              title="View Details"
            >
              <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => handleDelete(issue.id)}
              className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg transition-colors"
              title="Delete Issue"
            >
              <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {issue.description}
        </p>

        {/* Status and Priority */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(issue.priority)}`}>
            {issue.priority}
          </span>
          <select
            value={issue.status}
            onChange={(e) => handleStatusChange(issue.id, e.target.value)}
            className={`px-2 py-1 rounded-full text-xs font-medium border focus:outline-none ${getStatusColor(issue.status)}`}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Footer Info */}
        <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              {new Date(issue.created_at).toLocaleDateString()}
            </span>
            {issue.raised_to && (
              <span className="text-xs text-gray-600 truncate max-w-[120px]" title={issue.raised_to}>
                👤 {issue.raised_to}
              </span>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex gap-1">
            {issue.status !== "Closed" && (
              <button
                onClick={() => handleStatusChange(issue.id, "Closed")}
                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-1 px-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <FiCheckCircle className="w-3 h-3" />
                Close
              </button>
            )}
            {issue.status === "Open" && (
              <button
                onClick={() => handleStatusChange(issue.id, "In Progress")}
                className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 py-1 px-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <FiClock className="w-3 h-3" />
                Progress
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🎯 Issue Management</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Track and resolve system issues efficiently</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-gray-600 text-xs sm:text-sm mt-1">Total Issues</div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FiArchive className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.open}</div>
                <div className="text-gray-600 text-xs sm:text-sm mt-1">Open Issues</div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-50 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FiAlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.inProgress}</div>
                <div className="text-gray-600 text-xs sm:text-sm mt-1">In Progress</div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FiClock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.closed}</div>
                <div className="text-gray-600 text-xs sm:text-sm mt-1">Resolved</div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-50 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.highPriority}</div>
                <div className="text-gray-600 text-xs sm:text-sm mt-1">High Priority</div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-50 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search issues by subject or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Issues Cards Grid */}
        <div className="bg-transparent">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-3 sm:mt-4 text-sm sm:text-base">Loading issues...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-300 text-4xl sm:text-6xl mb-3 sm:mb-4">📝</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">No issues found</h3>
              <p className="text-gray-500 text-sm sm:text-base">
                {search ? 'Try adjusting your search terms' : 'No issues have been reported yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>

        {/* ✅ Enhanced View Issue Modal */}
        {showView && selectedIssue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 line-clamp-2">{selectedIssue.subject}</h2>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-white bg-opacity-20 ${getPriorityColor(selectedIssue.priority)}`}>
                        {selectedIssue.priority} Priority
                      </span>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-white bg-opacity-20 ${getStatusColor(selectedIssue.status)}`}>
                        {getStatusIcon(selectedIssue.status)}
                        {selectedIssue.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowView(false)}
                    className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
                  >
                    <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "details"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    📋 Issue Details
                  </button>
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "comments"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    💬 Add Comment
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
                {activeTab === "details" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                        <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Raised By</label>
                          <div className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg">
                            {selectedIssue.raised_by || "—"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                          <div className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg">
                            {selectedIssue.raised_to || "—"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Created</label>
                          <div className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg">
                            {new Date(selectedIssue.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                          <div className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg">
                            {new Date(selectedIssue.updated_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                        <FiMessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                        Description
                      </h3>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700 whitespace-pre-line text-xs sm:text-sm">{selectedIssue.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "comments" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Add Comment / Update</h3>
                      <div className="space-y-3">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={4}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                          placeholder="Add your comment or update here. This will be appended to the issue description..."
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                          <FiSend className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add Comment
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-between">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {selectedIssue.status !== "Closed" && (
                      <button
                        onClick={() => handleStatusChange(selectedIssue.id, "Closed")}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base justify-center flex-1"
                      >
                        <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Close Issue
                      </button>
                    )}
                    {selectedIssue.status === "Open" && (
                      <button
                        onClick={() => handleStatusChange(selectedIssue.id, "In Progress")}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base justify-center flex-1"
                      >
                        <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                        Mark In Progress
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(selectedIssue.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base justify-center flex-1 sm:flex-none"
                  >
                    <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Delete Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Issues_Page;