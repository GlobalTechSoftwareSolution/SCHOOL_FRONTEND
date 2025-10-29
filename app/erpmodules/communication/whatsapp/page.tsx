"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Zap,
  Image,
  Users,
  CheckCircle,
  Link,
  ShieldCheck,
  BarChart2,
  Globe,
  Smartphone,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Whatsapp = () => {
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
        <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-3">
          💬 SchoolERP – WhatsApp Integration Module
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          The <strong>WhatsApp Integration Module</strong> empowers schools to
          connect with parents, teachers, and students through the world’s most
          popular messaging platform. With a <strong>90% open rate</strong>, it
          ensures instant communication, higher engagement, and seamless
          two-way interactions.
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
            icon: <MessageCircle className="text-green-700" size={26} />,
            title: "WhatsApp Business API",
            desc: "Integrate directly with WhatsApp Business API for secure and official communication with parents and staff.",
          },
          {
            icon: <Image className="text-green-700" size={26} />,
            title: "Multimedia Messaging",
            desc: "Send not only text but also images, videos, PDFs, and voice messages for richer, more engaging communication.",
          },
          {
            icon: <Zap className="text-green-700" size={26} />,
            title: "High Engagement",
            desc: "Achieve up to 90% message open rates—ensuring that important updates, alerts, and reminders are seen instantly.",
          },
          {
            icon: <Link className="text-green-700" size={26} />,
            title: "Streamlined Communication",
            desc: "Automate notifications such as fee reminders, event updates, and exam results directly via WhatsApp.",
          },
          {
            icon: <Users className="text-green-700" size={26} />,
            title: "Group Broadcasting",
            desc: "Send messages to parent groups, teacher communities, or admin teams without manual repetition.",
          },
          {
            icon: <CheckCircle className="text-green-700" size={26} />,
            title: "Read Receipts",
            desc: "Track message delivery and read status for better monitoring and accountability.",
          },
          {
            icon: <ShieldCheck className="text-green-700" size={26} />,
            title: "End-to-End Security",
            desc: "Ensure every message and file shared through WhatsApp remains encrypted and private.",
          },
          {
            icon: <BarChart2 className="text-green-700" size={26} />,
            title: "Analytics Dashboard",
            desc: "Monitor engagement, track message delivery performance, and analyze communication trends.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300"
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center gap-3 mb-3">
              {feature.icon}
              <h3 className="text-lg font-semibold text-green-700">
                {feature.title}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Integration Section */}
      <motion.section
        className="bg-gray-50 p-8 rounded-2xl shadow-md border border-gray-200 mb-16"
        initial="hidden"
        animate="show"
        variants={fadeIn}
      >
        <h2 className="text-2xl font-semibold mb-4 text-green-700">
          🔗 Integration with Other SchoolERP Modules
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            Linked with <strong>Attendance Module</strong> to send daily
            attendance updates to parents.
          </li>
          <li>
            Integrated with <strong>Fee Management</strong> for payment
            reminders and digital receipts.
          </li>
          <li>
            Works with <strong>Event Management</strong> to send invites and
            post-event highlights with photos.
          </li>
          <li>
            Connected to <strong>Exam & Results Module</strong> to share exam
            schedules and report cards instantly.
          </li>
          <li>
            Linked with <strong>Transport Management</strong> for live updates
            on bus arrivals or delays.
          </li>
        </ul>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="mb-16"
        initial="hidden"
        animate="show"
        variants={fadeIn}
      >
        <h2 className="text-2xl font-semibold mb-4 text-green-700">
          ✅ Key Benefits
        </h2>
        <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-gray-700">
          <li>Over 90% message open rate for instant visibility.</li>
          <li>Supports text, images, PDFs, and videos for rich content sharing.</li>
          <li>Enables quick parent communication with two-way chat options.</li>
          <li>Improves engagement and participation in school events.</li>
          <li>Automates repetitive communication tasks for admins.</li>
          <li>Fully secure and privacy-compliant messaging framework.</li>
        </ul>
      </motion.section>

      {/* Example Use Case */}
      <motion.section
        className="bg-gray-50 p-6 rounded-2xl shadow-md border border-gray-200 mb-12"
        initial="hidden"
        animate="show"
        variants={fadeIn}
      >
        <h2 className="text-2xl font-semibold mb-3 text-green-700">
          💡 Example Use Case
        </h2>
        <p className="text-gray-700 leading-relaxed">
          - <strong>Admin</strong> sends automated fee reminders through WhatsApp. <br />
          - <strong>Teachers</strong> share exam updates and homework with parents. <br />
          - <strong>Parents</strong> respond directly to queries. <br />
          - <strong>Students</strong> receive event notifications and resources instantly.
        </p>
      </motion.section>

      {/* Tech Section */}
      <motion.section
        className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 mb-12"
        initial="hidden"
        animate="show"
        variants={fadeIn}
      >
        <h2 className="text-2xl font-semibold mb-4 text-green-700">
          ⚙️ Technical Highlights
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Integrated via official <strong>Meta WhatsApp Business API</strong>.</li>
          <li>Supports multi-template message automation.</li>
          <li>Custom dashboards for engagement tracking.</li>
          <li>Fully compliant with <strong>data privacy standards</strong>.</li>
          <li>Works seamlessly across Android, iOS, and Web platforms.</li>
        </ul>
      </motion.section>

      {/* Conclusion */}
      <motion.section
        className="text-center"
        initial="hidden"
        animate="show"
        variants={fadeIn}
      >
        <h2 className="text-2xl font-semibold mb-4 text-green-700">
          🚀 Conclusion
        </h2>
        <p className="max-w-3xl mx-auto text-gray-700 leading-relaxed">
          The <strong>WhatsApp Integration Module</strong> bridges the gap
          between schools and parents using the most effective communication
          channel. It enhances transparency, engagement, and operational
          efficiency — all through a familiar, user-friendly platform.
        </p>
      </motion.section>
    </div>
    <Footer />
    </>
  );
};

export default Whatsapp;
