"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Fingerprint,
  Clock,
  BarChart3,
  Bell,
  UserCheck,
  CalendarDays,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Attendence_Information = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20  bg-gradient-to-br from-blue-50 to-white px-6 md:px-20 py-16 text-gray-900">
      {/* Header */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center text-blue-700 mb-6"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        🕒 SchoolERP System – Attendance Management
      </motion.h1>

      <motion.p
        className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        The <strong>Attendance Management Module</strong> enables schools to
        efficiently track attendance for students, teachers, and staff. It
        integrates seamlessly with **biometric devices** and provides **real-time
        monitoring**, ensuring transparency and accuracy across the institution.
      </motion.p>

      {/* Features Section */}
      <motion.section
        className="grid md:grid-cols-2 gap-8 mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        {[
          // {
          //   icon: <Fingerprint className="text-blue-600" size={28} />,
          //   title: "Biometric Integration",
          //   desc: "Automatically record attendance using biometric fingerprint or RFID systems. Syncs real-time data with the SchoolERP dashboard for accuracy.",
          // },
          {
            icon: <Clock className="text-blue-600" size={28} />,
            title: "Real-Time Tracking",
            desc: "Monitor attendance status instantly with live updates. Track late arrivals, early departures, and absentees efficiently.",
          },
          {
            icon: <BarChart3 className="text-blue-600" size={28} />,
            title: "Automated Reports",
            desc: "Generate daily, weekly, and monthly reports for each class or department. Export reports in Excel or PDF formats for audits and compliance.",
          },
          {
            icon: <Bell className="text-blue-600" size={28} />,
            title: "Parent Notifications",
            desc: "Automatically notify parents about absences or tardiness through SMS, email, or push notifications — improving communication and accountability.",
          },
          {
            icon: <UserCheck className="text-blue-600" size={28} />,
            title: "Manual Override & Approval",
            desc: "Admins can manually update attendance entries for special cases such as field trips or official duties — with supervisor approval tracking.",
          },
          {
            icon: <CalendarDays className="text-blue-600" size={28} />,
            title: "Attendance Calendar View",
            desc: "View daily or monthly attendance summaries through an interactive calendar with color-coded attendance visualization.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center gap-3 mb-3">
              {item.icon}
              <h3 className="text-lg font-semibold text-blue-700">{item.title}</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Integration Section */}
      <motion.section
        className="bg-blue-50 p-8 rounded-2xl mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">
          ⚙️ Integration & Automation
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Integrates with biometric and RFID attendance systems.</li>
          <li>Syncs attendance data with payroll and academic records.</li>
          <li>Supports auto-sync with cloud-based backup for reliability.</li>
          <li>Integration with student and staff portals for transparency.</li>
        </ul>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">
          ✅ Benefits
        </h2>
        <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-gray-700">
          <li>Eliminates manual attendance errors and delays.</li>
          <li>Enhances accuracy and saves administrative time.</li>
          <li>Improves communication with parents and management.</li>
          <li>Boosts punctuality and accountability among staff and students.</li>
          <li>Supports quick report generation for audits and performance reviews.</li>
        </ul>
      </motion.section>

      {/* Example Use Case */}
      <motion.section
        className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-3 text-blue-800">
          🖥️ Example Use Case
        </h2>
        <p className="text-gray-700 leading-relaxed">
          - <strong>Student</strong> scans their fingerprint at entry.  <br />
          - The <strong>system</strong> automatically records the time and updates the daily attendance log.  <br />
          - <strong>Parents</strong> get a real-time notification about attendance status.  <br />
          - <strong>Admin</strong> reviews automated monthly reports for class-wise attendance trends.  <br />
          - <strong>Teachers</strong> can mark attendance manually for special sessions or offline activities.
        </p>
      </motion.section>

      {/* Conclusion */}
      <motion.section
        className="text-center"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">🚀 Conclusion</h2>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
          The <strong>Attendance Management Module</strong> ensures seamless,
          accurate, and real-time attendance tracking through biometric and
          digital integration — making school operations more efficient and
          transparent for all stakeholders.
        </p>
      </motion.section>
    </div>
    <Footer />
    </>
  );
};

export default Attendence_Information;
