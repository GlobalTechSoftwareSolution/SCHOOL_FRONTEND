"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Map,
  ClipboardCheck,
  BookOpen,
  BarChart,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Lesson_planning = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20 bg-gradient-to-br from-purple-50 via-white to-purple-100 px-6 md:px-20 py-16 text-gray-900">
      {/* Header */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center text-purple-700 mb-4"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        📘 SchoolERP System – Lesson Planning Module
      </motion.h1>

      <motion.p
        className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        The <strong>Lesson Planning Module</strong> revolutionizes how teachers
        design, organize, and deliver academic sessions. It saves up to{" "}
        <span className="font-semibold text-purple-700">70% of planning time</span> by automating repetitive tasks and ensuring structured, curriculum-aligned learning plans.
      </motion.p>

      {/* Feature Highlights */}
      <motion.section
        className="grid md:grid-cols-2 gap-8 mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            icon: <Map className="text-purple-600" size={28} />,
            title: "Curriculum Mapping",
            desc: "Easily align lessons with curriculum outcomes, ensuring complete syllabus coverage and standardized teaching across subjects.",
          },
          {
            icon: <Calendar className="text-purple-600" size={28} />,
            title: "Session Planning",
            desc: "Plan each class session in advance — including objectives, teaching methods, and assessments — to maintain a consistent academic rhythm.",
          },
          {
            icon: <ClipboardCheck className="text-purple-600" size={28} />,
            title: "Resource Allocation",
            desc: "Assign textbooks, worksheets, multimedia resources, and lab materials for each topic — ensuring teachers have everything prepared before class.",
          },
          {
            icon: <BarChart className="text-purple-600" size={28} />,
            title: "Progress Tracking",
            desc: "Monitor lesson completion rates and syllabus progress with visual dashboards. Generate performance reports by subject, teacher, or term.",
          },
          {
            icon: <BookOpen className="text-purple-600" size={28} />,
            title: "Collaborative Lesson Sharing",
            desc: "Allow teachers to share, review, and reuse lesson templates institution-wide — promoting consistency and reducing duplication of effort.",
          },
          {
            icon: <Layers className="text-purple-600" size={28} />,
            title: "Dynamic Lesson Templates",
            desc: "Use customizable templates to standardize lesson structure while giving teachers the flexibility to tailor lessons to class needs.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center gap-3 mb-3">
              {item.icon}
              <h3 className="text-lg font-semibold text-purple-700">
                {item.title}
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Key Statistics */}
      <motion.div
        className="bg-purple-50 py-10 rounded-2xl mb-16 text-center"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl font-semibold text-purple-800 mb-2"
          variants={fadeUp}
        >
          ⏱️ 70% Time Saved
        </motion.h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Teachers save valuable time by digitizing their planning process. Automated
          scheduling, templates, and progress tracking remove repetitive paperwork and
          ensure consistent delivery across sessions.
        </p>
      </motion.div>

      {/* Integration Section */}
      <motion.section
        className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-purple-800">
          ⚙️ Integration with SchoolERP Ecosystem
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Linked with the Academic Management Module for syllabus synchronization.</li>
          <li>Integrates with Timetable and Attendance modules for seamless tracking.</li>
          <li>Teachers can attach resources from the Library Module directly to lesson plans.</li>
          <li>Admins can review planning reports and ensure timely lesson delivery.</li>
        </ul>
      </motion.section>

      {/* Benefits */}
      <motion.section
        className="mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-purple-800">
          ✅ Benefits
        </h2>
        <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-gray-700">
          <li>Standardizes lesson planning across all departments.</li>
          <li>Reduces manual effort through templates and automation.</li>
          <li>Improves coordination between teachers and administrators.</li>
          <li>Boosts teaching quality through structured lesson execution.</li>
          <li>Ensures complete syllabus coverage and transparency.</li>
        </ul>
      </motion.section>

      {/* Example Use Case */}
      <motion.section
        className="bg-purple-50 p-6 rounded-2xl shadow-md border border-gray-100 mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-3 text-purple-800">
          🖥️ Example Use Case
        </h2>
        <p className="text-gray-700 leading-relaxed">
          - <strong>Teacher</strong> logs into the portal and selects their subject.  <br />
          - The <strong>system</strong> automatically loads the curriculum map for the current term.  <br />
          - Teacher creates weekly lesson plans using predefined templates.  <br />
          - <strong>Admin</strong> reviews and approves the plan for accuracy.  <br />
          - Lesson progress and completion data are synced automatically to dashboards.
        </p>
      </motion.section>

      {/* Conclusion */}
      <motion.section
        className="text-center"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">
          🚀 Conclusion
        </h2>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
          The <strong>Lesson Planning Module</strong> transforms lesson organization
          into a streamlined digital workflow. By integrating automation,
          collaboration, and analytics, it empowers educators to deliver
          high-quality lessons — efficiently and effectively.
        </p>
      </motion.section>
    </div>
    <Footer />
    </>
  );
};

export default Lesson_planning;
