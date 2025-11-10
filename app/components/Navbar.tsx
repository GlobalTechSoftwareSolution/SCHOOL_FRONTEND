"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  BookOpen,
  Users,
  GraduationCap,
  Settings,
} from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null); // 👈 NEW

  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Activities", href: "/activities" },
    {
      name: "Features",
      href: "/features",
      dropdown: [
        { name: "Academic Management", icon: BookOpen, href: "/nav_features/academics" },
        { name: "Student Portal", icon: GraduationCap, href: "/nav_features/students" },
        { name: "Faculty Hub", icon: Users, href: "/nav_features/faculty" },
      ],
    },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        hasScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-100/50"
          : "bg-gradient-to-r from-blue-50/95 via-white/95 to-indigo-50/95 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-4 group"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <Image
                src="/school-logo.png"
                alt="EduSmart Logo"
                width={65}
                height={65}
                priority
                className="rounded-2xl border-2 border-white/20 shadow-2xl"
              />
            </motion.div>
            <div className="flex flex-col">
              <motion.h1
                className="text-4xl font-black bg-gradient-to-r from-blue-700 via-purple-600 to-blue-800 bg-clip-text text-transparent tracking-tight"
                whileHover={{ scale: 1.02 }}
              >
                Smart School
              </motion.h1>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.div
                key={item.name}
                className="relative"
                onHoverStart={() => setActiveDropdown(item.name)}
                onHoverEnd={() => setActiveDropdown(null)}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1"
                >
                  <Link
                    href={item.href}
                    className="relative px-4 py-3 text-[16px] font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300 group"
                  >
                    {item.name}
                    {item.dropdown && (
                      <ChevronDown className="w-4 h-4 ml-1 inline-block transition-transform duration-300 group-hover:rotate-180" />
                    )}
                    <span className="absolute left-4 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-[calc(100%-2rem)]"></span>
                  </Link>
                </motion.div>

                {/* Desktop Dropdown */}
                <AnimatePresence>
                  {item.dropdown && activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 mt-2 overflow-hidden"
                    >
                      <div className="p-2">
                        {item.dropdown.map((dropdownItem, index) => (
                          <motion.div
                            key={dropdownItem.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                          >
                            <Link
                              href={dropdownItem.href}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300 group"
                            >
                              <dropdownItem.icon className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                              <span className="font-medium text-[15px]">
                                {dropdownItem.name}
                              </span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Login Button */}
            <Link href="/login">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  background:
                    "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #06B6D4 100%)",
                }}
                whileTap={{ scale: 0.95 }}
                className="ml-4 relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-2xl transition-all duration-500 overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Login Portal
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
              </motion.button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <motion.div
            className="lg:hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                isMenuOpen
                  ? "bg-blue-100 text-blue-600 shadow-inner"
                  : "bg-white/80 text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-lg"
              }`}
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* 📱 Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100/50 shadow-2xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item.dropdown ? (
                      <>
                        {/* Accordion Header */}
                        <button
                          onClick={() =>
                            setOpenMobileDropdown(
                              openMobileDropdown === item.name ? null : item.name
                            )
                          }
                          className="flex items-center justify-between w-full px-4 py-3 text-lg font-semibold text-gray-800 border-l-4 border-blue-500 bg-blue-50/50 rounded-xl"
                        >
                          <span>{item.name}</span>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform duration-300 ${
                              openMobileDropdown === item.name
                                ? "rotate-180 text-blue-600"
                                : "text-gray-500"
                            }`}
                          />
                        </button>

                        {/* Accordion Content */}
                        <AnimatePresence>
                          {openMobileDropdown === item.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="ml-6 mt-2 space-y-1 overflow-hidden"
                            >
                              {item.dropdown.map((dropdownItem) => (
                                <Link
                                  key={dropdownItem.name}
                                  href={dropdownItem.href}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300 group"
                                >
                                  <dropdownItem.icon className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                  <span className="font-medium">
                                    {dropdownItem.name}
                                  </span>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-lg font-semibold text-gray-800 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-300 group border-l-4 border-transparent hover:border-blue-500"
                      >
                        {item.name}
                      </Link>
                    )}
                  </motion.div>
                ))}

                {/* Mobile Login Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  className="pt-4 border-t border-gray-200/50 mt-4"
                >
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center justify-center gap-3"
                    >
                      <Users className="w-6 h-6" />
                      Access Login Portal
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
 