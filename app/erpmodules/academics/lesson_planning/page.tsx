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
          <span className="font-semibold text-purple-700">70% of planning time</span> 
          by automating repetitive tasks and ensuring structured, curriculum-aligned learning plans.
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
              desc: "Align lessons with curriculum outcomes and ensure complete syllabus coverage across subjects.",
              image: "/erpmodules/planning/curriculum-mapping.jpg",
            },
            {
              icon: <Calendar className="text-purple-600" size={28} />,
              title: "Session Planning",
              desc: "Plan class sessions including objectives, activities, and assessments in structured templates.",
              image: "/erpmodules/planning/planning.png",
            },
            {
              icon: <ClipboardCheck className="text-purple-600" size={28} />,
              title: "Resource Allocation",
              desc: "Assign textbooks, worksheets, PDFs, videos, and lab materials for each topic.",
              image: "/erpmodules/planning/resources.jpg",
            },
            {
              icon: <BarChart className="text-purple-600" size={28} />,
              title: "Progress Tracking",
              desc: "Monitor syllabus completion and generate teacher-wise, class-wise, and subject-wise reports.",
              image: "/erpmodules/planning/progress-tracking.png",
            },
            {
              icon: <BookOpen className="text-purple-600" size={28} />,
              title: "Collaborative Lesson Sharing",
              desc: "Share lesson templates across departments to maintain uniformity and reduce workload.",
              image: "/erpmodules/planning/collabrative.jpg",
            },
            {
              icon: <Layers className="text-purple-600" size={28} />,
              title: "Dynamic Lesson Templates",
              desc: "Use customizable templates to standardize structure while allowing teacher flexibility.",
              image: "/erpmodules/planning/lesson-planning.webp",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.03 }}
            >
              {/* IMAGE BOX (same style you wanted) */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 flex justify-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="max-h-48 w-auto object-contain"
                />
              </div>

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
            Teachers save valuable time by digitizing their planning process with automated 
            scheduling, templates, and progress dashboards.
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
            <li>Syncs with Academic Management for syllabus auto-loading.</li>
            <li>Works with Timetable & Attendance modules.</li>
            <li>Attach resources directly from Library Module.</li>
            <li>Admins monitor delivery and planning consistency.</li>
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
            <li>Standardizes lesson planning.</li>
            <li>Reduces repetitive work through automation.</li>
            <li>Improves coordination and transparency.</li>
            <li>Enhances teaching quality.</li>
            <li>Guarantees full syllabus completion.</li>
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
            - Teacher selects subject and loads mapped curriculum. <br />
            - Creates weekly plans using templates. <br />
            - Admin reviews and approves. <br />
            - Progress auto-syncs to dashboards.
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
            The <strong>Lesson Planning Module</strong> transforms planning into a structured, 
            automated, and collaborative workflow — empowering educators to teach effectively.
          </p>
        </motion.section>
      </div>

      <Footer />
    </>
  );
};

export default Lesson_planning;
