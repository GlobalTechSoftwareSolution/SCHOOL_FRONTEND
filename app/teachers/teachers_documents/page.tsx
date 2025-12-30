"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  FileText,
  BookOpen,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  User,
  CheckCircle,
  Upload,
  FileUp,
  Search,
  X
} from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents`;

interface Document {
  id: number;
  tenth?: string | null;
  twelth?: string | null;
  degree?: string | null;
  masters?: string | null;
  marks_card?: string | null;
  certificates?: string | null;
  award?: string | null;
  resume?: string | null;
  id_proof?: string | null;
  transfer_certificate?: string | null;
  study_certificate?: string | null;
  conduct_certificate?: string | null;
  student_id_card?: string | null;
  admit_card?: string | null;
  fee_receipt?: string | null;
  achievement_crt?: string | null;
  bonafide_crt?: string | null;
  uploaded_at?: string;
  email: string;
}

// Popup Modal Component
const PopupModal = ({ isOpen, onClose, title, message, type }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error': return <AlertCircle className="h-6 w-6 text-red-500" />;
      default: return <FileText className="h-6 w-6 text-blue-500" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`rounded-2xl shadow-xl w-full max-w-md ${getColorClasses()} border-2`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-gray-700 mb-6">{message}</p>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const TeacherDocumentsPage = () => {
  const [teacherEmail, setTeacherEmail] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [teacherDocument, setTeacherDocument] = useState<Document | null>(null);

  // Popup modal state
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });

  // Teacher document types for upload - expanded to include all possible document types
  const teacherDocumentTypes = [
    { key: 'resume', label: 'Resume/CV', required: false },
    { key: 'id_proof', label: 'ID Proof', required: false },
    { key: 'degree', label: 'Degree Certificate', required: false },
    { key: 'masters', label: 'Masters Certificate', required: false },
    { key: 'certificates', label: 'Other Certificates', required: false },
    { key: 'award', label: 'Awards', required: false },
    { key: 'tenth', label: '10th Certificate', required: false },
    { key: 'twelth', label: '12th Certificate', required: false },
    { key: 'marks_card', label: 'Marks Card', required: false },
    { key: 'transfer_certificate', label: 'Transfer Certificate', required: false },
    { key: 'study_certificate', label: 'Study Certificate', required: false },
    { key: 'conduct_certificate', label: 'Conduct Certificate', required: false },
    { key: 'admit_card', label: 'Admit Card', required: false },
    { key: 'achievement_crt', label: 'Achievement Certificate', required: false },
    { key: 'bonafide_crt', label: 'Bonafide Certificate', required: false }
  ];

  // Show popup helper
  const showPopup = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    setPopup({ isOpen: true, title, message, type });
  };

  // Close popup helper
  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  // ✅ Step 1: Get teacher email
  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      const user = JSON.parse(stored);
      setTeacherEmail(user.email);
    }
  }, []);

  // ✅ Step 2: Fetch all documents
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/`);
      setDocuments(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (err) {
      console.error("❌ Error fetching documents:", err);
      showPopup("Error", "Failed to load documents. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Step 3: Get teacher's document
  useEffect(() => {
    if (teacherEmail && documents.length > 0) {
      const teacherDoc = documents.find(d =>
        d.email &&
        typeof d.email === "string" &&
        d.email.toLowerCase() === teacherEmail.toLowerCase()
      );
      setTeacherDocument(teacherDoc || null);
    }
  }, [teacherEmail, documents]);

  // ✅ Step 4: Initial data load
  useEffect(() => {
    if (teacherEmail) {
      fetchDocuments();
    }
  }, [teacherEmail, fetchDocuments]);

  // ✅ Upload teacher document
  const uploadTeacherDocument = async (documentType: string, file: File) => {
    if (!teacherEmail) {
      showPopup("Error", "Teacher email not found. Please refresh the page.", "error");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

      const formData = new FormData();
      formData.append("email", teacherEmail);
      formData.append("doc_type", documentType);
      formData.append(documentType, file);

      await axios.post(`${API_BASE}/upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [documentType]: progress }));
          }
        },
      });


      // Refresh documents after upload
      await fetchDocuments();

      // Show success message
      showPopup("Success", `${documentType.replace(/_/g, ' ')} uploaded successfully!`, "success");

    } catch (error: unknown) {
      console.error(`❌ Error uploading ${documentType}:`, error);
      showPopup("Upload Failed", `Failed to upload ${documentType.replace(/_/g, ' ')}. ${(error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Please try again."}`, "error");
    } finally {
      setUploading(false);
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    }
  };

  // ✅ Handle file upload
  const handleFileUpload = (documentType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        showPopup("Invalid File", 'Please upload a PDF or image file (JPG, PNG)', "error");
        return;
      }

      if (file.size > maxSize) {
        showPopup("File Too Large", 'File size must be less than 5MB', "error");
        return;
      }

      uploadTeacherDocument(documentType, file);
    }
  };

  // ✅ Get document types dynamically
  const getDocTypes = (doc: Document) => {
    const types: { label: string; link: string; type: string }[] = [];
    for (const [key, value] of Object.entries(doc)) {
      if (
        value &&
        typeof value === "string" &&
        value.startsWith("http") &&
        key !== "email"
      ) {
        types.push({
          label: key.replace(/_/g, " "),
          link: value,
          type: key
        });
      }
    }
    return types;
  };

  // ✅ Get document count for teacher
  const getTeacherDocumentCount = () => {
    if (!teacherDocument) return 0;
    return Object.values(teacherDocument).filter(
      (v) => typeof v === "string" && v.startsWith("http")
    ).length;
  };

  // ✅ Get pending document count
  const getPendingDocumentCount = () => {
    const uploadedCount = getTeacherDocumentCount();
    return teacherDocumentTypes.length - uploadedCount;
  };

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Popup Modal */}
          <PopupModal
            isOpen={popup.isOpen}
            onClose={closePopup}
            title={popup.title}
            message={popup.message}
            type={popup.type}
          />

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8 border border-white/20">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Teacher Document Management
                    </h1>
                    <p className="text-gray-600 mt-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Manage and track your professional documents
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">{teacherEmail}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {teacherDocumentTypes.length}
                  </p>
                  <p className="text-gray-600 text-sm">Total Document Types</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{getTeacherDocumentCount()}</p>
                  <p className="text-gray-600 text-sm">Uploaded Documents</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {getPendingDocumentCount()}
                  </p>
                  <p className="text-gray-600 text-sm">Pending Documents</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading documents...</p>
              </div>
            </div>
          )}

          {/* Content Area */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Search Bar */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search document types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Upload Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20">
                <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <FileUp className="h-6 w-6 text-blue-600" />
                    Upload Your Documents
                  </h2>
                  <p className="text-gray-600 mt-2">Upload your professional documents for school records</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacherDocumentTypes
                      .filter(docType =>
                        docType.label.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((docType) => (
                        <motion.div
                          key={docType.key}
                          whileHover={{ scale: 1.02 }}
                          className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                        >
                          <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Upload className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                              {docType.label}
                              {docType.required && <span className="text-red-500 ml-1">*</span>}
                            </h3>

                            {/* Check if document already exists */}
                            {teacherDocument && teacherDocument[docType.key as keyof Document] && (
                              <div className="mb-3">
                                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Uploaded</span>
                                </div>
                                <button
                                  onClick={() => window.open(teacherDocument[docType.key as keyof Document] as string, '_blank')}
                                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mb-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Current
                                </button>
                              </div>
                            )}

                            <div className="space-y-3">
                              <label className="block">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileUpload(docType.key, e)}
                                  className="hidden"
                                  disabled={uploading}
                                />
                                <div className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                                  {uploading && uploadProgress[docType.key] !== undefined ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      {uploadProgress[docType.key]}%
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4" />
                                      {teacherDocument?.[docType.key as keyof Document] ? "Upload New / Update" : "Upload Document"}
                                    </>
                                  )}
                                </div>
                              </label>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Accepted formats are PDF, JPG, and PNG. Maximum file size is 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Existing Documents Display */}
              {teacherDocument && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20">
                  <div className="p-6 border-b border-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                      Your Uploaded Documents
                    </h2>
                    <p className="text-gray-600 mt-1">Last updated: {teacherDocument.uploaded_at || 'Unknown'}</p>
                  </div>
                  <div className="p-6">
                    {getDocTypes(teacherDocument).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getDocTypes(teacherDocument)
                          .filter(doc =>
                            doc.label.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((doc, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 capitalize mb-2">
                                    {doc.label}
                                  </h4>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => window.open(doc.link, '_blank')}
                                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                      <Eye className="h-3 w-3" />
                                      View
                                    </button>
                                    <button
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = doc.link;
                                        link.download = `${doc.label}.pdf`;
                                        link.click();
                                      }}
                                      className="flex items-center gap-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                      <Download className="h-3 w-3" />
                                      Download
                                    </button>
                                  </div>
                                </div>
                                <FileText className="h-8 w-8 text-blue-500 ml-3" />
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Documents Uploaded</h3>
                        <p className="text-gray-500">Upload your documents using the form above</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDocumentsPage;