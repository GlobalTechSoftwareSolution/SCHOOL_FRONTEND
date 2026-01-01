"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import axios from "axios";

interface Leave {
  id: number;
  applicant: string;
  approved_by: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/leaves/`;

const StudentLeaves = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewDate, setViewDate] = useState(new Date()); // For Calendar
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ show: false, type: 'info', message: '' });

  const [formData, setFormData] = useState({
    leave_type: "Sick",
    start_date: "",
    end_date: "",
    reason: "",
  });

  // 🧠 Get user email from localStorage
  useEffect(() => {
    const getStoredEmail = () => {
      try {
        const direct = localStorage.getItem("email");
        if (direct) return direct;

        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          if (userInfo?.email) return userInfo.email;
        }

        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData?.email) return userData.email;
        }
      } catch (err) {
        console.warn("Failed to parse localStorage keys for email", err);
      }
      return null;
    };

    const email = getStoredEmail();
    setStudentEmail(email);
  }, []);

  // 📡 Fetch leaves
  useEffect(() => {
    const fetchLeaves = async () => {
      if (!studentEmail) return;
      try {
        setLoading(true);
        const res = await axios.get(API_URL);
        const allLeaves: Leave[] = Array.isArray(res.data) ? res.data : [res.data];
        const myLeaves = allLeaves.filter(
          (leave) => leave.applicant === studentEmail
        );
        setLeaves(myLeaves);
      } catch (error) {
        console.error("❌ Error fetching leaves:", error);
        showNotification('error', 'Failed to load leave records');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [studentEmail]);

  // ✅ Show notification popup
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // ✅ Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit Leave
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentEmail) {
      showNotification('error', 'User email not found. Please refresh the page.');
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      showNotification('error', 'End date cannot be before start date');
      return;
    }

    setSubmitting(true);

    const leaveData = {
      applicant: studentEmail,
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason,
      status: "Pending",
    };

    try {
      const response = await axios.post(API_URL, leaveData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201 || response.status === 200) {
        showNotification('success', 'Leave application submitted successfully!');
        setShowForm(false);
        setFormData({ leave_type: "Sick", start_date: "", end_date: "", reason: "" });

        // Refresh leaves
        const refreshed = await axios.get(API_URL);
        const all = Array.isArray(refreshed.data) ? refreshed.data : [refreshed.data];
        setLeaves(all.filter((l: Leave) => l.applicant === studentEmail));
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("❌ Error submitting leave:", apiError.response?.data || apiError);
      showNotification('error', `Failed to submit leave: ${apiError.response?.data?.message || 'Please try again'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Calculate leave duration
  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  /* ============================ CALENDAR HELPERS ============================ */
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday

    return { daysInMonth, startingDay };
  };

  const changeMonth = (increment: number) => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const isDateHasLeave = (day: number) => {
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    checkDate.setHours(0, 0, 0, 0);

    // Find a leave that covers this date
    const leave = leaves.find(l => {
      const start = new Date(l.start_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(l.end_date);
      end.setHours(0, 0, 0, 0);
      return checkDate >= start && checkDate <= end && l.status.toLowerCase() !== 'rejected'; // Don't show rejected on calendar usually, or maybe show as red? User said "leaves", implies active ones. Let's include all but style them.
    });

    if (!leave) return null;

    // Use specific leave logic for status
    // If multiple leaves cover the same day (rare), just take the first one found
    return {
      status: leave.status,
      type: leave.leave_type
    };
  };

  // ✅ Filters
  const filteredLeaves = leaves.filter(
    (leave) => activeTab === "all" ? true : leave.status.toLowerCase() === activeTab
  );

  // ✅ Helpers
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-green-700 bg-green-50 border border-green-200";
      case "pending":
        return "text-amber-700 bg-amber-50 border border-amber-200";
      case "rejected":
        return "text-red-700 bg-red-50 border border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "✅";
      case "pending":
        return "⏳";
      case "rejected":
        return "❌";
      default:
        return "📄";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading your leave records...</div>
            <p className="text-gray-500 mt-2">Please wait while we fetch your applications</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Notification Popup */}
          {notification.show && (
            <div className={`fixed top-4 right-4 z-50 transform animate-slideInRight ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              } border rounded-2xl p-4 shadow-lg max-w-sm backdrop-blur-sm`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.message}</p>
                </div>
                <button
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                  className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Leave Management
              </h1>
              <p className="text-gray-600 text-lg">Track and manage your leave applications professionally</p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
            >
              <span className="text-xl">+</span>
              Apply for Leave
            </button>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Total Applications</div>
                  <div className="text-2xl font-bold text-gray-900">{leaves.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">⏳</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Pending</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {leaves.filter(l => l.status.toLowerCase() === 'pending').length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Approved</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {leaves.filter(l => l.status.toLowerCase() === 'approved').length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">❌</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Rejected</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {leaves.filter(l => l.status.toLowerCase() === 'rejected').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ◀
                </button>
                <button
                  onClick={() => setViewDate(new Date())}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-semibold text-gray-500">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: getDaysInMonth(viewDate).startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 sm:h-20 bg-gray-50/50 rounded-xl" />
              ))}

              {Array.from({ length: getDaysInMonth(viewDate).daysInMonth }).map((_, i) => {
                const day = i + 1;
                const leaveInfo = isDateHasLeave(day);
                const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();

                let dayColorClass = "bg-white hover:bg-gray-50 border-gray-100";
                if (leaveInfo) {
                  if (leaveInfo.status.toLowerCase() === 'approved') dayColorClass = "bg-green-100 border-green-200 hover:bg-green-200";
                  else if (leaveInfo.status.toLowerCase() === 'pending') dayColorClass = "bg-amber-100 border-amber-200 hover:bg-amber-200";
                  else if (leaveInfo.status.toLowerCase() === 'rejected') dayColorClass = "bg-red-100 border-red-200 hover:bg-red-200";
                } else if (isToday) {
                  dayColorClass = "bg-blue-50 border-blue-200 ring-2 ring-blue-100";
                }

                return (
                  <div
                    key={day}
                    className={`h-10 sm:h-20 border rounded-xl p-1 sm:p-2 transition-all cursor-default relative group ${dayColorClass}`}
                  >
                    <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    {leaveInfo && (
                      <div className="mt-1 hidden sm:block">
                        <span className={`text-xs px-2 py-0.5 rounded-full truncate block w-full text-center ${leaveInfo.status.toLowerCase() === 'approved' ? 'bg-green-200 text-green-800' :
                          leaveInfo.status.toLowerCase() === 'pending' ? 'bg-amber-200 text-amber-800' :
                            'bg-red-200 text-red-800'
                          }`}>
                          {leaveInfo.type}
                        </span>
                      </div>
                    )}
                    {/* Mobile indicator for leave */}
                    {leaveInfo && (
                      <div className={`sm:hidden absolute bottom-2 right-2 w-2 h-2 rounded-full ${leaveInfo.status.toLowerCase() === 'approved' ? 'bg-green-500' :
                        leaveInfo.status.toLowerCase() === 'pending' ? 'bg-amber-500' :
                          'bg-red-500'
                        }`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-600 justify-end">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div> Approved
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div> Pending
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div> Rejected
              </div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/50">
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "approved", "rejected"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${activeTab === tab
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                    }`}
                >
                  <span>{getStatusIcon(tab === 'all' ? 'all' : tab)}</span>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="px-2 py-1 text-xs bg-white/20 rounded-full">
                    {tab === "all"
                      ? leaves.length
                      : leaves.filter(l => l.status.toLowerCase() === tab).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Leaves List */}
          <div className="space-y-6">
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                            leave.status
                          )}`}
                        >
                          {getStatusIcon(leave.status)} {leave.status.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          📅 {calculateDays(leave.start_date, leave.end_date)} days
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {leave.leave_type} Leave
                      </h3>

                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {leave.reason}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">📅 Period:</span>
                          <span>
                            {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">🕐 Applied:</span>
                          <span>{new Date(leave.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:text-right">
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-2">Approved By</div>
                        <div className="font-semibold text-gray-900">
                          {leave.approved_by || "Pending Approval"}
                        </div>
                        {leave.updated_at && (
                          <div className="text-xs text-gray-500 mt-2">
                            Updated: {new Date(leave.updated_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-12 text-center border border-white/50">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No leaves found
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === "all"
                    ? "You haven't applied for any leaves yet."
                    : `No ${activeTab} leave applications found.`}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Apply for Your First Leave
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Apply Leave Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-3xl p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Apply for Leave</h2>
                    <p className="text-blue-100">Fill in the details to submit your leave application</p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                    disabled={submitting}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Leave Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Leave Type *
                    </label>
                    <select
                      name="leave_type"
                      value={formData.leave_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={submitting}
                    >
                      <option value="Sick">Sick Leave</option>
                      <option value="Casual">Casual Leave</option>
                      <option value="Vacation">Vacation Leave</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        required
                        min={formData.start_date || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  {/* Duration Info */}
                  {formData.start_date && formData.end_date && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <div className="text-sm text-blue-700 font-medium">
                        📅 Leave Duration: {calculateDays(formData.start_date, formData.end_date)} days
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason for Leave *
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Please provide a detailed reason for your leave application..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Submitting...
                      </div>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out;
          }
          .animate-slideInRight {
            animation: slideInRight 0.3s ease-out;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default StudentLeaves;