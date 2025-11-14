"use client";
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/app/components/DashboardLayout";
import axios from "axios";
import { 
  DollarSign, 
  Users, 
  UserCheck, 
  Clock, 
  Calendar,
  BarChart3
} from "lucide-react";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

const ManagementDashboard = () => {
  const [dashboardData, setDashboardData] = useState<{
    overview?: {
      totalStudents: number;
      totalTeachers: number;
      totalClasses: number;
      totalRevenue: number;
      pendingFees: number;
      attendanceRate: number;
      passPercentage: number;
    };
    departmentFees?: {
      [key: string]: {
        department: string;
        totalFees: number;
        paidFees: number;
        pendingFees: number;
        feeCount: number;
        averageFee: number;
        feeTypes: string[];
      };
    };
    recentActivities?: Array<{
      id: number;
      type: string;
      message: string;
      time: string;
      icon: string;
      fullData?: any; // Store complete data for each activity
    }>;
    quickStats?: {
      pendingFees: number;
      newAdmissions: number;
      pendingApprovals: number;
      totalNotices: number;
    };
    chartData?: {
      revenue: number[];
      students: number[];
      expenses: number[];
    };
  }>({});
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);

  // Format amounts in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format large amounts in lakhs/crores
  const formatLargeAmount = (amount: number) => {
    if (amount >= 10000000) { // 1 Crore or more
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) { // 1 Lakh or more
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return formatCurrency(amount);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch only available APIs with error handling for each
        const apiCalls = [
          axios.get(`${API_BASE}/students/`).catch(err => { console.log('Students API not available'); return { data: [] }; }),
          axios.get(`${API_BASE}/teachers/`).catch(err => { console.log('Teachers API not available'); return { data: [] }; }),
          axios.get(`${API_BASE}/fee_payments/`).catch(err => { console.log('Fee Payments API not available'); return { data: [] }; }),
          axios.get(`${API_BASE}/fee_structures/`).catch(err => { console.log('Fee Structures API not available'); return { data: [] }; }),
          axios.get(`${API_BASE}/activities/`).catch(err => { console.log('Activities API not available'); return { data: [] }; }),
          axios.get(`${API_BASE}/attendance/`).catch(err => { console.log('Attendance API not available'); return { data: [] }; }),
          axios.get(`${API_BASE}/classes/`).catch(err => { console.log('Classes API not available'); return { data: [] }; }),
          axios.get(`${API_BASE}/grades/`).catch(err => { console.log('Grades API not available'); return { data: [] }; }),
          axios.get(`${API_BASE}/reports/`).catch(err => { console.log('Reports API not available'); return { data: [] }; }),
          axios.get(`${API_BASE}/notices/`).catch(err => { console.log('Notices API not available'); return { data: [] }; })
        ];

        const [
          studentsRes, 
          teachersRes, 
          feePaymentsRes, 
          feeStructuresRes,
          activitiesRes,
          attendanceRes, 
          classesRes, 
          gradesRes,
          reportsRes,
          noticesRes
        ] = await Promise.all(apiCalls);

        const students = studentsRes.data || [];
        const teachers = teachersRes.data || [];
        const feePayments = feePaymentsRes.data || [];
        const feeStructures = feeStructuresRes.data || [];
        const activities = activitiesRes.data || [];
        const attendance = attendanceRes.data || [];
        const classes = classesRes.data || [];
        const grades = gradesRes.data || [];
        const reports = reportsRes.data || [];
        const noticesData = noticesRes.data || [];
        
        // Set notices in state for use in render
        setNotices(noticesData);

        // Calculate real statistics from API data
        const totalStudents = students.length;
        const totalTeachers = teachers.length;
        const totalClasses = classes.length;
        
        // Calculate department-wise fee statistics
        const departmentFees = feeStructures.reduce((acc: any, fee: any) => {
          const department = fee.department || fee.class_name || fee.category || 'General';
          if (!acc[department]) {
            acc[department] = {
              department,
              totalFees: 0,
              paidFees: 0,
              pendingFees: 0,
              feeCount: 0,
              averageFee: 0,
              feeTypes: []
            };
          }
          const amount = parseFloat(fee.amount) || parseFloat(fee.total_amount) || parseFloat(fee.fee_amount) || 0;
          acc[department].totalFees += amount;
          acc[department].feeCount += 1;
          acc[department].feeTypes.push(fee.fee_type || fee.type || 'General');
          return acc;
        }, {});

        // Match fee structures with fee payments based on ID to calculate paid amounts
        feePayments.forEach((payment: any) => {
          const paymentId = payment.id || payment.fee_structure_id || payment.fee_id;
          if (paymentId) {
            // Find matching fee structure
            const matchingFee = feeStructures.find((fee: any) => 
              fee.id === paymentId || fee.fee_structure_id === paymentId
            );
            
            if (matchingFee) {
              const department = matchingFee.department || matchingFee.class_name || matchingFee.category || 'General';
              if (departmentFees[department]) {
                const paidAmount = parseFloat(payment.amount_paid) || parseFloat(payment.amount) || 0;
                departmentFees[department].paidFees += paidAmount;
              }
            }
          }
        });

        // Calculate pending fees and average for each department
        Object.keys(departmentFees).forEach(dept => {
          departmentFees[dept].pendingFees = departmentFees[dept].totalFees - departmentFees[dept].paidFees;
          departmentFees[dept].averageFee = departmentFees[dept].totalFees / departmentFees[dept].feeCount;
        });
        
        // Merge fee structures into payments to compute accurate totals and pending amounts
        const mergedPayments = feePayments.map((pay: any) => {
          const structure = feeStructures.find((s: any) => s.id === pay.fee_structure);

          const totalRaw = structure?.amount ?? "0";
          const total = Number(totalRaw) || 0;

          const paidRaw = pay.amount_paid ?? pay.amount ?? "0";
          const paid = Number(paidRaw) || 0;

          const remaining = Math.max(total - paid, 0);

          return {
            ...pay,
            total_amount: total,
            remaining_amount: remaining,
          };
        });

        // Calculate revenue from merged payments (only Paid / Completed)
        const paidPayments = mergedPayments.filter((payment: any) => payment.status === "Paid" || payment.payment_status === "Completed");
        const totalRevenue = paidPayments.reduce(
          (sum: number, payment: any) => sum + (Number(payment.amount_paid ?? payment.amount ?? 0) || 0),
          0
        );

        // Calculate pending fees from merged payments (remaining > 0)
        const pendingPayments = mergedPayments.filter((payment: any) => payment.remaining_amount > 0);
        const pendingFees = pendingPayments.reduce(
          (sum: number, payment: any) => sum + (Number(payment.remaining_amount) || 0),
          0
        );
        
        // Calculate attendance rate
        const presentAttendance = attendance.filter((record: any) => record.status === "Present").length;
        const attendanceRate = attendance.length > 0 ? Math.round((presentAttendance / attendance.length) * 100) : 0;
        
        // Calculate pass percentage from grades/reports
        const allGrades = [...grades, ...reports];
        const passingGrades = allGrades.filter((report: any) => {
          const percentage = parseFloat(report.percentage) || 0;
          const marks = parseFloat(report.marks_obtained) || 0;
          const totalMarks = parseFloat(report.total_marks) || 1;
          const actualPercentage = totalMarks > 0 ? (marks / totalMarks) * 100 : 0;
          return percentage >= 40 || actualPercentage >= 40; // Assuming 40% is passing grade
        }).length;
        const totalGrades = allGrades.length;
        const passPercentage = totalGrades > 0 ? Math.round((passingGrades / totalGrades) * 100) : 0;

        // Process activities from API
        let recentActivities = activities.map((activity: any, index: number) => {
          // Determine icon based on activity type
          let icon = '📋'; // Default icon
          let type = activity.type || 'general';
          
          switch (type.toLowerCase()) {
            case 'fee_payment':
            case 'payment':
              icon = '💰';
              break;
            case 'admission':
            case 'student':
              icon = '🎓';
              break;
            case 'notice':
            case 'announcement':
              icon = '📢';
              break;
            case 'exam':
            case 'grade':
            case 'result':
              icon = '📊';
              break;
            case 'attendance':
              icon = '📅';
              break;
            case 'event':
              icon = '🎉';
              break;
            case 'teacher':
            case 'staff':
              icon = '👨‍🏫';
              break;
            case 'holiday':
              icon = '🏖️';
              break;
            case 'assignment':
              icon = '📝';
              break;
            case 'library':
              icon = '📚';
              break;
            default:
              icon = '📋';
          }

          // Calculate time difference
          let timeText = 'Recently';
          if (activity.created_at || activity.timestamp || activity.date) {
            const activityDate = new Date(activity.created_at || activity.timestamp || activity.date);
            const now = new Date();
            const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
            
            if (diffInHours < 1) {
              timeText = 'Just now';
            } else if (diffInHours < 24) {
              timeText = `${diffInHours} hours ago`;
            } else {
              const diffInDays = Math.floor(diffInHours / 24);
              if (diffInDays < 7) {
                timeText = `${diffInDays} days ago`;
              } else {
                const diffInWeeks = Math.floor(diffInDays / 7);
                timeText = `${diffInWeeks} weeks ago`;
              }
            }
          }

          return {
            id: activity.id || index + 1,
            type,
            message: activity.title || activity.description || activity.message || 'Activity recorded',
            time: timeText,
            icon,
            fullData: activity // Store complete activity data
          };
        });

        // If we have less than 3 activities from API, supplement with generated activities
        if (recentActivities.length < 3) {
          const generatedActivities = [
            // Recent fee payments
            ...paidPayments.slice(-2).map((payment: any, index: number) => ({
              id: `gen_fee_${index}`,
              type: 'fee_payment',
              message: `${payment.student_name || payment.student_fullname || 'Student'} paid fees ${formatCurrency(parseFloat(payment.amount_paid) || parseFloat(payment.amount) || parseFloat(payment.total_amount) || 0)}`,
              time: payment.payment_date || payment.paid_at ? `${Math.floor((Date.now() - new Date(payment.payment_date || payment.paid_at).getTime()) / (1000 * 60 * 60))} hours ago` : 'Recently',
              icon: '💰',
              fullData: payment
            })),
            // Recent admissions
            ...students.slice(-1).map((student: any, index: number) => ({
              id: `gen_student_${index}`,
              type: 'new_admission',
              message: `New student admission: ${student.fullname || student.name || 'New Student'}`,
              time: student.created_at || student.admission_date ? `${Math.floor((Date.now() - new Date(student.created_at || student.admission_date).getTime()) / (1000 * 60 * 60 * 24))} days ago` : 'Recently',
              icon: '🎓',
              fullData: student
            })),
            // Recent notices
            ...noticesData.slice(-1).map((notice: any, index: number) => ({
              id: `gen_notice_${index}`,
              type: 'notice',
              message: `New notice: ${notice.title || notice.message || 'School Notice'}`,
              time: notice.posted_date || notice.created_at ? `${Math.floor((Date.now() - new Date(notice.posted_date || notice.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago` : 'Recently',
              icon: '📢',
              fullData: notice
            }))
          ];

          // Combine API activities with generated ones, limit to 5 total
          recentActivities = [...recentActivities, ...generatedActivities].slice(0, 5);
        }

        // Calculate quick stats
        const quickStats = {
          pendingFees: pendingPayments.length,
          newAdmissions: students.filter((student: any) => {
            const createdAt = new Date(student.created_at || student.admission_date);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return createdAt > thirtyDaysAgo;
          }).length,
          pendingApprovals: feePayments.filter((payment: any) => payment.status === "Pending" || payment.payment_status === "Pending").length,
          totalNotices: noticesData.length
        };

        // Generate chart data based on real trends
        const chartData = {
          revenue: Array.from({length: 12}, (_, i) => {
            const monthPayments = mergedPayments.filter((payment: any) => {
              const paymentDate = new Date(payment.payment_date || payment.paid_at || payment.created_at);
              const paymentMonth = paymentDate.getMonth();
              return paymentMonth === i && (payment.status === "Paid" || payment.payment_status === "Completed");
            });
            return (
              monthPayments.reduce(
                (sum: number, payment: any) => sum + (Number(payment.amount_paid ?? payment.amount ?? 0) || 0),
                0
              ) / 1000
            ); // Convert to thousands
          }),
          students: Array.from({length: 12}, (_, i) => {
            // Simulate student growth over months based on current data
            return Math.floor(totalStudents * (0.7 + (i * 0.025)));
          }),
          expenses: Array.from({length: 12}, () => Math.floor(Math.random() * 40) + 20) // Simulated expenses
        };

        setDashboardData({
          overview: {
            totalStudents,
            totalTeachers,
            totalClasses,
            totalRevenue,
            pendingFees,
            attendanceRate,
            passPercentage
          },
          departmentFees,
          recentActivities,
          quickStats,
          chartData
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to default data if API fails
        setDashboardData({
          overview: {
            totalStudents: 0,
            totalTeachers: 0,
            totalClasses: 0,
            totalRevenue: 0,
            pendingFees: 0,
            attendanceRate: 0,
            passPercentage: 0
          },
          departmentFees: {},
          recentActivities: [],
          quickStats: {
            pendingFees: 0,
            newAdmissions: 0,
            pendingApprovals: 0,
            totalNotices: 0
          },
          chartData: {
            revenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            students: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            expenses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="management">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { overview, departmentFees, recentActivities, quickStats, chartData } = dashboardData;

  // Default values to handle undefined cases
  const safeOverview = overview || {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0,
    pendingFees: 0,
    attendanceRate: 0,
    passPercentage: 0
  };

  const safeDepartmentFees = departmentFees || {};

  const safeQuickStats = quickStats || {
    pendingFees: 0,
    newAdmissions: 0,
    pendingApprovals: 0,
    totalNotices: 0
  };

  const safeRecentActivities = recentActivities || [];

  return (
    <DashboardLayout role="management">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800">Management Dashboard</h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {new Date().toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 font-medium uppercase">Total Revenue</h3>
                  <p className="text-2xl font-bold text-gray-800">{formatLargeAmount(safeOverview.totalRevenue)}</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">↑ 12.5%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 font-medium uppercase">Total Students</h3>
                  <p className="text-2xl font-bold text-gray-800">{safeOverview.totalStudents}</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">↑ 8.2%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 font-medium uppercase">Total Teachers</h3>
                  <p className="text-2xl font-bold text-gray-800">{safeOverview.totalTeachers}</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">↑ 3.4%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 font-medium uppercase">Pending Fees</h3>
                  <p className="text-2xl font-bold text-gray-800">{formatLargeAmount(safeOverview.pendingFees)}</p>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">↑ 15.2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 hover:bg-red-100 transition-colors">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{safeQuickStats.pendingFees}</p>
                      <p className="text-sm text-gray-600">Pending Fees</p>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3 hover:bg-green-100 transition-colors">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{safeQuickStats.newAdmissions}</p>
                      <p className="text-sm text-gray-600">New Admissions</p>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl flex items-center gap-3 hover:bg-orange-100 transition-colors">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{safeQuickStats.pendingApprovals}</p>
                      <p className="text-sm text-gray-600">Pending Approvals</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3 hover:bg-blue-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{safeQuickStats.totalNotices}</p>
                      <p className="text-sm text-gray-600">Total Notices</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Performance Metrics</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-700">Attendance Rate</h4>
                      <span className="text-lg font-bold text-gray-800">{safeOverview.attendanceRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: `${safeOverview.attendanceRate}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-700">Pass Percentage</h4>
                      <span className="text-lg font-bold text-gray-800">{safeOverview.passPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: `${safeOverview.passPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Recent Activities */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Recent Activities</h2>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</button>
                </div>
                <div className="space-y-4">
                  {safeRecentActivities.map((activity: any) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer hover:shadow-md"
                      onClick={() => {
                        setSelectedActivity(activity);
                        setShowActivityModal(true);
                      }}
                    >
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{activity.message}</p>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notices Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">School Notices</h2>
                  <span className="text-sm text-gray-500">Total: {notices.length} notices</span>
                </div>
                {notices.length > 0 ? (
                  <div className="space-y-4">
                    {notices.slice(0, 4).map((notice: any, index: number) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setSelectedNotice(notice);
                          setShowNoticeModal(true);
                        }}
                        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 mb-1 truncate">
                              {notice.title || notice.subject || 'Untitled Notice'}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {notice.message || notice.description || notice.content || 'No description available'}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {notice.posted_date || notice.created_at || notice.date ? 
                                  new Date(notice.posted_date || notice.created_at || notice.date).toLocaleDateString() : 
                                  'No date'
                                }
                              </span>
                              <div className="flex items-center gap-2">
                                {notice.priority && (
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    notice.priority.toLowerCase() === 'urgent' ? 'bg-red-100 text-red-700' :
                                    notice.priority.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-700' :
                                    notice.priority.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {notice.priority}
                                  </span>
                                )}
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notices.length > 4 && (
                      <div className="text-center pt-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View all {notices.length} notices →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <h3 className="text-gray-700 font-semibold text-lg mb-2">No Notices</h3>
                    <p className="text-gray-500 text-sm">No notices available at the moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Activity Detail Modal */}
      {showActivityModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-3xl">{selectedActivity.icon}</span>
                  Activity Details
                </h2>
                <button
                  onClick={() => {
                    setShowActivityModal(false);
                    setSelectedActivity(null);
                  }}
                  className="text-white/90 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* General Activity Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
                    <span className="text-2xl">{selectedActivity.icon}</span>
                    Activity Details
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm text-gray-600">Activity Type</label>
                      <div className="font-semibold capitalize">{selectedActivity.type || 'General'}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm text-gray-600">Title</label>
                      <div className="font-semibold text-lg">{selectedActivity.fullData?.title || selectedActivity.message || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm text-gray-600">Description</label>
                      <div className="font-semibold whitespace-pre-wrap">{selectedActivity.fullData?.description || selectedActivity.fullData?.message || 'No description available'}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm text-gray-600">Date/Time</label>
                        <div className="font-semibold">{selectedActivity.fullData?.created_at || selectedActivity.fullData?.timestamp || selectedActivity.fullData?.date || 'N/A'}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm text-gray-600">Status</label>
                        <div className="font-semibold">{selectedActivity.fullData?.status || 'Completed'}</div>
                      </div>
                    </div>
                    
                    {/* Additional fields based on activity type */}
                    {selectedActivity.type === 'fee_payment' && selectedActivity.fullData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="text-sm text-gray-600">Student Name</label>
                          <div className="font-semibold">{selectedActivity.fullData.student_name || selectedActivity.fullData.student_fullname || 'N/A'}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="text-sm text-gray-600">Amount</label>
                          <div className="font-semibold text-green-600">{formatCurrency(parseFloat(selectedActivity.fullData.amount) || parseFloat(selectedActivity.fullData.amount_paid) || 0)}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedActivity.type === 'admission' && selectedActivity.fullData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="text-sm text-gray-600">Student Name</label>
                          <div className="font-semibold">{selectedActivity.fullData.student_name || selectedActivity.fullData.name || 'N/A'}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="text-sm text-gray-600">Class</label>
                          <div className="font-semibold">{selectedActivity.fullData.class_name || selectedActivity.fullData.class || 'N/A'}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedActivity.type === 'exam' && selectedActivity.fullData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="text-sm text-gray-600">Subject</label>
                          <div className="font-semibold">{selectedActivity.fullData.subject || selectedActivity.fullData.subject_name || 'N/A'}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="text-sm text-gray-600">Grade</label>
                          <div className="font-semibold">{selectedActivity.fullData.grade || selectedActivity.fullData.marks || 'N/A'}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedActivity.fullData?.related_user && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm text-gray-600">Related User</label>
                        <div className="font-semibold">{selectedActivity.fullData.related_user}</div>
                      </div>
                    )}
                    
                    {selectedActivity.fullData?.priority && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm text-gray-600">Priority</label>
                        <div className="font-semibold capitalize">{selectedActivity.fullData.priority}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowActivityModal(false);
                    setSelectedActivity(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notice Detail Modal */}
      {showNoticeModal && selectedNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Notice Details</h2>
                    <p className="text-white/80 text-sm">Complete notice information</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNoticeModal(false);
                    setSelectedNotice(null);
                  }}
                  className="text-white/90 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📢 Notice Information</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm text-gray-600">Title</label>
                      <div className="font-semibold text-lg">{selectedNotice.title || selectedNotice.subject || 'Untitled Notice'}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm text-gray-600">Description</label>
                      <div className="font-semibold whitespace-pre-wrap">{selectedNotice.message || selectedNotice.description || selectedNotice.content || 'No description available'}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm text-gray-600">Posted Date</label>
                        <div className="font-semibold">
                          {selectedNotice.posted_date || selectedNotice.created_at || selectedNotice.date ? 
                            new Date(selectedNotice.posted_date || selectedNotice.created_at || selectedNotice.date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'
                          }
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm text-gray-600">Priority</label>
                        <div className="font-semibold capitalize">
                          {selectedNotice.priority ? (
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              selectedNotice.priority.toLowerCase() === 'urgent' ? 'bg-red-100 text-red-700' :
                              selectedNotice.priority.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-700' :
                              selectedNotice.priority.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {selectedNotice.priority}
                            </span>
                          ) : 'Normal'}
                        </div>
                      </div>
                    </div>
                    
                    {selectedNotice.target_audience && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm text-gray-600">Target Audience</label>
                        <div className="font-semibold capitalize">{selectedNotice.target_audience}</div>
                      </div>
                    )}
                    
                    {selectedNotice.category && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm text-gray-600">Category</label>
                        <div className="font-semibold capitalize">{selectedNotice.category}</div>
                      </div>
                    )}
                    
                    {selectedNotice.valid_until && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm text-gray-600">Valid Until</label>
                        <div className="font-semibold">
                          {new Date(selectedNotice.valid_until).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                    
                    {selectedNotice.attachment_url && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm text-gray-600">Attachment</label>
                        <div className="font-semibold">
                          <a 
                            href={selectedNotice.attachment_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            View Attachment
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {selectedNotice.posted_by && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm text-gray-600">Posted By</label>
                        <div className="font-semibold">{selectedNotice.posted_by}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowNoticeModal(false);
                    setSelectedNotice(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                {selectedNotice.attachment_url && (
                  <button
                    onClick={() => window.open(selectedNotice.attachment_url, '_blank')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Download Attachment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManagementDashboard;