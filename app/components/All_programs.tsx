"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  X,
  Search,
  Filter,
  Edit3,
  Trash2,
  Calendar,
  Mail,
  User,
  FileText,
  MoreVertical,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";

const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/";

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
  participants_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface ProgramFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "Planned" | "Active" | "Completed" | "Cancelled";
  coordinator_email: string;
  coordinator: string;
  category: string;
  budget: number;
}

const ProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "start_date" | "status">("start_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Program | null>(null);

  // Advanced Filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [budgetRange, setBudgetRange] = useState({ min: "", max: "" });
  const [studentName, setStudentName] = useState(""); 


  const [newProgram, setNewProgram] = useState<ProgramFormData>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Planned",
    coordinator_email: "",
    coordinator: "",
    category: "Academic",
    budget: 0
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    planned: 0,
    completed: 0
  });

  // ✅ Fetch Programs
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}programs/`);
      setPrograms(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching programs:", err);
      setError("Failed to load programs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Update statistics when programs change
  useEffect(() => {
    const total = programs.length;
    const active = programs.filter(p => p.status === "Active").length;
    const planned = programs.filter(p => p.status === "Planned").length;
    const completed = programs.filter(p => p.status === "Completed").length;

    setStats({ total, active, planned, completed });
  }, [programs]);

  // ✅ Add New Program
  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProgram.name || !newProgram.coordinator_email) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      await axios.post(`${API_URL}programs/`, newProgram);
      alert("✅ Program added successfully!");
      
      setShowAddForm(false);
      setNewProgram({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "Planned",
        coordinator_email: "",
        coordinator: "",
        category: "Academic",
        budget: 0
      });
      fetchPrograms();
    } catch (err: any) {
      console.error("Error adding program:", err);
      alert("❌ Failed to add program. Please check the console for details.");
    }
  };

  // ✅ Edit Program
  const handleEditProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;

    try {
      await axios.put(`${API_URL}programs/${editingProgram.id}/`, newProgram);
      alert("✅ Program updated successfully!");
      setEditingProgram(null);
      fetchPrograms();
    } catch (err: any) {
      console.error("Error updating program:", err);
      alert("❌ Failed to update program.");
    }
  };

  // ✅ Delete Program
  const handleDeleteProgram = async (programId: number) => {
    try {
      await axios.delete(`${API_URL}programs/${programId}/`);
      alert("✅ Program deleted successfully!");
      setDeleteConfirm(null);
      fetchPrograms();
    } catch (err: any) {
      console.error("Error deleting program:", err);
      alert("❌ Failed to delete program.");
    }
  };

  // Setup form for editing
  useEffect(() => {
    if (editingProgram) {
      setNewProgram({
        name: editingProgram.name,
        description: editingProgram.description,
        start_date: editingProgram.start_date,
        end_date: editingProgram.end_date,
        status: editingProgram.status,
        coordinator_email: editingProgram.coordinator_email,
        coordinator: editingProgram.coordinator,
        category: editingProgram.category || "Academic",
        budget: editingProgram.budget || 0
      });
    }
  }, [editingProgram]);

  // Advanced Filtering and Sorting
  const filteredPrograms = useMemo(() => {
    let filtered = programs.filter((program) => {
      const matchesSearch =
        program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.coordinator?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || program.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || program.status?.toLowerCase() === statusFilter;

      const matchesDateRange = 
        (!dateRange.start || program.start_date >= dateRange.start) &&
        (!dateRange.end || program.end_date <= dateRange.end);

      const matchesBudgetRange =
        (!budgetRange.min || (program.budget || 0) >= Number(budgetRange.min)) &&
        (!budgetRange.max || (program.budget || 0) <= Number(budgetRange.max));

      return matchesSearch && matchesCategory && matchesStatus && matchesDateRange && matchesBudgetRange;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === "start_date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [programs, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder, dateRange, budgetRange]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "Completed": return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "Planned": return <Clock className="h-4 w-4 text-orange-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-50 text-green-700 border-green-200";
      case "Completed": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Planned": return "bg-orange-50 text-orange-700 border-orange-200";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const ProgramModal = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Program" : "Add New Program"}
          </h2>
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingProgram(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={isEdit ? handleEditProgram : handleAddProgram} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Program Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Program Name *
              </label>
              <input
                type="text"
                required
                value={newProgram.name}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter program name"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newProgram.description}
                onChange={(e) =>
                  setNewProgram({
                    ...newProgram,
                    description: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter program description"
                rows={3}
              ></textarea>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={newProgram.start_date}
                onChange={(e) =>
                  setNewProgram({
                    ...newProgram,
                    start_date: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={newProgram.end_date}
                onChange={(e) =>
                  setNewProgram({
                    ...newProgram,
                    end_date: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status and Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={newProgram.status}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, status: e.target.value as any })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={newProgram.category}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, category: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Technical">Technical</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                value={newProgram.budget}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, budget: Number(e.target.value) })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter budget"
              />
            </div>

            {/* Coordinator Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coordinator Email *
              </label>
              <input
                type="email"
                required
                value={newProgram.coordinator_email}
                onChange={(e) =>
                  setNewProgram({
                    ...newProgram,
                    coordinator_email: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter coordinator email"
              />
            </div>

            {/* Coordinator Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coordinator Name *
              </label>
              <input
                type="text"
                required
                value={newProgram.coordinator}
                onChange={(e) =>
                  setNewProgram({
                    ...newProgram,
                    coordinator: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter coordinator name"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingProgram(null);
              }}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {isEdit ? "Update Program" : "Create Program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">School Programs</h1>
            <p className="text-gray-600 mt-1">
              Manage all academic and extracurricular programs
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg"
          >
            <Plus className="h-5 w-5" /> Add Program
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planned</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.planned}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search programs by name, description, or coordinator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Basic Filters */}
            <div className="flex gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Technical">Technical</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Filter className="h-5 w-5" />
                Advanced
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date Range</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date Range</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Budget</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={budgetRange.min}
                    onChange={(e) => setBudgetRange({ ...budgetRange, min: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Budget</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={budgetRange.max}
                    onChange={(e) => setBudgetRange({ ...budgetRange, max: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sorting */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="start_date">Start Date</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredPrograms.length} of {programs.length} programs
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <div key={program.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(program.status)}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(program.status)}`}>
                    {program.status}
                  </span>
                </div>
                <div className="relative">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 hidden">
                    <button
                      onClick={() => setEditingProgram(program)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Program
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(program)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Program
                    </button>
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-2">{program.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{program.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {program.start_date} → {program.end_date}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{program.coordinator}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{program.coordinator_email}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {program.category || "Uncategorized"}
                </span>
                {program.budget && (
                  <span className="text-sm font-semibold text-green-600">
                    ${program.budget.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPrograms.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-600 mb-6">
              {programs.length === 0 
                ? "Get started by creating your first program."
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            {programs.length === 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Create Your First Program
              </button>
            )}
          </div>
        )}

        {/* Modals */}
        {showAddForm && <ProgramModal />}
        {editingProgram && <ProgramModal isEdit={true} />}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Delete Program</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? 
                All associated data will be permanently removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProgram(deleteConfirm.id)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Delete Program
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default ProgramsPage;