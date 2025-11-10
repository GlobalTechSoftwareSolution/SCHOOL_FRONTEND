"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  CreditCard,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  Search,
  Eye,
  FileText,
  Calendar,
  IndianRupee,
  Receipt,
  ChevronDown,
  ChevronUp,
  User,
  BarChart3,
  Percent,
  AlertCircle
} from "lucide-react";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

interface FeePayment {
  id?: number;
  student?: string;
  student_name?: string;
  fee_type?: string;
  amount_paid?: string | number;
  total_amount?: string | number | null;
  remaining_amount?: string | number | null;
  payment_date?: string;
  payment_method?: string;
  transaction_id?: string;
  remarks?: string;
  status?: string;
}

const ParentFeePayments = () => {
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentEmail, setParentEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feeTypeFilter, setFeeTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedPayment, setExpandedPayment] = useState<number | null>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    student: "",
    student_name: "",
    fee_type: "",
    amount_paid: "",
    total_amount: "",
    payment_method: "Online",
    transaction_id: "",
    remarks: "",
    payment_date: new Date().toISOString().split('T')[0]
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const email = userData?.email || "";
    if (email) {
      setParentEmail(email);
      fetchParentAndPayments(email);
    } else {
      console.warn("⚠️ No parent email found in localStorage");
      setLoading(false);
    }
  }, []);

  const fetchParentAndPayments = async (email: string) => {
    try {
      const { data: parents } = await axios.get(`${API_BASE}/parents/`);
      const currentParent = parents.find(
        (p: any) => p.email === email
      );

      if (!currentParent) {
        console.warn("⚠️ Parent not found:", email);
        setLoading(false);
        return;
      }

      const childEmails: string[] =
        currentParent.children_list?.map((child: any) => child.email?.trim() || "") || [];

      // Store children data for display
      setChildren(currentParent.children_list || []);

      if (childEmails.length === 0) {
        console.warn("⚠️ No children found for this parent");
        setLoading(false);
        return;
      }

      const { data: allPayments } = await axios.get(`${API_BASE}/fee_payments/`);

      const filteredPayments = allPayments
        .filter((payment: FeePayment) =>
          payment.student && childEmails.includes(payment.student.trim())
        )
        .map((p: FeePayment) => {
          const total = Number(p.total_amount) || 0;
          const paid = Number(p.amount_paid) || 0;
          const remaining =
            p.remaining_amount !== null && p.remaining_amount !== undefined
              ? Number(p.remaining_amount)
              : total - paid > 0
              ? total - paid
              : 0;
          return {
            ...p,
            total_amount: total || paid + remaining,
            remaining_amount: remaining,
          };
        });

      setFeePayments(filteredPayments);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStats = () => {
    const totalPayments = feePayments.length;
    const totalPaid = feePayments.filter((p) => p.status === "Paid").length;
    const totalPending = feePayments.filter((p) => p.status === "Pending").length;
    const totalFailed = feePayments.filter((p) => p.status === "Failed").length;

    const totalAmount = feePayments.reduce(
      (sum, p) => sum + (Number(p.total_amount) || 0),
      0
    );
    const amount_paid = feePayments.reduce(
      (sum, p) => sum + (Number(p.amount_paid) || 0),
      0
    );
    const totalRemaining = totalAmount - amount_paid;

    return {
      totalPayments,
      totalPaid,
      totalPending,
      totalFailed,
      totalAmount: Math.round(totalAmount),
      amount_paid: Math.round(amount_paid),
      totalRemaining: Math.round(totalRemaining),
      paidPercentage:
        totalAmount > 0 ? Math.round((amount_paid / totalAmount) * 100) : 0,
    };
  };

  const stats = getPaymentStats();

  // Get unique fee types and children for filters
  const uniqueFeeTypes = [...new Set(feePayments.map(p => p.fee_type))];
  const uniqueChildren = [...new Set(feePayments.map(p => p.student_name))];

  const filteredPayments = feePayments.filter((payment) => {
    const matchesSearch =
      payment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.fee_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesFeeType =
      feeTypeFilter === "all" || payment.fee_type === feeTypeFilter;
    const matchesDate = !dateFilter || payment.payment_date === dateFilter;

    return matchesSearch && matchesStatus && matchesFeeType && matchesDate;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-50 text-green-700 border-green-200";
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "Failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Handle payment submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);

    try {
      const paymentData = {
        ...newPayment,
        amount_paid: Number(newPayment.amount_paid),
        total_amount: Number(newPayment.total_amount),
        remaining_amount: Number(newPayment.total_amount) - Number(newPayment.amount_paid),
        status: Number(newPayment.total_amount) - Number(newPayment.amount_paid) <= 0 ? "Paid" : "Pending"
      };

      const response = await axios.post(`${API_BASE}/fee_payments/`, paymentData);
      
      if (response.data) {
        // Add the new payment to the list
        setFeePayments(prev => [response.data, ...prev]);
        
        // Reset form and close modal
        setNewPayment({
          student: "",
          student_name: "",
          fee_type: "",
          amount_paid: "",
          total_amount: "",
          payment_method: "Online",
          transaction_id: "",
          remarks: "",
          payment_date: new Date().toISOString().split('T')[0]
        });
        setShowPaymentModal(false);
        
        alert("Payment added successfully!");
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Failed to add payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle student selection
  const handleStudentSelect = (studentEmail: string) => {
    const selectedChild = children.find(child => child.email === studentEmail);
    if (selectedChild) {
      setNewPayment(prev => ({
        ...prev,
        student: studentEmail,
        student_name: selectedChild.fullname
      }));
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="parents">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading fee payments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parents">
      <div className="min-h-screen bg-gray-50/30 p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Payments</h1>
            <p className="text-gray-600 mt-2">Track and manage your children's fee payments</p>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <CreditCard className="h-5 w-5" />
            Add Payment
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalPayments}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">₹{stats.amount_paid}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">{stats.paidPercentage}% paid</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">₹{stats.totalRemaining}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fee</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">₹{stats.totalAmount}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <IndianRupee className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Payment Progress</h3>
            <span className="text-sm font-medium text-gray-600">{stats.paidPercentage}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(stats.paidPercentage)}`}
              style={{ width: `${stats.paidPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>₹0</span>
            <span>₹{stats.totalAmount}</span>
          </div>
        </div>

        {/* Children Overview */}
        {children.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <User className="h-6 w-6 text-blue-600" />
              Your Children ({children.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child, index) => {
                const childPayments = feePayments.filter(p => p.student === child.email);
                const childTotal = childPayments.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);
                const childPaid = childPayments.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0);
                const childPercentage = childTotal > 0 ? Math.round((childPaid / childTotal) * 100) : 0;
                
                return (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{child.fullname}</h3>
                        <div className="flex flex-col-2">
                          <p className="text-sm text-gray-600">{child.class_name}</p>
                        <p className="text-sm text-gray-600 ml-3">{child.section}  Section</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-semibold text-green-600">₹{Math.round(childPaid)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold">₹{Math.round(childTotal)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(childPercentage)}`}
                          style={{ width: `${childPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by student name, fee type, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>

              <select
                value={feeTypeFilter}
                onChange={(e) => setFeeTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Fee Types</option>
                {uniqueFeeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Receipt className="h-6 w-6 text-blue-600" />
              Payment Records
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {filteredPayments.length} records
              </span>
            </h2>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feePayments.length === 0 ? "No Fee Payments Found" : "No Matching Payments"}
              </h3>
              <p className="text-gray-600">
                {feePayments.length === 0 
                  ? "No fee payment records found for your children."
                  : "Try adjusting your search or filters to find what you're looking for."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPayments.map((payment, index) => (
                <div
                  key={payment.id || index}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedPayment(expandedPayment === index ? null : index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{payment.student_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{payment.fee_type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4" />
                            <span className="font-semibold text-green-600">₹{payment.amount_paid}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span>{payment.payment_method || "N/A"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Total: ₹{payment.total_amount}</span>
                          <span>Remaining: ₹{payment.remaining_amount}</span>
                          {payment.transaction_id && (
                            <span>Transaction: {payment.transaction_id}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPayment(expandedPayment === index ? null : index);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {expandedPayment === index ? 
                          <ChevronUp className="h-4 w-4 text-gray-600" /> : 
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedPayment === index && (
                    <div className="mt-4 pl-9 border-t pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Student Email:</span>
                              <span className="text-gray-900 font-medium">{payment.student}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Method:</span>
                              <span className="text-gray-900 font-medium">{payment.payment_method || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Transaction ID:</span>
                              <span className="text-gray-900 font-medium">{payment.transaction_id || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Date:</span>
                              <span className="text-gray-900 font-medium">
                                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Amount Breakdown</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Amount:</span>
                              <span className="font-semibold">₹{payment.total_amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount Paid:</span>
                              <span className="font-semibold text-green-600">₹{payment.amount_paid}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Remaining:</span>
                              <span className="font-semibold text-yellow-600">₹{payment.remaining_amount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {payment.remarks && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Remarks</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                            {payment.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredPayments.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredPayments.length}</span> of{" "}
                  <span className="font-semibold">{feePayments.length}</span> payments
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Paid: {stats.totalPaid}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Pending: {stats.totalPending}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Failed: {stats.totalFailed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Add Payment</h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student *
                  </label>
                  <select
                    value={newPayment.student}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose a student</option>
                    {children.map((child) => (
                      <option key={child.email} value={child.email}>
                        {child.fullname} ({child.class_name} - {child.section})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fee Type and Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fee Type *
                    </label>
                    <input
                      type="text"
                      value={newPayment.fee_type}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, fee_type: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Tuition Fee, Exam Fee"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Amount *
                    </label>
                    <input
                      type="number"
                      value={newPayment.total_amount}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, total_amount: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Amount Paid and Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Paid *
                    </label>
                    <input
                      type="number"
                      value={newPayment.amount_paid}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, amount_paid: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      value={newPayment.payment_method}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, payment_method: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Online">Online</option>
                      <option value="Cash">Cash</option>
                      <option value="Check">Check</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>

                {/* Transaction ID and Payment Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={newPayment.transaction_id}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, transaction_id: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter transaction ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      value={newPayment.payment_date}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, payment_date: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={newPayment.remarks}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, remarks: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Add any additional notes..."
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentLoading ? "Processing..." : "Add Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ParentFeePayments;