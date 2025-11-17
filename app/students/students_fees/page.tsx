"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";
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
  const [student, setStudent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
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
      console.log("📚 Fetching fee structures for:", { studentClass, studentSection });
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

      if (filtered.length === 0) {
        console.warn("⚠️ No matching fee structures found for this class/section. Using fallback.");
      }

      setFeeStructures(filtered);
      return filtered;
    } catch (err) {
      console.error("❌ Error fetching fee structures:", err);
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
          setError("No student email found.");
          setLoading(false);
          return;
        }

        const studentRes = await axios.get(`${API_BASE}/students/?email=${encodeURIComponent(email)}`);
        const studentData = Array.isArray(studentRes.data) ? studentRes.data[0] : studentRes.data;

        if (!studentData) {
          setError("Student not found in database.");
          setLoading(false);
          return;
        }

        setStudent(studentData);
        const structures = await fetchFeeStructures(studentData.class_name, studentData.section);
        const feesRes = await axios.get(FEES_API);

        const normalizedEmail = (studentData.email || "").toLowerCase().trim();
        const normalizedName = (studentData.fullname || studentData.name || "").toLowerCase().trim();

        const filteredFees = feesRes.data
          .filter((f: FeeDetails) => {
            const feeEmail = (f.student || "").toLowerCase().trim();
            const feeName = (f.student_name || "").toLowerCase().trim();
            if (feeEmail && normalizedEmail) {
              return feeEmail === normalizedEmail;
            }
            return feeName === normalizedName;
          })
          .map((f: FeeDetails) => {
            const matchedStructure = structures.find((fs: FeeStructure) => fs.id === f.fee_structure);
            const total = matchedStructure ? parseFloat(matchedStructure.amount || "0") : 0;
            const paid = parseFloat(f.amount_paid || "0");
            const remaining = Math.max(total - paid, 0).toFixed(2);
            return {
              ...f,
              total_amount: total.toString(),
              structure_amount: matchedStructure?.amount,
              calculated_remaining_amount: remaining,
            };
          });

        setFees(filteredFees);
        console.log("✅ Final fee list:", filteredFees);
      } catch (err) {
        console.error("❌ Error loading student + fee data:", err);
        setError("Failed to load fee data.");
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

      console.log("💰 Final Payload:", payload);

      const response = await axios.post(FEES_API, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Payment Response:", response.data);
      alert("✅ Payment submitted successfully!");
      setShowPaymentModal(false);
      window.location.reload();

    } catch (err: any) {
      console.error("❌ Payment error:", err.response?.data || err);
      if (err.response?.data?.payment_method) {
        alert("⚠️ Invalid payment method. Please use Cash, Card, Bank Transfer, Online, or Cheque.");
      } else if (err.response?.data?.amount_paid) {
        alert(`⚠️ ${err.response.data.amount_paid}`);
      } else {
        alert("Payment failed. Check all fields and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalPaid = fees.reduce((sum, f) => sum + parseFloat(f.amount_paid || "0"), 0);
  const totalDue = fees.reduce(
    (sum, f) => sum + parseFloat(f.calculated_remaining_amount || "0"),
    0
  );
  const paidFees = fees.filter((f) => f.status === "Paid").length;
  const pendingFees = fees.filter((f) => f.status !== "Paid").length;

  const handleViewReceipt = (fee: FeeDetails) => {
    setSelectedFee(fee);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = () => window.print();

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* HEADER SECTION */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Fees Management</h1>
              <p className="text-gray-600">Manage your fee payments and track payment history</p>
            </div>
            <button
              onClick={() => {
                console.log("🟢 Pay Fees clicked. Student:", student);
                if (!student) {
                  alert("⚠️ Student data not yet loaded. Please refresh.");
                  return;
                }
                setShowPaymentModal(true);
              }}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* FEE TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  📊 Fee History
                </h2>
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                  {fees.length} records
                </span>
              </div>
            </div>
            
            {fees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fee Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Paid</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remaining</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60">
                    {fees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                              {fee.fee_type?.charAt(0) || 'F'}
                            </div>
                            <span className="font-medium text-gray-900">{fee.fee_type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">₹{fee.structure_amount || fee.total_amount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-green-600">₹{fee.amount_paid}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-red-600">₹{fee.calculated_remaining_amount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              fee.status === "Paid"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {fee.status === "Paid" ? "✅ Paid" : "⏳ Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{fee.payment_date}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewReceipt(fee)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium text-sm"
                          >
                            <span>📄</span>
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
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-500 text-lg mb-2">No fee records found</p>
                <p className="text-gray-400 text-sm">Your fee history will appear here once payments are made</p>
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
    <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-white text-lg`}>
          {icon}
        </div>
      </div>
      <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
      <h3 className={`text-2xl font-bold text-gray-900`}>{value}</h3>
    </div>
  );
};

// ✅ Enhanced Receipt Modal
const ReceiptModal = ({ fee, onClose, onPrint }: any) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Payment Receipt</h2>
        <p className="text-blue-100">Transaction Confirmation</p>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Student Name</p>
            <p className="font-semibold">{fee.student_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fee Type</p>
            <p className="font-semibold">{fee.fee_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-semibold text-lg">₹{fee.structure_amount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Paid Amount</p>
            <p className="font-semibold text-lg text-green-600">₹{fee.amount_paid}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Remaining</p>
            <p className="font-semibold text-red-600">₹{fee.calculated_remaining_amount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
              fee.status === "Paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
            }`}>
              {fee.status}
            </span>
          </div>
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Date:</span>
            <span className="font-medium">{fee.payment_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method:</span>
            <span className="font-medium">{fee.payment_method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction ID:</span>
            <span className="font-mono text-sm">{fee.transaction_id}</span>
          </div>
          {fee.remarks && (
            <div className="flex justify-between">
              <span className="text-gray-500">Remarks:</span>
              <span className="font-medium text-right">{fee.remarks}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
        <button 
          onClick={onClose} 
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Close
        </button>
        <button 
          onClick={onPrint} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          🖨️ Print
        </button>
      </div>
    </div>
  </div>
);

// ✅ Enhanced Payment Modal
const PaymentModal = ({ paymentForm, setPaymentForm, feeStructures, submitting, onClose, onSubmit }: any) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Pay Fees</h2>
        <p className="text-green-100">Complete your payment securely</p>
      </div>
      
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Fee Structure</label>
          <select
            value={paymentForm.fee_structure}
            onChange={(e) => setPaymentForm((p: any) => ({ ...p, fee_structure: parseInt(e.target.value) }))}
            required
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid (₹)</label>
          <input
            type="number"
            name="amount_paid"
            placeholder="Enter amount"
            value={paymentForm.amount_paid}
            onChange={(e) => setPaymentForm((p: any) => ({ ...p, amount_paid: e.target.value }))}
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
          <input
            type="date"
            name="payment_date"
            value={paymentForm.payment_date}
            onChange={(e) => setPaymentForm((p: any) => ({ ...p, payment_date: e.target.value }))}
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <select
            name="payment_method"
            value={paymentForm.payment_method}
            onChange={(e) => setPaymentForm((p: any) => ({ ...p, payment_method: e.target.value }))}
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
          <textarea
            name="remarks"
            placeholder="Any additional notes..."
            value={paymentForm.remarks}
            onChange={(e) => setPaymentForm((p: any) => ({ ...p, remarks: e.target.value }))}
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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