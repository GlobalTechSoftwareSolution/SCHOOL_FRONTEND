import DashboardLayout from '@/app/components/DashboardLayout'
import React from 'react'

const page = () => {
  return (
    <DashboardLayout role='students'>
      <div className="space-y-8 p-2">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's your academic overview</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm"></div>
            <p className="text-blue-100 text-sm font-medium">Attendance</p>
            <p className="mt-2 text-4xl font-bold">92%</p>
            <div className="flex items-center mt-3">
              <div className="w-full bg-white/30 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <p className="mt-2 text-blue-100 text-xs flex items-center gap-1">
              <span className="text-green-300">↑</span> Excellent attendance streak!
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm"></div>
            <p className="text-amber-100 text-sm font-medium">Assignments Due</p>
            <p className="mt-2 text-4xl font-bold">3</p>
            <div className="mt-3 space-y-1">
              <p className="text-amber-100 text-xs">Math (Today 5 PM)</p>
              <p className="text-amber-100 text-xs">English (Tomorrow)</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm"></div>
            <p className="text-emerald-100 text-sm font-medium">Average Marks</p>
            <p className="mt-2 text-4xl font-bold">84%</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="px-2 py-1 bg-white/20 rounded-lg text-xs backdrop-blur-sm">Last: 88%</span>
              <span className="text-emerald-100 text-xs">+4% improvement</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm"></div>
            <p className="text-purple-100 text-sm font-medium">Notices</p>
            <p className="mt-2 text-4xl font-bold">2</p>
            <p className="mt-2 text-purple-100 text-xs">1 new notice today</p>
            <div className="mt-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-xs">📢</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Classes Card */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">🕒</span>
                  </div>
                  Upcoming Classes
                </h2>
                <a href="/students/students_calender" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors duration-200 flex items-center gap-2">
                  View Calendar
                  <span>→</span>
                </a>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-200 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl border border-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <span className="text-blue-600 font-bold text-lg">M</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Mathematics</p>
                      <p className="text-sm text-gray-600">10:00 AM • Room 204 • Prof. Smith</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">Today</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 transition-all duration-200 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl border border-green-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <span className="text-green-600 font-bold text-lg">S</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Science Lab</p>
                      <p className="text-sm text-gray-600">12:00 PM • Lab 2 • Dr. Johnson</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">Tomorrow</span>
                </div>
              </div>
            </div>

            {/* Assignments Card */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📝</span>
                  </div>
                  Pending Assignments
                </h2>
                <a href="/students/students_assignment" className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-medium hover:bg-amber-100 transition-colors duration-200 flex items-center gap-2">
                  View All
                  <span>→</span>
                </a>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border border-amber-200 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:border-amber-300 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        Math Worksheet 5
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">Due Today</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Algebra & Calculus • 5:00 PM</p>
                    </div>
                    <a href="/students/students_assignment" className="px-4 py-2 bg-white text-amber-700 rounded-lg font-medium border border-amber-200 hover:bg-amber-50 transition-all duration-200 group-hover:scale-105">
                      Open
                    </a>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-xs text-gray-600">75% done</span>
                  </div>
                </div>

                <div className="p-4 border border-blue-200 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:border-blue-300 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        English Essay Draft
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">2 days left</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Creative Writing • 1500 words</p>
                    </div>
                    <a href="/students/students_assignment" className="px-4 py-2 bg-white text-blue-700 rounded-lg font-medium border border-blue-200 hover:bg-blue-50 transition-all duration-200 group-hover:scale-105">
                      Open
                    </a>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <span className="text-xs text-gray-600">40% done</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Notices Card */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📢</span>
                  </div>
                  Latest Notices
                </h2>
                <a href="/students/students_notice" className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition-colors duration-200">
                  See All
                </a>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100 group hover:border-purple-200 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <span className="text-purple-600 text-sm">🏆</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Sports day registration closes Friday</p>
                      <p className="text-sm text-gray-600 mt-1">Register for track events and team sports</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">New</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 group hover:border-gray-200 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <span className="text-blue-600 text-sm">📚</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Library books due this week</p>
                      <p className="text-sm text-gray-600 mt-1">Return or renew your borrowed books</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">Yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">⚡</span>
                </div>
                Quick Links
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <a href="/students/students_attendance" className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 text-center group hover:scale-105 hover:border-blue-300 transition-all duration-200">
                  <div className="w-12 h-12 bg-white rounded-xl border border-blue-200 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-blue-600 text-xl">📊</span>
                  </div>
                  <span className="font-medium text-gray-900 text-sm">Attendance</span>
                </a>

                <a href="/students/students_marks" className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 text-center group hover:scale-105 hover:border-green-300 transition-all duration-200">
                  <div className="w-12 h-12 bg-white rounded-xl border border-green-200 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-green-600 text-xl">🎯</span>
                  </div>
                  <span className="font-medium text-gray-900 text-sm">Marks</span>
                </a>

                <a href="/students/students_leaves" className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 text-center group hover:scale-105 hover:border-amber-300 transition-all duration-200">
                  <div className="w-12 h-12 bg-white rounded-xl border border-amber-200 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-amber-600 text-xl">📅</span>
                  </div>
                  <span className="font-medium text-gray-900 text-sm">Leaves</span>
                </a>

                <a href="/students/students_docs" className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 text-center group hover:scale-105 hover:border-purple-300 transition-all duration-200">
                  <div className="w-12 h-12 bg-white rounded-xl border border-purple-200 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-purple-600 text-xl">📁</span>
                  </div>
                  <span className="font-medium text-gray-900 text-sm">Documents</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default page