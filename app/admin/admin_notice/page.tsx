"use client"
import DashboardLayout from '@/app/components/DashboardLayout'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Notice_Page = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get("https://globaltechsoftwaresolutions.cloud/school-api/api/notices/");
        setNotices(response.data || []);
      } catch (error) {
        console.error("Error fetching notices:", error);
      }
    };
    fetchNotices();
  }, []);

  // Get user info from localStorage
  const userInfo = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userInfo") || "{}") : {};
  const userEmail = userInfo?.email || "admin@school.com";
  const userRole = userInfo?.role || "Admin";
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    type: "info",
    priority: "medium",
    email: userEmail,
    notice_by: userEmail,
    notice_to: "",
    valid_until: "",
    important: false
  })

  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newNotice.title || null,
        message: newNotice.content || null,
        posted_date: new Date().toISOString().slice(0, 19).replace("T", " "),
        valid_until: newNotice.valid_until ? newNotice.valid_until.replace("T", " ") : null,
        important: newNotice.important,
        email: userEmail,
        notice_by: userEmail,
        notice_to: newNotice.notice_to || null
      };

      const response = await axios.post(
        "https://globaltechsoftwaresolutions.cloud/school-api/api/notices/",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setNotices((prev) => [response.data, ...prev]);
      setShowCreateForm(false);
      setNewNotice({
        title: "",
        content: "",
        type: "info",
        priority: "medium",
        email: userEmail,
        notice_by: userEmail,
        notice_to: "",
        valid_until: "",
        important: false
      });
      alert("✅ Notice created successfully!");
    } catch (error) {
      console.error("Error creating notice:", error);
      alert("❌ Failed to create notice.");
    }
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

        {/* Create Notice Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity">
            <div className="bg-white p-6 rounded-xl shadow-lg border relative w-full max-w-lg transform transition-transform duration-300 ease-in-out scale-100">
              <button
                onClick={() => setShowCreateForm(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
              >
                ✖
              </button>
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

                {/* Email and Notice By fields are auto-filled and hidden */}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notice To</label>
                    <input
                      type="text"
                      value={newNotice.notice_to}
                      onChange={(e) => setNewNotice({ ...newNotice, notice_to: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter recipient (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="datetime-local"
                      value={newNotice.valid_until}
                      onChange={(e) => setNewNotice({ ...newNotice, valid_until: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newNotice.important}
                    onChange={(e) => setNewNotice({ ...newNotice, important: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700">Mark as Important</label>
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
          </div>
        )}

        {/* Notices Split Sections */}
        <div className="space-y-10">
          {/* Notices Given By Me */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Notices Given By Me</h2>
            <div className="grid gap-6">
              {notices.filter((notice: any) => notice.notice_by === userEmail).length === 0 ? (
                <div className="text-center py-8 text-gray-500">No notices given by you.</div>
              ) : (
                notices
                  .filter((notice: any) => notice.notice_by === userEmail)
                  .map((notice: any) => (
                    <div
                      key={notice.id || notice._id}
                      onClick={() => setSelectedNotice(notice)}
                      className="cursor-pointer bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all"
                    >
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold">{notice.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{notice.message}</p>
                      <div className="text-sm text-gray-500">
                        <span>Published: {notice.posted_date}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Notices For Me */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Notices For Me</h2>
            <div className="grid gap-6">
              {notices.filter((notice: any) => !notice.notice_to || notice.notice_to === userEmail).length === 0 ? (
                <div className="text-center py-8 text-gray-500">No notices for you.</div>
              ) : (
                notices
                  .filter((notice: any) => !notice.notice_to || notice.notice_to === userEmail)
                  .map((notice: any) => (
                    <div
                      key={notice.id || notice._id}
                      onClick={() => setSelectedNotice(notice)}
                      className="cursor-pointer bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all"
                    >
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold">{notice.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{notice.message}</p>
                      <div className="text-sm text-gray-500">
                        <span>Published: {notice.posted_date}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {selectedNotice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-lg relative transform transition-transform duration-300 ease-in-out scale-100">
              <button
                onClick={() => setSelectedNotice(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
              >
                ✖
              </button>
              <h2 className="text-2xl font-bold mb-4">{selectedNotice.title}</h2>
              <p className="text-gray-700 mb-3">{selectedNotice.message}</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-semibold">Posted Date:</span> {selectedNotice.posted_date}</p>
                <p><span className="font-semibold">Notice By:</span> {selectedNotice.notice_by || '-'}</p>
                <p><span className="font-semibold">Email:</span> {selectedNotice.email || '-'}</p>
                <p><span className="font-semibold">Important:</span> {selectedNotice.important ? 'Yes' : 'No'}</p>
                <p><span className="font-semibold">Attachment:</span> {selectedNotice.attachment ? (
                  <a href={selectedNotice.attachment} target="_blank" className="text-blue-600 underline">View</a>
                ) : 'None'}</p>
                <p><span className="font-semibold">Notice To:</span> {selectedNotice.notice_to || 'All'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Notice_Page