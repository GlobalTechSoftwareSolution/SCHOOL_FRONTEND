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
  Trash2,
  Mail,
  Loader2,
  Users,
  MessageSquare,
  Clock,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/`;

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

interface User {
  email: string;
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
  const [user, setUser] = useState<User | null>(null);
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
      await axios.post(`${API_BASE}notices/`, noticePayload);

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
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shrink-0">
                    <Bell className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Notice Management
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Communicate with students & parents
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForm(true)}
                  className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold group"
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{notices.length}</p>
                  <p className="text-gray-600 text-xs md:text-sm">Total Notices</p>
                </div>
                <div className="p-2 md:p-3 bg-blue-100 rounded-xl">
                  <Bell className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{students.length}</p>
                  <p className="text-gray-600 text-xs md:text-sm">Total Students</p>
                </div>
                <div className="p-2 md:p-3 bg-green-100 rounded-xl">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {notices.filter(n => n.notice_by === user?.email).length}
                  </p>
                  <p className="text-gray-600 text-xs md:text-sm">Your Notices</p>
                </div>
                <div className="p-2 md:p-3 bg-purple-100 rounded-xl">
                  <Send className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                  <p className="text-gray-600 text-xs md:text-sm">This Month</p>
                </div>
                <div className="p-2 md:p-3 bg-orange-100 rounded-xl">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto"
                onClick={() => setShowForm(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl my-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 md:p-8">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/20 rounded-xl">
                          <Plus className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold">New Notice</h2>
                      </div>
                      <button
                        onClick={() => setShowForm(false)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh]">
                    <form onSubmit={handleAddNotice} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                          Notice Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          placeholder="e.g. Exam Schedule Update"
                          value={newNotice.title}
                          onChange={handleChange}
                          className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                          Message
                        </label>
                        <textarea
                          name="message"
                          placeholder="What would you like to share?"
                          value={newNotice.message}
                          onChange={handleChange}
                          rows={4}
                          className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all resize-none font-medium text-gray-900"
                          required
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700 ml-1 block">
                          Recipients
                        </label>
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 transition-colors group-focus-within:text-blue-500" />
                          <input
                            type="text"
                            placeholder="Find a student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
                          />
                        </div>

                        <select
                          name="notice_to"
                          value={newNotice.notice_to}
                          onChange={handleChange}
                          className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
                          required
                        >
                          <option value="">Select recipient</option>
                          {filteredStudents.map((student) => (
                            <option key={student.email} value={student.email}>
                              {student.fullname} {student.class_name ? `(${student.class_name})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="flex-1 order-2 sm:order-1 px-8 py-4 text-gray-500 hover:text-gray-700 font-bold transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 order-1 sm:order-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-xl shadow-blue-200 transition-all font-bold flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                          Send Notice
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
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20"
          >
            <div className="p-6 md:p-8 border-b border-gray-100">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Bell className="h-6 w-6 text-blue-600" />
                    Message History
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 transition-colors group-focus-within:text-blue-500" />
                    <input
                      type="text"
                      placeholder="Search history..."
                      value={noticeSearch}
                      onChange={(e) => setNoticeSearch(e.target.value)}
                      className="w-full sm:w-64 pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="flex bg-gray-50 p-1 rounded-xl">
                    <button
                      onClick={() => setActiveFilter("all")}
                      className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeFilter === "all"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveFilter("my")}
                      className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeFilter === "my"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                      Mine
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl">
                  <div className="relative">
                    <div className="h-16 w-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                  <p className="mt-4 text-gray-500 font-medium">Getting notices...</p>
                </div>
              ) : filteredNotices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {filteredNotices
                    .sort((a, b) => new Date(b.posted_date || 0).getTime() - new Date(a.posted_date || 0).getTime())
                    .map((notice, index) => (
                      <motion.div
                        key={notice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group p-6 rounded-3xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 relative flex flex-col h-full bg-white shadow-sm hover:shadow-xl`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all text-blue-600">
                            <Bell className="h-5 w-5" />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotice(notice.id!);
                            }}
                            className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                          {notice.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                          {notice.message}
                        </p>

                        <div className="space-y-3 mt-auto pt-4 border-t border-gray-50">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md max-w-[120px] truncate">
                              <User className="h-3 w-3 shrink-0" />
                              {notice.notice_by?.split('@')[0]}
                            </span>
                            <span className="flex items-center gap-1.5 shrink-0">
                              <Clock className="h-3 w-3" />
                              {getRelativeTime(notice.posted_date || "")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 truncate">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                            <span className="truncate">To: {notice.notice_to}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                    <Bell className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-500 max-w-xs mx-auto mb-8 text-sm">
                    {noticeSearch
                      ? "Couldn't find any notices matching your search."
                      : "You haven't posted any notices yet."
                    }
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200"
                  >
                    Start Communicating
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
