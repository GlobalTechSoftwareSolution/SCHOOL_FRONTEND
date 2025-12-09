"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { 
  PlusCircle, 
  Trash2, 
  Eye, 
  ChevronRight, 
  FileText, 
  Users, 
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Save,
  BookOpen,
  RefreshCw,
  Download,
  Filter
} from "lucide-react";

interface Question {
  id?: number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_option: number;
}

interface Subject {
  id: number;
  subject_name: string;
}

interface ClassType {
  id: number;
  class_name: string;
  section?: string;
}

interface OnlineTest {
  id: number;
  title: string;
  class_id: number;
  class_name?: string;
  section?: string;
  sub: number;
  sub_teacher: string;
  created_at?: string;
  status?: string;
}

interface StudentMark {
  id: number;
  test_id: number;
  student_id: number;
  student_name: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  submitted_at?: string;
}

interface StudentAnswer {
  id: number;
  student_id: number;
  student_name: string;
  question_id: number;
  selected_option: number;
  is_correct: boolean;
  marks_awarded: number;
}

interface ExamWithDetails extends OnlineTest {
  questions: Question[];
}

export default function CreateExamPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const [teacherSubjects, setTeacherSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [allClasses, setAllClasses] = useState<ClassType[]>([]);
  
  const [onlineTests, setOnlineTests] = useState<OnlineTest[]>([]);
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [showStudentMarks, setShowStudentMarks] = useState(false);
  
  const [examDetails, setExamDetails] = useState<ExamWithDetails | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [showExamDetails, setShowExamDetails] = useState(false);
  
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", option_1: "", option_2: "", option_3: "", option_4: "", correct_option: 1 },
  ]);

  // --------------------------- Fetch Teacher Data ---------------------------
  const fetchTeacherData = async (): Promise<Subject[]> => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const email = userData.email;
      if (!email) throw new Error("Teacher email not found in localStorage");

      const teacherRes = await axios.get(`http://127.0.0.1:8000/api/teachers/?email=${email}`);
      const teacher = teacherRes.data[0];

      if (!teacher) throw new Error("Teacher not found");

      const subjects: Subject[] = 
        Array.isArray(teacher.subjects_details)
          ? teacher.subjects_details
          : Array.isArray(teacher.subject_list)
          ? teacher.subject_list
          : [];

      const validSubjects = subjects.filter((s) => s && (s.id || s.id));
      setTeacherSubjects(validSubjects);

      if (validSubjects.length > 0) {
        setSubject(validSubjects[0].id || validSubjects[0].id || null);
      }

      return validSubjects;
    } catch (err) { 
      console.error("Error fetching teacher subjects:", err);
      setTeacherSubjects([]);
      setSubject(null);
      return [];
    }
  };

  // --------------------------- Fetch All Classes ---------------------------
  const fetchAllClasses = async (): Promise<ClassType[]> => {
    try {
      const classRes = await axios.get("http://127.0.0.1:8000/api/classes/");
      
      const allClassesData = classRes.data
        .filter((c: any) => c && (c.id || c.class_id))
        .map((c: any) => ({
          id: c.id || c.class_id,
          class_name: c.class_name || c.name || `Class ${c.id || c.class_id}`,
          section: c.section || c.sec || null,
        }));

      setAllClasses(allClassesData);
      return allClassesData;
    } catch (err) {
      console.error("Error fetching all classes:", err);
      setAllClasses([]);
      return [];
    }
  };

  // --------------------------- Fetch Online Tests ---------------------------
  const fetchOnlineTests = async (): Promise<OnlineTest[]> => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const email = userData.email;
      
      if (!email) {
        console.error("Teacher email not found in localStorage");
        return [];
      }

      const testsRes = await axios.get(`http://127.0.0.1:8000/api/exams/?sub_teacher=${email}`);
      const testsData = testsRes.data || [];
      setOnlineTests(testsData);
      return testsData;
    } catch (err) {
      console.error("Error fetching online tests:", err);
      setOnlineTests([]);
      return [];
    }
  };

  // --------------------------- Fetch Exam Details ---------------------------
  const fetchExamDetails = async (examId: number): Promise<ExamWithDetails | null> => {
    try {
      const examRes = await axios.get(`http://127.0.0.1:8000/api/exams/${examId}/`);
      const examData = examRes.data;
      setExamDetails(examData);
      return examData;
    } catch (err) {
      console.error("Error fetching exam details:", err);
      setExamDetails(null);
      return null;
    }
  };

  // --------------------------- Fetch Student Answers ---------------------------
  const fetchStudentAnswers = async (examId: number): Promise<StudentAnswer[]> => {
    try {
      // Use POST instead of GET as per API requirements
      const testResultsRes = await axios.post(`http://127.0.0.1:8000/api/submit_multiple_mcq/`, {
        exam_id: examId
      });
      const testResults = testResultsRes.data || [];
      
      // Handle different possible response structures
      let answersData = [];
      if (Array.isArray(testResults)) {
        answersData = testResults;
      } else if (testResults.results && Array.isArray(testResults.results)) {
        answersData = testResults.results;
      } else if (Object.keys(testResults).length > 0) {
        // If it's a single object with student submissions, convert to array
        answersData = [testResults];
      }
      
      const transformedData: StudentAnswer[] = answersData.map((result: any) => {
        // Handle various possible field names in the response
        const studentId = result.student_id || result.student || 0;
        const studentName = result.student_name || result.student_email || result.email || `Student ${studentId}`;
        const marksAwarded = result.marks_awarded || result.marks_obtained || result.score || 0;
        const isSelected = result.selected_option || result.student_answer || 0;
        
        return {
          id: result.id || 0,
          student_id: studentId,
          student_name: studentName,
          question_id: result.question_id || result.question || examId,
          selected_option: isSelected,
          is_correct: result.is_correct || result.correct || marksAwarded > 0,
          marks_awarded: marksAwarded
        };
      });
      
      setStudentAnswers(transformedData);
      return transformedData;
    } catch (err) {
      console.error("Error fetching student answers:", err);
      setStudentAnswers([]);
      return [];
    }
  };

  // --------------------------- View Exam Details ---------------------------
  const viewExamDetails = async (examId: number) => {
    setSelectedTest(examId);
    await fetchExamDetails(examId);
    await fetchStudentAnswers(examId);
    setShowExamDetails(true);
    setShowStudentMarks(false);
  };

  // --------------------------- Back to Tests List ---------------------------
  const backToTests = () => {
    setShowStudentMarks(false);
    setShowExamDetails(false);
    setSelectedTest(null);
    setStudentMarks([]);
    setExamDetails(null);
    setStudentAnswers([]);
  };

  // --------------------------- Fetch Classes ---------------------------
  const fetchClasses = async (subjects: Subject[]): Promise<ClassType[]> => {
    try {
      const classRes = await axios.get("http://127.0.0.1:8000/api/classes/");
      
      const allClassesData = classRes.data
        .filter((c: any) => c && (c.id || c.class_id))
        .map((c: any) => ({
          id: c.id || c.class_id,
          class_name: c.class_name || c.name || `Class ${c.id || c.class_id}`,
          section: c.section || c.sec || null,
        }));

      setClasses(allClassesData);

      if (allClassesData.length > 0) {
        setSelectedClass(allClassesData[0].id);
      }

      return allClassesData;
    } catch (err) {
      console.error("Error fetching classes:", err);
      setClasses([]);
      setSelectedClass(null);
      return [];
    }
  };

  // --------------------------- Load Teacher + Classes ---------------------------
  useEffect(() => {
    const loadData = async () => {
      const subjects = await fetchTeacherData();
      if (subjects.length > 0) await fetchClasses(subjects);
      await fetchAllClasses();
      await fetchOnlineTests();
    };
    loadData();
  }, []);

  // --------------------------- Add / Remove / Update Questions ---------------------------
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", option_1: "", option_2: "", option_3: "", option_4: "", correct_option: 1 },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (i: number, key: keyof Question, value: string | number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [key]: value };
      return updated;
    });
  };

  // --------------------------- Create Exam ---------------------------
  const createExam = async () => {
    try {
      setSaving(true);

      if (!title.trim()) {
        alert("Please enter an exam title");
        return;
      }
      if (!subject) {
        alert("Please select a subject");
        return;
      }
      if (!selectedClass) {
        alert("Please select a class");
        return;
      }

      for (const q of questions) {
        if (!q.question || !q.option_1 || !q.option_2 || !q.option_3 || !q.option_4) {
          alert("All questions and options must be filled");
          return;
        }
      }

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const email = userData.email;

      const payload = {
        title,
        class_id: selectedClass,
        sub: subject,
        sub_teacher: email,
        questions,
      };

      await axios.post("http://127.0.0.1:8000/api/exams/", payload);

      alert("Exam Created Successfully!");
      // Reset form
      setTitle("");
      setSubject(teacherSubjects[0]?.id || null);
      setSelectedClass(allClasses[0]?.id || null);
      setQuestions([{ question: "", option_1: "", option_2: "", option_3: "", option_4: "", correct_option: 1 }]);
      
      // Refresh tests list
      await fetchOnlineTests();
    } catch (err: any) {
      console.error("Error creating exam:", err);
      alert(err.response?.data ? JSON.stringify(err.response.data) : "Error creating exam");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------- Refresh Tests List ---------------------------
  const refreshTests = async () => {
    setLoading(true);
    await fetchOnlineTests();
    setLoading(false);
  };

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
                <p className="text-gray-600 mt-2">Create and manage online tests for your students</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={refreshTests}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
                <div className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  <span className="font-medium">{onlineTests.length} Exams</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Create Exam Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 ml-3">Create New Exam</h2>
                </div>

                {/* Form Section */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Exam Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
                        <input
                          type="text"
                          placeholder="e.g., Mid-Term Mathematics Exam"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                          <div className="relative">
                            <select
                              value={subject ?? ""}
                              onChange={(e) => setSubject(Number(e.target.value))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            >
                              <option value="">Select Subject</option>
                              {teacherSubjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.subject_name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                              <ChevronRight className="w-5 h-5 text-gray-400 transform rotate-90" />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                          <div className="relative">
                            <select
                              value={selectedClass ?? ""}
                              onChange={(e) => setSelectedClass(Number(e.target.value))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            >
                              <option value="">Select Class</option>
                              {allClasses.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.class_name}
                                  {c.section && ` - ${c.section}`}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                              <ChevronRight className="w-5 h-5 text-gray-400 transform rotate-90" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Questions Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Exam Questions</h3>
                      <button
                        onClick={addQuestion}
                        className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Question
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {questions.map((q, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                                {i + 1}
                              </span>
                              <h4 className="ml-3 font-medium text-gray-900">Question #{i + 1}</h4>
                            </div>
                            {questions.length > 1 && (
                              <button
                                onClick={() => removeQuestion(i)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                              <textarea
                                placeholder="Enter your question here..."
                                value={q.question}
                                onChange={(e) => updateQuestion(i, "question", e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {[1, 2, 3, 4].map((optionNum) => (
                                <div key={optionNum}>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Option {optionNum}
                                    {q.correct_option === optionNum && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                        Correct Answer
                                      </span>
                                    )}
                                  </label>
                                  <input
                                    type="text"
                                    placeholder={`Option ${optionNum}`}
                                    value={q[`option_${optionNum}` as keyof Question] as string}
                                    onChange={(e) => updateQuestion(i, `option_${optionNum}` as keyof Question, e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                      q.correct_option === optionNum 
                                        ? 'border-green-500 bg-green-50' 
                                        : 'border-gray-300'
                                    }`}
                                  />
                                </div>
                              ))}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Select Correct Answer</label>
                              <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 4].map((optionNum) => (
                                  <button
                                    key={optionNum}
                                    onClick={() => updateQuestion(i, "correct_option", optionNum)}
                                    className={`px-4 py-3 rounded-lg border transition-all ${
                                      q.correct_option === optionNum
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                                    }`}
                                  >
                                    Option {optionNum}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      {questions.length} question{questions.length !== 1 ? 's' : ''} • Total Marks: {questions.length * 10}
                    </div>
                    <button
                      onClick={createExam}
                      disabled={saving}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Creating Exam...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Create Exam
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - My Exams */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 ml-3">My Exams</h2>
                  </div>
                  <span className="text-sm text-gray-500">{onlineTests.length} total</span>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                    <p className="text-gray-500">Loading exams...</p>
                  </div>
                ) : onlineTests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No exams yet</h3>
                    <p className="text-gray-500 mb-4">Create your first exam to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {onlineTests.map((test) => (
                      <div 
                        key={test.id} 
                        className={`border rounded-xl p-4 transition-all hover:shadow-md cursor-pointer ${
                          selectedTest === test.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => viewExamDetails(test.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{test.title}</h3>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            ID: {test.id}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            <span>Subject ID: {test.sub}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span>Class ID: {test.class_id}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span>Class: {test.class_name}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span>Section: {test.section}</span>
                          </div>
                          {test.created_at && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>{new Date(test.created_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                          <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                          {test.status && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              test.status === 'active' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-yellow-100 text-yellow-600'
                            }`}>
                              {test.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Exam Details Modal */}
          {showExamDetails && examDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{examDetails.title}</h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center text-gray-600">
                          <BookOpen className="w-4 h-4 mr-1" />
                          Subject ID: {examDetails.sub}
                        </span>
                        <span className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          Class ID: {examDetails.class_id}
                        </span>
                        {examDetails.created_at && (
                          <span className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            Created: {new Date(examDetails.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={backToTests}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Back to Exams
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Export Results
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-8">
                  {/* Questions Section */}
                  <div>
                    <div className="flex items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Exam Questions</h3>
                      <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        {examDetails.questions?.length || 0} Questions
                      </span>
                    </div>
                    
                    {examDetails.questions && examDetails.questions.length > 0 ? (
                      <div className="space-y-4">
                        {examDetails.questions.map((question, index) => (
                          <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                            <div className="flex items-start mb-4">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold flex-shrink-0">
                                {index + 1}
                              </span>
                              <p className="ml-3 font-medium text-gray-900">{question.question}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-11">
                              {[1, 2, 3, 4].map((optionNum) => (
                                <div 
                                  key={optionNum}
                                  className={`p-3 rounded-lg border ${
                                    question.correct_option === optionNum
                                      ? 'border-green-500 bg-green-50'
                                      : 'border-gray-200 bg-white'
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <span className={`inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full text-sm ${
                                      question.correct_option === optionNum
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {optionNum}
                                    </span>
                                    <span>{question[`option_${optionNum}` as keyof Question]}</span>
                                    {question.correct_option === optionNum && (
                                      <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No questions available for this exam.
                      </div>
                    )}
                  </div>

                  {/* Student Answers Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Student Performance</h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">Correct</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">Incorrect</span>
                        </div>
                      </div>
                    </div>
                    
                    {studentAnswers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No student submissions yet.
                      </div>
                    ) : (
                      <div className="overflow-hidden border border-gray-200 rounded-xl">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Question
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Selected Option
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Result
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Score
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {studentAnswers.map((answer) => {
                                // Ensure examDetails exists before trying to access questions
                                let question = null;
                                if (examDetails && examDetails.questions) {
                                  // Fix the question mapping - use question_id to find the actual question
                                  question = examDetails.questions.find((q) => q.id === answer.question_id) || 
                                            examDetails.questions[answer.question_id] || 
                                            examDetails.questions.find((q, idx) => idx === answer.question_id);
                                }
                                
                                return (
                                  <tr key={`${answer.id}-${answer.student_id}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                          <span className="text-blue-600 font-semibold">
                                            {answer.student_name.charAt(0)}
                                          </span>
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">
                                            {answer.student_name}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            ID: {answer.student_id}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="text-sm text-gray-900 max-w-xs truncate">
                                        {question ? question.question : "Overall Performance"}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        Option {answer.selected_option || "N/A"}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        answer.is_correct
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {answer.is_correct ? (
                                          <>
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Correct
                                          </>
                                        ) : (
                                          <>
                                            <XCircle className="w-3 h-3 mr-1" />
                                            Incorrect
                                          </>
                                        )}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm font-semibold text-gray-900">
                                        {answer.marks_awarded} pts
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {/* Performance Summary */}
                    {studentAnswers.length > 0 && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                          <div className="text-sm font-medium text-blue-700">Total Students</div>
                          <div className="text-2xl font-bold text-blue-900 mt-1">
                            {studentAnswers.length}
                          </div>
                        </div>
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                          <div className="text-sm font-medium text-green-700">Average Score</div>
                          <div className="text-2xl font-bold text-green-900 mt-1">
                            {studentAnswers.length > 0 
                              ? Math.round(studentAnswers.reduce((acc, curr) => acc + (curr.marks_awarded || 0), 0) / studentAnswers.length) 
                              : 0} pts
                          </div>
                        </div>
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                          <div className="text-sm font-medium text-purple-700">Correct Rate</div>
                          <div className="text-2xl font-bold text-purple-900 mt-1">
                            {studentAnswers.length > 0 
                              ? Math.round((studentAnswers.filter(a => a.is_correct).length / studentAnswers.length) * 100)
                              : 0}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}