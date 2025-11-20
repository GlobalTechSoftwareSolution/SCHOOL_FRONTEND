"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/school/components/Navbar";
import Footer from "@/app/school/components/Footer";

const Help = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const sections = [
    {
      title: "📘 Overview",
      content: `The Help Center Module in the SchoolERP System is a centralized support hub designed to resolve user issues, provide learning resources, and enable effective communication between students, teachers, parents, and administrators.`,
    },
    {
      title: "🎯 Objectives",
      content: `• Deliver quick and accurate resolutions.\n• Minimize manual support load.\n• Improve transparency and user satisfaction.\n• Maintain systematic records of all user issues.`,
    },
    {
      title: "🧩 Key Features",
      content: `✅ Knowledge Base – Step-by-step guides and tutorials.\n✅ Ticket Management – Raise, assign, and resolve support tickets.\n✅ Live Chat – Get instant help from support staff or chatbot.\n✅ Feedback & Contact Forms – Share input with the ERP team.\n✅ Multi-Channel Support – Chat, email, and in-app widgets.`,
    },
    {
      title: "🎫 Ticket Lifecycle",
      content: `1️⃣ User submits an issue.\n2️⃣ System generates a unique Ticket ID.\n3️⃣ Admin assigns it to the right department.\n4️⃣ Ticket progresses: Open → In Progress → Resolved → Closed.\n5️⃣ Users receive updates at every step.`,
    },
    {
      title: "🧑‍💼 User Roles & Access",
      content: `👩‍🎓 Students & Parents – View FAQs, raise tickets, track issues.\n👨‍🏫 Faculty – Report academic system issues.\n🧍‍♂️ Admin – Manage and assign tickets.\n👑 Super Admin – Monitor analytics and system health.`,
    },
    {
      title: "⚙️ Module Integration",
      content: `Integrated with:\n• Student Portal\n• Faculty Hub\n• Academic Management\n• Finance & Fees\n• Admin Dashboard`,
    },
    {
      title: "📈 Reports & Insights",
      content: `• Total open/resolved tickets\n• Average response/resolution time\n• Common issue categories\n• Department-wise ratings and performance metrics`,
    },
    {
      title: "🔐 Security & Privacy",
      content: `All user data, chat logs, and attachments are encrypted and securely stored. Only authorized users can access tickets. Fully GDPR-compliant.`,
    },
    {
      title: "🌐 Accessibility & UI",
      content: `• 100% responsive layout\n• Blue-accented cards with soft shadows\n• Intuitive navigation\n• Searchable FAQs and guides`,
    },
    {
      title: "🚀 Benefits",
      content: `• Improves issue resolution speed by up to 50%.\n• Reduces support workload.\n• Enhances user satisfaction.\n• Promotes self-service learning culture.`,
    },
    {
      title: "🧠 Conclusion",
      content: `The Help Center ensures a connected, transparent, and efficient support system — empowering all users in the SchoolERP ecosystem.`,
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white py-12 px-6 md:px-16 mt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-3">
            🆘 SchoolERP – Help Center Module
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Get instant support, tutorials, and transparent communication — all in one place.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="grid gap-10 max-w-5xl mx-auto">
          {sections.map((sec, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 p-6 md:p-8"
            >
              <motion.h2
                className="text-2xl font-semibold text-blue-600 mb-3"
                whileHover={{ scale: 1.03 }}
              >
                {sec.title}
              </motion.h2>
              <motion.p
                className="text-gray-700 leading-relaxed whitespace-pre-line"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {sec.content}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Help;
