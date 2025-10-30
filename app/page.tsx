"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Navbar from "@/app/components/Navbar"; 
import Hero from "@/app/components/Hero";
import Erpmodules from "@/app/components/Erpmodules";
import Faqs from '@/app/components/Faqs'
import Personalizedportals from  '@/app/components/Personalizedportals'
import Featuresshowcase from '@/app/featuresshowcase/page'
import Whatsappbutton from '@/app/components/Whatsappbutton'
import Footer from "@/app/components/Footer";

export default function Page() {
  const [stage, setStage] = useState<"splash" | "white" | "main">("splash");

  useEffect(() => {
    const splashTimer = setTimeout(() => setStage("white"), 2500); // after 2.5s → fade white
    const mainTimer = setTimeout(() => setStage("main"), 3200); // after 3.2s → show main

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(mainTimer);
    };
  }, []);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {stage === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ scale: 1.5 }}
            exit={{ opacity: 0, scale: 3, transition: { duration: 0.8 } }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-purple-100"
          >
            <Image
            src="/school-logo.png"
            alt="School Logo"
            width={120}
            height={120}
            className="animate-bounce rounded-full shadow-lg"
            unoptimized
          />

            <motion.p
              className="mt-4 text-lg text-gray-600 animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Loading School Portal...
            </motion.p>
          </motion.div>
        )}

        {stage === "white" && (
          <motion.div
            key="white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white z-50"
          />
        )}

        {stage === "main" && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen bg-gray-50"
          >
            <Navbar />
            <Hero />
            <Erpmodules />
            <Personalizedportals />
            <Featuresshowcase />
            <Faqs />
            <Whatsappbutton />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
