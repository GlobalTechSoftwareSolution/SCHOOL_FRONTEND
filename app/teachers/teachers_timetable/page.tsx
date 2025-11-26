"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  MapPin, 
  Users, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Building,
  User
} from "lucide-react";

const API_BASE = "https://school.globaltechsoftwaresolutions.cloud/api/";

interface TimetableEntry {
  id: number;
  teacher: string;
  class_id: number;
  class_name: string;
  section?: string;
  subject_name?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_number?: string;
  color_code?: string;
}

interface TeacherStats {
  totalClasses: number;
  totalSubjects: number;
  teachingDays: number;
  weeklyHours: number;
}

const TeachersTimetablePage = () => {
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string>("");
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [filteredTimetable, setFilteredTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalSubjects: 0,
    teachingDays: 0,
    weeklyHours: 0
  });

  const [filters, setFilters] = useState({
    day: "all",
    search: "",
    timeRange: "all"
  });

  // Read teacher info from localStorage
  useEffect(() => {
    const getTeacherInfo = () => {
      try {
        const userData = localStorage.getItem("userData");
        const userInfo = localStorage.getItem("userInfo");
        
        if (userData || userInfo) {
          const ud = userData ? JSON.parse(userData) : null;
          const ui = userInfo ? JSON.parse(userInfo) : null;
          
          const email = ud?.email || ui?.email || null;
          const name = ud?.fullname || ui?.fullname || ui?.name || "Teacher";
          
          setTeacherEmail(email);
          setTeacherName(name);
          console.log("👨‍🏫 Teacher loaded:", { email, name });
        }
      } catch (e) {
        console.error("❌ Error reading teacher info:", e);
        setError("Failed to load teacher information");
      }
    };

    getTeacherInfo();
  }, []);

  // Calculate teacher statistics
  const calculateStats = useCallback((entries: TimetableEntry[]) => {
    const totalClasses = entries.length;
    const totalSubjects = new Set(entries.map(e => e.subject_name)).size;
    const teachingDays = new Set(entries.map(e => e.day_of_week)).size;
    
    // Calculate total weekly hours
    const weeklyHours = entries.reduce((total, entry) => {
      const start = new Date(`1970-01-01T${entry.start_time}`);
      const end = new Date(`1970-01-01T${entry.end_time}`);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + duration;
    }, 0);

    return {
      totalClasses,
      totalSubjects,
      teachingDays,
      weeklyHours: Math.round(weeklyHours * 10) / 10
    };
  }, []);

  // Fetch timetable for this teacher
  const fetchTimetable = useCallback(async (isRefresh = false) => {
    if (!teacherEmail) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      console.log("📡 Fetching timetable for teacher:", teacherEmail);
      const res = await axios.get(`${API_BASE}timetable/`);
      const allEntries: TimetableEntry[] = res.data || [];
      console.log("📋 Total timetable entries:", allEntries.length);

      const teacherEntries = allEntries.filter(
        (t) => t.teacher.toLowerCase() === teacherEmail.toLowerCase()
      );
      
      console.log("✅ Filtered teacher timetable entries:", teacherEntries);
      setTimetable(teacherEntries);
      setFilteredTimetable(teacherEntries);
      
      // Calculate statistics
      if (teacherEntries.length > 0) {
        setStats(calculateStats(teacherEntries));
      }
      
    } catch (err: any) {
      console.error("❌ Error fetching teacher timetable:", err);
      setError(
        err.response?.data?.message || 
        "Failed to load timetable. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [teacherEmail, calculateStats]);

  // Apply filters to timetable
  useEffect(() => {
    if (!timetable.length) {
      setFilteredTimetable([]);
      return;
    }

    let filtered = timetable;

    // Filter by day
    if (filters.day !== "all") {
      filtered = filtered.filter(entry => 
        entry.day_of_week.toLowerCase() === filters.day.toLowerCase()
      );
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.subject_name?.toLowerCase().includes(searchTerm) ||
        entry.class_name?.toLowerCase().includes(searchTerm) ||
        entry.section?.toLowerCase().includes(searchTerm) ||
        entry.room_number?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by time range (morning/afternoon)
    if (filters.timeRange !== "all") {
      filtered = filtered.filter(entry => {
        const hour = parseInt(entry.start_time.split(':')[0]);
        if (filters.timeRange === "morning") {
          return hour < 12;
        } else {
          return hour >= 12;
        }
      });
    }

    setFilteredTimetable(filtered);
  }, [timetable, filters]);

  // Initial data fetch
  useEffect(() => {
    if (teacherEmail) {
      fetchTimetable();
    }
  }, [teacherEmail, fetchTimetable]);

  // Group entries by day of week
  const groupedByDay = filteredTimetable.reduce<Record<string, TimetableEntry[]>>(
    (acc, entry) => {
      const day = entry.day_of_week || "Unknown";
      if (!acc[day]) acc[day] = [];
      acc[day].push(entry);
      return acc;
    },
    {}
  );

  const orderedDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dayKeys = Object.keys(groupedByDay).sort((a, b) => {
    const ia = orderedDays.indexOf(a);
    const ib = orderedDays.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  // Get current day's classes
  const getTodaysClasses = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return timetable.filter(entry => entry.day_of_week === today)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const todaysClasses = getTodaysClasses();
  const hasTodaysClasses = todaysClasses.length > 0;

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 font-medium text-base sm:text-lg mb-2">Loading Your Timetable</p>
            <p className="text-gray-400 text-xs sm:text-sm">Preparing your weekly schedule...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-3 sm:p-4 md:p-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Teaching Schedule</h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2 text-sm sm:text-base">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    Welcome, {teacherName}
                    {teacherEmail && (
                      <span className="text-gray-400 text-xs sm:text-sm">({teacherEmail})</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => fetchTimetable(true)}
                  disabled={refreshing}
                  className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors w-full xs:w-auto justify-center"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Today's Overview */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">
                    Today: {new Date().toLocaleDateString("en-US", { 
                      weekday: "long", 
                      month: "long", 
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasTodaysClasses ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      <span className="text-xs sm:text-sm text-green-700 font-medium">
                        {todaysClasses.length} class{todaysClasses.length === 1 ? '' : 'es'} today
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-500">No classes scheduled today</span>
                    </>
                  )}
                </div>
              </div>
              
              {hasTodaysClasses && (
                <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-2">
                  {todaysClasses.map((classItem, index) => (
                    <div
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-white rounded-lg border border-blue-200 text-xs font-medium text-blue-700 flex items-center gap-1 sm:gap-2 flex-wrap"
                    >
                      <Clock className="h-3 w-3" />
                      {classItem.start_time.slice(0, 5)} - {classItem.end_time.slice(0, 5)}
                      <span className="text-blue-600 hidden xs:inline">•</span>
                      <span className="truncate max-w-[80px] sm:max-w-none">{classItem.subject_name}</span>
                      <span className="text-blue-600 hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{classItem.class_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {timetable.length > 0 && (
          <div className="mb-4 sm:mb-6 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-2 bg-blue-100 rounded-lg sm:rounded-xl">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Weekly Classes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-2 bg-green-100 rounded-lg sm:rounded-xl">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Subjects</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-2 bg-purple-100 rounded-lg sm:rounded-xl">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.teachingDays}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Teaching Days</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-2 bg-orange-100 rounded-lg sm:rounded-xl">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.weeklyHours}h</p>
                  <p className="text-xs sm:text-sm text-gray-600">Weekly Hours</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        {timetable.length > 0 && (
          <div className="mb-4 sm:mb-6 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Filter Schedule</h3>
              </div>
              
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                <div className="relative flex-1">
                  <Search className="h-3 w-3 sm:h-4 sm:w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search classes, subjects..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filters.day}
                  onChange={(e) => setFilters(prev => ({ ...prev, day: e.target.value }))}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full xs:w-auto"
                >
                  <option value="all">All Days</option>
                  {orderedDays.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                
                <select
                  value={filters.timeRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full xs:w-auto"
                >
                  <option value="all">All Day</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              <div>
                <p className="font-semibold text-red-800 text-sm sm:text-base">Unable to Load Timetable</p>
                <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timetable Content */}
        {filteredTimetable.length === 0 && !loading ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-dashed border-gray-200 p-6 sm:p-8 lg:p-12 text-center">
            <div className="max-w-md mx-auto">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {timetable.length === 0 ? "No Timetable Assigned" : "No Matching Classes"}
              </h3>
              <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">
                {timetable.length === 0 
                  ? "Your teaching schedule will appear here once classes are assigned to you by the administration."
                  : "No classes match your current filters. Try adjusting your search criteria."
                }
              </p>
              {timetable.length === 0 && (
                <button
                  onClick={() => fetchTimetable(true)}
                  className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
                >
                  Check Again
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {dayKeys.map((day) => (
              <div
                key={day}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 sm:gap-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      {day}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {groupedByDay[day].length} class{groupedByDay[day].length === 1 ? "" : "es"}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total hours</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">
                      {Math.round(groupedByDay[day].reduce((total, entry) => {
                        const start = new Date(`1970-01-01T${entry.start_time}`);
                        const end = new Date(`1970-01-01T${entry.end_time}`);
                        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                      }, 0) * 10) / 10}h
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 sm:gap-3">
                  {groupedByDay[day]
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((entry, index) => (
                      <div
                        key={`${entry.id}-${index}`}
                        className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 lg:p-5 border border-gray-100 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white to-gray-50/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-50/30 hover:border-blue-200 transition-all duration-200"
                      >
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 mb-3 sm:mb-0">
                          <div className="p-2 sm:p-3 bg-blue-500/10 rounded-xl sm:rounded-2xl group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-1 sm:mb-2">
                              <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg truncate">
                                {entry.subject_name || "General Subject"}
                              </h3>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                                {entry.class_name} {entry.section && `• ${entry.section}`}
                              </span>
                            </div>
                            
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                                Room: {entry.room_number || "Not assigned"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                                Class ID: {entry.class_id}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-left sm:text-right">
                          <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs sm:text-sm group-hover:bg-blue-100 group-hover:border-blue-300 group-hover:text-blue-700 transition-colors">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {entry.start_time?.slice(0, 5)} - {entry.end_time?.slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Information */}
        {timetable.length > 0 && (
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">
              Timetable last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
            <p className="text-gray-400 text-xs mt-1 sm:mt-2">
              For any changes or discrepancies, please contact the administration office.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeachersTimetablePage;