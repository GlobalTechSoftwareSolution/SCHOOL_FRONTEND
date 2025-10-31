"use client"
import DashboardLayout from '@/app/components/DashboardLayout'
import React, { useState } from 'react'

const Admin_TeachersPage = () => {
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      department: 'Computer Science',
      subjects: ['Data Structures', 'Algorithms'],
      joinDate: '2022-08-15',
      status: 'active',
      phone: '+1 (555) 123-4567',
      office: 'CS-301',
      qualifications: ['PhD Computer Science', 'MSc Software Engineering'],
      type: 'full-time',
      classes: 4
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      email: 'michael.chen@university.edu',
      department: 'Mathematics',
      subjects: ['Calculus', 'Linear Algebra'],
      joinDate: '2021-01-10',
      status: 'active',
      phone: '+1 (555) 987-6543',
      office: 'MATH-205',
      qualifications: ['PhD Mathematics', 'MSc Applied Mathematics'],
      type: 'full-time',
      classes: 5
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      email: 'emily.davis@university.edu',
      department: 'Physics',
      subjects: ['Quantum Mechanics', 'Thermodynamics'],
      joinDate: '2023-03-20',
      status: 'on-leave',
      phone: '+1 (555) 456-7890',
      office: 'PHYS-102',
      qualifications: ['PhD Physics', 'MSc Nuclear Physics'],
      type: 'full-time',
      classes: 3
    },
    {
      id: 4,
      name: 'Prof. Robert Wilson',
      email: 'robert.wilson@university.edu',
      department: 'Computer Science',
      subjects: ['Web Development', 'Database Systems'],
      joinDate: '2020-09-05',
      status: 'active',
      phone: '+1 (555) 234-5678',
      office: 'CS-304',
      qualifications: ['MSc Computer Science', 'BSc Software Engineering'],
      type: 'part-time',
      classes: 2
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    department: '',
    subjects: '',
    phone: '',
    office: '',
    qualifications: '',
    type: 'full-time'
  })

  const departments = ['all', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering']
  const statusOptions = ['all', 'active', 'on-leave', 'inactive']

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = selectedDepartment === 'all' || teacher.department === selectedDepartment
    const matchesStatus = selectedStatus === 'all' || teacher.status === selectedStatus

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault()
    const teacher = {
      id: teachers.length + 1,
      name: newTeacher.name,
      email: newTeacher.email,
      department: newTeacher.department,
      subjects: newTeacher.subjects.split(',').map(s => s.trim()),
      phone: newTeacher.phone,
      office: newTeacher.office,
      qualifications: newTeacher.qualifications.split(',').map(q => q.trim()),
      type: newTeacher.type,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      classes: 0
    }
    setTeachers([...teachers, teacher])
    setNewTeacher({
      name: '',
      email: '',
      department: '',
      subjects: '',
      phone: '',
      office: '',
      qualifications: '',
      type: 'full-time'
    })
    setShowAddForm(false)
  }

  const toggleTeacherStatus = (id: number) => {
    setTeachers(teachers.map(teacher => 
      teacher.id === id 
        ? { 
            ...teacher, 
            status: teacher.status === 'active' ? 'inactive' : 'active' 
          }
        : teacher
    ))
  }

  const deleteTeacher = (id: number) => {
    setTeachers(teachers.filter(teacher => teacher.id !== id))
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      'on-leave': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      inactive: 'bg-red-100 text-red-800 border-red-200'
    }
    return `px-3 py-1 rounded-full text-sm font-medium border ${styles[status as keyof typeof styles]}`
  }

  const getTypeBadge = (type: string) => {
    return type === 'full-time' 
      ? 'bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-sm font-medium'
      : 'bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-full text-sm font-medium'
  }

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'active').length,
    onLeave: teachers.filter(t => t.status === 'on-leave').length,
    fullTime: teachers.filter(t => t.type === 'full-time').length
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
            <p className="text-gray-600 mt-2">Manage faculty members and their information</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Add New Teacher
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-gray-600">Total Teachers</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-l-4 border-l-green-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                <div className="text-gray-600">Active</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🌴</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.onLeave}</div>
                <div className="text-gray-600">On Leave</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-l-4 border-l-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">💼</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.fullTime}</div>
                <div className="text-gray-600">Full Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search teachers by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                    <p className="text-gray-600 text-sm">{teacher.department}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={getStatusBadge(teacher.status)}>
                      {teacher.status}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📧</span>
                    <span>{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📞</span>
                    <span>{teacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>🏢</span>
                    <span>{teacher.office}</span>
                  </div>
                </div>

                {/* Subjects and Type */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {teacher.subjects.map((subject, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {subject}
                      </span>
                    ))}
                  </div>
                  <span className={getTypeBadge(teacher.type)}>
                    {teacher.type}
                  </span>
                </div>

                {/* Qualifications */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Qualifications</h4>
                  <div className="space-y-1">
                    {teacher.qualifications.map((qual, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                        <span>🎓</span>
                        {qual}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Joined: {teacher.joinDate}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleTeacherStatus(teacher.id)}
                      className={`px-3 py-1 text-sm rounded ${
                        teacher.status === 'active' 
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {teacher.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteTeacher(teacher.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-lg font-semibold text-gray-600">No teachers found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or add a new teacher</p>
          </div>
        )}

        {/* Add Teacher Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Teacher</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddTeacher} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newTeacher.name}
                        onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={newTeacher.email}
                        onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department *
                      </label>
                      <select
                        required
                        value={newTeacher.department}
                        onChange={(e) => setNewTeacher({...newTeacher, department: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Department</option>
                        {departments.filter(d => d !== 'all').map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employment Type
                      </label>
                      <select
                        value={newTeacher.type}
                        onChange={(e) => setNewTeacher({...newTeacher, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={newTeacher.phone}
                        onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Office Location
                      </label>
                      <input
                        type="text"
                        value={newTeacher.office}
                        onChange={(e) => setNewTeacher({...newTeacher, office: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter office location"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subjects (comma separated) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTeacher.subjects}
                      onChange={(e) => setNewTeacher({...newTeacher, subjects: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Data Structures, Algorithms, Web Development"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualifications (comma separated)
                    </label>
                    <textarea
                      value={newTeacher.qualifications}
                      onChange={(e) => setNewTeacher({...newTeacher, qualifications: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., PhD Computer Science, MSc Software Engineering"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex-1"
                    >
                      Add Teacher
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Admin_TeachersPage