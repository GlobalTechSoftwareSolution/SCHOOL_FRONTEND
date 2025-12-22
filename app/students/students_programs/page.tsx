"use client";

import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Users, DollarSign, Clock, AlertCircle, RefreshCw } from "lucide-react";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

interface Program {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "Planned" | "Active" | "Completed" | "Cancelled";
  coordinator_email: string;
  coordinator: string;
  category?: string;
  budget?: number;
}

interface ProgramWithStatus extends Program {
  calculatedStatus: string;
}

const ProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<ProgramWithStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Determine program status based on dates
  const getProgramStatus = (startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (today < start) {
      return "Upcoming";
    } else if (today >= start && today <= end) {
      return "Active";
    } else {
      return "Completed";
    }
  };

  // Status colors and icons
  const statusConfig = {
    Active: { color: "bg-green-100 text-green-800 border-green-200", icon: "🚀" },
    Completed: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "✅" },
    Upcoming: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: "📅" }
  };

  // Fetch all programs
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/programs/`);
      setPrograms(response.data);
    } catch (err: unknown) {
      console.error("Error fetching programs:", err);
      setError("Failed to load programs. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPrograms();
  };

  // Filter programs based on status and search term
  useEffect(() => {
    let filtered: ProgramWithStatus[] = programs.map(program => ({
      ...program,
      calculatedStatus: getProgramStatus(program.start_date, program.end_date)
    }));

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(program => program.calculatedStatus === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.coordinator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrograms(filtered);
  }, [programs, selectedStatus, searchTerm]);

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Calculate statistics based on calculated status
  const stats = {
    total: programs.length,
    active: programs.filter(p => {
      const status = getProgramStatus(p.start_date, p.end_date);
      return status === "Active";
    }).length,
    completed: programs.filter(p => {
      const status = getProgramStatus(p.start_date, p.end_date);
      return status === "Completed";
    }).length,
    upcoming: programs.filter(p => {
      const status = getProgramStatus(p.start_date, p.end_date);
      return status === "Upcoming";
    }).length,
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading Programs...</div>
            <p className="text-gray-500 mt-2">Fetching all available programs</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && programs.length === 0) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-red-600 font-semibold text-lg mb-2">Unable to Load Programs</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button 
              onClick={handleRefresh}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-6 md:mb-0">
                <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  School Programs
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl">
                  Discover and participate in various educational programs and activities
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm border border-gray-200 flex items-center gap-2 w-fit"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Statistics Cards - Updated with Active, Completed, Upcoming */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Programs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-600 mt-1">{stats.completed}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/50">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search programs by name, description, or coordinator..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedStatus("all")}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedStatus === "all" 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button> 
                <button
                  onClick={() => setSelectedStatus("Active")}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedStatus === "Active" 
                      ? "bg-green-600 text-white shadow-md" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  🚀 Active
                </button>
                <button
                  onClick={() => setSelectedStatus("Completed")}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedStatus === "Completed" 
                      ? "bg-gray-600 text-white shadow-md" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ✅ Completed
                </button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && programs.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800">{error}</p>
              </div>
            </div>
          )}

          {/* Programs Grid */}
          {filteredPrograms.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-12 text-center border border-white/50">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {programs.length === 0 ? "No Programs Available" : "No Matching Programs Found"}
              </h3>
              <p className="text-gray-600 mb-6">
                {programs.length === 0 
                  ? "There are no programs scheduled at the moment. Please check back later."
                  : "Try adjusting your search terms or filters to find what you're looking for."
                }
              </p>
              {(searchTerm || selectedStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => {
                const calculatedStatus = getProgramStatus(program.start_date, program.end_date);
                const daysRemaining = getDaysRemaining(program.end_date);
                const isActive = calculatedStatus === "Active";
                const isUpcoming = calculatedStatus === "Upcoming";
                
                return (
                  <div
                    key={program.id}
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  >
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                      {/* Program Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
                          🎯
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                          statusConfig[calculatedStatus].color
                        }`}>
                          {statusConfig[calculatedStatus].icon} {calculatedStatus}
                        </span>
                      </div>

                      {/* Program Info */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {program.name}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
                        {program.description}
                      </p>

                      {/* Date Information */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(program.start_date)} - {formatDate(program.end_date)}
                          </span>
                        </div>
                        
                        {isActive && daysRemaining > 0 && (
                          <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                            <Clock className="h-4 w-4" />
                            <span>{daysRemaining} days remaining</span>
                          </div>
                        )}
                        
                        {isUpcoming && (
                          <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                            <Clock className="h-4 w-4" />
                            <span>Starting soon</span>
                          </div>
                        )}

                        {calculatedStatus === "Completed" && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                            <span className="text-2xl">✅</span>
                            <span>Program completed</span>
                          </div>
                        )}
                      </div>

                      {/* Coordinator Info */}
                      <div className="border-t border-gray-100 pt-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center text-sm font-semibold text-green-600">
                            👤
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{program.coordinator}</div>
                            <div className="text-xs text-gray-500 truncate">{program.coordinator_email}</div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mt-auto pt-4 border-t border-gray-100">
                        {program.category && (
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                            {program.category}
                          </span>
                        )}
                        
                        {program.budget && (
                          <div className="flex items-center gap-1 text-green-600 font-semibold">
                            <DollarSign className="h-4 w-4" />
                            <span>${program.budget.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Results Summary */}
          {filteredPrograms.length > 0 && (
            <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredPrograms.length}</span> of{" "}
                    <span className="font-semibold">{programs.length}</span> programs
                    {(searchTerm || selectedStatus !== "all") && " (filtered)"}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Active: {stats.active}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span>Completed: {stats.completed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProgramsPage;
