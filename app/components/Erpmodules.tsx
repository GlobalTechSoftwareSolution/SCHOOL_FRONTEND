"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  BookOpen,
  Users,
  DollarSign,
  UserCheck,
  MessageSquare,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Star,
  Shield,
  Zap,
} from "lucide-react";

const tabs = [
  { id: "academics", label: "Academics", icon: BookOpen, color: "from-blue-500 to-cyan-500" },
  { id: "administration", label: "Administration", icon: Users, color: "from-green-500 to-emerald-500" },
  { id: "finance", label: "Finance", icon: DollarSign, color: "from-purple-500 to-pink-500" },
  { id: "communication", label: "Communication", icon: MessageSquare, color: "from-indigo-500 to-blue-500" },
];

const modulesData = {
  academics: [
    {
      title: "Student Information System",
      description:
        "Maintain detailed student profiles with historical tracking of changes and transformations over years. Manage all important aspects of student lifecycle.",
      icon: Users,
      features: ["360° Student Profile", "Historical Tracking", "Academic Records", "Parent Portal"],
      stats: "98% Efficiency Gain",
      Link: "/erpmodules/academics/student_information",
    },
    {
      title: "Attendance Management",
      description:
        "Track attendance of every member associated with the school. Easily integrate with biometric devices for seamless attendance recording.",
      icon: UserCheck,
      features: ["Biometric Integration", "Real-time Tracking", "Automated Reports", "Parent Notifications"],
      stats: "100% Accuracy",
      Link: "/erpmodules/academics/attendence_information",
    },
    {
      title: "Planning",
      description:
        "Transform the colossal task of lesson planning into a simple, effective, and error-free process. Organize academic sessions systematically.",
      icon: BookOpen,
      features: ["Curriculum Mapping", "Session Planning", "Resource Allocation", "Progress Tracking"],
      stats: "70% Time Saved",
      Link: "/erpmodules/academics/lesson_planning",
    },
  ],
  administration: [
    {
      title: "Inventory Management",
      description:
        "Track all school assets and prevent thefts or misplacement. Maintain comprehensive inventory records with real-time updates.",
      icon: Shield,
      features: ["Asset Tracking", "Stock Management", "Theft Prevention", "Real-time Updates"],
      stats: "Complete Control",
      Link: "/erpmodules/administration/inventory",
    },
    {
      title: "Library Management",
      description:
        "Manage your school's knowledge reservoir efficiently. Streamline book issuance, returns, and catalog management.",
      icon: BookOpen,
      features: ["Digital Catalog", "Book Tracking", "Member Management", "Analytics"],
      stats: "Organized Knowledge",
      Link: "/erpmodules/administration/library",
    },
    {
      title: "Transport Management",
      description:
        "Monitor school transport with route vacancy-occupancy graphical representation. Ensure student safety and efficient routing.",
      icon: Users,
      features: ["Route Optimization", "GPS Tracking", "Safety Monitoring", "Parent Alerts"],
      stats: "Safe Transport",
      Link: "/erpmodules/administration/transport",
    },
  ],
  finance: [
    {
      title: "Fee Management",
      description:
        "Streamline fee collection with integrated online payment gateway. Access fee dashboard with day's collection and dues information.",
      icon: DollarSign,
      features: ["Online Payments", "Fee Dashboard", "Receipt Generation", "Dues Tracking"],
      stats: "Zero Errors",
      Link: "/erpmodules/finance/fees",
    },
    {
      title: "Financial Accounting",
      description:
        "Comprehensive financial management with user-defined ledgers and ledger groups. Tailor financial management to specific needs.",
      icon: BookOpen,
      features: ["Custom Ledgers", "Financial Reports", "Transaction Tracking", "Audit Trail"],
      stats: "Complete Financial Control",
      Link: "/erpmodules/finance/accounting",
    },
    {
      title: "Payroll Management",
      description:
        "Handle salary processing with precision. Manage all salary components accurately with meticulous calculation.",
      icon: UserCheck,
      features: ["Salary Processing", "Component Management", "Tax Calculation", "Payslip Generation"],
      stats: "Accurate Processing",
      Link: "/erpmodules/finance/payroll",
    },
  ],
  communication: [
    {
      title: "Student Image Gallery",
      description:
        "Display student images class-wise and group-wise with event descriptions. Enhance student engagement and awareness.",
      icon: Users,
      features: ["Event Galleries", "Class-wise Display", "Student Engagement", "Latest Updates"],
      stats: "Enhanced Visibility",
      Link: "/erpmodules/communication/gallery",
    },
    {
      title: "Mobile SMS",
      description:
        "Send important bulk SMS to all parents with one click. Keep parents updated with school happenings and child information.",
      icon: MessageSquare,
      features: ["Bulk Messaging", "Instant Updates", "Parent Communication", "One-click Operation"],
      stats: "Instant Communication",
      Link: "/erpmodules/communication/sms",
    },
    {
      title: "WhatsApp Integration",
      description:
        "Leverage WhatsApp Business API with over 90% open rate for enhanced engagement and streamlined communication.",
      icon: Zap,
      features: ["WhatsApp API", "Multimedia Messaging", "High Engagement", "Streamlined Communication"],
      stats: "90% Open Rate",
      Link: "/erpmodules/communication/whatsapp",
    },
  ],
};

const FloatingParticles = () => {
  if (typeof window === "undefined") return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-blue-200 to-purple-200"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, -100, -200],
            x: [null, Math.random() * 100 - 50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          style={{
            width: Math.random() * 20 + 5,
            height: Math.random() * 20 + 5,
          }}
        />
      ))}
    </div>
  );
};

export default function ERPModules() {
  const [activeTab, setActiveTab] = useState("academics");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const currentModules = modulesData[activeTab as keyof typeof modulesData];
  const slidesToShow = 3;
  const totalSlides = Math.ceil(currentModules.length / slidesToShow);

  useEffect(() => {
    if (!isPlaying || isHovering) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, isHovering, totalSlides]);

  const visibleModules = currentModules.slice(
    currentSlide * slidesToShow,
    (currentSlide + 1) * slidesToShow
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-white via-blue-50 to-indigo-100 overflow-hidden">
      <FloatingParticles />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl mb-6 border border-blue-200 shadow-lg">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ERP MODULES
            </span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Comprehensive ERP System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            A comprehensive ERP Module with user-friendly dashboards, easy navigation, and well-structured reports.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentSlide(0);
                }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`relative group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl`
                    : "bg-white text-gray-700 hover:text-gray-900 hover:shadow-xl border border-gray-200"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Modules */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {visibleModules.map((module) => (
              <motion.div
                key={module.title}
                variants={itemVariants}
                whileHover={{
                  y: -12,
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 300 },
                }}
                className="group relative"
              >
                <div className="relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-blue-300 transition-all duration-500 h-full flex flex-col shadow-lg hover:shadow-2xl">
                  <motion.div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <module.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
                      <span className="text-xs font-bold text-white">{module.stats}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4 leading-tight">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                    {module.description}
                  </p>

                  <div className="space-y-3 mb-8">
                    {module.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* ✅ Fixed: Link Button */}
                  <Link href={module.Link || "#"} passHref>
                    <motion.button
                      whileHover={{
                        x: 8,
                        backgroundColor: "#3B82F6",
                        color: "white",
                      }}
                      className="flex items-center gap-2 text-sm font-semibold text-blue-600 px-4 py-3 rounded-xl border border-blue-200 group-hover:border-blue-500 transition-all w-fit"
                    >
                      Read More
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </motion.button>
                  </Link>

                  <motion.div
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity },
                    }}
                  >
                    <Star className="w-4 h-4 text-yellow-400" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
