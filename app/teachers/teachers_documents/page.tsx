"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { 
  Plus, 
  X, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Upload, 
  Calendar, 
  Users, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Eye,
  MoreVertical
} from "lucide-react";

const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/";

interface Document {
  id: number;
  conduct_certificate: string | null;
  transfer_certificate: string | null;
  study_certificate: string | null;
  id_proof: string | null;
  resume: string | null;
  award: string | null;
  certificates: string | null;
  marks_card: string | null;
  masters: string | null;
  degree: string | null;
  student_id_card: string | null;
  admit_card: string | null;
  fee_receipt: string | null;
  achievement_crt: string | null;
  bonafide_crt: string | null;
  student_email?: string;
  student_name?: string;
  class_name?: string;
  section?: string;
  issue_date?: string;
  expiry_date?: string;
  status?: "Issued" | "Pending" | "Expired";
  created_at?: string;
}

interface Student {
  id: number;
  fullname: string;
  email: string;
  class_name: string;
  section: string;
}

const TeachersDocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    issued: 0,
    pending: 0,
    expired: 0
  });

  const [teacherEmail, setTeacherEmail] = useState<string>("");
  const [teacherName, setTeacherName] = useState<string>("");

  const [newDocument, setNewDocument] = useState({
    conduct_certificate: null as string | null,
    transfer_certificate: null as string | null,
    study_certificate: null as string | null,
    id_proof: null as string | null,
    resume: null as string | null,
    award: null as string | null,
    certificates: null as string | null,
    marks_card: null as string | null,
    masters: null as string | null,
    degree: null as string | null,
    student_id_card: null as string | null,
    admit_card: null as string | null,
    fee_receipt: null as string | null,
    achievement_crt: null as string | null,
    bonafide_crt: null as string | null,
    student_email: "",
    student_name: "",
    class_name: "",
    section: "",
    issue_date: "",
    expiry_date: "",
    status: "Issued" as const,
    created_at: ""
  });

  // Get teacher info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      setTeacherEmail(user.email);
      setTeacherName(user.name || "Teacher");
    }
  }, []);

  // Fetch documents and students
  const fetchDocuments = async () => {
    if (!teacherEmail) return;
    
    try {
      setLoading(true);
      console.log("Fetching documents for teacher:", teacherEmail);
      
      // First, get teacher's timetable to find their assigned classes
      const timetableRes = await axios.get(`${API_URL}timetable/`).catch(err => {
        console.warn("Timetable API failed:", err.message);
        return { data: [] };
      });

      // Filter timetable by teacher email to get their classes
      const teacherTimetable = timetableRes.data.filter(
        (t: any) => t.teacher === teacherEmail
      );

      // Get unique classes taught by this teacher
      const teacherClasses = teacherTimetable.reduce((acc: any[], curr: any) => {
        if (
          !acc.find(
            (a) =>
              a.class_name === curr.class_name && a.section === curr.section
          )
        ) {
          acc.push({ 
            class_name: curr.class_name, 
            section: curr.section
          });
        }
        return acc;
      }, []);

      console.log("Teacher's assigned classes:", teacherClasses);

      // Now get all students
      const studentsRes = await axios.get(`${API_URL}students/`).catch(err => {
        console.warn("Students API failed:", err.message);
        return { data: [] };
      });

      // Filter students to only those in teacher's classes
      const teacherStudents = studentsRes.data.filter((student: any) =>
        teacherClasses.some(
          (cls: any) => cls.class_name === student.class_name && cls.section === student.section
        )
      );

      console.log("Students in teacher's classes:", teacherStudents.length);

      // Get documents for the teacher's students
      const documentsRes = await axios.get(`${API_URL}documents/`).catch(err => {
        console.warn("Documents API failed:", err.message);
        return { data: [] };
      });

      // Filter documents to only those belonging to teacher's students
      const studentDocuments = documentsRes.data.filter((doc: any) =>
        teacherStudents.some((student: any) => student.email === doc.student_email)
      );

      console.log("Documents for teacher's students:", studentDocuments.length);

      // Process the documents to create a flat list of available documents
      const processedDocuments: Document[] = [];
      
      studentDocuments.forEach((doc: any, index: number) => {
        // Create document entries for each non-null document field
        const documentTypes = [
          { key: 'conduct_certificate', name: 'Conduct Certificate' },
          { key: 'transfer_certificate', name: 'Transfer Certificate' },
          { key: 'study_certificate', name: 'Study Certificate' },
          { key: 'id_proof', name: 'ID Proof' },
          { key: 'resume', name: 'Resume' },
          { key: 'award', name: 'Award Certificate' },
          { key: 'certificates', name: 'Other Certificates' },
          { key: 'marks_card', name: 'Marks Card' },
          { key: 'masters', name: 'Masters Degree' },
          { key: 'degree', name: 'Degree Certificate' },
          { key: 'student_id_card', name: 'Student ID Card' },
          { key: 'admit_card', name: 'Admit Card' },
          { key: 'fee_receipt', name: 'Fee Receipt' },
          { key: 'achievement_crt', name: 'Achievement Certificate' },
          { key: 'bonafide_crt', name: 'Bonafide Certificate' }
        ];

        documentTypes.forEach(docType => {
          if (doc[docType.key]) {
            processedDocuments.push({
              id: index * 100 + documentTypes.indexOf(docType),
              conduct_certificate: doc.conduct_certificate || null,
              transfer_certificate: doc.transfer_certificate || null,
              study_certificate: doc.study_certificate || null,
              id_proof: doc.id_proof || null,
              resume: doc.resume || null,
              award: doc.award || null,
              certificates: doc.certificates || null,
              marks_card: doc.marks_card || null,
              masters: doc.masters || null,
              degree: doc.degree || null,
              student_id_card: doc.student_id_card || null,
              admit_card: doc.admit_card || null,
              fee_receipt: doc.fee_receipt || null,
              achievement_crt: doc.achievement_crt || null,
              bonafide_crt: doc.bonafide_crt || null,
              [docType.key]: doc[docType.key],
              student_email: doc.student_email || '',
              student_name: doc.student_name || 'Unknown Student',
              class_name: doc.class_name || 'N/A',
              section: doc.section || '',
              issue_date: doc.issue_date || new Date().toISOString().split('T')[0],
              status: 'Issued',
              created_at: doc.created_at
            });
          }
        });
      });

      console.log("Processed documents for teacher's students:", processedDocuments);

      setDocuments(processedDocuments);
      setFilteredDocuments(processedDocuments);
      setStudents(teacherStudents);
      calculateStats(processedDocuments);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (documentsData: Document[]) => {
    const stats = {
      total: documentsData.length,
      issued: documentsData.filter(d => d.status === "Issued").length,
      pending: documentsData.filter(d => d.status === "Pending").length,
      expired: documentsData.filter(d => d.status === "Expired").length
    };
    setStats(stats);
  };

  useEffect(() => {
    if (teacherEmail) {
      fetchDocuments();
    }
  }, [teacherEmail]);

  // Helper function to get document type and URL
  const getDocumentInfo = (doc: Document) => {
    const documentTypes = [
      { key: 'conduct_certificate', name: 'Conduct Certificate' },
      { key: 'transfer_certificate', name: 'Transfer Certificate' },
      { key: 'study_certificate', name: 'Study Certificate' },
      { key: 'id_proof', name: 'ID Proof' },
      { key: 'resume', name: 'Resume' },
      { key: 'award', name: 'Award Certificate' },
      { key: 'certificates', name: 'Other Certificates' },
      { key: 'marks_card', name: 'Marks Card' },
      { key: 'masters', name: 'Masters Degree' },
      { key: 'degree', name: 'Degree Certificate' },
      { key: 'student_id_card', name: 'Student ID Card' },
      { key: 'admit_card', name: 'Admit Card' },
      { key: 'fee_receipt', name: 'Fee Receipt' },
      { key: 'achievement_crt', name: 'Achievement Certificate' },
      { key: 'bonafide_crt', name: 'Bonafide Certificate' }
    ];

    for (const docType of documentTypes) {
      if (doc[docType.key as keyof Document]) {
        return {
          type: docType.name,
          url: doc[docType.key as keyof Document] as string
        };
      }
    }
    return { type: 'Unknown Document', url: '' };
  };

  // Filter documents
  useEffect(() => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc => {
        const docInfo = getDocumentInfo(doc);
        return docInfo.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
               doc.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               doc.student_email?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(doc => {
        const docInfo = getDocumentInfo(doc);
        return docInfo.type === typeFilter;
      });
    }

    if (classFilter !== "all") {
      filtered = filtered.filter(doc => doc.class_name === classFilter);
    }

    setFilteredDocuments(filtered);
  }, [searchTerm, statusFilter, typeFilter, classFilter, documents]);

  // Add new document
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const documentData = {
        ...newDocument,
        teacher_email: teacherEmail,
        issue_date: newDocument.issue_date || new Date().toISOString().split('T')[0]
      };

      await axios.post(`${API_URL}documents/`, documentData);
      alert("✅ Document issued successfully!");
      setShowAddForm(false);
      resetForm();
      fetchDocuments();
    } catch (err: any) {
      console.error("Error adding document:", err);
      alert("❌ Failed to issue document. Check console for details.");
    }
  };

  // Update document
  const handleUpdateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocument) return;

    try {
      await axios.put(`${API_URL}documents/${editingDocument.id}/`, editingDocument);
      alert("✅ Document updated successfully!");
      setEditingDocument(null);
      fetchDocuments();
    } catch (err: any) {
      console.error("Error updating document:", err);
      alert("❌ Failed to update document. Check console for details.");
    }
  };

  // Delete document
  const handleDeleteDocument = async (id: number) => {
    try {
      await axios.delete(`${API_URL}documents/${id}/`);
      alert("✅ Document deleted successfully!");
      setDeleteConfirm(null);
      fetchDocuments();
    } catch (err: any) {
      console.error("Error deleting document:", err);
      alert("❌ Failed to delete document. Check console for details.");
    }
  };

  // Handle student selection
  const handleStudentSelect = (studentEmail: string) => {
    const student = students.find(s => s.email === studentEmail);
    if (student) {
      setNewDocument({
        ...newDocument,
        student_email: student.email,
        student_name: student.fullname,
        class_name: student.class_name,
        section: student.section
      });
    }
  };

  const resetForm = () => {
    setNewDocument({
      conduct_certificate: null,
      transfer_certificate: null,
      study_certificate: null,
      id_proof: null,
      resume: null,
      award: null,
      certificates: null,
      marks_card: null,
      masters: null,
      degree: null,
      student_id_card: null,
      admit_card: null,
      fee_receipt: null,
      achievement_crt: null,
      bonafide_crt: null,
      student_email: "",
      student_name: "",
      class_name: "",
      section: "",
      issue_date: "",
      expiry_date: "",
      status: "Issued",
      created_at: ""
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Issued": return <CheckCircle className="h-4 w-4" />;
      case "Pending": return <Clock className="h-4 w-4" />;
      case "Expired": return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Issued": return "bg-green-50 text-green-700 border-green-200";
      case "Pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Expired": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Certificate": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Report": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Letter": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Form": return "bg-orange-50 text-orange-700 border-orange-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getClasses = () => {
    return Array.from(new Set(students.map(s => s.class_name).filter(Boolean)));
  };

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Documents</h1>
            <p className="text-gray-600 mt-1">
              Issue and manage documents for your students
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" /> Issue New Document
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Issued</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.issued}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.expired}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search documents by type, student name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="all">All Status</option>
                <option value="Issued">Issued</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="all">All Types</option>
                <option value="Conduct Certificate">Conduct Certificate</option>
                <option value="Transfer Certificate">Transfer Certificate</option>
                <option value="Study Certificate">Study Certificate</option>
                <option value="ID Proof">ID Proof</option>
                <option value="Resume">Resume</option>
                <option value="Award Certificate">Award Certificate</option>
                <option value="Other Certificates">Other Certificates</option>
                <option value="Marks Card">Marks Card</option>
                <option value="Masters Degree">Masters Degree</option>
                <option value="Degree Certificate">Degree Certificate</option>
                <option value="Student ID Card">Student ID Card</option>
                <option value="Admit Card">Admit Card</option>
                <option value="Fee Receipt">Fee Receipt</option>
                <option value="Achievement Certificate">Achievement Certificate</option>
                <option value="Bonafide Certificate">Bonafide Certificate</option>
              </select>

              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="all">All Classes</option>
                {getClasses().map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Issued Documents ({filteredDocuments.length})
            </h2>
            <div className="text-sm text-gray-500">
              Showing {filteredDocuments.length} of {documents.length} documents
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all" || classFilter !== "all" 
                  ? "Try adjusting your filters or search terms"
                  : "Get started by issuing your first document"}
              </p>
              {!searchTerm && statusFilter === "all" && typeFilter === "all" && classFilter === "all" && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  Issue Document
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => {
                    const docInfo = getDocumentInfo(doc);
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{docInfo.type}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {docInfo.url}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{doc.student_name}</div>
                            <div className="text-sm text-gray-500">{doc.student_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.class_name} {doc.section && `(${doc.section})`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(doc.status || 'Issued')}`}>
                            {getStatusIcon(doc.status || 'Issued')}
                            {doc.status || 'Issued'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {doc.issue_date ? new Date(doc.issue_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingDocument(doc)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit document"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(doc.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete document"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            {docInfo.url && (
                              <button
                                onClick={() => window.open(docInfo.url, '_blank')}
                                className="text-green-600 hover:text-green-800"
                                title="Download document"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Document Modal */}
        {(showAddForm || editingDocument) && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {editingDocument ? "Edit Document" : "Issue New Document"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingDocument(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form 
                onSubmit={editingDocument ? handleUpdateDocument : handleAddDocument}
                className="p-6 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student *
                    </label>
                    <select
                      value={editingDocument ? editingDocument.student_email : newDocument.student_email}
                      onChange={(e) => {
                        if (editingDocument) {
                          const student = students.find(s => s.email === e.target.value);
                          if (student) {
                            setEditingDocument({ 
                              ...editingDocument, 
                              student_email: student.email,
                              student_name: student.fullname,
                              class_name: student.class_name,
                              section: student.section
                            });
                          }
                        } else {
                          handleStudentSelect(e.target.value);
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    >
                      <option value="">Select a student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.email}>
                          {student.fullname} ({student.class_name} {student.section})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Issue Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editingDocument ? editingDocument.issue_date : newDocument.issue_date}
                      onChange={(e) =>
                        editingDocument
                          ? setEditingDocument({ ...editingDocument, issue_date: e.target.value })
                          : setNewDocument({ ...newDocument, issue_date: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={editingDocument ? editingDocument.status : newDocument.status}
                      onChange={(e) =>
                        editingDocument
                          ? setEditingDocument({ ...editingDocument, status: e.target.value as any })
                          : setNewDocument({ ...newDocument, status: e.target.value as any })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="Issued">Issued</option>
                      <option value="Pending">Pending</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={editingDocument ? editingDocument.expiry_date : newDocument.expiry_date}
                      onChange={(e) =>
                        editingDocument
                          ? setEditingDocument({ ...editingDocument, expiry_date: e.target.value })
                          : setNewDocument({ ...newDocument, expiry_date: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Note */}
                  <div className="md:col-span-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> This form is for viewing existing documents. 
                        To add new documents, please use the document upload system or contact the administrator.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium"
                  >
                    {editingDocument ? "Update Document" : "Issue Document"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingDocument(null);
                    }}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Document
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this document? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDeleteDocument(deleteConfirm)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition font-medium"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeachersDocumentsPage;
