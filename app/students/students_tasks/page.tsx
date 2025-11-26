"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to_email: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  due_date: string;
  created_at: string;
  priority?: "Low" | "Medium" | "High";
  subject?: string;
  teacher_name?: string;
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
}

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0
  });
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Safely read JSON data from localStorage
  const getLocalJSON = useCallback((key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn(`Error parsing localStorage key: ${key}`, err);
      return null;
    }
  }, []);

  // Calculate task statistics
  const calculateStats = useCallback((taskList: Task[]) => {
    const stats = {
      total: taskList.length,
      completed: taskList.filter(task => task.status === "Completed").length,
      pending: taskList.filter(task => task.status === "Pending").length,
      inProgress: taskList.filter(task => task.status === "In Progress").length,
      overdue: taskList.filter(task => {
        if (task.status === "Completed") return false;
        if (!task.due_date) return false;
        return new Date(task.due_date) < new Date();
      }).length
    };
    setStats(stats);
  }, []);

  // Filter and search tasks
  useEffect(() => {
    let result = tasks;

    // Apply status filter
    if (filter !== "all") {
      result = result.filter(task => task.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term) ||
        (task.subject && task.subject.toLowerCase().includes(term)) ||
        (task.teacher_name && task.teacher_name.toLowerCase().includes(term))
      );
    }

    setFilteredTasks(result);
  }, [tasks, filter, searchTerm]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = getLocalJSON("userData") || getLocalJSON("userInfo") || {};
      const email = userData?.email || localStorage.getItem("email");
      const token = localStorage.getItem("accessToken");

      if (!email) {
        setError("Student email not found in localStorage.");
        setLoading(false);
        return;
      }

      const apiUrl = "https://school.globaltechsoftwaresolutions.cloud/api/tasks/";

      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error: ${res.status} - ${text}`);
      }

      const data = await res.json();

      const filteredTasks: Task[] = Array.isArray(data)
        ? data
            .filter((task: any) =>
              task.assigned_to_email?.toLowerCase() === email.toLowerCase()
            )
            .map((task: any) => ({
              ...task,
              status: task.status || "Pending",
              priority: task.priority || "Medium"
            }))
        : [];

      setTasks(filteredTasks);
      calculateStats(filteredTasks);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message || "Failed to fetch tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getLocalJSON, calculateStats]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "Completed") return false;
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Students Tasks 
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Manage your academic assignments, track progress, and stay organized with all your tasks in one place.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 font-medium">Total Tasks</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600 font-medium">Completed</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 font-medium">Pending</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600 font-medium">In Progress</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600 font-medium">Overdue</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {["all", "Pending", "In Progress", "Completed", "Overdue"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status === "all" ? "all" : status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === (status === "all" ? "all" : status)
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status === "all" ? "All Tasks" : status}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
              <div className="text-red-600 text-lg font-semibold mb-2">Unable to Load Tasks</div>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchTasks}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredTasks.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm || filter !== "all" ? "No tasks match your criteria" : "No tasks assigned"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "You don't have any tasks assigned yet. Check back later for new assignments."}
              </p>
              {(searchTerm || filter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("all");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Task Grid */}
          {!loading && !error && filteredTasks.length > 0 && (
            <div className="grid gap-6">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTask(task)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {task.title || "Untitled Task"}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        {task.priority && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 line-clamp-2 mb-4">
                        {task.description || "No description provided."}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {task.subject && (
                          <span className="flex items-center gap-1">
                            📚 {task.subject}
                          </span>
                        )}
                        {task.teacher_name && (
                          <span className="flex items-center gap-1">
                            👨‍🏫 {task.teacher_name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 min-w-[180px]">
                      <div className={`text-sm font-medium ${
                        isOverdue(task.due_date, task.status) ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {isOverdue(task.due_date, task.status) ? '⏰ Overdue' : '📅 Due'} {formatDate(task.due_date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {task.created_at ? formatDate(task.created_at) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Task Detail Modal */}
          <AnimatePresence>
            {selectedTask && (
              <motion.div
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTask(null)}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedTask.title || "Task Details"}
                      </h2>
                      <button
                        onClick={() => setSelectedTask(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                      >
                        <span className="text-xl">✕</span>
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Status and Priority */}
                      <div className="flex flex-wrap gap-3">
                        <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(selectedTask.status)}`}>
                          Status: {selectedTask.status}
                        </span>
                        {selectedTask.priority && (
                          <span className={`px-4 py-2 rounded-full font-medium ${getPriorityColor(selectedTask.priority)}`}>
                            Priority: {selectedTask.priority}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
                          {selectedTask.description || "No description provided."}
                        </p>
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Assigned To</label>
                            <p className="text-gray-900">{selectedTask.assigned_to_email}</p>
                          </div>
                          {selectedTask.subject && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Subject</label>
                              <p className="text-gray-900">{selectedTask.subject}</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Due Date</label>
                            <p className={`font-medium ${
                              isOverdue(selectedTask.due_date, selectedTask.status) 
                                ? 'text-red-600' 
                                : 'text-gray-900'
                            }`}>
                              {formatDate(selectedTask.due_date)}
                              {isOverdue(selectedTask.due_date, selectedTask.status) && ' (Overdue)'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Created At</label>
                            <p className="text-gray-900">
                              {selectedTask.created_at ? formatDate(selectedTask.created_at) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedTask.teacher_name && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Assigned By</label>
                          <p className="text-gray-900">👨‍🏫 {selectedTask.teacher_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}