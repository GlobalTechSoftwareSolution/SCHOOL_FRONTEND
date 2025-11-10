"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";
const FEES_API = "https://globaltechsoftwaresolutions.cloud/school-api/api/fee_payments/";
const FEE_STRUCTURE_API = "https://globaltechsoftwaresolutions.cloud/school-api/api/fee_structures/";

interface FeeStructure {
  id: number;
  amount: string;
  fee_type: string;
  class_name: string;
  section: string;
  frequency: string;
  academic_year?: string;
}

interface FeeDetails {
  id: number;
  student_name: string;
  fee_type: string;
  amount_paid: string;
  total_amount: string;
  remaining_amount: string;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  status: string;
  remarks: string;
  created_at: string;
  updated_at: string;
  student: string;
  fee_structure: number;
  class_name?: string;
  section?: string;
  actual_total_amount?: string;
  calculated_remaining_amount?: string;
}

const StudentFeesPage = () => {
  const [fees, setFees] = useState<FeeDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFee, setSelectedFee] = useState<FeeDetails | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const fetchFeeStructures = async (feeStructureIds: number[]): Promise<FeeStructure[]> => {
    try {
      const response = await axios.get(FEE_STRUCTURE_API);
      const allFeeStructures = response.data;
      return allFeeStructures.filter((fs: FeeStructure) => 
        feeStructureIds.includes(fs.id)
      );
    } catch (error) {
      console.error("❌ Error fetching fee structures:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchStudentAndFees = async () => {
      try {
        setLoading(true);
        setError(null);

        const email = 
          localStorage.getItem("userEmail") ||
          JSON.parse(localStorage.getItem("userData") || "{}")?.email ||
          JSON.parse(localStorage.getItem("userInfo") || "{}")?.email;

        if (!email) {
          setError("No student email found in localStorage.");
          setLoading(false);
          return;
        }

        console.log("💰 Fetching fees for student:", email);

        try {
          const studentRes = await axios.get(`https://globaltechsoftwaresolutions.cloud/school-api/api/students/?email=${encodeURIComponent(email)}`);
          const studentRecord = Array.isArray(studentRes.data) ? studentRes.data[0] : studentRes.data;
          
          if (!studentRecord) {
            setError("Student record not found.");
            setLoading(false);
            return;
          }

          console.log("🎓 Student details:", {
            name: studentRecord.fullname || studentRecord.name,
            class: studentRecord.class_name,
            section: studentRecord.section
          });

          setStudent(studentRecord);

          try {
            const response = await axios.get(FEES_API);
            console.log("💳 Total fees fetched:", response.data.length);

            const studentName = studentRecord.fullname || studentRecord.name || "";
            console.log("🎯 Looking for student:", studentName);

            const filtered = response.data.filter(
              (f: FeeDetails) => {
                const nameMatch = f.student_name?.toLowerCase().trim() === studentName.toLowerCase().trim();
                const hasClassInfo = f.class_name !== undefined && f.class_name !== null && f.class_name.trim() !== "";
                const hasSectionInfo = f.section !== undefined && f.section !== null && f.section.trim() !== "";
                
                let classMatch = true;
                let sectionMatch = true;
                
                if (hasClassInfo) {
                  classMatch = f.class_name?.toLowerCase().trim() === (studentRecord.class_name || "").toLowerCase().trim();
                }
                
                if (hasSectionInfo) {
                  sectionMatch = f.section?.toLowerCase().trim() === (studentRecord.section || "").toLowerCase().trim();
                }
                
                return nameMatch && classMatch && sectionMatch;
              }
            );

            console.log("✅ Found", filtered.length, "fee records for student:", studentName);
            
            if (filtered.length > 0) {
              const feeStructureIds = filtered.map((f: FeeDetails) => f.fee_structure);
              const feeStructures = await fetchFeeStructures(feeStructureIds);
              
              console.log("💰 Fetched fee structures:", feeStructures);
              
              const enhancedFees = filtered.map((fee: FeeDetails) => {
                const feeStructure = feeStructures.find(fs => fs.id === fee.fee_structure);
                
                if (feeStructure) {
                  const actualTotal = parseFloat(feeStructure.amount);
                  const amountPaid = parseFloat(fee.amount_paid);
                  const calculatedRemaining = Math.max(0, actualTotal - amountPaid);
                  
                  return {
                    ...fee,
                    actual_total_amount: feeStructure.amount,
                    calculated_remaining_amount: calculatedRemaining.toFixed(2)
                  };
                } else {
                  console.warn(`⚠️ Fee structure not found for ID: ${fee.fee_structure}`);
                  return fee;
                }
              });
              
              setFees(enhancedFees);
            } else {
              setFees(filtered);
            }

          } catch (feesErr) {
            console.error("❌ Fees API error:", feesErr);
            try {
              const token = localStorage.getItem("accessToken");
              const response = await axios.get(FEES_API, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              console.log("💳 Total fees fetched (with token):", response.data.length);

              const studentName = studentRecord.fullname || studentRecord.name || "";
              const filtered = response.data.filter(
                (f: FeeDetails) => {
                  const nameMatch = f.student_name?.toLowerCase().trim() === studentName.toLowerCase().trim();
                  const hasClassInfo = f.class_name !== undefined && f.class_name !== null && f.class_name.trim() !== "";
                  const hasSectionInfo = f.section !== undefined && f.section !== null && f.section.trim() !== "";
                  
                  let classMatch = true;
                  let sectionMatch = true;
                  
                  if (hasClassInfo) {
                    classMatch = f.class_name?.toLowerCase().trim() === (studentRecord.class_name || "").toLowerCase().trim();
                  }
                  
                  if (hasSectionInfo) {
                    sectionMatch = f.section?.toLowerCase().trim() === (studentRecord.section || "").toLowerCase().trim();
                  }
                  
                  return nameMatch && classMatch && sectionMatch;
                }
              );

              console.log("✅ Found", filtered.length, "fee records for student:", studentName);
              
              if (filtered.length > 0) {
                const feeStructureIds = filtered.map((f: FeeDetails) => f.fee_structure);
                const feeStructures = await fetchFeeStructures(feeStructureIds);
                
                const enhancedFees = filtered.map((fee: FeeDetails) => {
                  const feeStructure = feeStructures.find(fs => fs.id === fee.fee_structure);
                  
                  if (feeStructure) {
                    const actualTotal = parseFloat(feeStructure.amount);
                    const amountPaid = parseFloat(fee.amount_paid);
                    const calculatedRemaining = Math.max(0, actualTotal - amountPaid);
                    
                    return {
                      ...fee,
                      actual_total_amount: feeStructure.amount,
                      calculated_remaining_amount: calculatedRemaining.toFixed(2)
                    };
                  } else {
                    console.warn(`⚠️ Fee structure not found for ID: ${fee.fee_structure}`);
                    return fee;
                  }
                });
                
                setFees(enhancedFees);
              } else {
                setFees(filtered);
              }

            } catch (tokenErr) {
              console.error("❌ Fees API failed even with token:", tokenErr);
              setError("Fees service is not available. Please contact support.");
            }
          }

        } catch (studentErr) {
          console.error("Error fetching student details:", studentErr);
          setError("Failed to fetch student details.");
        }

      } catch (error) {
        console.error("Error fetching fees:", error);
        setError("Failed to fetch fee data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndFees();
  }, []);

  // Calculate summary statistics
  const totalPaid = fees.reduce((sum, fee) => sum + parseFloat(fee.amount_paid || "0"), 0);
  const totalDue = fees.reduce((sum, fee) => sum + parseFloat(fee.calculated_remaining_amount || fee.remaining_amount || "0"), 0);
  const paidFees = fees.filter(fee => fee.status === 'Paid').length;
  const pendingFees = fees.filter(fee => fee.status !== 'Paid').length;

  const handleViewReceipt = (fee: FeeDetails) => {
    setSelectedFee(fee);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your fee details...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Fee Management</h1>
                <p className="text-gray-600">View and manage your fee payments</p>
              </div>
              {student && (
                <div className="mt-4 md:mt-0 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.fullname || student.name}</h3>
                      <p className="text-sm text-gray-600">{student.class_name} • {student.section}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">₹{totalPaid.toFixed(2)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Due</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">₹{totalDue.toFixed(2)}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Fees</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{paidFees}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Fees</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{pendingFees}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Details Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Fee History</h2>
              <p className="text-gray-600 text-sm mt-1">Detailed breakdown of all your fee payments</p>
            </div>

            {fees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{fee.fee_type}</div>
                            <div className="text-sm text-gray-500">{fee.class_name} • {fee.section}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">₹{fee.actual_total_amount || fee.total_amount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">₹{fee.amount_paid}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-red-600">₹{fee.calculated_remaining_amount || fee.remaining_amount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            fee.status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : fee.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fee.payment_date || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewReceipt(fee)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No fee records found</h3>
                <p className="mt-1 text-sm text-gray-500">No fee records found for your account.</p>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">Need help with fees?</h3>
                <p className="text-blue-700 mb-2">If you have any questions regarding your fee payments or need assistance, please contact:</p>
                <div className="text-sm text-blue-600">
                  <p>📞 Finance Department: +91-XXXXXX-XXXX</p>
                  <p>✉️ Email: finance@school.edu.in</p>
                  <p>🏢 Office Hours: Mon-Fri, 9:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Modal */}
        {showReceiptModal && selectedFee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Receipt Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">Payment Receipt</h2>
                    <p className="text-blue-100">Transaction ID: {selectedFee.transaction_id}</p>
                  </div>
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-6 space-y-6">
                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Student Name</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedFee.student_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Class & Section</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedFee.class_name} • {selectedFee.section}</p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="border-t border-b border-gray-200 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fee Type</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedFee.fee_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Date</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedFee.payment_date || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Amount Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold">₹{selectedFee.actual_total_amount || selectedFee.total_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-semibold text-green-600">₹{selectedFee.amount_paid}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="text-gray-600">Remaining Amount:</span>
                      <span className="font-semibold text-red-600">₹{selectedFee.calculated_remaining_amount || selectedFee.remaining_amount}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedFee.payment_method}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedFee.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedFee.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedFee.status}
                    </span>
                  </div>
                </div>

                {/* Remarks */}
                {selectedFee.remarks && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Remarks</label>
                    <p className="text-gray-900 mt-1">{selectedFee.remarks}</p>
                  </div>
                )}
              </div>

              {/* Receipt Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Generated on {new Date().toLocaleDateString()}
                  </div>
                  <button
                    onClick={handlePrintReceipt}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentFeesPage;