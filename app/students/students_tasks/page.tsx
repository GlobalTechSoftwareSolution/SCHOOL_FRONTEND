"use client";
import DashboardLayout from '@/app/components/DashboardLayout'
import React, { useState } from 'react'

interface Task {
  id: number;
  title: string;
  description: string;
  subject: string;
  priority: string;
  status: string;
  dueDate: string;
  createdDate: string;
  estimatedHours: number;
  completedHours: number;
  tags: string[];
  reminders: string[];
  attachments: string[];
}

const StudentTasks = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data for tasks
  const taskData = {
    studentInfo: {
      name: 'John Doe',
      studentId: 'STU2024001',
      department: 'Computer Science'
    },
    tasks: [
      {
        id: 1,
        title: 'Complete Data Structures Assignment',
        description: 'Finish the binary tree implementation and write documentation. Submit before deadline.',
        subject: 'Data Structures',
        priority: 'high',
        status: 'pending',
        dueDate: '2024-02-15',
        createdDate: '2024-02-10',
        estimatedHours: 8,
        completedHours: 0,
        tags: ['assignment', 'coding', 'documentation'],
        reminders: ['2024-02-14'],
        attachments: ['assignment_requirements.pdf']
      },
      {
        id: 2,
        title: 'Prepare for Database Quiz',
        description: 'Study chapters 4-6 for the upcoming quiz on SQL and normalization.',
        subject: 'Database Systems',
        priority: 'medium',
        status: 'in-progress',
        dueDate: '2024-02-12',
        createdDate: '2024-02-08',
        estimatedHours: 4,
        completedHours: 2,
        tags: ['quiz', 'study', 'sql'],
        reminders: ['2024-02-11'],
        attachments: []
      },
      {
        id: 3,
        title: 'Web Development Project Research',
        description: 'Research modern web frameworks and prepare a comparison report.',
        subject: 'Web Technologies',
        priority: 'medium',
        status: 'completed',
        dueDate: '2024-02-08',
        createdDate: '2024-02-01',
        estimatedHours: 6,
        completedHours: 6,
        tags: ['research', 'project', 'frameworks'],
        reminders: [],
        attachments: ['research_guidelines.pdf']
      },
      {
        id: 4,
        title: 'Machine Learning Paper Review',
        description: 'Read and summarize the research paper on neural networks.',
        subject: 'Machine Learning',
        priority: 'low',
        status: 'pending',
        dueDate: '2024-02-20',
        createdDate: '2024-02-15',
        estimatedHours: 3,
        completedHours: 0,
        tags: ['reading', 'paper', 'neural-networks'],
        reminders: ['2024-02-18'],
        attachments: ['research_paper.pdf']
      },
      {
        id: 5,
        title: 'Operating Systems Lab Report',
        description: 'Complete lab experiment 3 and write detailed report with observations.',
        subject: 'Operating Systems',
        priority: 'high',
        status: 'in-progress',
        dueDate: '2024-02-14',
        createdDate: '2024-02-09',
        estimatedHours: 5,
        completedHours: 3,
        tags: ['lab', 'report', 'experiment'],
        reminders: ['2024-02-13'],
        attachments: ['lab_manual.pdf']
      },
      {
        id: 6,
        title: 'Group Project Meeting Preparation',
        description: 'Prepare slides and agenda for the weekly group project meeting.',
        subject: 'Software Engineering',
        priority: 'medium',
        status: 'completed',
        dueDate: '2024-02-09',
        createdDate: '2024-02-07',
        estimatedHours: 2,
        completedHours: 2,
        tags: ['meeting', 'group-work', 'presentation'],
        reminders: [],
        attachments: ['meeting_notes.docx']
      }
    ]
  };

  const filteredTasks = taskData.tasks.filter(task => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'in-progress': return '🔄';
      case 'completed': return '✅';
      default: return '📄';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const calculateProgress = (task: Task) => {
    if (task.status === 'completed') return 100;
    return (task.completedHours / task.estimatedHours) * 100;
  };

  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysLeftColor = (days: number) => {
    if (days <= 0) return 'text-red-600 bg-red-100';
    if (days <= 2) return 'text-orange-600 bg-orange-100';
    if (days <= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Data Structures': 'bg-blue-100 text-blue-800',
      'Database Systems': 'bg-green-100 text-green-800',
      'Web Technologies': 'bg-purple-100 text-purple-800',
      'Machine Learning': 'bg-red-100 text-red-800',
      'Operating Systems': 'bg-orange-100 text-orange-800',
      'Software Engineering': 'bg-indigo-100 text-indigo-800'
    };
    return colors[subject] || 'bg-gray-100 text-gray-800';
  };

  // Statistics
  const stats = {
    total: taskData.tasks.length,
    pending: taskData.tasks.filter(t => t.status === 'pending').length,
    inProgress: taskData.tasks.filter(t => t.status === 'in-progress').length,
    completed: taskData.tasks.filter(t => t.status === 'completed').length,
    overdue: taskData.tasks.filter(t => calculateDaysLeft(t.dueDate) < 0 && t.status !== 'completed').length
  };

  return (
    <DashboardLayout role='students'>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
            <p className="text-gray-600 mt-2">Organize and track your academic tasks and assignments</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-gray-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xl">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🔄</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Tasks</h3>
                <p className="text-gray-600 text-sm">Manage your academic workload efficiently</p>
              </div>
              <div className="flex gap-3">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center gap-2">
                  <span>📥</span>
                  Export Tasks
                </button>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center gap-2"
                >
                  <span>+</span>
                  Create New Task
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'in-progress', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    activeTab === tab
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    {tab === 'all' && stats.total}
                    {tab === 'pending' && stats.pending}
                    {tab === 'in-progress' && stats.inProgress}
                    {tab === 'completed' && stats.completed}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)} flex items-center gap-1`}>
                          {getPriorityIcon(task.priority)} {task.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)} flex items-center gap-1`}>
                          {getStatusIcon(task.status)} {task.status}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDaysLeftColor(calculateDaysLeft(task.dueDate))}`}>
                        {calculateDaysLeft(task.dueDate) > 0 ? `${calculateDaysLeft(task.dueDate)}d left` : 'Overdue'}
                      </span>
                    </div>

                    {/* Title and Description */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {task.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {task.description}
                    </p>

                    {/* Subject */}
                    <div className="mb-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSubjectColor(task.subject)}`}>
                        {task.subject}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{task.completedHours}h / {task.estimatedHours}h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' : 
                            task.status === 'in-progress' ? 'bg-blue-500' : 'bg-orange-500'
                          } transition-all duration-500`}
                          style={{ width: `${calculateProgress(task)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {task.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Created:</span>
                        <div>{new Date(task.createdDate).toISOString().split('T')[0]}</div>
                      </div>
                      <div>
                        <span className="font-medium">Due:</span>
                        <div>{new Date(task.dueDate).toISOString().split('T')[0]}</div>
                      </div>
                    </div>

                    {/* Attachments */}
                    {task.attachments.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <span>📎</span>
                          <span>Attachments ({task.attachments.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {task.attachments.map((file, index) => (
                            <span key={index} className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded-lg">
                              {file}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      {task.status === 'pending' && (
                        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                          Start Task
                        </button>
                      )}
                      {task.status === 'in-progress' && (
                        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                          Mark Complete
                        </button>
                      )}
                      {task.status === 'completed' && (
                        <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                          Reopen
                        </button>
                      )}
                      <button className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                        ⋮
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'all' 
                    ? "You don't have any tasks yet. Create your first task to get started!" 
                    : `No ${activeTab} tasks found.`
                  }
                </p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  Create Your First Task
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats Footer */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {Math.round((stats.completed / stats.total) * 100)}%
                </div>
                <p className="text-gray-600 text-sm">Completion Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {taskData.tasks.reduce((total, task) => total + task.completedHours, 0)}h
                </div>
                <p className="text-gray-600 text-sm">Total Work Done</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {taskData.tasks.filter(t => calculateDaysLeft(t.dueDate) <= 2 && t.status !== 'completed').length}
                </div>
                <p className="text-gray-600 text-sm">Upcoming Deadlines</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default StudentTasks