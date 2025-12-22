"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  BarChart3,
  Database,
  Layers,
  Bell,
  Search,
  ClipboardList,
} from "lucide-react";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Library = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen mt-20 bg-gradient-to-br from-indigo-50 via-white to-purple-100 px-6 md:px-20 py-16 text-gray-900">

        {/* Header */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-center text-indigo-700 mb-4"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          📚 SchoolERP System – Library Management Module
        </motion.h1>

        <motion.p
          className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-12"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          The <strong>Library Management Module</strong> helps you organize and
          maintain your school’s vast knowledge base efficiently. From digital
          cataloging to book tracking and analytics — it ensures a smooth and
          paperless experience for librarians, students, and faculty.
        </motion.p>

        {/* Features Section */}
        <motion.section
          className="grid md:grid-cols-2 gap-8 mb-16"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              icon: <Database className="text-indigo-600" size={28} />,
              title: "Digital Catalog",
              desc: "Create and maintain an online catalog for all resources — books, journals, magazines, eBooks, and media — accessible 24/7.",
              image:
                "/erpmodules/library/digital-catalog.jpeg",
            },
            {
              icon: <ClipboardList className="text-indigo-600" size={28} />,
              title: "Book Tracking",
              desc: "Monitor the issue and return status of each book in real time. Avoid duplication and misplaced inventory with RFID or barcode systems.",
              image:
                "/erpmodules/library/book-tracking.jpg",
            },
            {
              icon: <Users className="text-indigo-600" size={28} />,
              title: "Member Management",
              desc: "Easily manage students, teachers, and staff as library members with borrowing limits, renewal privileges, and fine tracking.",
              image:
                "/erpmodules/library/member-management.webp",
            },
            {
              icon: <BarChart3 className="text-indigo-600" size={28} />,
              title: "Analytics & Reports",
              desc: "Generate insights on borrowing trends, most read books, overdue lists, and member activity for better decision-making.",
              image:
                "/erpmodules/library/analitical-report.jpg",
            },
            {
              icon: <Search className="text-indigo-600" size={28} />,
              title: "Smart Search",
              desc: "Find resources instantly with multi-criteria search by title, author, subject, or keyword — with real-time results.",
              image:
                "/erpmodules/library/smart-search.webp",
            },
            {
              icon: <Bell className="text-indigo-600" size={28} />,
              title: "Alerts & Notifications",
              desc: "Send automated alerts for due dates, overdue books, or new arrivals via email and in-app notifications.",
              image:
                "/erpmodules/library/alerts.png",
            },
            {
              icon: <BookOpen className="text-indigo-600" size={28} />,
              title: "e-Library Integration",
              desc: "Provide access to digital books, research papers, and PDFs directly from the portal. Integrate with Google Scholar or Open Library.",
              image:
                "/erpmodules/library/e-library.webp",
            },
            {
              icon: <Layers className="text-indigo-600" size={28} />,
              title: "Multi-Branch Support",
              desc: "Manage libraries across multiple school branches with centralized data and branch-wise reporting.",
              image:
                "/erpmodules/library/multy-branch.jpg",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.03 }}
            >
              {/* IMAGE BOX LIKE YOUR UI STYLE */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 flex justify-center">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={500}
                  height={300}
                  className="max-h-48 w-auto object-contain"
                />
              </div>

              <div className="flex items-center gap-3 mb-3">
                {item.icon}
                <h3 className="text-lg font-semibold text-indigo-700">
                  {item.title}
                </h3>
              </div>

              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Integration Section */}
        <motion.section
          className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 mb-16"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
            🔗 Integration with Other Modules
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              Integrated with the <strong>Student Portal</strong> for book
              borrowing and reservation.
            </li>
            <li>
              Connected to the <strong>Faculty Hub</strong> for teaching
              material access and reference uploads.
            </li>
            <li>
              Linked to the <strong>Academic Management</strong> module to attach
              reading resources with lesson plans.
            </li>
            <li>
              Synced with the <strong>Admin Dashboard</strong> for overall
              library performance and analytics.
            </li>
          </ul>
        </motion.section>

        {/* Benefits */}
        <motion.section
          className="mb-16"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
            ✅ Key Benefits
          </h2>
          <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-gray-700">
            <li>Digitizes the entire library system.</li>
            <li>Reduces paperwork and manual errors.</li>
            <li>Increases student engagement with reading material.</li>
            <li>Enhances librarian efficiency and visibility.</li>
            <li>Improves decision-making through real-time analytics.</li>
          </ul>
        </motion.section>

        {/* Example Use Case */}
        <motion.section
          className="bg-indigo-50 p-6 rounded-2xl shadow-md border border-gray-100 mb-12"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-semibold mb-3 text-indigo-800">
            🏫 Example Use Case
          </h2>
          <p className="text-gray-700 leading-relaxed">
            - <strong>Student</strong> searches for “Mathematics Grade 10” and reserves the book online. <br />
            - <strong>Librarian</strong> approves the issue and sets the due date. <br />
            - <strong>System</strong> sends automated reminders for returns. <br />
            - <strong>Admin</strong> checks monthly reports showing top borrowed subjects and overdue penalties collected.
          </p>
        </motion.section>

        {/* Conclusion */}
        <motion.section
          className="text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">
            🚀 Conclusion
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            The <strong>Library Management Module</strong> acts as the organized
            knowledge hub of your school — offering seamless access, smart
            tracking, and intelligent analytics to empower both students and
            educators.
          </p>
        </motion.section>
      </div>

      <Footer />
    </>
  );
};

export default Library;
