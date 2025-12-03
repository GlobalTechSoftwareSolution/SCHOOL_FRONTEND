"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useState, useEffect } from "react";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/notices/`;

interface Notice {
  id: number;
  title: string;
  message: string;
  important: boolean;
  notice_by: string;
  notice_to: string;
  valid_until: string;
  posted_date: string;
}

const AllNotice = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [principalEmail, setPrincipalEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [newNotice, setNewNotice] = useState({
    title: "",
    message: "",
    important: false,
    notice_by: "",
    notice_to: "All",
    valid_until: "",
    posted_date: new Date().toISOString().split('T')[0],
  });

  // ✅ Get principal email from localStorage
  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const parsedUser = JSON.parse(storedUserData);
        if (parsedUser.email) {
          setPrincipalEmail(parsedUser.email);
          setNewNotice((prev) => ({ ...prev, notice_by: parsedUser.email }));
        }
      }
    } catch (err) {
      console.error("Error reading userData from localStorage:", err);
    }
  }, []);

  // ✅ Fetch all notices
  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch notices");
      const data = await res.json();
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Could not load notices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // ✅ Show popup message
  const showPopup = (message: string, isSuccess: boolean) => {
    setPopupMessage(message);
    if (isSuccess) {
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } else {
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
    }
  };

  // ✅ Add new notice
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newNotice,
          notice_by: principalEmail,
        }),
      });
      
      if (!res.ok) throw new Error("Failed to create notice");
      
      showPopup("Notice added successfully!", true);
      setShowAddForm(false);
      setNewNotice({
        title: "",
        message: "",
        important: false,
        notice_by: principalEmail || "",
        notice_to: "All",
        valid_until: "",
        posted_date: new Date().toISOString().split('T')[0],
      });
      fetchNotices();
    } catch (err) {
      console.error(err);
      showPopup("Error adding notice. Please try again.", false);
    }
  };

  // Filter notices based on search
  const filteredNotices = notices.filter((notice) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (notice.title || "").toLowerCase().includes(searchLower) ||
      (notice.message || "").toLowerCase().includes(searchLower) ||
      (notice.notice_to || "").toLowerCase().includes(searchLower)
    );
  });

  // Reset form when modal closes
  const handleCloseForm = () => {
    setShowAddForm(false);
    setNewNotice({
      title: "",
      message: "",
      important: false,
      notice_by: principalEmail || "",
      notice_to: "All",
      valid_until: "",
      posted_date: new Date().toISOString().split('T')[0],
    });
  };

  return (
  <DashboardLayout role="principal">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
              <span>✅</span>
              <span>{popupMessage}</span>
            </div>
          </div>
        )}

        {/* Error Popup */}
        {showErrorPopup && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
              <span>❌</span>
              <span>{popupMessage}</span>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Notice Board
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Stay informed with the latest announcements, updates, and important information from the institution.
          </p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search notices by title, message, or recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add New Notice</span>
          </button>
        </div>

        {/* Add Notice Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Create New Notice</h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddNotice} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newNotice.title}
                      onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                      required
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter notice title"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                    <textarea
                      value={newNotice.message}
                      onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
                      required
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={4}
                      placeholder="Enter notice message"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      value={newNotice.valid_until}
                      onChange={(e) => setNewNotice({ ...newNotice, valid_until: e.target.value })}
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Posted Date</label>
                    <input
                      type="date"
                      value={newNotice.posted_date}
                      onChange={(e) => setNewNotice({ ...newNotice, posted_date: e.target.value })}
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notice By</label>
                    <input
                      type="text"
                      value={principalEmail || ""}
                      disabled
                      className="w-full border border-gray-300 p-3 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notice To</label>
                    <select
                      value={newNotice.notice_to}
                      onChange={(e) => setNewNotice({ ...newNotice, notice_to: e.target.value })}
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="All">All</option>
                      <option value="Teachers">Teachers</option>
                      <option value="Students">Students</option>
                      <option value="Parents">Parents</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="important"
                    checked={newNotice.important}
                    onChange={(e) => setNewNotice({ ...newNotice, important: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="important" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Mark as Important Notice
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Publish Notice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notices Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-red-800 font-semibold text-lg mb-2">Unable to Load Notices</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchNotices}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredNotices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 ${
                  notice.important 
                    ? "border-l-red-500 bg-red-50/30" 
                    : "border-l-green-500"
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                      {notice.title}
                    </h3>
                    {notice.important && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-sm">
                        IMPORTANT
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                    {notice.message}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">By:</span>
                      <span>{notice.notice_by || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">To:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {notice.notice_to || "All"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Posted:</span>
                      <span>
                        {notice.posted_date
                          ? new Date(notice.posted_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : "N/A"}
                      </span>
                    </div>
                    {notice.valid_until && (
                      <div className="flex justify-between">
                        <span className="font-medium">Valid Until:</span>
                        <span>
                          {new Date(notice.valid_until).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-lg">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-gray-700 font-semibold text-lg mb-2">No Notices Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first notice"}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl transition-colors duration-200"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl transition-all duration-200"
                >
                  Create Notice
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer Stats */}
        {!loading && !error && notices.length > 0 && (
          <div className="mt-12 text-center text-gray-500 text-sm">
            Showing {filteredNotices.length} of {notices.length} notices
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  </DashboardLayout>
  );
};

export default AllNotice;