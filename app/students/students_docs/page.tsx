import DashboardLayout from '@/app/components/DashboardLayout'
import React from 'react'

const StudentDocsPage = () => {
  // Sample documents data
  const documents = [
    { 
      id: 1, 
      name: 'Course Syllabus - Mathematics', 
      type: 'PDF', 
      date: '2024-01-15',
      size: '2.4 MB',
      category: 'Syllabus',
      downloadUrl: '#'
    },
    { 
      id: 2, 
      name: 'Assignment Guidelines', 
      type: 'DOC', 
      date: '2024-01-10',
      size: '1.1 MB',
      category: 'Assignments',
      downloadUrl: '#'
    },
    { 
      id: 3, 
      name: 'Advanced Calculus Study Materials', 
      type: 'PDF', 
      date: '2024-01-05',
      size: '3.2 MB',
      category: 'Study Materials',
      downloadUrl: '#'
    },
    { 
      id: 4, 
      name: 'Final Exam Preparation', 
      type: 'PDF', 
      date: '2024-01-03',
      size: '4.7 MB',
      category: 'Exams',
      downloadUrl: '#'
    },
    { 
      id: 5, 
      name: 'Course Resources List', 
      type: 'XLS', 
      date: '2024-01-01',
      size: '0.8 MB',
      category: 'Resources',
      downloadUrl: '#'
    },
    { 
      id: 6, 
      name: 'Lab Manual - Physics', 
      type: 'PDF', 
      date: '2023-12-28',
      size: '5.1 MB',
      category: 'Lab Manuals',
      downloadUrl: '#'
    }
  ]

  const categories = ['All', 'Syllabus', 'Assignments', 'Study Materials', 'Exams', 'Resources', 'Lab Manuals']

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return '📕'
      case 'DOC': return '📘'
      case 'XLS': return '📗'
      default: return '📄'
    }
  }

  return (
    <DashboardLayout role='students'>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Documents</h1>
          <p className="text-gray-600">Access all your course materials and resources in one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
            <div className="text-gray-600 text-sm">Total Documents</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-gray-900">{documents.filter(d => d.type === 'PDF').length}</div>
            <div className="text-gray-600 text-sm">PDF Files</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-gray-900">{documents.filter(d => d.category === 'Study Materials').length}</div>
            <div className="text-gray-600 text-sm">Study Materials</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-gray-900">2.1 GB</div>
            <div className="text-gray-600 text-sm">Total Storage</div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300"
            >
              <div className="p-6">
                {/* File Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(doc.type)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{doc.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {doc.type}
                        </span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {doc.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Size:</span>
                    <span className="font-medium">{doc.size}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Uploaded:</span>
                    <span className="font-medium">{new Date(doc.date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                    Download
                  </button>
                  <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {documents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-6">Get started by uploading your first document</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Upload Document
            </button>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {documents.slice(0, 3).map(doc => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getFileIcon(doc.type)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">Downloaded {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{doc.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default StudentDocsPage;