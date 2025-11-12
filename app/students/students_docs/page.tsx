"use client";

import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface StudentDocs {
  email: string;
  uploaded_at: string;
  [key: string]: string | null;
}

interface UploadFormData {
  doc_type: string;
  file: File | null;
}

const StudentDocsPage = () => {
  const [docs, setDocs] = useState<StudentDocs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadForm, setUploadForm] = useState<UploadFormData>({
    doc_type: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

  // 🧠 Get logged-in student email from localStorage
  const getStoredEmail = (): string | null => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      const userData = localStorage.getItem("userData");
      if (userInfo) return JSON.parse(userInfo)?.email;
      if (userData) return JSON.parse(userData)?.email;
      return null;
    } catch {
      return null;
    }
  };

  // 📂 Fetch all documents for this student
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const email = getStoredEmail();
      if (!email) throw new Error("No logged-in user found.");

      const res = await axios.get(`${API_BASE}/documents/`);
      const allDocs = Array.isArray(res.data) ? res.data : [res.data];

      // Match document by student email
      const studentDoc = allDocs.find(
        (d: any) =>
          d.email &&
          (typeof d.email === "string"
            ? d.email.toLowerCase() === email.toLowerCase()
            : d.email.email?.toLowerCase() === email.toLowerCase())
      );

      setDocs(studentDoc || null);
    } catch (err) {
      console.error("❌ Error fetching documents:", err);
      setError("Failed to load documents. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 📤 Upload document (matches backend exactly)
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = getStoredEmail();
    const { doc_type, file } = uploadForm;

    if (!email || !doc_type || !file) {
      alert("⚠️ Please select a document type and file.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("doc_type", doc_type);
      formData.append(doc_type, file); // ✅ matches backend field key

      for (let [key, value] of formData.entries()) {
        console.log("🧾 FormData entry:", key, value);
      }

      const res = await axios.post(`${API_BASE}/documents/upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      console.log("✅ Upload success:", res.data);
      alert(`✅ ${doc_type.toUpperCase()} uploaded successfully!`);
      await fetchDocuments(); // refresh docs

      setUploadForm({ doc_type: "", file: null });
      setUploadProgress(0);
    } catch (err: any) {
      console.error("❌ Upload error:", err.response?.data || err);
      alert(`❌ ${err.response?.data?.error || "Upload failed. Try again."}`);
    } finally {
      setUploading(false);
    }
  };

  // 📃 Prepare document list for display
  const formattedDocs =
    docs &&
    Object.entries(docs)
      .filter(
        ([key, value]) =>
          typeof value === "string" && value && key !== "email" && key !== "uploaded_at"
      )
      .map(([key, value]) => ({
        key,
        name: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        url: value as string,
        type: key,
        uploaded_at: docs.uploaded_at
      }));

  const docOptions = [
    "tenth", "twelth", "degree", "masters", "marks_card", "certificates", "award",
    "resume", "id_proof", "transfer_certificate", "study_certificate", "conduct_certificate",
    "student_id_card", "admit_card", "fee_receipt", "achievement_crt", "bonafide_crt"
  ];

  const getDocIcon = (docType: string) => {
    const icons: { [key: string]: string } = {
      tenth: "🎓",
      twelth: "📚",
      degree: "🎓",
      masters: "🎓",
      marks_card: "📊",
      certificates: "🏆",
      award: "⭐",
      resume: "📄",
      id_proof: "🆔",
      transfer_certificate: "📑",
      study_certificate: "📖",
      conduct_certificate: "👨‍⚖️",
      student_id_card: "💳",
      admit_card: "🎫",
      fee_receipt: "🧾",
      achievement_crt: "🏅",
      bonafide_crt: "📜",
      default: "📁"
    };
    return icons[docType] || icons.default;
  };

  const getDocCategory = (docType: string) => {
    if (['tenth', 'twelth', 'degree', 'masters'].includes(docType)) return 'academic';
    if (['marks_card', 'certificates', 'award', 'achievement_crt'].includes(docType)) return 'achievements';
    if (['id_proof', 'student_id_card', 'admit_card'].includes(docType)) return 'identification';
    if (['transfer_certificate', 'study_certificate', 'conduct_certificate', 'bonafide_crt'].includes(docType)) return 'certificates';
    return 'other';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      academic: "from-blue-500 to-cyan-500",
      achievements: "from-green-500 to-emerald-500",
      identification: "from-purple-500 to-pink-500",
      certificates: "from-orange-500 to-red-500",
      other: "from-gray-500 to-slate-500"
    };
    return colors[category] || colors.other;
  };

  if (loading)
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600 font-medium">Loading your academic portfolio...</p>
          </div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Academic Document Portfolio
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Manage and organize all your academic documents in one secure location
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📤</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upload New Document</h2>
                <p className="text-gray-600">Add documents to your academic portfolio</p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document Type Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Document Type
                  </label>
                  <select
                    required
                    value={uploadForm.doc_type}
                    onChange={(e) => setUploadForm({ ...uploadForm, doc_type: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  >
                    <option value="">Select Document Type</option>
                    {docOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Document File
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="file"
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {uploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Uploading document...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full shadow-lg transition-all duration-300"
                    />
                  </div>
                </motion.div>
              )}

              {/* Upload Button */}
              <motion.button
                whileHover={{ scale: uploading ? 1 : 1.02 }}
                whileTap={{ scale: uploading ? 1 : 0.98 }}
                disabled={uploading}
                type="submit"
                className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Uploading Document...
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    Upload Document
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Documents Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-8">
                <div className="text-red-600 font-semibold">{error}</div>
              </div>
            )}

            {formattedDocs && formattedDocs.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="text-3xl">📚</span>
                    Your Documents ({formattedDocs.length})
                  </h2>
                  <div className="text-sm text-gray-600 bg-white/50 px-4 py-2 rounded-full">
                    Last updated: {docs?.uploaded_at ? new Date(docs.uploaded_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {formattedDocs.map((doc, index) => (
                      <motion.div
                        key={doc.key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
                        onClick={() => setSelectedDoc(doc)}
                      >
                        {/* Document Header */}
                        <div className={`bg-gradient-to-r ${getCategoryColor(getDocCategory(doc.type))} p-6 text-white`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-3xl">
                              {getDocIcon(doc.type)}
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                              {getDocCategory(doc.type).toUpperCase()}
                            </div>
                          </div>
                          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-100 transition-colors">
                            {doc.name}
                          </h3>
                        </div>

                        {/* Document Content */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                              {doc.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                            >
                              <span>👁️</span>
                              View
                            </a>
                            <a
                              href={doc.url}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-3 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                            >
                              <span>📥</span>
                              Download
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-16 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-8xl mb-6"
                >
                  📁
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Document Portfolio Empty</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Start building your academic portfolio by uploading your important documents. 
                  Your uploaded files will appear here for easy access and management.
                </p>
                <div className="text-4xl opacity-50">
                  ⬆️
                </div>
              </div>
            )}
          </motion.div>

          {/* Document Detail Modal */}
          <AnimatePresence>
            {selectedDoc && (
              <motion.div
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDoc(null)}
              >
                <motion.div
                  className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`bg-gradient-to-r ${getCategoryColor(getDocCategory(selectedDoc.type))} p-8 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl">
                        {getDocIcon(selectedDoc.type)}
                      </div>
                      <button
                        onClick={() => setSelectedDoc(null)}
                        className="text-white/80 hover:text-white text-2xl transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{selectedDoc.name}</h2>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                        {getDocCategory(selectedDoc.type).toUpperCase()}
                      </span>
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                        {selectedDoc.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Document Information</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Type:</span> {selectedDoc.type.replace(/_/g, ' ')}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {getDocCategory(selectedDoc.type)}
                          </div>
                          <div>
                            <span className="font-medium">Uploaded:</span> {selectedDoc.uploaded_at ? new Date(selectedDoc.uploaded_at).toLocaleDateString() : 'Recently'}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">File Actions</h3>
                        <div className="space-y-3">
                          <a
                            href={selectedDoc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                          >
                            <span>👁️</span>
                            View Document in Browser
                          </a>
                          <a
                            href={selectedDoc.url}
                            download
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                          >
                            <span>📥</span>
                            Download Document
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <p className="text-gray-600 text-sm">
                        This document is securely stored in your academic portfolio. You can access it anytime from any device.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDocsPage;