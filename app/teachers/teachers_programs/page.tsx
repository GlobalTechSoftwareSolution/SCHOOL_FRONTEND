"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  ChevronRight,
  Search,
  ArrowLeft,
  Target,
  Award,
  BarChart3,
  FileText,
  XCircle,
  Mail,
  Phone,
  Sparkles,
  Zap,
  User
} from "lucide-react";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/`;

interface Program {
  id: number;
  coordinator_email: string | null;
  coordinator_name: string | null;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  status: string;
  calculated_status?: string;
  created_at: string;
  updated_at: string;
}

const TeachersProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate program status based on dates
  const calculateProgramStatus = (program: Program) => {
    const today = new Date();
    const startDate = new Date(program.start_date);
    const endDate = program.end_date ? new Date(program.end_date) : null;

    // If program has ended
    if (endDate && endDate < today) {
      return "completed";
    }

    // If program is currently running
    if (startDate <= today && (!endDate || endDate >= today)) {
      return "active";
    }

    // If program is in the future
    if (startDate > today) {
      return "upcoming";
    }

    return "active"; // fallback
  };

  // Fetch all programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_BASE}programs/`);

        // Add calculated status to each program
        const programsWithCalculatedStatus = response.data.map((program: Program) => ({
          ...program,
          calculated_status: calculateProgramStatus(program)
        }));

        setPrograms(programsWithCalculatedStatus);
        setFilteredPrograms(programsWithCalculatedStatus);
      } catch {
        setError("Failed to load programs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Filter programs based on search and filters
  useEffect(() => {
    let filtered = programs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(program =>
        program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.coordinator_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(program => (program.calculated_status || program.status) === selectedStatus);
    }

    setFilteredPrograms(filtered);
  }, [programs, searchTerm, selectedStatus]);

  // Fetch detailed program information
  const fetchProgramDetails = async (programId: number) => {
    try {
      setLoadingDetails(true);

      const program = programs.find(p => p.id === programId);

      if (program) {
        setSelectedProgram(program);
      } else {
        // Fallback: try to fetch single program if endpoint exists
        try {
          const response = await axios.get(`${API_BASE}programs/${programId}/`);
          setSelectedProgram(response.data);
        } catch {
          setSelectedProgram(programs.find(p => p.id === programId) || null);
        }
      }
    } catch {
      setError("Failed to load program details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Get status color based on calculated status
  const getStatusColor = (program: Program) => {
    const status = program.calculated_status || program.status || calculateProgramStatus(program);
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm';
      case 'upcoming': return 'bg-violet-100 text-violet-800 border-violet-200 shadow-sm';
      case 'completed': return 'bg-rose-100 text-rose-800 border-rose-200 shadow-sm';
      case 'cancelled': return 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm';
      default: return 'bg-slate-100 text-slate-800 border-slate-200 shadow-sm';
    }
  };

  // Get program type icon based on name or description
  const getProgramTypeIcon = (program: Program) => {
    const name = program.name.toLowerCase();
    const description = program.description.toLowerCase();

    if (name.includes('sports') || description.includes('sports')) {
      return <Award className="h-5 w-5" />;
    } else if (name.includes('cultural') || description.includes('cultural')) {
      return <Users className="h-5 w-5" />;
    } else if (name.includes('workshop') || description.includes('workshop')) {
      return <BarChart3 className="h-5 w-5" />;
    } else if (name.includes('seminar') || description.includes('seminar')) {
      return <FileText className="h-5 w-5" />;
    } else {
      return <BookOpen className="h-5 w-5" />;
    }
  };

  // Get program type color
  const getProgramTypeColor = (program: Program) => {
    const name = program.name.toLowerCase();
    const description = program.description.toLowerCase();

    if (name.includes('sports') || description.includes('sports')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    } else if (name.includes('cultural') || description.includes('cultural')) {
      return 'bg-pink-100 text-pink-800 border-pink-200';
    } else if (name.includes('workshop') || description.includes('workshop')) {
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    } else if (name.includes('seminar') || description.includes('seminar')) {
      return 'bg-teal-100 text-teal-800 border-teal-200';
    } else {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get program duration text
  const getDurationText = (program: Program) => {
    if (!program.end_date) {
      return "Ongoing";
    }

    const start = new Date(program.start_date);
    const end = new Date(program.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day";
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
    return `${Math.ceil(diffDays / 365)} years`;
  };

  // Get status options based on available programs
  // const statuses = ['all', 'active', 'upcoming', 'completed']; // Not currently used

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium text-lg">Loading Programs...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch all programs</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !selectedProgram) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Programs</h3>
            <p className="text-gray-600 mb-6 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-3 sm:p-6 md:p-8">
        {/* Header */}
        {!selectedProgram ? (
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/20">
                  <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-br from-gray-900 to-blue-800 bg-clip-text text-transparent tracking-tight">
                    Programs & Activities
                  </h1>
                  <p className="text-gray-500 text-sm sm:text-base md:text-lg font-medium mt-1">
                    Manage and participate in school programs and activities
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <button
              onClick={() => setSelectedProgram(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200/60 transition-all duration-200 hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Programs</span>
            </button>
          </div>
        )}

        {/* Programs List View */}
        {!selectedProgram && (
          <>
            {/* Filters and Search */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search programs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm sm:text-base shadow-sm"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="relative sm:w-48">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm cursor-pointer appearance-none shadow-sm"
                    >
                      <option value="all">Any Status</option>
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none rotate-90" />
                  </div>
                </div>

                {/* View Toggle - Hidden on very small screens for better spacing if needed, but here handled with flex wrapping */}
                <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl w-fit sm:ml-auto lg:ml-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    <BarChart3 className="h-5 w-5 rotate-90" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <p className="text-gray-500 text-sm font-medium">
                  Showing <span className="text-slate-900 font-bold">{filteredPrograms.length}</span> programs
                </p>
              </div>
            </div>

            {/* Programs Grid/List */}
            {filteredPrograms.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Programs Found</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">
                  {programs.length === 0
                    ? "No programs are currently available. Please check back later."
                    : "No programs match your search criteria. Try adjusting your filters."
                  }
                </p>
                {programs.length === 0 && (
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all duration-200"
                  >
                    Refresh
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredPrograms.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => fetchProgramDetails(program.id)}
                    className="bg-white rounded-2xl border border-gray-200/60 p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-blue-300 flex flex-col h-full"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl shadow-sm ${getProgramTypeColor(program).split(' ')[0]
                          }`}>
                          {React.cloneElement(getProgramTypeIcon(program) as React.ReactElement, { className: "h-5 w-5" })}
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap ${getStatusColor(program)
                          }`}>
                          {(program.calculated_status || program.status)?.charAt(0).toUpperCase() + (program.calculated_status || program.status)?.slice(1)}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>

                    {/* Title and Description */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {program.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {program.description}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-3 pt-4 border-t border-slate-50 mt-auto">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Starts:
                        </span>
                        <span className="font-semibold text-slate-900">{formatDate(program.start_date)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Duration:
                        </span>
                        <span className="font-semibold text-slate-900">{getDurationText(program)}</span>
                      </div>
                      {program.coordinator_name && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            Coordinator:
                          </span>
                          <span className="font-semibold text-slate-900 truncate max-w-[120px]">{program.coordinator_name}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Footer */}
                    <div className="mt-4 pt-4">
                      {(program.calculated_status || program.status) === 'upcoming' && (
                        <div className="bg-violet-50/50 rounded-xl p-3 border border-violet-100/50">
                          <div className="flex justify-between text-xs text-violet-700 font-bold mb-1.5">
                            <span>Status</span>
                            <span>Starts in {getDaysRemaining(program.start_date)} days</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-violet-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((Math.max(0, 30 - getDaysRemaining(program.start_date)) / 30) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {(program.calculated_status || program.status) === 'active' && (
                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 text-emerald-700 text-xs font-bold">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Currently Active
                        </div>
                      )}
                      {(program.calculated_status || program.status) === 'completed' && (
                        <div className="bg-rose-50 px-3 py-2 rounded-xl border border-rose-100 text-rose-700 text-xs font-bold text-center">
                          Program Completed
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View - Enhanced with Card styling
              <div className="space-y-4">
                {filteredPrograms.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => fetchProgramDetails(program.id)}
                    className="bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-blue-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className={`p-3 rounded-xl shadow-sm w-fit ${getProgramTypeColor(program).split(' ')[0]
                        }`}>
                        {React.cloneElement(getProgramTypeIcon(program) as React.ReactElement, { className: "h-6 w-6" })}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors truncate">
                            {program.name}
                          </h3>
                          <span className={`w-fit px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(program)
                            }`}>
                            {program.calculated_status || program.status}
                          </span>
                        </div>

                        <p className="text-gray-500 text-sm mb-3 line-clamp-1">
                          {program.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium tracking-tight">
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                            <span>{formatDate(program.start_date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                            <Clock className="h-3.5 w-3.5 text-purple-500" />
                            <span>{getDurationText(program)}</span>
                          </div>
                          {program.coordinator_name && (
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                              <Users className="h-3.5 w-3.5 text-orange-500" />
                              <span className="truncate max-w-[150px]">{program.coordinator_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="hidden sm:block ml-4">
                        <div className="p-2 rounded-full bg-slate-50 group-hover:bg-blue-50 transition-colors">
                          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Program Details View */}
        {selectedProgram && (
          <div className="space-y-6">
            {loadingDetails ? (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Loading Program Details</h3>
                  <p className="text-gray-600">Please wait while we fetch the program information...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Program Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 sm:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                        <div className={`p-3.5 rounded-2xl shadow-sm w-fit ${getProgramTypeColor(selectedProgram).split(' ')[0]
                          }`}>
                          {React.cloneElement(getProgramTypeIcon(selectedProgram) as React.ReactElement, { className: "h-8 w-8" })}
                        </div>
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{selectedProgram.name}</h1>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${getStatusColor(selectedProgram)
                              }`}>
                              {selectedProgram.calculated_status || selectedProgram.status}
                            </span>
                            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 uppercase tracking-wider">
                              Program Details
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-500 text-sm sm:text-base mb-8 leading-relaxed max-w-4xl font-medium">
                        {selectedProgram.description}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 group hover:shadow-md transition-all">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Start Date</span>
                          </div>
                          <p className="text-gray-900 font-bold">{formatDate(selectedProgram.start_date)}</p>
                          <p className="text-[10px] text-blue-600 font-medium mt-1">
                            {getDaysRemaining(selectedProgram.start_date) > 0
                              ? `${getDaysRemaining(selectedProgram.start_date)} days remaining`
                              : 'Started'
                            }
                          </p>
                        </div>

                        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50 group hover:shadow-md transition-all">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Clock className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Duration</span>
                          </div>
                          <p className="text-gray-900 font-bold">{getDurationText(selectedProgram)}</p>
                          <p className="text-[10px] text-purple-600 font-medium mt-1">
                            {selectedProgram.end_date ? `Ends: ${formatDate(selectedProgram.end_date)}` : 'Ongoing'}
                          </p>
                        </div>

                        <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 group hover:shadow-md transition-all">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Users className="h-4 w-4 text-orange-600" />
                            </div>
                            <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Coordinator</span>
                          </div>
                          <p className="text-gray-900 font-bold truncate">{selectedProgram.coordinator_name || 'Not assigned'}</p>
                          <p className="text-[10px] text-orange-600 font-medium mt-1 truncate">
                            {selectedProgram.coordinator_email || 'No email available'}
                          </p>
                        </div>

                        <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100/50 group hover:shadow-md transition-all">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Target className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Status</span>
                          </div>
                          <p className="text-gray-900 font-bold capitalize">{calculateProgramStatus(selectedProgram)}</p>
                          <p className="text-[10px] text-green-600 font-medium mt-1">Current phase</p>
                        </div>
                      </div>

                      {/* Additional Metadata */}
                      <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code:</span>
                          <span className="text-xs font-mono font-bold text-slate-700">PRG-{selectedProgram.id.toString().padStart(4, '0')}</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created:</span>
                          <span className="text-xs font-bold text-slate-700">{formatDate(selectedProgram.created_at)}</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Updated:</span>
                          <span className="text-xs font-bold text-slate-700">{formatDate(selectedProgram.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Tabs Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="bg-slate-50 p-1.5 sm:p-2 border-b border-slate-200">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {[
                        { id: "overview", label: "Overview", icon: FileText },
                        { id: "coordinator", label: "Coordinator", icon: Users },
                        { id: "schedule", label: "Schedule", icon: Calendar }
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          className={`flex-1 min-w-[120px] sm:min-w-0 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === id
                            ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                            : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                            }`}
                          onClick={() => setActiveTab(id)}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <div className="space-y-8 max-w-4xl">
                        <div className="bg-white rounded-2xl">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Detailed Description
                          </h3>
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-gray-600 leading-relaxed font-medium">
                            {selectedProgram.description}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/50">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-blue-500" />
                              Program Info
                            </h4>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Program Name</span>
                                <span className="font-bold text-slate-900">{selectedProgram.name}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Calculated Status</span>
                                <span className="font-bold text-blue-600 capitalize">{calculateProgramStatus(selectedProgram)}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm pt-2 border-t border-blue-100/50">
                                <span className="text-slate-500 font-bold text-[10px] uppercase">Database Sync</span>
                                <span className="text-slate-400 font-bold text-[10px] uppercase">{selectedProgram.status}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-2xl p-6 border border-green-100/50">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <Zap className="h-5 w-5 text-green-500" />
                              System Status
                            </h4>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Timeline</span>
                                <span className="font-bold text-green-600">{getDurationText(selectedProgram)}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Availability</span>
                                <span className="font-bold text-slate-900">Open Participation</span>
                              </div>
                              <div className="flex justify-between items-center text-sm pt-2 border-t border-green-100/50">
                                <span className="text-slate-500 font-bold text-[10px] uppercase">Last Updated</span>
                                <span className="text-slate-400 font-bold text-[10px] uppercase">{new Date(selectedProgram.updated_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Coordinator Tab */}
                    {activeTab === "coordinator" && (
                      <div className="space-y-6 max-w-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          Faculty Contact
                        </h3>

                        {selectedProgram.coordinator_name ? (
                          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-inner">
                                <User className="h-10 w-10 text-purple-600" />
                              </div>
                              <div className="text-center sm:text-left flex-1">
                                <h4 className="text-2xl font-extrabold text-gray-900 mb-1">{selectedProgram.coordinator_name}</h4>
                                <p className="text-purple-600 font-bold text-sm uppercase tracking-wider mb-4">Official Coordinator</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                  {selectedProgram.coordinator_email && (
                                    <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-100">
                                      <Mail className="h-4 w-4 text-slate-400" />
                                      <span className="text-sm font-bold">{selectedProgram.coordinator_email}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-100">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-bold">Contact Admin</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                              <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                                &ldquo;The program coordinator is responsible for managing all aspects of the {selectedProgram.name}. For specific participant inquiries, please reach out via the provided channels.&rdquo;
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 rounded-2xl p-12 border border-dashed border-slate-300 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                              <XCircle className="h-8 w-8 text-slate-300" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">No Coordinator Assigned</h4>
                            <p className="text-slate-500 text-sm font-medium">
                              An administrative coordinator has not yet been assigned to this program.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Schedule Tab */}
                    {activeTab === "schedule" && (
                      <div className="space-y-6 max-w-4xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          Timeline & Status
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            <div className="relative">
                              <div className="absolute -left-[27px] top-1.5 w-[22px] h-[22px] bg-white border-2 border-slate-200 rounded-full flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-tight">System Initialization</h4>
                              <p className="text-slate-500 text-xs font-medium">Program registered: {formatDate(selectedProgram.created_at)}</p>
                            </div>

                            <div className="relative">
                              <div className="absolute -left-[27px] top-1.5 w-[22px] h-[22px] bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                              </div>
                              <h4 className="font-bold text-blue-600 text-sm mb-1 uppercase tracking-tight">Active Start Date</h4>
                              <p className="text-slate-500 text-xs font-medium">Kick-off: {formatDate(selectedProgram.start_date)}</p>
                              <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-lg text-blue-600 text-[10px] font-bold">
                                <Sparkles className="h-3 w-3" />
                                {getDaysRemaining(selectedProgram.start_date) > 0
                                  ? `Starting in ${getDaysRemaining(selectedProgram.start_date)} days`
                                  : 'Operational phase'
                                }
                              </div>
                            </div>

                            {selectedProgram.end_date && (
                              <div className="relative">
                                <div className="absolute -left-[27px] top-1.5 w-[22px] h-[22px] bg-white border-2 border-slate-800 rounded-full flex items-center justify-center">
                                  <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-tight">Project Conclusion</h4>
                                <p className="text-slate-500 text-xs font-medium">Expected completion: {formatDate(selectedProgram.end_date)}</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-6">
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
                              <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">Program Status Card</h4>
                              <p className="text-sm font-medium leading-relaxed mb-6 italic text-slate-300">
                                {(() => {
                                  const status = calculateProgramStatus(selectedProgram);
                                  return (
                                    <>
                                      Currently in the <span className="text-white font-extrabold">{status}</span> phase.
                                      {status === 'upcoming' && ' Final preparations and logistical planning are underway.'}
                                      {status === 'active' && ' Program execution is currently in full progress.'}
                                      {status === 'completed' && ' All objectives have been met and the program is finalized.'}
                                    </>
                                  );
                                })()}
                              </p>
                              <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
                                <div className="flex flex-col">
                                  <span className="text-[10px] uppercase font-bold text-slate-500">Duration</span>
                                  <span className="text-sm font-bold">{getDurationText(selectedProgram)}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="text-[10px] uppercase font-bold text-slate-500">Phase</span>
                                  <span className="text-sm font-bold text-blue-400 capitalize">{calculateProgramStatus(selectedProgram)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-6">
                              <h4 className="font-bold text-slate-900 text-sm mb-3">Guidelines</h4>
                              <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                  Check schedule regularly for updates
                                </li>
                                <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                  Contact coordinator for logistical help
                                </li>
                                <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                  Ensure all prerequisites are completed
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeachersProgramsPage;