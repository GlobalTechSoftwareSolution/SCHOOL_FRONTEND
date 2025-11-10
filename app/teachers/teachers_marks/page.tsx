"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Users,
  FileText,
  BarChart3,
  Printer,
  Eye,
  CheckCircle,
  XCircle,
  Upload,
  Save
} from "lucide-react";
import jsPDF from "jspdf";
// import "jspdf-autotable";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api/";

interface Mark {
  id: number;
  student_name: string;
  student_email: string;
  class_name: string;
  section: string;
  subject: string;
  exam_type: "SEMESTER" | "INTERNAL" | "QUIZ" | "ASSIGNMENT" | "PROJECT";
  term: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  class_name: string;
  section: string;
  roll_number: string;
}

const TeachersMarksPage = () => {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedExamType, setSelectedExamType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    student_email: "",
    subject: "",
    exam_type: "INTERNAL",
    term: "",
    marks_obtained: "",
    total_marks: "",
    remarks: ""
  });

  // Bulk upload state
  const [bulkData, setBulkData] = useState<any[]>([]);

  // Fetch teacher's classes
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem("userData");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const teacherEmail = parsedUser?.email;

        if (!teacherEmail) {
          setError("No teacher email found in local storage.");
          return;
        }

        const response = await axios.get(`${API_BASE}timetable/`);
        const allTimetables = response.data;

        const teacherTimetable = allTimetables.filter(
          (item: any) => item.teacher === teacherEmail
        );

        const uniqueClasses = Array.from(
          new Map(
            teacherTimetable.map((t: any) => [
              `${t.class_name}-${t.section || "N/A"}`,
              { class_name: t.class_name, section: t.section || "N/A" },
            ])
          ).values()
        );

        setClasses(uniqueClasses);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to fetch classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, []);

  // Fetch marks when class is selected
  const fetchMarks = async (class_name: string, section: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}grades/?class_name=${class_name}&section=${section}`
      );
      setMarks(response.data);
    } catch (err) {
      console.error("Error fetching marks:", err);
      setError("Failed to fetch marks.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for selected class
  const fetchClassStudents = async (class_name: string, section: string) => {
    try {
      setLoadingStudents(true);
      const url =
        section && section !== "N/A"
          ? `${API_BASE}students/?class_name=${class_name}&section=${section}`
          : `${API_BASE}students/?class_name=${class_name}`;
      const res = await axios.get(url);
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleClassSelect = (cls: any) => {
    setSelectedClass(cls);
    fetchMarks(cls.class_name, cls.section);
    fetchClassStudents(cls.class_name, cls.section);
  };

  // Calculate grade based on percentage
  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const marksObtained = parseFloat(formData.marks_obtained);
      const totalMarks = parseFloat(formData.total_marks);
      const percentage = (marksObtained / totalMarks) * 100;
      const grade = calculateGrade(percentage);

      const markData = {
        ...formData,
        student_name: students.find(s => s.email === formData.student_email)?.first_name + " " + 
                      students.find(s => s.email === formData.student_email)?.last_name,
        class_name: selectedClass.class_name,
        section: selectedClass.section,
        marks_obtained: marksObtained,
        total_marks: totalMarks,
        percentage: percentage,
        grade: grade
      };

      if (editingMark) {
        // Update existing mark
        await axios.put(`${API_BASE}marks/${editingMark.id}/`, markData);
      } else {
        // Create new mark
        await axios.post(`${API_BASE}marks/`, markData);
      }

      // Refresh marks
      fetchMarks(selectedClass.class_name, selectedClass.section);
      setShowAddModal(false);
      setEditingMark(null);
      resetForm();
    } catch (err) {
      console.error("Error saving mark:", err);
      setError("Failed to save mark.");
    }
  };

  // Handle edit
  const handleEdit = (mark: Mark) => {
    setEditingMark(mark);
    setFormData({
      student_email: mark.student_email,
      subject: mark.subject,
      exam_type: mark.exam_type,
      term: mark.term,
      marks_obtained: mark.marks_obtained.toString(),
      total_marks: mark.total_marks.toString(),
      remarks: mark.remarks || ""
    });
    setShowAddModal(true);
  };

  // Handle delete
  const handleDelete = async (markId: number) => {
    if (window.confirm("Are you sure you want to delete this mark entry?")) {
      try {
        await axios.delete(`${API_BASE}marks/${markId}/`);
        fetchMarks(selectedClass.class_name, selectedClass.section);
      } catch (err) {
        console.error("Error deleting mark:", err);
        setError("Failed to delete mark.");
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      student_email: "",
      subject: "",
      exam_type: "INTERNAL",
      term: "",
      marks_obtained: "",
      total_marks: "",
      remarks: ""
    });
    setEditingMark(null);
  };

  // Generate PDF Report
  const generatePDF = (examType?: string) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(`MARKS REPORT - ${selectedClass.class_name} ${selectedClass.section}`, 20, 30);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    if (examType && examType !== 'all') {
      doc.text(`Exam Type: ${examType} | Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
    } else {
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
    }

    // Filter marks based on exam type
    const filteredMarks = examType && examType !== 'all' 
      ? marks.filter(mark => mark.exam_type === examType)
      : marks;

    // Prepare table data
    const tableData = filteredMarks.map(mark => [
      mark.student_name,
      mark.subject,
      mark.exam_type,
      mark.term,
      mark.marks_obtained.toString(),
      mark.total_marks.toString(),
      `${mark.percentage.toFixed(1)}%`,
      mark.grade,
      mark.remarks || '-'
    ]);

    // Add table
    (doc as any).autoTable({
      startY: 50,
      head: [['Student', 'Subject', 'Exam Type', 'Term', 'Marks', 'Total', 'Percentage', 'Grade', 'Remarks']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 15 },
        3: { cellWidth: 15 },
        4: { cellWidth: 10 },
        5: { cellWidth: 10 },
        6: { cellWidth: 15 },
        7: { cellWidth: 10 },
        8: { cellWidth: 20 }
      }
    });

    // Statistics
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text(`Total Students: ${new Set(filteredMarks.map(m => m.student_email)).size}`, 20, finalY);
    doc.text(`Total Entries: ${filteredMarks.length}`, 20, finalY + 5);
    
    const avgPercentage = filteredMarks.reduce((sum, mark) => sum + mark.percentage, 0) / filteredMarks.length;
    doc.text(`Average Percentage: ${avgPercentage.toFixed(1)}%`, 20, finalY + 10);

    // Save the PDF
    const fileName = examType && examType !== 'all' 
      ? `Marks_${selectedClass.class_name}_${selectedClass.section}_${examType}.pdf`
      : `Marks_${selectedClass.class_name}_${selectedClass.section}_All.pdf`;
    
    doc.save(fileName);
  };

  // Generate specific PDF reports
  const generateSemesterPDF = () => generatePDF("SEMESTER");
  const generateInternalPDF = () => generatePDF("INTERNAL");
  const generateQuizPDF = () => generatePDF("QUIZ");
  const generateAssignmentPDF = () => generatePDF("ASSIGNMENT");
  const generateProjectPDF = () => generatePDF("PROJECT");

  // Filter marks based on search and exam type
  const filteredMarks = marks.filter(mark => {
    const matchesSearch = mark.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mark.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExamType = selectedExamType === "all" || mark.exam_type === selectedExamType;
    return matchesSearch && matchesExamType;
  });

  // Get unique subjects and exam types for filters
  const subjects = Array.from(new Set(marks.map(mark => mark.subject)));
  const examTypes = Array.from(new Set(marks.map(mark => mark.exam_type)));

  if (loading && !selectedClass) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium text-lg">Loading your classes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Marks Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage and track student marks and performance</p>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {classes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Select Class</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200">
                <BookOpen className="h-4 w-4" />
                <span>{classes.length} classes assigned</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {classes.map((cls, i) => (
                <div
                  key={i}
                  onClick={() => handleClassSelect(cls)}
                  className={`bg-white rounded-3xl shadow-lg border-2 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    selectedClass?.class_name === cls.class_name &&
                    selectedClass?.section === cls.section
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 ring-4 ring-blue-200"
                      : "border-white hover:border-blue-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${
                        selectedClass?.class_name === cls.class_name 
                          ? "bg-blue-600" 
                          : "bg-blue-100"
                      }`}>
                        <BookOpen className={`h-6 w-6 ${
                          selectedClass?.class_name === cls.class_name 
                            ? "text-white" 
                            : "text-blue-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl">{cls.class_name}</h3>
                        <p className="text-gray-600">Section {cls.section}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                    <Users className="h-4 w-4" />
                    <span>Manage marks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marks Management Section */}
        {selectedClass && (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedClass.class_name} - Section {selectedClass.section}
                  </h2>
                  <p className="text-gray-600">
                    {marks.length} mark entries • {students.length} students
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all duration-200"
                  >
                    <Plus className="h-5 w-5" />
                    Add Marks
                  </button>
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all duration-200"
                  >
                    <Upload className="h-5 w-5" />
                    Bulk Upload
                  </button>
                  <div className="relative group">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all duration-200">
                      <Download className="h-5 w-5" />
                      Download PDF
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="p-2">
                        <button
                          onClick={generateSemesterPDF}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          📊 Semester Report
                        </button>
                        <button
                          onClick={generateInternalPDF}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          📝 Internal Assessment
                        </button>
                        <button
                          onClick={generateQuizPDF}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          🧠 Quiz Marks
                        </button>
                        <button
                          onClick={generateAssignmentPDF}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          📚 Assignments
                        </button>
                        <button
                          onClick={generateProjectPDF}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          🎓 Projects
                        </button>
                        <button
                          onClick={() => generatePDF()}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl border-t border-gray-200 font-semibold text-blue-600"
                        >
                          📑 All Marks Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by student or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                  <select
                    value={selectedExamType}
                    onChange={(e) => setSelectedExamType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Exam Types</option>
                    <option value="SEMESTER">Semester</option>
                    <option value="INTERNAL">Internal</option>
                    <option value="QUIZ">Quiz</option>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="PROJECT">Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
                  <div className="text-lg font-semibold text-gray-900 py-3">
                    {filteredMarks.length} entries found
                  </div>
                </div>
              </div>
            </div>

            {/* Marks Table */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {filteredMarks.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {marks.length === 0 ? "No Marks Added" : "No Matching Results"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {marks.length === 0 
                      ? "Start by adding marks for your students." 
                      : "Try adjusting your search criteria."}
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold"
                  >
                    Add Marks
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Exam Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Term</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Marks</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Percentage</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Grade</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredMarks.map((mark) => (
                        <tr key={mark.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{mark.student_name}</div>
                              <div className="text-sm text-gray-500">{mark.student_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">{mark.subject}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              mark.exam_type === 'SEMESTER' ? 'bg-purple-100 text-purple-800' :
                              mark.exam_type === 'INTERNAL' ? 'bg-blue-100 text-blue-800' :
                              mark.exam_type === 'QUIZ' ? 'bg-green-100 text-green-800' :
                              mark.exam_type === 'ASSIGNMENT' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {mark.exam_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-900">{mark.term}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {mark.marks_obtained}/{mark.total_marks}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`font-semibold ${
                              mark.percentage >= 80 ? 'text-green-600' :
                              mark.percentage >= 60 ? 'text-yellow-600' :
                              mark.percentage >= 40 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {mark.percentage.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              mark.grade === 'A+' || mark.grade === 'A' ? 'bg-green-100 text-green-800' :
                              mark.grade === 'B+' || mark.grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                              mark.grade === 'C' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {mark.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(mark)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(mark.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
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
          </div>
        )}

        {/* Add/Edit Mark Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingMark ? 'Edit Mark Entry' : 'Add New Marks'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <XCircle className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student *
                    </label>
                    <select
                      required
                      value={formData.student_email}
                      onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.email}>
                          {student.first_name} {student.last_name} ({student.roll_number})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter subject name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Type *
                    </label>
                    <select
                      required
                      value={formData.exam_type}
                      onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="INTERNAL">Internal Assessment</option>
                      <option value="SEMESTER">Semester Exam</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="PROJECT">Project</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.term}
                      onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Term 1, 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks Obtained *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.marks_obtained}
                      onChange={(e) => setFormData({ ...formData, marks_obtained: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter marks"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Marks *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={formData.total_marks}
                      onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter total marks"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional comments or feedback..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all duration-200"
                  >
                    <Save className="h-5 w-5" />
                    {editingMark ? 'Update Marks' : 'Save Marks'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedClass && classes.length === 0 && !loading && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Classes Assigned</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
              You are not currently assigned to any teaching classes. Please contact administration for class assignments.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200">
              Contact Administration
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeachersMarksPage;