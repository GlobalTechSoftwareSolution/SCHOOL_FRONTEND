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
  AlertCircle,
  Plus,
  Wallet,
  Target,
  PieChart,
  Shield,
  Zap,
  Sparkles,
  Crown,
  Star,
  Award,
  Rocket,
  Gem
} from "lucide-react";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

interface FeeStructure {
  id: number;
  fee_type: string;
  amount: string;
}

interface FeePayment {
  id?: number;
  student?: string;
  student_name?: string;
  fee_structure?: number;
  fee_type?: string;
  amount_paid?: string | number;
  total_amount?: string | number | null;
  remaining_amount?: string | number | null;
  payment_date?: string;
  payment_method?: string;
  transaction_id?: string;
  remarks?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

const ParentFeePayments = () => {
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
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
    fee_structure: "",
    fee_type: "",
    amount_paid: "",
    total_amount: "",
    payment_method: "Cash",
    transaction_id: "",
    remarks: "",
    payment_date: new Date().toISOString().split('T')[0]
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [activeView, setActiveView] = useState("overview");

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
      const [{ data: parents }, { data: students }] = await Promise.all([
        axios.get(`${API_BASE}/parents/`),
        axios.get(`${API_BASE}/students/`)
      ]);
      
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

      // Merge profile pictures from students API
      const childrenWithProfiles = (currentParent.children_list || []).map((child: any) => {
        const studentData = students.find((s: any) => s.email === child.email);
        const profilePic = studentData?.profile_picture || "";
        console.log("profile_picture:", profilePic, "for child:", child.fullname);
        return {
          ...child,
          profile_picture: profilePic
        };
      });

      // Store children data with profile pictures
      setChildren(childrenWithProfiles);

      if (childEmails.length === 0) {
        console.warn("⚠️ No children found for this parent");
        setLoading(false);
        return;
      }

      // Fetch both payments and fee structures
      const [paymentsRes, structuresRes] = await Promise.all([
        axios.get(`${API_BASE}/fee_payments/`),
        axios.get(`${API_BASE}/fee_structures/`)
      ]);

      const allPayments: FeePayment[] = paymentsRes.data;
      const structures: FeeStructure[] = structuresRes.data;
      
      // Store fee structures for the payment form
      setFeeStructures(structures);

      const filteredPayments = allPayments
        .filter((payment: FeePayment) =>
          payment.student && childEmails.includes(payment.student.trim())
        )
        .map((p: FeePayment) => {
          // Find the fee structure for this payment
          const structure = structures.find(s => s.id === p.fee_structure);
          const total = Number(p.total_amount) || Number(structure?.amount) || 0;
          const paid = Number(p.amount_paid) || 0;
          const remaining =
            p.remaining_amount !== null && p.remaining_amount !== undefined
              ? Number(p.remaining_amount)
              : total - paid > 0
              ? total - paid
              : 0;
          return {
            ...p,
            fee_type: structure?.fee_type || "Unknown",
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
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Failed":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case "Pending":
        return <Clock className="h-5 w-5 text-amber-600" />;
      case "Failed":
        return <XCircle className="h-5 w-5 text-rose-600" />;
      default:
        return <FileText className="h-5 w-5 text-slate-600" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-gradient-to-r from-emerald-500 to-green-500";
    if (percentage >= 50) return "bg-gradient-to-r from-amber-500 to-orange-500";
    return "bg-gradient-to-r from-rose-500 to-red-500";
  };

  // Handle payment submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);

    try {
      const paymentData = {
        student: newPayment.student,
        fee_structure: Number(newPayment.fee_structure),
        amount_paid: Number(newPayment.amount_paid),
        payment_method: newPayment.payment_method,
        transaction_id: newPayment.transaction_id || null,
        remarks: newPayment.remarks || null,
        payment_date: newPayment.payment_date,
        status: "Paid"
      };

      const response = await axios.post(`${API_BASE}/fee_payments/`, paymentData);
      
      if (response.data) {
        // Add the new payment to the list
        setFeePayments(prev => [response.data, ...prev]);
        
        // Reset form and close modal
        setNewPayment({
          student: "",
          student_name: "",
          fee_structure: "",
          fee_type: "",
          amount_paid: "",
          total_amount: "",
          payment_method: "Cash",
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

  // Handle fee structure selection
  const handleFeeStructureSelect = (feeStructureId: string) => {
    const selectedStructure = feeStructures.find(fs => fs.id === Number(feeStructureId));
    if (selectedStructure) {
      setNewPayment(prev => ({
        ...prev,
        fee_structure: feeStructureId,
        fee_type: selectedStructure.fee_type,
        total_amount: selectedStructure.amount
      }));
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="parents">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <Wallet className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-600 font-medium text-lg">Loading fee payments...</p>
            <p className="text-gray-400 text-sm mt-2">Getting everything ready for you</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parents">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <Wallet className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-blue-900 bg-clip-text text-transparent">
                    Fee Payments
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">Track and manage your children's fee payments with ease</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setActiveView(activeView === "overview" ? "analytics" : "overview")}
                className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium shadow-sm hover:shadow-md border border-gray-200/60"
              >
                <BarChart3 className="h-5 w-5" />
                {activeView === "overview" ? "View Analytics" : "View Overview"}
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                Add Payment
              </button>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-gray-200/60 mb-8 w-fit">
          {[
            { id: "overview", label: "📊 Overview", icon: PieChart },
            { id: "analytics", label: "📈 Analytics", icon: BarChart3 },
            { id: "children", label: "👨‍👩‍👧‍👦 Children", icon: User }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                activeView === tab.id
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-inner border border-blue-200/50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Statistics Cards - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-sm border border-blue-200/30 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPayments}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-600 font-medium">All transactions</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl shadow-sm border border-emerald-200/30 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.amount_paid}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <Target className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-600 font-medium">{stats.paidPercentage}% completed</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-2xl shadow-sm border border-amber-200/30 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalRemaining}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">Pending balance</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl shadow-sm border border-purple-200/30 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fee</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalAmount}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <IndianRupee className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <Gem className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-purple-600 font-medium">Total due</span>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-sm border border-slate-200/60 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Rocket className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Payment Progress</h3>
                <p className="text-sm text-gray-600">Overall completion status</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{stats.paidPercentage}%</span>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
          </div>
          <div className="w-full bg-gray-200/50 rounded-full h-4 shadow-inner">
            <div 
              className={`h-4 rounded-full shadow-lg transition-all duration-1000 ease-out ${getProgressColor(stats.paidPercentage)}`}
              style={{ width: `${stats.paidPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-3">
            <span className="flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              ₹0
            </span>
            <span className="flex items-center gap-1">
              <Crown className="h-4 w-4" />
              ₹{stats.totalAmount}
            </span>
          </div>
        </div>

        {/* Children Overview - Enhanced */}
        {children.length > 0 && (
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-sm border border-blue-200/30 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <User className="h-6 w-6 text-white" />
                </div>
                Your Children ({children.length})
              </h2>
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                👨‍👩‍👧‍👦 Family
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child, index) => {
                const childPayments = feePayments.filter(p => p.student === child.email);
                const childTotal = childPayments.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);
                const childPaid = childPayments.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0);
                const childPercentage = childTotal > 0 ? Math.round((childPaid / childTotal) * 100) : 0;
                const paidPayments = childPayments.filter(p => p.status === "Paid").length;
                
                return (
                  <div key={index} className="bg-white rounded-xl border border-gray-200/60 p-5 hover:shadow-lg transition-all duration-300 group hover:border-blue-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                            {child.profile_picture ? (
                              <img
                                src={child.profile_picture}
                                alt={child.fullname}
                                className="w-12 h-12 object-cover"
                              />
                            ) : (
                              child.fullname?.charAt(0) || 'C'
                            )}
                          </div>
                          {childPercentage === 100 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{child.fullname}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Class {child.class_name}</span>
                            <span>•</span>
                            <span>Sec {child.section}</span>
                          </div>
                          {child.profile_picture && (
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">profile_picture: {child.profile_picture}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          childPercentage === 100 ? 'bg-emerald-100 text-emerald-700' :
                          childPercentage >= 50 ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {childPercentage}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-semibold text-emerald-600">₹{Math.round(childPaid)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold">₹{Math.round(childTotal)}</span>
                      </div>
                      <div className="w-full bg-gray-200/50 rounded-full h-2 shadow-inner">
                        <div 
                          className={`h-2 rounded-full shadow-sm transition-all duration-500 ${getProgressColor(childPercentage)}`}
                          style={{ width: `${childPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{paidPayments} paid payments</span>
                        <span>{childPayments.length - paidPayments} pending</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced Filters and Search */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-sm border border-slate-200/60 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by student name, fee type, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm appearance-none transition-all duration-300"
                >
                  <option value="all">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <select
                value={feeTypeFilter}
                onChange={(e) => setFeeTypeFilter(e.target.value)}
                className="px-4 py-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
              >
                <option value="all">All Fee Types</option>
                {uniqueFeeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 pr-4 py-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Payments List */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-gray-200/60 flex items-center justify-between bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Records</h2>
                <p className="text-gray-600">Detailed transaction history</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-2 rounded-full font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {filteredPayments.length} records
              </span>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feePayments.length === 0 ? "No Fee Payments Found" : "No Matching Payments"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {feePayments.length === 0 
                  ? "Start by adding your first payment to track your children's fee payments."
                  : "Try adjusting your search criteria or filters to find what you're looking for."
                }
              </p>
              {feePayments.length === 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Add First Payment
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200/60">
              {filteredPayments.map((payment, index) => (
                <div
                  key={payment.id || index}
                  className="p-6 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer group"
                  onClick={() => setExpandedPayment(expandedPayment === index ? null : index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1 transform group-hover:scale-110 transition-transform duration-300">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-900 transition-colors">
                            {payment.student_name}
                          </h3>
                          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${getStatusColor(payment.status)} group-hover:shadow-sm transition-all duration-300`}>
                            {payment.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{payment.fee_type}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg">
                            <IndianRupee className="h-4 w-4 text-emerald-500" />
                            <span className="font-bold text-emerald-600">₹{payment.amount_paid}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-amber-500" />
                            <span>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg">
                            <CreditCard className="h-4 w-4 text-purple-500" />
                            <span>{payment.payment_method || "N/A"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="bg-slate-100 px-2 py-1 rounded">Total: ₹{payment.total_amount}</span>
                          <span className="bg-amber-100 px-2 py-1 rounded">Remaining: ₹{payment.remaining_amount}</span>
                          {payment.transaction_id && (
                            <span className="bg-blue-100 px-2 py-1 rounded">TXN: {payment.transaction_id}</span>
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
                        className="p-2 hover:bg-white rounded-xl transition-colors duration-300 group-hover:bg-white/80"
                      >
                        {expandedPayment === index ? 
                          <ChevronUp className="h-5 w-5 text-gray-600" /> : 
                          <ChevronDown className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Expanded Details */}
                  {expandedPayment === index && (
                    <div className="mt-6 pl-12 border-t border-gray-200/60 pt-6 bg-white/50 rounded-xl p-4">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-500" />
                            Payment Details
                          </h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
                              <span className="text-gray-600 font-medium">Student Email:</span>
                              <span className="text-gray-900 font-semibold">{payment.student}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
                              <span className="text-gray-600 font-medium">Payment Method:</span>
                              <span className="text-gray-900 font-semibold">{payment.payment_method || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
                              <span className="text-gray-600 font-medium">Transaction ID:</span>
                              <span className="text-gray-900 font-mono text-sm">{payment.transaction_id || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 font-medium">Payment Date:</span>
                              <span className="text-gray-900 font-semibold">
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
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-amber-500" />
                            Amount Breakdown
                          </h4>
                          <div className="space-y-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-4">
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 font-medium">Total Amount:</span>
                              <span className="font-bold text-lg">₹{payment.total_amount}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 font-medium">Amount Paid:</span>
                              <span className="font-bold text-lg text-emerald-600">₹{payment.amount_paid}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 font-medium">Remaining:</span>
                              <span className="font-bold text-lg text-amber-600">₹{payment.remaining_amount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {payment.remarks && (
                        <div className="mt-6">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Star className="h-5 w-5 text-purple-500" />
                            Remarks
                          </h4>
                          <p className="text-gray-700 bg-white/80 p-4 rounded-xl border border-gray-200/60 text-sm leading-relaxed">
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

        {/* Enhanced Summary Footer */}
        {filteredPayments.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-sm border border-emerald-200/30 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <Award className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Showing <span className="font-bold text-gray-900">{filteredPayments.length}</span> of{" "}
                    <span className="font-bold text-gray-900">{feePayments.length}</span> payments
                  </p>
                  <p className="text-xs text-gray-500">Last updated just now</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                  <span className="text-sm text-gray-600">Paid: <span className="font-semibold">{stats.totalPaid}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
                  <span className="text-sm text-gray-600">Pending: <span className="font-semibold">{stats.totalPending}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-500 rounded-full shadow-sm"></div>
                  <span className="text-sm text-gray-600">Failed: <span className="font-semibold">{stats.totalFailed}</span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200/60">
              <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-blue-50 to-purple-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Add New Payment</h2>
                      <p className="text-gray-600">Record a new fee payment for your child</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 hover:bg-white rounded-xl transition-colors duration-300"
                  >
                    <XCircle className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
                {/* Student Selection */}
                <div>
                  <label className="flex text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Select Student *
                  </label>
                  <select
                    value={newPayment.student}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className="w-full p-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      Fee Type *
                    </label>
                    <select
                      value={newPayment.fee_structure}
                      onChange={(e) => handleFeeStructureSelect(e.target.value)}
                      className="w-full p-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300"
                      required
                    >
                      <option value="">Select fee type</option>
                      {feeStructures.map((structure) => (
                        <option key={structure.id} value={structure.id}>
                          {structure.fee_type} (₹{structure.amount})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-emerald-500" />
                      Total Amount *
                    </label>
                    <input
                      type="number"
                      value={newPayment.total_amount}
                      readOnly
                      className="w-full p-4 border border-gray-300/60 rounded-xl bg-gray-50/50 text-gray-600 font-semibold transition-all duration-300"
                      placeholder="Auto-filled from fee structure"
                    />
                  </div>
                </div>

                {/* Amount Paid and Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                      <Wallet className="h-4 w-4 text-green-500" />
                      Amount Paid *
                    </label>
                    <input
                      type="number"
                      value={newPayment.amount_paid}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, amount_paid: e.target.value }))}
                      className="w-full p-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                      <CreditCard className="h-4 w-4 text-amber-500" />
                      Payment Method *
                    </label>
                    <select
                      value={newPayment.payment_method}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, payment_method: e.target.value }))}
                      className="w-full p-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300"
                      required
                    >
                      <option value="Cash">💵 Cash</option>
                      <option value="Card">💳 Card</option>
                      <option value="Bank Transfer">🏦 Bank Transfer</option>
                      <option value="Online">🌐 Online Payment</option>
                      <option value="Cheque">📄 Cheque</option>
                    </select>
                  </div>
                </div>

                {/* Transaction ID and Payment Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                      <Receipt className="h-4 w-4 text-blue-500" />
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={newPayment.transaction_id}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, transaction_id: e.target.value }))}
                      className="w-full p-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300"
                      placeholder="Enter transaction ID"
                    />
                  </div>

                  <div>
                    <label className="flex text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      value={newPayment.payment_date}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, payment_date: e.target.value }))}
                      className="w-full p-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="flex text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    Remarks
                  </label>
                  <textarea
                    value={newPayment.remarks}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, remarks: e.target.value }))}
                    className="w-full p-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300"
                    rows={3}
                    placeholder="Add any additional notes or remarks about this payment..."
                  ></textarea>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200/60">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Add Payment
                      </>
                    )}
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