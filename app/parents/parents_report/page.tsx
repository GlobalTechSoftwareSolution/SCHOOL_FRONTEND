"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  FileText,
  Users,
  Calendar,
  Download,
  Search,
  BookOpen,
  Award,
  TrendingUp,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ✅ API Base
const API_BASE = "https://school.globaltechsoftwaresolutions.cloud/api";

// ✅ Type Definitions
type Child = {
  fullname: string;
  email: string;
  class_name?: string;
  section?: string;
};

type Report = {
  id?: number;
  title?: string;
  description?: string;
  report_type?: string;
  student?: string;
  email?: string;
  student_email?: string;
  student_data?: { email?: string };
  teacher?: string;
  created_at?: string;
  updated_at?: string;
};

const ParentReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentEmail, setParentEmail] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [childFilter, setChildFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedReport, setExpandedReport] = useState<number | null>(null);

  // ✅ Fetch Parent + Reports on Mount
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setParentEmail(parsedData.email);
      if (parsedData.email) {
        fetchParentAndReports(parsedData.email);
      }
    } else {
      console.error("❌ No parent data found in localStorage");
      setLoading(false);
    }
  }, []);

  // ✅ Core Fetch Function
  const fetchParentAndReports = async (email: string) => {
    try {
      console.log("📩 Fetching parent details for:", email);

      // 1️⃣ Get all parents
      const parentRes = await axios.get(`${API_BASE}/parents/`);
      const parentList = parentRes.data || [];

      // 2️⃣ Match the parent by email
      const parentData = parentList.find((p: any) => p.email === email);
      if (!parentData) {
        console.error("❌ Parent not found in API response");
        setLoading(false);
        return;
      }

      // 3️⃣ Get children list
      const childrenList = parentData.children_list || [];
      setChildren(childrenList);
      console.log("🧒 Children List:", childrenList);

      // 4️⃣ Get reports
      const reportsRes = await axios.get(`${API_BASE}/reports/`);
      const allReports: Report[] = reportsRes.data || [];
      console.log("📄 All Reports:", allReports);

      // 5️⃣ Collect children emails
      const childEmails = childrenList
        .map((child: Child) => child.email?.toLowerCase())
        .filter(Boolean);
      console.log("👧 Child Emails:", childEmails);

      // 6️⃣ Filter reports that match any child
      const filteredReports = allReports.filter((report) => {
        const studentEmail =
          report.student?.toLowerCase() ||
          report.student_email?.toLowerCase() ||
          report.student_data?.email?.toLowerCase() ||
          report.email?.toLowerCase() ||
          "";
        return childEmails.includes(studentEmail);
      });

      console.log("✅ Filtered Reports:", filteredReports);
      setReports(filteredReports);
    } catch (error) {
      console.error("❌ Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Compute stats
  const getReportStats = () => {
    const totalReports = reports.length;
    const academicReports = reports.filter((r) => r.report_type === "Academic").length;
    const behavioralReports = reports.filter((r) => r.report_type === "Behavioral").length;
    const progressReports = reports.filter((r) => r.report_type === "Progress").length;

    return {
      totalReports,
      academicReports,
      behavioralReports,
      progressReports,
      otherReports:
        totalReports - academicReports - behavioralReports - progressReports,
    };
  };

  const stats = getReportStats();

  // ✅ Unique filters
  const uniqueReportTypes = [...new Set(reports.map((r) => r.report_type))].filter(Boolean);
  const uniqueChildren = [
    ...new Set(
      reports.map(
        (r) => r.student || r.email || r.student_data?.email || r.student_email
      )
    ),
  ].filter(Boolean);

  // ✅ Filtered reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.student?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      reportTypeFilter === "all" || report.report_type === reportTypeFilter;
    const matchesChild =
      childFilter === "all" ||
      report.student === childFilter ||
      report.email === childFilter;
    const matchesDate =
      !dateFilter || report.created_at?.includes(dateFilter);

    return matchesSearch && matchesType && matchesChild && matchesDate;
  });

  // ✅ Helpers
  const getReportColor = (reportType?: string) => {
    switch (reportType) {
      case "Academic":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Behavioral":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Progress":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getReportIcon = (reportType?: string) => {
    switch (reportType) {
      case "Academic":
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case "Behavioral":
        return <User className="h-5 w-5 text-orange-600" />;
      case "Progress":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getChildName = (studentEmail?: string) => {
    const child = children.find((c) => c.email === studentEmail);
    return child?.fullname || studentEmail || "Unknown Student";
  };

  // ✅ Loading State
  if (loading) {
    return (
      <DashboardLayout role="parents">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ✅ UI Rendering
  return (
   <DashboardLayout role="parents">
      <div className="min-h-screen bg-gray-50/30 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Reports</h1>
          <p className="text-gray-600 mt-2">View academic and behavioral reports for your children</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalReports}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Academic</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.academicReports}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Behavioral</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.behavioralReports}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <User className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.progressReports}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Children Overview */}
        {children.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              Your Children ({children.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child, index) => {
                const childReports = reports.filter(r => 
                  r.student === child.email || r.email === child.email
                );
                return (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{child.fullname}</h3>
                        <div className="flex flex-col-2 mt-2">
                          <p className="text-sm text-gray-600">{child.class_name }</p> 
                        <p className="text-sm text-gray-600 ml-2">{child.section}  Section</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{child.email}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Reports:</span>
                      <span className="font-semibold text-blue-600">{childReports.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by report title, description, or student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <select
                value={reportTypeFilter}
                onChange={(e) => setReportTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Report Types</option>
                {uniqueReportTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={childFilter}
                onChange={(e) => setChildFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Children</option>
                {uniqueChildren.map(childEmail => (
                  <option key={childEmail} value={childEmail}>
                    {getChildName(childEmail)}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              Student Reports
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {filteredReports.length} reports
              </span>
            </h2>
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {reports.length === 0 ? "No Reports Found" : "No Matching Reports"}
              </h3>
              <p className="text-gray-600">
                {reports.length === 0 
                  ? "There are no reports available for your children at this time."
                  : "Try adjusting your search or filters to find what you're looking for."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredReports.map((report, index) => (
                <div
                  key={index}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === index ? null : index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getReportIcon(report.report_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{report.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getReportColor(report.report_type)}`}>
                            {report.report_type || "General"}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{getChildName(report.student || report.email)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {report.created_at ? new Date(report.created_at).toLocaleDateString() : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            <span>By: {report.teacher || "Teacher"}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 line-clamp-2">
                          {report.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedReport(expandedReport === index ? null : index);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {expandedReport === index ? 
                          <ChevronUp className="h-4 w-4 text-gray-600" /> : 
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedReport === index && (
                    <div className="mt-4 pl-9 border-t pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Report Details</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Student Email:</span>
                              <span className="text-gray-900 font-medium">{report.student || report.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Teacher:</span>
                              <span className="text-gray-900 font-medium">{report.teacher || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Created Date:</span>
                              <span className="text-gray-900 font-medium">
                                {report.created_at ? new Date(report.created_at).toLocaleString() : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Last Updated:</span>
                              <span className="text-gray-900 font-medium">
                                {report.updated_at ? new Date(report.updated_at).toLocaleString() : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Full Description</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                            {report.description || "No detailed description provided."}
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

        {/* Summary Footer */}
        {filteredReports.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredReports.length}</span> of{" "}
                  <span className="font-semibold">{reports.length}</span> reports
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Academic: {stats.academicReports}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Behavioral: {stats.behavioralReports}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Progress: {stats.progressReports}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ParentReportsPage;
