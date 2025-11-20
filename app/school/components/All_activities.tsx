"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { 
  FiCalendar, 
  FiActivity, 
  FiPlus, 
  FiUser, 
  FiArrowLeft,
  FiType,
  FiBook,
  FiUsers,
  FiClock,
  FiEdit3,
  FiTrash2,
  FiX
} from "react-icons/fi";

const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/activities/";

const Activities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    type: "",
    date: "",
    class_name: "",
    section: "",
    conducted_by: "principal@school.com",
  });

  // Fetch all activities
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Show popup message
  const showPopup = (message: string, isSuccess: boolean) => {
    setPopupMessage(message);
    if (isSuccess) {
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } else {
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
    }
  };

  // Add new activity
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, newActivity);
      showPopup("Activity created successfully!", true);
      setShowAddForm(false);
      setNewActivity({
        name: "",
        description: "",
        type: "",
        date: "",
        class_name: "",
        section: "",
        conducted_by: "principal@school.com",
      });
      fetchActivities();
    } catch (error) {
      console.error("Error adding activity:", error);
      showPopup("Failed to create activity. Please try again.", false);
    }
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === "all" || activity.type === filterType;
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Get activity type color
  const getActivityTypeColor = (type: string) => {
    const colors: any = {
      Cultural: "bg-purple-100 text-purple-800 border-purple-200",
      Sports: "bg-green-100 text-green-800 border-green-200",
      Academic: "bg-blue-100 text-blue-800 border-blue-200",
      Other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Get activity type icon
  const getActivityTypeIcon = (type: string) => {
    const icons: any = {
      Cultural: "🎭",
      Sports: "⚽",
      Academic: "📚",
      Other: "📅",
    };
    return icons[type] || "📅";
  };

  // Reset form
  const resetForm = () => {
    setShowAddForm(false);
    setNewActivity({
      name: "",
      description: "",
      type: "",
      date: "",
      class_name: "",
      section: "",
      conducted_by: "principal@school.com",
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Success Popup */}
          {showSuccessPopup && (
            <div className="fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in w-full max-w-xs sm:max-w-sm px-4">
              <div className="bg-green-500 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base">
                <span>✅</span>
                <span>{popupMessage}</span>
              </div>
            </div>
          )}

          {/* Error Popup */}
          {showErrorPopup && (
            <div className="fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in w-full max-w-xs sm:max-w-sm px-4">
              <div className="bg-red-500 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base">
                <span>❌</span>
                <span>{popupMessage}</span>
              </div>
            </div>
          )}

          {/* Header Section */}
          {!selectedActivity && (
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 sm:mb-3">
                School Activities Management
              </h1>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                Organize and manage all school events and activities
              </p>
            </div>
          )}

          {/* Controls Section */}
          {!selectedActivity && !showAddForm && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 justify-between items-stretch lg:items-center">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiType className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base w-full sm:w-auto"
                  >
                    <option value="all">All Types</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Add Activity Button */}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base mt-3 sm:mt-0"
                >
                  <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Create New Activity</span>
                  <span className="xs:hidden">New Activity</span>
                </button>
              </div>
            </div>
          )}

          {/* Add Activity Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-3 sm:p-4">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create New Activity</h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 sm:p-2 rounded-full transition-colors duration-200"
                  >
                    <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddActivity} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Activity Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full border border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                        placeholder="Enter activity name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Activity Type
                      </label>
                      <select
                        required
                        className="w-full border border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        value={newActivity.type}
                        onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                      >
                        <option value="">Select Activity Type</option>
                        <option value="Cultural">Cultural Event</option>
                        <option value="Sports">Sports Event</option>
                        <option value="Academic">Academic Event</option>
                        <option value="Other">Other Activity</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Activity Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiCalendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          required
                          className="w-full border border-gray-300 pl-9 sm:pl-10 p-2 sm:p-3 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          value={newActivity.date}
                          onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Class Name (Optional)
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        value={newActivity.class_name}
                        onChange={(e) => setNewActivity({ ...newActivity, class_name: e.target.value })}
                        placeholder="e.g., Class 10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Section (Optional)
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        value={newActivity.section}
                        onChange={(e) => setNewActivity({ ...newActivity, section: e.target.value })}
                        placeholder="e.g., A, B, C"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Activity Description
                    </label>
                    <textarea
                      className="w-full border border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                      rows={4}
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      placeholder="Describe the activity, its purpose, and any important details..."
                    ></textarea>
                  </div>

                  <div className="flex flex-col xs:flex-row gap-3 pt-3 sm:pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                    >
                      Create Activity
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Activities Grid */}
          {!selectedActivity && !showAddForm && (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-12 sm:py-20">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-500"></div>
                </div>
              ) : filteredActivities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => setSelectedActivity(activity)}
                      className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-200"
                    >
                      <div className="p-4 sm:p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="text-xl sm:text-2xl">
                              {getActivityTypeIcon(activity.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-gray-800 text-base sm:text-lg line-clamp-1">
                                {activity.name}
                              </h3>
                              <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getActivityTypeColor(activity.type)} mt-1`}>
                                {activity.type || "General"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed text-sm sm:text-base">
                          {activity.description || "No description provided."}
                        </p>

                        {/* Details */}
                        <div className="space-y-2 text-xs sm:text-sm text-gray-600 border-t border-gray-100 pt-3 sm:pt-4">
                          <div className="flex justify-between">
                            <span className="font-medium">Date:</span>
                            <span>
                              {activity.date 
                                ? new Date(activity.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : "Not scheduled"}
                            </span>
                          </div>
                          {activity.class_name && (
                            <div className="flex justify-between">
                              <span className="font-medium">Class:</span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {activity.class_name} {activity.section ? `- ${activity.section}` : ''}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="font-medium">Conducted By:</span>
                            <span className="text-purple-600 font-medium truncate ml-2 max-w-[120px] sm:max-w-none">
                              {activity.conducted_by || activity.conducted_by_email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-16">
                  <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-12 max-w-md mx-auto shadow-lg">
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎭</div>
                    <h3 className="text-gray-700 font-semibold text-base sm:text-lg mb-2">
                      {searchTerm || filterType !== "all" ? "No Activities Found" : "No Activities Planned"}
                    </h3>
                    <p className="text-gray-500 mb-4 text-sm sm:text-base">
                      {searchTerm || filterType !== "all" 
                        ? "Try adjusting your search or filter criteria." 
                        : "Get started by creating your first school activity."}
                    </p>
                    {searchTerm || filterType !== "all" ? (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilterType("all");
                        }}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base"
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base"
                      >
                        Create First Activity
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Activity Detail View */}
          {selectedActivity && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-t-xl sm:rounded-t-2xl p-4 sm:p-6 md:p-8 text-white">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-3 sm:mb-4 group text-sm sm:text-base"
                >
                  <FiArrowLeft className="group-hover:-translate-x-1 transition-transform w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Back to Activities</span>
                </button>
                
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
                  <div className="text-4xl sm:text-5xl md:text-6xl">
                    {getActivityTypeIcon(selectedActivity.type)}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{selectedActivity.name}</h1>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${getActivityTypeColor(selectedActivity.type)} bg-white/20 backdrop-blur-sm`}>
                        {selectedActivity.type || "General Activity"}
                      </span>
                      {selectedActivity.class_name && (
                        <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-white/20 backdrop-blur-sm">
                          Class {selectedActivity.class_name} {selectedActivity.section ? `- ${selectedActivity.section}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  {/* Activity Details */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                        📝 Activity Details
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                          <div>
                            <div className="text-xs sm:text-sm text-gray-500">Scheduled Date</div>
                            <div className="font-semibold text-sm sm:text-base">
                              {selectedActivity.date 
                                ? new Date(selectedActivity.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'long'
                                  })
                                : "Not scheduled"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                          <div>
                            <div className="text-xs sm:text-sm text-gray-500">Organized By</div>
                            <div className="font-semibold text-sm sm:text-base">
                              {selectedActivity.conducted_by || selectedActivity.conducted_by_email}
                            </div>
                          </div>
                        </div>

                        {selectedActivity.class_name && (
                          <div className="flex items-center gap-2 sm:gap-3">
                            <FiBook className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                            <div>
                              <div className="text-xs sm:text-sm text-gray-500">Assigned Class</div>
                              <div className="font-semibold text-sm sm:text-base">
                                Class {selectedActivity.class_name} {selectedActivity.section ? `- Section ${selectedActivity.section}` : ''}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      📋 Activity Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      {selectedActivity.description || "No detailed description provided for this activity."}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-4 sm:mt-6 md:mt-8 bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    ⏰ Activity Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Created On</div>
                      <div className="font-semibold text-sm sm:text-base">
                        {new Date(selectedActivity.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Last Updated</div>
                      <div className="font-semibold text-sm sm:text-base">
                        {new Date(selectedActivity.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Stats */}
          {!selectedActivity && !showAddForm && filteredActivities.length > 0 && (
            <div className="mt-4 sm:mt-6 md:mt-8 text-center text-gray-500 text-xs sm:text-sm">
              Showing {filteredActivities.length} of {activities.length} activities
              {searchTerm && ` matching "${searchTerm}"`}
              {filterType !== "all" && ` in ${filterType}`}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default Activities;