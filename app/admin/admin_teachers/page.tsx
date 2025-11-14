"use client"
import DashboardLayout from '@/app/components/DashboardLayout'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  FiSearch, 
  FiFilter, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiBook, 
  FiAward, 
  FiMapPin, 
  FiDroplet, 
  FiUsers, 
  FiX, 
  FiClock,
  FiEdit,
  FiEye,
  FiDownload,
  FiBarChart2,
  FiTrendingUp,
  FiStar,
  FiShield,
  FiHome,
  FiHeart,
  FiZap
} from 'react-icons/fi'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/teachers/"
const TIMETABLE_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/timetable/"

interface Subject {
  id: number
  subject_name: string
  subject_code: string
  description: string
}

interface Timetable {
  id: number
  subject_name: string
  teacher_name: string
  day_of_week: string
  start_time: string
  end_time: string
  room_number: string
  class_id: number
  teacher: string
}

interface Teacher {
  email: string
  fullname: string
  teacher_id: string
  phone: string
  date_of_birth: string
  gender: string
  profile_picture?: string  
  date_joined: string
  qualification: string
  experience_years: string
  department_name: string
  subject_list: Subject[]
  user_details: {
    role: string
    is_active: boolean
    is_approved: boolean
    is_staff: boolean
    created_at: string
    updated_at: string
  }
  residential_address?: string | null
  nationality?: string | null
  blood_group?: string | null
  emergency_contact_name?: string | null
  emergency_contact_relationship?: string | null
  emergency_contact_no?: string | null
}

const Admin_TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [timetables, setTimetables] = useState<Timetable[]>([])
  const [teacherTimetable, setTeacherTimetable] = useState<Timetable[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'subjects' | 'timetable' | 'contact' | 'analytics'>('profile')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    professional: true,
    emergency: true
  })

  // ✅ Fetch Teachers from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true)
        const [teachersRes, timetableRes] = await Promise.all([
          axios.get(API_URL),
          axios.get(TIMETABLE_URL)
        ])
        setTeachers(teachersRes.data)
        setFilteredTeachers(teachersRes.data)
        setTimetables(timetableRes.data)
      } catch (err) {
        console.error(err)
        setError("Failed to load teacher data.")
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [])

  // Filter teachers based on search and filters
  useEffect(() => {
    let filtered = teachers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.teacher_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.department_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(teacher =>
        statusFilter === 'active' ? teacher.user_details.is_active : !teacher.user_details.is_active
      )
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(teacher =>
        teacher.department_name === departmentFilter
      )
    }

    setFilteredTeachers(filtered)
  }, [searchTerm, statusFilter, departmentFilter, teachers])

  const departments = Array.from(new Set(teachers.map(teacher => teacher.department_name)))

  // Analytics Data
  const getAnalyticsData = () => {
    const totalTeachers = teachers.length
    const activeTeachers = teachers.filter(t => t.user_details.is_active).length
    const departmentsData = departments.map(dept => ({
      name: dept,
      count: teachers.filter(t => t.department_name === dept).length
    }))
    const experienceData = {
      '0-5 years': teachers.filter(t => parseInt(t.experience_years) <= 5).length,
      '6-10 years': teachers.filter(t => parseInt(t.experience_years) > 5 && parseInt(t.experience_years) <= 10).length,
      '11+ years': teachers.filter(t => parseInt(t.experience_years) > 10).length
    }

    return { totalTeachers, activeTeachers, departmentsData, experienceData }
  }

  const analytics = getAnalyticsData()

  // Chart Data
  const departmentChartData = {
    labels: analytics.departmentsData.map(d => d.name),
    datasets: [
      {
        label: 'Teachers per Department',
        data: analytics.departmentsData.map(d => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const experienceChartData = {
    labels: Object.keys(analytics.experienceData),
    datasets: [
      {
        label: 'Teachers by Experience',
        data: Object.values(analytics.experienceData),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 font-medium">Loading teachers...</p>
            <p className="text-gray-400 text-sm mt-2">Getting everything ready for you</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiZap className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* HEADER SECTION */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <FiUser className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-blue-900 bg-clip-text text-transparent">
                    Teacher Management
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Manage and monitor all teacher profiles and academic details
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium shadow-sm hover:shadow-md border border-gray-200/60"
              >
                {viewMode === 'grid' ? '📋 List View' : '🔍 Grid View'}
              </button>
              <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                <FiDownload className="h-5 w-5" />
                Export Data
              </button>
            </div>
          </div>

          {/* STATISTICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-sm border border-blue-200/30 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalTeachers}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiUser className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                <FiTrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600 font-medium">All faculty members</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl shadow-sm border border-emerald-200/30 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.activeTeachers}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiShield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                <FiStar className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-600 font-medium">Currently active</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-2xl shadow-sm border border-amber-200/30 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{departments.length}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiBook className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                <FiBarChart2 className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600 font-medium">Active departments</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl shadow-sm border border-purple-200/30 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Experience</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {Math.round(teachers.reduce((acc, t) => acc + parseInt(t.experience_years), 0) / teachers.length)}y
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiAward className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                <FiTrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-purple-600 font-medium">Years average</span>
              </div>
            </div>
          </div>

          {/* SEARCH AND FILTERS */}
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search teachers by name, email, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <div className="relative">
                  <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="pl-10 pr-8 py-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm appearance-none transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* VIEW MODE TOGGLE */}
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-gray-200/60 w-fit">
            {[
              { id: "grid", label: "🔍 Overview", icon: FiEye },
              { id: "analytics", label: "📊 Analytics", icon: FiBarChart2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as any)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  viewMode === tab.id
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-inner border border-blue-200/50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* TEACHERS GRID/LIST VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.teacher_id}
                  onClick={() => {
                    setSelectedTeacher(teacher)
                    const filtered = timetables.filter(t => t.teacher === teacher.email)
                    setTeacherTimetable(filtered)
                    setActiveTab('profile')
                  }}
                  className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden"
                >
                  {/* Header with Avatar and Status */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {teacher.profile_picture ? (
                          <img
                            src={teacher.profile_picture}
                            alt={teacher.fullname}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                            {teacher.fullname.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {teacher.fullname}
                          </h3>
                          <p className="text-sm text-gray-500">ID: {teacher.teacher_id}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        teacher.user_details.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {teacher.user_details.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{teacher.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{teacher.phone}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiBook className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{teacher.department_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subjects and Footer */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Subjects</h4>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subject_list.slice(0, 3).map((subject, i) => (
                          <span
                            key={i}
                            className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium"
                          >
                            {subject.subject_name}
                          </span>
                        ))}
                        {teacher.subject_list.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs">
                            +{teacher.subject_list.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        Joined {new Date(teacher.date_joined).getFullYear()}
                      </div>
                      <div className="flex items-center">
                        <FiAward className="w-4 h-4 mr-1" />
                        {teacher.experience_years} yrs
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {viewMode === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
                <div className="h-80">
                  <Bar data={departmentChartData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Levels</h3>
                <div className="h-80">
                  <Doughnut data={experienceChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredTeachers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No teachers found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' 
                  ? 'Try adjusting your search or filters to find what you are looking for.'
                  : 'No teachers are currently registered in the system.'}
              </p>
            </div>
          )}

          {/* Modal for Full Teacher Details */}
          {selectedTeacher && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-gray-200/60">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      {selectedTeacher.profile_picture ? (
                        <img
                          src={selectedTeacher.profile_picture}
                          alt={selectedTeacher.fullname}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-white"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-white font-semibold text-2xl">
                          {selectedTeacher.fullname.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold">{selectedTeacher.fullname}</h2>
                        <p className="text-blue-100">Teacher ID: {selectedTeacher.teacher_id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTeacher(null)}
                      className="text-white hover:text-blue-200 transition-colors text-2xl p-2"
                    >
                      <FiX />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 border-t border-blue-500 pt-4">
                    {[
                      { id: 'profile' as const, label: '👤 Profile', icon: FiUser },
                      { id: 'subjects' as const, label: '📚 Subjects', icon: FiBook },
                      { id: 'timetable' as const, label: '🕐 Timetable', icon: FiClock },
                      { id: 'contact' as const, label: '📞 Contact', icon: FiPhone },
                      { id: 'analytics' as const, label: '📊 Analytics', icon: FiBarChart2 }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-blue-100 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* PROFILE TAB */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      {/* Personal Information */}
                      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-200/30 overflow-hidden">
                        <div 
                          className="p-4 border-b border-gray-200/60 flex items-center justify-between cursor-pointer bg-white/80"
                          onClick={() => toggleSection('personal')}
                        >
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <FiUser className="h-5 w-5 text-blue-500" />
                            Personal Information
                          </h3>
                          {expandedSections.personal ? <span>▲</span> : <span>▼</span>}
                        </div>
                        {expandedSections.personal && (
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoRow label="Email" value={selectedTeacher.email} icon={<FiMail />} />
                            <InfoRow label="Phone" value={selectedTeacher.phone} icon={<FiPhone />} />
                            <InfoRow label="Gender" value={selectedTeacher.gender} />
                            <InfoRow label="Date of Birth" value={selectedTeacher.date_of_birth} />
                            <InfoRow label="Nationality" value={selectedTeacher.nationality || 'N/A'} />
                            <InfoRow label="Blood Group" value={selectedTeacher.blood_group || 'N/A'} icon={<FiDroplet />} />
                          </div>
                        )}
                      </div>

                      {/* Professional Details */}
                      <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl border border-emerald-200/30 overflow-hidden">
                        <div 
                          className="p-4 border-b border-gray-200/60 flex items-center justify-between cursor-pointer bg-white/80"
                          onClick={() => toggleSection('professional')}
                        >
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <FiBook className="h-5 w-5 text-emerald-500" />
                            Professional Details
                          </h3>
                          {expandedSections.professional ? <span>▲</span> : <span>▼</span>}
                        </div>
                        {expandedSections.professional && (
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoRow label="Department" value={selectedTeacher.department_name} />
                            <InfoRow label="Qualification" value={selectedTeacher.qualification} />
                            <InfoRow label="Experience" value={`${selectedTeacher.experience_years} years`} />
                            <InfoRow label="Date Joined" value={selectedTeacher.date_joined} />
                            <InfoRow 
                              label="Status" 
                              value={
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                  selectedTeacher.user_details.is_active
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-100 text-rose-700 border-rose-200'
                                }`}>
                                  {selectedTeacher.user_details.is_active ? 'Active' : 'Inactive'}
                                </span>
                              } 
                            />
                          </div>
                        )}
                      </div>

                      {/* Residential Address */}
                      {selectedTeacher.residential_address && (
                        <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl border border-purple-200/30 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <FiHome className="h-5 w-5 text-purple-500" />
                            Residential Address
                          </h3>
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-gray-700">{selectedTeacher.residential_address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBJECTS TAB */}
                  {activeTab === 'subjects' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FiBook className="h-6 w-6 text-blue-500" />
                        Subjects Taught
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedTeacher.subject_list.map((subject, i) => (
                          <div key={i} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 hover:shadow-lg transition-all duration-300">
                            <h4 className="font-bold text-blue-900 text-lg mb-2">{subject.subject_name}</h4>
                            <p className="text-blue-700 text-sm mb-3">Code: {subject.subject_code}</p>
                            {subject.description && (
                              <p className="text-blue-600 text-sm">{subject.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TIMETABLE TAB */}
                  {activeTab === 'timetable' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FiClock className="h-6 w-6 text-orange-500" />
                        Teaching Schedule
                      </h3>
                      {teacherTimetable.length > 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                                  <th className="px-6 py-4 text-left font-semibold text-orange-900">Day</th>
                                  <th className="px-6 py-4 text-left font-semibold text-orange-900">Subject</th>
                                  <th className="px-6 py-4 text-left font-semibold text-orange-900">Time</th>
                                  <th className="px-6 py-4 text-left font-semibold text-orange-900">Room</th>
                                  <th className="px-6 py-4 text-left font-semibold text-orange-900">Class</th>
                                </tr>
                              </thead>
                              <tbody>
                                {teacherTimetable.map((slot, index) => (
                                  <tr key={slot.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-orange-50 transition-colors`}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{slot.day_of_week}</td>
                                    <td className="px-6 py-4 text-gray-700">{slot.subject_name}</td>
                                    <td className="px-6 py-4 text-gray-700 flex items-center">
                                      <FiClock className="w-4 h-4 mr-2 text-orange-500" />
                                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                                        {slot.room_number}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">Class {slot.class_id}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FiClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No timetable assigned to this teacher</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CONTACT TAB */}
                  {activeTab === 'contact' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FiPhone className="h-6 w-6 text-green-500" />
                        Contact Information
                      </h3>
                      
                      {/* Primary Contact */}
                      <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl border border-green-200/30 p-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FiMail className="h-5 w-5 text-green-500" />
                          Primary Contact
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoRow label="Email" value={selectedTeacher.email} />
                          <InfoRow label="Phone" value={selectedTeacher.phone} />
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      {selectedTeacher.emergency_contact_name && (
                        <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl border border-red-200/30 overflow-hidden">
                          <div 
                            className="p-4 border-b border-gray-200/60 flex items-center justify-between cursor-pointer bg-white/80"
                            onClick={() => toggleSection('emergency')}
                          >
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <FiHeart className="h-5 w-5 text-red-500" />
                              Emergency Contact
                            </h4>
                            {expandedSections.emergency ? <span>▲</span> : <span>▼</span>}
                          </div>
                          {expandedSections.emergency && (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                              <InfoRow label="Name" value={selectedTeacher.emergency_contact_name} />
                              <InfoRow label="Relationship" value={selectedTeacher.emergency_contact_relationship || 'N/A'} />
                              <InfoRow label="Contact No" value={selectedTeacher.emergency_contact_no || 'N/A'} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ANALYTICS TAB */}
                  {activeTab === 'analytics' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FiBarChart2 className="h-6 w-6 text-purple-500" />
                        Teacher Analytics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">{selectedTeacher.subject_list.length}</div>
                          <div className="text-blue-700 font-medium">Subjects</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
                          <div className="text-3xl font-bold text-green-600 mb-2">{teacherTimetable.length}</div>
                          <div className="text-green-700 font-medium">Classes/Week</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-2">{selectedTeacher.experience_years}</div>
                          <div className="text-purple-700 font-medium">Years Exp</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

// Enhanced InfoRow component
const InfoRow = ({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
    <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
      {icon}
      {label}
    </span>
    <span className="text-sm text-gray-900 text-right font-medium">{value}</span>
  </div>
)

export default Admin_TeachersPage