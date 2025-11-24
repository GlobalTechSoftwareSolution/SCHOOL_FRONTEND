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
      <div className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 to-white px-6 md:px-20 py-16 text-gray-900">

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
          integrates seamlessly with <strong>biometric devices</strong> and provides
          <strong> real-time monitoring</strong>, ensuring transparency and accuracy.
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
              icon: <Clock className="text-blue-600" size={28} />,
              title: "Real-Time Tracking",
              desc: "Monitor attendance instantly with live updates. Track late arrivals, early departures, and absentees.",
              image:
                "/erpmodules/attendance/real-time.webp",
            },
            {
              icon: <BarChart3 className="text-blue-600" size={28} />,
              title: "Automated Reports",
              desc: "Generate daily, weekly, and monthly attendance reports. Export in Excel/PDF for audits.",
              image:
                "/erpmodules/attendance/automated-report.png",
            },
            {
              icon: <Bell className="text-blue-600" size={28} />,
              title: "Parent Notifications",
              desc: "Automatically notify parents about absences or lateness via SMS, email, or app notifications.",
              image:
                "/erpmodules/attendance/parent-notification.webp",
            },
            {
              icon: <UserCheck className="text-blue-600" size={28} />,
              title: "Manual Override & Approval",
              desc: "Admins can edit attendance for field trips or special events with approval records.",
              image:
                "/erpmodules/attendance/manual-override.png",
            },
            {
              icon: <CalendarDays className="text-blue-600" size={28} />,
              title: "Attendance Calendar View",
              desc: "Interactive monthly calendar showing present, absent, and leave days with color codes.",
              image:
                "/erpmodules/attendance/attendace-calender.avif",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.03 }}
            >
              {/* FIXED CLEAN IMAGE BOX */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 flex justify-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="max-h-48 w-auto object-contain"
                />
              </div>

              <div className="flex items-center gap-3 mb-3">
                {item.icon}
                <h3 className="text-lg font-semibold text-blue-700">
                  {item.title}
                </h3>
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
            <li>Works with biometric & RFID systems.</li>
            <li>Syncs with payroll and academic records.</li>
            <li>Auto backup to cloud for safety.</li>
            <li>Integrated with student & staff portals.</li>
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
            <li>Removes manual attendance errors.</li>
            <li>Improves accuracy and saves time.</li>
            <li>Better communication with parents.</li>
            <li>Boosts punctuality.</li>
            <li>Quick reporting for audits.</li>
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
            - Student scans fingerprint at entry. <br />
            - System logs attendance instantly. <br />
            - Parents get real-time notification. <br />
            - Admin reviews monthly attendance analytics. <br />
            - Teachers override entries for events if needed.
          </p>
        </motion.section>

        {/* Conclusion */}
        <motion.section
          className="text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            🚀 Conclusion
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            The <strong>Attendance Management Module</strong> brings accuracy,
            automation, and transparency through biometric integration —
            supporting parents, teachers, and admins with real-time insights.
          </p>
        </motion.section>
      </div>

      <Footer />
    </>
  );
};

export default Attendence_Information;
