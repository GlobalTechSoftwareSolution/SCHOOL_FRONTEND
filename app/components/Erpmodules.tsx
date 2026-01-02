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
  { id: "finance", label: "Finance", icon: DollarSign, color: "from-purple-500 to-pink-500" },
  { id: "administration", label: "Administration", icon: Users, color: "from-green-500 to-emerald-500" },
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

// Pre-generate particles data at module level with fixed values
const particlesData = [
  { id: 0, x: 100, y: 200, scale: 0.7, width: 8, height: 8, duration: 3.5, delay: 0.5, xMovement: 20 },
  { id: 1, x: 300, y: 150, scale: 0.9, width: 12, height: 12, duration: 4.2, delay: 1.2, xMovement: -15 },
  { id: 2, x: 500, y: 300, scale: 0.6, width: 6, height: 6, duration: 2.8, delay: 0.8, xMovement: 35 },
  { id: 3, x: 700, y: 100, scale: 0.8, width: 10, height: 10, duration: 3.9, delay: 1.5, xMovement: -25 },
  { id: 4, x: 200, y: 400, scale: 0.5, width: 5, height: 5, duration: 2.3, delay: 0.3, xMovement: 40 },
  { id: 5, x: 600, y: 250, scale: 0.7, width: 9, height: 9, duration: 3.1, delay: 1.8, xMovement: -30 },
  { id: 6, x: 800, y: 350, scale: 0.9, width: 11, height: 11, duration: 4.5, delay: 0.6, xMovement: 15 },
  { id: 7, x: 400, y: 50, scale: 0.6, width: 7, height: 7, duration: 2.7, delay: 1.1, xMovement: -35 },
  { id: 8, x: 900, y: 200, scale: 0.8, width: 10, height: 10, duration: 3.8, delay: 0.9, xMovement: 25 },
  { id: 9, x: 150, y: 450, scale: 0.5, width: 6, height: 6, duration: 2.5, delay: 1.6, xMovement: -20 },
  { id: 10, x: 550, y: 100, scale: 0.7, width: 8, height: 8, duration: 3.3, delay: 0.4, xMovement: 30 },
  { id: 11, x: 750, y: 300, scale: 0.9, width: 12, height: 12, duration: 4.1, delay: 1.3, xMovement: -10 },
  { id: 12, x: 350, y: 500, scale: 0.6, width: 7, height: 7, duration: 2.9, delay: 0.7, xMovement: 45 },
  { id: 13, x: 650, y: 150, scale: 0.8, width: 9, height: 9, duration: 3.6, delay: 1.9, xMovement: -40 },
  { id: 14, x: 250, y: 350, scale: 0.5, width: 5, height: 5, duration: 2.4, delay: 0.2, xMovement: 10 },
  { id: 15, x: 850, y: 50, scale: 0.7, width: 8, height: 8, duration: 3.2, delay: 1.4, xMovement: -5 },
  { id: 16, x: 450, y: 400, scale: 0.9, width: 11, height: 11, duration: 4.3, delay: 0.8, xMovement: 50 },
  { id: 17, x: 50, y: 250, scale: 0.6, width: 6, height: 6, duration: 2.6, delay: 1.7, xMovement: -45 },
  { id: 18, x: 950, y: 150, scale: 0.8, width: 10, height: 10, duration: 3.7, delay: 0.5, xMovement: 5 },
  { id: 19, x: 750, y: 450, scale: 0.5, width: 7, height: 7, duration: 2.2, delay: 1.0, xMovement: -50 },
];

const FloatingParticles = () => {
  if (typeof window === "undefined") return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particlesData.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-blue-200 to-purple-200"
          initial={{
            x: particle.x,
            y: particle.y,
            scale: particle.scale,
          }}
          animate={{
            y: [null, -100, -200],
            x: [null, particle.xMovement],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
          style={{
            width: particle.width,
            height: particle.height,
          }}
        />
      ))}
    </div>
  );
};

export default function ERPModules() {
  const [activeTab, setActiveTab] = useState("academics");
  const [currentSlide, setCurrentSlide] = useState(0);
  // const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const currentModules = modulesData[activeTab as keyof typeof modulesData];
  const slidesToShow = 3;
  const totalSlides = Math.ceil(currentModules.length / slidesToShow);

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovering, totalSlides]);

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
                className={`relative group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${isActive
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
