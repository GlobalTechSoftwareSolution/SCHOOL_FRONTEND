"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { 
  FileText, 
  Users, 
  BookOpen, 
  AlertCircle, 
  Loader2, 
  Download,
  Eye,
  Calendar,
  Mail,
  User,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  Upload,
  FileUp,
  Trash2,
  Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/";

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

interface Student {
  id: number;
  fullname: string;
  email: string;
  class_name: string;
  section: string;
}

const TeacherDocumentsPage = () => {
  const [activeTab, setActiveTab] = useState<"teacher" | "student" | "pending">("teacher");
  const [teacherEmail, setTeacherEmail] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [teacherDocument, setTeacherDocument] = useState<Document | null>(null);

  // Teacher document types for upload
  const teacherDocumentTypes = [
    { key: 'resume', label: 'Resume/CV', required: false },
    { key: 'id_proof', label: 'ID Proof', required: false },
    { key: 'degree', label: 'Degree Certificate', required: false },
    { key: 'masters', label: 'Masters Certificate', required: false },
    { key: 'certificates', label: 'Other Certificates', required: false },
    { key: 'award', label: 'Awards', required: false }
  ];

  // ✅ Step 1: Get teacher email
  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      const user = JSON.parse(stored);
      setTeacherEmail(user.email);
    }
  }, []);

  // ✅ Step 2: Fetch all documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}documents/`);
      setDocuments(res.data);
    } catch (err) {
      console.error("❌ Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 3: Fetch teacher's students via timetable
  const fetchTeacherStudents = async (teacherEmail: string) => {
    try {
      const timetableRes = await axios.get(`${API_URL}timetable/`);
      const teacherClasses = timetableRes.data.filter(
        (t: any) => t.teacher?.toLowerCase() === teacherEmail.toLowerCase()
      );

      const classList = teacherClasses.map((t: any) => ({
        class_name: t.class_name,
        section: t.section,
      }));

      const studentsRes = await axios.get(`${API_URL}students/`);
      const teacherStudents = studentsRes.data.filter((s: any) =>
        classList.some(
          (cls: any) =>
            cls.class_name === s.class_name && cls.section === s.section
        )
      );

      setStudents(teacherStudents);
    } catch (err) {
      console.error("❌ Error fetching teacher students:", err);
    }
  };

  // ✅ Step 4: Identify pending students
  const findPendingStudents = () => {
    const studentEmails = students.map((s) => s.email.toLowerCase());
    const studentsWithDocs = documents.map((d) => d.email.toLowerCase());

    // Missing documents: no document entry at all
    const missingDocs = students.filter(
      (s) => !studentsWithDocs.includes(s.email.toLowerCase())
    );

    // Partial (uploaded but incomplete)
    const incompleteDocs = documents
      .filter(
        (d) =>
          studentEmails.includes(d.email.toLowerCase()) &&
          Object.values(d).filter(
            (v) => typeof v === "string" && v.startsWith("http")
          ).length < 3 // less than 3 uploaded docs = incomplete
      )
      .map((d) => students.find((s) => s.email === d.email))
      .filter(Boolean) as Student[];

    const combinedPending = [...missingDocs, ...incompleteDocs];
    setPendingStudents(combinedPending);
  };

  // ✅ Step 5: Filter based on tab
  useEffect(() => {
    if (!teacherEmail || documents.length === 0) return;

    if (activeTab === "teacher") {
      const teacherDocs = documents.filter(
        (d) => d.email?.toLowerCase() === teacherEmail.toLowerCase()
      );
      setFilteredDocs(teacherDocs);
    } else if (activeTab === "student") {
      const studentEmails = students.map((s) => s.email.toLowerCase());
      const studentDocs = documents.filter((d) =>
        studentEmails.includes(d.email.toLowerCase())
      );
      setFilteredDocs(studentDocs);
    } else if (activeTab === "pending") {
      findPendingStudents();
    }
  }, [activeTab, documents, teacherEmail, students]);

  // ✅ Step 6: Initial data load
  useEffect(() => {
    if (teacherEmail) {
      Promise.all([fetchDocuments(), fetchTeacherStudents(teacherEmail)]);
    }
  }, [teacherEmail]);

  // ✅ Step 7: Get teacher's document
  useEffect(() => {
    if (teacherEmail && documents.length > 0) {
      const teacherDoc = documents.find(d => d.email === teacherEmail);
      setTeacherDocument(teacherDoc || null);
    }
  }, [teacherEmail, documents]);

  // ✅ Upload teacher document
  const uploadTeacherDocument = async (documentType: string, file: File) => {
    if (!teacherEmail) {
      alert("Teacher email not found. Please refresh the page.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

      // First check if teacher already has a document entry
      const existingDoc = documents.find(d => d.email === teacherEmail);
      
      if (existingDoc) {
        // Update existing document
        const updateData = {
          [documentType]: `https://example.com/${documentType}_${Date.now()}.pdf` // Simulate upload URL
        };
        
        const updateResponse = await axios.patch(`${API_URL}documents/${existingDoc.id}/`, updateData);
      } else {
        // Create new document entry
        const newDocData = {
          email: teacherEmail,
          [documentType]: `https://example.com/${documentType}_${Date.now()}.pdf`, // Simulate upload URL
          uploaded_at: new Date().toISOString()
        };
        
        const createResponse = await axios.post(`${API_URL}documents/`, newDocData);
      }
      
      // Refresh documents after upload
      await fetchDocuments();
      
      // Show success message
      alert(`${documentType.replace(/_/g, ' ')} uploaded successfully!`);
      
    } catch (error) {
      console.error(`❌ Error uploading ${documentType}:`, error);
      alert(`Failed to upload ${documentType.replace(/_/g, ' ')}. Please try again.`);
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
        alert('Please upload a PDF or image file (JPG, PNG)');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
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

  // ✅ Get document count for student
  const getStudentDocumentCount = (studentEmail: string) => {
    const studentDoc = documents.find(d => d.email === studentEmail);
    if (!studentDoc) return 0;
    return Object.values(studentDoc).filter(
      (v) => typeof v === "string" && v.startsWith("http")
    ).length;
  };

  // ✅ Get document status
  const getDocumentStatus = (student: Student) => {
    const docCount = getStudentDocumentCount(student.email);
    if (docCount === 0) return { status: "missing", color: "red", text: "No Documents" };
    if (docCount < 3) return { status: "incomplete", color: "yellow", text: "Incomplete" };
    return { status: "complete", color: "green", text: "Complete" };
  };

  // ✅ Filter students based on search
  const filteredPendingStudents = pendingStudents.filter(student =>
    student.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudentDocs = filteredDocs.filter(doc =>
    doc.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
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
                      Document Management
                    </h1>
                    <p className="text-gray-600 mt-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Manage and track academic documents efficiently
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
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                  <p className="text-gray-600 text-sm">Total Documents</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                  <p className="text-gray-600 text-sm">Total Students</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingStudents.length}
                  </p>
                  <p className="text-gray-600 text-sm">Pending Documents</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.length - pendingStudents.length}
                  </p>
                  <p className="text-gray-600 text-sm">Completed</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-2 mb-8 border border-white/20"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setActiveTab("teacher")}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === "teacher"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <BookOpen className="h-5 w-5" />
                My Documents
              </button>
              <button
                onClick={() => setActiveTab("student")}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === "student"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-green-50"
                }`}
              >
                <Users className="h-5 w-5" />
                Student Documents
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === "pending"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-yellow-50"
                }`}
              >
                <AlertCircle className="h-5 w-5" />
                Pending Documents
              </button>
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
              {(activeTab === "student" || activeTab === "pending") && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab === 'student' ? 'students' : 'pending students'}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Teacher Documents */}
              {activeTab === "teacher" && (
                <div className="space-y-6">
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
                        {teacherDocumentTypes.map((docType) => (
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
                              {teacherDocument && teacherDocument[docType.key as keyof Document] ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-center gap-2 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Uploaded</span>
                                  </div>
                                  <button
                                    onClick={() => window.open(teacherDocument[docType.key as keyof Document] as string, '_blank')}
                                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Document
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <p className="text-sm text-gray-500">No document uploaded</p>
                                  <label className="block">
                                    <input
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => handleFileUpload(docType.key, e)}
                                      className="hidden"
                                      disabled={uploading}
                                    />
                                    <div className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                      {uploading && uploadProgress[docType.key] !== undefined ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          {uploadProgress[docType.key]}%
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="h-4 w-4" />
                                          Upload
                                        </>
                                      )}
                                    </div>
                                  </label>
                                </div>
                              )}
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
                            {getDocTypes(teacherDocument).map((doc, index) => (
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
                </div>
              )}

              {/* Student Documents */}
              {activeTab === "student" && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20">
                  <div className="p-6 border-b border-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <Users className="h-6 w-6 text-green-600" />
                      Student Documents
                      <span className="text-sm font-normal text-gray-500 bg-green-100 px-3 py-1 rounded-full">
                        {filteredStudentDocs.length} students
                      </span>
                    </h2>
                  </div>

                  <div className="p-6">
                    {filteredStudentDocs.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          No Student Documents Found
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm ? "No students match your search." : "No students have uploaded documents yet."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredStudentDocs.map((doc) => {
                          const student = students.find(s => s.email === doc.email);
                          const types = getDocTypes(doc);
                          const docCount = types.length;
                          
                          return (
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                      <User className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-gray-900">
                                        {student?.fullname || doc.email}
                                      </h3>
                                      <p className="text-gray-600 text-sm">{doc.email}</p>
                                    </div>
                                  </div>
                                  {student && (
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <span>Class: {student.class_name}</span>
                                      <span>Section: {student.section}</span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        docCount >= 3 
                                          ? 'bg-green-100 text-green-700'
                                          : docCount > 0
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-red-100 text-red-700'
                                      }`}>
                                        {docCount} Documents
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="grid gap-3">
                                {types.map((type) => (
                                  <div key={type.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="font-medium text-gray-700 capitalize">
                                      {type.label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">
                                        {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '—'}
                                      </span>
                                      <a
                                        href={type.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                      >
                                        <Download className="h-3 w-3" />
                                        Download
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pending Documents */}
              {activeTab === "pending" && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20">
                  <div className="p-6 border-b border-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                      Pending Document Submissions
                      <span className="text-sm font-normal text-gray-500 bg-yellow-100 px-3 py-1 rounded-full">
                        {filteredPendingStudents.length} students
                      </span>
                    </h2>
                  </div>

                  <div className="p-6">
                    {filteredPendingStudents.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          All Documents Submitted!
                        </h3>
                        <p className="text-gray-500">
                          🎉 All students have completed their document submissions.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredPendingStudents.map((student, index) => {
                          const status = getDocumentStatus(student);
                          const docCount = getStudentDocumentCount(student.email);
                          
                          return (
                            <motion.div
                              key={student.email}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-white rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <User className="h-6 w-6 text-yellow-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-gray-900">
                                      {student.fullname}
                                    </h3>
                                    <p className="text-gray-600 text-sm">{student.email}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-sm text-gray-500">
                                        {student.class_name} - {student.section}
                                      </span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        status.color === 'green' 
                                          ? 'bg-green-100 text-green-700'
                                          : status.color === 'yellow'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-red-100 text-red-700'
                                      }`}>
                                        {docCount} / 3 Documents
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {status.status === "missing" && <XCircle className="h-5 w-5 text-red-500" />}
                                  {status.status === "incomplete" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                                  <span className={`font-medium ${
                                    status.color === 'green' ? 'text-green-600' :
                                    status.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {status.text}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
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