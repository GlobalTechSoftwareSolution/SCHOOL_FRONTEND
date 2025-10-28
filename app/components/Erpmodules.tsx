"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Settings, 
  MessageSquare,
  ArrowRight,
  Shield,
  BarChart3,
  Clock,
  CheckCircle,
  Play
} from "lucide-react";

const tabs = [
  { 
    id: "academics", 
    label: "Academics", 
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500"
  },
  { 
    id: "administration", 
    label: "Administration", 
    icon: Settings,
    color: "from-green-500 to-emerald-500"
  },
  { 
    id: "finance", 
    label: "Finance", 
    icon: DollarSign,
    color: "from-purple-500 to-pink-500"
  },
  { 
    id: "humanResource", 
    label: "Human Resource", 
    icon: Users,
    color: "from-orange-500 to-red-500"
  },
  { 
    id: "communication", 
    label: "Communication", 
    icon: MessageSquare,
    color: "from-indigo-500 to-blue-500"
  },
];

const modulesData = {
  academics: [
    {
      title: "Student Information System",
      description: "Comprehensive student lifecycle management with advanced analytics and performance tracking.",
      icon: Users,
      features: ["360° Student Profile", "Academic Tracking", "Performance Analytics", "Parent Portal"],
      stats: "98% Accuracy",
      color: "blue"
    },
    {
      title: "Smart Attendance System",
      description: "AI-powered attendance tracking with real-time notifications and predictive analytics.",
      icon: Clock,
      features: ["Biometric Integration", "Real-time Alerts", "Pattern Analysis", "Automated Reports"],
      stats: "99.9% Reliable",
      color: "green"
    },
    {
      title: "Lesson Planning Suite",
      description: "Collaborative lesson planning with curriculum mapping and resource integration.",
      icon: BookOpen,
      features: ["Curriculum Mapping", "Resource Library", "Collaboration Tools", "Progress Tracking"],
      stats: "500+ Templates",
      color: "purple"
    },
    {
      title: "Assignment Management",
      description: "End-to-end assignment workflow from creation to grading and feedback.",
      icon: CheckCircle,
      features: ["Auto-grading", "Plagiarism Check", "Feedback System", "Gradebook Sync"],
      stats: "70% Time Saved",
      color: "orange"
    }
  ],
  administration: [
    {
      title: "Transport Management",
      description: "Intelligent route optimization and real-time vehicle tracking for safety and efficiency.",
      icon: Shield,
      features: ["GPS Tracking", "Route Optimization", "Parent Alerts", "Fuel Management"],
      stats: "40% Cost Reduced",
      color: "blue"
    },
    {
      title: "Library Management",
      description: "Digital library ecosystem with smart cataloging and analytics-driven recommendations.",
      icon: BookOpen,
      features: ["Digital Catalog", "Auto-renewals", "Reading Analytics", "E-book Integration"],
      stats: "2K+ Digital Books",
      color: "green"
    }
  ],
  finance: [
    {
      title: "Fee Management System",
      description: "Automated fee processing with multiple payment gateways and financial reporting.",
      icon: DollarSign,
      features: ["Auto Invoicing", "Multi-payment Gateways", "Tax Compliance", "Financial Reports"],
      stats: "Zero Errors",
      color: "purple"
    },
    {
      title: "Budget Planning & Analytics",
      description: "AI-driven budget forecasting and expense optimization with predictive insights.",
      icon: BarChart3,
      features: ["Predictive Budgeting", "Expense Tracking", "ROI Analysis", "Audit Trail"],
      stats: "95% Accuracy",
      color: "orange"
    }
  ],
  humanResource: [
    {
      title: "Staff Management Hub",
      description: "Complete employee lifecycle management from recruitment to retirement.",
      icon: Users,
      features: ["Recruitment CRM", "Performance Management", "Training Records", "Document Vault"],
      stats: "360° Employee View",
      color: "blue"
    },
    {
      title: "Payroll Automation",
      description: "Seamless payroll processing integrated with attendance and compliance management.",
      icon: DollarSign,
      features: ["Auto-calculation", "Tax Compliance", "Payslip Generation", "Bank Integration"],
      stats: "100% Compliance",
      color: "green"
    }
  ],
  communication: [
    {
      title: "Smart Notification System",
      description: "Multi-channel communication platform with smart routing and analytics.",
      icon: MessageSquare,
      features: ["Multi-channel", "Smart Routing", "Delivery Analytics", "Scheduled Messaging"],
      stats: "99% Delivery Rate",
      color: "purple"
    },
    {
      title: "Announcement Center",
      description: "Centralized announcement system with targeting and engagement tracking.",
      icon: Users,
      features: ["Targeted Messaging", "Engagement Analytics", "Multi-format Support", "Archive System"],
      stats: "85% Open Rate",
      color: "orange"
    }
  ]
};

const colorClasses = {
  blue: { bg: "bg-blue-500", gradient: "from-blue-500 to-cyan-500", text: "text-blue-600" },
  green: { bg: "bg-green-500", gradient: "from-green-500 to-emerald-500", text: "text-green-600" },
  purple: { bg: "bg-purple-500", gradient: "from-purple-500 to-pink-500", text: "text-purple-600" },
  orange: { bg: "bg-orange-500", gradient: "from-orange-500 to-red-500", text: "text-orange-600" }
};

export default function ERPModules() {
  const [activeTab, setActiveTab] = useState("academics");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-blue-600">ERP MODULES</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Comprehensive School Management
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Streamline your institution's operations with our intelligent ERP system. 
            <span className="font-semibold text-blue-600"> 40+ integrated modules </span>
            designed for modern educational excellence.
          </p>
        </motion.div>

        {/* Enhanced Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative group flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-xl`
                    : "bg-white text-gray-700 hover:text-blue-600 shadow-lg hover:shadow-xl"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r border-2 border-white/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Modules Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6"
          >
            {modulesData[activeTab as keyof typeof modulesData].map((module, index) => {
              const Icon = module.icon;
              const colors = colorClasses[module.color as keyof typeof colorClasses];
              
              return (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onHoverStart={() => setHoveredCard(module.title)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="relative group"
                >
                  <div className="relative bg-white rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-100 h-full flex flex-col">
                    
                    {/* Icon Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-r ${colors.gradient} shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        animate={{ 
                          scale: hoveredCard === module.title ? 1 : 0.8,
                          opacity: hoveredCard === module.title ? 1 : 0.5
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${colors.text} bg-blue-50`}
                      >
                        {module.stats}
                      </motion.div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
                      {module.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
                      {module.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {module.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${colors.bg}`}></div>
                          <span className="text-xs text-gray-500 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ x: 5 }}
                      className={`group flex items-center gap-2 text-sm font-semibold ${colors.text} mt-auto pt-4 border-t border-gray-100`}
                    >
                      Explore Module
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>

                    {/* Hover Effect */}
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Transform Your Institution?
            </h3>
            <p className="text-gray-600 mb-6">
              Join 500+ educational institutions using our ERP system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
              >
                <Play className="w-5 h-5" />
                Schedule Demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all border border-blue-200"
              >
                Download Brochure
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}