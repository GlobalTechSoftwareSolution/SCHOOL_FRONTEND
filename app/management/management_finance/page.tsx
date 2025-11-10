"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

interface FeePayment {
  id: number;
  student: string;
  student_name: string;
  fee_structure: number;
  amount_paid: string;
  total_amount: string | null;
  remaining_amount: string | null;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  status: string;
  remarks: string;
}

interface FeeStructure {
  id: number;
  fee_type: string;
  amount: string;
}

const ManagementFinance = () => {
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [pendingFees, setPendingFees] = useState<any[]>([]);
  const [paidFees, setPaidFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"paid" | "pending">("paid");

  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [transportIncome, setTransportIncome] = useState(0);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);
        const [paymentsRes, structuresRes, studentsRes] = await Promise.all([
          axios.get(`${API_BASE}/fee_payments/`),
          axios.get(`${API_BASE}/fee_structures/`),
          axios.get(`${API_BASE}/students/`),
        ]);

        const paymentsData = paymentsRes.data;
        const structuresData = structuresRes.data;
        const studentsData = studentsRes.data;

        setPayments(paymentsData);
        setStructures(structuresData);
        setStudents(studentsData);

        // Match fee_structure IDs to get fee_type and total amount
        // Also match student email to get class_name and section
        const mergedData = paymentsData.map((pay: FeePayment) => {
          const structure = structuresData.find(
            (s: FeeStructure) => s.id === pay.fee_structure
          );
          const student = studentsData.find(
            (s: any) => s.email === pay.student
          );
          const total = structure ? parseFloat(structure.amount) : 0;
          const paid = parseFloat(pay.amount_paid);
          const remaining = total - paid;

          return {
            ...pay,
            fee_type: structure ? structure.fee_type : "Unknown",
            total_amount: total,
            remaining_amount: remaining > 0 ? remaining : 0,
            class_name: student ? student.class_name : "Unknown",
            section: student ? student.section : "Unknown",
            student_full_data: student || null,
          };
        });

        // Calculate totals
        const paidTotal = mergedData
          .filter((p: any) => p.status === "Paid")
          .reduce((sum: number, p: any) => sum + parseFloat(p.amount_paid), 0);

        const pendingTotal = mergedData
          .filter((p: any) => p.remaining_amount > 0)
          .reduce((sum: number, p: any) => sum + p.remaining_amount, 0);

        const transport = mergedData
          .filter((p: any) => p.fee_type === "Transport")
          .reduce((sum: number, p: any) => sum + parseFloat(p.amount_paid), 0);

        setPayments(mergedData);
        setPaidFees(mergedData.filter((p: any) => p.status === "Paid"));
        setPendingFees(mergedData.filter((p: any) => p.remaining_amount > 0));
        setTotalPaid(paidTotal);
        setTotalPending(pendingTotal);
        setTransportIncome(transport);
      } catch (err) {
        console.error("Error fetching finance data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  // Get unique classes from paid fees
  const getUniqueClasses = () => {
    const classes = new Set(paidFees.map((fee) => fee.class_name || "Unknown"));
    return Array.from(classes).sort();
  };

  // Filter fees by selected class
  const getFilteredFees = () => {
    const fees = activeTab === "paid" ? paidFees : pendingFees;
    if (selectedClass === "all") return fees;
    return fees.filter((fee) => fee.class_name === selectedClass);
  };

  // Handle card click
  const handleCardClick = (student: any) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  // Monthly Chart Data
  const monthlyData = payments.reduce((acc: any, payment) => {
    const month = new Date(payment.payment_date).toLocaleString("default", {
      month: "short",
    });
    const paid = parseFloat(payment.amount_paid || "0");
    acc[month] = (acc[month] || 0) + paid;
    return acc;
  }, {});

  const chartData = Object.keys(monthlyData).map((month) => ({
    month,
    amount: monthlyData[month],
  }));

  if (loading)
    return (
      <DashboardLayout role="management">
        <div className="p-6 text-center text-gray-500">
          Loading Finance Data...
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="management">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              💰 Finance Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and track all fee payments with beautiful insights
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-3xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-green-100 text-sm">Total Collected</p>
                  <p className="text-3xl font-bold">₹{totalPaid.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-400 to-red-600 p-6 rounded-3xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-red-100 text-sm">Pending Fees</p>
                  <p className="text-3xl font-bold">₹{totalPending.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-3xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Transport Income</p>
                  <p className="text-3xl font-bold">₹{transportIncome.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 rounded-3xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-purple-100 text-sm">Overall Revenue</p>
                  <p className="text-3xl font-bold">₹{(totalPaid + totalPending).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-indigo-100 p-2 rounded-xl mr-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              Monthly Fee Collection Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Bar dataKey="amount" fill="url(#colorGradient)" radius={[12, 12, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Tabs */}
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setActiveTab("paid")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === "paid"
                      ? "bg-white text-green-600 shadow-md"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  ✅ Paid Fees ({paidFees.length})
                </button>
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === "pending"
                      ? "bg-white text-red-600 shadow-md"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  ⏳ Pending Fees ({pendingFees.length})
                </button>
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">Filter by Class:</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium"
                >
                  <option value="all">All Classes</option>
                  {getUniqueClasses().map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Student Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {getFilteredFees().map((student) => (
              <div
                key={student.id}
                onClick={() => handleCardClick(student)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden group"
              >
                <div className={`h-2 ${activeTab === "paid" ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-red-400 to-red-600"}`}></div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${activeTab === "paid" ? "bg-green-100" : "bg-red-100"} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <span className={`text-lg font-bold ${activeTab === "paid" ? "text-green-600" : "text-red-600"}`}>
                          {student.student_name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {student.student_name}
                        </h3>
                        <p className="text-sm text-gray-500">{student.class_name || "Unknown"} - {student.section || "Unknown"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activeTab === "paid" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {activeTab === "paid" ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fee Type</span>
                      <span className="text-sm font-semibold text-indigo-600">
                        {student.fee_type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className={`text-sm font-bold ${activeTab === "paid" ? "text-green-600" : "text-red-600"}`}>
                        ₹{parseFloat(student.amount_paid).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Date</span>
                      <span className="text-xs text-gray-500">
                        {new Date(student.payment_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center text-xs text-indigo-600 font-medium">
                      Click for details →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {getFilteredFees().length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No {activeTab} fees found
              </h3>
              <p className="text-gray-600">
                {selectedClass !== "all" ? `Try selecting a different class` : "All fees are up to date!"}
              </p>
            </div>
          )}
        </div>

        {/* Student Details Modal */}
        {showModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform scale-100 transition-all">
              <div className={`h-3 ${activeTab === "paid" ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-red-400 to-red-600"}`}></div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Student Fee Details</h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center mb-8">
                  <div className={`w-20 h-20 ${activeTab === "paid" ? "bg-green-100" : "bg-red-100"} rounded-full flex items-center justify-center`}>
                    <span className={`text-2xl font-bold ${activeTab === "paid" ? "text-green-600" : "text-red-600"}`}>
                      {selectedStudent.student_name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedStudent.student_name}
                    </h3>
                    <p className="text-gray-600">Class: {selectedStudent.class_name}</p>
                    <p className="text-gray-600">Section: {selectedStudent.section}</p>
                    <p className="text-gray-600">Email: {selectedStudent.student}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Fee Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Fee Type</span>
                          <span className="font-semibold text-indigo-600">
                            {selectedStudent.fee_type}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Amount</span>
                          <span className="font-semibold text-gray-900">
                            ₹{selectedStudent.total_amount?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Amount Paid</span>
                          <span className="font-semibold text-green-600">
                            ₹{parseFloat(selectedStudent.amount_paid).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Payment Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Payment Method</span>
                          <span className="font-semibold text-gray-900">
                            {selectedStudent.payment_method || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Transaction ID</span>
                          <span className="font-semibold text-gray-900">
                            {selectedStudent.transaction_id || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Payment Date</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(selectedStudent.payment_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={`${activeTab === "paid" ? "bg-green-50" : "bg-red-50"} rounded-2xl p-4`}>
                      <h4 className={`text-sm font-medium ${activeTab === "paid" ? "text-green-600" : "text-red-600"} mb-2`}>
                        Status & Balance
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            activeTab === "paid" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {selectedStudent.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Remaining Amount</span>
                          <span className={`text-xl font-bold ${activeTab === "paid" ? "text-green-600" : "text-red-600"}`}>
                            ₹{selectedStudent.remaining_amount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4">
                      <h4 className="text-sm font-medium text-blue-600 mb-2">Payment Progress</h4>
                      <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${((parseFloat(selectedStudent.amount_paid) / selectedStudent.total_amount) * 100).toFixed(1)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {((parseFloat(selectedStudent.amount_paid) / selectedStudent.total_amount) * 100).toFixed(1)}% Paid
                        </span>
                        <span className="font-semibold text-gray-900">
                          {selectedStudent.remaining_amount > 0 ? 'Partial' : 'Complete'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedStudent.remarks && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-2xl">
                    <h4 className="text-sm font-medium text-yellow-600 mb-2">Remarks</h4>
                    <p className="text-gray-700">{selectedStudent.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagementFinance;
