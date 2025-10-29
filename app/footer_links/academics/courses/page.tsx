"use client";
import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Layers, GraduationCap, Users, Search } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Cources = () => {
  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20 text-black bg-gradient-to-br from-blue-50 to-white py-10 px-5 md:px-20">
      {/* Header Section */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold text-blue-800 mb-2">
          📚 SchoolERP System – Course Catalog
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          A digital hub for managing, organizing, and exploring all academic courses offered by the institution.
        </p>
      </motion.div>

      {/* Overview Section */}
      <motion.section
        className="bg-white shadow-lg rounded-2xl p-6 mb-10 border-l-4 border-blue-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-3">🧾 Overview</h2>
        <p className="text-gray-700 leading-relaxed">
          The <strong>Course Catalog</strong> module in the <strong>SchoolERP System</strong> provides a
          comprehensive digital listing of all courses offered by the institution. It allows administrators to{" "}
          <strong>create, organize, and manage academic courses</strong> by class, subject, and department — giving
          students and teachers easy access to accurate and updated academic information.
        </p>
      </motion.section>

      {/* Objectives */}
      <motion.section
        className="bg-blue-100 shadow-md rounded-2xl p-6 mb-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-blue-800 mb-3">🎯 Objectives</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Maintain a centralized repository of all courses across grades and streams.</li>
          <li>Simplify course planning and enrollment processes.</li>
          <li>Provide transparency in academic offerings.</li>
          <li>Help faculty assign subjects efficiently.</li>
          <li>Enable students to preview course content, credits, and prerequisites.</li>
        </ul>
      </motion.section>

      {/* Key Features Section */}
      <motion.section
        className="grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        {[
          {
            icon: <BookOpen className="text-blue-600 w-8 h-8" />,
            title: "Course Creation & Management",
            desc: "Admins can add, edit, and organize course details like code, title, department, credits, and learning outcomes.",
          },
          {
            icon: <Layers className="text-green-600 w-8 h-8" />,
            title: "Course Structure & Syllabus",
            desc: "Upload syllabi, attach lesson plans, reference materials, and dynamically update content for each academic year.",
          },
          {
            icon: <GraduationCap className="text-yellow-600 w-8 h-8" />,
            title: "Instructor & Department Linking",
            desc: "Map courses to instructors and departments, track teaching progress, and view performance insights.",
          },
          {
            icon: <Users className="text-purple-600 w-8 h-8" />,
            title: "Student Enrollment Integration",
            desc: "Auto-enroll students in mandatory courses and allow elective selections via the student portal.",
          },
          {
            icon: <Search className="text-pink-600 w-8 h-8" />,
            title: "Search & Filter Tools",
            desc: "Use advanced filters for subjects, grades, departments, or instructors with real-time results.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl transition-shadow duration-300"
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center gap-4 mb-3">
              {feature.icon}
              <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
            </div>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Benefits */}
      <motion.section
        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 rounded-2xl shadow-md mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold mb-4">⚙️ Benefits</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Centralized course information for all academic years.</li>
          <li>Streamlined updates for syllabus and teaching plans.</li>
          <li>Integrated with timetable, attendance, and grading modules.</li>
          <li>Promotes transparency between students, teachers, and admin.</li>
          <li>Supports academic audits and compliance reports.</li>
        </ul>
      </motion.section>

      {/* Integration Table */}
      <motion.section
        className="mt-10 bg-white p-6 rounded-2xl shadow-md border border-gray-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-blue-800 mb-4">🧩 Integration With Other Modules</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-100 text-blue-800">
              <th className="border border-gray-300 p-2 text-left">Integrated Module</th>
              <th className="border border-gray-300 p-2 text-left">Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Timetable Module</td>
              <td className="border border-gray-300 p-2">Automatically reflects course schedules.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Faculty Hub</td>
              <td className="border border-gray-300 p-2">Assigns instructors and monitors teaching status.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Student Portal</td>
              <td className="border border-gray-300 p-2">Displays available and enrolled courses.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Academic Management</td>
              <td className="border border-gray-300 p-2">Connects syllabus and performance tracking.</td>
            </tr>
          </tbody>
        </table>
      </motion.section>

      {/* Conclusion */}
      <motion.section
        className="text-center mt-16 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-8 rounded-2xl shadow-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-3xl font-bold mb-3">🚀 Conclusion</h2>
        <p className="max-w-3xl mx-auto text-lg">
          The <strong>Course Catalog Module</strong> ensures a transparent, organized, and efficient academic
          structure by managing all subjects, instructors, and learning materials in a unified dashboard — making
          it the core of the SchoolERP academic ecosystem.
        </p>
      </motion.section>
    </div>
    <Footer />
    </>
  );
};

export default Cources;
