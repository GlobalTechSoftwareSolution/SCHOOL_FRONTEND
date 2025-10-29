"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Faculty = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  const sections = [
    {
      title: "📘 1. Overview",
      content: `The Faculty Hub Module in the SchoolERP (School Enterprise Resource Planning) system is a centralized digital workspace designed exclusively for teachers and academic staff. It enables faculty members to efficiently manage classes, attendance, assignments, examinations, communication, and academic progress through a unified interface. The Faculty Hub empowers educators with tools to enhance teaching quality, maintain academic transparency, and streamline day-to-day operations.`,
    },
    {
      title: "🎯 2. Objectives",
      content: `Provide a digital workspace for teachers to manage academic tasks efficiently. Automate attendance, grading, and evaluation processes. Improve communication between faculty, students, and administrators. Enable real-time tracking of student performance and engagement. Simplify report generation and administrative documentation.`,
    },
    {
      title: "🧩 3. Key Features",
      content: `
📚 Faculty Dashboard – Personalized dashboard showing daily schedule, announcements, and pending tasks.  
🗂️ Class & Subject Management – Manage assigned classes, upload materials, create lesson plans.  
📋 Attendance Management – Mark attendance daily or period-wise and send absence alerts.  
🧮 Assessment & Exam Management – Create, schedule, and grade online/offline exams.  
📝 Assignment & Homework Tracking – Assign and grade homework digitally.  
🧠 Lesson Planning – Prepare structured weekly or monthly lesson plans.  
🗓️ Timetable & Schedule – View and manage personalized schedules and substitutions.  
💬 Communication & Collaboration – Send announcements, messages, and participate in discussions.  
🧾 Student Performance Tracking – Analyze student progress and recommend improvements.  
🧑‍💼 Faculty Profile Management – Manage personal details, workload, and HR integrations.`,
    },
    {
      title: "🖥️ 4. User Roles & Access",
      content: `
**Teacher:** Manage attendance, grading, assignments, and communication.  
**HOD / Coordinator:** Approve schedules, monitor performance, and manage reports.  
**Admin:** Assign subjects, manage teacher records, and access analytics.  
**Principal:** Evaluate faculty efficiency and oversee department-level performance.`,
    },
    {
      title: "⚙️ 5. System Integration",
      content: `
Seamless integration with:  
- Academic Management Module (for curriculum & exams)  
- Student Portal (for assignments & grades)  
- Attendance Management (for class tracking)  
- HR & Payroll Module (for workload & salary)  
- Communication System (for messaging & notifications)  
- Learning Management System (LMS) (for e-learning & assessments)`,
    },
    {
      title: "📊 6. Reports & Analytics",
      content: `
- Attendance Report (Class-wise / Subject-wise)  
- Student Performance Report  
- Assignment Submission Statistics  
- Faculty Workload Report  
- Departmental Performance Dashboard  
- Academic Progress vs. Syllabus Coverage`,
    },
    {
      title: "🔐 7. Benefits",
      content: `
- Unified digital workspace for all faculty operations  
- Reduces manual work and paperwork  
- Real-time visibility of student performance  
- Enhanced communication between stakeholders  
- Encourages organized lesson planning  
- Promotes accountability and transparency`,
    },
    {
      title: "🧠 8. Future Enhancements",
      content: `
- AI-based teaching assistance and automated grading  
- Smart analytics for teacher performance evaluation  
- Integration with online learning tools (Zoom, Google Meet)  
- Voice command support for attendance & grading  
- AI-suggested lesson improvements based on student feedback`,
    },
    {
      title: "📚 9. Conclusion",
      content: `
The Faculty Hub Module acts as the backbone of the SchoolERP System, bridging the gap between administration and academic delivery. By digitizing faculty operations, it helps educators focus more on teaching and mentoring rather than administrative tasks. It’s a powerful, collaborative platform that fosters a truly smart learning ecosystem for students.`,
    },
  ];

  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20 bg-gradient-to-br from-indigo-50 to-white py-12 px-6 md:px-16">
      {/* Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-indigo-700 mb-4">
          👨‍🏫 SchoolERP System – Faculty Hub Module
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          A centralized digital workspace empowering teachers to manage academic and administrative tasks efficiently.
        </p>
      </motion.div>

      {/* Sections */}
      <div className="max-w-5xl mx-auto space-y-10">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300"
          >
            <h2 className="text-2xl font-semibold text-indigo-600 mb-3">
              {section.title}
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Faculty;
