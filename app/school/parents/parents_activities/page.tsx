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
  Eye,
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
  Palette 

} from "lucide-react";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);

  // ✅ Fetch all activities
  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/activities/`);
      console.log("🎯 Activities Data:", res.data);
      setActivities(res.data);
    } catch (err: any) {
      console.error("❌ Error fetching activities:", err);
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

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || activity.category === categoryFilter;
    const matchesDate = !dateFilter || activity.date === dateFilter;

    return matchesSearch && matchesCategory && matchesDate;
  });

  // Get activity statistics
  const getActivityStats = () => {
    const totalActivities = activities.length;
    const upcomingActivities = activities.filter(activity => 
      activity.date && new Date(activity.date) >= new Date()
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
      case "  Dumbbell":
        return <  Dumbbell className="h-5 w-5 text-green-600" />;
      case "academic":
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case "Palettes":
        return <Palette className="h-5 w-5 text-purple-600" />;
      case "music":
        return <Music className="h-5 w-5 text-red-600" />;
      case "cultural":
        return <Award className="h-5 w-5 text-yellow-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "  Dumbbell":
        return "bg-green-50 text-green-700 border-green-200";
      case "academic":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Palettes":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "music":
        return "bg-red-50 text-red-700 border-red-200";
      case "cultural":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const isUpcoming = (date: string) => {
    return date && new Date(date) >= new Date();
  };

  if (loading) {
    return (
      <DashboardLayout role="parents">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading activities...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">School Activities</h1>
          <p className="text-gray-600 mt-2">Discover all extracurricular and school-wide activities</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalActivities}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.upcomingActivities}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Past Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pastActivities}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.categories}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Star className="h-6 w-6 text-purple-600" />
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
                placeholder="Search activities by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
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

        {/* Activities List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              School Activities
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {filteredActivities.length} activities
              </span>
            </h2>
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          {error && (
            <div className="p-6 text-center text-red-500 bg-red-50 border-b border-red-200">
              {error}
            </div>
          )}

          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activities.length === 0 ? "No Activities Found" : "No Matching Activities"}
              </h3>
              <p className="text-gray-600">
                {activities.length === 0 
                  ? "No activities found at the moment."
                  : "Try adjusting your search or filters to find what you're looking for."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedActivity(expandedActivity === index ? null : index)}
                >
                  <div className="flex items-stPalette justify-between">
                    <div className="flex items-stPalette gap-4 flex-1">
                      <div className="mt-1">
                        {getCategoryIcon(activity.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {activity.title || "Untitled Activity"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(activity.category)}`}>
                              {activity.category || "General"}
                            </span>
                            {activity.date && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isUpcoming(activity.date) 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                                {isUpcoming(activity.date) ? "Upcoming" : "Past"}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          {activity.date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(activity.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</span>
                            </div>
                          )}
                          {activity.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{activity.location}</span>
                            </div>
                          )}
                          {activity.created_by_email && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>By: {activity.created_by_email}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-700 line-clamp-2">
                          {activity.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedActivity(expandedActivity === index ? null : index);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {expandedActivity === index ? 
                          <ChevronUp className="h-4 w-4 text-gray-600" /> : 
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedActivity === index && (
                    <div className="mt-4 pl-9 border-t pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Activity Details</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Category:</span>
                              <span className="text-gray-900 font-medium">{activity.category || "General"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Date:</span>
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
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Full Description</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                            {activity.description || "No detailed description provided for this activity."}
                          </p>
                        </div>
                      </div>

                      {/* Additional Information */}
                      {(activity.pPaletteicipants || activity.requirements) && (
                        <div className="mt-4 grid md:grid-cols-2 gap-6">
                          {activity.pPaletteicipants && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                PPaletteicipants
                              </h4>
                              <p className="text-gray-700 text-sm">{activity.pPaletteicipants}</p>
                            </div>
                          )}
                          {activity.requirements && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                              <p className="text-gray-700 text-sm">{activity.requirements}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredActivities.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredActivities.length}</span> of{" "}
                  <span className="font-semibold">{activities.length}</span> activities
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Upcoming: {stats.upcomingActivities}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>Past: {stats.pastActivities}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span>Categories: {stats.categories}</span>
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

export default ActivitiesPage;