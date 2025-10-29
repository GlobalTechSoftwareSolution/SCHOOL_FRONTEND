"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Images,
  Camera,
  Users,
  Calendar,
  Star,
  Bell,
  GalleryVerticalEnd,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Gallery = () => {
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
          🖼️ SchoolERP – Student Image Gallery
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          The <strong>Student Image Gallery Module</strong> showcases vibrant
          student life by organizing photos and event highlights class-wise and
          group-wise. It improves student engagement, parental connection, and
          promotes school events dynamically.
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
            icon: <Images className="text-blue-600" size={26} />,
            title: "Event Galleries",
            desc: "Create and manage dedicated galleries for annual days, sports meets, cultural festivals, and classroom activities with detailed captions and highlights.",
          },
          {
            icon: <Users className="text-blue-600" size={26} />,
            title: "Class-wise Display",
            desc: "Display student photos in an organized manner, separated by class, section, or club, ensuring easy browsing and identification.",
          },
          {
            icon: <Camera className="text-blue-600" size={26} />,
            title: "Upload & Tagging",
            desc: "Upload multiple photos at once, tag students and teachers, and automatically categorize them under respective events or classes.",
          },
          {
            icon: <GalleryVerticalEnd className="text-blue-600" size={26} />,
            title: "Smart Categorization",
            desc: "Automatically organizes uploaded images using AI-based tagging for event type, date, and class information.",
          },
          {
            icon: <Calendar className="text-blue-600" size={26} />,
            title: "Event Timeline View",
            desc: "Browse school events in a chronological gallery timeline to revisit achievements and special memories throughout the academic year.",
          },
          {
            icon: <Bell className="text-blue-600" size={26} />,
            title: "Latest Updates",
            desc: "Instantly highlight newly uploaded events on the dashboard and send notifications to parents and students for quick visibility.",
          },
          {
            icon: <Star className="text-blue-600" size={26} />,
            title: "Student Engagement",
            desc: "Encourages participation by showcasing photos and achievements, motivating students through visual recognition.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 transition-all duration-300"
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center gap-3 mb-3">
              {feature.icon}
              <h3 className="text-lg font-semibold text-blue-700">
                {feature.title}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{feature.desc}</p>
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
          <li>
            Connected with <strong>Student Profiles</strong> for automatic
            tagging of names and roll numbers.
          </li>
          <li>
            Linked with <strong>Event Management Module</strong> for creating
            dedicated galleries per event.
          </li>
          <li>
            Integrated with <strong>Notification System</strong> to alert
            parents and students of new uploads.
          </li>
          <li>
            Works with <strong>Admin Dashboard</strong> for approval and content
            moderation before publishing.
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
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">
          ✅ Key Benefits
        </h2>
        <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-gray-700">
          <li>Enhances student visibility and recognition.</li>
          <li>Improves parent-school engagement and communication.</li>
          <li>Creates a vibrant visual archive of school life.</li>
          <li>Reduces manual effort in managing event photos.</li>
          <li>Increases transparency and collaboration across departments.</li>
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
          📸 Example Use Case
        </h2>
        <p className="text-gray-700 leading-relaxed">
          - <strong>Teacher</strong> uploads event photos to the class gallery.{" "}
          <br />
          - <strong>Admin</strong> reviews and approves the upload. <br />
          - <strong>Parents</strong> receive notifications and can view event
          highlights online. <br />
          - <strong>Students</strong> engage by viewing and sharing achievements
          on the school portal.
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
          The <strong>Student Image Gallery Module</strong> transforms how
          schools capture and share memories — turning moments into inspiration
          while enhancing community engagement and transparency.
        </p>
      </motion.section>
    </div>
    <Footer />
    </>
  );
};

export default Gallery;
