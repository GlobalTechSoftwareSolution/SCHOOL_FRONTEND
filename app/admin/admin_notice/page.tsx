"use client"
import DashboardLayout from '@/app/components/DashboardLayout'
import React, { useState } from 'react'

const Notice_Page = () => {
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: 'System Maintenance',
      content: 'There will be scheduled maintenance on Saturday from 2 AM to 4 AM.',
      type: 'warning',
      date: '2024-01-15',
      status: 'active',
      priority: 'high'
    },
    {
      id: 2,
      title: 'New Feature Update',
      content: 'We have added new analytics features to the dashboard.',
      type: 'info',
      date: '2024-01-14',
      status: 'active',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Security Patch',
      content: 'Important security updates have been applied to the system.',
      type: 'critical',
      date: '2024-01-13',
      status: 'inactive',
      priority: 'high'
    }
  ])

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    type: 'info',
    priority: 'medium'
  })

  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault()
    const notice = {
      id: notices.length + 1,
      ...newNotice,
      date: new Date().toISOString().split('T')[0],
      status: 'active'
    }
    setNotices([notice, ...notices])
    setNewNotice({ title: '', content: '', type: 'info', priority: 'medium' })
    setShowCreateForm(false)
  }

  const toggleNoticeStatus = (id: number) => {
    setNotices(notices.map(notice => 
      notice.id === id 
        ? { ...notice, status: notice.status === 'active' ? 'inactive' : 'active' }
        : notice
    ))
  }

  const deleteNotice = (id: number) => {
    setNotices(notices.filter(notice => notice.id !== id))
  }

  const getTypeStyles = (type: string) => {
    const styles = {
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      critical: 'bg-red-100 text-red-800 border-red-200',
      success: 'bg-green-100 text-green-800 border-green-200'
    }
    return styles[type as keyof typeof styles] || styles.info
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-red-100 text-red-800'
    }
    return styles[priority as keyof typeof styles] || styles.medium
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notice Management</h1>
            <p className="text-gray-600 mt-2">Create and manage system notices</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + Create New Notice
          </button>
        </div>

        {/* Create Notice Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h2 className="text-xl font-semibold mb-4">Create New Notice</h2>
            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notice title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  required
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notice content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={newNotice.type}
                    onChange={(e) => setNewNotice({...newNotice, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">Information</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                    <option value="success">Success</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({...newNotice, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Publish Notice
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notices Grid */}
        <div className="grid gap-6">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${
                notice.status === 'inactive' ? 'opacity-60' : ''
              } ${getTypeStyles(notice.type)}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{notice.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(notice.priority)}`}>
                    {notice.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    notice.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {notice.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleNoticeStatus(notice.id)}
                    className={`px-3 py-1 text-sm rounded ${
                      notice.status === 'active' 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {notice.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteNotice(notice.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{notice.content}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Type: <span className="capitalize">{notice.type}</span></span>
                <span>Published: {notice.date}</span>
              </div>
            </div>
          ))}
        </div>

        {notices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📢</div>
            <h3 className="text-lg font-semibold text-gray-600">No notices yet</h3>
            <p className="text-gray-500 mt-2">Create your first notice to get started</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Notice_Page