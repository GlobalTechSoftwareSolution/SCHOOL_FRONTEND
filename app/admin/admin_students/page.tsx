"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Eye, Award, FileText, User, Book, Mail, Phone, Calendar, MapPin, Users } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/students/";
const AWARDS_API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/awards/";
const DOCUMENTS_API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/documents/";
interface Student {
  email: string;
  fullname: string;
  student_id: string;
  class_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  admission_date: string;
  profile_picture: string | null;
  residential_address?: string | null;
  nationality?: string | null;
  blood_group?: string | null;
  parent?: string | null;
  parent_name?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_no?: string | null;
  class_enrolled?: number | null;
  user_details?: {
    role: string;
    is_active: boolean;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
  };
}

interface Award {
  id: number;
  email: string;
  title: string;
  description: string;
  photo?: string;
  created_at: string;
}

interface Document {
  id: number;
  student: string;
  document_name: string;
  document_type: string;
  upload_date: string;
  file_url: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "awards" | "documents">("profile");
  const [loading, setLoading] = useState(false);
  const [awardsLoading, setAwardsLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  // ✅ Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setStudents(res.data);
    } catch (error) {
      console.error("❌ Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all awards globally
  const fetchAllAwards = async () => {
    try {
      const res = await axios.get(AWARDS_API_URL);
      setAwards(res.data || []);
    } catch (err) {
      console.error("Error fetching all awards:", err);
    }
  };

  // Fetch all documents globally
  const fetchAllDocuments = async () => {
    try {
      const res = await axios.get(DOCUMENTS_API_URL);
      const docs = Array.isArray(res.data) ? res.data : [res.data];
      setDocuments(docs);
      setTotalDocuments(docs.length);
    } catch (err) {
      console.error("Error fetching all documents:", err);
    }
  };

// ✅ Fetch awards for a specific student
const fetchStudentAwards = async (studentId: string) => {
  try {
    setAwardsLoading(true);
    const res = await axios.get(
      `https://globaltechsoftwaresolutions.cloud/school-api/api/awards/`
    );
    console.log("🏅 Student Awards:", res.data);
    setAwards(res.data || []);
  } catch (err: any) {
    console.error("Error fetching student awards:", err.message);
  } finally {
    setAwardsLoading(false);
  }
};


// ✅ Fetch Documents for a specific student
const fetchStudentDocuments = async (studentEmail: string) => {
  try {
    setDocumentsLoading(true);

    const res = await axios.get(
      "https://globaltechsoftwaresolutions.cloud/school-api/api/documents/"
    );

    // API might return an array of all documents
    const allDocs = Array.isArray(res.data) ? res.data : [res.data];

    // Find the document that matches the student's email
    const doc = allDocs.find(
      (d: any) =>
        d.email && d.email.toLowerCase() === studentEmail.toLowerCase()
    );

    if (!doc) {
      console.warn("No documents found for this student email:", studentEmail);
      setDocuments([]);
      return;
    }

    // Convert single object to array of docs
    const formattedDocs = Object.entries(doc)
      .filter(([key, value]) => typeof value === "string" && value.startsWith("http"))
      .map(([key, value]) => ({
        id: doc.id,
        document_name: key.replace(/_/g, " "),
        document_type: key,
        upload_date: doc.uploaded_at,
        file_url: value as string,
        student: doc.email,
      }));

    setDocuments(formattedDocs);
  } catch (error) {
    console.error("❌ Error fetching documents:", error);
    setDocuments([]);
  } finally {
    setDocumentsLoading(false);
  }
};




  useEffect(() => {
    fetchStudents();
    fetchAllAwards();
    fetchAllDocuments();
  }, []);

  // ✅ Handle Edit button
  const handleEdit = (student: Student) => {
  setSelectedStudent(student);
  setIsEditing(true);
  setActiveTab("profile");
  fetchStudentAwards(student.student_id);
  fetchStudentDocuments(student.student_id);
};

  // ✅ Handle View button
 const handleView = (student: Student) => {
  setSelectedStudent(student);
  setIsEditing(false);
  setActiveTab("profile");
  fetchStudentAwards(student.student_id);
  fetchStudentDocuments(student.student_id);
};

  // ✅ Handle Save updates
  const handleSave = async () => {
    if (!selectedStudent) return;

    const formData = new FormData();
    Object.entries(selectedStudent).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });

    if (profileImageFile) {
      formData.append("profile_picture", profileImageFile);
    }

    try {
      setLoading(true);
      await axios.patch(`${API_URL}${selectedStudent.email}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Student details updated successfully!");
      setIsEditing(false);
      setSelectedStudent(null);
      fetchStudents(); // refresh list
    } catch (error) {
      console.error("❌ Error updating student:", error);
      alert("Failed to update student details.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle input changes
  const handleInputChange = (field: keyof Student, value: string) => {
    if (!selectedStudent) return;
    setSelectedStudent({ ...selectedStudent, [field]: value });
  };


const getStudentAwards = (studentEmail: string) => {
  return awards.filter(
    (award) =>
      award.email && award.email.toLowerCase() === studentEmail?.toLowerCase()
  );
};

const getStudentDocuments = (studentId: string) => {
  return documents.filter(
    (doc) => doc.student.toLowerCase() === studentId.toLowerCase()
  );
};

  // ✅ Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ Handle tab change - fetch data when switching tabs
  const handleTabChange = (tab: "profile" | "awards" | "documents") => {
    setActiveTab(tab);
    if (selectedStudent) {
      if (tab === "awards") {
        fetchStudentAwards(selectedStudent.email);
      } else if (tab === "documents") {
        fetchStudentDocuments(selectedStudent.email);
      }
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎓 Student Management</h1>
          <p className="text-gray-600">Manage student profiles, awards, and documents</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Awards</p>
                <p className="text-2xl font-bold text-gray-900">{awards.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Student List</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.email} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={
                              student.profile_picture
                                ? `${student.profile_picture}`
                                : "/default-avatar.png"
                            }
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover mr-3"
                            onError={(e) => {
                              e.currentTarget.src = "/default-avatar.png";
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.fullname}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.student_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.class_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.email}</div>
                        <div className="text-sm text-gray-500">{student.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.user_details?.is_active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {student.user_details?.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleView(student)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(student)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for View/Edit */}
        {selectedStudent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {isEditing ? "✏️ Edit Student" : "👁️ Student Details"}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setIsEditing(false);
                    }}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex space-x-1 mt-4">
                  {[
                    { id: "profile", label: "Profile", icon: User },
                    { id: "awards", label: "Awards", icon: Award },
                    { id: "documents", label: "Documents", icon: FileText }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id as any)}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-white text-blue-600"
                          : "text-blue-100 hover:text-white"
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center">
                      <img
                        src={
                          selectedStudent.profile_picture
                            ? `${selectedStudent.profile_picture}`
                            : "/default-avatar.png"
                        }
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 mb-4"
                        onError={(e) => {
                          e.currentTarget.src = "/default-avatar.png";
                        }}
                      />
                      {isEditing && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setProfileImageFile(e.target.files?.[0] || null)
                          }
                          className="text-sm border rounded-lg px-3 py-2"
                        />
                      )}
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: "fullname" as keyof Student, label: "Full Name", icon: User },
                        { key: "student_id" as keyof Student, label: "Student ID", icon: Book },
                        { key: "class_name" as keyof Student, label: "Class Name", icon: Book },
                        { key: "email" as keyof Student, label: "Email", icon: Mail },
                        { key: "phone" as keyof Student, label: "Phone", icon: Phone },
                        { key: "date_of_birth" as keyof Student, label: "Date of Birth", icon: Calendar },
                        { key: "gender" as keyof Student, label: "Gender", icon: User },
                        { key: "admission_date" as keyof Student, label: "Admission Date", icon: Calendar },
                        { key: "residential_address" as keyof Student, label: "Address", icon: MapPin },
                        { key: "nationality" as keyof Student, label: "Nationality", icon: Users },
                        { key: "blood_group" as keyof Student, label: "Blood Group", icon: Users },
                        { key: "parent" as keyof Student, label: "Parent Email", icon: Mail },
                        { key: "emergency_contact_name" as keyof Student, label: "Emergency Contact Name", icon: Users },
                        { key: "emergency_contact_relationship" as keyof Student, label: "Emergency Relationship", icon: Users },
                        { key: "emergency_contact_no" as keyof Student, label: "Emergency Phone", icon: Phone },
                        { key: "class_enrolled" as keyof Student, label: "Class Enrolled", icon: Book },
                      ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <Icon className="w-4 h-4 mr-2" />
                            {label}
                          </label>
                          {isEditing && (key === "email" || key === "class_enrolled") ? (
                            <p className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                              {typeof selectedStudent[key] === "object"
                                ? JSON.stringify(selectedStudent[key], null, 2)
                                : (selectedStudent[key] ?? "-")}
                            </p>
                          ) : isEditing ? (
                            <input
                              value={
                                typeof selectedStudent[key] === "object"
                                  ? JSON.stringify(selectedStudent[key])
                                  : (selectedStudent[key] ?? "")
                              }
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                              {typeof selectedStudent[key] === "object"
                                ? JSON.stringify(selectedStudent[key], null, 2)
                                : (selectedStudent[key] ?? "-")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "awards" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Student Awards</h3>
                    {awardsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : getStudentAwards(selectedStudent.email).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Award className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No awards found for this student</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getStudentAwards(selectedStudent.email).map((award) => (
                          <div
                            key={award.id}
                            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-4"
                          >
                            <img
                              src={award.photo || "https://cdn-icons-png.flaticon.com/512/2583/2583341.png"}
                              alt={award.title}
                              className="w-16 h-16 rounded-lg object-cover border border-yellow-300"
                              onError={(e) => {
                                e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/2583/2583341.png";
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{award.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{award.description}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                Created: {formatDate(award.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Student Documents</h3>
                    {documentsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : getStudentDocuments(selectedStudent.email).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No documents found for this student</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getStudentDocuments(selectedStudent.email).map((doc) => (
                          <div key={doc.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold text-gray-900">{doc.document_name}</h4>
                                <p className="text-sm text-gray-600 mt-1 capitalize">{doc.document_type}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                                  {formatDate(doc.upload_date)}
                                </span>
                                <a
                                  href={`https://globaltechsoftwaresolutions.cloud${doc.file_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  View
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
                {isEditing && activeTab === "profile" && (
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}