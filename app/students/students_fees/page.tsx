"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;
const FEES_API = `${API_BASE}/fee_payments/`;
const FEE_STRUCTURE_API = `${API_BASE}/fee_structures/`;

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
  total_amount?: string;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  status: string;
  remarks: string;
  student: string;
  fee_structure: number;
  class_name?: string;
  section?: string;
  calculated_remaining_amount?: string;
  structure_amount?: string;
}

interface PaymentFormData {
  fee_structure: number;
  amount_paid: string;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  status: string;
  remarks: string;
} 

const StudentFeesPage = () => {
  const [fees, setFees] = useState<FeeDetails[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Record<string, unknown> | null>(null);
  const [selectedFee, setSelectedFee] = useState<FeeDetails | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    fee_structure: 0,
    amount_paid: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "Online Payment",
    transaction_id: "",
    status: "Paid",
    remarks: "",
  });

  // ✅ Flexible fetch of fee structures
  const fetchFeeStructures = async (studentClass: string, studentSection: string) => {
    try {
      const res = await axios.get(FEE_STRUCTURE_API);
      const all = res.data;

      const filtered = all.filter((fs: FeeStructure) => {
        const classMatch =
          fs.class_name?.toLowerCase().trim() === studentClass?.toLowerCase().trim();
        const sectionMatch = studentSection
          ? fs.section?.toLowerCase().trim() === studentSection?.toLowerCase().trim()
          : true; // allow if section missing
        return classMatch && sectionMatch;
      });

      setFeeStructures(filtered);
      return filtered;
    } catch {
      return [];
    }
  };

  // ✅ Fetch student + fees + totals
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const email =
          localStorage.getItem("userEmail") ||
          JSON.parse(localStorage.getItem("userData") || "{}")?.email ||
          JSON.parse(localStorage.getItem("userInfo") || "{}")?.email;

        if (!email) {
          setLoading(false);
          return;
        }

        // Fetch student details by email
        const studentRes = await axios.get(`${API_BASE}/students/?email=${encodeURIComponent(email)}`);
        const studentData = Array.isArray(studentRes.data) ? studentRes.data[0] : studentRes.data;

        if (!studentData) {
          setLoading(false);
          return;
        }

        setStudent(studentData);
        
        // Fetch fee structures based on student's class and section
        const structures = await fetchFeeStructures(studentData.class_name, studentData.section);
        
        // Fetch fee payments for this student
        const feesRes = await axios.get<FeeDetails[]>(FEES_API);

        const normalizedEmail = (studentData.email || "").toLowerCase().trim();
        const normalizedName = (studentData.fullname || studentData.name || "").toLowerCase().trim();

        const filteredFees = feesRes.data
          .filter((f) => {
            const feeEmail = (f.student || "").toLowerCase().trim();
            const feeName = (f.student_name || "").toLowerCase().trim();
            if (feeEmail && normalizedEmail) {
              return feeEmail === normalizedEmail;
            }
            return feeName === normalizedName;
          });

        // Group fees by fee_structure to calculate total paid per structure
        const feesByStructure: Record<number, FeeDetails[]> = {};
        filteredFees.forEach((fee) => {
          const structureId = fee.fee_structure;
          if (!feesByStructure[structureId]) {
            feesByStructure[structureId] = [];
          }
          feesByStructure[structureId].push(fee);
        });

        // Create enhanced fee records with proper calculations
        const enhancedFees = Object.entries(feesByStructure).flatMap(
          ([structureId, feesForStructure]) => {
            const structureIdNum = parseInt(structureId);
            const matchedStructure = structures.find((fs: FeeStructure) => fs.id === structureIdNum);
            
            if (!matchedStructure) return feesForStructure;
            
            const totalAmount = parseFloat(matchedStructure.amount || "0");
            const totalPaid = feesForStructure.reduce((sum, fee) => sum + parseFloat(fee.amount_paid || "0"), 0);
            const remainingAmount = Math.max(totalAmount - totalPaid, 0);
            
            // Enhance each fee with structure info and calculated remaining
            return feesForStructure.map((fee) => ({
              ...fee,
              total_amount: totalAmount.toString(),
              structure_amount: matchedStructure.amount,
              calculated_remaining_amount: remainingAmount.toFixed(2), // Same for all fees in this structure
            }));
          }
        );

        setFees(enhancedFees);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ✅ Handle Payment Submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!student?.email) {
        alert("⚠️ Student email not found. Please refresh.");
        setSubmitting(false);
        return;
      }

      if (!paymentForm.fee_structure || paymentForm.fee_structure === 0) {
        alert("⚠️ Please select a fee structure.");
        setSubmitting(false);
        return;
      }

      // ✅ Build backend-compatible payload
      const payload = {
        student: student.email,
        fee_structure: paymentForm.fee_structure,
        amount_paid: parseFloat(paymentForm.amount_paid),
        payment_date: paymentForm.payment_date,
        payment_method: paymentForm.payment_method,
        transaction_id: `TXN${Date.now()}`,
        status: "Paid",
        remarks: "Paid via student portal",
      };

      await axios.post(FEES_API, payload, {
        headers: { "Content-Type": "application/json" },
      });

      alert("✅ Payment submitted successfully!");
      setShowPaymentModal(false);
      window.location.reload();

    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { payment_method?: string; amount_paid?: string } } };
      if (axiosError.response?.data?.payment_method) {
        alert("⚠️ Invalid payment method. Please use Cash, Card, Bank Transfer, Online, or Cheque.");
      } else if (axiosError.response?.data?.amount_paid) {
        alert(`⚠️ ${axiosError.response.data.amount_paid}`);
      } else {
        alert("Payment failed. Check all fields and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total paid across all fees
  const totalPaid = fees.reduce((sum, f) => sum + parseFloat(f.amount_paid || "0"), 0);
  
  // Calculate total due - Perfect calculation using fee structures
  const totalDue = (() => {
    // Get unique fee structures from the fees
    const uniqueStructures = [...new Set(fees.map(fee => fee.fee_structure))];
    
    let totalRemaining = 0;
    
    // For each unique structure, get the remaining amount from the first fee of that structure
    uniqueStructures.forEach(structureId => {
      // Find the first fee with this structure ID
      const feeWithStructure = fees.find(fee => fee.fee_structure === structureId);
      if (feeWithStructure) {
        // Add the pre-calculated remaining amount for this structure
        totalRemaining += parseFloat(feeWithStructure.calculated_remaining_amount || "0");
      }
    });
    
    return totalRemaining;
  })();
  
  const paidFees = fees.filter((f) => f.status === "Paid").length;
  const pendingFees = fees.filter((f) => f.status !== "Paid").length;

  const handleViewReceipt = (fee: FeeDetails) => {
    setSelectedFee(fee);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = () => window.print();

  // Fee Card Component
  const FeeCard = ({ fee }: { fee: FeeDetails }) => (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
              {fee.fee_type?.charAt(0) || 'F'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">{fee.fee_type}</h3>
              <p className="text-gray-500 text-xs">{fee.payment_date}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
              fee.status === "Paid"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            {fee.status === "Paid" ? "✅ Paid" : "⏳ Pending"}
          </span>
        </div>

        {/* Amount Details */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="text-center">
            <p className="text-gray-500 text-xs sm:text-sm mb-1">Total</p>
            <p className="font-semibold text-gray-900 text-sm sm:text-base">₹{fee.structure_amount || fee.total_amount}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs sm:text-sm mb-1">Paid</p>
            <p className="font-semibold text-green-600 text-sm sm:text-base">₹{fee.amount_paid}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs sm:text-sm mb-1">Due</p>
            <p className="font-semibold text-red-600 text-sm sm:text-base">₹{fee.calculated_remaining_amount}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="space-y-2 mb-4 sm:mb-6">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-500">Method:</span>
            <span className="font-medium">{fee.payment_method}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-500">Transaction ID:</span>
            <span className="font-mono text-xs truncate max-w-[100px] sm:max-w-[150px]" title={fee.transaction_id}>
              {fee.transaction_id}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <button
            onClick={() => handleViewReceipt(fee)}
            className="w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium text-xs sm:text-sm"
          >
            <span>📄</span>
            View Receipt
          </button>
        </div>
      </div>
    </div>
  );

  if (loading)
    return (
      <DashboardLayout role="students">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading fees information...</p>
          </div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* HEADER SECTION */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Fees Management</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage your fee payments and track payment history</p>
            </div>
            <button
              onClick={() => {
                if (!student) {
                  alert("⚠️ Student data not yet loaded. Please refresh.");
                  return;
                }
                setShowPaymentModal(true);
              }}
              className={`w-full lg:w-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg justify-center ${
                !student
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
              disabled={!student}
            >
              <span>💳</span>
              Pay Fees
            </button>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <SummaryCard 
              title="Total Paid" 
              value={`₹${totalPaid.toFixed(2)}`} 
              color="green" 
              icon="💰"
            />
            <SummaryCard 
              title="Total Due" 
              value={`₹${totalDue.toFixed(2)}`} 
              color="red" 
              icon="📋"
            />
            <SummaryCard 
              title="Paid Fees" 
              value={paidFees} 
              color="blue" 
              icon="✅"
            />
            <SummaryCard 
              title="Pending Fees" 
              value={pendingFees} 
              color="orange" 
              icon="⏳"
            />
          </div>

          {/* FEE CARDS GRID */}
          <div className="bg-transparent">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
                📊 Fee History
              </h2>
              <span className="text-xs sm:text-sm text-gray-500 bg-white px-2 sm:px-3 py-1 rounded-full border">
                {fees.length} records
              </span>
            </div>
            
            {fees.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {fees.map((fee) => (
                  <FeeCard key={fee.id} fee={fee} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
                <p className="text-gray-500 text-base sm:text-lg mb-1 sm:mb-2">No fee records found</p>
                <p className="text-gray-400 text-xs sm:text-sm">Your fee history will appear here once payments are made</p>
              </div>
            )}
          </div>
        </div>

        {/* RECEIPT MODAL */}
        {showReceiptModal && selectedFee && (
          <ReceiptModal 
            fee={selectedFee} 
            onClose={() => setShowReceiptModal(false)} 
            onPrint={handlePrintReceipt} 
          />
        )}

        {/* PAYMENT MODAL */}
        {showPaymentModal && (
          <PaymentModal
            paymentForm={paymentForm}
            setPaymentForm={setPaymentForm}
            feeStructures={feeStructures}
            submitting={submitting}
            onClose={() => setShowPaymentModal(false)}
            onSubmit={handlePaymentSubmit}
          />
        )}
      </div>
      
      {/* Media Queries for Responsive Design */}
      <style jsx global>{`
        @media (max-width: 640px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          
          .grid-cols-1 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
          
          .text-2xl {
            font-size: 1.5rem;
            line-height: 2rem;
          }
          
          .p-3 {
            padding: 0.75rem;
          }
          
          .gap-3 {
            gap: 0.75rem;
          }
          
          .rounded-xl {
            border-radius: 0.75rem;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          
          .lg\:grid-cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          
          .lg\:grid-cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 1025px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          
          .lg\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
          
          .lg\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background-color: white !important;
          }
          
          .receipt-modal {
            position: static !important;
            transform: none !important;
            max-width: 100% !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

type SummaryCardColor = "green" | "red" | "blue" | "orange";

interface SummaryCardProps {
  title: string;
  value: string | number;
  color: SummaryCardColor;
  icon: React.ReactNode;
}

// ✅ Enhanced Summary Card Component
const SummaryCard = ({ title, value, color, icon }: SummaryCardProps) => {
  const colorClasses: Record<SummaryCardColor, string> = {
    green: "from-emerald-500 to-green-500",
    red: "from-rose-500 to-red-500",
    blue: "from-blue-500 to-cyan-500",
    orange: "from-amber-500 to-orange-500",
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg sm:rounded-xl flex items-center justify-center text-white text-sm sm:text-lg`}>
          {icon}
        </div>
      </div>
      <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">{title}</p>
      <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold text-gray-900`}>{value}</h3>
    </div>
  );
};

// ✅ Enhanced Receipt Modal
interface ReceiptModalProps {
  fee: FeeDetails;
  onClose: () => void;
  onPrint: () => void;
}

const ReceiptModal = ({ fee, onClose, onPrint }: ReceiptModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-3 sm:p-4">
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden receipt-modal">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold">Payment Receipt</h2>
        <p className="text-blue-100 text-xs sm:text-sm">Transaction Confirmation</p>
      </div>
      
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Student Name</p>
            <p className="font-semibold text-sm sm:text-base">{fee.student_name}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Fee Type</p>
            <p className="font-semibold text-sm sm:text-base">{fee.fee_type}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Total Amount</p>
            <p className="font-semibold text-base sm:text-lg">₹{fee.structure_amount}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Paid Amount</p>
            <p className="font-semibold text-base sm:text-lg text-green-600">₹{fee.amount_paid}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Remaining</p>
            <p className="font-semibold text-sm sm:text-base text-red-600">₹{fee.calculated_remaining_amount}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Status</p>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
              fee.status === "Paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
            }`}>
              {fee.status}
            </span>
          </div>
        </div>
        
        <div className="border-t pt-3 sm:pt-4 space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-500">Payment Date:</span>
            <span className="font-medium">{fee.payment_date}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-500">Payment Method:</span>
            <span className="font-medium">{fee.payment_method}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-500">Transaction ID:</span>
            <span className="font-mono text-xs">{fee.transaction_id}</span>
          </div>
          {fee.remarks && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Remarks:</span>
              <span className="font-medium text-right">{fee.remarks}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200">
        <button 
          onClick={onClose} 
          className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base order-2 sm:order-1"
        >
          Close
        </button>
        <button 
          onClick={onPrint} 
          className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base justify-center order-1 sm:order-2 mb-2 sm:mb-0"
        >
          🖨️ Print
        </button>
      </div>
    </div>
  </div>
);

// ✅ Enhanced Payment Modal
interface PaymentModalProps {
  paymentForm: PaymentFormData;
  setPaymentForm: React.Dispatch<React.SetStateAction<PaymentFormData>>;
  feeStructures: FeeStructure[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PaymentModal = ({ paymentForm, setPaymentForm, feeStructures, submitting, onClose, onSubmit }: PaymentModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-3 sm:p-4">
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold">Pay Fees</h2>
        <p className="text-green-100 text-xs sm:text-sm">Complete your payment securely</p>
      </div>
      
      <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Select Fee Structure</label>
          <select
            value={paymentForm.fee_structure}
            onChange={(e) => setPaymentForm((p: PaymentFormData) => ({ ...p, fee_structure: parseInt(e.target.value) }))}
            required
            className="w-full border border-gray-300 rounded-lg sm:rounded-xl p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
          >
            <option value="">Choose a fee type...</option>
            {feeStructures.map((fs: FeeStructure) => (
              <option key={fs.id} value={fs.id}>
                {fs.fee_type} - ₹{fs.amount} ({fs.frequency})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Amount Paid (₹)</label>
          <input
            type="number"
            name="amount_paid"
            placeholder="Enter amount"
            value={paymentForm.amount_paid}
            onChange={(e) => setPaymentForm((p: PaymentFormData) => ({ ...p, amount_paid: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg sm:rounded-xl p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Payment Date</label>
          <input
            type="date"
            name="payment_date"
            value={paymentForm.payment_date}
            onChange={(e) => setPaymentForm((p: PaymentFormData) => ({ ...p, payment_date: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg sm:rounded-xl p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Payment Method</label>
          <select
            name="payment_method"
            value={paymentForm.payment_method}
            onChange={(e) => setPaymentForm((p: PaymentFormData) => ({ ...p, payment_method: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg sm:rounded-xl p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            required
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">💵 Cash</option>
            <option value="Card">💳 Card</option>
            <option value="Bank Transfer">🏦 Bank Transfer</option>
            <option value="Online">🌐 Online</option>
            <option value="Cheque">📄 Cheque</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Remarks (Optional)</label>
          <textarea
            name="remarks"
            placeholder="Any additional notes..."
            value={paymentForm.remarks}
            onChange={(e) => setPaymentForm((p: PaymentFormData) => ({ ...p, remarks: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg sm:rounded-xl p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            rows={3}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium text-sm sm:text-base order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg sm:rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base justify-center order-1 sm:order-2 mb-2 sm:mb-0"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                💳 Submit Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default StudentFeesPage;
