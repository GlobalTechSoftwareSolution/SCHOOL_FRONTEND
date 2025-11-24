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
              desc: "Create and manage dedicated galleries for annual days, sports meets, cultural festivals, and classroom activities with detailed captions.",
              image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
            },
            {
              icon: <Users className="text-blue-600" size={26} />,
              title: "Class-wise Display",
              desc: "Display student photos in an organized manner, separated by class, ensuring easy browsing and identification.",
              image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80",
            },
            {
              icon: <Camera className="text-blue-600" size={26} />,
              title: "Upload & Tagging",
              desc: "Upload multiple photos at once, tag students and teachers, and categorize them under respective events.",
              image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
            },
            {
              icon: <GalleryVerticalEnd className="text-blue-600" size={26} />,
              title: "Smart Categorization",
              desc: "Automatically organizes uploaded images using AI-based tagging for event type, date, and class info.",
              image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
            },
            {
              icon: <Calendar className="text-blue-600" size={26} />,
              title: "Event Timeline View",
              desc: "Browse school events in a chronological gallery timeline and revisit achievements.",
              image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80",
            },
            {
              icon: <Bell className="text-blue-600" size={26} />,
              title: "Latest Updates",
              desc: "Highlight newly uploaded events and notify parents and students instantly.",
              image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80",
            },
            {
              icon: <Star className="text-blue-600" size={26} />,
              title: "Student Engagement",
              desc: "Motivates students by showcasing achievements and event photos.",
              image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 transition-all duration-300 p-6"
              whileHover={{ scale: 1.03 }}
            >
              {/* FIXED IMAGE BOX (like your screenshot) */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 flex justify-center">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="max-h-48 w-auto object-contain"
                />
              </div>

              {/* ICON + TITLE + DESC */}
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
            <li>Connected with <strong>Student Profiles</strong> for automatic tagging.</li>
            <li>Linked with <strong>Event Management</strong> for event galleries.</li>
            <li>Integrated with <strong>Notification System</strong>.</li>
            <li>Works with <strong>Admin Dashboard</strong> for moderation.</li>
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
            <li>Enhances student visibility.</li>
            <li>Improves parent-school communication.</li>
            <li>Creates a visual archive of events.</li>
            <li>Reduces manual photo management.</li>
            <li>Promotes collaboration across departments.</li>
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
            - <strong>Teacher</strong> uploads event photos. <br />
            - <strong>Admin</strong> reviews and approves. <br />
            - <strong>Parents</strong> get notifications. <br />
            - <strong>Students</strong> view the gallery online.
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
            The Student Image Gallery Module transforms how schools capture,
            organize, and share memories — building a stronger school community.
          </p>
        </motion.section>

      </div>
      <Footer />
    </>
  );
};

export default Gallery;
