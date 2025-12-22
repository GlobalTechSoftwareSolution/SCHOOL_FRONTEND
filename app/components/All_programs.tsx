"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/`

interface Program {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "Active" | "Completed";
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
  status: "Active" | "Completed";
  coordinator_email: string;
  coordinator: string;
  category: string;
  budget: number;
}

const ProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  const [newProgram, setNewProgram] = useState<ProgramFormData>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Active",
    coordinator_email: "",
    coordinator: "",
    category: "Academic",
    budget: 0
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0
  });

  // Function to calculate status based on current date
  const calculateStatus = (endDate: string): "Active" | "Completed" => {
    const today = new Date();
    const end = new Date(endDate);
    
    // Reset time parts to compare only dates
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    return today <= end ? "Active" : "Completed";
  };

  // ✅ Fetch Programs
  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}programs/`);

      // Calculate status for each program based on end date
      const programsWithCalculatedStatus = response.data.map((program: unknown) => ({
        ...program,
        status: calculateStatus((program as { end_date: string }).end_date)
      }));

      setPrograms(programsWithCalculatedStatus);
    } catch (err: unknown) {
      console.error("Error fetching programs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Update statistics when programs change
  useEffect(() => {
    const total = programs.length;
    const active = programs.filter(p => p.status === "Active").length;
    const completed = programs.filter(p => p.status === "Completed").length;

    setStats({ total, active, completed });
  }, [programs]);

  // ✅ Add New Program
  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProgram.name || !newProgram.coordinator_email) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const programToAdd = {
        ...newProgram,
        status: calculateStatus(newProgram.end_date)
      };
      
      await axios.post(`${API_URL}programs/`, programToAdd);
      alert("✅ Program added successfully!");
      
      setShowAddForm(false);
      setNewProgram({ 
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "Active",
        coordinator_email: "",
        coordinator: "",
        category: "Academic",
        budget: 0
      });
      fetchPrograms();
    } catch (err: unknown) {
      console.error("Error adding program:", err);
      alert("❌ Failed to add program. Please check the console for details.");
    }
  };

  // ✅ Edit Program
  const handleEditProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;

    try {
      const programToUpdate = {
        ...newProgram,
        status: calculateStatus(newProgram.end_date)
      };
      
      await axios.put(`${API_URL}programs/${editingProgram.id}/`, programToUpdate);
      alert("✅ Program updated successfully!");
      setEditingProgram(null);
      fetchPrograms();
    } catch (err: unknown) {
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
    } catch (err: unknown) {
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
    const filtered = programs.filter((program) => {
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
      let aValue: string | Date = a[sortBy] as string;
      let bValue: string | Date = b[sortBy] as string;

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
      case "Active": return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />;
      case "Completed": return <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />;
      default: return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-50 text-green-700 border-green-200";
      case "Completed": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const ProgramModal = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto modal-container">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 modal-title">
            {isEdit ? "Edit Program" : "Add New Program"}
          </h2>
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingProgram(null);
            }}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition modal-close"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <form onSubmit={isEdit ? handleEditProgram : handleAddProgram} className="space-y-4 sm:space-y-6 modal-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 modal-grid">
            {/* Program Name */}
            <div className="md:col-span-2 modal-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2 modal-label">
                Program Name *
              </label>
              <input
                type="text"
                required
                value={newProgram.name}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, name: e.target.value })
                }
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base modal-input"
                placeholder="Enter program name"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 modal-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2 modal-label">
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
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base modal-textarea"
                placeholder="Enter program description"
                rows={3}
              ></textarea>
            </div>

            {/* Dates */}
            <div className="modal-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2 modal-label">
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
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base modal-input"
              />
            </div>

            <div className="modal-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2 modal-label">
                End Date *
              </label>
              <input
                type="date"
                required
                value={newProgram.end_date}
                onChange={(e) =>
                  setNewProgram({
                    ...newProgram,
                    end_date: e.target.value,
                  })
                }
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base modal-input"
              />
            </div>

            {/* Status Display (Read-only) */}
            <div className="modal-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2 modal-label">
                Current Status
              </label>
              <div className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl bg-gray-50 text-gray-700 text-sm sm:text-base">
                {newProgram.end_date 
                  ? calculateStatus(newProgram.end_date)
                  : "Active (default)"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Status is automatically calculated based on end date
              </p>
            </div>

            {/* Category */}
            <div className="modal-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2 modal-label">
                Category
              </label>
              <select
                value={newProgram.category}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, category: e.target.value })
                }
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base modal-select"
              >
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Technical">Technical</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Budget */}
            <div className="modal-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2 modal-label">
                Budget ($)
              </label>
              <input
                type="number"
                value={newProgram.budget}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, budget: Number(e.target.value) })
                }
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base modal-input"
                placeholder="Enter budget"
              />
            </div>

            {/* Coordinator Email */}
            <div className="modal-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2 modal-label">
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
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base modal-input"
                placeholder="Enter coordinator email"
              />
            </div>

            {/* Coordinator Name */}
            <div className="modal-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2 modal-label">
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
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base modal-input"
                placeholder="Enter coordinator name"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 modal-actions">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingProgram(null);
              }}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition text-sm sm:text-base modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-blue-700 transition font-semibold text-sm sm:text-base modal-submit"
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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <style jsx global>{`
          /* Base styles for all screen sizes */
          .program-card {
            padding: 1.5rem;
            transition: all 0.2s ease;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            background-color: white;
            margin-bottom: 1rem;
          }
          
          .stats-card {
            padding: 1.5rem;
            transition: all 0.2s ease;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            background-color: white;
          }
          
          .search-filters-container {
            padding: 1.5rem;
            transition: all 0.2s ease;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            background-color: white;
          }
          
          .header-container {
            gap: 2rem;
            transition: all 0.2s ease;
          }
          
          .modal-container {
            padding: 2rem;
            transition: all 0.2s ease;
            border-radius: 1rem;
          }
          
          /* Large screens (default) */
          @media (min-width: 1025px) {
            .program-card {
              padding: 1.5rem;
            }
            
            .stats-card {
              padding: 1.5rem;
            }
            
            .search-filters-container {
              padding: 1.5rem;
            }
            
            .header-container {
              gap: 2rem;
            }
            
            .modal-container {
              padding: 2rem;
            }
          }
          
          /* Medium-large screens */
          @media (min-width: 769px) and (max-width: 1024px) {
            .program-card {
              padding: 1.25rem;
            }
            
            .stats-card {
              padding: 1.25rem;
            }
            
            .search-filters-container {
              padding: 1.25rem;
            }
            
            .header-container {
              gap: 1.5rem;
            }
            
            .modal-container {
              padding: 1.5rem;
            }
          }
          
          /* Medium screens */
          @media (min-width: 641px) and (max-width: 768px) {
            .program-card {
              padding: 1.25rem;
            }
            
            .stats-card {
              padding: 1rem;
            }
            
            .search-filters-container {
              padding: 1.25rem;
            }
            
            .header-container {
              gap: 1.5rem;
            }
            
            .modal-container {
              padding: 1.5rem;
            }
          }
          
          /* Small screens - Enhanced Card Format */
          @media (max-width: 640px) {
            .program-card {
              padding: 1rem;
              border-radius: 0.75rem;
              margin-bottom: 0.75rem;
              box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
            }
            
            .stats-card {
              padding: 0.75rem;
              border-radius: 0.75rem;
              box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
            }
            
            .search-filters-container {
              padding: 0.75rem;
              border-radius: 0.75rem;
              box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
            }
            
            .header-container {
              flex-direction: column;
              gap: 1rem;
            }
            
            .modal-container {
              padding: 0.75rem;
              margin: 0.5rem;
              border-radius: 0.75rem;
            }
            
            .filters-container {
              flex-direction: column;
              gap: 0.5rem;
            }
            
            .modal-actions {
              flex-direction: column;
            }
            
            .modal-submit, .modal-cancel {
              width: 100%;
            }
            
            .add-program-button {
              width: 100%;
            }
            
            /* Ensure card format for all elements on small screens */
            .stats-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            }
            
            .program-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
        {/* Header */}
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 sm:gap-4 header-container">
          <div className="text-center xs:text-left header-text">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 header-title">School Programs</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base header-subtitle">
              Manage all academic and extracurricular programs
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg w-full xs:w-auto text-sm sm:text-base add-program-button"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> Add Program
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 stats-grid">
          <div className="stats-card bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 stats-label">Total Programs</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 stats-value">{stats.total}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl stats-icon-container">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 stats-icon" />
              </div>
            </div>
          </div>

          <div className="stats-card bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 stats-label">Active</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 stats-value">{stats.active}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-lg sm:rounded-xl stats-icon-container">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 stats-icon" />
              </div>
            </div>
          </div>

          <div className="stats-card bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 stats-label">Completed</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 stats-value">{stats.completed}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl stats-icon-container">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 stats-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 search-filters-container">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 search-filters-row">
            {/* Search */}
            <div className="flex-1 relative search-input-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5 search-icon" />
              <input
                type="text"
                placeholder="Search programs by name, description, or coordinator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base search-input"
              />
            </div>

            {/* Basic Filters */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 filters-container">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base w-full xs:w-auto category-filter"
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
                className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base w-full xs:w-auto status-filter"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 transition text-sm sm:text-base w-full xs:w-auto advanced-filter-button"
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                Advanced
                <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg mb-4 sm:mb-6 advanced-filters-grid">
              <div className="date-filter">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 date-filter-label">Start Date Range</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm date-input"
                />
              </div>
              <div className="date-filter">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 date-filter-label">End Date Range</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm date-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 budget-filters">
                <div className="budget-filter">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 budget-label">Min Budget</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={budgetRange.min}
                    onChange={(e) => setBudgetRange({ ...budgetRange, min: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm budget-input"
                  />
                </div>
                <div className="budget-filter">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 budget-label">Max Budget</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={budgetRange.max}
                    onChange={(e) => setBudgetRange({ ...budgetRange, max: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm budget-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sorting */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 sorting-container">
            <div className="flex items-center gap-2 sm:gap-4 sorting-controls">
              <span className="text-xs sm:text-sm font-medium text-gray-700 sorting-label">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "start_date" | "status")}
                className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm sorting-select"
              >
                <option value="start_date">Start Date</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-1 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm sorting-button"
              >
                {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 results-count">
              Showing {filteredPrograms.length} of {programs.length} programs
            </div>
          </div>
        </div>

        {/* Programs Cards Grid */}
        <div className="program-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredPrograms.map((program) => (
            <div key={program.id} className="program-card bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(program.status)}
                  <span className={`status-badge px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(program.status)}`}>
                    {program.status}
                  </span>
                </div>
                <div className="relative">
                  <button className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition">
                    <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2">{program.name}</h3>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{program.description}</p>

              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="date-info text-xs">
                    {program.start_date} → {program.end_date}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="coordinator-info truncate">{program.coordinator}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="coordinator-info truncate text-xs">{program.coordinator_email}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-100">
                <span className="text-xs font-medium px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {program.category || "Uncategorized"}
                </span>
                {program.budget && (
                  <span className="budget-info text-xs sm:text-sm font-semibold text-green-600">
                    ${(program.budget || 0).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 sm:mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setEditingProgram(program)}
                  className="action-button flex-1 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition text-xs sm:text-sm"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(program)}
                  className="action-button flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition text-xs sm:text-sm"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPrograms.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              {programs.length === 0 
                ? "Get started by creating your first program."
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            {programs.length === 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-blue-700 transition font-semibold text-sm sm:text-base"
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Delete Program</h3>
                  <p className="text-xs sm:text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                Are you sure you want to delete <strong>&ldquo;{deleteConfirm.name}&rdquo;</strong>?
                All associated data will be permanently removed.
              </p>

              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProgram(deleteConfirm.id)}
                  className="flex-1 bg-red-600 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-red-700 transition font-semibold text-sm sm:text-base"
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
