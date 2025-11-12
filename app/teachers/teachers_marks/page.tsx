"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { motion } from "framer-motion";
import { 
  Loader2, 
  BookOpen, 
  Edit3, 
  Users, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Search,
  Target,
  TrendingUp,
  RefreshCw
} from "lucide-react";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api/";

interface ClassInfo {
  id: number;
  class_name: string;
  section?: string;
  class_teacher_name: string;
}

interface Student {
  id?: number;
  student_id?: string;
  fullname: string;
  email: string;
  class_id: number;
}

interface Grade {
  id: number;
  student_name: string;
  subject_name: string;
  exam_type: string;
  teacher: string;
  marks_obtained: string;
  total_marks: string;
  percentage: number;
}

export default function TeachersMarksPage() {
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [classTeacherMode, setClassTeacherMode] = useState(false);
  const [showAllGrades, setShowAllGrades] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Step 1: Get teacher email
  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      const user = JSON.parse(stored);
      setTeacherEmail(user.email);
      console.log("🧑‍🏫 Teacher email from localStorage:", user.email);
    }
  }, []);

  // ✅ Step 2: Fetch timetable → classes
  useEffect(() => {
    if (!teacherEmail) return;

    const fetchTeacherClasses = async () => {
      try {
        setLoading(true);
        setError("");
        console.log("📚 Fetching timetable...");
        
        const timetableRes = await axios.get(`${API_BASE}timetable/`);
        const allTimetables = timetableRes.data;

        const teacherTimetables = allTimetables.filter(
          (t: any) => t.teacher?.toLowerCase() === teacherEmail.toLowerCase()
        );

        console.log("🕓 Matching timetable entries:", teacherTimetables);

        const classIds = [
          ...new Set(teacherTimetables.map((t: any) => t.class_id)),
        ];

        const classRes = await axios.get(`${API_BASE}classes/`);
        const allClasses = classRes.data;

        const teacherClasses = allClasses.filter((cls: any) =>
          classIds.includes(cls.id)
        );

        console.log("🏫 Teacher Classes:", teacherClasses);
        setClasses(teacherClasses);
        
        if (teacherClasses.length === 0) {
          setError("No classes found for this teacher. Please check your timetable assignments.");
        }
      } catch (err) {
        console.error("❌ Error fetching teacher classes:", err);
        setError("Failed to fetch teacher classes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, [teacherEmail]);

  // ✅ Step 3: Fetch students and grades
  const fetchStudentsAndGrades = async (cls: ClassInfo) => {
    try {
      setLoadingGrades(true);
      setSelectedClass(cls);
      setError("");
      setGrades([]);

      console.log(
        `👩‍🎓 Fetching students for class ${cls.class_name}-${cls.section || ""}...`
      );

      // Fetch all students first
      const studentRes = await axios.get(`${API_BASE}students/`);
      const classStudents = studentRes.data.filter(
        (s: any) => s.class_id === cls.id
      );
      setStudents(classStudents);

      console.log("🎓 Students in class:", classStudents.length);
      
      // Log student details for debugging
      if (classStudents.length > 0) {
        console.table(classStudents.map((s: any) => ({
          id: s.id,
          email: s.email,
          fullname: s.fullname,
          first_name: s.first_name,
          last_name: s.last_name,
          class_id: s.class_id
        })));
      }

      if (classStudents.length === 0) {
        setError("No students found in this class.");
        setLoadingGrades(false);
        return;
      }

      // Fetch all grades at once instead of individual calls
      console.log("📊 Fetching all grades data...");
      const allGradesRes = await axios.get(`${API_BASE}grades/`);
      const allGrades = allGradesRes.data;
      
      console.log(`📊 Total grades in database: ${allGrades.length}`);

      // Filter grades for students in this class
      const classGrades = allGrades.filter((grade: any) => {
        // Log each grade for debugging
        console.log(`🔍 Checking grade ${grade.id}:`, {
          gradeStudent: grade.student,
          gradeStudentEmail: grade.student_email, 
          gradeStudentName: grade.student_name,
          subject: grade.subject_name,
          teacher: grade.teacher
        });
        
        return classStudents.some((student: any) => {
          const studentEmail = student.email?.toLowerCase().trim() || '';
          const studentFullName = student.fullname?.toLowerCase().trim() || '';
          const studentFirstName = student.first_name?.toLowerCase().trim() || '';
          const studentLastName = student.last_name?.toLowerCase().trim() || '';
          
          const gradeStudent = grade.student?.toLowerCase().trim() || '';
          const gradeStudentEmail = grade.student_email?.toLowerCase().trim() || '';
          const gradeStudentName = grade.student_name?.toLowerCase().trim() || '';
          
          // Try multiple matching strategies
          const emailMatch = gradeStudent === studentEmail || gradeStudentEmail === studentEmail;
          const nameMatch = gradeStudentName === studentFullName;
          const firstNameMatch = gradeStudentName.includes(studentFirstName) && studentFirstName.length > 2;
          
          const isMatch = emailMatch || nameMatch || firstNameMatch;
          
          if (isMatch) {
            console.log(`✅ Match found: Grade ${grade.id} -> Student ${student.fullname}`);
          }
          
          return isMatch;
        });
      });

      console.log(`📊 Grades filtered for this class: ${classGrades.length}`);

      // ✅ Step 4: Apply teacher filtering logic
      console.log("🧠 Checking teacher match logic...");
      console.log("🧑‍🏫 Current teacher:", teacherEmail);
      console.log("👨‍🏫 Class teacher:", cls.class_teacher_name);
      
      // Check if current teacher is the class teacher
      const isClassTeacher =
        cls.class_teacher_name?.toLowerCase().trim() === teacherEmail?.toLowerCase().trim();

      console.log("🎓 Is class teacher:", isClassTeacher);
      console.log("🎓 Class teacher mode:", classTeacherMode);

      let filteredGrades = classGrades;

      if (showAllGrades) {
        console.log("🔍 Show All Grades mode - showing all grades for this class");
        filteredGrades = classGrades;
      } else if (isClassTeacher || classTeacherMode) {
        console.log("🎓 Class teacher or class teacher mode — showing all grades");
        filteredGrades = classGrades;
      } else {
        console.log("🎯 Subject teacher mode — filtering grades for this teacher");
        filteredGrades = classGrades.filter(
          (g: any) => {
            const gradeTeacher = g.teacher?.toLowerCase().trim() || '';
            const currentTeacher = teacherEmail?.toLowerCase().trim() || '';
            const teacherMatch = gradeTeacher === currentTeacher;
            console.log(`🔍 Grade ${g.id}: ${g.subject_name} - Teacher: ${g.teacher} - Match: ${teacherMatch}`);
            return teacherMatch;
          }
        );
      }

      console.log("📘 Final Grades Data:", filteredGrades.length, "records");
      
      // Log grade details for debugging
      if (filteredGrades.length > 0) {
        console.table(filteredGrades.slice(0, 5).map((g: any) => ({
          id: g.id,
          student: g.student || g.student_email,
          subject: g.subject_name,
          teacher: g.teacher,
          marks: g.marks_obtained,
          percentage: g.percentage
        })));
      }
      
      setGrades(filteredGrades);
      
      if (filteredGrades.length === 0) {
        if (showAllGrades) {
          setError("No grades found for any students in this class. Grades may not have been entered yet.");
        } else if (isClassTeacher || classTeacherMode) {
          setError("No grades found for any students in this class. Grades may not have been entered yet. Try 'Show All Grades' to see all available data.");
        } else {
          setError("No grades found for your subjects in this class. Try enabling 'Class Teacher Mode' or 'Show All Grades' if you have permission, or check if you have grades assigned to you.");
        }
      } else {
        setSuccessMessage(`Successfully loaded ${filteredGrades.length} grade records!`);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("❌ Error fetching students/grades:", err);
      setError("Failed to fetch students or grades. Please try again.");
    } finally {
      setLoadingGrades(false);
    }
  };

  // ✅ Step 5: Update marks
  const updateMarks = async (gradeId: number, newMarks: number) => {
    try {
      console.log("✏️ Updating marks for grade:", gradeId, "→", newMarks);
      
      // Validate marks
      if (isNaN(newMarks) || newMarks < 0) {
        setError("Please enter valid marks (0 or greater).");
        return;
      }

      const res = await axios.patch(`${API_BASE}grades/${gradeId}/`, {
        marks_obtained: newMarks,
      });
      
      console.log("✅ Marks updated successfully:", res.data);
      
      // Update local state
      setGrades((prev) =>
        prev.map((g) => {
          if (g.id === gradeId) {
            const updatedGrade = { ...g, marks_obtained: String(newMarks) };
            // Recalculate percentage
            const total = parseFloat(g.total_marks) || 100;
            updatedGrade.percentage = Math.round((newMarks / total) * 100);
            return updatedGrade;
          }
          return g;
        })
      );
      
      setSuccessMessage("Marks updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("❌ Error updating marks:", err);
      setError("Failed to update marks. Please try again.");
    }
  };

  // ✅ Step 6: Toggle class teacher mode
  const toggleClassTeacherMode = () => {
    const newMode = !classTeacherMode;
    console.log("🎓 Toggling Class Teacher Mode:", newMode);
    console.log("🧑‍🏫 Current teacher email:", teacherEmail);
    console.log("🏫 Selected class:", selectedClass);
    
    setClassTeacherMode(newMode);
    
    // If we have a selected class, refetch the data with new mode
    if (selectedClass) {
      console.log("🔄 Refetching grades with new mode...");
      fetchStudentsAndGrades(selectedClass);
    }
  };

  // Filter grades based on search term
  const filteredGrades = grades.filter(grade => {
    const studentName = grade.student_name?.toLowerCase().trim() || '';
    const subjectName = grade.subject_name?.toLowerCase().trim() || '';
    const examType = grade.exam_type?.toLowerCase().trim() || '';
    const searchLower = searchTerm.toLowerCase().trim();
    
    return studentName.includes(searchLower) ||
           subjectName.includes(searchLower) ||
           examType.includes(searchLower);
  });

  // Calculate statistics
  const stats = {
    totalGrades: filteredGrades.length,
    averagePercentage: filteredGrades.length > 0 
      ? Math.round(filteredGrades.reduce((sum, g) => sum + g.percentage, 0) / filteredGrades.length)
      : 0,
    highestScore: filteredGrades.length > 0 
      ? Math.max(...filteredGrades.map(g => g.percentage))
      : 0,
    lowestScore: filteredGrades.length > 0 
      ? Math.min(...filteredGrades.map(g => g.percentage))
      : 0
  };

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-white/50 backdrop-blur"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Teacher Marks Management
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    Logged in as <span className="font-semibold text-blue-600">{teacherEmail}</span>
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              {selectedClass && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                    <p className="text-blue-600 text-sm font-medium">Total Grades</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.totalGrades}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                    <p className="text-green-600 text-sm font-medium">Average %</p>
                    <p className="text-2xl font-bold text-green-800">{stats.averagePercentage}%</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                    <p className="text-purple-600 text-sm font-medium">Highest</p>
                    <p className="text-2xl font-bold text-purple-800">{stats.highestScore}%</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                    <p className="text-orange-600 text-sm font-medium">Lowest</p>
                    <p className="text-2xl font-bold text-orange-800">{stats.lowestScore}%</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{successMessage}</span>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
            >
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </motion.div>
          )}

          {/* Class Selection */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
                <p className="text-blue-600 font-semibold">Loading your classes...</p>
              </div>
            </div>
          ) : classes.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Your Classes</h2>
                  <p className="text-gray-600">Select a class to view and manage marks</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {classes.map((cls) => (
                  <motion.div
                    key={cls.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      console.log("🎯 Clicking class:", cls);
                      fetchStudentsAndGrades(cls);
                    }}
                    className={`cursor-pointer border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${
                      selectedClass?.id === cls.id
                        ? "border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg"
                        : "border-gray-200 bg-white hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        selectedClass?.id === cls.id
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gradient-to-br from-gray-400 to-gray-500"
                      }`}>
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">
                          {cls.class_name} - {cls.section || ""}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Teacher: {cls.class_teacher_name || "—"}
                        </p>
                        {cls.class_teacher_name?.toLowerCase().trim() === teacherEmail?.toLowerCase().trim() && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium mt-1">
                            <GraduationCap size={10} />
                            You are class teacher
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">
                        {students.filter(s => s.class_id === cls.id).length} Students
                      </span>
                      <div className="flex items-center gap-2">
                        {loadingGrades && selectedClass?.id === cls.id ? (
                          <Loader2 size={16} className="animate-spin text-blue-600" />
                        ) : (
                          <div className={`w-3 h-3 rounded-full transition-colors ${
                            selectedClass?.id === cls.id ? 'bg-blue-600' : 'bg-gray-300'
                          }`}></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Classes Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You haven't been assigned to any classes yet. Please contact your administrator.
              </p>
            </div>
          )}

          {/* Controls and Grades Table */}
          {selectedClass && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Controls */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/50 backdrop-blur">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedClass.class_name} {selectedClass.section}
                    </h2>
                    <p className="text-gray-600">
                      {filteredGrades.length} grade records found
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search grades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                      />
                    </div>
                    
                    {/* Refresh Button */}
                    <button
                      onClick={() => selectedClass && fetchStudentsAndGrades(selectedClass)}
                      disabled={loadingGrades}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={16} className={loadingGrades ? "animate-spin" : ""} />
                      Refresh
                    </button>
                    
                    {/* Class Teacher Mode Toggle */}
                    <button
                      onClick={toggleClassTeacherMode}
                      disabled={loadingGrades}
                      className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        classTeacherMode
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <GraduationCap size={18} />
                      {classTeacherMode ? "Class Teacher Mode: ON" : "Enable Class Teacher Mode"}
                    </button>
                    
                    {/* Show All Grades Toggle */}
                    <button
                      onClick={() => {
                        const newShowAll = !showAllGrades;
                        setShowAllGrades(newShowAll);
                        console.log("🔍 Show All Grades:", newShowAll);
                        if (selectedClass) fetchStudentsAndGrades(selectedClass);
                      }}
                      disabled={loadingGrades}
                      className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        showAllGrades
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Target size={18} />
                      {showAllGrades ? "Showing All Grades" : "Show All Grades"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Grades Table */}
              {loadingGrades ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                  <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
                  <p className="text-blue-600 font-semibold text-lg">Loading grades data...</p>
                </div>
              ) : filteredGrades.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/50 backdrop-blur">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                          <th className="p-4 text-left font-semibold rounded-tl-xl">Student Name</th>
                          <th className="p-4 text-left font-semibold">Subject</th>
                          <th className="p-4 text-center font-semibold">Exam Type</th>
                          <th className="p-4 text-center font-semibold">Marks Obtained</th>
                          <th className="p-4 text-center font-semibold">Total Marks</th>
                          <th className="p-4 text-center font-semibold">Percentage</th>
                          <th className="p-4 text-center font-semibold rounded-tr-xl">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredGrades.map((grade, i) => (
                          <motion.tr
                            key={grade.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="p-4 font-medium text-gray-900">{grade.student_name}</td>
                            <td className="p-4 text-gray-700">{grade.subject_name}</td>
                            <td className="p-4 text-center">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {grade.exam_type}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`font-bold ${
                                parseFloat(grade.marks_obtained) >= parseFloat(grade.total_marks) * 0.8 
                                  ? 'text-green-600' 
                                  : parseFloat(grade.marks_obtained) >= parseFloat(grade.total_marks) * 0.6 
                                  ? 'text-yellow-600' 
                                  : 'text-red-600'
                              }`}>
                                {grade.marks_obtained}
                              </span>
                            </td>
                            <td className="p-4 text-center text-gray-600">{grade.total_marks}</td>
                            <td className="p-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                (grade.percentage || 0) >= 80 
                                  ? 'bg-green-100 text-green-700 border border-green-200' 
                                  : (grade.percentage || 0) >= 60 
                                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                                  : 'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                                {grade.percentage || 0}%
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {(classTeacherMode ||
                                (grade.teacher?.toLowerCase().trim() || '') === (teacherEmail?.toLowerCase().trim() || '')) && (
                                <button
                                  onClick={() => {
                                    const newMarks = prompt(
                                      `Enter new marks for ${grade.student_name} - ${grade.subject_name}:`,
                                      grade.marks_obtained.toString()
                                    );
                                    if (newMarks && !isNaN(Number(newMarks))) {
                                      updateMarks(grade.id, Number(newMarks));
                                    }
                                  }}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 mx-auto transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                  <Edit3 size={14} />
                                  <span className="font-medium">Update</span>
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Grades Found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchTerm 
                      ? "No grades match your search criteria." 
                      : "No grades found for this class. Try enabling Class Teacher Mode if you are the class teacher."
                    }
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
