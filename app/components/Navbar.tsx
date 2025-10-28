"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-50">
      {/* Left Section (Logo + Title) */}
      <div className="flex items-center gap-3">
        <Image
          src="/school-logo.png"
          alt="Logo"
          width={42}
          height={42}
          priority
          className="rounded-full"
        />
        <h1 className="text-2xl font-extrabold text-blue-700 tracking-wide">
          School Portal
        </h1>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-lg font-medium text-gray-700">
        <Link href="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <Link href="/about" className="hover:text-blue-600 transition">
          About
        </Link>
        <Link href="/features" className="hover:text-blue-600 transition">
          Features
        </Link>
        <Link href="/contact" className="hover:text-blue-600 transition">
          Contact
        </Link>

        <Link href="/login">
          <button className="ml-4 bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-blue-700 transition text-sm font-semibold">
            🔐 Login
          </button>
        </Link>
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="text-gray-700 hover:text-blue-600 transition"
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

   {/* 🌐 Mobile Dropdown Menu */}
<AnimatePresence>
  {isMenuOpen && (
    <motion.nav
      key="mobile-menu"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute top-16 left-0 w-full bg-white shadow-lg rounded-b-2xl md:hidden z-50 overflow-hidden"
    >
      <div className="flex flex-col items-start gap-3 py-5 px-6 text-gray-700 font-medium">
        {[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
          { name: "Features", href: "/features" },
          { name: "Contact", href: "/contact" },
        ].map((link) => (
          <Link
            key={link.name}
            href={link.href}
            onClick={() => setIsMenuOpen(false)}
            className="w-full text-left hover:text-blue-600 transition-colors duration-200"
          >
            {link.name}
          </Link>
        ))}

        <div className="w-full flex justify-center mt-2">
          <Link href="/login" onClick={() => setIsMenuOpen(false)}>
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 text-sm font-semibold flex items-center gap-1">
              🔐 Login
            </button>
          </Link>
        </div>
      </div>
    </motion.nav>
  )}
</AnimatePresence>

    </header>
  );
};

export default Navbar;
