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
  Legend,
  // Cell,
} from "recharts";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

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
  // Extended fields added during data processing
  fee_type?: string;
  class_name?: string;
  section?: string;
  student_full_data?: Student | null;
}

interface FeeStructure {
  id: number;
  fee_type: string;
  amount: string;
}

interface Student {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  class_id: number;
  class_name?: string;
  sec?: string;
  [key: string]: unknown;
}

interface Class {
  id: number;
  class_name: string;
  sec: string;
  [key: string]: unknown;
}

const ManagementFinance = () => {
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [pendingFees, setPendingFees] = useState<FeePayment[]>([]);
  const [paidFees, setPaidFees] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<FeePayment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"paid" | "pending">("paid");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [transportIncome, setTransportIncome] = useState(0);

  // Overall revenue formatting helpers so large numbers fit in the card
  const overallRevenue = totalPaid + totalPending;
  const overallRevenueDisplay = Math.round(overallRevenue).toLocaleString();
  const overallRevenueDigits = overallRevenueDisplay.replace(/\D/g, "").length;

  const totalCollectedDisplay = totalPaid.toFixed(2).toLocaleString();
  const totalCollectedDigits = totalCollectedDisplay.replace(/\D/g, "").length;

  const transportIncomeDisplay = transportIncome.toFixed(2).toLocaleString();
  const transportIncomeDigits = transportIncomeDisplay.replace(/\D/g, "").length;

  let overallRevenueTextClass = "text-2xl sm:text-3xl lg:text-4xl";
  if (overallRevenueDigits > 8) {
    overallRevenueTextClass = "text-xl sm:text-2xl lg:text-3xl";
  }
  if (overallRevenueDigits > 11) {
    overallRevenueTextClass = "text-lg sm:text-xl lg:text-2xl";
  }

  let totalCollectedTextClass = "text-2xl sm:text-3xl lg:text-4xl";
  if (totalCollectedDigits > 8) {
    totalCollectedTextClass = "text-xl sm:text-2xl lg:text-3xl";
  }
  if (totalCollectedDigits > 11) {
    totalCollectedTextClass = "text-lg sm:text-xl lg:text-2xl";
  }

  let transportIncomeTextClass = "text-2xl sm:text-3xl lg:text-4xl";
  if (transportIncomeDigits > 8) {
    transportIncomeTextClass = "text-xl sm:text-2xl lg:text-3xl";
  }
  if (transportIncomeDigits > 11) {
    transportIncomeTextClass = "text-lg sm:text-xl lg:text-2xl";
  }

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);
        const [paymentsRes, structuresRes, studentsRes, classesRes] = await Promise.all([
          axios.get<FeePayment[]>(`${API_BASE}/fee_payments/`),
          axios.get<FeeStructure[]>(`${API_BASE}/fee_structures/`),
          axios.get<Student[]>(`${API_BASE}/students/`),
          axios.get<Class[]>(`${API_BASE}/classes/`),
        ]);

        const paymentsData: FeePayment[] = paymentsRes.data;
        const structuresData: FeeStructure[] = structuresRes.data;
        const studentsData: Student[] = studentsRes.data;
        const classesData: Class[] = classesRes.data || [];

        setPayments(paymentsData);

        // Match fee_structure IDs to get fee_type and total amount
        // Also match student email to get class_name and section
        const mergedData: FeePayment[] = paymentsData.map((pay: FeePayment) => {
          const structure = structuresData.find(
            (s: FeeStructure) => s.id === pay.fee_structure
          );
          const student = studentsData.find(
            (s: Student) => s.email === pay.student
          );
          const classInfo = student?.class_id
            ? classesData.find((c: Class) => c.id === student.class_id)
            : null;

          // Total from fee structure (treat missing/invalid as 0)
          const totalRaw = structure?.amount ?? "0";
          const total = Number(totalRaw) || 0;

          // Paid from payment record (treat missing/invalid as 0)
          const paidRaw = pay.amount_paid ?? "0";
          const paid = Number(paidRaw) || 0;

          // Pending = total - paid, never negative
          const remaining = Math.max(total - paid, 0);

          return {
            ...pay,
            fee_type: structure ? structure.fee_type : "Unknown",
            total_amount: total.toString(),
            remaining_amount: remaining.toString(),
            class_name: classInfo?.class_name || "Unknown",
            section: classInfo?.sec || "Unknown",
            student_full_data: student || null,
          } as FeePayment;
        });

        // Calculate totals
        // Calculate totals accurately across all statuses
        // const transport = mergedData
        //   .filter((p: FeePayment) => p.fee_type === "Transport")
        //   .reduce((sum: number, p: FeePayment) => sum + parseFloat(p.amount_paid || "0"), 0);

        // Extract unique years for the dropdown
        const years = new Set<string>();
        mergedData.forEach(p => {
          if (p.payment_date) {
            const year = p.payment_date.split('-')[0];
            if (year) years.add(year);
          }
        });

        // Ensure current year is always an option
        const currentYear = new Date().getFullYear().toString();
        years.add(currentYear);

        setAvailableYears(Array.from(years).sort((a, b) => b.localeCompare(a)));

        setPayments(mergedData);
      } catch (err) {
        console.error("Error fetching finance data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  // Calculate statistics based on selectedYear
  useEffect(() => {
    if (payments.length === 0) return;

    // Filter to currently selected year
    const yearFilteredData = payments.filter(p => p.payment_date && p.payment_date.startsWith(selectedYear));

    setPaidFees(yearFilteredData.filter((p: FeePayment) => p.status === "Paid"));
    setPendingFees(yearFilteredData.filter((p: FeePayment) => p.remaining_amount && parseFloat(p.remaining_amount.toString()) > 0));

    const studentFeeTotals = new Map<string, { total: number; paid: number; transport: number }>();

    yearFilteredData.forEach(p => {
      const key = `${p.student}-${p.fee_structure}`;
      if (!studentFeeTotals.has(key)) {
        studentFeeTotals.set(key, {
          total: parseFloat(p.total_amount || "0"),
          paid: 0,
          transport: 0
        });
      }
      const entry = studentFeeTotals.get(key)!;
      const paid = parseFloat(p.amount_paid || "0");
      entry.paid += paid;
      if (p.fee_type === "Transport") {
        entry.transport += paid;
      }
    });

    let finalPaid = 0;
    let finalPending = 0;
    let finalTransport = 0;

    studentFeeTotals.forEach(data => {
      finalPaid += data.paid;
      finalPending += Math.max(data.total - data.paid, 0);
      finalTransport += data.transport;
    });

    setTotalPaid(finalPaid);
    setTotalPending(finalPending);
    setTransportIncome(finalTransport);
  }, [payments, selectedYear]);

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
  const handleCardClick = (student: FeePayment) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  // Enhanced Chart Data Processing
  // monthsOrder moved inside useMemo

  const chartData = React.useMemo(() => {
    const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dataByMonth: Record<string, { month: string; collected: number; pending: number }> = {};

    // Initialize all months
    monthsOrder.forEach(m => {
      dataByMonth[m] = { month: m, collected: 0, pending: 0 };
    });

    payments
      .filter(p => p.payment_date && p.payment_date.startsWith(selectedYear))
      .forEach((payment) => {
        if (!payment.payment_date) return;

        // Robust month extraction from YYYY-MM-DD
        const parts = payment.payment_date.split('-');
        if (parts.length < 2) return;
        const monthIndex = parseInt(parts[1]) - 1;
        const monthName = monthsOrder[monthIndex];

        if (!monthName) return;

        const paid = parseFloat(payment.amount_paid || "0");
        const pending = parseFloat(payment.remaining_amount || "0");

        dataByMonth[monthName].collected += paid;
        dataByMonth[monthName].pending += pending;
      });

    return monthsOrder.map(m => dataByMonth[m]);
  }, [payments, selectedYear]);

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">
              💰 Finance Dashboard
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Manage and track all fee payments with beautiful insights
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
            {/* Total Collected */}
            <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 sm:p-8 rounded-[2rem] shadow-xl text-white transform hover:scale-[1.02] transition-all duration-500 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-100 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2">Total Collected</p>
                  <p className={`${totalCollectedTextClass} font-black tracking-tight`}>
                    ₹{totalCollectedDisplay}
                  </p>
                </div>
              </div>
            </div>

            {/* Transport Income */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 sm:p-8 rounded-[2rem] shadow-xl text-white transform hover:scale-[1.02] transition-all duration-500 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2">Transport Income</p>
                  <p className={`${transportIncomeTextClass} font-black tracking-tight`}>
                    ₹{transportIncomeDisplay}
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Revenue */}
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 sm:p-8 rounded-[2rem] shadow-xl text-white transform hover:scale-[1.02] transition-all duration-500 relative overflow-hidden group md:col-span-2 lg:col-span-1">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2">Overall Revenue</p>
                  <p className={`${overallRevenueTextClass} font-black tracking-tight`}
                  >
                    ₹{overallRevenueDisplay}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <span className="bg-indigo-100 p-2 rounded-xl mr-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              Monthly Fee Collection Trend
            </h2>
            <div className="h-[300px] sm:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    dy={10}
                    // Show every month but slant them on small screens to avoid overlap
                    angle={typeof window !== 'undefined' && window.innerWidth < 640 ? -45 : 0}
                    textAnchor={typeof window !== 'undefined' && window.innerWidth < 640 ? "end" : "middle"}
                    height={60}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const collected = payload.find(p => p.dataKey === 'collected')?.value as number || 0;
                        const pending = payload.find(p => p.dataKey === 'pending')?.value as number || 0;
                        const total = collected + pending;

                        return (
                          <div className="bg-white p-4 rounded-2xl shadow-xl border-none">
                            <p className="text-gray-900 font-bold mb-2 border-b pb-1">{label}</p>
                            <div className="space-y-1.5">
                              <div className="flex justify-between gap-8">
                                <span className="text-gray-500 text-sm">Total Amount:</span>
                                <span className="text-gray-900 font-bold text-sm">₹{total.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between gap-8">
                                <span className="text-emerald-500 text-sm font-medium">Paid Amount:</span>
                                <span className="text-emerald-600 font-bold text-sm">₹{collected.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between gap-8">
                                <span className="text-rose-500 text-sm font-medium">Remaining Amount:</span>
                                <span className="text-rose-600 font-bold text-sm">₹{pending.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '20px' }}
                  />
                  <Bar
                    name="Collected Fees"
                    dataKey="collected"
                    fill="url(#collectedGradient)"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                    animationDuration={1500}
                  />
                  <Bar
                    name="Pending Fees"
                    dataKey="pending"
                    fill="url(#pendingGradient)"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                    animationDuration={1500}
                  />
                  <defs>
                    <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Tabs */}
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setActiveTab("paid")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "paid"
                    ? "bg-white text-green-600 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  ✅ Paid Fees ({paidFees.length})
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Year Filter */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 font-medium">Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium text-sm transition-all"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Filter */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 font-medium">Class:</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium text-sm transition-all"
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
          </div>

          {/* Student Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${activeTab === "paid"
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
                        {activeTab === "paid"
                          ? `₹${parseFloat(student.amount_paid).toLocaleString()}`
                          : `₹${(student.remaining_amount ?? 0).toLocaleString()}`}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform scale-100 transition-all">
              <div className={`h-3 ${activeTab === "paid" ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-red-400 to-red-600"}`}></div>

              <div className="p-5 sm:p-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Student Fee Details</h2>
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
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${activeTab === "paid"
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
                            width: `${((parseFloat(selectedStudent.amount_paid) / (parseFloat(selectedStudent.total_amount || "0") || 1)) * 100).toFixed(1)}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {((parseFloat(selectedStudent.amount_paid) / (parseFloat(selectedStudent.total_amount || "0") || 1)) * 100).toFixed(1)}% Paid
                        </span>
                        <span className="font-semibold text-gray-900">
                          {parseFloat(selectedStudent.remaining_amount || "0") > 0 ? 'Partial' : 'Complete'}
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
