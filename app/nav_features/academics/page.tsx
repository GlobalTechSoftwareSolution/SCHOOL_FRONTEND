"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Academics = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  const sections = [
    {
      title: "Overview",
      subtitle: "Digital Academic Excellence",
      content: "Transform your educational institution with our comprehensive Academic Management Module. Streamline curriculum planning, class scheduling, attendance tracking, and performance analytics in one unified platform.",
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      features: ["Centralized Control", "Real-time Analytics", "Paperless Operations"]
    },
    {
      title: "Core Features",
      subtitle: "Powerful Academic Tools",
      features: [
        { icon: "📚", title: "Curriculum Management", desc: "Design and manage comprehensive syllabi with learning objectives" },
        { icon: "👥", title: "Class Management", desc: "Organize classes, sections, and student enrollments efficiently" },
        { icon: "⏰", title: "Smart Timetabling", desc: "AI-powered schedule generation with conflict resolution" },
        { icon: "📊", title: "Performance Analytics", desc: "Track student progress with detailed insights and reports" },
        { icon: "📝", title: "Exam Management", desc: "Conduct online/offline assessments with automated grading" },
        { icon: "✅", title: "Attendance Tracking", desc: "Monitor attendance with biometric integration and alerts" }
      ],
      image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    },
    {
      title: "User Roles",
      subtitle: "Tailored Access for Everyone",
      roles: [
        { role: "Admin", access: "Full system control and configuration", icon: "🔧" },
        { role: "Teachers", access: "Class management, grading, and attendance", icon: "👨‍🏫" },
        { role: "Students", access: "View schedules, submit assignments, check grades", icon: "🎓" },
        { role: "Parents", access: "Monitor child's progress and attendance", icon: "👨‍👩‍👧‍👦" }
      ],
      image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    },
    {
      title: "Benefits",
      subtitle: "Why Choose Our System",
      benefits: [
        "Increase operational efficiency by 60%",
        "Reduce paperwork and administrative costs",  
        "Improve parent-teacher communication",
        "Enhance student performance tracking",
        "Ensure data security and compliance"
      ],
      image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    },
    {
      title: "Integration",
      subtitle: "Seamless System Connectivity",
      integrations: [
        "Student Information System",
        "Fee Management Module", 
        "Library Management",
        "Communication Platforms",
        "Online Learning Tools"
      ],
      image: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <motion.div
          className="relative h-screen flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0">
            <Image
              src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
              alt="Digital Academic Excellence"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-slate-900/80"></div>
          </div>
          
          <motion.div
            className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Academic Management
              <span className="block text-3xl md:text-5xl text-blue-300 mt-2">
                Redefined for Excellence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Empower educators, engage students, and delight parents with our comprehensive academic ecosystem
            </p>
            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Link href="/signup">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl">
                Start Free Trial
              </button>
              </Link>
              
              <Link href="/signup">
              <button className="px-8 py-4 bg-white/20 backdrop-blur hover:bg-white/30 rounded-full font-semibold text-lg transition-all border border-white/30">
                Watch Demo
              </button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Sections */}
        {sections.map((section, index) => (
          <motion.section
            key={index}
            className={`py-20 px-6 ${index % 2 === 0 ? 'bg-white' : 'bg-gradient-to-r from-blue-50 to-slate-50'}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          >
            <div className="max-w-7xl mx-auto">
              <div className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'md:col-start-2' : ''}>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative"
                  >
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-20"></div>
                    <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
                      <Image
                        src={section.image}
                        alt={section.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </motion.div>
                </div>
                
                <div className={index % 2 === 1 ? 'md:col-start-1' : ''}>
                  <motion.div
                    initial={{ x: index % 2 === 1 ? -50 : 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                      {section.title}
                    </h2>
                    <p className="text-xl text-blue-600 font-semibold mb-6">
                      {section.subtitle}
                    </p>
                    
                    {section.content && (
                      <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        {section.content}
                      </p>
                    )}

                    {section.features && (
                      <div className="space-y-4">
                        {section.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {typeof feature === 'object' ? (
                                <span className="text-2xl">{feature.icon}</span>
                              ) : (
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              {typeof feature === 'object' ? (
                                <>
                                  <h4 className="font-semibold text-slate-900 text-lg">{feature.title}</h4>
                                  <p className="text-slate-600">{feature.desc}</p>
                                </>
                              ) : (
                                <p className="text-slate-700 font-medium">{feature}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.roles && (
                      <div className="grid grid-cols-2 gap-6">
                        {section.roles.map((role, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white p-6 rounded-xl shadow-lg border border-slate-100"
                          >
                            <div className="text-3xl mb-3">{role.icon}</div>
                            <h4 className="font-bold text-slate-900 mb-2">{role.role}</h4>
                            <p className="text-sm text-slate-600">{role.access}</p>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {section.benefits && (
                      <div className="space-y-3">
                        {section.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-slate-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.integrations && (
                      <div className="flex flex-wrap gap-3">
                        {section.integrations.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>
        ))}

      </div>
      <Footer />
    </>
  );
};

export default Academics;
