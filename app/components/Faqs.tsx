"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is the Smart School ERP System?",
    answer:
      "Smart School ERP is a comprehensive management system designed to streamline daily school operations such as attendance, academics, communication, and administration — all from a single platform.",
  },
  {
    question: "How does the ERP system help teachers?",
    answer:
      "Teachers can manage attendance, grade assignments, plan lessons, and communicate with students and parents easily. It saves time and reduces paperwork.",
  },
  {
    question: "Can parents access the portal?",
    answer:
      "Yes, parents have dedicated logins to track their child’s attendance, performance, fee payments, and communication from teachers or administration.",
  },
  {
    question: "Is the ERP system secure?",
    answer:
      "Absolutely. The Smart School ERP uses advanced encryption and secure user authentication to ensure your school’s data is always safe and private.",
  },
  {
    question: "Can the system be customized for our school?",
    answer:
      "Yes, the platform is flexible and can be customized according to your institution’s size, departments, and specific workflows.",
  },
  {
    question: "Is there technical support available?",
    answer:
      "Yes, our dedicated support team is available 24/7 to assist with setup, training, and troubleshooting whenever you need help.",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gradient-to-b from-white via-blue-50 to-indigo-100 py-20 px-6 md:px-20">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.p
          className="text-gray-600 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Get answers to common questions about the Smart School ERP platform.
        </motion.p>
      </div>

      <div className="max-w-3xl mx-auto space-y-5">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-blue-700 focus:outline-none"
            >
              {faq.question}
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-blue-700" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="px-6 pb-4 text-gray-600 text-base"
                >
                  {faq.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
