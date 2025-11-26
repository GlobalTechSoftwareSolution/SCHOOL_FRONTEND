"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, X, Edit, Trash2, Search, Filter, Calendar, Users, Clock, AlertCircle, CheckCircle, PlayCircle, MoreVertical } from "lucide-react";
import { createDecipheriv } from "crypto";

const API_URL = "https://school.globaltechsoftwaresolutions.cloud/api/";

interface Project {
  id: number;
  owner_email: string;
  owner: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "Planned" | "In Progress" | "Completed" | "On Hold";
  class_name: string;
  section: string;
  created_at?: string;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    planned: 0,
    inProgress: 0,
    completed: 0,
    onHold: 0
  });

  const [newProject, setNewProject] = useState({
    owner_email: "",
    owner: "",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Planned" as const,
    class_name: "",
    section: "",
  });

  // ✅ Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}projects/`);
      setProjects(res.data);
      setFilteredProjects(res.data);
      calculateStats(res.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (projectsData: Project[]) => {
    const stats = {
      total: projectsData.length,
      planned: projectsData.filter(p => p.status === "Planned").length,
      inProgress: projectsData.filter(p => p.status === "In Progress").length,
      completed: projectsData.filter(p => p.status === "Completed").length,
      onHold: projectsData.filter(p => p.status === "On Hold").length
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ✅ Filter projects
  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.class_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (classFilter !== "all") {
      filtered = filtered.filter(project => project.class_name === classFilter);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, statusFilter, classFilter, projects]);

  // ✅ Add new project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}projects/`, newProject);
      alert("✅ Project added successfully!");
      setShowAddForm(false);
      resetForm();
      fetchProjects();
    } catch (err: any) {
      console.error("Error adding project:", err);
      alert("❌ Failed to add project. Check console for details.");
    }
  };

  // ✅ Update project
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      await axios.put(`${API_URL}projects/${editingProject.id}/`, editingProject);
      alert("✅ Project updated successfully!");
      setEditingProject(null);
      fetchProjects();
    } catch (err: any) {
      console.error("Error updating project:", err);
      alert("❌ Failed to update project. Check console for details.");
    }
  };

  // ✅ Delete project
  const handleDeleteProject = async (id: number) => {
    try {
      await axios.delete(`${API_URL}projects/${id}/`);
      alert("✅ Project deleted successfully!");
      setDeleteConfirm(null);
      fetchProjects();
    } catch (err: any) {
      console.error("Error deleting project:", err);
      alert("❌ Failed to delete project. Check console for details.");
    }
  };

  const resetForm = () => {
    setNewProject({
      owner_email: "",
      owner: "",
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      status: "Planned",
      class_name: "",
      section: "",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Planned": return <Calendar className="h-4 w-4" />;
      case "In Progress": return <PlayCircle className="h-4 w-4" />;
      case "Completed": return <CheckCircle className="h-4 w-4" />;
      case "On Hold": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planned": return "bg-blue-50 text-blue-700 border-blue-200";
      case "In Progress": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Completed": return "bg-green-50 text-green-700 border-green-200";
      case "On Hold": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getClasses = () => {
    return Array.from(new Set(projects.map(p => p.class_name).filter(Boolean)));
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">School Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage and track academic projects and competitions
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" /> Add New Project
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planned</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.planned}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <PlayCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Hold</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.onHold}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search projects by title, description, owner, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="all">All Status</option>
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>

              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="all">All Classes</option>
                {getClasses().map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>

              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              All Projects ({filteredProjects.length})
            </h2>
            <div className="text-sm text-gray-500">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all" || classFilter !== "all" 
                  ? "Try adjusting your filters or search terms"
                  : "Get started by creating your first project"}
              </p>
              {!searchTerm && statusFilter === "all" && classFilter === "all" && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {project.title}
                      </h3>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        {project.status}
                      </div>
                    </div>
                    <div className="relative">
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{project.owner}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">ID: #{project.id}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProject(project)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(project.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Project Modal */}
        {(showAddForm || editingProject) && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {editingProject ? "Edit Project" : "Add New Project"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingProject(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form 
                onSubmit={editingProject ? handleUpdateProject : handleAddProject}
                className="p-6 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject ? (editingProject.title ?? "") : newProject.title}
                      onChange={(e) =>
                        editingProject
                          ? setEditingProject({ ...editingProject, title: e.target.value })
                          : setNewProject({ ...newProject, title: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter project title"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingProject ? (editingProject.description ?? "") : newProject.description}
                      onChange={(e) =>
                        editingProject
                          ? setEditingProject({ ...editingProject, description: e.target.value })
                          : setNewProject({ ...newProject, description: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      rows={3}
                      placeholder="Enter project description"
                    ></textarea>
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editingProject ? (editingProject.start_date ?? "") : newProject.start_date}
                      onChange={(e) =>
                        editingProject
                          ? setEditingProject({ ...editingProject, start_date: e.target.value })
                          : setNewProject({ ...newProject, start_date: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editingProject ? (editingProject.end_date ?? "") : newProject.end_date}
                      onChange={(e) =>
                        editingProject
                          ? setEditingProject({ ...editingProject, end_date: e.target.value })
                          : setNewProject({ ...newProject, end_date: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={editingProject ? (editingProject.status ?? "Planned") : newProject.status}
                      onChange={(e) =>
                        editingProject
                          ? setEditingProject({ ...editingProject, status: e.target.value as any })
                          : setNewProject({ ...newProject, status: e.target.value as any })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>

                  {/* Class Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Name
                    </label>
                    <input
                      type="text"
                      value={editingProject ? (editingProject.class_name ?? "") : newProject.class_name}
                      onChange={(e) =>
                        editingProject
                          ? setEditingProject({ ...editingProject, class_name: e.target.value })
                          : setNewProject({ ...newProject, class_name: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="e.g. Grade 10"
                    />
                  </div>

                  {/* Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section
                    </label>
                    <input
                      type="text"
                      value={editingProject ? (editingProject.section ?? "") : newProject.section}
                      onChange={(e) =>
                        editingProject
                          ? setEditingProject({ ...editingProject, section: e.target.value })
                          : setNewProject({ ...newProject, section: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="e.g. A"
                    />
                  </div>

                  {/* Owner Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={editingProject ? (editingProject.owner_email ?? "") : newProject.owner_email}
                      onChange={(e) =>
                        editingProject
                          ? setEditingProject({ ...editingProject, owner_email: e.target.value })
                          : setNewProject({ ...newProject, owner_email: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter owner email"
                    />
                  </div>

                  {/* Owner Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      value={editingProject ? (editingProject.owner ?? "") : newProject.owner}
                      onChange={(e) =>
                        editingProject
                          ? setEditingProject({ ...editingProject, owner: e.target.value })
                          : setNewProject({ ...newProject, owner: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter owner name"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium"
                  >
                    {editingProject ? "Update Project" : "Create Project"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingProject(null);
                    }}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Project
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this project? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDeleteProject(deleteConfirm)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition font-medium"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default ProjectsPage;