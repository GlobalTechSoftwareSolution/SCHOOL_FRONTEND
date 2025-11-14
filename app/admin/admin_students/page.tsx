"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Pencil, 
  Eye, 
  Award, 
  FileText, 
  User, 
  Book, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Users,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Shield,
  GraduationCap,
  Home,
  Heart,
  Droplets,
  Star,
  Crown,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  BarChart3,
  TrendingUp,
  Sparkles,
  Zap,
  Target,
  CalendarDays,
  FileCheck,
  AlertCircle,
  MessageCircle,
  Info
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/students/";
const AWARDS_API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/awards/";
const DOCUMENTS_API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/documents/";
const LEAVES_API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/leave-applications/";
const CLASSES_API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/classes/";

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

interface Leave {
  id?: number;
  email?: string;
  student_email?: string;
  applicant_email?: string;
  studentEmail?: string;
  leave_type?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
  status?: string;
  applied_date?: string;
  created_at?: string;
  approved_by?: string;
  [key: string]: any; // Allow additional fields
}

interface ClassData {
  id: number;
  class_teacher_name: string | null;
  class_name: string;
  sec: string;
  created_at: string;
  updated_at: string;
  class_teacher: string | null;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [classesData, setClassesData] = useState<{ [key: number]: ClassData }>({});
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "awards" | "documents" | "leaves">("profile");
  const [loading, setLoading] = useState(false);
  const [awardsLoading, setAwardsLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClassOverview, setSelectedClassOverview] = useState<string | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    family: true,
    emergency: true
  });

  // ✅ Fetch class data by ID from classes API
  const fetchClassData = async (classId: number) => {
    if (!classId || classesData[classId]) return; // Return if already cached
    
    try {
      console.log(`🏫 Fetching class data for ID: ${classId}`);
      const res = await axios.get(`${CLASSES_API_URL}${classId}/`);
      console.log(`🏫 Class data response for ID ${classId}:`, res.data);
      
      if (res.data) {
        setClassesData(prev => ({ ...prev, [classId]: res.data }));
        console.log(`🏫 Successfully cached class data for ID ${classId}`);
      }
    } catch (error) {
      console.error(`Error fetching class data for ID ${classId}:`, error);
      
      // Try fetching all classes and finding the one with matching ID
      try {
        console.log(`🏫 Trying to fetch all classes and find ID ${classId}`);
        const allClassesRes = await axios.get(CLASSES_API_URL);
        console.log(`🏫 All classes response:`, allClassesRes.data);
        
        const targetClass = allClassesRes.data.find((cls: any) => cls.id === classId);
        if (targetClass) {
          setClassesData(prev => ({ ...prev, [classId]: targetClass }));
          console.log(`🏫 Found and cached class ${classId} from all classes:`, targetClass);
        }
      } catch (fallbackError) {
        console.error(`Fallback also failed for class ID ${classId}:`, fallbackError);
      }
    }
  };

  // ✅ Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      console.log(`👨‍🎓 Students response:`, res.data);
      setStudents(res.data);
      
      // Fetch class data for all students with class_enrolled IDs
      const classIds = new Set<number>();
      res.data.forEach((student: Student) => {
        console.log(`👨‍🎓 Student: ${student.fullname}, class_enrolled: ${student.class_enrolled}`);
        if (student.class_enrolled) {
          classIds.add(student.class_enrolled);
        }
      });
      
      console.log(`🏫 Found class IDs to fetch:`, Array.from(classIds));
      
      // Fetch each class data
      classIds.forEach(classId => {
        fetchClassData(classId);
      });
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

  // ✅ Fetch all leaves globally
  const fetchAllLeaves = async () => {
    const possibleEndpoints = [
      "https://globaltechsoftwaresolutions.cloud/school-api/api/leaves/",
      "https://globaltechsoftwaresolutions.cloud/school-api/api/leave-applications/",
      "https://globaltechsoftwaresolutions.cloud/school-api/api/leave/",
      "https://globaltechsoftwaresolutions.cloud/school-api/api/leave-requests/",
      "https://globaltechsoftwaresolutions.cloud/school-api/api/student-leaves/",
      "https://globaltechsoftwaresolutions.cloud/school-api/api/leaves/all",
      "https://globaltechsoftwaresolutions.cloud/school-api/api/leave-applications/all"
    ];

    console.log("🍃 Starting leaves fetch with", possibleEndpoints.length, "possible endpoints");

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`🍃 Trying leaves endpoint: ${endpoint}`);
        const res = await axios.get(endpoint);
        console.log(`🍃 ✅ Success from ${endpoint}:`, res.data);
        console.log(`🍃 Data type:`, typeof res.data);
        console.log(`🍃 Is array:`, Array.isArray(res.data));
        console.log(`🍃 Data length:`, res.data?.length || 'N/A');
        
        if (res.data && (Array.isArray(res.data) || (typeof res.data === 'object' && res.data !== null))) {
          const leavesData = Array.isArray(res.data) ? res.data : [res.data];
          console.log(`🍃 🎉 Processed ${leavesData.length} leaves from ${endpoint}`);
          
          // Log first few leaves for debugging
          if (leavesData.length > 0) {
            console.log("🍃 Sample leave data:", leavesData.slice(0, 2));
          }
          
          setLeaves(leavesData);
          console.log(`🍃 ✅ Successfully set ${leavesData.length} leaves in state`);
          return;
        }
      } catch (err: any) {
        console.log(`❌ ❌ Failed ${endpoint}:`, err.response?.status || err.message);
        continue;
      }
    }
    
    console.error("❌ ❌ ❌ ALL LEAVES ENDPOINTS FAILED!");
    console.log("🍃 Setting empty leaves array as fallback");
    setLeaves([]);
  };

  // ✅ Fetch awards for a specific student
  const fetchStudentAwards = async (studentEmail: string) => {
    try {
      setAwardsLoading(true);
      const res = await axios.get(AWARDS_API_URL);
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
      const res = await axios.get(DOCUMENTS_API_URL);
      const allDocs = Array.isArray(res.data) ? res.data : [res.data];
      const doc = allDocs.find((d: any) => d.email && d.email.toLowerCase() === studentEmail.toLowerCase());

      if (!doc) {
        console.warn("No documents found for this student email:", studentEmail);
        setDocuments([]);
        return;
      }

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

  // ✅ Fetch Leaves for a specific student
  const fetchStudentLeaves = async (studentEmail: string) => {
    const possibleEndpoints = [
      "https://globaltechsoftwaresolutions.cloud/school-api/api/leaves/",
      "https://globaltechsoftwaresolutions.cloud/school-api/api/leave-applications/",
      "https://globaltechsoftwaresolutions.cloud/school-api/api/leave/",
      "https://globaltechsoftwaresolutions.cloud/school-api/api/leave-requests/",
      "https://globaltechsoftwaresolutions.cloud/school-api/api/student-leaves/",
      "https://globaltechsoftwaresolutions.cloud/school-api/api/leaves/all",
      "https://globaltechsoftwaresolutions.cloud/school-api/api/leave-applications/all"
    ];

    console.log(`🍃 Starting student leaves fetch for ${studentEmail} with ${possibleEndpoints.length} endpoints`);

    try {
      setLeavesLoading(true);
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🍃 Trying student leaves endpoint: ${endpoint}`);
          const res = await axios.get(endpoint);
          console.log(`🍃 ✅ Success from ${endpoint}:`, res.data);
          
          if (res.data && (Array.isArray(res.data) || (typeof res.data === 'object' && res.data !== null))) {
            const leavesData = Array.isArray(res.data) ? res.data : [res.data];
            console.log(`🍃 Total leaves available: ${leavesData.length}`);
            
            const studentLeaves = leavesData.filter((leave: any) => {
              const email = leave.email || leave.student_email || leave.applicant_email || leave.studentEmail || '';
              const matches = email && email.toLowerCase() === studentEmail.toLowerCase();
              if (matches) {
                console.log(`🍃 Found matching leave:`, leave);
              }
              return matches;
            });
            
            console.log(`🍃 🎉 Found ${studentLeaves.length} leaves for ${studentEmail}`);
            setLeaves(studentLeaves);
            return;
          }
        } catch (err: any) {
          console.log(`❌ ❌ Failed ${endpoint}:`, err.response?.status || err.message);
          continue;
        }
      }
      
      console.error(`❌ ❌ ❌ ALL STUDENT LEAVES ENDPOINTS FAILED for ${studentEmail}!`);
      setLeaves([]);
    } catch (error) {
      console.error("❌ Error fetching student leaves:", error);
      setLeaves([]);
    } finally {
      setLeavesLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAllAwards();
    fetchAllDocuments();
    fetchAllLeaves();
  }, []);

  // ✅ Handle Edit button
  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditing(true);
    setActiveTab("profile");
    fetchStudentAwards(student.email);
    fetchStudentDocuments(student.email);
    fetchStudentLeaves(student.email);
  };

  // ✅ Handle View button
  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsEditing(false);
    setActiveTab("profile");
    fetchStudentAwards(student.email);
    fetchStudentDocuments(student.email);
    fetchStudentLeaves(student.email);
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
      fetchStudents();
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

  // Get class name and section from ID
  const getClassName = (classId?: number | null) => {
    console.log(`🏫 getClassName called with classId: ${classId}`);
    console.log(`🏫 Current classesData:`, classesData);
    
    if (!classId) return "N/A";
    const classData = classesData[classId];
    if (!classData) {
      console.log(`🏫 No class data found for ID ${classId}`);
      return "Loading...";
    }
    const result = `${classData.class_name} - Section ${classData.sec}`;
    console.log(`🏫 Returning class name for ID ${classId}: ${result}`);
    return result;
  };

  const getStudentAwards = (studentEmail: string) => {
    return awards.filter((award) => award.email && award.email.toLowerCase() === studentEmail?.toLowerCase());
  };

  const getStudentDocuments = (studentEmail: string) => {
    return documents.filter((doc) => doc.student.toLowerCase() === studentEmail.toLowerCase());
  };

  const getStudentLeaves = (studentEmail: string) => {
    return leaves.filter((leave) => {
      const email = leave.email || leave.student_email || leave.applicant_email || leave.studentEmail || '';
      return email && email.toLowerCase() === studentEmail.toLowerCase();
    });
  };

  // ✅ Format date
  const formatDate = (dateString: string) => {
    if (dateString === 'Not specified' || !dateString) {
      return 'Not specified';
    }
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // ✅ Handle tab change
  const handleTabChange = (tab: "profile" | "awards" | "documents" | "leaves") => {
    setActiveTab(tab);
    if (selectedStudent) {
      if (tab === "awards") {
        fetchStudentAwards(selectedStudent.email);
      } else if (tab === "documents") {
        fetchStudentDocuments(selectedStudent.email);
      } else if (tab === "leaves") {
        fetchStudentLeaves(selectedStudent.email);
      }
    }
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = classFilter === "all" || student.class_name === classFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && (student.user_details?.is_active !== false)) ||
      (statusFilter === "inactive" && student.user_details?.is_active === false);
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  // Get statistics
  const getStats = () => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.user_details?.is_active !== false).length;
    const totalAwards = awards.length;
    const totalLeaves = leaves.length;

    return { totalStudents, activeStudents, totalAwards, totalLeaves };
  };

  const stats = getStats();

  // Get class statistics
  const getClassStats = (className: string) => {
    const classStudents = students.filter(s => s.class_name === className);
    const activeCount = classStudents.filter(s => s.user_details?.is_active !== false).length;
    const totalAwards = awards.filter(award => 
      classStudents.some(student => student.email === award.email)
    ).length;
    const totalLeaves = leaves.filter(leave => {
      const email = leave.email || leave.student_email || leave.applicant_email || leave.studentEmail || '';
      return classStudents.some(student => student.email.toLowerCase() === email.toLowerCase());
    }).length;
    
    return {
      total: classStudents.length,
      active: activeCount,
      awards: totalAwards,
      leaves: totalLeaves
    };
  };

  // Handle class overview click
  const handleClassOverview = (className: string) => {
    setSelectedClassOverview(className);
    setClassFilter(className);
  };

  // Handle leave detail view
  const handleLeaveView = (leave: Leave) => {
    setSelectedLeave(leave);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* HEADER SECTION */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-blue-900 bg-clip-text text-transparent">
                    Student Management
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Manage and monitor all student information in one place
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STATISTICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-sm border border-blue-200/30 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600 font-medium">All enrolled</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl shadow-sm border border-emerald-200/30 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeStudents}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                <Target className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-600 font-medium">Currently active</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-2xl shadow-sm border border-amber-200/30 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Awards</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAwards}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600 font-medium">Achievements</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl shadow-sm border border-purple-200/30 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leaves</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLeaves}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-purple-600 font-medium">Leave records</span>
              </div>
            </div>
          </div>

          {/* CLASS OVERVIEW SECTION */}
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Class Overview</h2>
                  <p className="text-gray-600">Click on any class to view detailed statistics</p>
                </div>
              </div>
              {selectedClassOverview && (
                <button
                  onClick={() => {
                    setSelectedClassOverview(null);
                    setClassFilter("all");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm"
                >
                  <XCircle className="h-4 w-4" />
                  Clear Selection
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from(new Set(students.map(s => s.class_name))).map(className => {
                const classStats = getClassStats(className);
                const isSelected = selectedClassOverview === className;
                
                return (
                  <div
                    key={`class-${className}-${classStats.total}`}
                    onClick={() => handleClassOverview(className)}
                    className={`relative overflow-hidden rounded-xl border-2 p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                      isSelected 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="p-1 bg-blue-500 rounded-full">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                        <Book className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isSelected 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {classStats.total} Students
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-900 mb-3">{className}</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Active
                        </span>
                        <span className="font-semibold text-green-600">{classStats.active}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Award className="h-3 w-3 text-amber-500" />
                          Awards
                        </span>
                        <span className="font-semibold text-amber-600">{classStats.awards}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-purple-500" />
                          Leaves
                        </span>
                        <span className="font-semibold text-purple-600">{classStats.leaves}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEARCH AND FILTERS */}
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search students by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="pl-10 pr-8 py-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm appearance-none transition-all duration-300"
                  >
                    <option value="all">All Classes</option>
                    {Array.from(new Set(students.map(s => s.class_name))).map(className => (
                      <option key={`option-${className}`} value={className}>{className}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* STUDENTS TABLE */}
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-6 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Student Directory</h2>
                    <p className="text-gray-600">
                      {selectedClassOverview 
                        ? `Showing students from ${selectedClassOverview}` 
                        : 'Complete student management'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {selectedClassOverview && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium text-sm">
                      <Book className="h-4 w-4" />
                      {selectedClassOverview}
                      <button
                        onClick={() => {
                          setSelectedClassOverview(null);
                          setClassFilter("all");
                        }}
                        className="ml-1 hover:text-blue-600"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <span className="bg-blue-100 text-blue-800 text-sm px-3 py-2 rounded-full font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {filteredStudents.length} students
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading student data...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60">
                    {filteredStudents.map((student) => (
                      <tr key={student.email} className="hover:bg-blue-50/30 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.profile_picture || "/default-avatar.png"}
                              alt="Profile"
                              className="w-12 h-12 rounded-xl border-2 border-white shadow-sm object-cover"
                              onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
                            />
                            <div>
                              <div className="font-semibold text-gray-900">{student.fullname}</div>
                              <div className="text-sm text-gray-600">{student.student_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{student.class_name}</div>
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              selectedClassOverview === student.class_name
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {student.class_enrolled ? getClassName(student.class_enrolled) : (student.class_name || "N/A")}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{student.email}</div>
                          <div className="text-sm text-gray-600">{student.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            student.user_details?.is_active !== false 
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}>
                            {student.user_details?.is_active !== false ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleView(student)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 font-medium text-sm hover:shadow-md"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(student)}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all duration-200 font-medium text-sm hover:shadow-md"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleClassOverview(student.class_name)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm hover:shadow-md ${
                                selectedClassOverview === student.class_name
                                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                              title="Filter by class"
                            >
                              <Book className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredStudents.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {students.length === 0 
                        ? "No students have been added to the system yet."
                        : "Try adjusting your search criteria or filters to find what you're looking for."
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STUDENT DETAILS MODAL */}
          {selectedStudent && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-200/60">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedStudent.profile_picture || "/default-avatar.png"}
                      alt="profile"
                      className="w-16 h-16 rounded-2xl border-2 border-white/20 object-cover"
                      onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
                    />
                    <div>
                      <h2 className="text-2xl font-bold">{selectedStudent.fullname}</h2>
                      <p className="text-blue-100">{selectedStudent.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setIsEditing(false);
                    }}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
                  <div className="flex gap-1 p-4">
                    {[
                      { id: "profile" as const, label: "Profile", icon: User },
                      { id: "awards" as const, label: "Awards", icon: Award },
                      { id: "documents" as const, label: "Documents", icon: FileText },
                      { id: "leaves" as const, label: "Leaves", icon: CalendarDays }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-inner border border-blue-200/50"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/50"
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
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
                          src={selectedStudent.profile_picture || "/default-avatar.png"}
                          alt="Profile"
                          className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-200 mb-4 shadow-lg"
                          onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
                        />
                        {isEditing && (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                            className="text-sm border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        )}
                      </div>

                      {/* Personal Information */}
                      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-200/30 overflow-hidden">
                        <div 
                          className="p-4 border-b border-gray-200/60 flex items-center justify-between cursor-pointer bg-white/80"
                          onClick={() => toggleSection('personal')}
                        >
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" />
                            Personal Information
                          </h3>
                          {expandedSections.personal ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                        </div>
                        {expandedSections.personal && (
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                              { key: "fullname" as keyof Student, label: "Full Name", icon: User },
                              { key: "student_id" as keyof Student, label: "Student ID", icon: Book },
                              { key: "class_name" as keyof Student, label: "Class Name", icon: GraduationCap },
                              { key: "email" as keyof Student, label: "Email", icon: Mail },
                              { key: "phone" as keyof Student, label: "Phone", icon: Phone },
                              { key: "date_of_birth" as keyof Student, label: "Date of Birth", icon: Calendar },
                              { key: "gender" as keyof Student, label: "Gender", icon: User },
                              { key: "admission_date" as keyof Student, label: "Admission Date", icon: Calendar },
                            ].map(({ key, label, icon: Icon }) => (
                              <div key={key} className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                  <Icon className="w-4 h-4 mr-2" />
                                  {label}
                                </label>
                                {isEditing && (key === "email" || key === "class_enrolled") ? (
                                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                    {selectedStudent[key] ?? "-"}
                                  </p>
                                ) : isEditing ? (
                                  <input
                                    value={selectedStudent[key] as string ?? ""}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                    {selectedStudent[key] ?? "-"}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Additional Information */}
                      <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl border border-emerald-200/30 overflow-hidden">
                        <div 
                          className="p-4 border-b border-gray-200/60 flex items-center justify-between cursor-pointer bg-white/80"
                          onClick={() => toggleSection('family')}
                        >
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Home className="h-5 w-5 text-emerald-500" />
                            Family & Additional Information
                          </h3>
                          {expandedSections.family ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                        </div>
                        {expandedSections.family && (
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                              { key: "residential_address" as keyof Student, label: "Address", icon: MapPin },
                              { key: "nationality" as keyof Student, label: "Nationality", icon: Shield },
                              { key: "blood_group" as keyof Student, label: "Blood Group", icon: Droplets },
                              { key: "parent" as keyof Student, label: "Parent Email", icon: Mail },
                              { key: "parent_name" as keyof Student, label: "Parent Name", icon: User },
                            ].map(({ key, label, icon: Icon }) => (
                              <div key={key} className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                  <Icon className="w-4 h-4 mr-2" />
                                  {label}
                                </label>
                                {isEditing ? (
                                  <input
                                    value={selectedStudent[key] as string ?? ""}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                    {selectedStudent[key] ?? "-"}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Emergency Contact */}
                      {(selectedStudent.emergency_contact_name || selectedStudent.emergency_contact_no) && (
                        <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl border border-amber-200/30 overflow-hidden">
                          <div 
                            className="p-4 border-b border-gray-200/60 flex items-center justify-between cursor-pointer bg-white/80"
                            onClick={() => toggleSection('emergency')}
                          >
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-amber-500" />
                              Emergency Contact
                            </h3>
                            {expandedSections.emergency ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                          </div>
                          {expandedSections.emergency && (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                              {[
                                { key: "emergency_contact_name" as keyof Student, label: "Contact Name", icon: User },
                                { key: "emergency_contact_relationship" as keyof Student, label: "Relationship", icon: Heart },
                                { key: "emergency_contact_no" as keyof Student, label: "Phone Number", icon: Phone },
                              ].map(({ key, label, icon: Icon }) => (
                                <div key={key} className="space-y-2">
                                  <label className="flex items-center text-sm font-medium text-gray-700">
                                    <Icon className="w-4 h-4 mr-2" />
                                    {label}
                                  </label>
                                  {isEditing ? (
                                    <input
                                      value={selectedStudent[key] as string ?? ""}
                                      onChange={(e) => handleInputChange(key, e.target.value)}
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  ) : (
                                    <p className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                      {selectedStudent[key] ?? "-"}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "awards" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-amber-500" />
                        Student Awards & Achievements
                      </h3>
                      {awardsLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                        </div>
                      ) : getStudentAwards(selectedStudent.email).length === 0 ? (
                        <div className="text-center py-12">
                          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No awards found for this student</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {getStudentAwards(selectedStudent.email).map((award) => (
                            <div key={award.id} className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                              <div className="flex items-start gap-4">
                                <img
                                  src={award.photo || "https://cdn-icons-png.flaticon.com/512/2583/2583341.png"}
                                  alt={award.title}
                                  className="w-20 h-20 rounded-xl object-cover border-2 border-amber-200 shadow-sm"
                                  onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/2583/2583341.png"; }}
                                />
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-lg mb-2">{award.title}</h4>
                                  <p className="text-gray-600 mb-3">{award.description}</p>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>Awarded on {formatDate(award.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "documents" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-6 w-6 text-blue-500" />
                        Student Documents
                      </h3>
                      {documentsLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      ) : getStudentDocuments(selectedStudent.email).length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No documents found for this student</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getStudentDocuments(selectedStudent.email).map((doc) => (
                            <a
                              key={`${doc.id}-${doc.document_type}`}
                              href={`https://globaltechsoftwaresolutions.cloud${doc.file_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 group hover:border-blue-300"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                    {doc.document_name}
                                  </h4>
                                  <p className="text-xs text-gray-500 capitalize">{doc.document_type}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatDate(doc.upload_date)}</span>
                                <Download className="h-4 w-4 group-hover:text-blue-600 transition-colors" />
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "leaves" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-purple-500" />
                        Leave History
                      </h3>
                      {leavesLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                      ) : getStudentLeaves(selectedStudent.email).length === 0 ? (
                        <div className="text-center py-12">
                          <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No leave records found for this student</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {getStudentLeaves(selectedStudent.email).map((leave) => (
                            <div 
                              key={leave.id || Math.random()} 
                              className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                              onClick={() => handleLeaveView(leave)}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(leave.status || 'pending')}`}>
                                    {leave.status || 'Pending'}
                                  </span>
                                  <span className="font-semibold text-gray-900">{leave.leave_type || leave.type || 'Leave'}</span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  Applied: {formatDate(leave.applied_date || leave.created_at || new Date().toISOString())}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    From: {formatDate(leave.start_date || 'Not specified')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    To: {formatDate(leave.end_date || 'Not specified')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    Duration: {leave.start_date && leave.end_date 
                                      ? `${Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                                      : 'Not specified'
                                    }
                                  </span>
                                </div>
                              </div>
                              
                              {leave.reason && (
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <p className="text-sm text-gray-700">{leave.reason}</p>
                                </div>
                              )}
                              
                              {leave.approved_by && (
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                                  <User className="h-3 w-3" />
                                  <span>Approved by: {leave.approved_by}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200/60">
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setIsEditing(false);
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Close
                  </button>
                  {isEditing && activeTab === "profile" && (
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LEAVE DETAIL MODAL */}
          {selectedLeave && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex justify-between items-center rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <CalendarDays className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Leave Details</h2>
                      <p className="text-purple-100">Application Information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLeave(null)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Status and Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">Status</h3>
                      </div>
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(selectedLeave.status || 'pending')}`}>
                        {selectedLeave.status || 'Pending'}
                      </span>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Leave Type</h3>
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        {selectedLeave.leave_type || selectedLeave.type || 'Leave'}
                      </p>
                    </div>
                  </div>

                  {/* Date Information */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="h-5 w-5 text-amber-600" />
                      <h3 className="font-semibold text-gray-900">Leave Duration</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Start Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(selectedLeave.start_date || 'Not specified')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">End Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(selectedLeave.end_date || 'Not specified')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Duration</p>
                        <p className="font-medium text-gray-900">
                          {selectedLeave.start_date && selectedLeave.end_date 
                            ? `${Math.ceil((new Date(selectedLeave.end_date).getTime() - new Date(selectedLeave.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                            : 'Not specified'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Applicant Information */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <User className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Applicant Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-medium text-gray-900">
                          {selectedLeave.email || selectedLeave.student_email || selectedLeave.applicant_email || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Applied Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(selectedLeave.applied_date || selectedLeave.created_at || 'Not specified')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  {selectedLeave.reason && (
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200">
                      <div className="flex items-center gap-3 mb-4">
                        <MessageCircle className="h-5 w-5 text-rose-600" />
                        <h3 className="font-semibold text-gray-900">Reason for Leave</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedLeave.reason}
                      </p>
                    </div>
                  )}

                  {/* Approval Information */}
                  {selectedLeave.approved_by && (
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Shield className="h-5 w-5 text-teal-600" />
                        <h3 className="font-semibold text-gray-900">Approval Information</h3>
                      </div>
                      <p className="text-gray-700">
                        <span className="text-sm text-gray-600">Approved by: </span>
                        <span className="font-medium text-gray-900">{selectedLeave.approved_by}</span>
                      </p>
                    </div>
                  )}

                  {/* Additional Information */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Info className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Additional Information</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Leave ID:</span>
                        <span className="font-medium text-gray-900">{selectedLeave.id || 'N/A'}</span>
                      </div>
                      {Object.keys(selectedLeave).filter(key => 
                        !['id', 'email', 'student_email', 'applicant_email', 'leave_type', 'type', 'start_date', 'end_date', 'reason', 'status', 'applied_date', 'created_at', 'approved_by'].includes(key)
                      ).map(key => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="font-medium text-gray-900">
                            {typeof selectedLeave[key] === 'object' ? JSON.stringify(selectedLeave[key]) : String(selectedLeave[key] || 'N/A')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-3xl">
                  <button
                    onClick={() => setSelectedLeave(null)}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}