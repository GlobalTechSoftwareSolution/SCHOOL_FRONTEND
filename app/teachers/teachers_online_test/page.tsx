"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  BookOpen,
  Clock,
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  FileText,
  Award,
  BarChart,
  TrendingUp,
  Printer,
  Send,
  Share2,
  Copy,
  Home,
  Settings,
  RefreshCw,
  Book,
  Hash,
  User,
  Mail,
  Phone,
  CheckSquare,
  FileQuestion,
  Calculator,
  Type,
  List,
  Radio,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Save,
  UploadCloud,
  FolderOpen,
  Layers,
  Target
} from "lucide-react";

const API = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

interface Test {
  id: number;
  title: string;
  description: string;
  subject: string;
  class_id: number;
  section?: string;
  total_marks: number;
  passing_marks: number;
  duration: number; // in minutes
  start_date: string;
  end_date: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'archived';
  created_by: string;
  created_at: string;
  questions?: Question[];
}

interface Question {
  id: number;
  test_id: number;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'short_answer' | 'essay' | 'fill_blanks';
  marks: number;
  options?: string[];
  correct_answer?: string;
  correct_options?: number[];
  sequence: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  class_id: number;
  section: string;
  student_id: string;
  [key: string]: any;
}

interface Class {
  id: number;
  class_name: string;
  sec: string;
  [key: string]: any;
}

interface Teacher {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  [key: string]: any;
}

interface TestResult {
  id: number;
  test_id: number;
  student_id: number;
  student_email: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  status: 'pending' | 'submitted' | 'graded' | 'absent';
  submitted_at?: string;
  graded_at?: string;
}

export default function TestManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [tests, setTests] = useState<Test[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // UI states
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'scheduled' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Test creation/editing states
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [showQuestions, setShowQuestions] = useState<number | null>(null);
  const [showResults, setShowResults] = useState<number | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null);

  // Test form states
  const [testForm, setTestForm] = useState<Partial<Test>>({
    title: '',
    description: '',
    subject: '',
    class_id: 0,
    section: '',
    total_marks: 100,
    passing_marks: 40,
    duration: 60,
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    status: 'draft'
  });

  // Question form states
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      test_id: 0,
      question_text: '',
      question_type: 'mcq',
      marks: 1,
      options: ['', '', '', ''],
      correct_answer: '',
      sequence: 1
    }
  ]);

  // Get teacher email from localStorage
  useEffect(() => {
    const getTeacherEmail = () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        return userInfo?.email || userData?.email;
      } catch (e) {
        console.error("Error parsing user data:", e);
        return null;
      }
    };

    const teacherEmail = getTeacherEmail();
    if (!teacherEmail) {
      setError("Teacher email not found. Please log in again.");
      setLoading(false);
      return;
    }

    loadInitialData(teacherEmail);
  }, []);

  // Load all initial data
  const loadInitialData = async (teacherEmail: string) => {
    try {
      setLoading(true);
      
      const [studentsRes, classesRes, teachersRes] = await Promise.all([
        axios.get(`${API}/students/`),
        axios.get(`${API}/classes/`),
        axios.get(`${API}/teachers/`)
      ]);

      setStudents(studentsRes.data || []);
      setClasses(classesRes.data || []);

      // Find current teacher
      const teacherRecord = (teachersRes.data || []).find(
        (t: Teacher) => t.email?.toLowerCase() === teacherEmail.toLowerCase()
      );
      setTeacher(teacherRecord || null);

      // Load tests created by this teacher
      await loadTests();

      setLoading(false);
    } catch (err: any) {
      console.error("Error loading initial data:", err);
      setError(err.message || "Failed to load data");
      setLoading(false);
    }
  };

  // Load tests
  const loadTests = async () => {
    try {
      // In a real app, you would fetch tests filtered by teacher
      const testsRes = await axios.get(`${API}/tests/`);
      setTests(testsRes.data || []);
      
      // Load test results
      const resultsRes = await axios.get(`${API}/test_results/`);
      setTestResults(resultsRes.data || []);
    } catch (err) {
      console.error("Error loading tests:", err);
      // For demo, create sample data
      createSampleData();
    }
  };

  // Create sample data for demo
  const createSampleData = () => {
    const sampleTests: Test[] = [
      {
        id: 1,
        title: "Mathematics Mid-Term Exam",
        description: "Covers chapters 1-5 of Algebra and Geometry",
        subject: "Mathematics",
        class_id: 10,
        section: "A",
        total_marks: 100,
        passing_marks: 40,
        duration: 180,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_by: teacher?.email || "teacher@school.com",
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: "Science Chapter 1 Quiz",
        description: "Basic concepts of Physics",
        subject: "Science",
        class_id: 10,
        section: "B",
        total_marks: 50,
        passing_marks: 20,
        duration: 45,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        created_by: teacher?.email || "teacher@school.com",
        created_at: new Date().toISOString()
      }
    ];

    const sampleResults: TestResult[] = [
      {
        id: 1,
        test_id: 1,
        student_id: 101,
        student_email: "student1@school.com",
        marks_obtained: 85,
        total_marks: 100,
        percentage: 85,
        grade: "A",
        status: 'graded',
        submitted_at: new Date().toISOString(),
        graded_at: new Date().toISOString()
      }
    ];

    setTests(sampleTests);
    setTestResults(sampleResults);
  };

  // Filter tests based on active tab and filters
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      // Tab filter
      if (activeTab !== 'all' && test.status !== activeTab) {
        return false;
      }

      // Search filter
      if (searchTerm && !test.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !test.subject.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Class filter
      if (selectedClass !== 'all' && test.class_id !== parseInt(selectedClass)) {
        return false;
      }

      // Subject filter
      if (selectedSubject !== 'all' && test.subject !== selectedSubject) {
        return false;
      }

      // Teacher filter (only show tests created by current teacher)
      if (teacher && test.created_by !== teacher.email) {
        return false;
      }

      return true;
    });
  }, [tests, activeTab, searchTerm, selectedClass, selectedSubject, teacher]);

  // Get unique subjects from tests
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set(tests.map(test => test.subject));
    return Array.from(subjects);
  }, [tests]);

  // Get classes assigned to teacher
  const assignedClasses = useMemo(() => {
    if (!teacher) return [];
    
    // In a real app, you would fetch teacher's assigned classes from timetable
    return classes;
  }, [classes, teacher]);

  // Initialize test form
  const initTestForm = (test?: Test) => {
    if (test) {
      setEditingTest(test);
      setTestForm({
        title: test.title,
        description: test.description,
        subject: test.subject,
        class_id: test.class_id,
        section: test.section,
        total_marks: test.total_marks,
        passing_marks: test.passing_marks,
        duration: test.duration,
        start_date: test.start_date.slice(0, 16),
        end_date: test.end_date.slice(0, 16),
        status: test.status
      });
      
      // Load questions for this test
      setQuestions(test.questions || [{
        id: 1,
        test_id: test.id,
        question_text: '',
        question_type: 'mcq',
        marks: 1,
        options: ['', '', '', ''],
        correct_answer: '',
        sequence: 1
      }]);
    } else {
      setEditingTest(null);
      setTestForm({
        title: '',
        description: '',
        subject: '',
        class_id: assignedClasses[0]?.id || 0,
        section: '',
        total_marks: 100,
        passing_marks: 40,
        duration: 60,
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        status: 'draft'
      });
      setQuestions([{
        id: 1,
        test_id: 0,
        question_text: '',
        question_type: 'mcq',
        marks: 1,
        options: ['', '', '', ''],
        correct_answer: '',
        sequence: 1
      }]);
    }
    setShowTestForm(true);
  };

  // Add new question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      test_id: editingTest?.id || 0,
      question_text: '',
      question_type: 'mcq',
      marks: 1,
      options: ['', '', '', ''],
      correct_answer: '',
      sequence: questions.length + 1
    };
    setQuestions([...questions, newQuestion]);
  };

  // Update question
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  // Update question options
  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const options = [...(updatedQuestions[questionIndex].options || [])];
    options[optionIndex] = value;
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  // Remove question
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      // Update sequence numbers
      updatedQuestions.forEach((q, i) => {
        q.sequence = i + 1;
      });
      setQuestions(updatedQuestions);
    }
  };

  // Save test
  const saveTest = async () => {
    try {
      // Validate form
      if (!testForm.title || !testForm.subject || !testForm.class_id || !testForm.duration) {
        alert("Please fill in all required fields");
        return;
      }

      // Prepare test data
      const testData = {
        ...testForm,
        created_by: teacher?.email,
        questions: questions
      };

      let response: any;
      if (editingTest) {
        // Update existing test
        response = await axios.put(`${API}/tests/${editingTest.id}/`, testData);
        setTests(tests.map(t => t.id === editingTest.id ? response.data : t));
      } else {
        // Create new test
        response = await axios.post(`${API}/tests/`, testData);
        setTests([...tests, response.data]);
      }

      setShowTestForm(false);
      setEditingTest(null);
      alert(`Test ${editingTest ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error("Error saving test:", err);
      alert("Failed to save test. Please try again.");
    }
  };

  // Delete test
  const deleteTest = async (testId: number) => {
    if (!confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`${API}/tests/${testId}/`);
      setTests(tests.filter(t => t.id !== testId));
      alert("Test deleted successfully!");
    } catch (err) {
      console.error("Error deleting test:", err);
      alert("Failed to delete test. Please try again.");
    }
  };

  // Assign test to students
  const assignTestToClass = async (testId: number, classId: number, section?: string) => {
    try {
      // Get students in the class/section
      const studentsToAssign = students.filter(student => {
        if (student.class_id !== classId) return false;
        if (section && student.section !== section) return false;
        return true;
      });

      // Create test assignments for each student
      const assignments = studentsToAssign.map(student => ({
        test_id: testId,
        student_id: student.id,
        student_email: student.email,
        assigned_by: teacher?.email,
        assigned_at: new Date().toISOString()
      }));

      // In a real app, you would send this to your API
      await axios.post(`${API}/test_assignments/bulk/`, { assignments });

      // Update test status
      const test = tests.find(t => t.id === testId);
      if (test && test.status === 'draft') {
        const updatedTest = { ...test, status: 'scheduled' as const };
        await axios.put(`${API}/tests/${testId}/`, updatedTest);
        setTests(tests.map(t => t.id === testId ? updatedTest : t));
      }

      setShowAssignModal(null);
      alert(`Test assigned to ${studentsToAssign.length} students successfully!`);
    } catch (err) {
      console.error("Error assigning test:", err);
      alert("Failed to assign test. Please try again.");
    }
  };

  // Get test statistics
  const getTestStats = (testId: number) => {
    const testResultsForTest = testResults.filter(tr => tr.test_id === testId);
    const totalAssigned = students.filter(s => {
      const test = tests.find(t => t.id === testId);
      if (!test) return false;
      if (s.class_id !== test.class_id) return false;
      if (test.section && s.section !== test.section) return false;
      return true;
    }).length;

    return {
      totalAssigned,
      submitted: testResultsForTest.filter(tr => tr.status === 'submitted' || tr.status === 'graded').length,
      graded: testResultsForTest.filter(tr => tr.status === 'graded').length,
      averageScore: testResultsForTest.length > 0 ? 
        testResultsForTest.reduce((sum, tr) => sum + tr.marks_obtained, 0) / testResultsForTest.length : 0,
      passCount: testResultsForTest.filter(tr => tr.marks_obtained >= (tests.find(t => t.id === testId)?.passing_marks || 0)).length
    };
  };

  // Calculate test progress
  const calculateTestProgress = (test: Test) => {
    const now = new Date().getTime();
    const start = new Date(test.start_date).getTime();
    const end = new Date(test.end_date).getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    return ((now - start) / (end - start)) * 100;
  };

  // Get test status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading Test Manager...</div>
            <div className="text-sm text-gray-500 mt-2">Please wait while we fetch all tests</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50/30 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/10 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg">
                  <BookOpen className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    Test Manager
                  </h1>
                  <p className="text-gray-600 text-sm md:text-base mt-1">
                    Create, manage, and evaluate tests for your classes
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => initTestForm()}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5" />
                <span>Create New Test</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Tests</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{tests.length}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600 font-medium">All subjects</span>
                  </div>
                </div>
                <div className="p-2 md:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Active Tests</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {tests.filter(t => t.status === 'active').length}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Running now</span>
                  </div>
                </div>
                <div className="p-2 md:p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Students Assigned</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {students.length}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-purple-600 font-medium">Across classes</span>
                  </div>
                </div>
                <div className="p-2 md:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Avg. Completion</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {tests.length > 0 
                      ? Math.round(tests.reduce((acc, test) => acc + calculateTestProgress(test), 0) / tests.length)
                      : 0}%
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600 font-medium">Overall progress</span>
                  </div>
                </div>
                <div className="p-2 md:p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start lg:items-center justify-between">
              {/* Tabs */}
              <div className="flex-1 w-full">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'All Tests', icon: FileText },
                    { key: 'draft', label: 'Drafts', icon: Edit },
                    { key: 'scheduled', label: 'Scheduled', icon: Calendar },
                    { key: 'active', label: 'Active', icon: Clock },
                    { key: 'completed', label: 'Completed', icon: CheckCircle }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as any)}
                      className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg md:rounded-xl transition-all duration-200 font-medium text-sm ${
                        activeTab === key 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Class Filter */}
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="all">All Classes</option>
                  {assignedClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name} {cls.sec ? `- ${cls.sec}` : ''}
                    </option>
                  ))}
                </select>

                {/* Subject Filter */}
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tests Grid */}
          {filteredTests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-8 md:p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tests Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || selectedClass !== 'all' || selectedSubject !== 'all' || activeTab !== 'all'
                  ? "No tests match your current filters. Try changing your search criteria."
                  : "You haven't created any tests yet. Create your first test to get started!"}
              </p>
              <button
                onClick={() => initTestForm()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium"
              >
                <Plus className="h-5 w-5 inline mr-2" />
                Create First Test
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {filteredTests.map(test => {
                const stats = getTestStats(test.id);
                const progress = calculateTestProgress(test);
                const className = classes.find(c => c.id === test.class_id)?.class_name || `Class ${test.class_id}`;
                
                return (
                  <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Test Header */}
                    <div className="p-4 md:p-6 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(test.status)}`}>
                              {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {test.subject} • {className} {test.section && `• Section ${test.section}`}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{test.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{test.description}</p>
                          
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{test.duration} mins</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              <span>{test.total_marks} marks</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              <span>Pass: {test.passing_marks}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => initTestForm(test)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Edit test"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => deleteTest(test.id)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                            title="Delete test"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Test Progress */}
                    <div className="px-4 md:px-6 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Test Progress</span>
                        <span className="text-sm font-medium">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            progress < 33 ? 'bg-red-500' :
                            progress < 66 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Start: {new Date(test.start_date).toLocaleDateString()}</span>
                        <span>End: {new Date(test.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Test Stats */}
                    <div className="px-4 md:px-6 py-3 border-t bg-gray-50">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{stats.totalAssigned}</div>
                          <div className="text-xs text-gray-600">Assigned</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{stats.submitted}</div>
                          <div className="text-xs text-gray-600">Submitted</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{stats.graded}</div>
                          <div className="text-xs text-gray-600">Graded</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{Math.round(stats.averageScore)}</div>
                          <div className="text-xs text-gray-600">Avg Score</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 md:p-6 border-t">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setShowQuestions(showQuestions === test.id ? null : test.id)}
                          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Questions
                        </button>
                        <button
                          onClick={() => setShowResults(showResults === test.id ? null : test.id)}
                          className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <BarChart className="h-4 w-4" />
                          Results
                        </button>
                        <button
                          onClick={() => setShowAssignModal(test.id)}
                          className="flex-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Assign
                        </button>
                      </div>
                    </div>

                    {/* Questions Panel */}
                    {showQuestions === test.id && (
                      <div className="border-t p-4 md:p-6 bg-gray-50">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FileQuestion className="h-5 w-5" />
                          Test Questions ({test.questions?.length || 0})
                        </h4>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                          {test.questions?.map((q, index) => (
                            <div key={q.id} className="bg-white p-4 rounded-lg border">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">Q{index + 1}:</span>
                                  <span>{q.question_text}</span>
                                </div>
                                <span className="text-sm text-gray-500">{q.marks} marks</span>
                              </div>
                              {q.question_type === 'mcq' && q.options && (
                                <div className="space-y-1 ml-6">
                                  {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                      <Radio className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm">{opt}</span>
                                      {optIndex === parseInt(q.correct_answer || '0') && (
                                        <Check className="h-4 w-4 text-green-500" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )) || (
                            <div className="text-center py-8 text-gray-500">
                              <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p>No questions added yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Results Panel */}
                    {showResults === test.id && (
                      <div className="border-t p-4 md:p-6 bg-gray-50">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <BarChart className="h-5 w-5" />
                          Test Results
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="py-2 text-left">Student</th>
                                <th className="py-2 text-left">Status</th>
                                <th className="py-2 text-left">Score</th>
                                <th className="py-2 text-left">Grade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {testResults
                                .filter(tr => tr.test_id === test.id)
                                .map(result => (
                                  <tr key={result.id} className="border-b hover:bg-gray-100">
                                    <td className="py-2">{result.student_email}</td>
                                    <td className="py-2">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        result.status === 'graded' ? 'bg-green-100 text-green-800' :
                                        result.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {result.status}
                                      </span>
                                    </td>
                                    <td className="py-2">
                                      {result.marks_obtained}/{result.total_marks}
                                    </td>
                                    <td className="py-2 font-medium">
                                      {result.grade} ({result.percentage}%)
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Create/Edit Test Modal */}
          {showTestForm && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black/50" onClick={() => setShowTestForm(false)} />
              <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {editingTest ? 'Edit Test' : 'Create New Test'}
                          </h2>
                          <p className="text-blue-100 text-sm">
                            {editingTest ? 'Update test details and questions' : 'Set up a new test for your class'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowTestForm(false)}
                        className="p-2 hover:bg-white/10 rounded-lg"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Column - Test Details */}
                      <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Test Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Test Title *
                            </label>
                            <input
                              type="text"
                              value={testForm.title}
                              onChange={(e) => setTestForm({...testForm, title: e.target.value})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Mathematics Final Exam"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Subject *
                            </label>
                            <input
                              type="text"
                              value={testForm.subject}
                              onChange={(e) => setTestForm({...testForm, subject: e.target.value})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Mathematics"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Class *
                            </label>
                            <select
                              value={testForm.class_id || ''}
                              onChange={(e) => setTestForm({...testForm, class_id: parseInt(e.target.value)})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Class</option>
                              {assignedClasses.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                  {cls.class_name} {cls.sec ? `- ${cls.sec}` : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Section
                            </label>
                            <input
                              type="text"
                              value={testForm.section}
                              onChange={(e) => setTestForm({...testForm, section: e.target.value})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., A (leave empty for all sections)"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Marks *
                            </label>
                            <input
                              type="number"
                              value={testForm.total_marks}
                              onChange={(e) => setTestForm({...testForm, total_marks: parseInt(e.target.value)})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="1"
                              max="500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Passing Marks *
                            </label>
                            <input
                              type="number"
                              value={testForm.passing_marks}
                              onChange={(e) => setTestForm({...testForm, passing_marks: parseInt(e.target.value)})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                              max={testForm.total_marks}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Duration (minutes) *
                            </label>
                            <input
                              type="number"
                              value={testForm.duration}
                              onChange={(e) => setTestForm({...testForm, duration: parseInt(e.target.value)})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="1"
                              max="360"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Status
                            </label>
                            <select
                              value={testForm.status}
                              onChange={(e) => setTestForm({...testForm, status: e.target.value as any})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="draft">Draft</option>
                              <option value="scheduled">Scheduled</option>
                              <option value="active">Active</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={testForm.start_date}
                            onChange={(e) => setTestForm({...testForm, start_date: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={testForm.end_date}
                            onChange={(e) => setTestForm({...testForm, end_date: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={testForm.description}
                            onChange={(e) => setTestForm({...testForm, description: e.target.value})}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe what this test covers..."
                          />
                        </div>
                      </div>

                      {/* Right Column - Questions */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
                          <button
                            onClick={addQuestion}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium"
                          >
                            <Plus className="h-4 w-4 inline mr-1" />
                            Add Question
                          </button>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                          {questions.map((q, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">Q{index + 1}</span>
                                  <button
                                    onClick={() => removeQuestion(index)}
                                    className="p-1 hover:bg-red-100 rounded"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-600" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={q.marks}
                                    onChange={(e) => updateQuestion(index, 'marks', parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 border rounded text-sm"
                                    min="1"
                                  />
                                  <span className="text-sm text-gray-600">marks</span>
                                </div>
                              </div>

                              <div className="mb-3">
                                <select
                                  value={q.question_type}
                                  onChange={(e) => updateQuestion(index, 'question_type', e.target.value)}
                                  className="w-full px-3 py-1.5 border rounded-lg text-sm mb-2"
                                >
                                  <option value="mcq">Multiple Choice</option>
                                  <option value="true_false">True/False</option>
                                  <option value="short_answer">Short Answer</option>
                                  <option value="essay">Essay</option>
                                  <option value="fill_blanks">Fill in Blanks</option>
                                </select>
                              </div>

                              <textarea
                                value={q.question_text}
                                onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border rounded-lg text-sm mb-3"
                                placeholder="Enter your question here..."
                              />

                              {q.question_type === 'mcq' && (
                                <div className="space-y-2">
                                  {q.options?.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`correct_${index}`}
                                        checked={parseInt(q.correct_answer || '0') === optIndex}
                                        onChange={() => updateQuestion(index, 'correct_answer', optIndex.toString())}
                                        className="h-4 w-4 text-blue-600"
                                      />
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateQuestionOption(index, optIndex, e.target.value)}
                                        className="flex-1 px-3 py-1.5 border rounded text-sm"
                                        placeholder={`Option ${optIndex + 1}`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t">
                    <div className="flex justify-between">
                      <button
                        onClick={() => setShowTestForm(false)}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            // Save as draft
                            setTestForm({...testForm, status: 'draft'});
                            setTimeout(saveTest, 100);
                          }}
                          className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                        >
                          Save as Draft
                        </button>
                        <button
                          onClick={saveTest}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg"
                        >
                          {editingTest ? 'Update Test' : 'Create Test'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assign Test Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black/50" onClick={() => setShowAssignModal(null)} />
              <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                          <Send className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Assign Test</h2>
                          <p className="text-emerald-100 text-sm">
                            Select students to assign this test
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAssignModal(null)}
                        className="p-2 hover:bg-white/10 rounded-lg"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    {(() => {
                      const test = tests.find(t => t.id === showAssignModal);
                      if (!test) return null;

                      const eligibleStudents = students.filter(s => {
                        if (s.class_id !== test.class_id) return false;
                        if (test.section && s.section !== test.section) return false;
                        return true;
                      });

                      const classInfo = classes.find(c => c.id === test.class_id);

                      return (
                        <div className="space-y-6">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">{test.title}</h3>
                            <div className="text-sm text-gray-600">
                              {classInfo?.class_name} {test.section && `• Section ${test.section}`}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900">
                                Eligible Students ({eligibleStudents.length})
                              </h4>
                              <div className="text-sm text-gray-600">
                                All students in {classInfo?.class_name} {test.section && `Section ${test.section}`}
                              </div>
                            </div>

                            <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="py-3 px-4 text-left">Student</th>
                                    <th className="py-3 px-4 text-left">ID</th>
                                    <th className="py-3 px-4 text-left">Section</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {eligibleStudents.map(student => (
                                    <tr key={student.id} className="border-t hover:bg-gray-50">
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-blue-600" />
                                          </div>
                                          <div>
                                            <div className="font-medium">{student.name}</div>
                                            <div className="text-xs text-gray-500">{student.email}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">{student.student_id}</td>
                                      <td className="py-3 px-4">{student.section}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t">
                    <div className="flex justify-between">
                      <button
                        onClick={() => setShowAssignModal(null)}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const test = tests.find(t => t.id === showAssignModal);
                          if (test) {
                            assignTestToClass(test.id, test.class_id, test.section);
                          }
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium shadow-lg"
                      >
                        Assign to All Eligible Students
                      </button>
                    </div>
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