"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeftIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  DevicePhoneMobileIcon,
  CogIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  RocketLaunchIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AboutUs: React.FC = () => {
  const router = useRouter();

  const features = [
    {
      icon: <CloudArrowUpIcon className="h-8 w-8" />,
      title: "Cloud-Based Platform",
      description: "Access your school management system anytime, anywhere with our secure cloud infrastructure."
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Bank-level security with encryption, role-based access, and regular security audits."
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "Real-Time Analytics",
      description: "Make data-driven decisions with comprehensive dashboards and reporting tools."
    },
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: "Multi-User Access",
      description: "Role-specific interfaces for administrators, teachers, students, and parents."
    }
  ];


  const modules = [
    {
      category: "Academic Management",
      items: ["Student Information System", "Attendance Tracking", "Gradebook", "Timetable Management", "Examination System"]
    },
    {
      category: "Administrative Tools",
      items: ["Fee Management", "Inventory Control", "Transport Management", "Hostel Management", "Library System"]
    },
    {
      category: "Communication",
      items: ["Parent Portal", "Mobile App", "SMS Integration", "Email Notifications", "Announcements"]
    }
  ];

  return (
    <>
      <Navbar />
      <section className="relative min-h-screen py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 overflow-hidden">
        {/* Back Button */}
        <div className="container mx-auto px-6 lg:px-12 relative z-10">

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Side: Image */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative rounded-2xl shadow-2xl overflow-hidden">
              <Image
                src="/hero.jpeg"
                alt="About School ERP System"
                width={600}
                height={450}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </motion.div>

          {/* Right Side: Text */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <BuildingLibraryIcon className="h-4 w-4" />
              Trusted by Educational Institutions
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
              Transforming Education Through{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Technology
              </span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              GlobalTech School ERP is a comprehensive, cloud-based Enterprise Resource Planning 
              solution specifically designed for modern educational institutions. Our platform 
              seamlessly integrates all aspects of school management into a single, intuitive 
              system that empowers administrators, teachers, students, and parents.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckBadgeIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-gray-700">
                  <strong>Centralized Management:</strong> Unified platform for student data, academic records, 
                  financial operations, and communication
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckBadgeIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-gray-700">
                  <strong>Real-time Insights:</strong> Data-driven decision making with comprehensive 
                  analytics and customizable dashboards
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckBadgeIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-gray-700">
                  <strong>Scalable Architecture:</strong> Grows with your institution, from small 
                  schools to large educational chains
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors"
              >
                <Link href={'/login'}>Request Demo</Link>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose Our School ERP?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed with input from educators, administrators, and IT professionals to 
              deliver a solution that truly meets the needs of modern educational institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all text-center"
              >
                <div className="text-blue-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Comprehensive Modules */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Comprehensive Module Suite
            </h2>
            <p className="text-xl text-gray-600">
              Everything your institution needs in one integrated platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {modules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <h3 className="font-bold text-xl text-blue-700 mb-4 flex items-center gap-3">
                  <AcademicCapIcon className="h-6 w-6" />
                  {module.category}
                </h3>
                <ul className="space-y-2">
                  {module.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20"
        >
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <RocketLaunchIcon className="h-6 w-6" />
              Our Mission
            </h3>
            <p className="text-blue-100 leading-relaxed">
              To empower educational institutions with innovative technology solutions that 
              streamline operations, enhance learning experiences, and foster collaborative 
              environments where students, teachers, and administrators can thrive together.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <ChartBarIcon className="h-6 w-6" />
              Our Vision
            </h3>
            <p className="text-blue-100 leading-relaxed">
              To be the leading provider of educational technology solutions in India, 
              transforming how schools operate and creating connected educational ecosystems 
              that prepare students for success in the digital age.
            </p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-white rounded-2xl p-12 shadow-2xl border border-gray-100"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Ready to Transform Your School Management?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of educational institutions that have streamlined their operations 
            and enhanced their educational delivery with our comprehensive ERP solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border border-blue-600 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              <Link href={"/contact"}>Contact Our Team</Link>
            </motion.button>
          </div>
        </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default AboutUs;