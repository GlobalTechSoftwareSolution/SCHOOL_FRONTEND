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

        const studentName = studentData.fullname || studentData.name;

        const filteredFees = feesRes.data
          .filter((f: FeeDetails) =>
            f.student_name?.toLowerCase().trim() === studentName?.toLowerCase().trim()
          )
          .map((f: FeeDetails) => {
            const matchedStructure = structures.find((fs) => fs.id === f.fee_structure);
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
      payment_method: paymentForm.payment_method, // must be 'Cash', 'Card', 'Online', etc.
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
        <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
          Loading fees...
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Fees Management</h1>
         <button
  onClick={() => {
    console.log("🟢 Pay Fees clicked. Student:", student);
    if (!student) {
      alert("⚠️ Student data not yet loaded. Please refresh.");
      return;
    }

    // even if feeStructures are empty, allow modal open
    if (!feeStructures.length) {
      console.warn("⚠️ No fee structures found, but opening modal for manual entry.");
    }

    setShowPaymentModal(true);
  }}
  className={`px-6 py-3 rounded-lg font-semibold transition ${
    !student
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700 text-white"
  }`}
  disabled={!student}
>
  Pay Fees
</button>

          </div>

          {/* SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SummaryCard title="Total Paid" value={`₹${totalPaid.toFixed(2)}`} color="green" />
            <SummaryCard title="Total Due" value={`₹${totalDue.toFixed(2)}`} color="red" />
            <SummaryCard title="Paid Fees" value={paidFees} color="blue" />
            <SummaryCard title="Pending Fees" value={pendingFees} color="orange" />
          </div>

          {/* FEE TABLE */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Fee History</h2>
            </div>
            {fees.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-6 py-3">Fee Type</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Paid</th>
                    <th className="px-6 py-3">Remaining</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Payment Date</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{fee.fee_type}</td>
                      <td className="px-6 py-4">₹{fee.structure_amount || fee.total_amount}</td>
                      <td className="px-6 py-4 text-green-600">₹{fee.amount_paid}</td>
                      <td className="px-6 py-4 text-red-600">₹{fee.calculated_remaining_amount}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            fee.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{fee.payment_date}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewReceipt(fee)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-6 text-gray-500">No fee records found.</p>
            )}
          </div>
        </div>

        {/* RECEIPT MODAL */}
        {showReceiptModal && selectedFee && (
          <ReceiptModal fee={selectedFee} onClose={() => setShowReceiptModal(false)} onPrint={handlePrintReceipt} />
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

// ✅ Helper Components
const SummaryCard = ({ title, value, color }: any) => (
  <div className="bg-white rounded-xl p-6 border shadow-sm">
    <p className="text-gray-600">{title}</p>
    <h3 className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</h3>
  </div>
);

const ReceiptModal = ({ fee, onClose, onPrint }: any) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Payment Receipt</h2>
      <div className="space-y-2 text-gray-800">
        <p><strong>Student:</strong> {fee.student_name}</p>
        <p><strong>Fee Type:</strong> {fee.fee_type}</p>
        <p><strong>Total Amount:</strong> ₹{fee.structure_amount}</p>
        <p><strong>Paid Amount:</strong> ₹{fee.amount_paid}</p>
        <p><strong>Remaining:</strong> ₹{fee.calculated_remaining_amount}</p>
        <p><strong>Payment Date:</strong> {fee.payment_date}</p>
        <p><strong>Status:</strong> {fee.status}</p>
        <p><strong>Method:</strong> {fee.payment_method}</p>
        <p><strong>Transaction ID:</strong> {fee.transaction_id}</p>
        {fee.remarks && <p><strong>Remarks:</strong> {fee.remarks}</p>}
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Close</button>
        <button onClick={onPrint} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Print
        </button>
      </div>
    </div>
  </div>
);

const PaymentModal = ({ paymentForm, setPaymentForm, feeStructures, submitting, onClose, onSubmit }: any) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Pay Fees</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 font-medium">Select Fee Structure</label>
          <select
            value={paymentForm.fee_structure}
            onChange={(e) => setPaymentForm((p: any) => ({ ...p, fee_structure: parseInt(e.target.value) }))}
            required
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select...</option>
            {feeStructures.map((fs: FeeStructure) => (
              <option key={fs.id} value={fs.id}>{fs.fee_type} - ₹{fs.amount}</option>
            ))}
          </select>
        </div>

        <input
          type="number"
          name="amount_paid"
          placeholder="Amount Paid (₹)"
          value={paymentForm.amount_paid}
          onChange={(e) => setPaymentForm((p: any) => ({ ...p, amount_paid: e.target.value }))}
          className="w-full border rounded-lg p-2"
          required
        />

        <input
          type="date"
          name="payment_date"
          value={paymentForm.payment_date}
          onChange={(e) => setPaymentForm((p: any) => ({ ...p, payment_date: e.target.value }))}
          className="w-full border rounded-lg p-2"
          required
        />
<select
  name="payment_method"
  value={paymentForm.payment_method}
  onChange={(e) => setPaymentForm((p: any) => ({ ...p, payment_method: e.target.value }))}
  className="w-full border rounded-lg p-2"
  required
>
  <option value="">Select Payment Method</option>
  <option value="Cash">Cash</option>
  <option value="Card">Card</option>
  <option value="Bank Transfer">Bank Transfer</option>
  <option value="Online">Online</option>
  <option value="Cheque">Cheque</option>
</select>


        <textarea
          name="remarks"
          placeholder="Remarks (optional)"
          value={paymentForm.remarks}
          onChange={(e) => setPaymentForm((p: any) => ({ ...p, remarks: e.target.value }))}
          className="w-full border rounded-lg p-2"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 rounded-lg">Cancel</button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {submitting ? "Processing..." : "Submit Payment"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default StudentFeesPage;
