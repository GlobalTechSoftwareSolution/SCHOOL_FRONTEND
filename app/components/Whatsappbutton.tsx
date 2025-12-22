"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";

const WhatsappButton = () => {
  const whatsappNumber = "8495862494";
  const whatsappMessage = "Hello! I'd like to know more about SchoolERP.";

  return (
    <div>
      <div className="fixed right-6 bottom-56 flex flex-col gap-4 z-50">
        
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
          {/* REAL WHATSAPP SVG ICON */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M20.52 3.48A11.78 11.78 0 0 0 12 0C5.37 0 0 5.37 0 12a11.9 11.9 0 0 0 1.64 6L0 24l6.34-1.64A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 21.6c-1.86 0-3.66-.52-5.22-1.5l-.37-.22-3.76.98 1-3.66-.24-.38A9.53 9.53 0 0 1 2.4 12c0-5.28 4.32-9.6 9.6-9.6 2.56 0 4.97 1 6.78 2.82A9.45 9.45 0 0 1 21.6 12c0 5.28-4.32 9.6-9.6 9.6zm5.28-7.22c-.29-.15-1.71-.85-1.98-.95-.27-.1-.47-.15-.67.15-.19.29-.76.95-.93 1.15-.17.19-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.44-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.67-1.63-.92-2.23-.24-.58-.48-.5-.67-.51-.17-.01-.36-.01-.56-.01-.19 0-.51.07-.78.36-.27.29-1.02.99-1.02 2.42s1.05 2.81 1.2 3.01c.15.19 2.07 3.16 5.02 4.44.7.3 1.25.48 1.68.62.7.22 1.33.19 1.83.12.56-.07 1.71-.7 1.95-1.38.24-.67.24-1.24.17-1.38-.07-.15-.27-.24-.56-.38z" />
          </svg>
        </motion.a>

        {/* Phone Button */}
        <motion.a
          href="tel:+918495862494"
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.15 }}
        >
          <Phone size={26} />
        </motion.a>
      </div>
    </div>
  );
};

export default WhatsappButton;
