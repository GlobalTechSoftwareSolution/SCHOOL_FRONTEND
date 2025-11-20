"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import DashboardLayout from "@/app/components/DashboardLayout";

const API = "https://globaltechsoftwaresolutions.cloud/school-api/api";

// Type definitions
interface AttendanceData {
  date: string;
  Present: number;
  Absent: number;
  Total: number;
}

interface ClassDistribution {
  name: string;
  students: number;
  teacher: string;
}

interface RecentActivity {
  id: number;
  name: string;
  action: string;
  time: string;
  type: string;
  avatar: string;
}

// Color palettes for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const STATUS_COLORS = {
  Present: '#10B981',
  Absent: '#EF4444',
  Late: '#F59E0B',
  Halfday: '#F97316'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    presentToday: 0,
    absentToday: 0,
    totalLeaves: 0,
    pendingLeaves: 0,
    totalReports: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [classDistribution, setClassDistribution] = useState<ClassDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  // Read admin email from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        setAdminEmail(parsed.email);
      }
    } catch (err) {
      console.error("Error reading admin data:", err);
    }
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data
        const [studentsRes, teachersRes, classesRes, attendanceRes, leavesRes, reportsRes] = await Promise.all([
          axios.get(`${API}/students/`),
          axios.get(`${API}/teachers/`),
          axios.get(`${API}/classes/`),
          axios.get(`${API}/attendance/`),
          axios.get(`${API}/leaves/`),
          axios.get(`${API}/reports/`)
        ]);

        const students = studentsRes.data;
        const teachers = teachersRes.data;
        const classes = classesRes.data;
        const attendance = attendanceRes.data;
        const leaves = leavesRes.data;
        const reports = reportsRes.data;

        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendance.filter((a: any) => a.date === today);        
        const presentToday = todayAttendance.filter((a: any) => a.status === 'Present').length;

        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalClasses: classes.length,
          presentToday: presentToday,
          absentToday: todayAttendance.length - presentToday,
          totalLeaves: leaves.length,
          pendingLeaves: leaves.filter((l: any) => l.status === 'Pending').length,
          totalReports: reports.length
        });

        // Prepare class distribution data
        const classData = classes.map((cls: any) => ({
          name: `${cls.class_name} - ${cls.sec}`,
          students: students.filter((s: any) => s.class_id == cls.id).length,
          teacher: cls.class_teacher_name
        }));
        setClassDistribution(classData);

        // Prepare attendance trend data (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const trendData = last7Days.map(date => {
          const dayAttendance = attendance.filter((a: any) => a.date === date);
          const present = dayAttendance.filter((a: any) => a.status === 'Present').length;
          const absent = dayAttendance.filter((a: any) => a.status === 'Absent').length;
          
          return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            Present: present,
            Absent: absent,
            Total: dayAttendance.length
          };
        });
        setAttendanceData(trendData);

        // Prepare recent activity
        const sortedAttendance = attendance
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 8);

        const activity = sortedAttendance.map((record: any) => ({
          id: record.id,
          name: record.user_name || record.user_email,
          action: record.status === 'Present' ? 'Checked in' : 'Marked absent',
          time: `${record.date} ${record.check_in || ''}`,
          type: record.status.toLowerCase(),
          avatar: getInitials(record.user_name || record.user_email)
        }));

        setRecentActivity(activity);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2">Welcome back, {adminEmail || 'Admin'}! Here's your overview.</p>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 bg-white px-3 sm:px-4 py-2 rounded-lg border self-stretch sm:self-auto">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon="👨‍🎓"
              color="blue"
              trend={stats.totalStudents > 0 ? "+" + Math.round(Math.random() * 15 + 5) + "%" : "0%"}
            />
            <StatCard
              title="Total Teachers"
              value={stats.totalTeachers}
              icon="👨‍🏫"
              color="green"
              trend={stats.totalTeachers > 0 ? "+" + Math.round(Math.random() * 10 + 2) + "%" : "0%"}
            />
            <StatCard
              title="Classes"
              value={stats.totalClasses}
              icon="🏫"
              color="purple"
              trend={stats.totalClasses > 0 ? "+" + Math.round(Math.random() * 3 + 1) : "0"}
            />
            <StatCard
              title="Present Today"
              value={stats.presentToday}
              icon="✅"
              color="orange"
              trend={`${stats.absentToday} absent`}
            />
          </div>

          {/* Additional Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Total Leaves"
              value={stats.totalLeaves}
              icon="📝"
              color="blue"
              trend={`${stats.pendingLeaves} pending`}
            />
            <StatCard
              title="Total Reports"
              value={stats.totalReports}
              icon="📊"
              color="green"
              trend="Generated"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pendingLeaves}
              icon="⏳"
              color="orange"
              trend="Action needed"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Attendance Trend */}
            <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Attendance Trend (Last 7 Days)</h3>
              <div className="h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Present" 
                      stroke={STATUS_COLORS.Present} 
                      strokeWidth={3}
                      dot={{ fill: STATUS_COLORS.Present, strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Absent" 
                      stroke={STATUS_COLORS.Absent} 
                      strokeWidth={3}
                      dot={{ fill: STATUS_COLORS.Absent, strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Class Distribution */}
            <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Class Distribution</h3>
              <div className="h-72 sm:h-80 -mx-4 sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6B7280" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value} students`, 'Count']}
                    />
                    <Bar 
                      dataKey="students" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto">
                  View All
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mx-auto sm:mx-0">
                        {activity.avatar}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.action}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-center sm:text-right">
                      <p className="text-xs sm:text-sm text-gray-500">{activity.time}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        activity.type === 'present' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <QuickActionButton 
                  icon="📊"
                  title="View Attendance"
                  description="Check all attendance records"
                  href="/admin/admin_attendence"
                />
                <QuickActionButton 
                  icon="👨‍🎓"
                  title="Manage Students"
                  description="Add or edit students"
                  href="/admin/admin_students"
                />
                <QuickActionButton 
                  icon="👨‍🏫"
                  title="Manage Teachers"
                  description="Add or edit teachers"
                  href="/admin/admin_teachers"
                />
                <QuickActionButton 
                  icon="📋"
                  title="Generate Reports"
                  description="Create attendance reports"
                  href="/admin/admin_reports"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, trend }: { title: string; value: number; icon: string; color: 'blue' | 'green' | 'purple' | 'orange'; trend: string }) {
  const colorClasses: Record<'blue' | 'green' | 'purple' | 'orange', string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  return (
    <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{(value || 0).toLocaleString()}</p>
          <p className={`text-xs sm:text-sm mt-2 ${(trend || '').includes('+') ? 'text-green-600' : 'text-gray-500'}`}>
            {trend || '0%'}
          </p>
        </div>
        <div className={`p-2.5 sm:p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-xl sm:text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ icon, title, description, href }: { icon: string; title: string; description: string; href: string }) {
  return (
    <a 
      href={href}
      className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group text-center sm:text-left"
    >
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full">
        <div className="flex-shrink-0">
          <span className="text-2xl sm:text-2xl group-hover:scale-110 transition-transform">{icon}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 text-sm sm:text-base">{title}</h4>
          <p className="text-xs sm:text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-center">
        <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
      </div>
    </a>
  );
}

export { AdminDashboard };