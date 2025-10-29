"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  BarChart3,
  Users,
  BookOpen,
  Settings,
  Shield,
  PieChart,
  ClipboardList,
  Calendar,
  Bell,
  Database,
} from "lucide-react";

const Admin = () => {
  const sections = [
    {
      title: "📘 Overview",
      content:
        "The Admin Dashboard Module is the central control panel of the SchoolERP system. It enables administrators to manage and monitor all institutional activities through a single interface, ensuring transparency, automation, and real-time decision-making.",
    },
    {
      title: "🎯 Objectives",
      content: [
        "Centralized hub for managing all ERP modules.",
        "Data-driven decisions through real-time analytics.",
        "Efficient handling of academic, admin, and financial operations.",
        "Streamlined communication between departments.",
        "Secure, accurate, and transparent school data management.",
      ],
    },
    {
      title: "🧩 Key Features",
      content:
        "Includes modules like Student Management, Faculty Management, Timetable Scheduling, Finance, Reports, and more, all accessible from one intuitive dashboard.",
    },
    {
      title: "🖥️ User Roles & Access",
      content:
        "Different user roles such as Super Admin, Academic Admin, Finance Admin, HR Admin, and Principal, each with distinct access permissions and dashboards.",
    },
    {
      title: "⚙️ System Integration",
      content:
        "Integrates seamlessly with modules like SIS, Faculty Hub, Academic Management, Finance, Communication, and LMS.",
    },
    {
      title: "📈 Reports & Visualization",
      content:
        "Visual insights via graphs, charts, and heatmaps for attendance, performance, finance, and admissions.",
    },
    {
      title: "🔐 Benefits",
      content:
        "Enhances efficiency, transparency, and collaboration while reducing paperwork and enabling real-time monitoring.",
    },
    {
      title: "🧠 Future Enhancements",
      content:
        "AI-powered analytics, IoT integrations, blockchain-backed verification, and voice-enabled admin commands.",
    },
  ];

  const icons = [
    <BarChart3 key="chart" className="text-blue-600" />,
    <Users key="users" className="text-purple-600" />,
    <BookOpen key="book" className="text-green-600" />,
    <Settings key="settings" className="text-orange-600" />,
    <Shield key="shield" className="text-red-600" />,
    <PieChart key="pie" className="text-pink-600" />,
    <ClipboardList key="clip" className="text-cyan-600" />,
    <Calendar key="cal" className="text-amber-600" />,
    <Bell key="bell" className="text-indigo-600" />,
    <Database key="db" className="text-teal-600" />,
  ];

  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20 bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-blue-700 mb-2">
          🧑‍💼 SchoolERP Admin Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Centralized control, analytics, and management for your institution
        </p>
      </motion.div>

      {/* Animated Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-2 transition duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              {icons[index % icons.length]}
              <h2 className="text-xl font-semibold text-gray-800">
                {section.title}
              </h2>
            </div>

            {Array.isArray(section.content) ? (
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                {section.content.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 leading-relaxed">
                {section.content}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Admin;
