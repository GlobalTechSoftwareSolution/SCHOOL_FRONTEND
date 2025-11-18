"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api/";

interface ClassInfo {
  id: number;
  class_name: string;
  sec: string;
  class_teacher_name: string;
  class_teacher: string;
}

interface TimetableEntry {
  id: number;
  teacher: string;
  class_id: number;
  class_name: string;
  section: string;
  subject: string;
}

interface Student {
  id: number;
  fullname: string;
  email: string;
  class_id: number;
  student_id?: string;
}

interface Grade {
  id: number;
  student: string;
  student_email: string;
  student_name: string;
  subject_name: string;
  subject?: number;
  exam_type: string;
  teacher: string;
  teacher_name?: string;
  marks_obtained: string;
  total_marks: string;
  percentage: number;
  remarks?: string;
  exam_date?: string;
}

export default function TeachersMarksPage() {
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Data states
  const [teacherClasses, setTeacherClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  
  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [editingGrade, setEditingGrade] = useState<{ [gradeId: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Get teacher email from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setTeacherEmail(user.email);
    } else {
      setError("Teacher information not found. Please login again.");
      setLoading(false);
    }
  }, []);

  // Fetch teacher's classes using timetable API
  useEffect(() => {
    if (!teacherEmail) return;

    const fetchTeacherClasses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch timetable to get teacher's assigned classes
        console.log("📚 Fetching timetable for teacher:", teacherEmail);
        const timetableResponse = await axios.get(`${API_BASE}timetable/`);
        
        const teacherTimetables = timetableResponse.data.filter(
          (entry: TimetableEntry) => entry.teacher === teacherEmail
        );

        console.log("🕓 Teacher timetable entries:", teacherTimetables);

        // Get unique class IDs from timetable
        const classIds = [...new Set(teacherTimetables.map((entry: TimetableEntry) => entry.class_id))];
        console.log("🏫 Class IDs from timetable:", classIds);

        // Fetch classes to get detailed information
        const classesResponse = await axios.get(`${API_BASE}classes/`);
        const teacherClasses = classesResponse.data.filter((cls: ClassInfo) =>
          classIds.includes(cls.id)
        );

        console.log("🏫 Teacher classes:", teacherClasses);
        setTeacherClasses(teacherClasses);

        if (teacherClasses.length === 0) {
          setError("No classes found for this teacher. Please check your timetable assignments.");
        }

      } catch (error) {
        console.error("❌ Error fetching teacher classes:", error);
        setError("Failed to fetch teacher classes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, [teacherEmail]);

  // Fetch students and grades when class is selected
  const fetchClassData = async (classInfo: ClassInfo) => {
    try {
      setLoadingGrades(true);
      setError(null);
      setSelectedClass(classInfo);
      setGrades([]);
      setStudents([]);

      // Fetch students for the selected class
      console.log(`👩‍🎓 Fetching students for class ${classInfo.class_name}-${classInfo.sec}...`);
      const studentsResponse = await axios.get(`${API_BASE}students/?class_id=${classInfo.id}`);
      
      const classStudents = studentsResponse.data;
      setStudents(classStudents);
      console.log("👨‍🎓 Students in class:", classStudents.length);

      if (classStudents.length === 0) {
        setError("No students found in this class.");
        setLoadingGrades(false);
        return;
      }

      // Fetch all grades and filter for this class's students
      console.log("📊 Fetching grades data...");
      const gradesResponse = await axios.get(`${API_BASE}grades/`);
      const allGrades = gradesResponse.data;
      
      console.log(`📊 Total grades in database: ${allGrades.length}`);

      // Filter grades for students in this class
      const classGrades = allGrades.filter((grade: Grade) => {
        return classStudents.some((student: Student) => {
          const studentEmail = student.email?.toLowerCase().trim() || '';
          const gradeStudent = grade.student?.toLowerCase().trim() || '';
          const gradeStudentEmail = grade.student_email?.toLowerCase().trim() || '';
          
          return gradeStudent === studentEmail || gradeStudentEmail === studentEmail;
        });
      });

      console.log(`📊 Grades filtered for this class: ${classGrades.length}`);

      // Apply teacher filtering logic based on teacher role
      const filteredGrades = classGrades.filter((grade: Grade) => {
        const gradeTeacher = grade.teacher?.toLowerCase().trim() || '';
        const gradeTeacherName = grade.teacher_name?.toLowerCase().trim() || '';
        const currentTeacher = teacherEmail?.toLowerCase().trim() || '';
        
        console.log(`🔍 Grade ${grade.id} - Teacher: "${gradeTeacher}" / "${gradeTeacherName}" vs Current: "${currentTeacher}"`);
        console.log(`🔍 Grade ${grade.id} - Subject: "${grade.subject_name}"`);
        
        // Check if current teacher is the class teacher
        const isClassTeacher = classInfo.class_teacher?.toLowerCase().trim() === currentTeacher;
        
        // Check if current teacher is the subject teacher for this grade
        const isGradeTeacher = gradeTeacher === currentTeacher || gradeTeacherName === currentTeacher;
        
        console.log(`🔍 Grade ${grade.id} - Is Class Teacher: ${isClassTeacher}, Is Grade Teacher: ${isGradeTeacher}`);
        
        // Class teachers can see all grades for their class
        // Subject teachers can only see grades for their subjects
        if (isClassTeacher) {
          return true; // Show all grades for class teachers
        } else {
          return isGradeTeacher; // Show only subject-specific grades for subject teachers
        }
      });

      console.log("📘 Final grades for this teacher:", filteredGrades.length);
      setGrades(filteredGrades);

      if (filteredGrades.length === 0) {
        setError("No grades found for your subjects in this class.");
      } else {
        setSuccessMessage(`Successfully loaded ${filteredGrades.length} grade records!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }

    } catch (error) {
      console.error("❌ Error fetching class data:", error);
      setError("Failed to fetch students or grades. Please try again.");
    } finally {
      setLoadingGrades(false);
    }
  };

  // Check if current teacher can edit a specific grade
  const canEditGrade = (grade: Grade, classInfo: ClassInfo) => {
    const currentTeacher = teacherEmail?.toLowerCase().trim() || '';
    const isClassTeacher = classInfo.class_teacher?.toLowerCase().trim() === currentTeacher;
    const gradeTeacher = grade.teacher?.toLowerCase().trim() || '';
    const gradeTeacherName = grade.teacher_name?.toLowerCase().trim() || '';
    const isGradeTeacher = gradeTeacher === currentTeacher || gradeTeacherName === currentTeacher;
    
    // Class teachers can edit all grades
    // Subject teachers can only edit their subject grades
    return isClassTeacher || isGradeTeacher;
  };

  // Update grade marks
  const updateGrade = async (gradeId: number, newMarks: string) => {
    try {
      const marks = parseFloat(newMarks);
      if (isNaN(marks) || marks < 0) {
        setError("Please enter valid marks (0 or greater).");
        return;
      }

      console.log("✏️ Updating grade:", gradeId, "→", marks);

      const response = await axios.patch(`${API_BASE}grades/${gradeId}/`, {
        marks_obtained: marks,
      });

      console.log("✅ Grade updated successfully:", response.data);

      // Update local state
      setGrades(prevGrades =>
        prevGrades.map(grade => {
          if (grade.id === gradeId) {
            const totalMarks = parseFloat(grade.total_marks) || 100;
            const percentage = Math.round((marks / totalMarks) * 100);
            return {
              ...grade,
              marks_obtained: marks.toString(),
              percentage
            };
          }
          return grade;
        })
      );

      setSuccessMessage("Grade updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error("❌ Error updating grade:", error);
      setError("Failed to update grade. Please try again.");
    }
  };

  // Handle edit mode
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      Object.entries(editingGrade).forEach(([gradeId, marks]) => {
        updateGrade(parseInt(gradeId), marks);
      });
      setEditingGrade({});
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  // Handle grade input change
  const handleGradeChange = (gradeId: number, value: string) => {
    setEditingGrade(prev => ({
      ...prev,
      [gradeId]: value
    }));
  };

  // Filter grades based on search
  const filteredGrades = grades.filter(grade => {
    const searchLower = searchTerm.toLowerCase();
    return (
      grade.student_name?.toLowerCase().includes(searchLower) ||
      grade.subject_name?.toLowerCase().includes(searchLower) ||
      grade.exam_type?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate statistics
  const stats = {
    totalGrades: filteredGrades.length,
    averagePercentage: filteredGrades.length > 0 
      ? Math.round(filteredGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / filteredGrades.length)
      : 0,
    highestScore: filteredGrades.length > 0 
      ? Math.max(...filteredGrades.map(g => g.percentage || 0))
      : 0,
    lowestScore: filteredGrades.length > 0 
      ? Math.min(...filteredGrades.map(g => g.percentage || 0))
      : 0
  };

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your classes...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Teacher Marks Management</h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Logged in as <span className="font-semibold text-blue-600">{teacherEmail}</span>
                </p>
              </div>
              {selectedClass && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Grades</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{stats.totalGrades}</p>
                  </div>
                  <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Average %</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.averagePercentage}%</p>
                  </div>
                  <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Highest</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats.highestScore}%</p>
                  </div>
                  <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Lowest</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{stats.lowestScore}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-green-800 font-medium text-sm sm:text-base">{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-red-800 font-medium text-sm sm:text-base">{error}</span>
            </div>
          )}

          {/* Class Selection */}
          {teacherClasses.length > 0 ? (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Your Classes</h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {teacherClasses.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => fetchClassData(cls)}
                    className={`cursor-pointer border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 hover:shadow-lg group ${
                      selectedClass?.id === cls.id
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      {selectedClass?.id === cls.id && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1">
                      {cls.class_name} - {cls.sec}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      Class Teacher: {cls.class_teacher_name || "N/A"}
                    </p>
                    {cls.class_teacher?.toLowerCase().trim() === teacherEmail?.toLowerCase().trim() && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        You are class teacher
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No Classes Found</h3>
              <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                You haven't been assigned to any classes yet. Please contact your administrator.
              </p>
            </div>
          )}

          {/* Grades Cards Section */}
          {selectedClass && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="text-center lg:text-left">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                      {selectedClass.class_name} {selectedClass.sec} - Grades
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {filteredGrades.length} grade records found
                    </p>
                    <div className="mt-2 flex justify-center lg:justify-start">
                      {selectedClass.class_teacher?.toLowerCase().trim() === teacherEmail?.toLowerCase().trim() ? (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          🎓 Class Teacher - Can edit all grades
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          📚 Subject Teacher - Can edit only your subjects
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                    {/* Search */}
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search grades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48 lg:w-64 text-sm sm:text-base"
                      />
                    </div>
                    
                    {/* Edit Button */}
                    {grades.length > 0 && (
                      <button
                        onClick={handleEditToggle}
                        className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                          isEditing
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                        title={
                          selectedClass?.class_teacher?.toLowerCase().trim() === teacherEmail?.toLowerCase().trim()
                            ? "As class teacher, you can edit all grades"
                            : "You can only edit grades for your subjects"
                        }
                      >
                        {isEditing ? "Save Changes" : "Edit Grades"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {loadingGrades ? (
                <div className="flex justify-center items-center py-12 sm:py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-gray-600 text-sm sm:text-base">Loading grades data...</p>
                  </div>
                </div>
              ) : filteredGrades.length > 0 ? (
                <div className="p-4 sm:p-6">
                  {/* Mobile Cards View */}
                  <div className="block lg:hidden">
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {filteredGrades.map((grade) => (
                        <div
                          key={grade.id}
                          className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">
                                {grade.student_name || 'N/A'}
                              </h3>
                              <p className="text-gray-600 text-sm sm:text-base mb-2">
                                {grade.subject_name || 'N/A'}
                              </p>
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {grade.exam_type || 'N/A'}
                              </span>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              (grade.percentage || 0) >= 80 
                                ? 'bg-green-100 text-green-700' 
                                : (grade.percentage || 0) >= 60 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {grade.percentage || 0}%
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Marks Obtained</p>
                              {isEditing && canEditGrade(grade, selectedClass) ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={editingGrade[grade.id] || grade.marks_obtained}
                                  onChange={(e) => handleGradeChange(grade.id, e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              ) : (
                                <p className={`font-bold text-sm ${
                                  parseFloat(grade.marks_obtained) >= parseFloat(grade.total_marks) * 0.8 
                                    ? 'text-green-600' 
                                    : parseFloat(grade.marks_obtained) >= parseFloat(grade.total_marks) * 0.6 
                                    ? 'text-yellow-600' 
                                    : 'text-red-600'
                                } ${!canEditGrade(grade, selectedClass) ? 'opacity-75' : ''}`}>
                                  {grade.marks_obtained}
                                  {!canEditGrade(grade, selectedClass) && (
                                    <span className="ml-1 text-xs text-gray-500">(🔒)</span>
                                  )}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Total Marks</p>
                              <p className="font-semibold text-sm text-gray-900">{grade.total_marks}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              Teacher: {grade.teacher || 'N/A'}
                            </p>
                            {!canEditGrade(grade, selectedClass) && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                Read-only
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Type</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredGrades.map((grade) => (
                          <tr key={grade.id} className="hover:bg-gray-50">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {grade.student_name || 'N/A'}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.subject_name || 'N/A'}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {grade.exam_type || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {isEditing && canEditGrade(grade, selectedClass) ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={editingGrade[grade.id] || grade.marks_obtained}
                                  onChange={(e) => handleGradeChange(grade.id, e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              ) : (
                                <span className={`font-bold ${
                                  parseFloat(grade.marks_obtained) >= parseFloat(grade.total_marks) * 0.8 
                                    ? 'text-green-600' 
                                    : parseFloat(grade.marks_obtained) >= parseFloat(grade.total_marks) * 0.6 
                                    ? 'text-yellow-600' 
                                    : 'text-red-600'
                                } ${!canEditGrade(grade, selectedClass) ? 'opacity-75' : ''}`}>
                                  {grade.marks_obtained}
                                  {!canEditGrade(grade, selectedClass) && (
                                    <span className="ml-2 text-xs text-gray-500">(🔒 Read-only)</span>
                                  )}
                                </span>
                              )}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.total_marks}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                (grade.percentage || 0) >= 80 
                                  ? 'bg-green-100 text-green-700' 
                                  : (grade.percentage || 0) >= 60 
                                  ? 'bg-yellow-100 text-yellow-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {grade.percentage || 0}%
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.teacher || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No grades found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? "No grades match your search criteria." 
                      : "No grades found for this class or your subjects."
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Media Queries */}
      <style jsx>{`
        @media (max-width: 475px) {
          .grid-cols-1.xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 380px) {
          .grid-cols-1.xs\\:grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .grade-card {
            min-height: 160px;
          }
        }

        @media (min-width: 1536px) {
          .class-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          }
        }

        @media (max-width: 1024px) and (min-width: 768px) {
          .header-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .table-responsive {
            font-size: 0.75rem;
          }
          
          .action-buttons {
            flex-direction: column;
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .header-stats {
            grid-template-columns: 1fr;
          }
          
          .class-header {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}