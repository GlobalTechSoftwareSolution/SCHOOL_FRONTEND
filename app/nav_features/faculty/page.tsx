"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Faculty = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  const sections = [
    {
      title: "Overview",
      subtitle: "Empowering Educational Excellence",
      content: "Experience the future of teaching with our comprehensive Faculty Hub. A centralized digital workspace designed exclusively for educators, enabling efficient management of classes, attendance, assignments, examinations, and student communication - all through one powerful, intuitive interface.",
      image: "https://images.pexels.com/photos/1181539/pexels-photo-1181539.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      features: ["Centralized Workspace", "Streamlined Operations", "Enhanced Teaching Quality"]
    },
    {
      title: "Key Features",
      subtitle: "Comprehensive Faculty Tools",
      features: [
        { icon: "📚", title: "Faculty Dashboard", desc: "Personalized dashboard showing daily schedule, announcements, and pending tasks" },
        { icon: "🗂️", title: "Class Management", desc: "Manage assigned classes, upload materials, and create structured lesson plans" },
        { icon: "📋", title: "Attendance System", desc: "Mark attendance daily or period-wise with automated absence alerts" },
        { icon: "🧮", title: "Assessment Hub", desc: "Create, schedule, and grade online/offline examinations efficiently" },
        { icon: "📝", title: "Assignment Tracking", desc: "Assign and grade homework digitally with detailed feedback" },
        { icon: "🧠", title: "Lesson Planning", desc: "Prepare structured weekly or monthly lesson plans with resources" }
      ],
      image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    },
    {
      title: "Communication & Analytics",
      subtitle: "Connected Teaching Environment",
      features: [
        { icon: "🗓️", title: "Smart Scheduling", desc: "View and manage personalized schedules with real-time substitutions" },
        { icon: "💬", title: "Communication Hub", desc: "Send announcements, messages, and participate in discussions" },
        { icon: "📊", title: "Performance Tracking", desc: "Analyze student progress and provide data-driven improvements" },
        { icon: "🧑‍💼", title: "Profile Management", desc: "Manage personal details, workload, and HR integrations seamlessly" }
      ],
      image: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    },
    {
      title: "User Roles & Access",
      subtitle: "Tailored Access for Faculty",
      roles: [
        { role: "Teacher", access: "Manage attendance, grading, assignments, and communication", icon: "👨‍🏫" },
        { role: "HOD / Coordinator", access: "Approve schedules, monitor performance, and manage reports", icon: "🎓" },
        { role: "Admin", access: "Assign subjects, manage teacher records, and access analytics", icon: "🔧" },
        { role: "Principal", access: "Evaluate faculty efficiency and oversee department performance", icon: "👔" }
      ],
      image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    },
    {
      title: "System Integration",
      subtitle: "Seamless Academic Connectivity",
      integrations: [
        "Academic Management Module (curriculum & exams)",
        "Student Portal (assignments & grades)",
        "Attendance Management (class tracking)",
        "Communication System (messaging & notifications)",
        "Learning Management System (e-learning & assessments)"
      ],
      image: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    },
    {
      title: "Reports & Analytics",
      subtitle: "Data-Driven Teaching Insights",
      benefits: [
        "Attendance Report (Class-wise / Subject-wise)",
        "Student Performance Report with trend analysis",
        "Assignment Submission Statistics and completion rates",
        "Faculty Workload Report for optimal resource allocation",
        "Departmental Performance Dashboard",
        "Academic Progress vs. Syllabus Coverage metrics"
      ],
      image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    },
    {
      title: "Benefits",
      subtitle: "Why Faculty Choose Our Hub",
      benefits: [
        "Unified digital workspace for all faculty operations",
        "Significant reduction in manual work and paperwork",
        "Real-time visibility of student performance and engagement",
        "Enhanced communication between all stakeholders",
        "Promotes organized and strategic lesson planning",
        "Fosters accountability and complete transparency"
      ],
      image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        {/* Hero Section */}
        <motion.div
          className="relative h-screen flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0">
            <Image
              src="https://images.pexels.com/photos/1181539/pexels-photo-1181539.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
              alt="Faculty Hub"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-slate-900/80"></div>
          </div>
          
          <motion.div
            className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Faculty Hub
              <span className="block text-3xl md:text-5xl text-indigo-300 mt-2">
                Empowering Educational Excellence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your teaching experience with a comprehensive digital workspace designed for modern educators
            </p>
            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Link href="/signup">
              <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl">
                Access Faculty Hub
              </button>
              </Link>

              <Link href="/signup">
              <button className="px-8 py-4 bg-white/20 backdrop-blur hover:bg-white/30 rounded-full font-semibold text-lg transition-all border border-white/30">
                Explore Features
              </button>
              </Link>

            </motion.div>
          </motion.div>
        </motion.div>

        {/* Sections */}
        {sections.map((section, index) => (
          <motion.section
            key={index}
            className={`py-20 px-6 ${index % 2 === 0 ? 'bg-white' : 'bg-gradient-to-r from-indigo-50 to-slate-50'}`}
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
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur-xl opacity-20"></div>
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
                    <p className="text-xl text-indigo-600 font-semibold mb-6">
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
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {typeof feature === 'object' ? (
                                <span className="text-2xl">{feature.icon}</span>
                              ) : (
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                    {section.integrations && (
                      <div className="flex flex-wrap gap-3">
                        {section.integrations.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                          >
                            {item}
                          </span>
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
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>
        ))}

        {/* CTA Section */}
        <motion.section
          className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Teaching Experience?
            </h2>
            <p className="text-xl mb-8 text-indigo-100">
              Join thousands of educators already excelling with our intelligent faculty hub
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-indigo-600 hover:bg-indigo-50 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl">
                Get Started Now
              </button>
              <button className="px-8 py-4 bg-white/20 backdrop-blur hover:bg-white/30 rounded-full font-semibold text-lg transition-all border border-white/30">
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.section>
      </div>
      <Footer />
    </>
  );
};

export default Faculty;
