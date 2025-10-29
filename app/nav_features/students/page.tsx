"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Students = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    "🏠 Student Dashboard",
    "📅 Timetable & Schedule Management",
    "🧑‍🏫 Attendance Tracking",
    "📝 Assignment & Homework Module",
    "🧾 Examination & Result Management",
    "💳 Fee Management",
    "🗓️ Academic Calendar & Events",
    "🧠 Learning Resources & E-Library",
    "💬 Communication & Messaging",
    "📊 Performance Analytics",
  ];

  return (
   <>
   <Navbar />
    <div className="min-h-screen mt-20 bg-gradient-to-b from-blue-50 via-white to-sky-50 py-12 px-6 md:px-16">
      {/* Header */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4">
          🎓 SchoolERP System – Student Portal Module
        </h1>
        <p className="text-gray-700 text-lg max-w-3xl mx-auto">
          A unified platform empowering students to manage their academic journey
          — from attendance and assignments to fees and performance analytics —
          all in one intuitive portal.
        </p>
      </motion.div>

      {/* Overview */}
      <motion.div
        className="max-w-5xl mx-auto bg-white shadow-lg border border-gray-100 rounded-2xl p-8 mb-12"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-semibold text-blue-600 mb-4">
          📘 1. Overview
        </h2>
        <p className="text-gray-700 leading-relaxed">
          The <strong>Student Portal Module</strong> is a centralized digital
          platform within the <strong>SchoolERP System</strong> that allows
          students to access, track, and manage their academic and institutional
          activities seamlessly. From attendance and assignments to results and
          fees, it ensures complete transparency, self-service management, and
          engagement throughout the learning journey.
        </p>
      </motion.div>

      {/* Objectives */}
      <motion.div
        className="max-w-5xl mx-auto bg-gradient-to-br from-blue-100 to-white rounded-2xl shadow-md p-8 mb-12 border border-blue-50"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-semibold text-blue-600 mb-3">
          🎯 2. Objectives
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Provide a single, secure access point for academic information.</li>
          <li>Encourage student self-management and accountability.</li>
          <li>Enhance communication between students and teachers.</li>
          <li>Promote transparency and digital learning engagement.</li>
          <li>Enable real-time academic tracking and progress monitoring.</li>
        </ul>
      </motion.div>

      {/* Key Features */}
      <motion.div
        className="max-w-5xl mx-auto"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-semibold text-blue-600 mb-6 text-center">
          🧩 3. Key Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all"
            >
              <p className="text-lg font-medium text-gray-800">{feature}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Reports & Analytics */}
      <motion.div
        className="max-w-5xl mx-auto mt-14 bg-white rounded-2xl p-8 shadow-md border border-gray-100"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-semibold text-blue-600 mb-3">
          📈 6. Reports & Analytics
        </h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          The system provides data-driven insights into student performance,
          attendance, and engagement through interactive dashboards and
          downloadable reports.
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Attendance Summary and Subject-wise Trends</li>
          <li>Term-wise Grade Progress and Class Comparison</li>
          <li>Fee Payment History and Pending Reports</li>
          <li>Assignment Submission Stats and Feedback Logs</li>
          <li>Comprehensive Academic Progress Visualization</li>
        </ul>
      </motion.div>

      {/* Benefits */}
      <motion.div
        className="max-w-5xl mx-auto mt-14 bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-gray-100 shadow-sm"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-semibold text-blue-600 mb-3">
          🔐 7. Benefits
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>24/7 access to academic and financial data.</li>
          <li>Reduces dependency on administrative staff.</li>
          <li>Encourages self-learning and accountability.</li>
          <li>Promotes engagement with teachers and peers.</li>
          <li>Supports hybrid and online learning environments.</li>
        </ul>
      </motion.div>

      {/* Future Enhancements */}
      <motion.div
        className="max-w-5xl mx-auto mt-14 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-semibold text-blue-600 mb-3">
          🧠 8. Future Enhancements
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>AI-driven performance insights and study recommendations.</li>
          <li>Mobile app for instant alerts.</li>
          <li>Gamification features like badges and progress streaks.</li>
        </ul>
      </motion.div>
    </div>
   <Footer />
   </>
  );
};

export default Students;
