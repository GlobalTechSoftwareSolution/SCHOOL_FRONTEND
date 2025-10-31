"use client"
import DashboardLayout from '@/app/components/DashboardLayout'
import React, { useState } from 'react'

const Issues_Page = () => {
  const [issues, setIssues] = useState([
    {
      id: 1,
      title: 'Login authentication failing',
      description: 'Users are unable to login with correct credentials. Error shows "Invalid credentials" even with correct password.',
      reporter: 'john@student.school.com',
      reporterName: 'John Student',
      role: 'student',
      status: 'open',
      priority: 'high',
      type: 'technical',
      category: 'authentication',
      assignedTo: 'tech@school.com',
      createdAt: '2024-01-15 10:30',
      updatedAt: '2024-01-15 14:20',
      attachments: 2,
      comments: 5
    },
    {
      id: 2,
      title: 'Dashboard loading slowly',
      description: 'Admin dashboard takes more than 10 seconds to load completely, affecting productivity.',
      reporter: 'sarah@teacher.school.com',
      reporterName: 'Sarah Teacher',
      role: 'teacher',
      status: 'in-progress',
      priority: 'medium',
      type: 'performance',
      category: 'system',
      assignedTo: 'dev@school.com',
      createdAt: '2024-01-14 09:15',
      updatedAt: '2024-01-15 11:45',
      attachments: 1,
      comments: 3
    },
    {
      id: 3,
      title: 'Grade submission not working',
      description: 'Unable to submit student grades for Math class. Error occurs when clicking submit button.',
      reporter: 'mike@teacher.school.com',
      reporterName: 'Mike Professor',
      role: 'teacher',
      status: 'resolved',
      priority: 'high',
      type: 'functional',
      category: 'academic',
      assignedTo: 'academic@school.com',
      createdAt: '2024-01-13 16:40',
      updatedAt: '2024-01-15 09:30',
      attachments: 0,
      comments: 8
    },
    {
      id: 4,
      title: 'Attendance export feature broken',
      description: 'Export functionality returns corrupted Excel files when trying to download attendance records.',
      reporter: 'admin@school.com',
      reporterName: 'Admin User',
      role: 'admin',
      status: 'open',
      priority: 'critical',
      type: 'bug',
      category: 'reporting',
      assignedTo: '',
      createdAt: '2024-01-15 13:20',
      updatedAt: '2024-01-15 13:20',
      attachments: 1,
      comments: 2
    },
    {
      id: 5,
      title: 'Mobile app crashing on iOS',
      description: 'Application crashes immediately after login on iOS devices version 16.0 and above.',
      reporter: 'lisa@student.school.com',
      reporterName: 'Lisa Johnson',
      role: 'student',
      status: 'in-progress',
      priority: 'critical',
      type: 'mobile',
      category: 'technical',
      assignedTo: 'mobile@school.com',
      createdAt: '2024-01-12 11:00',
      updatedAt: '2024-01-15 16:30',
      attachments: 3,
      comments: 12
    }
  ])

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    type: 'all',
    category: 'all',
    role: 'all'
  })

  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newComment, setNewComment] = useState('')

  const statusOptions = ['all', 'open', 'in-progress', 'resolved', 'closed']
  const priorityOptions = ['all', 'critical', 'high', 'medium', 'low']
  const typeOptions = ['all', 'technical', 'functional', 'performance', 'mobile', 'ui/ux']
  const categoryOptions = ['all', 'authentication', 'academic', 'system', 'reporting', 'technical']
  const roleOptions = ['all', 'student', 'teacher', 'admin']

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.reporterName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || issue.status === filters.status
    const matchesPriority = filters.priority === 'all' || issue.priority === filters.priority
    const matchesType = filters.type === 'all' || issue.type === filters.type
    const matchesCategory = filters.category === 'all' || issue.category === filters.category
    const matchesRole = filters.role === 'all' || issue.role === filters.role

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesCategory && matchesRole
  })

  const updateIssueStatus = (id: number, newStatus: string) => {
    setIssues(issues.map(issue => 
      issue.id === id 
        ? { ...issue, status: newStatus, updatedAt: new Date().toLocaleString() }
        : issue
    ))
  }

  const assignIssue = (id: number, assignee: string) => {
    setIssues(issues.map(issue => 
      issue.id === id 
        ? { ...issue, assignedTo: assignee, updatedAt: new Date().toLocaleString() }
        : issue
    ))
  }

  const addComment = () => {
    if (!newComment.trim() || !selectedIssue) return
    
    setIssues(issues.map(issue => 
      issue.id === selectedIssue.id 
        ? { ...issue, comments: issue.comments + 1, updatedAt: new Date().toLocaleString() }
        : issue
    ))
    setNewComment('')
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-red-100 text-red-800 border-red-200',
      'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return `px-3 py-1 rounded-full text-sm font-medium border ${styles[status as keyof typeof styles]}`
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-blue-500 text-white',
      low: 'bg-gray-500 text-white'
    }
    return `px-3 py-1 rounded-full text-sm font-medium ${styles[priority as keyof typeof styles]}`
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      student: 'bg-green-100 text-green-800 border border-green-200',
      teacher: 'bg-blue-100 text-blue-800 border border-blue-200',
      admin: 'bg-purple-100 text-purple-800 border border-purple-200'
    }
    return `px-2 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`
  }

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    critical: issues.filter(i => i.priority === 'critical').length
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Issue Management</h1>
            <p className="text-gray-600 mt-2">Track and resolve system issues from students, teachers, and staff</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
            <span>📊</span>
            Generate Report
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl shadow border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-gray-600 text-sm">Total Issues</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border border-l-4 border-l-red-500">
            <div className="text-2xl font-bold text-gray-900">{stats.open}</div>
            <div className="text-gray-600 text-sm">Open Issues</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border border-l-4 border-l-yellow-500">
            <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
            <div className="text-gray-600 text-sm">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border border-l-4 border-l-green-500">
            <div className="text-2xl font-bold text-gray-900">{stats.resolved}</div>
            <div className="text-gray-600 text-sm">Resolved</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border border-l-4 border-l-red-600">
            <div className="text-2xl font-bold text-gray-900">{stats.critical}</div>
            <div className="text-gray-600 text-sm">Critical</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search issues by title, description, or reporter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>
                    Status: {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {priorityOptions.map(option => (
                  <option key={option} value={option}>
                    Priority: {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {roleOptions.map(option => (
                  <option key={option} value={option}>
                    Role: {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{issue.title}</div>
                        <div className="text-gray-500 text-sm mt-1 line-clamp-2">{issue.description}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>📎 {issue.attachments} attachments</span>
                          <span>💬 {issue.comments} comments</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{issue.reporterName}</span>
                        <span className={getRoleBadge(issue.role)}>
                          {issue.role}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">{issue.reporter}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={issue.status}
                        onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
                        className={`text-sm font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusBadge(issue.status)}`}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getPriorityBadge(issue.priority)}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        {issue.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={issue.assignedTo}
                        onChange={(e) => assignIssue(issue.id, e.target.value)}
                        placeholder="Assign team..."
                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-32"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedIssue(issue)
                          setShowDetails(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredIssues.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🐛</div>
              <h3 className="text-lg font-semibold text-gray-600">No issues found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Issue Details Modal */}
        {showDetails && selectedIssue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedIssue.title}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={getPriorityBadge(selectedIssue.priority)}>
                        {selectedIssue.priority} priority
                      </span>
                      <span className={getStatusBadge(selectedIssue.status)}>
                        {selectedIssue.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {selectedIssue.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700 whitespace-pre-line">{selectedIssue.description}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Add Comment</h3>
                      <div className="space-y-3">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add your comment here..."
                        />
                        <button
                          onClick={addComment}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          Add Comment
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Issue Details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Reporter</label>
                          <div className="mt-1">
                            <div className="text-sm text-gray-900">{selectedIssue.reporterName}</div>
                            <div className="text-xs text-gray-500">{selectedIssue.reporter}</div>
                            <span className={getRoleBadge(selectedIssue.role)}>
                              {selectedIssue.role}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Category</label>
                          <div className="text-sm text-gray-900 mt-1">{selectedIssue.category}</div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Created</label>
                          <div className="text-sm text-gray-900 mt-1">{selectedIssue.createdAt}</div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                          <div className="text-sm text-gray-900 mt-1">{selectedIssue.updatedAt}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Assignment</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                          <input
                            type="text"
                            value={selectedIssue.assignedTo}
                            onChange={(e) => assignIssue(selectedIssue.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Assign team member..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                          <select
                            value={selectedIssue.status}
                            onChange={(e) => updateIssueStatus(selectedIssue.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Activity</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Attachments:</span>
                          <span className="text-gray-900">{selectedIssue.attachments} files</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Comments:</span>
                          <span className="text-gray-900">{selectedIssue.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t mt-6">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      updateIssueStatus(selectedIssue.id, 'resolved')
                      setShowDetails(false)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Issues_Page