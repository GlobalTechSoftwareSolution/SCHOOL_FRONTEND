"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BookOpen,
  Calendar,
  Users,
  MapPin,
  Clock,
  Award,
  Target,
  ChevronDown,
  ChevronUp,
  Search,
  Star,
  Bookmark
} from "lucide-react";

interface Program {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  students_enrolled?: string;
  capacity?: string;
  coordinator?: string;
  coordinator_email?: string;
  duration?: string;
  requirements?: string;
  benefits?: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/`;

const ParentProgramsPage = () => {
  // Commented out unused state
  // const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Fetch all school programs
  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${API_URL}programs/`);
      setPrograms(response.data);
      setError(null);
    } catch (err: unknown) {
      console.error("Error fetching programs:", err);
      setError("Failed to load programs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Calculate statistics
  const getProgramStats = () => {
    const totalPrograms = programs.length;
    const activePrograms = programs.filter(program => 
      program.status === "Active" || 
      (program.start_date && new Date(program.start_date) <= new Date() && 
       program.end_date && new Date(program.end_date) >= new Date())
    ).length;
    const upcomingPrograms = programs.filter(program => 
      program.start_date && new Date(program.start_date) > new Date()
    ).length;
    
    const totalEnrollment = programs.reduce((sum, program) => 
      sum + (parseInt(program.students_enrolled || '0') || 0), 0
    );

    return {
      totalPrograms,
      activePrograms,
      upcomingPrograms,
      totalEnrollment
    };
  };

  const stats = getProgramStats();

  // Get unique categories for filter
  const uniqueCategories = [...new Set(programs.map(program => program.category || "General"))];

  // Filter programs
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = 
      program.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || program.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = program.status === "Active" || 
        (!!program.start_date && new Date(program.start_date) <= new Date() && 
         !!program.end_date && new Date(program.end_date) >= new Date());
    } else if (statusFilter === "upcoming") {
      matchesStatus = !!program.start_date && new Date(program.start_date) > new Date();
    } else if (statusFilter === "completed") {
      matchesStatus = !!program.end_date && new Date(program.end_date) < new Date();
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getProgramStatus = (program: Program) => {
    if (program.status === "Active") return "active";
    if (program.start_date && new Date(program.start_date) > new Date()) return "upcoming";
    if (program.end_date && new Date(program.end_date) < new Date()) return "completed";
    return "active";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "upcoming":
        return "Upcoming";
      case "completed":
        return "Completed";
      default:
        return "Active";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "academic":
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case "sports":
        return <Award className="h-5 w-5 text-green-600" />;
      case "arts":
        return <Star className="h-5 w-5 text-purple-600" />;
      case "technology":
        return <Target className="h-5 w-5 text-red-600" />;
      default:
        return <Bookmark className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "Not specified";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} days`;
  };

  if (loading) {
    return (
      <DashboardLayout role="parents">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading programs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parents">
      <div className="min-h-screen bg-gray-50/30 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">School Programs</h1>
          <p className="text-gray-600 mt-2">Explore all academic and extracurricular programs offered by the school</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalPrograms}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Programs</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activePrograms}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search programs by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Programs List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Available Programs
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {filteredPrograms.length} programs
              </span>
            </h2> 
          </div>

          {error && (
            <div className="p-6 text-center text-red-500 bg-red-50 border-b border-red-200">
              {error}
            </div>
          )}

          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {programs.length === 0 ? "No Programs Available" : "No Matching Programs"}
              </h3>
              <p className="text-gray-600">
                {programs.length === 0 
                  ? "No programs available right now."
                  : "Try adjusting your search or filters to find what you're looking for."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPrograms.map((program, index) => {
                const programStatus = getProgramStatus(program);
                return (
                  <div
                    key={index}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedProgram(expandedProgram === index ? null : index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {getCategoryIcon(program.category || '')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {program.title || program.name || "Untitled Program"}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(programStatus)}`}>
                                {getStatusText(programStatus)}
                              </span>
                              {program.category && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                  {program.category}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            {program.start_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Starts: {new Date(program.start_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {program.end_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Ends: {new Date(program.end_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {program.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{program.location}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-700 line-clamp-2">
                            {program.description || "No description provided."}
                          </p>

                          {program.students_enrolled && (
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{program.students_enrolled} students enrolled</span>
                              </div>
                              {program.start_date && program.end_date && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Duration: {getDuration(program.start_date, program.end_date)}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedProgram(expandedProgram === index ? null : index);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {expandedProgram === index ? 
                            <ChevronUp className="h-4 w-4 text-gray-600" /> : 
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedProgram === index && (
                      <div className="mt-4 pl-9 border-t pt-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Program Details</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Category:</span>
                                <span className="text-gray-900 font-medium">{program.category || "General"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className="text-gray-900 font-medium">{getStatusText(programStatus)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Start Date:</span>
                                <span className="text-gray-900 font-medium">
                                  {program.start_date ? new Date(program.start_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  }) : "Not specified"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">End Date:</span>
                                <span className="text-gray-900 font-medium">
                                  {program.end_date ? new Date(program.end_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  }) : "Not specified"}
                                </span>
                              </div>
                              {program.duration && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Duration:</span>
                                  <span className="text-gray-900 font-medium">{program.duration}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Location & Enrollment</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="text-gray-900 font-medium">{program.location || "Not specified"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Students Enrolled:</span>
                                <span className="text-gray-900 font-medium">{program.students_enrolled || "0"}</span>
                              </div>
                              {program.capacity && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Capacity:</span>
                                  <span className="text-gray-900 font-medium">{program.capacity}</span>
                                </div>
                              )}
                              {program.coordinator && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Coordinator:</span>
                                  <span className="text-gray-900 font-medium">{program.coordinator}</span>
                                </div>
                              )}
                            </div>
                          </div>

                            <div>
                            <h4 className="font-medium text-gray-900 mb-3">Coordinator Information</h4>
                            <div className="space-y-3 text-sm">
                              {/* <div className="flex justify-between">
                                <span className="text-gray-600">Coordinator Name:</span>
                                <span className="text-gray-900 font-medium">{program.coordinator || "Not specified"}</span>
                              </div> */}
                              <div className="flex justify-between">
                                <span className="text-gray-600">Coordinator Email:</span>
                                <span className="text-gray-900 font-medium">{program.coordinator_email || "Not specified"}</span>
                              </div>  
                            </div>
                          </div>

                        </div>

                        {/* Full Description */}
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-3">Full Description</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                            {program.description || "No detailed description provided for this program."}
                          </p>
                        </div>

                        {/* Additional Information */}
                        {(program.requirements || program.benefits) && (
                          <div className="mt-4 grid md:grid-cols-2 gap-6">
                            {program.requirements && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                                <p className="text-gray-700 text-sm">{program.requirements}</p>
                              </div>
                            )}
                            {program.benefits && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                                <p className="text-gray-700 text-sm">{program.benefits}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredPrograms.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredPrograms.length}</span> of{" "}
                  <span className="font-semibold">{programs.length}</span> programs
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Active: {stats.activePrograms}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Upcoming: {stats.upcomingPrograms}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>Enrolled: {stats.totalEnrollment}</span>
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

export default ParentProgramsPage;