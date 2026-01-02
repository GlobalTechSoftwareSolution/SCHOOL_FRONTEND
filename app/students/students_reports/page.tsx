"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

interface Report {
  id: number;
  title: string;
  description: string;
  report_type: string;
  created_at: string;
  teacher_email: string | null;
  student_email?: string | null;
  studentEmail?: string | null;
  file_url?: string | null;
  student?: {
    email?: string | null;
  };
}

const StudentReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        let email = "";
        if (typeof window !== "undefined") {
          const userInfo =
            localStorage.getItem("userInfo") ||
            localStorage.getItem("userData");

          if (userInfo) {
            try {
              const parsed = JSON.parse(userInfo);
              email = (parsed.email || "").trim().toLowerCase();
            } catch {
              console.error("⚠️ Failed to parse user info from localStorage");
            }
          }
        }

        if (!email) {
          setError("No logged-in student email found.");
          setLoading(false);
          return;
        }

        setStudentEmail(email);
        console.log("📧 Logged-in student email:", email);

        const response = await axios.get(`${API_BASE}/reports/`);
        const allReports: Report[] = Array.isArray(response.data)
          ? response.data
          : [];

        console.log("✅ Total reports fetched:", allReports.length);

        const studentReports = allReports.filter((report) => {
          const possibleEmails = [
            report.student_email,
            report.studentEmail,
            report.student?.email,
            report["student_email"],
            report["student"],
          ];

          const normalizedEmails = possibleEmails
            .filter(Boolean)
            .map((e: unknown) => String(e).trim().toLowerCase());

          const matches = normalizedEmails.includes(email);

          if (matches) {
            console.log("✅ Matched report:", {
              id: report.id,
              title: report.title,
              student_email: normalizedEmails.join(", "),
            });
          }

          return matches;
        });

        console.log("🎯 Filtered reports for student:", studentReports.length);

        if (studentReports.length === 0) {
          console.warn(
            "⚠️ No reports found matching student email. Check API response structure."
          );
          console.log("🔍 Sample report object:", allReports[0]);
        }

        setReports(studentReports);
      } catch (err: unknown) {
        console.error("❌ Error fetching reports:", err);
        setError("Failed to fetch reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filter and search logic
  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" ||
      report.report_type?.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesType;
  });

  // Get unique report types for filter
  const reportTypes = [...new Set(reports.map(report => report.report_type).filter(Boolean))];

  if (loading)
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Reports</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <span className="text-2xl text-white">📘</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              My Reports
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access all your academic reports and progress updates in one place
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-gray-500">Logged in as:</span>
              <span className="text-blue-700 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                {studentEmail}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
                </div>
                <div className="text-blue-500 text-2xl">📊</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reports.filter(report => {
                      const reportDate = new Date(report.created_at);
                      const currentMonth = new Date().getMonth();
                      const currentYear = new Date().getFullYear();
                      return reportDate.getMonth() === currentMonth &&
                        reportDate.getFullYear() === currentYear;
                    }).length}
                  </p>
                </div>
                <div className="text-green-500 text-2xl">📅</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">With Attachments</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reports.filter(report => report.file_url).length}
                  </p>
                </div>
                <div className="text-purple-500 text-2xl">📎</div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white p-6 rounded-2xl shadow mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Reports
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </div>
                </div>
              </div>

              {/* Filter Dropdown */}
              <div className="sm:w-64">
                <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Type
                </label>
                <select
                  id="filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="all">All Report Types</option>
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          {filteredReports.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {reports.length === 0 ? "No Reports Found" : "No Matching Reports"}
              </h3>
              <p className="text-gray-600 mb-6">
                {reports.length === 0
                  ? "You don't have any reports yet. They will appear here once your teachers create them."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {(searchTerm || filterType !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white p-6 rounded-2xl shadow hover:shadow-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 group"
                >
                  {/* Report Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {report.title}
                      </h2>
                      <div className="inline-block mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.report_type === 'progress'
                            ? 'bg-green-100 text-green-800'
                            : report.report_type === 'behavior'
                              ? 'bg-yellow-100 text-yellow-800'
                              : report.report_type === 'academic'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                          {report.report_type || "General"}
                        </span>
                      </div>
                    </div>
                    {report.file_url && (
                      <div className="text-blue-500 text-2xl ml-4">📎</div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3 leading-relaxed">
                    {report.description || "No description available."}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs text-gray-500 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Teacher:</span>
                      <span>{report.teacher_email || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Created:</span>
                      <span>{new Date(report.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    {report.file_url && (
                      <a
                        href={report.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                      >
                        View Attachment
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Info */}
          {filteredReports.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-500">
              Showing {filteredReports.length} of {reports.length} reports
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentReportsPage;
