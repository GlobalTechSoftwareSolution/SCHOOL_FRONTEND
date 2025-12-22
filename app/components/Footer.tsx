"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Facebook, 
  Instagram, 
  Youtube,
  Mail, 
  Phone, 
  MapPin,
  ArrowUp,
  Globe
} from "lucide-react";

const Footer = () => {

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerSections = [
    {
      title: "Academics",
      links: [
        { name: "Course Catalog", href: "/footer_links/academics/courses" },
        // { name: "Faculty Directory", href: "/footer_links/academics/faculty" },
        // { name: "Academic Calendar", href: "/footer_links/academics/calendar" },
        { name: "Library Resources", href: "/footer_links/academics/library" }, 
        { name: "Research Programs", href: "/footer_links/academics/research" },
      ]
    },
    {
      title: "Student",
      links: [
        { name: "Student Portal", href: "/footer_links/student_life/student" },
        { name: "Clubs & Organizations", href: "/footer_links/student_life/clubs" },
        { name: "Events & Activities", href: "/footer_links/student_life/events" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/footer_links/support/help" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61576624472044", color: "hover:text-blue-600" },
    { icon: Instagram, href: "https://www.instagram.com/globaltechsoftwaresolutions00/?next=%2F", color: "hover:text-pink-600" },
    { icon: Youtube, href: "https://www.youtube.com/@Globaltech-softwaresolutions", color: "hover:text-red-700" },
  ];

  const contactInfo = [
    { icon: Phone, text: "+91 8495862494" },
    { icon: Mail, text: "tech@globaltechsoftwaresolutions.com" },
    { icon: MapPin, text: "No 10, 4th Floor, Gaduniya Complex, Ramaiah Layout, Vidyaranyapura, Bangalore - 560097" },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 bg-white rounded-2xl p-2 shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Image
                        src="/school-logo.png"
                        alt="School Logo"
                        width={100}
                        height={100}
                        />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Smart School Excellence Portal
                  </h2>
                  <p className="text-blue-200 text-sm font-medium">
                    Shaping Future Leaders
                  </p>
                </div>
              </div>

              <p className="text-blue-100 leading-relaxed max-w-md">
                Premier educational institution committed to academic excellence, 
                innovation, and holistic development. Empowering students to achieve 
                their fullest potential in a dynamic learning environment.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-blue-100"
                  >
                    <item.icon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex gap-4 pt-4">
                {socialLinks.map((social, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={social.href}
                      target="_blank"
                      className={`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/20 backdrop-blur-sm ${social.color}`}
                    >
                      <social.icon className="w-5 h-5" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {footerSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: (sectionIndex * 0.2) + (linkIndex * 0.05) }}
                      >
                        <Link
                          href={link.href}
                          className="text-blue-100 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2 group"
                        >
                          <div className="w-1 h-1 bg-blue-400 rounded-full group-hover:scale-150 transition-transform" />
                          {link.name}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-blue-200">
              <span>© {new Date().getFullYear()} Smart School Excellence Portal. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <div className="flex items-center gap-3 text-sm">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition backdrop-blur-sm"
                >
                  <Globe className="w-4 h-4" />
                  English
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={scrollToTop}
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300"
                >
                  <ArrowUp className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
