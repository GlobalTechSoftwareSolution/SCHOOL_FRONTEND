"use client";

import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  assigned_to_email: string;
  created_by_email: string;
}

const StudentTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api/tasks/";

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const storedUser = localStorage.getItem("userInfo");
        const accessToken = localStorage.getItem("accessToken");

        if (!storedUser || !accessToken) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        const email = user?.email;

        if (!email) {
          setError("Email not found in user data.");
          setLoading(false);
          return;
        }

        // Fetch tasks for the student
        const response = await axios.get(`${API_BASE}1/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = response.data;
        setTasks(Array.isArray(data) ? data : [data]);
      } catch (err: any) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-700 bg-red-50 border border-red-200";
      case "medium":
        return "text-amber-700 bg-amber-50 border border-amber-200";
      case "low":
        return "text-green-700 bg-green-50 border border-green-200";
      default:
        return "text-gray-700 bg-gray-50 border border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "todo":
        return "text-orange-700 bg-orange-50 border border-orange-200";
      case "completed":
        return "text-green-700 bg-green-50 border border-green-200";
      default:
        return "text-gray-700 bg-gray-50 border border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "todo":
        return "⏳";
      case "completed":
        return "✅";
      default:
        return "📄";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "🔥";
      case "medium":
        return "⚡";
      case "low":
        return "💤";
      default:
        return "📌";
    }
  };

  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysLeftColor = (days: number) => {
    if (days < 0) return "text-red-700 bg-red-50 border border-red-200";
    if (days === 0) return "text-orange-700 bg-orange-50 border border-orange-200";
    if (days <= 2) return "text-amber-700 bg-amber-50 border border-amber-200";
    if (days <= 5) return "text-yellow-700 bg-yellow-50 border border-yellow-200";
    return "text-green-700 bg-green-50 border border-green-200";
  };

  const getDaysLeftText = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    return task.status.toLowerCase() === activeTab;
  });

  const getProgressStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status.toLowerCase() === 'completed').length;
    const todo = tasks.filter(t => t.status.toLowerCase() === 'todo').length;
    
    return { total, completed, todo };
  };

  const stats = getProgressStats();

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading your tasks...</div>
            <p className="text-gray-500 mt-2">Getting everything ready for you</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-red-600 font-semibold text-lg mb-2">Oops! Something went wrong</div>
            <div className="text-gray-600">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎯 Student Task Manager
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Stay organized and track your academic tasks efficiently
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Total Tasks</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Completed</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                </div>
              </div>
            </div>
            

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">⏳</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">To Do</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.todo}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/50">
            <div className="flex flex-wrap gap-2">
              {["all", "todo", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <span>{getStatusIcon(tab === 'all' ? 'all' : tab)}</span>
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                  <span className="px-2 py-1 text-xs bg-white/20 rounded-full">
                    {tab === "all" 
                      ? tasks.length 
                      : tasks.filter(t => t.status.toLowerCase() === tab).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const daysLeft = calculateDaysLeft(task.due_date);
                return (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  >
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                      {/* Header with Priority and Days Left */}
                      <div className="flex justify-between items-start mb-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {getPriorityIcon(task.priority)} {task.priority}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getDaysLeftColor(
                            daysLeft
                          )}`}
                        >
                          {getDaysLeftText(daysLeft)}
                        </span>
                      </div>

                      {/* Task Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {task.title}
                      </h3>

                      {/* Task Description */}
                      <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Status and Due Date */}
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {getStatusIcon(task.status)} {task.status.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Assigned By */}
                      <div className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between">
                          <span>Assigned by:</span>
                          <span className="font-medium text-gray-700">{task.created_by_email}</span>
                        </div>
                      </div>

                      {/* Hover Indicator */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-blue-600 font-medium text-sm">View Details →</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-12 text-center border border-white/50">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === "all"
                    ? "You don't have any tasks assigned yet."
                    : `No ${activeTab.replace('-', ' ')} tasks found.`}
                </p>
                <div className="text-sm text-gray-500">
                  Tasks assigned by your teachers will appear here
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task Detail Modal */}
        {isModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div 
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-3xl p-6 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedTask.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full bg-white/20 flex items-center gap-1`}>
                        {getPriorityIcon(selectedTask.priority)} {selectedTask.priority}
                      </span>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full bg-white/20 flex items-center gap-1`}>
                        {getStatusIcon(selectedTask.status)} {selectedTask.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors ml-4"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Task Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Due Date</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(selectedTask.due_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className={`text-sm font-medium mt-2 ${getDaysLeftColor(calculateDaysLeft(selectedTask.due_date))} px-2 py-1 rounded-full inline-block`}>
                      {getDaysLeftText(calculateDaysLeft(selectedTask.due_date))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Assigned By</div>
                    <div className="font-semibold text-gray-900">{selectedTask.created_by_email}</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Created: {new Date(selectedTask.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedTask.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Task Created</div>
                        <div className="text-sm text-gray-500">{new Date(selectedTask.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Due Date</div>
                        <div className="text-sm text-gray-500">{new Date(selectedTask.due_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    {selectedTask.updated_at !== selectedTask.created_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">Last Updated</div>
                          <div className="text-sm text-gray-500">{new Date(selectedTask.updated_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
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
      </div>
    </DashboardLayout>
  );
};

export default StudentTasks;