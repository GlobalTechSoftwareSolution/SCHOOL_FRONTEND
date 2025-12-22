"use client";
import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  BookOpen,
  Search,
  Calendar,
  Users,
  Laptop,
  ClipboardList,
} from "lucide-react";

const Library = () => {
  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20 text-black bg-gradient-to-br from-slate-50 to-blue-50 py-10 px-6 md:px-20">
      {/* Header Section */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4">
          📖 SchoolERP System – Library Resources
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          A digital platform for managing, searching, and accessing all library materials — bridging
          students, faculty, and administrators under one unified knowledge hub.
        </p>
      </motion.div>

      {/* Overview */}
      <motion.section
        className="bg-white shadow-lg rounded-2xl p-6 mb-10 border-l-4 border-blue-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-3">🧾 Overview</h2>
        <p className="text-gray-700 leading-relaxed">
          The <strong>Library Resources Module</strong> in the <strong>SchoolERP System</strong>{" "}
          digitizes and simplifies library management. It enables users to{" "}
          <strong>access, search, borrow, and manage academic materials</strong> such as books,
          journals, e-books, and multimedia content through an integrated digital portal.
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
          <li>Create a centralized digital library management system.</li>
          <li>Ensure easy access to physical and digital learning resources.</li>
          <li>Track book issues, returns, and overdue penalties.</li>
          <li>Promote a culture of reading and academic research.</li>
          <li>Streamline library operations for librarians and administrators.</li>
        </ul>
      </motion.section>

      {/* Key Features */}
      <motion.section
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {[
          {
            icon: <BookOpen className="text-blue-600 w-8 h-8" />,
            title: "Resource Management",
            desc: "Maintain updated inventory of books, journals, eBooks, and research materials categorized by subject and department.",
          },
          {
            icon: <Search className="text-green-600 w-8 h-8" />,
            title: "Smart Search & Discovery",
            desc: "Advanced search filters by title, author, ISBN, and keywords with real-time availability tracking.",
          },
          {
            icon: <ClipboardList className="text-purple-600 w-8 h-8" />,
            title: "Borrowing & Return Management",
            desc: "Track issued/returned books with automated reminders and overdue alerts integrated with RFID/barcode systems.",
          },
          {
            icon: <Calendar className="text-pink-600 w-8 h-8" />,
            title: "Reservation System",
            desc: "Allow users to reserve books and receive notifications when available — supporting waitlist prioritization.",
          },
          {
            icon: <Laptop className="text-indigo-600 w-8 h-8" />,
            title: "Digital Library Access",
            desc: "Access eBooks, PDFs, and multimedia with role-based access and integration with Google Scholar and Open Library.",
          },
          {
            icon: <Users className="text-orange-600 w-8 h-8" />,
            title: "Librarian Dashboard",
            desc: "Manage resources, user privileges, overdue fines, and generate reports through an intuitive dashboard.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl transition duration-300"
            whileHover={{ scale: 1.04 }}
          >
            <div className="flex items-center gap-4 mb-3">
              {feature.icon}
              <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
            </div>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Analytics */}
      <motion.section
        className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white p-6 rounded-2xl shadow-md mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
      >
        <h2 className="text-2xl font-bold mb-3">📊 Analytics & Reports</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Track most borrowed books and student reading trends.</li>
          <li>View department-wise resource utilization.</li>
          <li>Monitor monthly borrowing and overdue statistics.</li>
          <li>Export data to PDF or Excel for audits.</li>
        </ul>
      </motion.section>

      {/* Integration Table */}
      <motion.section
        className="mt-10 bg-white p-6 rounded-2xl shadow-md border border-gray-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          ⚙️ Integration With Other Modules
        </h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-100 text-blue-800">
              <th className="border border-gray-300 p-2 text-left">Integrated Module</th>
              <th className="border border-gray-300 p-2 text-left">Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Student Portal</td>
              <td className="border border-gray-300 p-2">
                Allows students to search, reserve, and borrow books.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Faculty Hub</td>
              <td className="border border-gray-300 p-2">
                Enables faculty to access and upload reference materials.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Academic Management</td>
              <td className="border border-gray-300 p-2">
                Links resources with syllabus and lesson plans.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Admin Dashboard</td>
              <td className="border border-gray-300 p-2">
                Monitors overall library operations and statistics.
              </td>
            </tr>
          </tbody>
        </table>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="bg-blue-100 rounded-2xl shadow-md p-6 mt-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
      >
        <h2 className="text-2xl font-bold text-blue-800 mb-3">✅ Benefits</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Efficient, paperless library operations.</li>
          <li>Easy access to physical and digital materials.</li>
          <li>Transparent tracking of borrowing and returns.</li>
          <li>Encourages research and academic engagement.</li>
          <li>Automates librarian workflows and reports.</li>
        </ul>
      </motion.section>

      {/* Conclusion */}
      <motion.section
        className="text-center mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl shadow-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-3xl font-bold mb-3">🚀 Conclusion</h2>
        <p className="max-w-3xl mx-auto text-lg">
          The <strong>Library Resources Module</strong> serves as the{" "}
          <strong>knowledge hub</strong> of the SchoolERP ecosystem — ensuring that learners and
          educators have seamless access to quality academic content anytime, anywhere.
        </p>
      </motion.section>
    </div>
    <Footer />
    </>
  );
};

export default Library;
