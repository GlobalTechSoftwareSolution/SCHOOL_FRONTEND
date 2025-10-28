"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden px-6"
    >
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/hero.jpeg')`,
          filter: "blur(6px) brightness(0.6)", // soft blur & darken
          transform: "scale(1.05)",
        }}
      />

      {/* Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60" />

      {/* Hero Content */}
      <motion.div
        className="relative z-10 text-white"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-lg">
          Welcome to
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
            Smart School Portal
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Streamline academics, communication, and performance — empowering
          students, teachers, and administrators to connect and grow together.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="/about"
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-blue-700 shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            About Us
          </Link>

          <Link
            href="/login"
            className="bg-purple-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            Explore More
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
