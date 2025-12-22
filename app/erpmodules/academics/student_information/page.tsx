"use client";

import { motion } from "framer-motion";
import { 
  UserGroupIcon,
  AcademicCapIcon,
  DocumentChartBarIcon,
  ChartBarIcon,
  BellAlertIcon,
  IdentificationIcon,
  DocumentCheckIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function StudentInformationSection() {

  const features = [
    {
      icon: <IdentificationIcon className="h-8 w-8" />,
      title: "Student Profile Management",
      description: "Comprehensive student profiles with customizable fields including personal details, academic history, medical information, and emergency contacts.",
      details: ["Custom field creation", "Photo management", "Family background", "Medical records"]
    },
    {
      icon: <DocumentCheckIcon className="h-8 w-8" />,
      title: "Document Management",
      description: "Centralized document repository with automated expiry alerts and digital storage for all student-related documents.",
      details: ["Birth certificates", "Transfer certificates", "Medical reports", "Achievement records"]
    },
    {
      icon: <BellAlertIcon className="h-8 w-8" />,
      title: "Smart Notifications",
      description: "Automated notification system for birthdays, document expiries, fee reminders, and important announcements.",
      details: ["SMS & Email alerts", "Mobile push notifications", "Customizable templates", "Bulk messaging"]
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Data mining and statistical analysis tools for informed decision-making and performance tracking.",
      details: ["Performance trends", "Attendance patterns", "Demographic analysis", "Custom reports"]
    },
    {
      icon: <AcademicCapIcon className="h-8 w-8" />,
      title: "Academic Tracking",
      description: "Complete academic journey tracking from admission to graduation with progress monitoring.",
      details: ["Grade history", "Subject performance", "Extracurricular activities", "Skill development"]
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: "Compliance & Security",
      description: "Ensures regulatory compliance with robust data security measures and audit trails.",
      details: ["GDPR compliance", "Data encryption", "Access logs", "Backup systems"]
    }
  ];

  const benefits = [
    {
      title: "Operational Efficiency",
      description: "Reduce administrative workload by 60% with automated processes and centralized data management."
    },
    {
      title: "Enhanced Communication",
      description: "Improve parent-school engagement with real-time updates and multi-channel communication."
    },
    {
      title: "Data-Driven Decisions",
      description: "Leverage comprehensive analytics for strategic planning and resource allocation."
    },
    {
      title: "Regulatory Compliance",
      description: "Stay compliant with educational regulations through automated reporting and documentation."
    }
  ];

  return (
    <>
      <Navbar />
      <section className="relative min-h-screen mt-10 md:mt-5 py-16 lg:py-24 overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-100">
        
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Main Container */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center md:items-center  justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <UserGroupIcon className="h-4 w-4" />
                Comprehensive Student Management
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Student Information
                </span>
                <br />
                <span className="text-gray-800">System</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                A comprehensive Student Information System (SIS) specifically designed for Indian educational institutions. 
                Streamline student data management, enhance operational efficiency, and ensure regulatory compliance with our 
                powerful, intuitive platform.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <UserGroupIcon className="h-8 w-8 text-blue-600 mb-2" />
                      <h3 className="font-semibold text-gray-800">Student Profiles</h3>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <DocumentChartBarIcon className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-semibold text-gray-800">Reports</h3>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <BellAlertIcon className="h-8 w-8 text-purple-600 mb-2" />
                      <h3 className="font-semibold text-gray-800">Alerts</h3>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl">
                      <ChartBarIcon className="h-8 w-8 text-orange-600 mb-2" />
                      <h3 className="font-semibold text-gray-800">Analytics</h3>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Key Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Transform Your Institution&apos;s Efficiency
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience unprecedented efficiency in student management with our comprehensive SIS solution
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                >
                  <h3 className="font-bold text-lg text-blue-700 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Powerful Features for Modern Education
              </h2>
              <p className="text-xl text-gray-600">
                Comprehensive tools designed to streamline every aspect of student information management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Detailed Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
              Comprehensive Feature Overview
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column */}
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="font-bold text-xl text-blue-700 mb-4 flex items-center gap-3">
                    <IdentificationIcon className="h-6 w-6" />
                    Student Profile Management
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Custom Field Creation:</strong> Add institution-specific fields to capture relevant student information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Photo Management:</strong> Upload and manage student photographs for ID cards and records</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Family Background:</strong> Comprehensive family information including parent/guardian details</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="font-bold text-xl text-blue-700 mb-4 flex items-center gap-3">
                    <DocumentCheckIcon className="h-6 w-6" />
                    Document Management System
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Digital Repository:</strong> Secure cloud storage for all student documents</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Expiry Alerts:</strong> Automated notifications for document renewals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Version Control:</strong> Track document changes and maintain revision history</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="font-bold text-xl text-blue-700 mb-4 flex items-center gap-3">
                    <ChartBarIcon className="h-6 w-6" />
                    Advanced Analytics & Reporting
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Custom Reports:</strong> Generate institution-specific reports with drag-and-drop builder</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Data Visualization:</strong> Interactive charts and dashboards for performance insights</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Export Capabilities:</strong> Export data in multiple formats (PDF, Excel, CSV)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="font-bold text-xl text-blue-700 mb-4 flex items-center gap-3">
                    <ShieldCheckIcon className="h-6 w-6" />
                    Security & Compliance
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Role-based Access:</strong> Granular permissions for different user types</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Audit Trails:</strong> Complete tracking of all system activities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Data Encryption:</strong> End-to-end encryption for sensitive information</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
}
