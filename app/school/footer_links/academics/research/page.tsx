"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, BookOpen, Award, Users, BarChart3, FileText } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Research = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20 text-black bg-gradient-to-br from-indigo-50 to-white text-gray-900 px-6 md:px-20 py-16">
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center mb-6 text-indigo-700"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        🔬 SchoolERP System – Research Programs
      </motion.h1>

      <motion.p
        className="text-center text-lg md:text-xl text-gray-700 max-w-4xl mx-auto mb-12"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        The <strong>Research Programs Module</strong> enables students, faculty, and departments
        to collaborate, publish, and track research activities — creating a transparent,
        innovation-driven ecosystem within the institution.
      </motion.p>

      {/* Objectives */}
      <motion.section className="mb-12" variants={fadeUp} initial="hidden" animate="visible">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="text-indigo-600" /> 🎯 Objectives
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Foster a culture of research, innovation, and academic exploration.</li>
          <li>Digitally manage research proposals, projects, and publications.</li>
          <li>Track funding, progress, and outcomes of research programs.</li>
          <li>Enable collaboration between students, faculty, and external partners.</li>
          <li>Provide transparent reporting and recognition for research contributions.</li>
        </ul>
      </motion.section>

      {/* Key Features */}
      <motion.section
        className="mb-12 grid md:grid-cols-2 gap-8"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            title: "🧠 Research Project Management",
            icon: <BookOpen className="text-indigo-500" />,
            desc: "Create and manage departmental research projects with assigned mentors, progress tracking, and attached documentation.",
          },
          {
            title: "💡 Proposal Workflow",
            icon: <FileText className="text-indigo-500" />,
            desc: "Submit, review, and approve research proposals through an automated feedback and approval system.",
          },
          {
            title: "💰 Funding & Grant Tracking",
            icon: <BarChart3 className="text-indigo-500" />,
            desc: "Record funding sources, budget allocations, and generate expenditure reports with detailed grant tracking.",
          },
          {
            title: "👥 Collaboration & Mentorship",
            icon: <Users className="text-indigo-500" />,
            desc: "Enable seamless teamwork with file sharing, mentor feedback, and secure communication tools.",
          },
          {
            title: "📚 Publications & Research Output",
            icon: <BookOpen className="text-indigo-500" />,
            desc: "Maintain a digital archive of publications, conferences, and citations linked to institutional projects.",
          },
          {
            title: "🏆 Recognition & Awards",
            icon: <Award className="text-indigo-500" />,
            desc: "Highlight top researchers, achievements, and institutional recognition based on research outcomes.",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            className="p-6 bg-white shadow-md rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center gap-3 mb-3">
              {feature.icon}
              <h3 className="text-lg font-semibold text-indigo-700">{feature.title}</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Benefits */}
      <motion.section
        className="mb-12 bg-indigo-50 p-8 rounded-2xl"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4">✅ Benefits</h2>
        <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-gray-700">
          <li>Promotes innovation and institutional research culture.</li>
          <li>Transparent and efficient research approval workflow.</li>
          <li>Easy tracking of ongoing and completed projects.</li>
          <li>Centralized record of all research outcomes and publications.</li>
          <li>Enhances reputation through systematic documentation.</li>
        </ul>
      </motion.section>

      {/* Example Use Case */}
      <motion.section
        className="mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4">🖥️ Example Use Case</h2>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <p className="text-gray-700 leading-relaxed">
            - <strong>Student</strong> submits a proposal titled “AI in Environmental Monitoring.”<br />
            - <strong>Faculty Mentor</strong> reviews and provides feedback via the dashboard.<br />
            - <strong>Admin</strong> approves and allocates research funds.<br />
            - <strong>Team</strong> collaborates digitally, uploads progress reports, and publishes results.<br />
            - <strong>Institution</strong> showcases the project in annual research reports.
          </p>
        </div>
      </motion.section>

      {/* Conclusion */}
      <motion.section
        className="text-center"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4">🚀 Conclusion</h2>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
          The <strong>Research Programs Module</strong> transforms how institutions manage innovation —
          from proposal to publication — fostering a <strong>digital-first, collaborative, and research-driven academic environment</strong>.
        </p>
      </motion.section>
    </div>
    <Footer />
    </>
  );
};

export default Research;
