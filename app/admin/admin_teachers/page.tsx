"use client"
import DashboardLayout from '@/app/components/DashboardLayout'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiSearch, FiFilter, FiUser, FiMail, FiPhone, FiCalendar, FiBook, FiAward, FiMapPin, FiDroplet, FiUsers, FiX } from 'react-icons/fi'

const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/teachers/"

interface Subject {
  id: number
  subject_name: string
  subject_code: string
  description: string
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

  // ✅ Fetch Teachers from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true)
        const res = await axios.get(API_URL)
        setTeachers(res.data)
        setFilteredTeachers(res.data)
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

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading teachers...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-red-500 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Unable to Load Data</h3>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
              <p className="text-gray-600 mt-2">Manage all teacher profiles and academic details</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {filteredTeachers.length} {filteredTeachers.length === 1 ? 'Teacher' : 'Teachers'}
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Teacher Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher, index) => (
            <div
              key={teacher.teacher_id}
              onClick={() => setSelectedTeacher(teacher)}
              className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden"
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
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
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

        {/* Empty State */}
        {filteredTeachers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👨‍🏫</div>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
                <div className="flex justify-between items-start">
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
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiUser className="w-5 h-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <InfoRow label="Email" value={selectedTeacher.email} icon={<FiMail />} />
                      <InfoRow label="Phone" value={selectedTeacher.phone} icon={<FiPhone />} />
                      <InfoRow label="Gender" value={selectedTeacher.gender} />
                      <InfoRow label="Date of Birth" value={selectedTeacher.date_of_birth} />
                      <InfoRow label="Nationality" value={selectedTeacher.nationality || 'N/A'} />
                      <InfoRow label="Blood Group" value={selectedTeacher.blood_group || 'N/A'} icon={<FiDroplet />} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiBook className="w-5 h-5 mr-2 text-green-600" />
                      Professional Details
                    </h3>
                    <div className="space-y-3">
                      <InfoRow label="Department" value={selectedTeacher.department_name} />
                      <InfoRow label="Qualification" value={selectedTeacher.qualification} />
                      <InfoRow label="Experience" value={`${selectedTeacher.experience_years} years`} />
                      <InfoRow label="Date Joined" value={selectedTeacher.date_joined} />
                      <InfoRow 
                        label="Status" 
                        value={
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedTeacher.user_details.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedTeacher.user_details.is_active ? 'Active' : 'Inactive'}
                          </span>
                        } 
                      />
                    </div>
                  </div>
                </div>

                {/* Subjects */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Subjects Taught</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedTeacher.subject_list.map((subject, i) => (
                      <div key={i} className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900">{subject.subject_name}</h4>
                        <p className="text-sm text-blue-700">Code: {subject.subject_code}</p>
                        {subject.description && (
                          <p className="text-xs text-blue-600 mt-2">{subject.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedTeacher.emergency_contact_name && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiUsers className="w-5 h-5 mr-2 text-red-600" />
                      Emergency Contact
                    </h3>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoRow label="Name" value={selectedTeacher.emergency_contact_name} />
                        <InfoRow label="Relationship" value={selectedTeacher.emergency_contact_relationship || 'N/A'} />
                        <InfoRow label="Contact No" value={selectedTeacher.emergency_contact_no || 'N/A'} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Residential Address */}
                {selectedTeacher.residential_address && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiMapPin className="w-5 h-5 mr-2 text-purple-600" />
                      Residential Address
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-gray-700">{selectedTeacher.residential_address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

// Helper component for info rows
const InfoRow = ({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100">
    <span className="text-sm font-medium text-gray-600 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </span>
    <span className="text-sm text-gray-900 text-right">{value}</span>
  </div>
)

export default Admin_TeachersPage