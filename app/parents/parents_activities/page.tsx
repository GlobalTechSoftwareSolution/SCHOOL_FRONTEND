"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  Star,
  Award,
  BookOpen,
  Music,
  Dumbbell,
  Palette,
  Sparkles,
  Target,
  Zap,
  Trophy,
  Activity
} from "lucide-react";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

interface Activity {
  id: number;
  title?: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
  category?: string;
  created_by_email?: string;
  participants?: string;
  requirements?: string;
}

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [viewType, setViewType] = useState<"all" | "upcoming" | "past">("all");

  // ✅ Fetch all activities
  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/activities/`);
      setActivities(res.data);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: unknown } };
      console.error("❌ Error fetching activities:", axiosError.response?.data || err);
      setError("Failed to load activities. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Get unique categories for filter
  const uniqueCategories = [...new Set(activities.map(activity => activity.category || "General"))];

  // Function to check if activity is upcoming
  const isUpcomingActivity = (activity: Activity) => {
    if (!activity.date) return false;
    const activityDate = new Date(activity.date);
    const today = new Date();
    // Reset time to compare only dates
    activityDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return activityDate >= today;
  };

  // Filter activities based on search, filters, and view type
  const filteredActivities = activities.filter(activity => {
    const matchesSearch =
      activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || activity.category === categoryFilter;
    const matchesDate = !dateFilter || activity.date === dateFilter;

    // Filter by view type
    let matchesViewType = true;
    if (viewType === "upcoming") {
      matchesViewType = isUpcomingActivity(activity);
    } else if (viewType === "past") {
      matchesViewType = !isUpcomingActivity(activity);
    }

    return matchesSearch && matchesCategory && matchesDate && matchesViewType;
  });

  // Get activity statistics
  const getActivityStats = () => {
    const totalActivities = activities.length;
    const upcomingActivities = activities.filter(activity =>
      isUpcomingActivity(activity)
    ).length;
    const pastActivities = totalActivities - upcomingActivities;

    return {
      totalActivities,
      upcomingActivities,
      pastActivities,
      categories: uniqueCategories.length
    };
  };

  const stats = getActivityStats();

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "sports":
        return <Dumbbell className="h-4 w-4 xs:h-5 xs:w-5 text-green-600" />;
      case "academic":
        return <BookOpen className="h-4 w-4 xs:h-5 xs:w-5 text-blue-600" />;
      case "art":
        return <Palette className="h-4 w-4 xs:h-5 xs:w-5 text-purple-600" />;
      case "music":
        return <Music className="h-4 w-4 xs:h-5 xs:w-5 text-red-600" />;
      case "cultural":
        return <Award className="h-4 w-4 xs:h-5 xs:w-5 text-yellow-600" />;
      default:
        return <Star className="h-4 w-4 xs:h-5 xs:w-5 text-gray-600" />;
    }
  };


  // Handle card click to filter activities
  const handleStatsCardClick = (type: "all" | "upcoming" | "past") => {
    setViewType(type);
  };

  if (loading) {
    return (
      <DashboardLayout role="parents">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 xs:h-16 xs:w-16 border-b-2 border-blue-600 mx-auto mb-3 xs:mb-4"></div>
              <Activity className="h-6 w-6 xs:h-8 xs:w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-600 font-medium text-sm xs:text-base">Loading activities...</p>
            <p className="text-gray-400 text-xs xs:text-sm mt-1">Discovering amazing school events</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parents">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-4 xs:p-5 sm:p-6">
        {/* Enhanced Header */}
        <div className="mb-6 xs:mb-7 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 xs:gap-5 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
                <div className="p-2 xs:p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl xs:rounded-2xl shadow-lg">
                  <Activity className="h-5 xs:h-6 sm:h-7 w-5 xs:w-6 sm:w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-gradient-to-br from-gray-900 to-blue-900 bg-clip-text text-transparent">
                    School Activities
                  </h1>
                  <p className="text-gray-600 text-sm xs:text-base sm:text-lg mt-1 xs:mt-2">
                    Discover all extracurricular and school-wide activities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Enhanced with click functionality */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6 mb-6 xs:mb-7 sm:mb-8">
          {/* Total Activities Card */}
          <div
            className={`bg-gradient-to-br from-white to-blue-50/50 rounded-xl xs:rounded-2xl shadow-sm border p-4 xs:p-5 sm:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer ${viewType === "all"
                ? "border-blue-500 shadow-lg scale-[1.02]"
                : "border-blue-200/30 hover:border-blue-300"
              }`}
            onClick={() => handleStatsCardClick("all")}
          >
            <div className="absolute top-0 right-0 w-16 h-16 xs:w-20 xs:h-20 bg-blue-500/5 rounded-full -translate-y-6 xs:-translate-y-8 translate-x-6 xs:translate-x-8"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mt-1 xs:mt-2">{stats.totalActivities}</p>
              </div>
              <div className={`p-2 xs:p-3 rounded-lg xs:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${viewType === "all"
                  ? "bg-gradient-to-br from-blue-600 to-blue-700"
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
                }`}>
                <Calendar className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 xs:mt-3 sm:mt-4">
              <Sparkles className="h-3 w-3 xs:h-4 xs:w-4 text-blue-500" />
              <span className="text-xs xs:text-sm text-blue-600 font-medium">
                {viewType === "all" ? "✓ Showing all activities" : "Click to view all activities"}
              </span>
            </div>
          </div>

          {/* Upcoming Activities Card */}
          <div
            className={`bg-gradient-to-br from-white to-green-50/50 rounded-xl xs:rounded-2xl shadow-sm border p-4 xs:p-5 sm:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer ${viewType === "upcoming"
                ? "border-green-500 shadow-lg scale-[1.02]"
                : "border-green-200/30 hover:border-green-300"
              }`}
            onClick={() => handleStatsCardClick("upcoming")}
          >
            <div className="absolute top-0 right-0 w-16 h-16 xs:w-20 xs:h-20 bg-green-500/5 rounded-full -translate-y-6 xs:-translate-y-8 translate-x-6 xs:translate-x-8"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mt-1 xs:mt-2">{stats.upcomingActivities}</p>
              </div>
              <div className={`p-2 xs:p-3 rounded-lg xs:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${viewType === "upcoming"
                  ? "bg-gradient-to-br from-green-600 to-emerald-700"
                  : "bg-gradient-to-br from-green-500 to-emerald-600"
                }`}>
                <Clock className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 xs:mt-3 sm:mt-4">
              <Target className="h-3 w-3 xs:h-4 xs:w-4 text-green-500" />
              <span className="text-xs xs:text-sm text-green-600 font-medium">
                {viewType === "upcoming" ? "✓ Showing upcoming activities" : "Click to view upcoming events"}
              </span>
            </div>
          </div>

          {/* Past Events Card */}
          <div
            className={`bg-gradient-to-br from-white to-orange-50/50 rounded-xl xs:rounded-2xl shadow-sm border p-4 xs:p-5 sm:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer ${viewType === "past"
                ? "border-orange-500 shadow-lg scale-[1.02]"
                : "border-orange-200/30 hover:border-orange-300"
              }`}
            onClick={() => handleStatsCardClick("past")}
          >
            <div className="absolute top-0 right-0 w-16 h-16 xs:w-20 xs:h-20 bg-orange-500/5 rounded-full -translate-y-6 xs:-translate-y-8 translate-x-6 xs:translate-x-8"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Past Events</p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mt-1 xs:mt-2">{stats.pastActivities}</p>
              </div>
              <div className={`p-2 xs:p-3 rounded-lg xs:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${viewType === "past"
                  ? "bg-gradient-to-br from-orange-600 to-amber-700"
                  : "bg-gradient-to-br from-orange-500 to-amber-600"
                }`}>
                <Award className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>  
            <div className="flex items-center gap-1 mt-2 xs:mt-3 sm:mt-4">
              <Trophy className="h-3 w-3 xs:h-4 xs:w-4 text-orange-500" />
              <span className="text-xs xs:text-sm text-orange-600 font-medium">
                {viewType === "past" ? "✓ Showing past activities" : "Click to view past events"}
              </span>
            </div>
          </div>
        </div>

        {/* View Type Indicator */}
        {viewType !== "all" && (
          <div className="mb-6 xs:mb-7 sm:mb-8">
            <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl xs:rounded-2xl shadow-sm border border-slate-200/60 p-4 xs:p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 xs:gap-4">
                <div className="flex items-center gap-2 xs:gap-3">
                  {viewType === "upcoming" ? (
                    <>
                      <div className="p-2 xs:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg xs:rounded-xl">
                        <Clock className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900 text-lg xs:text-xl">
                          Showing Upcoming Activities
                        </h2>
                        <p className="text-gray-600 text-sm xs:text-base">
                          Viewing {filteredActivities.length} upcoming activities
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 xs:p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg xs:rounded-xl">
                        <Award className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900 text-lg xs:text-xl">
                          Showing Past Activities
                        </h2>
                        <p className="text-gray-600 text-sm xs:text-base">
                          Viewing {filteredActivities.length} past activities
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleStatsCardClick("all")}
                  className="px-4 xs:px-6 py-2 xs:py-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg xs:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium text-sm xs:text-base shadow-lg hover:shadow-xl"
                >
                  Show All Activities
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters and Search */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl xs:rounded-2xl shadow-sm border border-slate-200/60 p-4 xs:p-5 sm:p-6 mb-6 xs:mb-7 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 xs:gap-5 items-start lg:items-center justify-between">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 xs:h-5 xs:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search activities by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 xs:pl-10 pr-4 py-3 xs:py-4 border border-gray-300/60 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm xs:text-base"
              />
            </div>

            <div className="flex flex-wrap gap-2 xs:gap-3 w-full lg:w-auto">
              <div className="relative flex-1 xs:flex-none min-w-[140px]">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 xs:h-4 xs:w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-8 xs:pl-10 pr-4 py-3 xs:py-4 border border-gray-300/60 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm xs:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activities Cards Grid */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl xs:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-4 xs:p-5 sm:p-6 border-b border-gray-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 xs:gap-4 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 xs:gap-4">
              <div className="p-2 xs:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg xs:rounded-xl shadow-lg">
                <Calendar className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">
                  {viewType === "all" ? "All School Activities" :
                    viewType === "upcoming" ? "Upcoming Activities" : "Past Activities"}
                </h2>
                <p className="text-gray-600 text-xs xs:text-sm">
                  {viewType === "all" ? "Discover amazing events and activities" :
                    viewType === "upcoming" ? "Future events and activities" : "Completed events and activities"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 xs:gap-3 mr-10">
              <span className="bg-blue-100 text-blue-800 text-xs xs:text-sm px-2 xs:px-3 py-1 xs:py-2 rounded-full font-medium flex items-center gap-1 xs:gap-2">
                <Sparkles className="h-3 w-3 xs:h-4 xs:w-4" />
                {filteredActivities.length} {viewType === "all" ? "activities" :
                  viewType === "upcoming" ? "upcoming" : "past"}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 xs:p-6 text-center text-red-500 bg-red-50 border-b border-red-200 text-sm xs:text-base">
              {error}
            </div>
          )}

          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 xs:py-16">
              <div className="w-16 h-16 xs:w-20 xs:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4">
                <Calendar className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <h3 className="text-lg xs:text-xl font-semibold text-gray-900 mb-1 xs:mb-2">
                {viewType === "all" ? "No Activities Found" :
                  viewType === "upcoming" ? "No Upcoming Activities" : "No Past Activities"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto text-sm xs:text-base px-4">
                {viewType === "all"
                  ? "No activities found at the moment."
                  : viewType === "upcoming"
                    ? "No upcoming activities found. Check back later!"
                    : "No past activities found."
                }
              </p>
              {viewType !== "all" && (
                <button
                  onClick={() => handleStatsCardClick("all")}
                  className="mt-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg xs:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium text-sm xs:text-base shadow-lg hover:shadow-xl"
                >
                  View All Activities
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 p-4 xs:p-5 sm:p-6">
              {filteredActivities.map((activity, index) => {
                const isUpcoming = isUpcomingActivity(activity);

                return (
                  <div
                    key={activity.id}
                    className="bg-white rounded-lg xs:rounded-xl border border-gray-200/60 p-4 xs:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-blue-300"
                    onClick={() => setExpandedActivity(expandedActivity === index ? null : index)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 xs:mb-4">
                      <div className="flex items-center gap-2 xs:gap-3">
                        <div className="transform group-hover:scale-110 transition-transform duration-300">
                          {getCategoryIcon(activity.category || "other")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm xs:text-base group-hover:text-blue-900 transition-colors line-clamp-1">
                            {activity.title || "Untitled Activity"}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isUpcoming ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {isUpcoming ? "Upcoming" : "Completed"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedActivity(expandedActivity === index ? null : index);
                          }}
                          className="p-1 xs:p-2 hover:bg-gray-50 rounded-lg transition-colors duration-300 flex-shrink-0"
                        >
                          {expandedActivity === index ?
                            <ChevronUp className="h-4 w-4 xs:h-5 xs:w-5 text-gray-600" /> :
                            <ChevronDown className="h-4 w-4 xs:h-5 xs:w-5 text-gray-600 group-hover:text-blue-600" />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Activity Details */}
                    <div className="space-y-2 xs:space-y-3">
                      {activity.date && (
                        <div className="flex items-center justify-between text-xs xs:text-sm">
                          <span className="text-gray-600 flex items-center gap-1 xs:gap-2">
                            <Calendar className="h-3 w-3 xs:h-4 xs:w-4" />
                            Date:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {new Date(activity.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}

                      {activity.location && (
                        <div className="flex items-center justify-between text-xs xs:text-sm">
                          <span className="text-gray-600 flex items-center gap-1 xs:gap-2">
                            <MapPin className="h-3 w-3 xs:h-4 xs:w-4" />
                            Location:
                          </span>
                          <span className="font-semibold text-gray-900 truncate ml-2 max-w-[100px] xs:max-w-[120px]">
                            {activity.location}
                          </span>
                        </div>
                      )}

                      {activity.time && (
                        <div className="flex items-center justify-between text-xs xs:text-sm">
                          <span className="text-gray-600 flex items-center gap-1 xs:gap-2">
                            <Clock className="h-3 w-3 xs:h-4 xs:w-4" />
                            Time:
                          </span>
                          <span className="font-semibold text-gray-900">{activity.time}</span>
                        </div>
                      )}

                      {activity.created_by_email && (
                        <div className="flex items-center justify-between text-xs xs:text-sm">
                          <span className="text-gray-600 flex items-center gap-1 xs:gap-2">
                            <User className="h-3 w-3 xs:h-4 xs:w-4" />
                            Organizer:
                          </span>
                          <span className="font-semibold text-gray-900 truncate ml-2 max-w-[100px] xs:max-w-[120px]">
                            {activity.created_by_email}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description Preview */}
                    <div className="mt-3 xs:mt-4">
                      <p className="text-gray-700 text-xs xs:text-sm line-clamp-2 leading-relaxed">
                        {activity.description || "No description provided."}
                      </p>
                    </div>

                    {/* Enhanced Expanded Details */}
                    {expandedActivity === index && (
                      <div className="mt-4 xs:mt-5 border-t border-gray-200/60 pt-4 xs:pt-5 bg-gray-50/50 rounded-lg xs:rounded-xl p-3 xs:p-4">
                        <div className="space-y-3 xs:space-y-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs xs:text-sm mb-2 flex items-center gap-1 xs:gap-2">
                              <Zap className="h-3 w-3 xs:h-4 xs:w-4 text-blue-500" />
                              Activity Details
                            </h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Category:</span>
                                <span className="text-gray-900 font-medium">{activity.category || "General"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Full Date:</span>
                                <span className="text-gray-900 font-medium">
                                  {activity.date ? new Date(activity.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  }) : "Not specified"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Time:</span>
                                <span className="text-gray-900 font-medium">
                                  {activity.time || "All day"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="text-gray-900 font-medium">{activity.location || "Not specified"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Organizer:</span>
                                <span className="text-gray-900 font-medium">{activity.created_by_email || "School"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isUpcoming
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                  }`}>
                                  {isUpcoming ? "Upcoming Event" : "Past Event"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-gray-900 text-xs xs:text-sm mb-2 flex items-center gap-1 xs:gap-2">
                              <BookOpen className="h-3 w-3 xs:h-4 xs:w-4 text-purple-500" />
                              Full Description
                            </h4>
                            <p className="text-gray-700 bg-white p-2 xs:p-3 rounded-lg xs:rounded-xl border border-gray-200/60 text-xs leading-relaxed">
                              {activity.description || "No detailed description provided for this activity."}
                            </p>
                          </div>
                        </div>

                        {/* Additional Information */}
                        {(activity.participants || activity.requirements) && (
                          <div className="mt-3 xs:mt-4 space-y-3 xs:space-y-4">
                            {activity.participants && (
                              <div>
                                <h4 className="font-bold text-gray-900 text-xs xs:text-sm mb-2 flex items-center gap-1 xs:gap-2">
                                  <Users className="h-3 w-3 xs:h-4 xs:w-4 text-green-500" />
                                  Participants
                                </h4>
                                <p className="text-gray-700 text-xs bg-white p-2 xs:p-3 rounded-lg xs:rounded-xl border border-gray-200/60">
                                  {activity.participants}
                                </p>
                              </div>
                            )}
                            {activity.requirements && (
                              <div>
                                <h4 className="font-bold text-gray-900 text-xs xs:text-sm mb-2 flex items-center gap-1 xs:gap-2">
                                  <Target className="h-3 w-3 xs:h-4 xs:w-4 text-orange-500" />
                                  Requirements
                                </h4>
                                <p className="text-gray-700 text-xs bg-white p-2 xs:p-3 rounded-lg xs:rounded-xl border border-gray-200/60">
                                  {activity.requirements}
                                </p>
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

        {/* Enhanced Summary Footer */}
        {filteredActivities.length > 0 && (
          <div className="mt-6 xs:mt-8 bg-gradient-to-br from-white to-emerald-50/30 rounded-xl xs:rounded-2xl shadow-sm border border-emerald-200/30 p-4 xs:p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 xs:gap-4">
              <div className="flex items-center gap-2 xs:gap-3">
                <Award className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-emerald-600" />
                <div>
                  <p className="text-xs xs:text-sm text-gray-600 font-medium">
                    {viewType === "all"
                      ? `Showing ${filteredActivities.length} of ${activities.length} activities`
                      : viewType === "upcoming"
                        ? `Showing ${filteredActivities.length} upcoming activities`
                        : `Showing ${filteredActivities.length} past activities`}
                  </p>
                  <p className="text-xs text-gray-500">Last updated just now</p>
                </div>
              </div>
              <div className="flex items-center gap-4 xs:gap-6">
                <div
                  className={`flex items-center gap-1 xs:gap-2 cursor-pointer ${viewType === "all" ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                  onClick={() => handleStatsCardClick("all")}
                >
                  <div className="w-2 h-2 xs:w-3 xs:h-3 bg-blue-500 rounded-full shadow-sm"></div>
                  <span className="text-xs xs:text-sm text-gray-600">Total: <span className="font-semibold">{stats.totalActivities}</span></span>
                </div>
                <div
                  className={`flex items-center gap-1 xs:gap-2 cursor-pointer ${viewType === "upcoming" ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                  onClick={() => handleStatsCardClick("upcoming")}
                >
                  <div className="w-2 h-2 xs:w-3 xs:h-3 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-xs xs:text-sm text-gray-600">Upcoming: <span className="font-semibold">{stats.upcomingActivities}</span></span>
                </div>
                <div
                  className={`flex items-center gap-1 xs:gap-2 cursor-pointer ${viewType === "past" ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                  onClick={() => handleStatsCardClick("past")}
                >
                  <div className="w-2 h-2 xs:w-3 xs:h-3 bg-gray-500 rounded-full shadow-sm"></div>
                  <span className="text-xs xs:text-sm text-gray-600">Past: <span className="font-semibold">{stats.pastActivities}</span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ActivitiesPage;