"use client";

import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface StudentDocs {
  email?: string | { email?: string };
  uploaded_at?: string;
  [key: string]: unknown;
}

interface UploadFormData {
  doc_type: string;
  file: File | null;
}

interface FormattedDoc {
  key: string;
  name: string;
  url: string;
  type: string;
  uploaded_at?: string;
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
  const [selectedDoc, setSelectedDoc] = useState<FormattedDoc | null>(null);

  const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents`;

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

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const email = getStoredEmail();
      if (!email) throw new Error("No logged-in user found.");

      const res = await axios.get(`${API_BASE}/`);
      const allDocs: StudentDocs[] = Array.isArray(res.data) ? res.data : [res.data];

      const studentDoc = allDocs.find(
        (d) =>
          d.email &&
          (typeof d.email === "string"
            ? d.email.toLowerCase() === email.toLowerCase()
            : d.email?.email?.toLowerCase() === email.toLowerCase())
      );

      setDocs(studentDoc || null);
    } catch {
      // Silently handle fetch errors
      setError("Failed to load documents. Try again later.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
      formData.append(doc_type, file);

      await axios.post(`${API_BASE}/upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      alert(`✅ ${doc_type.toUpperCase()} uploaded successfully!`);
      await fetchDocuments();

      setUploadForm({ doc_type: "", file: null });
      setUploadProgress(0);
    } catch (err: unknown) {
      // Silently handle upload errors
      const axiosError = err as { response?: { data?: { error?: string } } };
      alert(`❌ ${axiosError.response?.data?.error || "Upload failed. Try again."}`);
    } finally {
      setUploading(false);
    }
  };

  const formattedDocs: FormattedDoc[] =
    docs
      ? Object.entries(docs)
          .filter(
            ([key, value]) =>
              typeof value === "string" && value && key !== "email" && key !== "uploaded_at"
          )
          .map(([key, value]) => ({
            key,
            name: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            url: value as string,
            type: key,
            uploaded_at: typeof docs.uploaded_at === "string" ? docs.uploaded_at : undefined
          }))
      : [];

  const docOptions = [
    "tenth", "twelth", "degree", "masters", "marks_card", "certificates", "award",
    "resume", "id_proof", "transfer_certificate", "study_certificate", "conduct_certificate",
    "student_id_card", "admit_card", "fee_receipt", "achievement_crt", "bonafide_crt"
  ];

  const getDocIcon = (docType: string) => {
    const icons: { [key: string]: string } = {
      tenth: "📘",
      twelth: "📗",
      degree: "🎓",
      masters: "🎓",
      marks_card: "📊",
      certificates: "🏅",
      award: "⭐",
      resume: "📄",
      id_proof: "🆔",
      transfer_certificate: "📑",
      study_certificate: "📖",
      conduct_certificate: "📜",
      student_id_card: "💳",
      admit_card: "🎫",
      fee_receipt: "🧾",
      achievement_crt: "🏆",
      bonafide_crt: "📋",
      default: "📁"
    };
    return icons[docType] || icons.default;
  };

  if (loading)
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600 font-medium">Loading your documents...</p>
          </div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Document Management
            </h1>
            <p className="text-gray-600">
              Upload and manage your academic documents
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document Type Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select
                    required
                    value={uploadForm.doc_type}
                    onChange={(e) => setUploadForm({ ...uploadForm, doc_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File
                  </label>
                  <input
                    required
                    type="file"
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              {uploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1"
                >
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="bg-blue-600 h-1.5 rounded-full"
                    />
                  </div>
                </motion.div>
              )}

              {/* Upload Button */}
              <motion.button
                whileHover={{ scale: uploading ? 1 : 1.01 }}
                whileTap={{ scale: uploading ? 1 : 0.99 }}
                disabled={uploading}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Uploading...
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

          {/* Documents Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            )}

            {formattedDocs && formattedDocs.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Your Documents ({formattedDocs.length})
                  </h2>
                  <div className="text-xs text-gray-500">
                    Last updated: {docs?.uploaded_at ? new Date(docs.uploaded_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {formattedDocs.map((doc, index) => (
                      <motion.div
                        key={doc.key}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => setSelectedDoc(doc)}
                      >
                        {/* Document Header */}
                        <div className="bg-blue-50 p-4 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {getDocIcon(doc.type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 truncate">
                                {doc.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Recently'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Document Actions */}
                        <div className="p-3">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="block bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md text-center transition-colors"
                          >
                            <span>👁️</span>
                            View Document
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="text-4xl mb-4 text-gray-400">
                  📁
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                  Upload your first document to start building your academic portfolio.
                </p>
              </div>
            )}
          </motion.div>

          {/* Document Detail Modal */}
          <AnimatePresence>
            {selectedDoc && (
              <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDoc(null)}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-lg max-w-md w-full"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getDocIcon(selectedDoc.type)}
                        </div>
                        <div>
                          <h2 className="font-medium text-gray-900">{selectedDoc.name}</h2>
                          <p className="text-xs text-gray-500">
                            {selectedDoc.type.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedDoc(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-md p-3">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Document Details</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="text-gray-900">{selectedDoc.type.replace(/_/g, ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Uploaded:</span>
                            <span className="text-gray-900">
                              {selectedDoc.uploaded_at ? new Date(selectedDoc.uploaded_at).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-900">Actions</h3>
                        <a
                          href={selectedDoc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md text-center transition-colors"
                        >
                          View Document
                        </a>
                      </div>
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