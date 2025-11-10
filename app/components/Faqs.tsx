"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is the Smart School ERP System?",
    answer:
      "Smart School ERP is a comprehensive digital management platform designed to revolutionize educational institutions. It integrates all essential school operations including attendance tracking, grade management, timetable scheduling, fee collection, document management, parent-teacher communication, and administrative workflows into a single, user-friendly system. Our cloud-based solution ensures seamless access from anywhere, anytime, making school management efficient and transparent.",
  },
  {
    question: "How does the ERP system specifically help teachers in their daily tasks?",
    answer:
      "Teachers benefit tremendously through automated attendance marking with biometric integration, digital grade books with instant report generation, smart timetable management, online assignment submission and grading, student performance analytics, document issuance capabilities, and direct messaging with parents. The system reduces paperwork by 80%, saves 2-3 hours daily, and enables teachers to focus more on teaching rather than administrative tasks.",
  },
  {
    question: "What features are available for parents in the parent portal?",
    answer:
      "Parents get comprehensive access to their child's academic journey through real-time attendance alerts, instant grade notifications, detailed progress reports, fee payment history and online payment options, homework and assignment tracking, school circulars and announcements, direct communication with teachers, exam schedules and results, and digital document downloads. Parents receive instant SMS/email notifications for important updates.",
  },
  {
    question: "How secure is our school's data in the ERP system?",
    answer:
      "Security is our top priority. We implement bank-level 256-bit SSL encryption, GDPR-compliant data protection, regular security audits, role-based access control, secure cloud hosting with automatic backups, two-factor authentication for admin accounts, and detailed audit logs. Our system is ISO 27001 certified and complies with educational data privacy regulations. Data is stored in secure, geographically distributed servers.",
  },
  {
    question: "Can the system be customized for our school's specific needs?",
    answer:
      "Absolutely! Our ERP is highly customizable to match your institution's unique requirements. We can customize grading systems (GPA, percentage, marks), attendance policies, fee structures and payment plans, report card formats, timetable templates, curriculum frameworks, examination patterns, and organizational hierarchy. We work closely with your team to ensure the system aligns perfectly with your existing workflows and educational philosophy.",
  },
  {
    question: "What kind of technical support and training do you provide?",
    answer:
      "We offer comprehensive support including 24/7 dedicated support team via phone, email, and chat, on-site training during implementation, detailed video tutorials and documentation, regular webinars for new features, dedicated account manager for each school, rapid response time (under 2 hours for critical issues), and annual system health checks. Our support team understands educational workflows and provides context-aware assistance.",
  },
  {
    question: "How does the attendance management system work?",
    answer:
      "Our attendance system supports multiple methods: biometric integration (fingerprint/face recognition), RFID card scanning, mobile app-based check-in, manual marking with geo-location verification, and automated SMS alerts to parents for absent students. Teachers can mark attendance in under 30 seconds for entire classes, generate monthly/annual attendance reports, identify patterns of absenteeism, and integrate with leave management systems.",
  },
  {
    question: "What financial management features are included?",
    answer:
      "The system includes comprehensive fee management with customizable fee structures, online payment integration with multiple payment gateways, automated fee reminders and receipts, scholarship and discount management, expense tracking and budget planning, financial reporting and analytics, GST compliance for Indian schools, and multi-campus financial consolidation. Parents can pay fees through UPI, credit cards, net banking, or wallet apps.",
  },
  {
    question: "How does the document management system work?",
    answer:
      "Our digital document system allows schools to issue and manage student certificates (conduct, transfer, study, bonafide), mark sheets and report cards, ID cards and admit cards, fee receipts and payment records, achievement certificates and awards, and other official documents. Documents can be generated automatically, digitally signed, and shared via email or downloaded. The system maintains a complete audit trail of all issued documents.",
  },
  {
    question: "Can the system handle multiple branches or campuses?",
    answer:
      "Yes, our ERP is designed for multi-campus operations. Features include centralized administration with branch-level controls, unified student database across campuses, inter-campus transfer capabilities, consolidated reporting for management, branch-specific fee structures and policies, shared resources management, and standardized processes across all locations while maintaining local autonomy where needed.",
  },
  {
    question: "What mobile app features are available?",
    answer:
      "Our mobile apps (iOS and Android) provide push notifications for important updates, offline access to timetables and assignments, QR code-based attendance marking, instant photo/document uploads, GPS-based check-in for staff and students, real-time chat with teachers and parents, exam result notifications, fee payment processing, and access to digital ID cards. The apps work seamlessly even with low internet connectivity.",
  },
  {
    question: "How does the system handle examinations and grading?",
    answer:
      "The examination module supports multiple exam types (unit tests, mid-terms, finals), customizable grading schemes and mark distribution, automated report card generation, grade analysis and comparison tools, exam scheduling and hall allocation, digital question paper management, online examination capabilities, and statistical analysis of results. Teachers can input grades via mobile or web, and parents receive instant notifications when results are published.",
  },
  {
    question: "What are the hardware and infrastructure requirements?",
    answer:
      "Being cloud-based, minimal infrastructure is needed. Requirements include: basic computers with internet access for admin staff, optional biometric devices for attendance, barcode/QR printers for ID cards, and stable internet connection (minimum 2 Mbps). No servers or IT infrastructure is required at your end. The system works on desktop browsers, tablets, and mobile phones. We handle all maintenance, updates, and security patches.",
  },
  {
    question: "How does the pricing work and what's included?",
    answer:
      "We offer flexible pricing based on student strength and features selected. Plans include: all core modules (attendance, grades, fees, communication), unlimited user accounts (students, parents, teachers, staff), mobile apps for all users, regular updates and new features, data backup and security, technical support, and training. No hidden costs - one transparent annual fee. Custom pricing available for large institutions with special requirements.",
  },
  {
    question: "How long does implementation take and what's the process?",
    answer:
      "Implementation typically takes 2-4 weeks depending on school size. Process includes: requirement analysis and customization planning (3-5 days), data migration from existing systems (5-7 days), system configuration and testing (7-10 days), user training for staff and teachers (3-5 days), parent onboarding and orientation (2-3 days), and go-live with support team assistance. We provide a dedicated implementation manager throughout the process.",
  },
  {
    question: "Can we integrate with existing systems we're already using?",
    answer:
      "Yes, we support extensive integrations including: biometric attendance devices, accounting software (Tally, QuickBooks), payment gateways (Paytm, PhonePe, Razorpay), SMS gateways for notifications, email service providers, government education portals, learning management systems, and HR management software. We also provide API access for custom integrations with your existing systems.",
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
