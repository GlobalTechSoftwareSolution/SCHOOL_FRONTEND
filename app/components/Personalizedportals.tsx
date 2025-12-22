"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  UserCheck
} from "lucide-react";

const portals = [
  {
    title: "Admin Portal",
    icon: ShieldCheck,
    description: "Run your institute—or group of institutes—from the palm of your hand. Access all administrative data from a single dashboard without switching between tabs or files.",
    features: ["Multi-institute Management", "Real-time Analytics", "Automated Reporting", "Role-based Access"],
    stats: "Centralized Control",
    gradient: "from-blue-500 to-cyan-500",
    delay: 0.1
  },
  {
    title: "Faculty Portal",
    icon: Users,
    description: "Enable faculty to easily manage schedules, lesson plans, and mark sheets. Collaborate with colleagues and track student performance seamlessly.",
    features: ["Smart Scheduling", "Grade Management", "Collaboration Tools", "Performance Tracking"],
    stats: "Enhanced Productivity",
    gradient: "from-green-500 to-emerald-500",
    delay: 0.2
  },
  {
    title: "Student Portal",
    icon: GraduationCap,
    description: "Students can instantly download study materials, view academic updates, and submit course feedback—all from one easy-to-use dashboard.",
    features: ["Digital Library", "Progress Tracking", "Assignment Submission", "Course Feedback"],
    stats: "360° Learning",
    gradient: "from-purple-500 to-pink-500",
    delay: 0.3
  },
  {
    title: "Parent Portal",
    icon: UserCheck,
    description: "Parents can stay informed about their child's progress, attendance, and events, as well as make secure payments directly through the portal.",
    features: ["Progress Monitoring", "Fee Payments", "Event Calendar", "Direct Communication"],
    stats: "Complete Visibility",
    gradient: "from-orange-500 to-red-500",
    delay: 0.4
  },
];

const stats = [
  { number: "95%", label: "User Satisfaction" },
  { number: "24/7", label: "Accessibility" },
  { number: "99.9%", label: "Uptime" },
  { number: "50K+", label: "Active Users" }
];

export default function PersonalizedPortals() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg mb-6 border border-gray-100">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">PERSONALIZED PORTALS</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Tailored Digital Experiences
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Customized portals designed for every stakeholder in the educational ecosystem. 
            <span className="font-semibold text-blue-600"> Stay connected, stay empowered.</span>
          </p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {portals.map((portal, index) => {
            const Icon = portal.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: portal.delay }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                <div className="relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col overflow-hidden">
                  
                  {/* Icon Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-r ${portal.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        delay: index * 0.5
                      }}
                      className="w-3 h-3 bg-green-400 rounded-full"
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
                    {portal.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-4 flex-grow">
                    {portal.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {portal.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: portal.delay + featureIndex * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${portal.gradient}`}></div>
                        <span className="text-xs text-gray-600 font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Hover Effect */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${portal.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}