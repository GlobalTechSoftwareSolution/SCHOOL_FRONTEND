import DashboardLayout from '@/app/components/DashboardLayout'
import React from 'react'

const StudentMarks = () => {
  // Mock data for student marks
  const studentData = {
    name: 'John Doe',
    studentId: 'STU2024001',
    semester: 'Fall 2024',
    overallGPA: 3.75,
    attendance: '92%',
    subjects: [
      {
        id: 1,
        name: 'Mathematics',
        code: 'MATH101',
        marks: 85,
        grade: 'A',
        credit: 4,
        teacher: 'Dr. Smith',
        assignments: [
          { name: 'Assignment 1', marks: 18, total: 20 },
          { name: 'Assignment 2', marks: 17, total: 20 },
          { name: 'Final Project', marks: 50, total: 60 }
        ]
      },
      {
        id: 2,
        name: 'Physics',
        code: 'PHY102',
        marks: 78,
        grade: 'B+',
        credit: 3,
        teacher: 'Prof. Johnson',
        assignments: [
          { name: 'Lab Report 1', marks: 45, total: 50 },
          { name: 'Mid Term', marks: 32, total: 40 },
          { name: 'Final Exam', marks: 65, total: 80 }
        ]
      },
      {
        id: 3,
        name: 'Computer Science',
        code: 'CS103',
        marks: 92,
        grade: 'A',
        credit: 4,
        teacher: 'Dr. Wilson',
        assignments: [
          { name: 'Programming Assignment', marks: 48, total: 50 },
          { name: 'Database Project', marks: 95, total: 100 },
          { name: 'Final Exam', marks: 88, total: 100 }
        ]
      },
      {
        id: 4,
        name: 'English Literature',
        code: 'ENG104',
        marks: 81,
        grade: 'A-',
        credit: 3,
        teacher: 'Prof. Davis',
        assignments: [
          { name: 'Essay 1', marks: 38, total: 40 },
          { name: 'Presentation', marks: 28, total: 30 },
          { name: 'Final Paper', marks: 75, total: 90 }
        ]
      },
      {
        id: 5,
        name: 'Chemistry',
        code: 'CHEM105',
        marks: 74,
        grade: 'B',
        credit: 4,
        teacher: 'Dr. Brown',
        assignments: [
          { name: 'Lab Work', marks: 35, total: 40 },
          { name: 'Practical Exam', marks: 28, total: 35 },
          { name: 'Theory Exam', marks: 55, total: 75 }
        ]
      }
    ]
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'A-': return 'text-green-600 bg-green-100';
      case 'B+': return 'text-blue-600 bg-blue-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C+': return 'text-yellow-600 bg-yellow-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (marks: number) => {
    if (marks >= 80) return 'bg-green-500';
    if (marks >= 60) return 'bg-blue-500';
    if (marks >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <DashboardLayout role='students'>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Academic Performance</h1>
            <p className="text-gray-600 mt-2">View your marks, grades, and academic progress</p>
          </div>

          {/* Student Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Student ID</p>
                  <p className="text-2xl font-bold text-gray-900">{studentData.studentId}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">ID</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall GPA</p>
                  <p className="text-2xl font-bold text-gray-900">{studentData.overallGPA}/4.0</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">GPA</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Semester</p>
                  <p className="text-2xl font-bold text-gray-900">{studentData.semester}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">S</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">{studentData.attendance}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">A</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {studentData.subjects.map((subject) => (
              <div key={subject.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  {/* Subject Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
                      <p className="text-gray-600 text-sm">{subject.code} • {subject.teacher}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(subject.grade)}`}>
                        {subject.grade}
                      </span>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{subject.marks}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{subject.marks}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getProgressColor(subject.marks)} transition-all duration-500`}
                        style={{ width: `${subject.marks}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Assignments */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Assignments</h4>
                    <div className="space-y-2">
                      {subject.assignments.map((assignment, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-sm text-gray-600">{assignment.name}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {assignment.marks}/{assignment.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Credit Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Credit Hours</span>
                      <span className="text-sm font-bold text-gray-900">{subject.credit} Credits</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {studentData.subjects.filter(s => s.grade === 'A' || s.grade === 'A-').length}
                </div>
                <p className="text-gray-600">A Grades</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {studentData.subjects.filter(s => s.grade.startsWith('B')).length}
                </div>
                <p className="text-gray-600">B Grades</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {studentData.subjects.reduce((total, subject) => total + subject.credit, 0)}
                </div>
                <p className="text-gray-600">Total Credits</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200">
                Download Transcript
              </button>
              <button className="bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200">
                View Report Card
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200">
                Contact Advisor
              </button>
              <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200">
                Request Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default StudentMarks