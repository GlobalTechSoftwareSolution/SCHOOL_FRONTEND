"use client";
import React, { useState, useEffect } from 'react';

const AllNotice = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('https://globaltechsoftwaresolutions.cloud/school-api/api/notices/')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch notices');
        const data = await res.json();
        // Get logged-in user email from localStorage or from stored token
        let userEmail = "";
        if (typeof window !== "undefined") {
          const tokenData = localStorage.getItem("userInfo");
          if (tokenData) {
            try {
              const parsed = JSON.parse(tokenData);
              userEmail = (parsed.email || "").trim().toLowerCase();
            } catch {
              userEmail = (localStorage.getItem("email") || "").trim().toLowerCase();
            }
          } else {
            userEmail = (localStorage.getItem("email") || "").trim().toLowerCase();
          }
        }
        // Filter notices for user
        const filteredData = (Array.isArray(data) ? data : []).filter((notice: any) => {
          const noticeTo = (notice.notice_to || "").trim().toLowerCase();
          return noticeTo === "" || noticeTo === "null" || noticeTo === userEmail;
        });
        // Map API fields to UI fields
        const mapped = filteredData.map((notice: any) => ({
          id: notice.id,
          title: notice.title,
          content: notice.message,
          type: notice.type || 'general',
          date: notice.posted_date,
          priority: notice.important === true ? 'high' : 'low',
          author: notice.notice_by,
          category: notice.category || 'General'
        }));
        setNotices(mapped);
        setLoading(false);
      })
      .catch((err) => {
        setError('Could not load notices.');
        setLoading(false);
      });
  }, []);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredNotices = notices.filter(notice => {
    const matchesType = filter === 'all' || notice.type === filter;
    const matchesPriority = priorityFilter === 'all' || notice.priority === priorityFilter;
    const matchesSearch =
      (notice.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notice.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notice.author || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesPriority && matchesSearch;
  });

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-4 border-l-green-500 bg-green-50';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-orange-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return '🔧';
      case 'update':
        return '🔄';
      case 'security':
        return '🔒';
      case 'general':
        return '📢';
      default:
        return '📌';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'text-blue-600 bg-blue-100';
      case 'update':
        return 'text-purple-600 bg-purple-100';
      case 'security':
        return 'text-red-600 bg-red-100';
      case 'general':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const clearFilters = () => {
    setFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Notice Board</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest announcements, updates, and important information
          </p>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search notices by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Filter Sections */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Type</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'general', 'maintenance', 'update', 'security'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                      filter === type
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Priority</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'high', 'medium', 'low'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setPriorityFilter(priority)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                      priorityFilter === priority
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredNotices.length}</span> of <span className="font-semibold">{notices.length}</span> notices
          </p>
          {(filter !== 'all' || priorityFilter !== 'all' || searchTerm) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{notices.length}</div>
              <div className="text-sm text-gray-600">Total Notices</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {notices.filter(n => n.priority === 'low').length}
              </div>
              <div className="text-sm text-gray-600">Low Priority</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {notices.filter(n => n.priority === 'medium').length}
              </div>
              <div className="text-sm text-gray-600">Medium Priority</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {notices.filter(n => n.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
          </div>
        </div>

        {/* Loading, Error, or Notices Grid */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading notices...</h3>
              <p className="text-gray-600 mb-6">
                Please wait while we fetch the latest notices.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Error loading notices</h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
            </div>
          </div>
        ) : filteredNotices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${getPriorityStyles(notice.priority)}`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(notice.type)}</span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(notice.type)}`}>
                        {notice.type}
                      </span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(notice.priority)}`}>
                      {notice.priority.toUpperCase()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {notice.title}
                  </h3>

                  {/* Content */}
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {notice.content}
                  </p>

                  {/* Category */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                      {notice.category}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {(notice.author || 'U').charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{notice.author}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {notice.date
                        ? new Date(notice.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No notices found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllNotice;