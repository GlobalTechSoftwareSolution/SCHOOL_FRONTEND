"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiSearch,
  FiPlus,
  FiX,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiEye,
  FiMessageSquare,
  FiPaperclip,
  FiUser,
  FiCalendar,
  FiSend,
  FiArchive,
  FiAlertCircle,
  FiTrendingUp
} from "react-icons/fi";


const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/issues/";

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

interface Comment {
  id?: number;
  text: string;
  author: string;
  created_at: string;
}

const Issues_Page = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newIssue, setNewIssue] = useState({
    subject: "",
    description: "",
    priority: "Low",
    raised_to: "",
  });
  const [search, setSearch] = useState("");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
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
      const res = await axios.get(API_URL);
      setIssues(res.data);
    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // ✅ Add new issue
  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const issueData = {
        ...newIssue,
        raised_by: localStorage.getItem("email") || "admin@school.com",
        status: "Open"
      };
      
      await axios.post(API_URL, issueData);
      setShowForm(false);
      setNewIssue({
        subject: "",
        description: "",
        priority: "Low",
        raised_to: "",
      });
      fetchIssues();
    } catch (err) {
      console.error("Error adding issue:", err);
      alert("Failed to create issue.");
    }
  };

  // ✅ Update status
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await axios.patch(`${API_URL}${id}/`, { status: newStatus });
      fetchIssues();
      if (selectedIssue && selectedIssue.id === id) {
        setSelectedIssue({ ...selectedIssue, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update issue status.");
    }
  };

  // ✅ Add comment/description update with email
const handleAddComment = async () => {
  if (!newComment.trim() || !selectedIssue) return;

  try {
    // 🔹 Get commenter email from localStorage
    const commenterEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("email")
        : "admin@school.com";

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
  } catch (err) {
    console.error("Error adding comment:", err);
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
    } catch (err) {
      console.error("Error deleting issue:", err);
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
    } catch (err) {
      console.error("Error fetching issue details:", err);
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

  
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">🎯 Issue Management</h1>
            <p className="text-gray-600 mt-2">Track and resolve system issues efficiently</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            {showForm ? <FiX className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
            {showForm ? "Close Form" : "Report New Issue"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-gray-600 text-sm mt-1">Total Issues</div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <FiArchive className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.open}</div>
              <div className="text-gray-600 text-sm mt-1">Open Issues</div>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
              <div className="text-gray-600 text-sm mt-1">In Progress</div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <FiClock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.closed}</div>
              <div className="text-gray-600 text-sm mt-1">Resolved</div>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.highPriority}</div>
              <div className="text-gray-600 text-sm mt-1">High Priority</div>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Issue Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiPlus className="w-5 h-5 text-blue-600" />
            Report New Issue
          </h2>
          
          <form onSubmit={handleAddIssue} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={newIssue.subject}
                onChange={(e) => setNewIssue({ ...newIssue, subject: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter issue subject..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                value={newIssue.priority}
                onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To *
              </label>
              <input
                type="email"
                value={newIssue.raised_to}
                onChange={(e) => setNewIssue({ ...newIssue, raised_to: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter recipient email..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Describe the issue in detail..."
              />
            </div>

            <div className="md:col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Create Issue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search issues by subject or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading issues...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No issues found</h3>
            <p className="text-gray-500">
              {search ? 'Try adjusting your search terms' : 'No issues have been reported yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Issue Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm mb-1">{issue.subject}</div>
                        <div className="text-gray-600 text-xs line-clamp-2">{issue.description}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {new Date(issue.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </td>
                   <td className="px-6 py-4">
  <select
    value={issue.status}
    onChange={(e) => handleStatusChange(issue.id, e.target.value)}
    className={`px-3 py-1 rounded-full text-sm font-medium border focus:outline-none ${getStatusColor(
      issue.status
    )}`}
  >
    <option value="Open">Open</option>
    <option value="In Progress">In Progress</option>
    <option value="Closed">Closed</option>
  </select>
</td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{issue.raised_to || "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(issue)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        
                        {issue.status !== "Closed" && (
                          <button
                            onClick={() => handleStatusChange(issue.id, "Closed")}
                            className="bg-green-50 hover:bg-green-100 text-green-700 p-2 rounded-lg transition-colors"
                            title="Close Issue"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {issue.status === "Open" && (
                          <button
                            onClick={() => handleStatusChange(issue.id, "In Progress")}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-2 rounded-lg transition-colors"
                            title="Mark In Progress"
                          >
                            <FiClock className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(issue.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg transition-colors"
                          title="Delete Issue"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ Enhanced View Issue Modal */}
      {showView && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedIssue.subject}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 ${getPriorityColor(selectedIssue.priority)}`}>
                      {selectedIssue.priority} Priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 ${getStatusColor(selectedIssue.status)}`}>
                      {getStatusIcon(selectedIssue.status)}
                      {selectedIssue.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowView(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "details" 
                      ? "border-blue-500 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  📋 Issue Details
                </button>
                <button
                  onClick={() => setActiveTab("comments")}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "comments" 
                      ? "border-blue-500 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  💬 Add Comment
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === "details" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Raised By</label>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {selectedIssue.raised_by || "—"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {selectedIssue.raised_to || "—"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {new Date(selectedIssue.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {new Date(selectedIssue.updated_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FiMessageSquare className="w-4 h-4" />
                      Description
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-line">{selectedIssue.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Add Comment / Update</h3>
                    <div className="space-y-3">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Add your comment or update here. This will be appended to the issue description..."
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                      >
                        <FiSend className="w-4 h-4" />
                        Add Comment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex gap-3 justify-between">
                <div className="flex gap-3">
                  {selectedIssue.status !== "Closed" && (
                    <button
                      onClick={() => handleStatusChange(selectedIssue.id, "Closed")}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      Close Issue
                    </button>
                  )}
                  {selectedIssue.status === "Open" && (
                    <button
                      onClick={() => handleStatusChange(selectedIssue.id, "In Progress")}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      <FiClock className="w-4 h-4" />
                      Mark In Progress
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(selectedIssue.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Issues_Page;