"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUser,
  FiBookOpen,
  FiFileText,
  FiPlus,
  FiCalendar,
  FiMail,
  FiType,
  FiBarChart2,
  FiClock,
  FiEye,
  FiX
} from "react-icons/fi";

const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/reports/";

const All_reports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    report_type: "",
    student: "",
    teacher: "",
    created_by: "principal@school.com",
  });

  // Fetch all reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Add new report
  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, newReport);
      setShowAddForm(false);
      setNewReport({
        title: "",
        description: "",
        report_type: "",
        student: "",
        teacher: "",
        created_by: "principal@school.com",
      });
      fetchReports();
    } catch (error) {
      console.error("Error adding report:", error);
    }
  };

  // Filter + search
  const filteredReports = reports.filter((report) => {
    const matchesType =
      filterType === "all" || report.report_type === filterType;
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Report color
  const getReportTypeColor = (type: string) => {
    const colors: any = {
      Academic: "bg-blue-100 text-blue-800 border-blue-200",
      Behavior: "bg-orange-100 text-orange-800 border-orange-200",
      Attendance: "bg-green-100 text-green-800 border-green-200",
      General: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Report icon
  const getReportTypeIcon = (type: string) => {
    const icons: any = {
      General: "📄",
      Academic: "📚",
      Behavior: "👥",
      Finance: "💰",
      Other: "📝",
    };
    return icons[type] || "📋";
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Reports Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Comprehensive reporting and analytics for school management
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {reports.length}
              </div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600">
                {reports.filter((r) => r.report_type === "Academic").length}
              </div>
              <div className="text-sm text-gray-600">Academic</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {reports.filter((r) => r.report_type === "Behavior").length}
              </div>
              <div className="text-sm text-gray-600">Behavior</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {reports.filter((r) => r.report_type === "Attendance").length}
              </div>
              <div className="text-sm text-gray-600">Attendance</div>
            </div>
          </div>

          {/* Search + Filter + Add */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiType className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Report Types</option>
                  <option value="Academic">Academic</option>
                  <option value="Behavior">Behavior</option>
                  <option value="Attendance">Attendance</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Add Report */}
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                <FiPlus className="w-5 h-5" />
                Create New Report
              </button>
            </div>
          </div>

          {/* Reports List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getReportTypeIcon(report.report_type)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                            {report.title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getReportTypeColor(
                              report.report_type
                            )}`}
                          >
                            {report.report_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {report.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-blue-500" />
                        <span>
                          <strong>Student:</strong> {report.student}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-green-500" />
                        <span>
                          <strong>Teacher:</strong> {report.teacher}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-purple-500" />
                        <span>
                          {new Date(report.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-orange-500" />
                        <span>
                          {new Date(report.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-lg">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-gray-700 font-semibold text-lg mb-2">
                  No Reports Found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or create your first report.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl transition-all duration-200"
                >
                  Create Report
                </button>
              </div>
            </div>
          )}

          {/* View Report Modal */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative border border-gray-200">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  {getReportTypeIcon(selectedReport.report_type)}{" "}
                  {selectedReport.title}
                </h2>

                <div className="text-sm text-gray-700 space-y-3">
                  <p>
                    <strong>Type:</strong> {selectedReport.report_type}
                  </p>
                  <p>
                    <strong>Student:</strong> {selectedReport.student}
                  </p>
                  <p>
                    <strong>Teacher:</strong> {selectedReport.teacher}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedReport.created_at).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {new Date(selectedReport.created_at).toLocaleTimeString()}
                  </p>
                  <p>
                    <strong>Description:</strong>
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-600 whitespace-pre-line">
                    {selectedReport.description}
                  </div>
                </div>

                <div className="mt-6 text-right">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
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
    </>
  );
};

export default All_reports;
