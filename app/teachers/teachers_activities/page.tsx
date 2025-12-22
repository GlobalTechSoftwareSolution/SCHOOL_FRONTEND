"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import Image from "next/image";
import {
  Gamepad2,
  Puzzle,
  Code,
  Brain,
  Trophy,
  Timer,
  Users,
  TrendingUp,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Share2,
  BookOpen,
  XCircle,
  X,
  Copy,
  Sparkles,
  Zap,
  BrainCircuit,
  Terminal,
  Calculator,
  Palette,
  Music,
  Atom,
  FlaskConical,
  History,
  Book,
  Calendar
} from "lucide-react";

const API = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

interface Activity {
  id: number;
  title: string;
  description: string;
  type: 'quiz' | 'puzzle' | 'coding' | 'simulation' | 'game' | 'challenge';
  category: 'math' | 'science' | 'coding' | 'logic' | 'language' | 'art' | 'music' | 'history' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  points: number;
  duration: number; // in minutes
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  attempts: number;
  average_score: number;
  completion_rate: number;
  instructions?: string;
  thumbnail_url?: string;
  content?: Record<string, unknown>; // Activity-specific content
}

interface QuizQuestion {
  id: number;
  activity_id: number;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'short_answer' | 'matching' | 'ordering';
  points: number;
  options?: string[];
  correct_answer?: string;
  correct_options?: number[];
  explanation?: string;
  sequence: number;
  image_url?: string;
  code_snippet?: string;
}

interface Puzzle {
  id: number;
  activity_id: number;
  puzzle_type: 'sudoku' | 'crossword' | 'word_search' | 'riddle' | 'logic_grid' | 'pattern';
  data: Record<string, unknown>;
  solution: Record<string, unknown>;
  hints?: string[];
}

interface CodingChallenge {
  id: number;
  activity_id: number;
  problem_statement: string;
  starter_code: string;
  solution_code: string;
  test_cases: Record<string, unknown>[];
  language: 'python' | 'javascript' | 'java' | 'cpp' | 'scratch';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface StudentActivity {
  id: number;
  activity_id: number;
  student_id: number;
  student_email: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'submitted';
  score: number;
  total_points: number;
  percentage: number;
  grade?: string;
  started_at?: string;
  completed_at?: string;
  time_taken?: number; // in minutes
  attempts: number;
  answers?: Record<string, unknown>;
  code_submission?: string;
  feedback?: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  class_id: number;
  section: string;
  student_id: string;
  [key: string]: unknown;
}

interface Teacher {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  [key: string]: unknown;
}

export default function ActivitiesManager() {
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null); // Unused

  // Data states
  const [activities, setActivities] = useState<Activity[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [codingChallenges, setCodingChallenges] = useState<CodingChallenge[]>([]);
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  // UI states
  const [activeTab, setActiveTab] = useState<'all' | 'quizzes' | 'puzzles' | 'coding' | 'games' | 'drafts'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Activity creation/editing states
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityType, setActivityType] = useState<Activity['type']>('quiz');
  const [showPreview, setShowPreview] = useState<number | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState<number | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null);

  // Activity form states
  const [activityForm, setActivityForm] = useState<Partial<Activity>>({
    title: '',
    description: '',
    type: 'quiz',
    category: 'general',
    difficulty: 'beginner',
    points: 100,
    duration: 30,
    status: 'draft',
    tags: [],
    instructions: '',
    thumbnail_url: ''
  });

  // Quiz question states
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 1,
      activity_id: 0,
      question_text: '',
      question_type: 'mcq',
      points: 1,
      options: ['', '', '', ''],
      correct_answer: '0',
      sequence: 1
    }
  ]);

  // Puzzle states
  const [puzzleData, setPuzzleData] = useState<Puzzle>({
    id: 0,
    activity_id: 0,
    puzzle_type: 'sudoku',
    data: {},
    solution: {},
    hints: []
  });

  // Coding challenge states
  const [codingData, setCodingData] = useState<CodingChallenge>({
    id: 0,
    activity_id: 0,
    problem_statement: '',
    starter_code: 'def solve_problem():\n    # Write your solution here\n    pass',
    solution_code: '',
    test_cases: [],
    language: 'python',
    difficulty: 'easy'
  });

  // Load activities
  const loadActivities = useCallback(async () => {
    try {
      const activitiesRes = await axios.get(`${API}/activities/`);
      setActivities(activitiesRes.data || []);

      // Load related data
      const [quizRes, puzzlesRes, codingRes, studentActRes] = await Promise.all([
        axios.get(`${API}/quiz_questions/`),
        axios.get(`${API}/puzzles/`),
        axios.get(`${API}/coding_challenges/`),
        axios.get(`${API}/student_activities/`)
      ]);

      setQuizQuestions(quizRes.data || []);
      setPuzzles(puzzlesRes.data || []);
      setCodingChallenges(codingRes.data || []);
      setStudentActivities(studentActRes.data || []);
    } catch (err: unknown) {
      console.error("Error loading activities:", err);
      createSampleData();
    }
  }, []);

  // Create sample data for demo
  const createSampleData = () => {
    const sampleActivities: Activity[] = [
      {
        id: 1,
        title: "Python Basics Quiz",
        description: "Test your knowledge of Python fundamentals",
        type: 'quiz',
        category: 'coding',
        difficulty: 'beginner',
        points: 100,
        duration: 20,
        status: 'published',
        created_by: teacher?.email || "teacher@school.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['python', 'programming', 'basics'],
        attempts: 45,
        average_score: 78.5,
        completion_rate: 92,
        instructions: "Answer all questions. Each correct answer gives 1 point.",
        thumbnail_url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h-225&fit=crop'
      },
      {
        id: 2,
        title: "Sudoku Challenge",
        description: "Solve this 9x9 Sudoku puzzle",
        type: 'puzzle',
        category: 'logic',
        difficulty: 'intermediate',
        points: 150,
        duration: 30,
        status: 'published',
        created_by: teacher?.email || "teacher@school.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['sudoku', 'logic', 'brain-teaser'],
        attempts: 32,
        average_score: 65.2,
        completion_rate: 85,
        instructions: "Fill the grid so that every row, column, and 3x3 box contains digits 1-9.",
        thumbnail_url: 'https://images.unsplash.com/photo-1633114128174-2f8aa49759b0?w=400&h-225&fit=crop'
      },
      {
        id: 3,
        title: "JavaScript Array Methods",
        description: "Practice using JavaScript array methods",
        type: 'coding',
        category: 'coding',
        difficulty: 'intermediate',
        points: 200,
        duration: 45,
        status: 'published',
        created_by: teacher?.email || "teacher@school.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['javascript', 'arrays', 'coding'],
        attempts: 28,
        average_score: 72.8,
        completion_rate: 88,
        instructions: "Complete the functions using appropriate array methods.",
        thumbnail_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h-225&fit=crop'
      },
      {
        id: 4,
        title: "Math Logic Puzzles",
        description: "Solve these challenging math logic puzzles",
        type: 'puzzle',
        category: 'math',
        difficulty: 'advanced',
        points: 250,
        duration: 40,
        status: 'published',
        created_by: teacher?.email || "teacher@school.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['math', 'logic', 'puzzles'],
        attempts: 19,
        average_score: 58.3,
        completion_rate: 76,
        instructions: "Use logical reasoning to solve each puzzle.",
        thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h-225&fit=crop'
      }
    ];

    const sampleQuizQuestions: QuizQuestion[] = [
      {
        id: 1,
        activity_id: 1,
        question_text: "What is the output of: print(2 ** 3)?",
        question_type: 'mcq',
        points: 1,
        options: ['6', '8', '9', '23'],
        correct_answer: '1',
        explanation: "** is the exponentiation operator in Python. 2 ** 3 = 8",
        sequence: 1
      },
      {
        id: 2,
        activity_id: 1,
        question_text: "Which of the following is NOT a valid Python variable name?",
        question_type: 'mcq',
        points: 1,
        options: ['my_var', '123var', '_var', 'var123'],
        correct_answer: '1',
        explanation: "Variable names cannot start with numbers in Python.",
        sequence: 2
      }
    ];

    setActivities(sampleActivities);
    setQuizQuestions(sampleQuizQuestions);
  };

  // Load all initial data
  const loadInitialData = useCallback(async (teacherEmail: string) => {
    try {
      setLoading(true);

      const [studentsRes, teachersRes] = await Promise.all([
        axios.get(`${API}/students/`),
        axios.get(`${API}/teachers/`)
      ]);

      setStudents(studentsRes.data || []);

      // Find current teacher
      const teacherRecord = (teachersRes.data || []).find(
        (t: Teacher) => t.email?.toLowerCase() === teacherEmail.toLowerCase()
      );
      setTeacher(teacherRecord || null);

      // Load activities created by this teacher
      await loadActivities();

      setLoading(false);
    } catch (err: unknown) {
      console.error("Error loading initial data:", err);
      // For demo, create sample data
      createSampleData();
      setLoading(false);
    }
  }, [createSampleData, loadActivities]);

  // Initialize data on component mount
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.email) {
          // Wrap in setTimeout to avoid calling setState directly in effect
          setTimeout(() => {
            loadInitialData(user.email);
          }, 0);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [loadInitialData]);

  // Filter activities based on active tab and filters
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Tab filter
      if (activeTab !== 'all') {
        if (activeTab === 'quizzes' && activity.type !== 'quiz') return false;
        if (activeTab === 'puzzles' && activity.type !== 'puzzle') return false;
        if (activeTab === 'coding' && activity.type !== 'coding') return false;
        if (activeTab === 'games' && !['simulation', 'game', 'challenge'].includes(activity.type)) return false;
        if (activeTab === 'drafts' && activity.status !== 'draft') return false;
      }

      // Category filter
      if (activeCategory !== 'all' && activity.category !== activeCategory) {
        return false;
      }

      // Search filter
      if (searchTerm && 
          !activity.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !activity.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !activity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && activity.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && activity.status !== selectedStatus) {
        return false;
      }

      // Teacher filter (only show activities created by current teacher)
      if (teacher && activity.created_by !== teacher.email) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [activities, activeTab, activeCategory, searchTerm, selectedDifficulty, selectedStatus, teacher]);

  // Get activity statistics
  const getActivityStats = (activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return null;

    const studentActivitiesForThis = studentActivities.filter(sa => sa.activity_id === activityId);
    
    return {
      totalAttempts: activity.attempts,
      averageScore: activity.average_score,
      completionRate: activity.completion_rate,
      totalStudents: studentActivitiesForThis.length,
      inProgress: studentActivitiesForThis.filter(sa => sa.status === 'in_progress').length,
      completed: studentActivitiesForThis.filter(sa => sa.status === 'completed').length,
      topScore: studentActivitiesForThis.length > 0 ? 
        Math.max(...studentActivitiesForThis.map(sa => sa.score)) : 0
    };
  };

  // Get activity type icon and color
  const getActivityTypeInfo = (type: Activity['type']) => {
    switch (type) {
      case 'quiz':
        return { icon: Brain, color: 'bg-blue-100 text-blue-600', label: 'Quiz' };
      case 'puzzle':
        return { icon: Puzzle, color: 'bg-purple-100 text-purple-600', label: 'Puzzle' };
      case 'coding':
        return { icon: Code, color: 'bg-green-100 text-green-600', label: 'Coding' };
      case 'simulation':
        return { icon: FlaskConical, color: 'bg-yellow-100 text-yellow-600', label: 'Simulation' };
      case 'game':
        return { icon: Gamepad2, color: 'bg-pink-100 text-pink-600', label: 'Game' };
      case 'challenge':
        return { icon: Trophy, color: 'bg-orange-100 text-orange-600', label: 'Challenge' };
      default:
        return { icon: BookOpen, color: 'bg-gray-100 text-gray-600', label: 'Activity' };
    }
  };

  // Get category info
  const getCategoryInfo = (category: Activity['category']) => {
    const config = {
      math: { icon: Calculator, color: 'bg-red-100 text-red-600', label: 'Mathematics' },
      science: { icon: Atom, color: 'bg-blue-100 text-blue-600', label: 'Science' },
      coding: { icon: Terminal, color: 'bg-green-100 text-green-600', label: 'Coding' },
      logic: { icon: BrainCircuit, color: 'bg-purple-100 text-purple-600', label: 'Logic' },
      language: { icon: Book, color: 'bg-yellow-100 text-yellow-600', label: 'Language' },
      art: { icon: Palette, color: 'bg-pink-100 text-pink-600', label: 'Art' },
      music: { icon: Music, color: 'bg-indigo-100 text-indigo-600', label: 'Music' },
      history: { icon: History, color: 'bg-amber-100 text-amber-600', label: 'History' },
      general: { icon: Sparkles, color: 'bg-gray-100 text-gray-600', label: 'General' }
    };
    return config[category] || config.general;
  };

  // Get difficulty info
  const getDifficultyInfo = (difficulty: Activity['difficulty']) => {
    const config = {
      beginner: { color: 'bg-green-100 text-green-700', label: 'Beginner' },
      intermediate: { color: 'bg-yellow-100 text-yellow-700', label: 'Intermediate' },
      advanced: { color: 'bg-orange-100 text-orange-700', label: 'Advanced' },
      expert: { color: 'bg-red-100 text-red-700', label: 'Expert' }
    };
    return config[difficulty] || config.beginner;
  };

  // Initialize activity form
  const initActivityForm = (activity?: Activity) => {
    if (activity) {
      setEditingActivity(activity);
      setActivityType(activity.type);
      setActivityForm({
        title: activity.title,
        description: activity.description,
        type: activity.type,
        category: activity.category,
        difficulty: activity.difficulty,
        points: activity.points,
        duration: activity.duration,
        status: activity.status,
        tags: activity.tags,
        instructions: activity.instructions,
        thumbnail_url: activity.thumbnail_url
      });

      // Load questions/puzzles/coding based on type
      if (activity.type === 'quiz') {
        const activityQuestions = quizQuestions.filter(q => q.activity_id === activity.id);
        setQuestions(activityQuestions.length > 0 ? activityQuestions : [{
          id: 1,
          activity_id: activity.id,
          question_text: '',
          question_type: 'mcq',
          points: 1,
          options: ['', '', '', ''],
          correct_answer: '0',
          sequence: 1
        }]);
      } else if (activity.type === 'puzzle') {
        const puzzle = puzzles.find(p => p.activity_id === activity.id);
        setPuzzleData(puzzle || {
          id: 0,
          activity_id: activity.id,
          puzzle_type: 'sudoku',
          data: {},
          solution: {},
          hints: []
        });
      } else if (activity.type === 'coding') {
        const coding = codingChallenges.find(c => c.activity_id === activity.id);
        setCodingData(coding || {
          id: 0,
          activity_id: activity.id,
          problem_statement: '',
          starter_code: 'def solve_problem():\n    # Write your solution here\n    pass',
          solution_code: '',
          test_cases: [],
          language: 'python',
          difficulty: 'easy'
        });
      }
    } else {
      setEditingActivity(null);
      setActivityForm({
        title: '',
        description: '',
        type: 'quiz',
        category: 'general',
        difficulty: 'beginner',
        points: 100,
        duration: 30,
        status: 'draft',
        tags: [],
        instructions: '',
        thumbnail_url: ''
      });
      setQuestions([{
        id: 1,
        activity_id: 0,
        question_text: '',
        question_type: 'mcq',
        points: 1,
        options: ['', '', '', ''],
        correct_answer: '0',
        sequence: 1
      }]);
    }
    setShowActivityForm(true);
  };

  // Add new question
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: questions.length + 1,
      activity_id: editingActivity?.id || 0,
      question_text: '',
      question_type: 'mcq',
      points: 1,
      options: ['', '', '', ''],
      correct_answer: '0',
      sequence: questions.length + 1
    };
    setQuestions([...questions, newQuestion]);
  };

  // Update question
  const updateQuestion = (index: number, field: keyof QuizQuestion, value: string | number | string[] | number[] | boolean | undefined) => {
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
      updatedQuestions.forEach((q, i) => {
        q.sequence = i + 1;
      });
      setQuestions(updatedQuestions);
    }
  };

  // Save activity
  const saveActivity = async () => {
    try {
      // Validate form
      if (!activityForm.title || !activityForm.description || !activityForm.duration) {
        alert("Please fill in all required fields");
        return;
      }

      // Prepare activity data
      const activityData = {
        ...activityForm,
        created_by: teacher?.email,
        updated_at: new Date().toISOString(),
        attempts: editingActivity?.attempts || 0,
        average_score: editingActivity?.average_score || 0,
        completion_rate: editingActivity?.completion_rate || 0
      };

      let activityResponse;
      if (editingActivity) {
        // Update existing activity
        activityResponse = await axios.put(`${API}/activities/${editingActivity.id}/`, activityData);
        const updatedActivity = activityResponse.data;
        setActivities(activities.map(a => a.id === editingActivity.id ? updatedActivity : a));

        // Save related data based on type
        if (activityForm.type === 'quiz') {
          for (const question of questions) {
            if (question.id > 0) {
              await axios.put(`${API}/quiz_questions/${question.id}/`, {
                ...question,
                activity_id: updatedActivity.id
              });
            } else {
              await axios.post(`${API}/quiz_questions/`, {
                ...question,
                activity_id: updatedActivity.id
              });
            }
          }
        }
      } else {
        // Create new activity
        activityResponse = await axios.post(`${API}/activities/`, activityData);
        const newActivity = activityResponse.data;
        setActivities([...activities, newActivity]);

        // Save related data based on type
        if (activityForm.type === 'quiz') {
          for (const question of questions) {
            await axios.post(`${API}/quiz_questions/`, {
              ...question,
              activity_id: newActivity.id
            });
          }
        }
      }

      setShowActivityForm(false);
      setEditingActivity(null);
      alert(`Activity ${editingActivity ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error("Error saving activity:", err);
      alert("Failed to save activity. Please try again.");
    }
  };

  // Assign activity to students
  const assignActivity = async (activityId: number) => {
    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return;

      // Create assignments for all students
      const assignments = students.map(student => ({
        activity_id: activityId,
        student_id: student.id,
        student_email: student.email,
        assigned_by: teacher?.email,
        assigned_at: new Date().toISOString(),
        status: 'not_started',
        score: 0,
        total_points: activity.points,
        attempts: 0
      }));

      await axios.post(`${API}/student_activities/bulk/`, { assignments });
      setShowAssignModal(null);
      alert(`Activity assigned to ${students.length} students successfully!`);
    } catch (err) {
      console.error("Error assigning activity:", err);
      alert("Failed to assign activity. Please try again.");
    }
  };

  // Get leaderboard data for an activity
  const getLeaderboardData = (activityId: number) => {
    const activityStudentData = studentActivities
      .filter(sa => sa.activity_id === activityId && sa.status === 'completed')
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return activityStudentData.map((sa, index) => ({
      rank: index + 1,
      student: students.find(s => s.id === sa.student_id) || { name: 'Unknown', email: sa.student_email },
      score: sa.score,
      percentage: sa.percentage,
      time_taken: sa.time_taken,
      grade: sa.grade
    }));
  };

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading Activities...</div>
            <div className="text-sm text-gray-500 mt-2">Please wait while we fetch all activities</div>
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
              <XCircle className="h-8 w-8 text-red-600" />
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-indigo-50/10 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-lg">
                  <Gamepad2 className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                    Activities & Games
                  </h1>
                  <p className="text-gray-600 text-sm md:text-base mt-1">
                    Create interactive quizzes, puzzles, coding challenges, and educational games
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => initActivityForm()}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5" />
                <span>Create Activity</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Activities</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{activities.length}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Gamepad2 className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-purple-600 font-medium">All types</span>
                  </div>
                </div>
                <div className="p-2 md:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                  <Gamepad2 className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Attempts</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {activities.reduce((sum, activity) => sum + activity.attempts, 0)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">By students</span>
                  </div>
                </div>
                <div className="p-2 md:p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Avg. Score</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {activities.length > 0 
                      ? Math.round(activities.reduce((sum, activity) => sum + activity.average_score, 0) / activities.length)
                      : 0}%
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600 font-medium">Overall average</span>
                  </div>
                </div>
                <div className="p-2 md:p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                  <Trophy className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Completion Rate</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {activities.length > 0 
                      ? Math.round(activities.reduce((sum, activity) => sum + activity.completion_rate, 0) / activities.length)
                      : 0}%
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600 font-medium">Success rate</span>
                  </div>
                </div>
                <div className="p-2 md:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start lg:items-center justify-between">
              {/* Activity Type Tabs */}
              <div className="flex-1 w-full">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'All Activities', icon: Gamepad2 },
                    { key: 'quizzes', label: 'Quizzes', icon: Brain },
                    { key: 'puzzles', label: 'Puzzles', icon: Puzzle },
                    { key: 'coding', label: 'Coding', icon: Code },
                    { key: 'games', label: 'Games', icon: Gamepad2 },
                    { key: 'drafts', label: 'Drafts', icon: Edit }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as 'all' | 'quizzes' | 'puzzles' | 'coding' | 'games' | 'drafts')}
                      className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg md:rounded-xl transition-all duration-200 font-medium text-sm ${
                        activeTab === key 
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25" 
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
                {/* Category Filter */}
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="math">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="coding">Coding</option>
                  <option value="logic">Logic</option>
                  <option value="language">Language</option>
                  <option value="general">General</option>
                </select>

                {/* Difficulty Filter */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Activities Grid */}
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-8 md:p-12 text-center">
              <Puzzle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || activeCategory !== 'all' || selectedDifficulty !== 'all' || selectedStatus !== 'all' || activeTab !== 'all'
                  ? "No activities match your current filters. Try changing your search criteria."
                  : "You haven't created any activities yet. Create your first activity to get started!"}
              </p>
              <button
                onClick={() => initActivityForm()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium"
              >
                <Plus className="h-5 w-5 inline mr-2" />
                Create First Activity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredActivities.map(activity => {
                const stats = getActivityStats(activity.id);
                const typeInfo = getActivityTypeInfo(activity.type);
                const categoryInfo = getCategoryInfo(activity.category);
                const difficultyInfo = getDifficultyInfo(activity.difficulty);
                const TypeIcon = typeInfo.icon;
                const CategoryIcon = categoryInfo.icon;
                const leaderboardData = getLeaderboardData(activity.id);

                return (
                  <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-md transition-shadow group">
                    {/* Activity Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-100 to-indigo-100 overflow-hidden">
                      {activity.thumbnail_url ? (
                        <Image 
                          src={activity.thumbnail_url} 
                          alt={activity.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <TypeIcon className="h-16 w-16 text-purple-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyInfo.color}`}>
                          {difficultyInfo.label}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${categoryInfo.color} flex items-center gap-1`}>
                          <CategoryIcon className="h-3 w-3" />
                          {categoryInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Activity Content */}
                    <div className="p-4 md:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {activity.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-purple-600">
                            {activity.points} pts
                          </span>
                          <button
                            onClick={() => initActivityForm(activity)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg"
                            title="Edit activity"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {activity.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {activity.tags.slice(0, 3).map(tag => (
                          <span 
                            key={tag} 
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {activity.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            +{activity.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      {stats && (
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          <div className="text-center">
                            <div className="font-bold text-gray-900">{stats.totalAttempts}</div>
                            <div className="text-xs text-gray-600">Attempts</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gray-900">{Math.round(stats.averageScore)}%</div>
                            <div className="text-xs text-gray-600">Avg Score</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gray-900">{stats.completionRate}%</div>
                            <div className="text-xs text-gray-600">Complete</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gray-900">{stats.topScore}</div>
                            <div className="text-xs text-gray-600">Top Score</div>
                          </div>
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4" />
                          <span>{activity.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(activity.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setShowPreview(showPreview === activity.id ? null : activity.id)}
                          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </button>
                        <button
                          onClick={() => setShowLeaderboard(showLeaderboard === activity.id ? null : activity.id)}
                          className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Trophy className="h-4 w-4" />
                          Leaderboard
                        </button>
                        <button
                          onClick={() => setShowAssignModal(activity.id)}
                          className="flex-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Assign
                        </button>
                      </div>
                    </div>

                    {/* Preview Panel */}
                    {showPreview === activity.id && (
                      <div className="border-t p-4 md:p-6 bg-gray-50">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Activity Preview
                        </h4>
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border">
                            <h5 className="font-medium text-gray-900 mb-2">Instructions</h5>
                            <p className="text-sm text-gray-600">{activity.instructions}</p>
                          </div>

                          {activity.type === 'quiz' && (
                            <div className="space-y-3">
                              <h5 className="font-medium text-gray-900">Sample Questions</h5>
                              {quizQuestions
                                .filter(q => q.activity_id === activity.id)
                                .slice(0, 2)
                                .map((q, index) => (
                                  <div key={q.id} className="bg-white p-4 rounded-lg border">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">Q{index + 1}:</span>
                                        <span className="text-sm">{q.question_text}</span>
                                      </div>
                                      <span className="text-sm text-gray-500">{q.points} pts</span>
                                    </div>
                                    {q.question_type === 'mcq' && q.options && (
                                      <div className="space-y-1 ml-6">
                                        {q.options.map((opt, optIndex) => (
                                          <div key={optIndex} className="flex items-center gap-2">
                                            <div className="w-4 h-4 border border-gray-300 rounded-full"></div>
                                            <span className="text-sm">{opt}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}

                          {activity.type === 'puzzle' && (
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium text-gray-900 mb-2">Puzzle Preview</h5>
                              <div className="grid grid-cols-9 gap-1">
                                {Array.from({ length: 81 }).map((_, i) => (
                                  <div 
                                    key={i} 
                                    className="aspect-square border border-gray-300 flex items-center justify-center text-sm"
                                  >
                                    {Math.random() > 0.7 ? Math.floor(Math.random() * 9) + 1 : ''}
                                  </div>
                                ))}
                              </div>
                              <p className="text-sm text-gray-500 mt-2">Sudoku puzzle preview</p>
                            </div>
                          )}

                          {activity.type === 'coding' && (
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg border font-mono text-sm">
                              <pre>{codingChallenges.find(c => c.activity_id === activity.id)?.starter_code || '// Coding challenge preview'}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Leaderboard Panel */}
                    {showLeaderboard === activity.id && (
                      <div className="border-t p-4 md:p-6 bg-gray-50">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Trophy className="h-5 w-5" />
                          Top Performers
                        </h4>
                        <div className="space-y-2">
                          {leaderboardData.length > 0 ? (
                            leaderboardData.map((item, index) => (
                              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                    index === 2 ? 'bg-amber-100 text-amber-700' :
                                    'bg-gray-50 text-gray-600'
                                  }`}>
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : item.rank}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{item.student.name}</div>
                                    <div className="text-xs text-gray-500">{item.student.email}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-gray-900">{item.score} pts</div>
                                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p>No completed attempts yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Create/Edit Activity Modal */}
          {showActivityForm && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black/50" onClick={() => setShowActivityForm(false)} />
              <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                          <Gamepad2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {editingActivity ? 'Edit Activity' : 'Create New Activity'}
                          </h2>
                          <p className="text-purple-100 text-sm">
                            {editingActivity ? 'Update activity details' : 'Create an interactive learning activity'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowActivityForm(false)}
                        className="p-2 hover:bg-white/10 rounded-lg"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Column - Activity Details */}
                      <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Activity Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Activity Title *
                            </label>
                            <input
                              type="text"
                              value={activityForm.title}
                              onChange={(e) => setActivityForm({...activityForm, title: e.target.value})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="e.g., Python Basics Quiz"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Activity Type *
                            </label>
                            <select
                              value={activityForm.type}
                              onChange={(e) => {
                                setActivityForm({...activityForm, type: e.target.value as Activity['type']});
                                setActivityType(e.target.value as Activity['type']);
                              }}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="quiz">Quiz</option>
                              <option value="puzzle">Puzzle</option>
                              <option value="coding">Coding Challenge</option>
                              <option value="simulation">Simulation</option>
                              <option value="game">Educational Game</option>
                              <option value="challenge">Challenge</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Category *
                            </label>
                            <select
                              value={activityForm.category}
                              onChange={(e) => setActivityForm({...activityForm, category: e.target.value as Activity['category']})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="general">General</option>
                              <option value="math">Mathematics</option>
                              <option value="science">Science</option>
                              <option value="coding">Coding</option>
                              <option value="logic">Logic</option>
                              <option value="language">Language</option>
                              <option value="art">Art</option>
                              <option value="music">Music</option>
                              <option value="history">History</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Difficulty Level *
                            </label>
                            <select
                              value={activityForm.difficulty}
                              onChange={(e) => setActivityForm({...activityForm, difficulty: e.target.value as Activity['difficulty']})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Points *
                            </label>
                            <input
                              type="number"
                              value={activityForm.points}
                              onChange={(e) => setActivityForm({...activityForm, points: parseInt(e.target.value)})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              min="1"
                              max="1000"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Duration (minutes) *
                            </label>
                            <input
                              type="number"
                              value={activityForm.duration}
                              onChange={(e) => setActivityForm({...activityForm, duration: parseInt(e.target.value)})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              min="1"
                              max="180"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Status
                            </label>
                            <select
                              value={activityForm.status}
                              onChange={(e) => setActivityForm({...activityForm, status: e.target.value as Activity['status']})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Thumbnail URL (optional)
                            </label>
                            <input
                              type="text"
                              value={activityForm.thumbnail_url}
                              onChange={(e) => setActivityForm({...activityForm, thumbnail_url: e.target.value})}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                          </label>
                          <textarea
                            value={activityForm.description}
                            onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Describe what this activity is about..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instructions
                          </label>
                          <textarea
                            value={activityForm.instructions}
                            onChange={(e) => setActivityForm({...activityForm, instructions: e.target.value})}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Provide instructions for students..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags (comma separated)
                          </label>
                          <input
                            type="text"
                            value={activityForm.tags?.join(', ')}
                            onChange={(e) => setActivityForm({
                              ...activityForm, 
                              tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                            })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., python, programming, basics"
                          />
                        </div>
                      </div>

                      {/* Right Column - Activity Content */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {activityType.charAt(0).toUpperCase() + activityType.slice(1)} Content
                          </h3>
                          
                          {activityType === 'quiz' && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">Quiz Questions</h4>
                                <button
                                  onClick={addQuestion}
                                  className="px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-sm font-medium"
                                >
                                  <Plus className="h-4 w-4 inline mr-1" />
                                  Add Question
                                </button>
                              </div>

                              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
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
                                          value={q.points}
                                          onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                                          className="w-16 px-2 py-1 border rounded text-sm"
                                          min="1"
                                        />
                                        <span className="text-sm text-gray-600">pts</span>
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
                                        <option value="matching">Matching</option>
                                        <option value="ordering">Ordering</option>
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
                                              className="h-4 w-4 text-purple-600"
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

                                    {q.question_type === 'true_false' && (
                                      <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                          <input
                                            type="radio"
                                            name={`tf_${index}`}
                                            checked={q.correct_answer === 'true'}
                                            onChange={() => updateQuestion(index, 'correct_answer', 'true')}
                                            className="h-4 w-4 text-purple-600"
                                          />
                                          <span className="text-sm">True</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                          <input
                                            type="radio"
                                            name={`tf_${index}`}
                                            checked={q.correct_answer === 'false'}
                                            onChange={() => updateQuestion(index, 'correct_answer', 'false')}
                                            className="h-4 w-4 text-purple-600"
                                          />
                                          <span className="text-sm">False</span>
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {activityType === 'puzzle' && (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Puzzle Type
                                </label>
                                <select
                                  value={puzzleData.puzzle_type}
                                  onChange={(e) => setPuzzleData({...puzzleData, puzzle_type: e.target.value as Puzzle['puzzle_type']})}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                  <option value="sudoku">Sudoku</option>
                                  <option value="crossword">Crossword</option>
                                  <option value="word_search">Word Search</option>
                                  <option value="riddle">Riddle</option>
                                  <option value="logic_grid">Logic Grid</option>
                                  <option value="pattern">Pattern Recognition</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Puzzle Data (JSON format)
                                </label>
                                <textarea
                                  value={JSON.stringify(puzzleData.data, null, 2)}
                                  onChange={(e) => {
                                    try {
                                      setPuzzleData({
                                        ...puzzleData,
                                        data: JSON.parse(e.target.value)
                                      });
                                    } catch {
                                      // Keep the textarea value as is for editing
                                    }
                                  }}
                                  rows={6}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                                  placeholder='{"grid": [[1, 2, 3], [4, 5, 6], [7, 8, 9]], ...}'
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Hints (one per line)
                                </label>
                                <textarea
                                  value={puzzleData.hints?.join('\n')}
                                  onChange={(e) => setPuzzleData({
                                    ...puzzleData,
                                    hints: e.target.value.split('\n').filter(h => h.trim())
                                  })}
                                  rows={3}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="Hint 1\nHint 2\nHint 3"
                                />
                              </div>
                            </div>
                          )}

                          {activityType === 'coding' && (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Programming Language
                                </label>
                                <select
                                  value={codingData.language}
                                  onChange={(e) => setCodingData({...codingData, language: e.target.value as CodingChallenge['language']})}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                  <option value="python">Python</option>
                                  <option value="javascript">JavaScript</option>
                                  <option value="java">Java</option>
                                  <option value="cpp">C++</option>
                                  <option value="scratch">Scratch</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Problem Statement
                                </label>
                                <textarea
                                  value={codingData.problem_statement}
                                  onChange={(e) => setCodingData({...codingData, problem_statement: e.target.value})}
                                  rows={4}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="Describe the coding problem..."
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Starter Code
                                </label>
                                <textarea
                                  value={codingData.starter_code}
                                  onChange={(e) => setCodingData({...codingData, starter_code: e.target.value})}
                                  rows={6}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                                  placeholder="Write the starter code..."
                                />
                              </div>
                            </div>
                          )}

                          {activityType === 'game' && (
                            <div className="space-y-4">
                              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="h-5 w-5 text-yellow-600" />
                                  <h4 className="font-medium text-yellow-800">Game Configuration</h4>
                                </div>
                                <p className="text-sm text-yellow-700">
                                  Educational games can be configured with levels, rewards, and interactive elements.
                                  Contact support to integrate custom game engines.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t">
                    <div className="flex justify-between">
                      <button
                        onClick={() => setShowActivityForm(false)}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            // Save as draft
                            setActivityForm({...activityForm, status: 'draft'});
                            setTimeout(saveActivity, 100);
                          }}
                          className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                        >
                          Save as Draft
                        </button>
                        <button
                          onClick={saveActivity}
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg"
                        >
                          {editingActivity ? 'Update Activity' : 'Create Activity'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assign Activity Modal */}
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
                          <Share2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Assign Activity</h2>
                          <p className="text-emerald-100 text-sm">
                            Share this activity with your students
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
                      const activity = activities.find(a => a.id === showAssignModal);
                      if (!activity) return null;

                      const typeInfo = getActivityTypeInfo(activity.type);

                      return (
                        <div className="space-y-6">
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                                <typeInfo.icon className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                                <p className="text-sm text-gray-600">{activity.description}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Assignment Options</h4>
                              
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <div className="font-medium text-gray-900">All Students</div>
                                    <div className="text-sm text-gray-600">Assign to all students in your classes</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-gray-900">{students.length}</div>
                                    <div className="text-sm text-gray-600">students</div>
                                  </div>
                                </div>

                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Zap className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-700">Quick Assignment</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">
                                    Assign this activity to all students with one click.
                                  </p>
                                  <button
                                    onClick={() => assignActivity(activity.id)}
                                    className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium"
                                  >
                                    Assign to All Students
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Share Link</h4>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value={`${window.location.origin}/activity/${activity.id}`}
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                                />
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/activity/${activity.id}`);
                                    alert("Link copied to clipboard!");
                                  }}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Share this link with students to access the activity directly
                              </p>
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
                          const activity = activities.find(a => a.id === showAssignModal);
                          if (activity) {
                            assignActivity(activity.id);
                          }
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium shadow-lg"
                      >
                        <Share2 className="h-5 w-5 inline mr-2" />
                        Assign Activity
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
