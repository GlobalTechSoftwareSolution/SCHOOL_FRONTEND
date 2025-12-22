"use client"
import DashboardLayout from '@/app/components/DashboardLayout'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

// Type definitions
interface Notice {
  id: number;
  title?: string;
  message?: string;
  posted_date?: string;
  valid_until?: string;
  important?: boolean;
  email?: string;
  notice_by?: string;
  notice_to?: string;
  type?: string;
  priority?: string;
  status?: string;
}



interface NoticeCardProps {
  notice: Notice;
  onView: () => void;
  onDelete: () => void;
  getTypeStyles: (type: string) => string;
  getTypeIcon: (type: string) => React.ReactNode;
  getPriorityBadge: (priority: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
}

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}
import {
  Bell,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  X,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  User,
  Calendar,
  Download,
  Share2,
  Pin,
  Star,
  BarChart3,
  TrendingUp,
  Zap,
  Sparkles
} from 'lucide-react'

const Notice_Page = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    myNotices: 0,
    forMe: 0,
    important: 0,
    active: 0
  });

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notices/`);
        setNotices(response.data || []);
        
        // Calculate stats
        const userInfo = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userInfo") || "{}") : {};
        const userEmail = userInfo?.email || "admin@school.com";
        
        const myNotices = response.data.filter((notice: Notice) => notice.notice_by === userEmail).length;
        const forMe = response.data.filter((notice: Notice) => !notice.notice_to || notice.notice_to === userEmail).length;
        const important = response.data.filter((notice: Notice) => notice.important).length;
        const active = response.data.filter((notice: Notice) => notice.status === 'active').length;

        setStats({
          total: response.data.length,
          myNotices,
          forMe,
          important,
          active
        });
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  // Get user info from localStorage
  const userInfo = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userInfo") || "{}") : {};
  const userEmail = userInfo?.email || "";
  
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'my' | 'forme' | 'important'>('all')
  const [searchTerm, setSearchTerm] = useState('')

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
        "https://school.globaltechsoftwaresolutions.cloud/api/notices/",
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



  const deleteNotice = async (id: number) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      try {
        await axios.delete(`https://school.globaltechsoftwaresolutions.cloud/api/notices/${id}/`);
        setNotices(notices.filter(notice => notice.id !== id));
        alert("✅ Notice deleted successfully!");
      } catch (error) {
        console.error("Error deleting notice:", error);
        alert("❌ Failed to delete notice.");
      }
    }
  }

  const getTypeStyles = (type: string) => {
    const styles = {
      info: 'bg-blue-50 text-blue-700 border-blue-200',
      warning: 'bg-amber-50 text-amber-700 border-amber-200',
      critical: 'bg-red-50 text-red-700 border-red-200',
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
    return styles[type as keyof typeof styles] || styles.info
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      info: <Info className="w-3 h-3 sm:w-4 sm:h-4" />,
      warning: <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />,
      critical: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />,
      success: <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
    }
    return icons[type as keyof typeof icons] || icons.info
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-red-100 text-red-700'
    }
    return styles[priority as keyof typeof styles] || styles.medium
  }

  const getPriorityIcon = (priority: string) => {
    const icons = {
      low: <TrendingUp className="w-3 h-3" />,
      medium: <BarChart3 className="w-3 h-3" />,
      high: <AlertTriangle className="w-3 h-3" />
    }
    return icons[priority as keyof typeof icons] || icons.medium
  }



  const myNotices = notices.filter(notice => notice.notice_by === userEmail);
  const forMeNotices = notices.filter(notice => !notice.notice_to || notice.notice_to === userEmail);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 font-medium text-base sm:text-lg">Loading notices...</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Getting everything ready for you</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-gray-900 to-blue-900 bg-clip-text text-transparent">
                    Notice Management
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-1 sm:mt-2">
                    Create, manage, and track all system notices
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base w-full xs:w-auto"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                Create Notice
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-xl sm:rounded-2xl shadow-sm border border-blue-200/30 p-3 sm:p-4 lg:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300 col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/5 rounded-full -translate-y-4 sm:-translate-y-6 translate-x-4 sm:translate-x-6"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Notices</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-xl sm:rounded-2xl shadow-sm border border-emerald-200/30 p-3 sm:p-4 lg:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500/5 rounded-full -translate-y-4 sm:-translate-y-6 translate-x-4 sm:translate-x-6"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">My Notices</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.myNotices}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-xl sm:rounded-2xl shadow-sm border border-purple-200/30 p-3 sm:p-4 lg:p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/5 rounded-full -translate-y-4 sm:-translate-y-6 translate-x-4 sm:translate-x-6"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">For Me</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.forMe}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
              </div>
            </div>  
          </div>

          {/* Search and Filters */}
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search notices by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-4 border border-gray-300/60 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm sm:text-base"
                />
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
                <div className="flex flex-wrap gap-1 sm:gap-2 bg-gray-100 p-1 rounded-lg sm:rounded-xl">
                  {[
                    { id: 'all', label: 'All', icon: Bell },
                    { id: 'my', label: 'My', icon: User },
                    { id: 'forme', label: 'For Me', icon: Users },
                    { id: 'important', label: 'Important', icon: Star }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id as 'all' | 'my' | 'forme' | 'important')}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm ${
                        activeFilter === filter.id
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-200/50'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <filter.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notices Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Notices Given By Me */}
            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl sm:rounded-2xl shadow-sm border border-blue-200/30 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <span className="hidden xs:inline">Notices Given By Me</span>
                  <span className="xs:hidden">My Notices</span>
                  <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium">
                    {myNotices.length}
                  </span>
                </h2>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {myNotices.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Bell className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No notices given by you</p>
                  </div>
                ) : (
                  myNotices.map((notice: Notice) => (
                    <NoticeCard 
                      key={notice.id} 
                      notice={notice} 
                      onView={() => setSelectedNotice(notice)}
                      onDelete={() => deleteNotice(notice.id)}
                      getTypeStyles={getTypeStyles}
                      getTypeIcon={getTypeIcon}
                      getPriorityBadge={getPriorityBadge}
                      getPriorityIcon={getPriorityIcon}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Notices For Me */}
            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl sm:rounded-2xl shadow-sm border border-purple-200/30 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <div className="p-1 sm:p-2 bg-purple-100 rounded-lg">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <span className="hidden xs:inline">Notices For Me</span>
                  <span className="xs:hidden">For Me</span>
                  <span className="bg-purple-100 text-purple-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium">
                    {forMeNotices.length}
                  </span>
                </h2>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {forMeNotices.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Bell className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No notices for you</p>
                  </div>
                ) : (
                  forMeNotices.map((notice: Notice) => (
                    <NoticeCard 
                      key={notice.id} 
                      notice={notice} 
                      onView={() => setSelectedNotice(notice)}
                      onDelete={() => deleteNotice(notice.id)}
                      getTypeStyles={getTypeStyles}
                      getTypeIcon={getTypeIcon}
                      getPriorityBadge={getPriorityBadge}
                      getPriorityIcon={getPriorityIcon}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Create Notice Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border border-gray-200/60">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 flex justify-between items-center rounded-t-2xl sm:rounded-t-3xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1 sm:p-2 bg-white/20 rounded-lg">
                      <Plus className="h-4 w-4 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">Create New Notice</h2>
                      <p className="text-blue-100 text-xs sm:text-sm">Share important information with the community</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="p-1 sm:p-2 hover:bg-white/20 rounded-lg sm:rounded-xl transition-colors duration-300"
                  >
                    <X className="h-4 w-4 sm:h-6 sm:w-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateNotice} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newNotice.title}
                      onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300/60 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300 text-sm sm:text-base"
                      placeholder="Enter a clear and concise title..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      Content *
                    </label>
                    <textarea
                      required
                      value={newNotice.content}
                      onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                      rows={4}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300/60 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300 text-sm sm:text-base"
                      placeholder="Provide detailed information about the notice..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                        <Info className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                        Type
                      </label>
                      <select
                        value={newNotice.type}
                        onChange={(e) => setNewNotice({...newNotice, type: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300/60 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300 text-sm sm:text-base"
                      >
                        <option value="info">📋 Information</option>
                        <option value="warning">⚠️ Warning</option>
                        <option value="critical">🚨 Critical</option>
                        <option value="success">✅ Success</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                        Priority
                      </label>
                      <select
                        value={newNotice.priority}
                        onChange={(e) => setNewNotice({...newNotice, priority: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300/60 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300 text-sm sm:text-base"
                      >
                        <option value="low">📈 Low</option>
                        <option value="medium">📊 Medium</option>
                        <option value="high">🚨 High</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                        Notice To (Optional)
                      </label>
                      <input
                        type="text"
                        value={newNotice.notice_to}
                        onChange={(e) => setNewNotice({ ...newNotice, notice_to: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300/60 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300 text-sm sm:text-base"
                        placeholder="Leave empty for all users"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        Valid Until
                      </label>
                      <input
                        type="datetime-local"
                        value={newNotice.valid_until}
                        onChange={(e) => setNewNotice({ ...newNotice, valid_until: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300/60 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-300 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-amber-50 rounded-lg sm:rounded-xl border border-amber-200">
                    <input
                      type="checkbox"
                      checked={newNotice.important}
                      onChange={(e) => setNewNotice({ ...newNotice, important: e.target.checked })}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
                    />
                    <div>
                      <label className="text-sm font-semibold text-amber-800">Mark as Important</label>
                      <p className="text-xs text-amber-600">This notice will be highlighted for all users</p>
                    </div>
                  </div>

                  <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200/60">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      📢 Publish Notice
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notice Detail Modal */}
          {selectedNotice && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border border-gray-200/60">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 flex justify-between items-center rounded-t-2xl sm:rounded-t-3xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1 sm:p-2 bg-white/20 rounded-lg">
                      <Bell className="h-4 w-4 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold truncate">{selectedNotice.title}</h2>
                      <p className="text-blue-100 text-xs sm:text-sm">Notice Details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="p-1 sm:p-2 hover:bg-white/20 rounded-lg sm:rounded-xl transition-colors duration-300 flex-shrink-0"
                  >
                    <X className="h-4 w-4 sm:h-6 sm:w-6" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Notice Content */}
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{selectedNotice.message}</p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                        <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                        Basic Information
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        <InfoRow label="Posted Date" value={selectedNotice.posted_date} />
                        <InfoRow label="Notice By" value={selectedNotice.notice_by || '-'} />
                        <InfoRow label="Email" value={selectedNotice.email || '-'} />
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                        Status & Settings
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        <InfoRow 
                          label="Important" 
                          value={
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                              selectedNotice.important 
                                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {selectedNotice.important ? 'Yes' : 'No'}
                            </span>
                          } 
                        />
                        <InfoRow label="Notice To" value={selectedNotice.notice_to || 'All Users'} />
                        <InfoRow label="Valid Until" value={selectedNotice.valid_until || 'Not specified'} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200/60">
                    <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium text-xs sm:text-sm">
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      Share
                    </button>
                    <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200 font-medium text-xs sm:text-sm">
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

// Enhanced Notice Card Component
const NoticeCard = ({ notice, onView, onDelete, getTypeStyles, getTypeIcon, getPriorityBadge, getPriorityIcon }: NoticeCardProps) => (
  <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/60 p-3 sm:p-4 hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-start justify-between mb-2 sm:mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getTypeStyles(notice.type || 'info')}`}>
            {getTypeIcon(notice.type || 'info')}
            <span className="hidden xs:inline">{notice.type || 'info'}</span>
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(notice.priority || 'medium')}`}>
            {getPriorityIcon(notice.priority || 'medium')}
            <span className="hidden xs:inline">{notice.priority || 'medium'}</span>
          </span>
          {notice.important && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              <Pin className="h-3 w-3" />
              <span className="hidden xs:inline">Important</span>
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm sm:text-base">
          {notice.title}
        </h3>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
        <button
          onClick={onView}
          className="p-1 sm:p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          title="View Details"
        >
          <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 sm:p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
          title="Delete Notice"
        >
          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
        </button>
      </div>
    </div>
    
    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{notice.message}</p>
    
    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 xs:gap-2 text-xs text-gray-500">
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {notice.posted_date}
        </span>
        {notice.valid_until && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">Valid until: </span>
            {notice.valid_until}
          </span>
        )}
      </div>
      <span className="text-gray-400 truncate max-w-[120px] sm:max-w-none">By: {notice.notice_by || 'System'}</span>
    </div>
  </div>
);

// Enhanced InfoRow Component
const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-xs sm:text-sm font-medium text-gray-600">{label}</span>
    <span className="text-xs sm:text-sm text-gray-900 text-right font-medium max-w-[60%] truncate">{value}</span>
  </div>
);

export default Notice_Page
