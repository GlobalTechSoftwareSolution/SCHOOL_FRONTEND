"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Send,
  MessageSquare,
  Smartphone,
  Bell,
  Users,
  Clock,
  Database,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Sms = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen mt-20 bg-white text-gray-800 px-6 md:px-20 py-16">

        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-3">
            📱 SchoolERP – Mobile SMS Communication Module
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            The <strong>Mobile SMS Module</strong> ensures instant and reliable
            communication between schools and parents. Send bulk messages,
            reminders, and updates with a single click — keeping everyone informed
            and connected at all times.
          </p>
        </motion.div>

        {/* Core Features */}
        <motion.section
          className="grid md:grid-cols-2 gap-8 mb-16"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          {[
            {
              icon: <Send className="text-blue-600" size={26} />,
              title: "Bulk Messaging",
              desc: "Send important announcements and alerts to all parents, teachers, or staff members instantly with just one click.",
              image: "/erpmodules/sms/Bulk-SMS'.jpg",
            },
            {
              icon: <MessageSquare className="text-blue-600" size={26} />,
              title: "Instant Updates",
              desc: "Deliver time-sensitive notifications like exam schedules, holidays, events, or emergency alerts directly to mobile devices.",
              image: "/erpmodules/sms/instant-updates.png",
            },
            {
              icon: <Smartphone className="text-blue-600" size={26} />,
              title: "Parent Communication",
              desc: "Enhance school-parent relationships by sharing attendance, performance, and fee reminders via SMS.",
              image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=80",
            },
            {
              icon: <Bell className="text-blue-600" size={26} />,
              title: "One-click Operation",
              desc: "Send bulk or personalized messages through an easy-to-use interface. Templates make repeated communication efficient.",
              image: "/erpmodules/sms/on-click.jpg",
            },
            {
              icon: <Users className="text-blue-600" size={26} />,
              title: "Group Targeting",
              desc: "Send messages to specific groups — such as parents of a class, teachers, or staff — without manual selection every time.",
              image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80",
            },
            {
              icon: <Clock className="text-blue-600" size={26} />,
              title: "Scheduled Messages",
              desc: "Plan ahead and schedule SMS notifications for specific dates or times — ideal for reminders and announcements.",
              image: "/erpmodules/sms/scheduled-Text.png",
            },
            {
              icon: <Database className="text-blue-600" size={26} />,
              title: "Delivery Reports",
              desc: "Track message delivery status and generate analytics to monitor communication efficiency.",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80",
            },
            {
              icon: <ShieldCheck className="text-blue-600" size={26} />,
              title: "Data Security & Privacy",
              desc: "Communication is secured using encrypted APIs and role-based access to ensure confidentiality.",
              image: "/erpmodules/sms/security].png",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 transition-all duration-300"
              whileHover={{ scale: 1.03 }}
            >
              {/* IMAGE BOX LIKE YOUR SCREENSHOT */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 flex justify-center">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="max-h-48 w-auto object-contain"
                />
              </div>

              {/* TEXT AREA */}
              <div className="flex items-center gap-3 mb-2">
                {feature.icon}
                <h3 className="text-lg font-semibold text-blue-700">
                  {feature.title}
                </h3>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.section>

        {/* Integration Section */}
        <motion.section
          className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200 mb-16"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            🔗 Integration with Other Modules
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Attendance Module – Sends absentee alerts automatically.</li>
            <li>Fee Management – Sends fee reminders & receipts.</li>
            <li>Event Management – Broadcasts event invitations.</li>
            <li>Emergency System – Sends urgent alerts school-wide.</li>
          </ul>
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          className="mb-16"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            ✅ Key Benefits
          </h2>
          <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-gray-700">
            <li>Instant communication.</li>
            <li>Better parent engagement.</li>
            <li>Faster emergency response.</li>
            <li>Supports multilingual SMS templates.</li>
            <li>Delivery tracking & analytics.</li>
            <li>Highly secure and scalable.</li>
          </ul>
        </motion.section>

        {/* Example Use Case */}
        <motion.section
          className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-200 mb-12"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-semibold mb-3 text-blue-700">
            📩 Example Use Case
          </h2>
          <p className="text-gray-700 leading-relaxed">
            - <strong>Admin</strong> sends exam notifications to all parents. <br />
            - <strong>System</strong> auto-sends fee reminders. <br />
            - <strong>Teachers</strong> share attendance. <br />
            - <strong>Parents</strong> stay informed instantly.
          </p>
        </motion.section>

        {/* Conclusion */}
        <motion.section
          className="text-center"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            🚀 Conclusion
          </h2>
          <p className="max-w-3xl mx-auto text-gray-700 leading-relaxed">
            The Mobile SMS Module provides fast, secure, and effective communication —
            ensuring parents, teachers, and administrators always stay connected.
          </p>
        </motion.section>

      </div>
      <Footer />
    </>
  );
};

export default Sms;
