"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useState, useEffect } from "react";

interface Notice {
  id: number;
  title: string;
  message: string;
  type: string;
  posted_date: string;
  important: boolean;
  notice_by: string;
  category: string;
  notice_to: string;
  notice_to_email: string;
}

interface MappedNotice {
  id: number;
  title: string;
  content: string;
  type: string;
  date: string;
  priority: string;
  author: string;
  category: string;
  notice_to: string;
  notice_to_email: string;
}

interface ApiError {
  message?: string;
}

const AllNotice = () => {
  const [notices, setNotices] = useState<MappedNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get logged-in student's email from localStorage
        let userEmail = "";
        if (typeof window !== "undefined") {
          const userData = localStorage.getItem("userData");
          const userInfo = localStorage.getItem("userInfo");
          
          if (userData) {
            try {
              const parsed = JSON.parse(userData);
              userEmail = (parsed.email || "").trim().toLowerCase();
            } catch {
              userEmail = "";
            }
          } else if (userInfo) {
            try {
              const parsed = JSON.parse(userInfo);
              userEmail = (parsed.email || "").trim().toLowerCase();
            } catch {
              userEmail = "";
            }
          }
        }

        if (!userEmail) {
          throw new Error("User email not found in localStorage");
        }

        const res = await fetch(
         `${process.env.NEXT_PUBLIC_API_BASE_URL}/notices/`
        );
        
        if (!res.ok) {
          throw new Error(`Failed to fetch notices: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // Filter notices that are specifically addressed to this user
        const filteredData = (Array.isArray(data) ? data : []).filter((notice: Notice) => {
          // Check if notice is addressed to this user specifically
          const noticeTo = (notice.notice_to || "").trim().toLowerCase();
          return noticeTo === userEmail;
        });

        const mapped = filteredData.map((n: Notice) => ({
          id: n.id,
          title: n.title || "Untitled Notice",
          content: n.message || "",
          type: n.type || "general",
          date: n.posted_date,
          priority: n.important ? "high" : "low",
          author: n.notice_by || "Admin",
          category: n.category || "General",
          notice_to: n.notice_to || "",
          notice_to_email: n.notice_to_email || "",
        }));

        setNotices(mapped);
      } catch (err: unknown) {
        const apiError = err as ApiError;
        setError("Could not load notices: " + (apiError.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // 🔍 Filter, Search, and Priority Logic
  const filteredNotices = notices.filter((notice) => {
    const matchesType = filter === "all" || notice.type === filter;
    const matchesPriority =
      priorityFilter === "all" || notice.priority === priorityFilter;
    const matchesSearch =
      (notice.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notice.content || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notice.author || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesPriority && matchesSearch;
  });

  const clearFilters = () => {
    setFilter("all");
    setPriorityFilter("all");
    setSearchTerm("");
  };

  // 🏷️ Style Helpers
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-orange-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "maintenance":
        return "text-blue-600 bg-blue-100";
      case "update":
        return "text-purple-600 bg-purple-100";
      case "security":
        return "text-red-600 bg-red-100";
      case "general":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📰 Notice Board
            </h1>
            <p className="text-lg text-gray-600">
              Welcome to your Student Notice Board
            </p>
          </div>

          {/* Search + Clear Filters */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>

          {/* Notices List */}
          {loading ? (
            <div className="text-center py-12">⏳ Loading notices...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : filteredNotices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(
                        notice.type
                      )}`}
                    >
                      {notice.type}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(
                        notice.priority
                      )}`}
                    >
                      {notice.priority.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    {notice.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {notice.content}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-2">
                    <span>{notice.author}</span>
                    <span>
                      {notice.date
                        ? new Date(notice.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    🎯 To: {notice.notice_to_email || notice.notice_to || "All"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-md">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No notices found
              </h3>
              <p className="text-gray-600">
                No new announcements or personal notices yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AllNotice;
