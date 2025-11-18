"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { 
  Bell, 
  Plus, 
  Send, 
  User, 
  Calendar,
  Search,
  Filter,
  Eye,
  Trash2,
  Mail,
  BookOpen,
  Loader2,
  Users,
  MessageSquare,
  Clock,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api/";

interface Notice {
  id?: number;
  title: string;
  message: string;
  posted_date?: string;
  notice_by?: string;
  notice_to?: string;
}

interface Student {
  email: string;
  fullname: string;
  class_name?: string;
  section?: string;
}

const TeacherNoticePage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [newNotice, setNewNotice] = useState({
    title: "",
    message: "",
    notice_to: "",
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [noticeSearch, setNoticeSearch] = useState("");

  // ✅ Step 1: Fetch teacher info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
    } else {
      console.error("❌ No user found in localStorage");
    }
  }, []);

  // ✅ Step 2: Fetch all notices
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}notices/`);
      setNotices(res.data);
    } catch (err) {
      console.error("❌ Error fetching notices:", err);
      setError("Failed to load notices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // ✅ Step 3: Fetch all students for dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${API_BASE}students/`);
        setStudents(res.data);
        setFilteredStudents(res.data);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
      }
    };
    fetchStudents();
  }, []);

  // ✅ Filter students based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(student =>
        student.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  // ✅ Filter notices based on active filter and search
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(noticeSearch.toLowerCase()) ||
                         notice.message.toLowerCase().includes(noticeSearch.toLowerCase());
    
    if (activeFilter === "my") {
      return matchesSearch && notice.notice_by === user?.email;
    }
    
    return matchesSearch;
  });

  // ✅ Step 4: Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setNewNotice({ ...newNotice, [e.target.name]: e.target.value });
  };

  // ✅ Step 5: Create new notice (POST)
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error("❌ No logged-in user found");
      setError("No logged-in user found");
      return;
    }

    const selectedStudent = students.find(
      (s) => s.email === newNotice.notice_to
    );

    if (!selectedStudent) {
      console.error("❌ No student selected");
      setError("Please select a student");
      return;
    }

    const noticePayload = {
      title: newNotice.title,
      message: newNotice.message,
      notice_by: user.email,
      notice_to: selectedStudent.email,
    };
       

    try {
      setSubmitting(true);
      setError("");
      const res = await axios.post(`${API_BASE}notices/`, noticePayload);

      // Refresh notices list after adding
      await fetchNotices();

      // Reset form and show success
      setNewNotice({ title: "", message: "", notice_to: "" });
      setShowForm(false);
      setSuccess("Notice sent successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("❌ Error creating notice:", err);
      setError("Failed to create notice. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Delete notice
  const handleDeleteNotice = async (noticeId: number) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    try {
      await axios.delete(`${API_BASE}notices/${noticeId}/`);
      setSuccess("Notice deleted successfully!");
      fetchNotices();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("❌ Error deleting notice:", err);
      setError("Failed to delete notice.");
    }
  };

  // ✅ Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Get relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8 border border-white/20">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                    <Bell className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Notice Management
                    </h1>
                    <p className="text-gray-600 mt-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Communicate effectively with students and parents
                    </p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold group"
                >
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                  New Notice
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notices.length}</p>
                  <p className="text-gray-600 text-sm">Total Notices</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                  <p className="text-gray-600 text-sm">Total Students</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {notices.filter(n => n.notice_by === user?.email).length}
                  </p>
                  <p className="text-gray-600 text-sm">Your Notices</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Send className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                  <p className="text-gray-600 text-sm">This Month</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700 font-medium">{success}</span>
                </div>
                <button onClick={() => setSuccess("")} className="text-green-500 hover:text-green-700 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
                <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add New Notice Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                onClick={() => setShowForm(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Send className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Create New Notice</h2>
                      </div>
                      <button
                        onClick={() => setShowForm(false)}
                        className="p-2 text-white/80 hover:text-white transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <form onSubmit={handleAddNotice} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Notice Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          placeholder="Enter a clear and concise title..."
                          value={newNotice.title}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Message Content *
                        </label>
                        <textarea
                          name="message"
                          placeholder="Write your detailed notice message here..."
                          value={newNotice.message}
                          onChange={handleChange}
                          rows={5}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Send To Student *
                        </label>
                        <div className="space-y-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                              type="text"
                              placeholder="Search students by name or email..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <select
                            name="notice_to"
                            value={newNotice.notice_to}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                          >
                            <option value="">Select a student</option>
                            {filteredStudents.map((student) => (
                              <option key={student.email} value={student.email}>
                                {student.fullname} ({student.email}) {student.class_name && `- ${student.class_name}${student.section ? `-${student.section}` : ''}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
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
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending Notice...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Notice
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notices List Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20"
          >
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Recent Notices
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search notices..."
                      value={noticeSearch}
                      onChange={(e) => setNoticeSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setActiveFilter("all")}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeFilter === "all" 
                          ? "bg-blue-500 text-white" 
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveFilter("my")}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeFilter === "my" 
                          ? "bg-blue-500 text-white" 
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      My Notices
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Loading notices...</span>
                </div>
              ) : filteredNotices.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotices
                    .sort((a, b) => new Date(b.posted_date || 0).getTime() - new Date(a.posted_date || 0).getTime())
                    .map((notice, index) => (
                      <motion.div
                        key={notice.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 border border-gray-200/50 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer ${
                          selectedNotice?.id === notice.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                        }`}
                        onClick={() => setSelectedNotice(selectedNotice?.id === notice.id ? null : notice)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-bold text-gray-900 text-lg pr-4">
                                {notice.title}
                              </h3>
                              {notice.posted_date && (
                                <div className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">
                                  <Clock className="h-4 w-4" />
                                  <span>{getRelativeTime(notice.posted_date)}</span>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-4 leading-relaxed">
                              {notice.message}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                                <User className="h-3 w-3 text-blue-600" />
                                <span className="font-medium">From: {notice.notice_by || "Unknown"}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                                <Mail className="h-3 w-3 text-green-600" />
                                <span className="font-medium">To: {notice.notice_to || "All"}</span>
                              </div>
                              {notice.posted_date && (
                                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                                  <Calendar className="h-3 w-3 text-purple-600" />
                                  <span>{formatDate(notice.posted_date)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-4">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotice(notice.id!);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No Notices Found
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {noticeSearch || activeFilter === "my" 
                      ? "No notices match your current filters. Try adjusting your search criteria." 
                      : "Get started by creating your first notice to communicate with students and parents."
                    }
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium"
                  >
                    Create Your First Notice
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherNoticePage;