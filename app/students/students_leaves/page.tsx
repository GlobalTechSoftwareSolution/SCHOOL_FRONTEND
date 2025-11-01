"use client";
import DashboardLayout from '@/app/components/DashboardLayout'
import React, { useState } from 'react'

const StudentLeaves = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Mock data for student leaves
  const leaveData = {
    studentInfo: {
      name: 'John Doe',
      studentId: 'STU2024001',
      department: 'Computer Science',
      remainingLeaves: 8,
      totalLeaves: 15,
      usedLeaves: 7
    },
    leaves: [
      {
        id: 1,
        type: 'Medical',
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        duration: 3,
        reason: 'Fever and cold, doctor advised rest',
        status: 'approved',
        appliedDate: '2024-01-14',
        approvedBy: 'Dr. Smith',
        approvedDate: '2024-01-14',
        documents: ['medical_certificate.pdf']
      },
      {
        id: 2,
        type: 'Personal',
        startDate: '2024-01-22',
        endDate: '2024-01-23',
        duration: 2,
        reason: 'Family function',
        status: 'approved',
        appliedDate: '2024-01-20',
        approvedBy: 'Dr. Smith',
        approvedDate: '2024-01-20',
        documents: []
      },
      {
        id: 3,
        type: 'Emergency',
        startDate: '2024-02-01',
        endDate: '2024-02-03',
        duration: 3,
        reason: 'Urgent family matter',
        status: 'pending',
        appliedDate: '2024-01-31',
        approvedBy: '',
        approvedDate: '',
        documents: []
      },
      {
        id: 4,
        type: 'Medical',
        startDate: '2024-02-10',
        endDate: '2024-02-12',
        duration: 3,
        reason: 'Dental surgery',
        status: 'rejected',
        appliedDate: '2024-02-09',
        approvedBy: 'Dr. Smith',
        approvedDate: '2024-02-09',
        documents: ['dental_report.pdf'],
        rejectionReason: 'Medical certificate not provided'
      },
      {
        id: 5,
        type: 'Academic',
        startDate: '2024-02-20',
        endDate: '2024-02-20',
        duration: 1,
        reason: 'Conference participation',
        status: 'approved',
        appliedDate: '2024-02-18',
        approvedBy: 'Dr. Smith',
        approvedDate: '2024-02-18',
        documents: ['conference_invitation.pdf']
      }
    ]
  };

  const filteredLeaves = activeTab === 'all' 
    ? leaveData.leaves 
    : leaveData.leaves.filter(leave => leave.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Medical': return 'text-red-600 bg-red-50 border-red-200';
      case 'Personal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Emergency': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Academic': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '📄';
    }
  };

  const calculateProgress = () => {
    return (leaveData.studentInfo.usedLeaves / leaveData.studentInfo.totalLeaves) * 100;
  };

  return (
    <DashboardLayout role='students'>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600 mt-2">Apply and track your leave applications</p>
          </div>

          {/* Leave Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leaves</p>
                  <p className="text-2xl font-bold text-gray-900">{leaveData.studentInfo.totalLeaves}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">📅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Remaining Leaves</p>
                  <p className="text-2xl font-bold text-gray-900">{leaveData.studentInfo.remainingLeaves}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Used Leaves</p>
                  <p className="text-2xl font-bold text-gray-900">{leaveData.studentInfo.usedLeaves}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leaveData.leaves.filter(leave => leave.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">⏳</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Progress */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Leave Usage Progress</h3>
              <span className="text-sm text-gray-600">
                {leaveData.studentInfo.usedLeaves} of {leaveData.studentInfo.totalLeaves} days used
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Leave Applications</h3>
                <p className="text-gray-600 text-sm">Manage your leave requests</p>
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center gap-2">
                <span>+</span>
                Apply for Leave
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
              {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} 
                  {tab === 'all' && ` (${leaveData.leaves.length})`}
                  {tab === 'pending' && ` (${leaveData.leaves.filter(l => l.status === 'pending').length})`}
                  {tab === 'approved' && ` (${leaveData.leaves.filter(l => l.status === 'approved').length})`}
                  {tab === 'rejected' && ` (${leaveData.leaves.filter(l => l.status === 'rejected').length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Leaves List */}
          <div className="space-y-6">
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave) => (
                <div key={leave.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Leave Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(leave.type)}`}>
                            {leave.type}
                          </span>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(leave.status)} flex items-center gap-2`}>
                            {getStatusIcon(leave.status)} {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {leave.reason}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Duration:</span>
                            <span>{leave.duration} day(s)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Dates:</span>
                            <span>
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Applied:</span>
                            <span>{new Date(leave.appliedDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Documents */}
                        {leave.documents.length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm font-medium text-gray-700">Documents: </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {leave.documents.map((doc, index) => (
                                <span key={index} className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-1">
                                  📎 {doc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rejection Reason */}
                        {leave.status === 'rejected' && leave.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <span className="text-sm font-medium text-red-700">Rejection Reason: </span>
                            <span className="text-sm text-red-600">{leave.rejectionReason}</span>
                          </div>
                        )}

                        {/* Approval Info */}
                        {leave.status === 'approved' && leave.approvedBy && (
                          <div className="mt-3 text-sm text-gray-600">
                            Approved by {leave.approvedBy} on {new Date(leave.approvedDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {leave.status === 'pending' && (
                          <>
                            <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                              Cancel
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                              Edit
                            </button>
                          </>
                        )}
                        {(leave.status === 'approved' || leave.status === 'rejected') && (
                          <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No leaves found</h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'all' 
                    ? "You haven't applied for any leaves yet." 
                    : `No ${activeTab} leave applications found.`
                  }
                </p>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200">
                  Apply for Leave
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default StudentLeaves