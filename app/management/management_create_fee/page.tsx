"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  IndianRupee,
  Calendar,
  BookOpen,
  Filter,
  Search,
  Download,
  Upload,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const API_URL = "https://school.globaltechsoftwaresolutions.cloud/fee_structures/";
const CLASSES_API_URL = "https://school.globaltechsoftwaresolutions.cloud/classes/";

// ================= TYPES =================
type Fee = {
  id: number;
  class_id: number;
  fee_type: string;
  amount: string;
  frequency: string;
  description: string;
};

type SchoolClass = {
  id: number;
  class_name: string;
  sec: string;
};

type FormData = {
  id: number | null;
  fee_type: Fee['fee_type'] | '';
  amount: string;
  frequency: Fee['frequency'] | '';
  description: string;
  class_id: string;
  section_id?: string;
};

const ManagementFeeStructure = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('all');

  // State for popup modal
  const [popup, setPopup] = useState({
    isOpen: false,
    message: '',
    type: 'info' as 'info' | 'success' | 'error' | 'warning',
    confirmAction: null as (() => void) | null
  });

  const [formData, setFormData] = useState<FormData>({
    id: null,
    fee_type: '',
    amount: '',
    frequency: '',
    description: '',
    class_id: '',
    section_id: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // ================= FETCH CLASSES =================
  const fetchClasses = async () => {
    try {
      console.log("🔍 [FETCH] Fetching classes...");
      const res = await fetch(CLASSES_API_URL);
      const data: SchoolClass[] = await res.json();
      console.log("✅ [FETCH] Successfully fetched classes:", data);
      setClasses(data);
    } catch (err) {
      console.error("❌ [FETCH] Error fetching classes:", err);
    }
  };

  // ================= FETCH FEES =================
  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setFees(data);
    } catch (err) {
      console.error("Error fetching fees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchFees();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e: React.ChangeEvent<any>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to show popup message
  const showPopup = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', confirmAction: (() => void) | null = null) => {
    setPopup({
      isOpen: true,
      message,
      type,
      confirmAction
    });
  };

  // Function to close popup
  const closePopup = () => {
    setPopup({
      isOpen: false,
      message: '',
      type: 'info',
      confirmAction: null
    });
  };

  // ================= SUBMIT (CREATE / UPDATE) =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      fee_type: formData.fee_type,
      amount: formData.amount,
      frequency: formData.frequency,
      description: formData.description,
      class_id: Number(formData.class_id),
    };

    let response;

    if (isEditing && formData.id) {
      response = await fetch(`${API_URL}${formData.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      showPopup('Failed to save fee structure', 'error');
      return;
    }

    showPopup(`Successfully ${isEditing ? 'updated' : 'created'} fee structure`, 'success');
    resetForm();
    fetchFees();
  };

  const resetForm = () => {
    setFormData({ id: null, fee_type: '', amount: '', frequency: '', description: '', class_id: '' });
    setIsEditing(false);
    setShowForm(false);
  };

  // ================= EDIT =================
  const handleEdit = (fee: Fee) => {
    setFormData({
      id: fee.id,
      fee_type: fee.fee_type,
      amount: fee.amount,
      frequency: fee.frequency,
      description: fee.description,
      class_id: fee.class_id.toString(),
    });
    setIsEditing(true);
    setShowForm(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    showPopup(
      "Are you sure you want to delete this fee structure? This action cannot be undone.", 
      "warning", 
      async () => {
        try {
          const response = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          showPopup("Successfully deleted fee structure", "success");
          fetchFees();
        } catch (error) {
          showPopup("Delete failed. Please try again.", "error");
        } finally {
          closePopup();
        }
      }
    );
  };

  // ================= FILTERED FEES =================
  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.fee_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = feeTypeFilter === 'all' || fee.fee_type === feeTypeFilter;
    
    return matchesSearch && matchesType;
  });

  // ================= STATS CALCULATION =================
  const stats = {
    totalFees: fees.length,
    totalAmount: fees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0),
    monthlyFees: fees.filter(fee => fee.frequency === 'Monthly').length,
    annualFees: fees.filter(fee => fee.frequency === 'Annually').length,
  };

  // Get unique fee types for filter
  const feeTypes = [...new Set(fees.map(fee => fee.fee_type))];

  return (
    <DashboardLayout role="management">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl shadow-lg">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Fee Structure Management
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-3 sm:px-4">
              Manage and organize fee structures across all classes and sections
            </p>
          </div>
{/* Stats Cards */}
<div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6 sm:mb-8">
  
  {/* Total Fees */}
  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all min-w-[150px]">
    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
      <BookOpen className="w-6 h-6 text-blue-600" />
    </div>
    <div className="text-base sm:text-lg md:text-2xl font-bold text-blue-600 leading-tight">
      {stats.totalFees}
    </div>
    <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium whitespace-nowrap">
      Total Fees
    </div>
  </div>

  {/* Total Amount */}
  <div className="bg-white rounded-2xl sm:ml-4 p-4 sm:p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all min-w-[150px]">
    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
      <IndianRupee className="w-6 h-6 text-emerald-600" />
    </div>
    <div className="text-base sm:text-lg md:text-2xl font-bold text-emerald-600 leading-tight">
      ₹{stats.totalAmount.toLocaleString()}
    </div>
    <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium whitespace-nowrap">
      Total Amount
    </div>
  </div>

</div>


          {/* Action Bar */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch lg:items-center justify-between">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search fees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 w-full lg:w-auto">
                <select
                  value={feeTypeFilter}
                  onChange={(e) => setFeeTypeFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white min-w-[140px] sm:min-w-[160px]"
                >
                  <option value="all">All Fee Types</option>
                  {feeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="flex items-center gap-2 sm:gap-3 bg-emerald-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-emerald-600 transition-colors text-sm sm:text-base font-medium flex-1 sm:flex-none justify-center"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Add Fee</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fees Grid - CARDS FORMAT */}
          {loading ? (
            <div className="flex justify-center items-center py-16 sm:py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-500 mx-auto mb-3 sm:mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading fee structures...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {filteredFees.map(fee => {
                const cls = classes.find(c => c.id === fee.class_id);
                return (
                  <div key={fee.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                    <div className="p-4 sm:p-5 md:p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                            {fee.fee_type}
                          </h3>
                          <p className="text-sm text-emerald-600 font-semibold">
                            {cls ? `${cls.class_name} - ${cls.sec}` : `Class ${fee.class_id}`}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                          fee.frequency === 'Monthly' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          fee.frequency === 'Annually' ? 'bg-green-100 text-green-800 border border-green-200' :
                          fee.frequency === 'Quarterly' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          {fee.frequency}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-2xl sm:text-xl font-bold text-gray-800">₹{fee.amount}</div>
                          <div className="text-xs text-gray-500">Amount</div>
                        </div>
                      </div>

                      {/* Description */}
                      {fee.description && (
                        <div className="mb-4 sm:mb-5">
                          <p className="text-sm text-gray-600 line-clamp-2 break-words">{fee.description}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex grid grid-cols-1 gap-2 sm:gap-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleEdit(fee)}
                          className="flex items-center gap-1 sm:gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 justify-center"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(fee.id)}
                          className="flex items-center gap-1 sm:gap-2 bg-red-50 text-red-700 hover:bg-red-100 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 justify-center"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredFees.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 max-w-md mx-auto shadow-lg border border-gray-200">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-gray-700 font-semibold text-lg sm:text-xl mb-2">No Fee Structures Found</h3>
                <p className="text-gray-500 text-sm sm:text-base mb-4">Try adjusting your search or create a new fee structure</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors text-sm sm:text-base mx-auto"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Create Fee Structure</span>
                </button>
              </div>
            </div>
          )}

          {/* FORM MODAL */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
              <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl sm:rounded-t-2xl">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {isEditing ? 'Edit Fee Structure' : 'Add New Fee Structure'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Fee Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type *</label>
                      <select 
                        name="fee_type" 
                        value={formData.fee_type} 
                        onChange={handleChange} 
                        required 
                        className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Fee Type</option>
                        <option value="Tuition">Tuition Fee</option>
                        <option value="Transport">Transport Fee</option>
                        <option value="Library">Library Fee</option>
                        <option value="Sports">Sports Fee</option>
                        <option value="Lab">Lab Fee</option>
                        <option value="Examination">Examination Fee</option>
                        <option value="Activity">Activity Fee</option>
                        <option value="Other">Other Fee</option>
                      </select>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input 
                          type="number" 
                          name="amount" 
                          value={formData.amount} 
                          onChange={handleChange} 
                          placeholder="0.00" 
                          min="1" 
                          step="0.01" 
                          required 
                          className="w-full border border-gray-300 rounded-lg sm:rounded-xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frequency *</label>
                      <select 
                        name="frequency" 
                        value={formData.frequency} 
                        onChange={handleChange} 
                        required 
                        className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Frequency</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annually">Annually</option>
                        <option value="One-time">One-time</option>
                      </select>
                    </div>

                    {/* Class */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                      <select 
                        name="class_id" 
                        value={formData.class_id} 
                        onChange={handleChange} 
                        required 
                        className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Class</option>
                        {[1,2,3,4,5,6,7,8,9,10].map(cls => (
                          <option key={cls} value={cls}>Class {cls}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      placeholder="Enter fee description (optional)" 
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                    <button 
                      type="button" 
                      onClick={() => setShowForm(false)}
                      className="flex-1 sm:flex-none bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 sm:flex-none bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors"
                    >
                      {isEditing ? 'Update Fee Structure' : 'Create Fee Structure'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Popup Modal */}
          {popup.isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className={`p-4 sm:p-6 border-b ${
                  popup.type === 'error' ? 'border-red-200 bg-red-50' : 
                  popup.type === 'success' ? 'border-green-200 bg-green-50' : 
                  popup.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'
                } rounded-t-xl sm:rounded-t-2xl`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      popup.type === 'error' ? 'bg-red-100 text-red-600' : 
                      popup.type === 'success' ? 'bg-green-100 text-green-600' : 
                      popup.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {popup.type === 'error' ? <X className="w-5 h-5" /> :
                       popup.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                       popup.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                       <Info className="w-5 h-5" />}
                    </div>
                    <h3 className={`text-lg font-semibold ${
                      popup.type === 'error' ? 'text-red-800' : 
                      popup.type === 'success' ? 'text-green-800' : 
                      popup.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'
                    }`}>
                      {popup.type === 'error' ? 'Error' : 
                       popup.type === 'success' ? 'Success' : 
                       popup.type === 'warning' ? 'Warning' : 'Information'}
                    </h3>
                  </div>
                </div>

                {/* Message */}
                <div className="p-4 sm:p-6">
                  <p className="text-gray-700 text-sm sm:text-base">{popup.message}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-gray-200">
                  {popup.type === 'warning' ? (
                    <>
                      <button
                        onClick={closePopup}
                        className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (popup.confirmAction) {
                            popup.confirmAction();
                          }
                        }}
                        className="flex-1 bg-red-500 text-white hover:bg-red-600 px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={closePopup}
                      className={`flex-1 text-white px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        popup.type === 'error' ? 'bg-red-500 hover:bg-red-600' : 
                        popup.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                        'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      OK
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagementFeeStructure;