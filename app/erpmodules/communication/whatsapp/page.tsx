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
} from "lucide-react";
import NextImage from "next/image";
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
              image:
                "/erpmodules/whatsapp/WhatsApp-Business-API-Integration.jpg",
            },
            {
              icon: <Image className="text-green-700" size={26} aria-hidden="true" alt="" />,
              title: "Multimedia Messaging",
              desc: "Send not only text but also images, videos, PDFs, and voice messages for richer, more engaging communication.",
              image:
                "/erpmodules/whatsapp/multi-media.webp",
            },
            {
              icon: <Zap className="text-green-700" size={26} />,
              title: "High Engagement",
              desc: "Achieve up to 90% message open rates—ensuring that important updates, alerts, and reminders are seen instantly.",
              image:
                "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=900&q=80",
            },
            {
              icon: <Link className="text-green-700" size={26} />,
              title: "Streamlined Communication",
              desc: "Automate notifications such as fee reminders, event updates, and exam results directly via WhatsApp.",
              image:
                "/erpmodules/whatsapp/communication.jpeg",
            },
            {
              icon: <Users className="text-green-700" size={26} />,
              title: "Group Broadcasting",
              desc: "Send messages to parent groups, teacher communities, or admin teams without manual repetition.",
              image:
                "/erpmodules/whatsapp/group-bordcasting.jpeg",
            },
            {
              icon: <CheckCircle className="text-green-700" size={26} />,
              title: "Read Receipts",
              desc: "Track message delivery and read status for better monitoring and accountability.",
              image:"/erpmodules/whatsapp/read_recept.png",
            },
            {
              icon: <ShieldCheck className="text-green-700" size={26} />,
              title: "End-to-End Security",
              desc: "Ensure every message and file shared through WhatsApp remains encrypted and private.",
              image:
                "/erpmodules/whatsapp/end-to-end.jpg",
            },
            {
              icon: <BarChart2 className="text-green-700" size={26} />,
              title: "Analytics Dashboard",
              desc: "Monitor engagement, track message delivery performance, and analyze communication trends.",
              image:
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300"
              whileHover={{ scale: 1.03 }}
            >
              {/* Image Box */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 flex justify-center">
                <NextImage
                  src={feature.image}
                  alt=""
                  width={500}
                  height={300}
                  className="max-h-48 w-auto object-contain"
                />
              </div>

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
            <li>Daily attendance WhatsApp alerts for parents.</li>
            <li>Automated fee reminders & receipts.</li>
            <li>Event invites & photo highlights sharing.</li>
            <li>Instant exam schedule & result sharing.</li>
            <li>Transport updates for school buses.</li>
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
            <li>Over 90% message open rate.</li>
            <li>Supports text, PDFs, videos, and more.</li>
            <li>Two-way real-time communication.</li>
            <li>Boosts parent engagement.</li>
            <li>Fully automated messaging workflows.</li>
            <li>High-level security and data privacy.</li>
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
            - <strong>Admin</strong> sends automated fee reminders. <br />
            - <strong>Teachers</strong> share exam updates & homework. <br />
            - <strong>Parents</strong> respond instantly through WhatsApp. <br />
            - <strong>Students</strong> receive event notifications and study materials.
          </p>
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
            The <strong>WhatsApp Integration Module</strong> enhances school
            communication using the world’s most effective messaging platform —
            boosting engagement, transparency, and efficiency.
          </p>
        </motion.section>
      </div>

      <Footer />
    </>
  );
};

export default Whatsapp;
