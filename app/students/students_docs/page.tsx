"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface StudentDocs {
  id_proof: string | null;
  transfer_certificate: string | null;
  degree: string | null;
  masters: string | null;
  marks_card: string | null;
  certificates: string | null;
  award: string | null;
  resume: string | null;
  tenth: string | null;
  twelth: string | null;
  uploaded_at: string;
  email: string;
}

const StudentDocsPage = () => {
  const [docs, setDocs] = useState<StudentDocs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getFileIcon = (name: string) => {
    if (!name) return "📄";
    const ext = name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "📕";
      case "doc":
      case "docx":
        return "📘";
      case "xls":
      case "xlsx":
        return "📗";
      case "jpg":
      case "jpeg":
      case "png":
        return "🖼️";
      default:
        return "📄";
    }
  };

  const getFileType = (url: string) => {
    if (!url) return "Unknown";
    const ext = url.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "PDF Document";
      case "doc":
      case "docx":
        return "Word Document";
      case "xls":
      case "xlsx":
        return "Excel Spreadsheet";
      case "jpg":
      case "jpeg":
      case "png":
        return "Image File";
      default:
        return "Document";
    }
  };

  const getCategoryColor = (docName: string) => {
    if (docName.toLowerCase().includes("certificate")) return "from-green-500 to-emerald-600";
    if (docName.toLowerCase().includes("degree") || docName.toLowerCase().includes("masters")) return "from-blue-500 to-cyan-600";
    if (docName.toLowerCase().includes("marks") || docName.toLowerCase().includes("tenth") || docName.toLowerCase().includes("twelth")) return "from-purple-500 to-indigo-600";
    if (docName.toLowerCase().includes("resume")) return "from-orange-500 to-amber-600";
    if (docName.toLowerCase().includes("award")) return "from-pink-500 to-rose-600";
    return "from-gray-500 to-slate-600";
  };

  const getCategoryIcon = (docName: string) => {
    if (docName.toLowerCase().includes("certificate")) return "🏆";
    if (docName.toLowerCase().includes("degree") || docName.toLowerCase().includes("masters")) return "🎓";
    if (docName.toLowerCase().includes("marks") || docName.toLowerCase().includes("tenth") || docName.toLowerCase().includes("twelth")) return "📊";
    if (docName.toLowerCase().includes("resume")) return "📄";
    if (docName.toLowerCase().includes("award")) return "⭐";
    if (docName.toLowerCase().includes("id")) return "🆔";
    return "📁";
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ Extract email from multiple possible localStorage keys
        const getStoredEmail = () => {
          try {
            const direct = localStorage.getItem("email");
            if (direct) return direct;

            const userInfoStr = localStorage.getItem("userInfo");
            if (userInfoStr) {
              const userInfo = JSON.parse(userInfoStr);
              if (userInfo?.email) return userInfo.email;
            }

            const userDataStr = localStorage.getItem("userData");
            if (userDataStr) {
              const userData = JSON.parse(userDataStr);
              if (userData?.email) return userData.email;
            }
          } catch (err) {
            console.warn("Failed to parse localStorage keys for email", err);
          }
          return null;
        };

        const email = getStoredEmail();
        if (!email) {
          setError("No student email found. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          "https://globaltechsoftwaresolutions.cloud/school-api/api/documents/"
        );
        
        // API might return an array of all documents
        const allDocs = Array.isArray(res.data) ? res.data : [res.data];
        
        // Find the document that matches the student's email
        const studentDoc = allDocs.find(
          (d: any) => d.email && d.email.toLowerCase() === email.toLowerCase()
        );
        
        if (!studentDoc) {
          console.warn("No documents found for this student email:", email);
          setDocs(null);
          return;
        }
        
        setDocs(studentDoc);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Failed to load documents. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const formattedDocs =
    docs &&
    Object.entries(docs)
      .filter(([key, value]) => typeof value === "string" && value && key !== "email" && key !== "uploaded_at")
      .map(([key, value]) => ({
        id: key,
        name: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        url: value as string,
        uploaded_at: docs.uploaded_at,
        fileType: getFileType(value),
        category: key,
      }))
      .filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileType.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleDocClick = (doc: any) => {
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoc(null);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: formattedDocs?.length || 0,
    certificates: formattedDocs?.filter(d => d.name.toLowerCase().includes("certificate")).length || 0,
    academic: formattedDocs?.filter(d => 
      d.name.toLowerCase().includes("degree") || 
      d.name.toLowerCase().includes("masters") ||
      d.name.toLowerCase().includes("tenth") ||
      d.name.toLowerCase().includes("twelth")
    ).length || 0,
    others: formattedDocs?.filter(d => 
      !d.name.toLowerCase().includes("certificate") &&
      !d.name.toLowerCase().includes("degree") &&
      !d.name.toLowerCase().includes("masters") &&
      !d.name.toLowerCase().includes("tenth") &&
      !d.name.toLowerCase().includes("twelth")
    ).length || 0,
  };

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading your documents...</div>
            <p className="text-gray-500 mt-2">Getting all your files ready</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-red-600 font-semibold text-lg mb-2">Document Error</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Documents
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Access all your academic certificates, records, and important documents in one place
            </p>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Total Documents</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Certificates</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.certificates}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">🎓</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Academic</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.academic}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">📁</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Others</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.others}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/50">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search documents by name or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </div>
                </div>
              </div>
              {docs?.uploaded_at && (
                <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-xl">
                  Last updated: {new Date(docs.uploaded_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Documents Grid */}
          {formattedDocs && formattedDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {formattedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => handleDocClick(doc)}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                    {/* Document Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
                        {getFileIcon(doc.url)}
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getCategoryColor(doc.name)} text-white`}>
                        {getCategoryIcon(doc.name)} {doc.category.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Document Info */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {doc.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 flex-1">
                      {doc.fileType}
                    </p>

                    {/* Upload Date */}
                    <div className="text-xs text-gray-500 mb-4">
                      Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(doc.url, '_blank');
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-xl text-sm font-semibold text-center transition-all duration-300 transform hover:scale-105"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(doc.url, `${doc.name}.${doc.url.split('.').pop()}`);
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-xl text-sm font-semibold text-center transition-all duration-300 transform hover:scale-105"
                      >
                        ⬇️ Download
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-12 text-center border border-white/50">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {searchTerm ? "No matching documents found" : "No documents found"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? "Try adjusting your search terms"
                  : "You haven't uploaded any documents yet."
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Document Detail Modal */}
        {isModalOpen && selectedDoc && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div 
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-3xl p-6 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-3xl">
                        {getFileIcon(selectedDoc.url)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedDoc.name}</h2>
                        <p className="text-blue-100">{selectedDoc.fileType}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full bg-white/20 flex items-center gap-1 w-fit`}>
                      {getCategoryIcon(selectedDoc.name)} {selectedDoc.category.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors ml-4"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Document Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Upload Date</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(selectedDoc.uploaded_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Document Type</div>
                    <div className="font-semibold text-gray-900">{selectedDoc.fileType}</div>
                  </div>
                </div>

                {/* File Preview Area */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Document Preview</h3>
                  <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                    <div className="text-6xl mb-4">{getFileIcon(selectedDoc.url)}</div>
                    <p className="text-gray-600 mb-4">Preview not available in this view</p>
                    <p className="text-sm text-gray-500">
                      Click the buttons below to view or download the actual file
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => window.open(selectedDoc.url, '_blank')}
                    className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>👁️</span>
                    View Document
                  </button>
                  <button
                    onClick={() => downloadFile(selectedDoc.url, `${selectedDoc.name}.${selectedDoc.url.split('.').pop()}`)}
                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>⬇️</span>
                    Download
                  </button>
                </div>
              </div>

              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default StudentDocsPage;