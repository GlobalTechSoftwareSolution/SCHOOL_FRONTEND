"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  FileText,
  TrendingUp,
  BarChart2,
  DollarSign,
  Wallet,
  Clock,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Fees = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20 bg-gradient-to-br from-green-50 via-white to-emerald-100 px-6 md:px-20 py-16 text-gray-900">
      {/* Header */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center text-emerald-700 mb-4"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        💰 SchoolERP System – Fee Management Module
      </motion.h1>

      <motion.p
        className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        The <strong>Fee Management Module</strong> simplifies and automates all
        financial operations related to student fees. It ensures seamless
        payment processing, instant receipt generation, transparent dues
        tracking, and integrated reporting — making fee collection completely
        paperless and error-free.
      </motion.p>

      {/* Key Features */}
      <motion.section
        className="grid md:grid-cols-2 gap-8 mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            icon: <CreditCard className="text-emerald-600" size={28} />,
            title: "Online Payments",
            desc: "Enable parents to pay fees online securely through integrated payment gateways like Razorpay, Paytm, or Stripe with real-time confirmation.",
          },
          {
            icon: <BarChart2 className="text-emerald-600" size={28} />,
            title: "Fee Dashboard",
            desc: "Get a comprehensive view of total collection, outstanding dues, and payment trends on a visually rich dashboard updated in real-time.",
          },
          {
            icon: <FileText className="text-emerald-600" size={28} />,
            title: "Receipt Generation",
            desc: "Generate instant, customizable digital receipts after every successful payment and send them via email or SMS automatically.",
          },
          {
            icon: <DollarSign className="text-emerald-600" size={28} />,
            title: "Dues Tracking",
            desc: "Easily track pending dues, categorize them by class, student, or term, and send automated reminders to parents for overdue payments.",
          },
          {
            icon: <Wallet className="text-emerald-600" size={28} />,
            title: "Multi-Mode Payments",
            desc: "Supports multiple payment options — UPI, Credit/Debit cards, Bank Transfers, and Cash — all tracked within the same system.",
          },
          {
            icon: <TrendingUp className="text-emerald-600" size={28} />,
            title: "Analytics & Reports",
            desc: "Generate comprehensive financial analytics including income reports, fee defaulters, and term-wise performance metrics.",
          },
          {
            icon: <Clock className="text-emerald-600" size={28} />,
            title: "Automated Fee Reminders",
            desc: "Reduce manual work with automated SMS and email alerts for upcoming or overdue payments based on configurable timelines.",
          },
          {
            icon: <CheckCircle className="text-emerald-600" size={28} />,
            title: "Zero Error Reconciliation",
            desc: "Automatic matching of payments with student records eliminates manual entry errors and ensures 100% data accuracy.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center gap-3 mb-3">
              {item.icon}
              <h3 className="text-lg font-semibold text-emerald-700">
                {item.title}
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Integration Section */}
      <motion.section
        className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-emerald-800">
          🔗 Integration with Other Modules
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            Integrated with the <strong>Student Information System</strong> to
            automatically fetch student details and fee categories.
          </li>
          <li>
            Linked to the <strong>Accounts Module</strong> for real-time
            financial reporting and ledger synchronization.
          </li>
          <li>
            Connected with the <strong>Parent Portal</strong> for secure online
            payment access and fee reminders.
          </li>
          <li>
            Integrated with the <strong>Notification Module</strong> to send
            payment confirmations and due reminders.
          </li>
        </ul>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-emerald-800">
          ✅ Key Benefits
        </h2>
        <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-gray-700">
          <li>Completely paperless and error-free payment processing.</li>
          <li>Improved transparency and accuracy in collections.</li>
          <li>Quick reconciliation between bank and ERP data.</li>
          <li>Enhanced parent convenience with multiple payment modes.</li>
          <li>Instant, secure receipt generation and reporting.</li>
        </ul>
      </motion.section>

      {/* Example Use Case */}
      <motion.section
        className="bg-emerald-50 p-6 rounded-2xl shadow-md border border-gray-100 mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-3 text-emerald-800">
          🏫 Example Use Case
        </h2>
        <p className="text-gray-700 leading-relaxed">
          - <strong>Admin</strong> defines term-wise fee structure.   <br />
          - <strong>Parents</strong> make secure online payments through the portal.  <br />
          - <strong>System</strong> auto-generates receipts and updates records.  <br />
          - <strong>Reports</strong> show daily collections and outstanding dues.   
        </p>
      </motion.section>

      {/* Conclusion */}
      <motion.section
        className="text-center"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">
          🚀 Conclusion
        </h2>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
          The <strong>Fee Management Module</strong> ensures a seamless and
          transparent fee collection process. It minimizes manual intervention,
          improves financial control, and guarantees 100% accuracy with
          real-time insights into school revenue.
        </p>
      </motion.section>
    </div>  
    <Footer />
    </>
  );
};

export default Fees;
