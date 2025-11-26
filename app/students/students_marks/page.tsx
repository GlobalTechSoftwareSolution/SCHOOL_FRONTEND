"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

const API_URL = "https://school.globaltechsoftwaresolutions.cloud/api/grades/";
const STUDENTS_API = "https://school.globaltechsoftwaresolutions.cloud/api/students/";

type Grade = {
  id: number;
  student_name?: string;
  subject_name?: string;
  teacher_name?: string;
  percentage?: number;
  marks_obtained?: string;
  total_marks?: string;
  exam_type?: string;
  exam_date?: string;
  remarks?: string;
  student?: string;
  [k: string]: any;
};

const StudentMarks = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helpers
  const getStoredEmail = (): string | null => {
    try {
      const direct = localStorage.getItem("email");
      if (direct) return direct;

      const userInfoStr = localStorage.getItem("userInfo");
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr || "{}");
        if (userInfo?.email) return userInfo.email;
      }

      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr || "{}");
        if (userData?.email) return userData.email;
      }
    } catch (err) {
      console.warn("Failed to parse localStorage keys for email", err);
    }
    return null;
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchAndFilterGrades = async () => {
      setLoading(true);
      setError(null);

      const email = getStoredEmail();
      if (!email) {
        setError("No student email found in localStorage.");
        setLoading(false);
        return;
      }

      try {
        console.log("📧 Logged in student:", email);
        const headers = getAuthHeader();

        try {
          const allGradesRes = await axios.get(API_URL, { headers });
          const allData = allGradesRes.data;

          const allGradesArray: Grade[] = Array.isArray(allData) ? allData : (allData ? [allData] : []);

          const matched = allGradesArray.filter((g) => {
            if (!g) return false;
            const studentField = g.student;
            if (studentField && String(studentField).toLowerCase() === String(email).toLowerCase()) return true;

            const jsonStr = JSON.stringify(g).toLowerCase();
            if (jsonStr.includes(String(email).toLowerCase())) return true;

            return false;
          });

          if (matched.length > 0) {
            console.log("✅ Found grades by scanning grades list:", matched.length);
            setGrades(matched);
            setLoading(false);
            return;
          }

          console.log("🔎 No direct match in all-grades list. Falling back to student lookup.");
        } catch (listErr) {
          console.warn("Could not list all grades (or it's disabled). Falling back to lookup.", listErr);
        }

        try {
          const studentRes = await axios.get(`${STUDENTS_API}?email=${encodeURIComponent(email)}`, { headers });
          const studentRecord = Array.isArray(studentRes.data) ? studentRes.data[0] : studentRes.data;

          if (!studentRecord || !studentRecord.student_id) {
            setError("Student record not found (no numeric student_id).");
            setLoading(false);
            return;
          }

          const studentId = studentRecord.student_id;
          console.log("🎓 Student ID:", studentId);

          const gradesRes = await axios.get(`${API_URL}${studentId}/`, { headers });
          const gradesData = gradesRes.data;

          const normalized: Grade[] = Array.isArray(gradesData) ? gradesData : (gradesData ? [gradesData] : []);
          const filtered = normalized.filter(
            (g) => (g.student && g.student.toLowerCase() === email.toLowerCase()) || JSON.stringify(g).toLowerCase().includes(email.toLowerCase())
          );

          if (filtered.length > 0) {
            setGrades(filtered);
          } else {
            setGrades(normalized);
          }
        } catch (studentErr) {
          console.error("Error fetching student or grades by student_id:", studentErr);
          setError("Failed to fetch grades for this student.");
        }
      } catch (err) {
        console.error("Unexpected error fetching grades:", err);
        setError("Unexpected error while fetching grades.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterGrades();
  }, []);

  const handleCardClick = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGrade(null);
  };

  const getProgressColor = (num?: number) => {
    const marks = Number(num ?? 0);
    if (marks >= 80) return "bg-gradient-to-r from-green-500 to-emerald-600";
    if (marks >= 60) return "bg-gradient-to-r from-blue-500 to-cyan-600";
    if (marks >= 40) return "bg-gradient-to-r from-yellow-500 to-amber-600";
    return "bg-gradient-to-r from-red-500 to-rose-600";
  };

  const getGradeColor = (num?: number) => {
    const marks = Number(num ?? 0);
    if (marks >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (marks >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (marks >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getGradeLetter = (num?: number) => {
    const marks = Number(num ?? 0);
    if (marks >= 90) return "A+";
    if (marks >= 80) return "A";
    if (marks >= 70) return "B";
    if (marks >= 60) return "C";
    if (marks >= 50) return "D";
    if (marks >= 40) return "E";
    return "F";
  };

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading your academic performance...</div>
            <p className="text-gray-500 mt-2">Please wait while we fetch your grades</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="students">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-red-600 font-semibold text-lg mb-2">Oops! Something went wrong</div>
            <div className="text-gray-600">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!grades.length) {
    return (
      <DashboardLayout role="students">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <div className="text-gray-700 font-semibold text-lg mb-2">No grades found</div>
            <div className="text-gray-500">We couldn't find any grade records for your account.</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const averagePercentage = grades.reduce((acc, g) => acc + (Number(g.percentage) || 0), 0) / grades.length;

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Academic Performance
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Track your academic journey with detailed insights and performance metrics
            </p>
          </div>

          {/* Enhanced Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Total Records</div>
                  <div className="text-2xl font-bold text-gray-900">{grades.length}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">⭐</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Average %</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {averagePercentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">📅</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Last Exam</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {grades[0]?.exam_date ? new Date(grades[0].exam_date).toLocaleDateString() : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Overall Grade</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {getGradeLetter(averagePercentage)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Grades Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {grades.map((grade, index) => (
              <div 
                key={grade.id ?? `${grade.subject_name}-${index}`}
                onClick={() => handleCardClick(grade)}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300">
                  {/* Subject Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {grade.subject_name ?? "Unknown Subject"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {grade.teacher_name ?? "No Teacher"} • {grade.exam_type ?? "Exam"}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(grade.percentage)}`}>
                      {getGradeLetter(grade.percentage)}
                    </div>
                  </div>

                  {/* Percentage Circle */}
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${grade.percentage || 0} 100`}
                        className={getProgressColor(grade.percentage).replace('bg-gradient-to-r', 'text-blue-500')}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {grade.percentage ?? "—"}%
                      </span>
                    </div>
                  </div>

                  {/* Marks and Progress */}
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {grade.marks_obtained ?? "0"}/{grade.total_marks ?? "0"}
                    </div>
                    <div className="text-sm text-gray-500">Marks Obtained</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Performance</span>
                      <span>{grade.percentage ?? 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${getProgressColor(grade.percentage)}`}
                        style={{ width: `${grade.percentage || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center text-sm text-gray-600 pt-3 border-t border-gray-100">
                    <span>📅 {grade.exam_date ? new Date(grade.exam_date).toLocaleDateString() : "—"}</span>
                    <span className="text-blue-600 font-medium group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Modal for Grade Details */}
        {isModalOpen && selectedGrade && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div 
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-3xl p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedGrade.subject_name ?? "Unknown Subject"}</h2>
                    <p className="text-blue-100">{selectedGrade.teacher_name ?? "No Teacher"} • {selectedGrade.exam_type ?? "Exam"}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Grade Overview */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {selectedGrade.percentage ?? "—"}%
                    </div>
                    <div className="text-sm text-gray-500">Percentage</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {getGradeLetter(selectedGrade.percentage)}
                    </div>
                    <div className="text-sm text-gray-500">Grade</div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Marks Obtained</span>
                    <span className="text-gray-900 font-semibold">
                      {selectedGrade.marks_obtained ?? "0"}/{selectedGrade.total_marks ?? "0"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Exam Date</span>
                    <span className="text-gray-900 font-semibold">
                      {selectedGrade.exam_date ? new Date(selectedGrade.exam_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "—"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Exam Type</span>
                    <span className="text-gray-900 font-semibold">{selectedGrade.exam_type ?? "—"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Teacher</span>
                    <span className="text-gray-900 font-semibold">{selectedGrade.teacher_name ?? "—"}</span>
                  </div>

                  {/* Remarks Section */}
                  <div className="py-3">
                    <div className="text-gray-600 font-medium mb-2">Remarks</div>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-gray-900">
                        {selectedGrade.remarks || "No remarks provided for this assessment."}
                      </p>
                    </div>
                  </div>

                  {/* Performance Indicator */}
                  <div className="py-3">
                    <div className="text-gray-600 font-medium mb-3">Performance Overview</div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full ${getProgressColor(selectedGrade.percentage)}`}
                        style={{ width: `${selectedGrade.percentage || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Needs Improvement</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end p-6 border-t border-gray-100">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default StudentMarks;