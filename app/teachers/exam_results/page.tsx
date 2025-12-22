"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Exam {
  id: number;
  title: string;
  subject: string;
  class_id: number;
  total_marks: number;
  created_at: string;
}

interface StudentAnswer {
  id: number;
  exam_id: number;
  student_email: string;
  student_name: string;
  question_id: number;
  question_text: string;
  selected_option: string;
  correct_answer: string;
  is_correct: boolean;
  marks_awarded: number;
  submitted_at: string;
}

interface ApiError {
  message: string;
  response?: {
    data: Record<string, unknown>;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  };
  request?: XMLHttpRequest;
  config?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  };
}

interface Question {
  id: number;
  exam: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  marks: number;
}

export default function ExamResultsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredAnswers, setFilteredAnswers] = useState<StudentAnswer[]>([]);
  const [searchEmail, setSearchEmail] = useState("");

  // Get teacher email from localStorage
  const getTeacherEmail = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      return userInfo?.email || userData?.email;
    } catch {
      return null;
    }
  };

  // Load exams created by this teacher
  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      const teacherEmail = getTeacherEmail();

      if (!teacherEmail) {
        throw new Error("Teacher email not found in localStorage");
      }

      // Fetch exams where sub_teacher matches the current user's email
      const response = await axios.get(
        `https://school.globaltechsoftwaresolutions.cloud/api/exams/?sub_teacher=${teacherEmail}`
      );

      setExams(response.data || []);
      setLoading(false);
    } catch (err: unknown) {
      console.error("Error loading exams:", err);
      setError((err as ApiError).message || "Failed to load exams");
      setLoading(false);
    }
  }, []);

  // Load student answers for a specific exam
  const loadStudentAnswers = async (examId: number) => {
    try {
      setLoading(true);
      
      // First, get the exam questions
      const examResponse = await axios.get(
        `https://school.globaltechsoftwaresolutions.cloud/api/exams/${examId}/`
      );
      
      setQuestions(examResponse.data.questions || []);
      
      // Then, get all student answers for this exam
      // We'll need to make a request to get student submissions
      // Since the API structure isn't completely clear, we'll try a few approaches
      
      try {
        // Try to get student answers directly
        const answersResponse = await axios.get(
          `https://school.globaltechsoftwaresolutions.cloud/api/get_all_mcq/?exam_id=${examId}`
        );
        
        setStudentAnswers(answersResponse.data || []);
        setFilteredAnswers(answersResponse.data || []);
      } catch {
        console.log("Direct answers fetch failed, trying alternative approach...");
        
        // Alternative approach - get all submissions for this exam
        try {
          const submissionsResponse = await axios.get(
            `https://school.globaltechsoftwaresolutions.cloud/api/test_submissions/?exam_id=${examId}`
          );
          
          // Transform submissions to our StudentAnswer format
          const transformedAnswers: StudentAnswer[] = submissionsResponse.data.map((sub: { 
            id: number;
            exam: number;
            student_email: string;
            student_name: string;
            question_id: number;
            question_text: string;
            selected_option: string;
            correct_answer: string;
            is_correct: boolean;
            marks_awarded: number;
            submitted_at: string;
          }) => ({
            id: sub.id,
            exam_id: examId,
            student_email: sub.student_email || "unknown@student.com",
            student_name: sub.student_name || sub.student_email || "Unknown Student",
            question_id: sub.question_id || 0,
            question_text: sub.question_text || "Unknown Question",
            selected_option: sub.selected_option || "",
            correct_answer: sub.correct_answer || "",
            is_correct: sub.is_correct || false,
            marks_awarded: sub.marks_awarded || 0,
            submitted_at: sub.submitted_at || new Date().toISOString()
          }));
          
          setStudentAnswers(transformedAnswers);
          setFilteredAnswers(transformedAnswers);
        } catch (submissionsErr) {
          console.error("Both approaches failed:", submissionsErr);
          setStudentAnswers([]);
          setFilteredAnswers([]);
        }
      }
      
      setLoading(false);
    } catch (err: unknown) {
      console.error("Error loading student answers:", err);
      setError((err as ApiError).message || "Failed to load student answers");
      setLoading(false);
    }
  };

  // Filter answers by student email
  const filterByStudentEmail = useCallback(() => {
    if (!searchEmail) {
      setFilteredAnswers(studentAnswers);
    } else {
      const filtered = studentAnswers.filter(answer =>
        answer.student_email.toLowerCase().includes(searchEmail.toLowerCase())
      );
      setFilteredAnswers(filtered);
    }
  }, [searchEmail, studentAnswers]);

  // Handle exam selection
  const handleExamSelect = async (examId: number) => {
    setSelectedExam(examId);
    setSearchEmail("");
    await loadStudentAnswers(examId);
  };

  // Handle search email change
  const handleSearchEmailChange = (email: string) => {
    setSearchEmail(email);
  };

  // Handle search submission
  const handleSearch = () => {
    filterByStudentEmail();
  };

  // Load exams on component mount
  useEffect(() => {
    loadExams();
  }, [loadExams]);

  // Apply email filter when searchEmail changes
  useEffect(() => {
    filterByStudentEmail();
  }, [searchEmail, studentAnswers, filterByStudentEmail]);

  if (loading && exams.length === 0) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading Exam Results...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Exam Results</h1>
            <p className="text-gray-600 mt-2">View and analyze student performance on your exams</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedExam ? (
            /* Exam Selection */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select an Exam</h2>
              
              {exams.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No exams found</h3>
                  <p className="mt-1 text-sm text-gray-500">You haven&apos;t created any exams yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exams.map(exam => (
                    <div 
                      key={exam.id} 
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleExamSelect(exam.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{exam.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{exam.subject}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ID: {exam.id}
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Created: {new Date(exam.created_at).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          Total Marks: {exam.total_marks}
                        </div>
                      </div>
                      
                      <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
                        View Results
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Exam Results */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Exam Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {exams.find(e => e.id === selectedExam)?.title || "Exam Results"}
                    </h2>
                    <p className="text-blue-100">
                      Viewing results for Exam ID: {selectedExam}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedExam(null);
                      setStudentAnswers([]);
                      setFilteredAnswers([]);
                      setSearchEmail("");
                    }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    ← Back to Exams
                  </button>
                </div>
              </div>
              
              {/* Search Section */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-grow">
                    <label htmlFor="email-search" className="block text-sm font-medium text-gray-700 mb-1">
                      Search by Student Email
                    </label>
                    <div className="flex rounded-md shadow-sm">
                      <input
                        type="text"
                        id="email-search"
                        value={searchEmail}
                        onChange={(e) => handleSearchEmailChange(e.target.value)}
                        placeholder="Enter student email..."
                        className="flex-grow min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <button
                        onClick={handleSearch}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchEmail("");
                        setFilteredAnswers(studentAnswers);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                    >
                      Clear Filter
                    </button>
                  </div>
                </div>
                
                {searchEmail && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Showing results for: <span className="font-medium">{searchEmail}</span>
                      {filteredAnswers.length === 0 && studentAnswers.length > 0 && (
                        <span className="ml-2 text-orange-600">(No matching students found)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Results Table */}
              <div className="overflow-x-auto">
                {filteredAnswers.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {studentAnswers.length === 0 
                        ? "No student submissions found for this exam." 
                        : "No students match your search criteria."}
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Answer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Correct Answer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Result
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marks
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAnswers.map((answer) => {
                        // Find the corresponding question
                        const question = questions.find(q => q.id === answer.question_id);
                        
                        return (
                          <tr key={`${answer.id}-${answer.question_id}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{answer.student_name}</div>
                              <div className="text-sm text-gray-500">{answer.student_email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate" title={question?.question_text || answer.question_text}>
                                {question?.question_text || answer.question_text || "Unknown Question"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${
                                answer.is_correct ? "text-green-600" : "text-red-600"
                              }`}>
                                {answer.selected_option}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {answer.correct_answer}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {answer.is_correct ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Correct
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Incorrect
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`font-medium ${
                                answer.marks_awarded > 0 ? "text-green-600" : "text-red-600"
                              }`}>
                                {answer.marks_awarded}
                              </span>
                              {question && (
                                <span className="text-gray-400">/{question.marks}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(answer.submitted_at).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              
              {/* Summary Section */}
              {filteredAnswers.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{filteredAnswers.length}</span> of{" "}
                      <span className="font-medium">{studentAnswers.length}</span> total answers
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Correct Answers:</span>{" "}
                        <span className="font-medium text-green-600">
                          {filteredAnswers.filter(a => a.is_correct).length}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Incorrect Answers:</span>{" "}
                        <span className="font-medium text-red-600">
                          {filteredAnswers.filter(a => !a.is_correct).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
