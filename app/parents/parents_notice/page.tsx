"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { X, Calendar, User, CheckCircle } from "lucide-react";

const API = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

interface Student {
  id?: number;
  email: string;
  fullname?: string;
  class_id: number;
  section?: string;
  parent?: string;
}

interface ClassInfo {
  id: number;
  class_name: string;
  sec?: string;
  class_teacher?: string;
}

interface Notice {
  id: number;
  title: string;
  message: string;
  email?: string;
  notice_to_email?: string;
  posted_date: string;
  category?: string;
  priority?: string;
  important?: boolean;
}

interface Tab {
  id: string;
  label: string;
  icon: string;
}

export default function ParentNoticesPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [children, setChildren] = useState<Student[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentBaseNotices, setStudentBaseNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  let parentEmail = null;

  // Fetch parent email from localStorage
  if (typeof window !== "undefined") {
    try {
      const userDataStr = localStorage.getItem("userData");
      const userInfoStr = localStorage.getItem("userInfo");

      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

      parentEmail = userData?.email || userInfo?.email || null;
    } catch (e) {
      console.error("❌ LocalStorage error:", e);
    }
  }

  // Helper to normalize email strings (remove extra labels, spaces, etc.)
  const normalizeEmail = (value: string | null | undefined) => {
    if (!value) return "";
    const str = String(value).trim();
    // Remove anything after first space or "(" (e.g. "student@example.com (Student)")
    const firstPart = str.split(" ")[0].split("(")[0];
    // If there is a comma-separated list, take the first email
    return firstPart.split(",")[0].trim().toLowerCase();
  };

  // ======================================================
  // 1️⃣ Load Students → Filter children using s.parent
  // ======================================================
  const loadChildren = async () => {
    setLoading(true);
    try {
      const stuRes = await axios.get<Student[]>(`${API}/students/`);
      const myKids = stuRes.data.filter((s: Student) =>
        normalizeEmail(s.parent) === normalizeEmail(parentEmail)
      );

      if (myKids.length === 0) {
        setLoading(false);
        return;
      }

      setChildren(myKids);
      // Set first student as selected by default
      if (myKids.length > 0) {
        setSelectedStudent(myKids[0]);
      }

      // Fetch class info
      const class_id = myKids[0].class_id;

      const classRes = await axios.get<ClassInfo[]>(`${API}/classes/`);
      const info = classRes.data.find((c: ClassInfo) => c.id === class_id);

      setClassInfo(info || null);

      // Load notices
      await loadNotices();

    } catch (err) {
      console.error("❌ Error loading children:", err);
    }
    setLoading(false);
  };

  // ======================================================
  // 2️⃣ Load Notices (all) - we'll filter per student when selected
  // ======================================================
  const loadNotices = async () => {
    try {
      const noticeRes = await axios.get<Notice[]>(`${API}/notices/`);
      const allNotices = Array.isArray(noticeRes.data) ? noticeRes.data : [];

      // Keep all notices; per-student filtering happens in handleStudentSelect
      setNotices(allNotices);
      setNotices(allNotices);
      // setFilteredNotices is handled by useEffect now

    } catch (err) {
      console.error("❌ Notice load error:", err);
    }
  };

  // ======================================================
  // Filter notices by selected student
  // ======================================================
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab("all");
  };

  // ======================================================
  // Filter notices by category/priority
  // ======================================================
  const filterNoticesByType = (type: string) => {
    setActiveTab(type);
  };

  // ======================================================
  // EFFECT: Update studentBaseNotices when notices or selectedStudent changes
  // ======================================================
  useEffect(() => {
    if (selectedStudent) {
      const studentEmail = normalizeEmail(selectedStudent.email);
      console.log("Filtering notices for:", studentEmail);

      const base = notices.filter((n: Notice) => {
        // Check both 'email' and 'notice_to_email' fields
        const targetEmail = normalizeEmail(n.email);
        const noticeTo = normalizeEmail(n.notice_to_email);

        // Match if either field matches student email
        const match = (targetEmail === studentEmail) || (noticeTo === studentEmail);
        return match;
      });

      console.log(`Found ${base.length} matching notices from ${notices.length} total`);
      setStudentBaseNotices(base);
    } else {
      setStudentBaseNotices([]);
    }
  }, [notices, selectedStudent]);

  // ======================================================
  // EFFECT: Apply filters when tab or base notices change
  // ======================================================
  useEffect(() => {
    const base = selectedStudent ? studentBaseNotices : notices;

    if (activeTab === "all") {
      setFilteredNotices(base);
      return;
    }

    if (activeTab === "important") {
      const importantNotices = base.filter((n: Notice) =>
        n.priority === "High" ||
        n.important === true ||
        n.title?.toLowerCase().includes("important") ||
        n.title?.toLowerCase().includes("urgent")
      );
      setFilteredNotices(importantNotices);
      return;
    }

    if (activeTab === "academic") {
      const academicNotices = base.filter((n: Notice) =>
        n.category === "Academic" ||
        n.title?.toLowerCase().includes("exam") ||
        n.title?.toLowerCase().includes("result") ||
        n.title?.toLowerCase().includes("homework")
      );
      setFilteredNotices(academicNotices);
      return;
    }

    if (activeTab === "general") {
      const generalNotices = base.filter((n: Notice) =>
        n.category === "General" ||
        (!n.category && n.priority !== "High")
      );
      setFilteredNotices(generalNotices);
    }
  }, [activeTab, studentBaseNotices, notices, selectedStudent]);

  // ======================================================
  // Get notice priority badge
  // ======================================================
  const getPriorityBadge = (notice: Notice) => {
    if (notice.priority === "High" || notice.title?.toLowerCase().includes("urgent")) {
      return { label: "Urgent", class: "bg-red-100 text-red-800 border-red-200" };
    }
    if (notice.priority === "Medium" || notice.title?.toLowerCase().includes("important")) {
      return { label: "Important", class: "bg-orange-100 text-orange-800 border-orange-200" };
    }
    return { label: "General", class: "bg-blue-100 text-blue-800 border-blue-200" };
  };

  // ======================================================
  // useEffect
  // ======================================================
  useEffect(() => {
    loadChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======================================================
  // ENHANCED UI
  // ======================================================
  return (
    <DashboardLayout role="parents">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* HEADER SECTION */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-5"> Your Children&apos;s Notices</h1>
            <p className="text-gray-600 text-lg">Stay updated with your children&apos;s school notices and announcements</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your children&apos;s information...</p>
              </div>
            </div>
          ) : (
            <>
              {/* CHILDREN CARDS SECTION */}
              {children.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    👨‍👩‍👧‍👦 Your Children
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {children.map((child, idx) => (
                      <div
                        key={child.email || `${child.id}-${idx}`}
                        onClick={() => handleStudentSelect(child)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedStudent?.email === child.email
                          ? "border-blue-500 bg-blue-50 shadow-md transform scale-105"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                      >

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {child.fullname?.charAt(0) || 'C'}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{child.fullname}</h3>
                            <p className="text-sm text-gray-600">Class {child.class_id} • {child.section}</p>
                            <p className="text-xs text-gray-500 truncate">{child.email}</p>
                          </div>
                          {selectedStudent?.id === child.id && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CLASS INFO & NOTICES */}
              {selectedStudent && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {classInfo && (
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        🏫 Class Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Class</p>
                          <p className="font-semibold text-gray-900">{classInfo.class_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Section</p>
                          <p className="font-semibold text-gray-900">{classInfo.sec}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Class Teacher</p>
                          <p className="font-semibold text-gray-900">{classInfo.class_teacher || "Not assigned"}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                          📢 Notices for {selectedStudent.fullname}
                        </h2>
                        <p className="text-gray-600 mt-1">
                          {filteredNotices.length} notice{filteredNotices.length !== 1 ? 's' : ''} found
                        </p>
                      </div>

                      {/* FILTER TABS */}
                      <div className="w-full mt-4 lg:mt-0">
                        <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl">
                          {[
                            { id: "all", label: "All Notices", icon: "📋" },
                            { id: "important", label: "Important", icon: "⚠️" },
                            { id: "academic", label: "Academic", icon: "📚" },
                            { id: "general", label: "General", icon: "💬" }
                          ].map((tab: Tab) => (
                            <button
                              key={tab.id}
                              onClick={() => filterNoticesByType(tab.id)}
                              className={`flex items-center justify-center gap-2 
        px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        flex-1 sm:flex-none sm:px-4 whitespace-nowrap
        ${activeTab === tab.id
                                  ? "bg-white text-blue-600 shadow-sm"
                                  : "text-gray-600 hover:text-gray-800"
                                }`}
                            >
                              <span>{tab.icon}</span>
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* NOTICES LIST */}
                    {filteredNotices.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-gray-500 text-lg mb-2">No notices found</p>
                        <p className="text-gray-400 text-sm">
                          {activeTab !== "all"
                            ? `No ${activeTab} notices for ${selectedStudent.fullname}`
                            : `No notices available for ${selectedStudent.fullname}`
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredNotices.map((notice: Notice) => {
                          const priorityBadge = getPriorityBadge(notice);
                          return (
                            <div
                              key={notice.id}
                              className="p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 bg-white hover:shadow-md"
                            >
                              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-gray-900 text-lg">{notice.title}</h3>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${priorityBadge.class}`}>
                                      {priorityBadge.label}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 mb-3 leading-relaxed">{notice.message}</p>
                                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <span>📅</span>
                                      {new Date(notice.posted_date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span>👤</span>
                                      Posted for: {notice.notice_to_email}
                                    </span>
                                    {notice.category && (
                                      <span className="flex items-center gap-1">
                                        <span>🏷️</span>
                                        {notice.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2 lg:flex-col">
                                  <button
                                    onClick={() => setSelectedNotice(notice)}
                                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                                  >
                                    View Details
                                  </button>
                                  {priorityBadge.label === "Urgent" && (
                                    <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium">
                                      Take Action
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NO CHILDREN STATE */}
              {children.length === 0 && !loading && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-12 text-center">
                  <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Children Found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn&apos;t find any children associated with your parent account.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={loadChildren}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                      Refresh Data
                    </button>
                    <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
                      Contact Support
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* NOTICE DETAILS MODAL */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-6 border-b border-gray-100 flex justify-between items-start ${selectedNotice.priority === 'High' ? 'bg-red-50/50' :
              selectedNotice.priority === 'Medium' ? 'bg-orange-50/50' : 'bg-blue-50/50'
              }`}>
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadge(selectedNotice).class}`}>
                    {getPriorityBadge(selectedNotice).label}
                  </span>
                  {selectedNotice.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      {selectedNotice.category}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {selectedNotice.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-2 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedNotice.message}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Posted Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(selectedNotice.posted_date).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedNotice.posted_date).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Recipient</p>
                    <p className="text-sm font-semibold text-gray-900 break-all">
                      {selectedNotice.notice_to_email || "General"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Action logic here (e.g., mark as read)
                  setSelectedNotice(null);
                }}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}