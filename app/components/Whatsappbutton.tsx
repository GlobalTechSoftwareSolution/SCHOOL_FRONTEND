"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";

const Whatsapp = () => {
  const whatsappNumber = "9844281875";
  const whatsappMessage = "Hello! I’d like to know more about SchoolERP.";

  return (
    <div>
      {/* Floating Buttons (Fixed on right side) */}
      <div className="fixed right-6 bottom-10 flex flex-col gap-4 z-50">
        {/* WhatsApp Button */}
        <motion.a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            whatsappMessage
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.15 }}
        >
          <MessageCircle size={28} />
        </motion.a>

        {/* Phone Button */}
        <motion.a
          href="tel:+919844281875"
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.15 }}
        >
          <Phone size={26} />
        </motion.a>
      </div>
    </div>
  );
};

export default Whatsapp;
