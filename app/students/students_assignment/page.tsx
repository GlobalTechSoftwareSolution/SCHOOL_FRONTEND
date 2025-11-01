"use client";
import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'

const StudentAssignment = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Mock data for assignments
  const assignmentData = {
    studentInfo: {
      name: 'John Doe',
      studentId: 'STU2024001',
      department: 'Computer Science',
      semester: 'Fall 2024'
    },
    assignments: [
      {
        id: 1,
        title: 'Data Structures - Binary Trees Implementation',
        subject: 'Data Structures',
        code: 'CS201',
        teacher: 'Dr. Smith',
        dueDate: '2024-02-15',
        submissionDate: null,
        status: 'pending',
        marks: null,
        totalMarks: 100,
        description: 'Implement binary tree operations including insertion, deletion, and traversal algorithms. Submit both code and documentation.',
        requirements: [
          'Complete code implementation',
          'Time complexity analysis',
          'Test cases with outputs',
          'Documentation PDF'
        ],
        attachments: ['assignment1_requirements.pdf', 'sample_code.zip'],
        submittedFile: null,
        feedback: null,
        lateSubmission: false
      },
      {
        id: 2,
        title: 'Database Design - ER Diagram Project',
        subject: 'Database Systems',
        code: 'CS202',
        teacher: 'Prof. Johnson',
        dueDate: '2024-02-10',
        submissionDate: '2024-02-09',
        status: 'submitted',
        marks: null,
        totalMarks: 100,
        description: 'Design an ER diagram for a university management system. Include all entities, relationships, and attributes.',
        requirements: [
          'Complete ER Diagram',
          'Relationship descriptions',
          'Attribute specifications',
          'Normalization explanation'
        ],
        attachments: ['db_project_guidelines.pdf'],
        submittedFile: 'er_diagram_project.pdf',
        feedback: null,
        lateSubmission: false
      },
      {
        id: 3,
        title: 'Operating Systems - Process Scheduling',
        subject: 'Operating Systems',
        code: 'CS203',
        teacher: 'Dr. Wilson',
        dueDate: '2024-02-05',
        submissionDate: '2024-02-04',
        status: 'graded',
        marks: 85,
        totalMarks: 100,
        description: 'Implement and compare different CPU scheduling algorithms including FCFS, SJF, and Round Robin.',
        requirements: [
          'Algorithm implementations',
          'Comparison analysis',
          'Gantt charts',
          'Performance metrics'
        ],
        attachments: ['os_assignment.pdf'],
        submittedFile: 'scheduling_algorithms.zip',
        feedback: 'Good implementation but missing some edge cases in Round Robin. Well documented!',
        lateSubmission: false
      },
      {
        id: 4,
        title: 'Web Development - E-commerce Website',
        subject: 'Web Technologies',
        code: 'CS204',
        teacher: 'Prof. Davis',
        dueDate: '2024-02-01',
        submissionDate: '2024-02-02',
        status: 'graded',
        marks: 92,
        totalMarks: 100,
        description: 'Create a fully functional e-commerce website with user authentication, product catalog, and shopping cart.',
        requirements: [
          'Responsive design',
          'User authentication',
          'Product management',
          'Shopping cart functionality',
          'Payment integration demo'
        ],
        attachments: ['web_project_rubric.pdf'],
        submittedFile: 'ecommerce_website.zip',
        feedback: 'Excellent work! Great UI/UX and all functionalities working perfectly.',
        lateSubmission: true
      },
      {
        id: 5,
        title: 'Machine Learning - Linear Regression',
        subject: 'Machine Learning',
        code: 'CS205',
        teacher: 'Dr. Brown',
        dueDate: '2024-02-20',
        submissionDate: null,
        status: 'pending',
        marks: null,
        totalMarks: 100,
        description: 'Implement linear regression from scratch and apply it to a real-world dataset. Compare with sklearn implementation.',
        requirements: [
          'Custom implementation',
          'Dataset analysis',
          'Performance comparison',
          'Visualizations'
        ],
        attachments: ['ml_assignment.pdf', 'dataset.csv'],
        submittedFile: null,
        feedback: null,
        lateSubmission: false
      }
    ]
  };

  const filteredAssignments = assignmentData.assignments.filter(assignment => {
    if (activeTab === 'all') return true;
    return assignment.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'graded': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'submitted': return '📤';
      case 'graded': return '✅';
      case 'overdue': return '⚠️';
      default: return '📄';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Data Structures': 'border-l-blue-500',
      'Database Systems': 'border-l-green-500',
      'Operating Systems': 'border-l-purple-500',
      'Web Technologies': 'border-l-orange-500',
      'Machine Learning': 'border-l-red-500'
    };
    return colors[subject] || 'border-l-gray-500';
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !assignmentData.assignments.find(a => a.dueDate === dueDate)?.submissionDate;
  };

  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysLeftColor = (days: number) => {
    if (days <= 0) return 'text-red-600';
    if (days <= 2) return 'text-orange-600';
    if (days <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <DashboardLayout role='students'>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-600 mt-2">Manage and submit your academic assignments</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignmentData.assignments.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignmentData.assignments.filter(a => a.status === 'submitted').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">📤</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Graded</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignmentData.assignments.filter(a => a.status === 'graded').length}
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {assignmentData.assignments.filter(a => isOverdue(a.dueDate)).length}
                  </p>
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
                <h3 className="text-lg font-semibold text-gray-900">Your Assignments</h3>
                <p className="text-gray-600 text-sm">Track and manage all your academic work</p>
              </div>
              <div className="flex gap-3">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center gap-2">
                  <span>📥</span>
                  Download All
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center gap-2">
                  <span>+</span>
                  New Submission
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'submitted', 'graded', 'overdue'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    activeTab === tab
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    {tab === 'all' && assignmentData.assignments.length}
                    {tab === 'pending' && assignmentData.assignments.filter(a => a.status === 'pending').length}
                    {tab === 'submitted' && assignmentData.assignments.filter(a => a.status === 'submitted').length}
                    {tab === 'graded' && assignmentData.assignments.filter(a => a.status === 'graded').length}
                    {tab === 'overdue' && assignmentData.assignments.filter(a => isOverdue(a.dueDate)).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 gap-6">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <div 
                  key={assignment.id} 
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 ${getSubjectColor(assignment.subject)}`}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      {/* Assignment Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(assignment.status)} flex items-center gap-2`}>
                            {getStatusIcon(assignment.status)} 
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </span>
                          <span className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                            {assignment.subject} ({assignment.code})
                          </span>
                          {assignment.lateSubmission && (
                            <span className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-full">
                              Late Submission
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {assignment.title}
                        </h3>

                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {assignment.description}
                        </p>

                        {/* Requirements */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {assignment.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Attachments */}
                        {assignment.attachments.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Attachments:</h4>
                            <div className="flex flex-wrap gap-2">
                              {assignment.attachments.map((file, index) => (
                                <span key={index} className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-1">
                                  📎 {file}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dates and Progress */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Due Date:</span>
                            <div className="text-gray-900">
                              {new Date(assignment.dueDate).toLocaleDateString()}
                              <span className={`ml-2 font-semibold ${getDaysLeftColor(calculateDaysLeft(assignment.dueDate))}`}>
                                ({calculateDaysLeft(assignment.dueDate) > 0 ? `${calculateDaysLeft(assignment.dueDate)} days left` : 'Overdue'})
                              </span>
                            </div>
                          </div>
                          
                          {assignment.submissionDate && (
                            <div>
                              <span className="font-medium text-gray-700">Submitted:</span>
                              <div className="text-gray-900">
                                {new Date(assignment.submissionDate).toLocaleDateString()}
                              </div>
                            </div>
                          )}

                          {assignment.marks !== null && (
                            <div>
                              <span className="font-medium text-gray-700">Marks:</span>
                              <div className="text-green-600 font-bold">
                                {assignment.marks}/{assignment.totalMarks}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Feedback */}
                        {assignment.feedback && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-1">Teacher Feedback:</h4>
                            <p className="text-blue-800 text-sm">{assignment.feedback}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        {assignment.status === 'pending' && (
                          <>
                            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200">
                              Submit Assignment
                            </button>
                            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200">
                              Download Requirements
                            </button>
                          </>
                        )}
                        {assignment.status === 'submitted' && (
                          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200">
                            View Submission
                          </button>
                        )}
                        {assignment.status === 'graded' && (
                          <>
                            <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200">
                              View Grade
                            </button>
                            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200">
                              Download Feedback
                            </button>
                          </>
                        )}
                        <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200">
                          Contact Teacher
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No assignments found</h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'all' 
                    ? "You don't have any assignments yet." 
                    : `No ${activeTab} assignments found.`
                  }
                </p>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200">
                  Check for New Assignments
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default StudentAssignment