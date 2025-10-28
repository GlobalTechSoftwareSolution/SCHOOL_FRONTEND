"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 text-center overflow-hidden px-6">
      {/* Animated Soft Background Orbs */}
      <motion.div
        className="absolute -top-24 -left-32 w-[28rem] h-[28rem] bg-blue-300 rounded-full mix-blend-multiply blur-3xl opacity-40"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[26rem] h-[26rem] bg-purple-300 rounded-full mix-blend-multiply blur-3xl opacity-40"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Hero Title */}
      <motion.h1
        className="text-5xl md:text-7xl font-extrabold text-blue-900 mb-6 leading-tight drop-shadow-sm"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Welcome to{" "}
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600">
          Smart School Portal
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-gray-700 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        Streamline academics, communication, and performance — empowering
        students, teachers, and administrators to connect and grow together.
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-wrap justify-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Link
          href="/about  "
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          🎓 About Us
        </Link>

        <Link
          href="/login"
          className="bg-purple-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          🌟 Explore More
        </Link>
      </motion.div>

      {/* Gentle fade overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 pointer-events-none" />
    </section>
  );
};

export default Hero;
