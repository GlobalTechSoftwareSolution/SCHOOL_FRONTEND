"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Academics = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  const sections = [
    {
      title: "📘 1. Overview",
      content: `The Academic Management Module in a SchoolERP system is designed to digitally manage, monitor, and streamline all academic activities of an educational institution. It provides a centralized platform to handle curriculum planning, class scheduling, attendance, assignments, exams, grading, and overall student performance tracking.`,
    },
    {
      title: "🎯 2. Objectives",
      list: [
        "Automate and simplify the academic process for administrators and teachers.",
        "Enhance transparency between teachers, students, and parents.",
        "Maintain centralized academic records for quick access and analysis.",
        "Reduce paperwork and human errors in academic operations.",
        "Enable real-time performance tracking and insights for better decisions.",
      ],
    },
    {
      title: "🧩 3. Key Features",
      subsections: [
        {
          subtitle: "🗂️ Curriculum Management",
          points: [
            "Create and manage syllabus for each grade and subject.",
            "Define learning objectives and outcomes for each topic.",
            "Upload study materials like PDFs, videos, and PowerPoints.",
            "Link subjects to teachers and academic departments.",
            "Provide structured lesson planning tools for educators.",
          ],
        },
        {
          subtitle: "🧑‍🏫 Class & Section Management",
          points: [
            "Create and manage classes, sections, and subjects.",
            "Assign class teachers and subject teachers.",
            "Manage student enrollment across sections.",
            "Auto-generate class lists and subject mapping.",
            "Handle student transfers between sections.",
          ],
        },
        {
          subtitle: "⏰ Timetable Scheduling",
          points: [
            "Automated timetable generation based on teacher availability and workload.",
            "Manual adjustment via drag-and-drop interface.",
            "Avoid timetable conflicts automatically.",
            "Provide real-time timetable access to teachers and students.",
            "Notify users about updates or substitutions.",
          ],
        },
        {
          subtitle: "📋 Attendance Management",
          points: [
            "Mark attendance daily or period-wise.",
            "Integrate with biometric or RFID devices.",
            "Track student punctuality and absence trends.",
            "Generate monthly/weekly reports.",
            "Send SMS/email alerts for absences.",
          ],
        },
        {
          subtitle: "🧾 Examination & Assessment Management",
          points: [
            "Create, schedule, and manage exams efficiently.",
            "Define grading systems (Percentage, GPA, or Grade).",
            "Upload and manage question papers digitally.",
            "Support online and offline assessments.",
            "Auto-calculate marks, grades, and rankings.",
            "Generate performance analytics with charts.",
          ],
        },
        {
          subtitle: "🏅 Student Performance Tracking",
          points: [
            "Track progress term-wise and subject-wise.",
            "Show visual analytics of student growth.",
            "Identify strengths and weak areas.",
            "Generate academic history and progress cards.",
            "Provide teachers with improvement insights.",
          ],
        },
      ],
    },
    {
      title: "🖥️ 4. User Roles & Access",
      content: `Different users have varying levels of access within the system.`,
      table: [
        ["Admin", "Configure academic sessions, classes, subjects, and assign teachers."],
        ["Teacher", "Manage class attendance, create assignments, and enter grades."],
        ["Student", "View timetable, submit assignments, check grades and attendance."],
        ["Parent", "Monitor attendance, performance, and receive academic alerts."],
        ["Principal / HOD", "Oversee academic operations and generate performance reports."],
      ],
    },
    {
      title: "⚙️ 5. System Integration",
      list: [
        "Student Information System (SIS)",
        "Fee Management",
        "Library Management",
        "Human Resource (HR)",
        "Communication System (Email/SMS/App)",
        "Online Learning Platforms (Google Classroom, Zoom, Moodle)",
      ],
    },
    {
      title: "📊 6. Reports & Analytics",
      list: [
        "Attendance Reports (Class/Subject-wise)",
        "Examination Reports (Term/Subject-wise)",
        "Student Rank and Grade Reports",
        "Teacher Performance Reports",
        "Pass % and Failure Trends",
        "Academic Year Summary Dashboard",
      ],
    },
    {
      title: "🔐 7. Benefits",
      list: [
        "Centralized academic control.",
        "Paperless management with digital records.",
        "Increased transparency in grading.",
        "Time-saving automation.",
        "Improved academic quality through data insights.",
      ],
    },
    {
      title: "🧠 8. Future Enhancements",
      list: [
        "AI-based performance prediction.",
        "Personalized learning recommendations.",
        "Gamified progress tracking.",
        "Integration with online learning platforms.",
        "Voice-based academic assistant for accessibility.",
      ],
    },
    {
      title: "📚 9. Conclusion",
      content: `The Academic Management Module is the core of any SchoolERP system, enabling institutions to deliver a structured, transparent, and efficient educational experience. It bridges traditional management and digital transformation to create a smart, data-driven academic ecosystem.`,
    },
  ];

  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20 bg-gradient-to-b from-blue-50 via-white to-blue-100 py-12 px-6 md:px-16">
      {/* Header */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4">
          🏫 SchoolERP System – Academic Management Module
        </h1>
        <p className="text-gray-700 text-lg max-w-3xl mx-auto">
          Manage, monitor, and optimize all academic operations digitally — from
          curriculum and classes to performance analytics.
        </p>
      </motion.div>

      {/* Sections */}
      <div className="max-w-5xl mx-auto space-y-10">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-all"
          >
            <h2 className="text-2xl font-semibold text-blue-600 mb-3">
              {section.title}
            </h2>

            {section.content && (
              <p className="text-gray-700 leading-relaxed mb-3">{section.content}</p>
            )}

            {section.list && (
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                {section.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}

            {section.subsections && (
              <div className="space-y-6 mt-4">
                {section.subsections.map((sub, j) => (
                  <motion.div
                    key={j}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="bg-blue-50 rounded-xl p-4 border border-blue-100"
                  >
                    <h3 className="text-lg font-semibold text-blue-700 mb-2">
                      {sub.subtitle}
                    </h3>
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      {sub.points.map((p, k) => (
                        <li key={k}>{p}</li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            )}

            {section.table && (
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-200 rounded-lg text-gray-700">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="py-2 px-4 text-left">Role</th>
                      <th className="py-2 px-4 text-left">Responsibilities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-t border-gray-200 ${
                          idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                        }`}
                      >
                        <td className="py-2 px-4 font-medium">{row[0]}</td>
                        <td className="py-2 px-4">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Academics;
