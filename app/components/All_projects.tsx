"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Plus, X, Trash2, Search, Filter, Calendar, Users, Clock, CheckCircle, PlayCircle, Eye } from "lucide-react";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/`;

interface Project {
  id: number;
  owner_email: string;
  owner: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "In Progress" | "Completed";
  class_id: number;
  class_name?: string;
  section?: string;
  created_at?: string;
  owner_name?: string;
  attachment?: string;
  updated_at?: string;
}

interface ClassInfo {
  id: number;
  class_name: string;
  sec: string;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0
  });

  const [newProject, setNewProject] = useState({
    owner_email: "",
    owner: "",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "In Progress" as const,
    class_id: 0,
  });

  // Function to calculate status based on current date
  const calculateStatus = (endDate: string): "In Progress" | "Completed" => {
    const today = new Date();
    const end = new Date(endDate);

    // Reset time parts to compare only dates
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return today <= end ? "In Progress" : "Completed";
  };

  // ✅ Fetch all classes
  const fetchClasses = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}classes/`);
      setClasses(res.data);
    } catch (err: unknown) {
      console.error("Error fetching classes:", err);
    }
  }, []);

  // ✅ Fetch all teachers
  const fetchTeachers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}teachers/`);
      setTeachers(res.data);
    } catch (err: unknown) {
      console.error("Error fetching teachers:", err);
    }
  }, []);

  // ✅ Fetch all students
  const fetchStudents = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}students/`);
      setStudents(res.data);
    } catch (err: unknown) {
      console.error("Error fetching students:", err);
    }
  }, []);

  // ✅ Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}projects/`);

      // Calculate status for each project based on end date
      const projectsWithCalculatedStatus = res.data.map((project: Record<string, unknown>) => ({
        ...project,
        status: calculateStatus(project.end_date as string)
      }));

      setProjects(projectsWithCalculatedStatus);
      setFilteredProjects(projectsWithCalculatedStatus);
      calculateStats(projectsWithCalculatedStatus);
    } catch (err: unknown) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (projectsData: Project[]) => {
    const stats = {
      total: projectsData.length,
      inProgress: projectsData.filter(p => p.status === "In Progress").length,
      completed: projectsData.filter(p => p.status === "Completed").length
    };
    setStats(stats);
  };

  // ✅ Enhanced Projects with resolved class and section details
  const enhancedProjects = React.useMemo(() => {
    return projects.map(project => {
      const classInfo = classes.find(c => c.id === project.class_id);

      // Resolve owner name from teachers or students
      const teacher = teachers.find(t => t.email?.toLowerCase() === project.owner_email?.toLowerCase());
      const student = students.find(s => s.email?.toLowerCase() === project.owner_email?.toLowerCase());

      const ownerName = teacher ? (teacher.fullname || teacher.first_name) :
        student ? (student.first_name + " " + student.last_name) :
          (project.owner_name || project.owner || "Unknown Owner");

      return {
        ...project,
        owner_name: ownerName,
        class_name: classInfo?.class_name || project.class_name || "Unknown Class",
        section: classInfo?.sec || project.section || ""
      };
    });
  }, [projects, classes, teachers, students]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchClasses(), fetchTeachers(), fetchStudents()]);
      setLoading(false);
    };
    loadData();
  }, [fetchProjects, fetchClasses, fetchTeachers, fetchStudents]);

  // ✅ Filter projects
  useEffect(() => {
    let filtered = enhancedProjects;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        (project.title || "").toLowerCase().includes(searchLower) ||
        (project.description || "").toLowerCase().includes(searchLower) ||
        (project.owner || "").toString().toLowerCase().includes(searchLower) ||
        (project.owner_name || "").toLowerCase().includes(searchLower) ||
        (project.class_name || "").toLowerCase().includes(searchLower) ||
        (project.section || "").toLowerCase().includes(searchLower) ||
        (project.status || "").toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (classFilter !== "all") {
      filtered = filtered.filter(project => project.class_name === classFilter);
    }

    setFilteredProjects(filtered);
    calculateStats(enhancedProjects);
  }, [searchTerm, statusFilter, classFilter, enhancedProjects]);

  // ✅ Add new project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newProject.class_id) {
        alert("Please select a class");
        return;
      }

      const projectToAdd = {
        ...newProject,
        status: calculateStatus(newProject.end_date)
      };

      await axios.post(`${API_URL}projects/`, projectToAdd);
      alert("✅ Project added successfully!");
      setShowAddForm(false);
      resetForm();
      fetchProjects();
    } catch (err: unknown) {
      console.error("Error adding project:", err);
      alert("❌ Failed to add project. Check console for details.");
    }
  };

  // ✅ Delete project
  const handleDeleteProject = async (id: number) => {
    try {
      await axios.delete(`${API_URL}projects/${id}/`);
      alert("✅ Project deleted successfully!");
      setDeleteConfirm(null);
      fetchProjects();
    } catch (err: unknown) {
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
      status: "In Progress",
      class_id: 0,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Progress": return <PlayCircle className="h-4 w-4" />;
      case "Completed": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-green-50 text-green-700 border-green-200";
      case "Completed": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getClasses = () => {
    return Array.from(new Set(classes.map(c => c.class_name).filter(Boolean)));
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
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
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{project.owner_name || project.owner}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Class:</span>
                    <span>{project.class_name} {project.section ? `(${project.section})` : ''}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">ID: #{project.id}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingProject(project)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Eye className="h-4 w-4" />
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

      {/* Add Project Modal */}
      {
        showAddForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Add New Project</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddProject} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
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
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
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
                      value={newProject.start_date}
                      onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
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
                      value={newProject.end_date}
                      onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Status Display (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Status
                    </label>
                    <div className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700">
                      {newProject.end_date
                        ? calculateStatus(newProject.end_date)
                        : "In Progress (default)"}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Status is automatically calculated based on end date
                    </p>
                  </div>

                  {/* Class Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Name
                    </label>
                    <select
                      value={newProject.class_id}
                      onChange={(e) => setNewProject({ ...newProject, class_id: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="0">Select a class</option>
                      {classes.map((classInfo) => (
                        <option key={classInfo.id} value={classInfo.id}>
                          {classInfo.class_name} {classInfo.sec ? `(${classInfo.sec})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section (Automatically set based on selected class) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section
                    </label>
                    <select
                      value={classes.find(c => c.id === newProject.class_id)?.sec || ""}
                      className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled={true}
                    >
                      <option value="">Section auto-filled</option>
                      {classes.find(c => c.id === newProject.class_id) && (
                        <option value={classes.find(c => c.id === newProject.class_id)?.sec}>
                          {classes.find(c => c.id === newProject.class_id)?.sec}
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Owner Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newProject.owner_email}
                      onChange={(e) => setNewProject({ ...newProject, owner_email: e.target.value })}
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
                      value={newProject.owner}
                      onChange={(e) => setNewProject({ ...newProject, owner: e.target.value })}
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
                    Create Project
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* View Project Modal */}
      {
        viewingProject && (
          <ViewProjectModal
            project={viewingProject}
            onClose={() => setViewingProject(null)}
          />
        )
      }

      {/* Delete Confirmation Modal */}
      {
        deleteConfirm && (
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
        )
      }
    </div >
  );
};

// ViewProjectModal Component
const ViewProjectModal = ({ project, onClose }: { project: Project; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Project Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Project Title</h3>
              <p className="text-xl font-semibold text-gray-900 mt-1">{project.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Description</h3>
              <p className="text-gray-700 mt-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {project.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status</h3>
                <div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100">
                  <span className={`h-2.5 w-2.5 rounded-full ${project.status === "In Progress" ? "bg-yellow-500" : "bg-green-500"}`}></span>
                  {project.status}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Duration</h3>
                <p className="text-gray-900 mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Class</h3>
                <p className="text-gray-900 mt-1">
                  {project.class_name || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Section</h3>
                <p className="text-gray-900 mt-1">
                  {project.section || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Owner</h3>
                <div className="mt-1">
                  <p className="text-gray-900 font-medium">{project.owner_name || project.owner}</p>
                  <p className="text-gray-500 text-sm">{project.owner_email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 rounded-b-2xl bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition font-medium text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
