"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`

interface FeePayment {
  id: number;
  student_name: string;
  fee_structure: number;
  amount_paid: string;
  total_amount: string | null;
  remaining_amount: string | null;
  payment_date: string;
  status: string;
  fee_type?: string;
  class_name?: string;
  section?: string;
}

interface Student {
  id: number;
  email?: string;
  fullname?: string;
  class_id?: number;
  class_name?: string;
  sec?: string;
}

interface Class {
  id: number;
  class_name: string;
  sec: string;
}

interface FeeStructure {
  id: number;
  fee_type: string;
  amount: string;
}

const ManagementPendingFees = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  
  interface ExtendedFeePayment {
    id: number;
    student_name: string;
    fee_structure: number;
    amount_paid: string;
    total_amount: number;
    remaining_amount: number;
    payment_date: string;
    status: string;
    fee_type: string;
    class_name: string;
    section: string;
  }
  
  const [pendingFees, setPendingFees] = useState<ExtendedFeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFee, setSelectedFee] = useState<ExtendedFeePayment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [classFilter, setClassFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");

  const fetchPendingFees = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsRes, structuresRes, studentsRes, classesRes] = await Promise.all([
        axios.get(`${API_BASE}/fee_payments/`),
        axios.get(`${API_BASE}/fee_structures/`),
        axios.get(`${API_BASE}/students/`),
        axios.get(`${API_BASE}/classes/`),
      ]);

      const payments: FeePayment[] = paymentsRes.data;
      const structures: FeeStructure[] = structuresRes.data;
      const studentsData = studentsRes.data || [];
      const classesData = classesRes.data || [];

      setClasses(classesData);

      const pending = payments
        .map((pay) => {
          const structure = structures.find((s) => s.id === pay.fee_structure);

          // Find matching student by email or name
          const student = studentsData.find((s: Student) =>
            s.email === (pay as { student?: string }).student ||
            s.fullname === pay.student_name
          );

          // Resolve class info via class_id
          const classInfo = student?.class_id
            ? classesData.find((c: Class) => c.id === student.class_id)
            : null;

          // Total from fee structure (treat missing/invalid as 0)
          const totalRaw = structure?.amount ?? "0";
          const total = Number(totalRaw) || 0;

          // Amount paid from payment record (treat missing/invalid as 0)
          const paidRaw = pay.amount_paid ?? "0";
          const paid = Number(paidRaw) || 0;

          // Pending = total - paid, never negative
          const remaining = Math.max(total - paid, 0);

          return {
            ...pay,
            fee_type: structure ? structure.fee_type : "Unknown",
            total_amount: total,
            remaining_amount: remaining,
            class_name: classInfo?.class_name || "Unknown",
            section: classInfo?.sec || "Unknown",
          } as ExtendedFeePayment;
        })
        .filter((p) => (p as ExtendedFeePayment).remaining_amount > 0);

      setPendingFees(pending);
    } catch (error: unknown) {
      console.error("Error fetching pending fees:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingFees();
  }, [fetchPendingFees]);

  // Derived filter options from classes
  const uniqueClasses = Array.from(
    new Set(classes.map((cls: Class) => cls.class_name).filter(Boolean))
  );

  const sectionsForSelectedClass = classFilter === "all"
    ? []
    : Array.from(
        new Set(
          classes
            .filter((cls: Class) => cls.class_name === classFilter)
            .map((cls: Class) => cls.sec)
            .filter(Boolean)
        )
      );

  // Apply search + class/section filters
  const filteredFees = pendingFees.filter((fee) => {
    const matchesSearch =
      fee.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.fee_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      classFilter === "all" || fee.class_name === classFilter;

    const matchesSection =
      sectionFilter === "all" || sectionFilter === "" || fee.section === sectionFilter;

    return matchesSearch && matchesClass && matchesSection;
  });

  const totalPendingAmount = filteredFees.reduce(
    (sum, fee) => sum + (fee as ExtendedFeePayment).remaining_amount,
    0
  );

  const handleCardClick = (fee: ExtendedFeePayment) => {
    setSelectedFee(fee);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFee(null);
  };

  return (
    <DashboardLayout role="management">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Pending Fees
            </h1>
            <p className="text-gray-600">
              Track and manage all outstanding fee payments
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pending</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {filteredFees.length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount Due</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    ₹{totalPendingAmount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by student name or fee type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                {/* Class filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={classFilter}
                    onChange={(e) => {
                      setClassFilter(e.target.value);
                      setSectionFilter("all");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Classes</option>
                    {uniqueClasses.map((cls) => (
                      <option key={cls as string} value={cls as string}>
                        {cls as string}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    disabled={classFilter === "all"}
                    className="px-4 py-2 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="all">All Sections</option>
                    {sectionsForSelectedClass.map((sec) => (
                      <option key={sec as string} value={sec as string}>
                        {sec as string}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={fetchPendingFees}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredFees.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm ? "No matching records found" : "No pending fees found"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "All fees have been cleared! 🎉"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFees.map((fee) => (
                    <div
                      key={fee.id}
                      onClick={() => handleCardClick(fee)}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">
                              {fee.student_name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <h3 className="font-semibold text-gray-900">
                              {fee.student_name}
                            </h3>
                            <p className="text-xs text-gray-500">ID: {fee.id}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {fee.class_name || "Class ?"} {fee.section ? `• Sec ${fee.section}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {fee.fee_type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Amount</span>
                          <span className="font-semibold text-gray-900">
                            ₹{(fee as ExtendedFeePayment).total_amount?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Amount Paid</span>
                          <span className="font-semibold text-green-600">
                            ₹{parseFloat(fee.amount_paid).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <span className="text-sm font-medium text-gray-700">Remaining</span>
                          <span className="font-bold text-red-600 text-lg">
                            ₹{(fee as ExtendedFeePayment).remaining_amount?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Payment Date</span>
                          <span className="text-sm text-gray-500">
                            {new Date(fee.payment_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center">
                          <span className="text-xs text-gray-500">Click to view details</span>
                          <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Full Details */}
      {showModal && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Fee Payment Details</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">
                    {selectedFee.student_name.charAt(0)}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {selectedFee.student_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">Payment ID: {selectedFee.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Fees Type</h4>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800">
                        {selectedFee.fee_type}
                      </span>
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Amount</h4>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      ₹{selectedFee?.total_amount?.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Amount Paid</h4>
                    <p className="text-base sm:text-lg font-semibold text-green-600">
                      ₹{parseFloat(selectedFee.amount_paid).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-red-50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-xs sm:text-sm font-medium text-red-600 mb-1">Remaining Amount</h4>
                    <p className="text-xl sm:text-2xl font-bold text-red-600">
                      ₹{selectedFee?.remaining_amount?.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Payment Date</h4>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {new Date(selectedFee.payment_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Status</h4>
                    <p className="text-base sm:text-lg font-semibold">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <h4 className="text-xs sm:text-sm font-medium text-blue-600 mb-2">Payment Progress</h4>
                <div className="w-full bg-blue-200 rounded-full h-3 sm:h-4">
                  <div 
                    className="bg-blue-600 h-3 sm:h-4 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((parseFloat(selectedFee?.amount_paid || '0') / (selectedFee?.total_amount || 1)) * 100).toFixed(1)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs sm:text-sm text-gray-600">
                    {((parseFloat(selectedFee?.amount_paid || '0') / (selectedFee?.total_amount || 1)) * 100).toFixed(1)}% Paid
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">
                    {(selectedFee?.remaining_amount || 0) > 0 ? 'Pending' : 'Completed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManagementPendingFees;