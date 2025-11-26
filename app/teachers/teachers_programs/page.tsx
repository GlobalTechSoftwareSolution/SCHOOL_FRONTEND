"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  BookOpen,
  ChevronRight,
  Search,
  Download,
  Share2,
  Bookmark,
  ArrowLeft,
  Target,
  Award,
  BarChart3,
  FileText,
  PlayCircle,
  CheckCircle,
  XCircle,
  Mail,
  Phone
} from "lucide-react";

const API_BASE = "https://school.globaltechsoftwaresolutions.cloud/api/";

interface Program {
  id: number;
  coordinator_email: string | null;
  coordinator_name: string | null;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  status: string;
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
      } catch (err) {
        console.error('❌ [TEACHER_PROGRAMS] Error fetching programs:', err);
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
      filtered = filtered.filter(program => program.status === selectedStatus);
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
    } catch (err) {
      console.error('❌ [TEACHER_PROGRAMS] Error fetching program details:', err);
      setError("Failed to load program details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Get status color based on calculated status
  const getStatusColor = (program: Program) => {
    const status = program.status || calculateProgramStatus(program);
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
  const statuses = ['all', 'active', 'upcoming', 'completed'];

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        {/* Header */}
        {!selectedProgram ? (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Programs & Activities
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Manage and participate in school programs and activities</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <button
              onClick={() => setSelectedProgram(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Programs
            </button>
          </div>
        )}

        {/* Programs List View */}
        {!selectedProgram && (
          <>
            {/* Filters and Search */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search programs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-6 py-3 w-full border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg shadow-sm transition-all duration-200"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg shadow-sm transition-all duration-200"
                  >
                    <option value="all">All Status</option>
                    {statuses.filter(status => status !== 'all').map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-500"
                    }`}
                  >
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      viewMode === "list" ? "bg-white shadow-sm" : "text-gray-500"
                    }`}
                  >
                    <div className="w-4 h-4 flex flex-col justify-between">
                      <div className="w-full h-0.5 bg-current rounded"></div>
                      <div className="w-full h-0.5 bg-current rounded"></div>
                      <div className="w-full h-0.5 bg-current rounded"></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredPrograms.length}</span> of <span className="font-semibold text-gray-900">{programs.length}</span> programs
                </p>
              </div>
            </div>

            {/* Programs Grid/List */}
            {filteredPrograms.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Programs Found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  {programs.length === 0 
                    ? "No programs are currently available. Please check back later."
                    : "No programs match your search criteria. Try adjusting your filters."
                  }
                </p>
                {programs.length === 0 && (
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Refresh Programs
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPrograms.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => fetchProgramDetails(program.id)}
                    className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-300 group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          getProgramTypeColor(program).split(' ')[0]
                        }`}>
                          {getProgramTypeIcon(program)}
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            getStatusColor(program)
                          }`}>
                            {program.status?.charAt(0).toUpperCase() + program.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                    </div>

                    {/* Title and Description */}
                    <h3 className="font-bold text-gray-900 text-xl mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                      {program.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {program.description}
                    </p>

                    {/* Program Type */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                        getProgramTypeColor(program)
                      }`}>
                        {program.name.split(' ')[0]}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(program.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{getDurationText(program)}</span>
                      </div>
                      {program.coordinator_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span className="truncate">Coordinator: {program.coordinator_name}</span>
                        </div>
                      )}
                    </div>

                    {/* Days Remaining/Progress */}
                    <div className="mt-4">
                      {program.status === 'upcoming' && (
                        <>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Starts in</span>
                            <span className="font-semibold text-blue-600">{getDaysRemaining(program.start_date)} days</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((getDaysRemaining(program.start_date) / 30) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </>
                      )}
                      {program.status === 'active' && (
                        <div className="text-center py-2 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-sm font-medium text-green-700">Currently Active</span>
                        </div>
                      )}
                      {program.status === 'completed' && (
                        <div className="text-center py-2 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-sm font-medium text-gray-700">Program Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {filteredPrograms.map((program, index) => (
                  <div
                    key={program.id}
                    onClick={() => fetchProgramDetails(program.id)}
                    className={`p-6 cursor-pointer transition-all duration-200 hover:bg-blue-50 group ${
                      index !== filteredPrograms.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${
                          getProgramTypeColor(program).split(' ')[0]
                        }`}>
                          {getProgramTypeIcon(program)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-200">
                              {program.name}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              getStatusColor(program)
                            }`}>
                              {program.status?.charAt(0).toUpperCase() + program.status?.slice(1)}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {program.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(program.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{getDurationText(program)}</span>
                            </div>
                            {program.coordinator_name && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{program.coordinator_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
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
                {/* Program Header */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-2xl ${
                          getProgramTypeColor(selectedProgram).split(' ')[0]
                        }`}>
                          {getProgramTypeIcon(selectedProgram)}
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900">{selectedProgram.name}</h1>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                              getStatusColor(selectedProgram)
                            }`}>
                              {selectedProgram.status?.charAt(0).toUpperCase() + selectedProgram.status?.slice(1)}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                              getProgramTypeColor(selectedProgram)
                            }`}>
                              Program
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-lg mb-6 leading-relaxed">{selectedProgram.description}</p>
                      
                      {/* Enhanced Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="font-semibold text-gray-900">{formatDate(selectedProgram.start_date)}</p>
                            <p className="text-xs text-blue-600 mt-1">
                              {getDaysRemaining(selectedProgram.start_date) > 0 
                                ? `${getDaysRemaining(selectedProgram.start_date)} days remaining`
                                : getDaysRemaining(selectedProgram.start_date) === 0
                                ? 'Starting today'
                                : 'Started'
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                          <Clock className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-semibold text-gray-900">{getDurationText(selectedProgram)}</p>
                            <p className="text-xs text-green-600 mt-1">
                              {selectedProgram.end_date ? `Ends: ${formatDate(selectedProgram.end_date)}` : 'Ongoing'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                          <Users className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-600">Coordinator</p>
                            <p className="font-semibold text-gray-900">
                              {selectedProgram.coordinator_name || 'Not Assigned'}
                            </p>
                            <p className="text-xs text-purple-600 mt-1">
                              {selectedProgram.coordinator_email || 'No contact'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                          <Target className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="text-sm text-gray-600">Program Status</p>
                            <p className="font-semibold text-gray-900 capitalize">{calculateProgramStatus(selectedProgram)}</p>
                            <p className="text-xs text-orange-600 mt-1">
                              Based on current date
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Program Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Program Code</p>
                          <p className="font-mono font-semibold text-gray-900">PRG-{selectedProgram.id.toString().padStart(4, '0')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Created Date</p>
                          <p className="font-semibold text-gray-900">{formatDate(selectedProgram.created_at)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                          <p className="font-semibold text-gray-900">{formatDate(selectedProgram.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>

                {/* Program Details Tabs */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="border-b border-gray-200">
                    <div className="flex space-x-1 px-8 pt-6 overflow-x-auto">
                      {[
                        { id: "overview", label: "Overview", icon: FileText },
                        { id: "coordinator", label: "Coordinator", icon: Users },
                        { id: "schedule", label: "Schedule", icon: Calendar }
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          className={`flex items-center gap-3 py-4 px-6 rounded-t-2xl text-lg font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
                            activeTab === id
                              ? "text-blue-600 border-blue-600 bg-blue-50"
                              : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                          }`}
                          onClick={() => setActiveTab(id)}
                        >
                          <Icon className="h-5 w-5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-8">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Program Overview
                          </h3>
                          <div className="prose max-w-none text-gray-600 bg-gray-50 rounded-xl p-6">
                            <p className="leading-relaxed text-lg">{selectedProgram.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Target className="h-5 w-5 text-blue-600" />
                              Program Details
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-600">Program Name</p>
                                <p className="font-semibold text-gray-900 text-lg">{selectedProgram.name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="font-medium text-gray-900 capitalize">{calculateProgramStatus(selectedProgram)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Database Status</p>
                                <p className="font-medium text-gray-900">{selectedProgram.status}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-green-600" />
                              Timeline Information
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-600">Start Date</p>
                                <p className="font-semibold text-gray-900">{formatDate(selectedProgram.start_date)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">End Date</p>
                                <p className="font-medium text-gray-900">{selectedProgram.end_date ? formatDate(selectedProgram.end_date) : 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="font-medium text-gray-900">{getDurationText(selectedProgram)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Coordinator Tab */}
                    {activeTab === "coordinator" && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          Program Coordinator
                        </h3>
                        
                        {selectedProgram.coordinator_name ? (
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                            <div className="flex items-center gap-6">
                              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center">
                                <Users className="h-10 w-10 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedProgram.coordinator_name}</h4>
                                <p className="text-gray-600 text-lg mb-4">Program Coordinator</p>
                                <div className="flex items-center gap-4">
                                  {selectedProgram.coordinator_email && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Mail className="h-4 w-4" />
                                      <span>{selectedProgram.coordinator_email}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="h-4 w-4" />
                                    <span>Contact School Office</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-6 p-4 bg-white rounded-xl border border-purple-200">
                              <p className="text-gray-700">
                                For any questions regarding the {selectedProgram.name} program, please contact the coordinator directly.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-200 text-center">
                            <Users className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">No Coordinator Assigned</h4>
                            <p className="text-gray-600">
                              This program currently doesn't have an assigned coordinator. Please contact the administration for assistance.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Schedule Tab */}
                    {activeTab === "schedule" && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          Program Schedule
                        </h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-blue-50 rounded-xl p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Program Timeline</h4>
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
                                <div>
                                  <p className="font-medium text-gray-900">Program Created</p>
                                  <p className="text-sm text-gray-600">{formatDate(selectedProgram.created_at)}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-3 h-3 bg-green-600 rounded-full mt-1"></div>
                                <div>
                                  <p className="font-medium text-gray-900">Program Starts</p>
                                  <p className="text-sm text-gray-600">{formatDate(selectedProgram.start_date)}</p>
                                  <p className="text-xs text-green-600 mt-1">
                                    {getDaysRemaining(selectedProgram.start_date) > 0 
                                      ? `${getDaysRemaining(selectedProgram.start_date)} days from now`
                                      : getDaysRemaining(selectedProgram.start_date) === 0
                                      ? 'Starts today'
                                      : 'Already started'
                                    }
                                  </p>
                                </div>
                              </div>
                              {selectedProgram.end_date && (
                                <div className="flex items-start gap-3">
                                  <div className="w-3 h-3 bg-orange-600 rounded-full mt-1"></div>
                                  <div>
                                    <p className="font-medium text-gray-900">Program Ends</p>
                                    <p className="text-sm text-gray-600">{formatDate(selectedProgram.end_date)}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-xl p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Current Status</h4>
                            <div className="space-y-4">
                              <div className="p-4 bg-white rounded-lg border border-green-200">
                                <p className="font-medium text-gray-900 mb-2">Program Status</p>
                                <p className="text-sm text-gray-600">
                                  {(() => {
                                    const status = calculateProgramStatus(selectedProgram);
                                    return (
                                      <>
                                        This program is currently <span className="font-semibold text-green-600 capitalize">{status}</span>.
                                        {status === 'upcoming' && ' Registration is open for interested participants.'}
                                        {status === 'active' && ' The program is currently running and accepting participants.'}
                                        {status === 'completed' && ' This program has concluded. View certificates if available.'}
                                      </>
                                    );
                                  })()}
                                </p>
                              </div>
                              <div className="p-4 bg-white rounded-lg border border-blue-200">
                                <p className="font-medium text-gray-900 mb-2">Next Steps</p>
                                <p className="text-sm text-gray-600">
                                  {(() => {
                                    const status = calculateProgramStatus(selectedProgram);
                                    if (status === 'upcoming') {
                                      return 'Prepare for the program start date and ensure all requirements are met.';
                                    }
                                    if (status === 'active') {
                                      return 'Continue participating in program activities and complete all assignments.';
                                    }
                                    if (status === 'completed') {
                                      return 'Program has ended. Thank you for your participation.';
                                    }
                                    return null;
                                  })()}
                                </p>
                              </div>
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