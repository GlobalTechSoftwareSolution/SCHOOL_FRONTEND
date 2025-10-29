"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  BarChart2,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Wallet,
  ClipboardList,
  CheckCircle,
  Layers,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Accounting = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-6 md:px-20 py-16 text-gray-900">
      {/* Header */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center text-indigo-700 mb-4"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        🧾 SchoolERP System – Financial Accounting Module
      </motion.h1>

      <motion.p
        className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        The <strong>Financial Accounting Module</strong> empowers schools to
        maintain full financial transparency and control. It supports
        user-defined ledgers, real-time transaction tracking, automated reports,
        and audit-ready data — ensuring precise, compliant, and customizable
        accounting operations.
      </motion.p>

      {/* Feature Grid */}
      <motion.section
        className="grid md:grid-cols-2 gap-8 mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            icon: <Layers className="text-indigo-600" size={28} />,
            title: "Custom Ledgers & Groups",
            desc: "Create user-defined ledgers for departments, funds, or projects. Categorize income, expenses, and assets under flexible ledger groups for granular financial management.",
          },
          {
            icon: <BarChart2 className="text-indigo-600" size={28} />,
            title: "Financial Reports",
            desc: "Auto-generate detailed balance sheets, income statements, and cash flow reports with real-time accuracy and export options (PDF/Excel).",
          },
          {
            icon: <ClipboardList className="text-indigo-600" size={28} />,
            title: "Transaction Tracking",
            desc: "Record, monitor, and reconcile every financial transaction — including fees, salaries, vendor payments, and departmental expenditures.",
          },
          {
            icon: <ShieldCheck className="text-indigo-600" size={28} />,
            title: "Audit Trail",
            desc: "Maintain a tamper-proof record of all financial activities, including timestamps, approvals, and user actions for audit compliance.",
          },
          {
            icon: <Wallet className="text-indigo-600" size={28} />,
            title: "Expense & Revenue Management",
            desc: "Compare income vs. expenses by category and department to identify financial trends, budget deviations, and optimization opportunities.",
          },
          {
            icon: <FileText className="text-indigo-600" size={28} />,
            title: "Automated Vouchers",
            desc: "Generate journal entries and vouchers automatically for daily financial operations — simplifying bookkeeping and reducing manual effort.",
          },
          {
            icon: <TrendingUp className="text-indigo-600" size={28} />,
            title: "Budget Planning & Forecasting",
            desc: "Define yearly budgets, monitor utilization, and forecast financial health based on historical trends and predictive analytics.",
          },
          {
            icon: <CheckCircle className="text-indigo-600" size={28} />,
            title: "Regulatory Compliance",
            desc: "Ensure adherence to institutional and governmental accounting standards through standardized data entry and financial reporting formats.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center gap-3 mb-3">
              {feature.icon}
              <h3 className="text-lg font-semibold text-indigo-700">
                {feature.title}
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Integration */}
      <motion.section
        className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
          🔗 Integration with Other Modules
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            Linked to the <strong>Fee Management Module</strong> for
            auto-posting of collected fees and dues reconciliation.
          </li>
          <li>
            Integrated with <strong>Payroll Management</strong> to automate
            salary disbursements and expense entries.
          </li>
          <li>
            Connected with the <strong>Inventory Module</strong> to track
            purchase orders, asset depreciation, and stock valuation.
          </li>
          <li>
            Synced with the <strong>Admin Dashboard</strong> for high-level
            budget visibility and approval workflows.
          </li>
        </ul>
      </motion.section>

      {/* Benefits */}
      <motion.section
        className="mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
          ✅ Key Benefits
        </h2>
        <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-gray-700">
          <li>100% financial transparency and accuracy.</li>
          <li>Faster audits with detailed activity logs.</li>
          <li>Automated ledger updates and reconciliation.</li>
          <li>Streamlined approvals and paperless workflow.</li>
          <li>Customizable financial reports for every stakeholder.</li>
        </ul>
      </motion.section>

      {/* Example Use Case */}
      <motion.section
        className="bg-indigo-50 p-6 rounded-2xl shadow-md border border-gray-100 mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-3 text-indigo-800">
          🏫 Example Use Case
        </h2>
        <p className="text-gray-700 leading-relaxed">
          - <strong>Admin</strong> sets up departmental ledgers and defines budget limits.  <br />
          - <strong>Accountant</strong> records all daily financial transactions.   <br />
          - <strong>System</strong> auto-generates ledgers, vouchers, and financial reports.  <br />
          - <strong>Auditors</strong> review the audit trail for accuracy and compliance. 
        </p>
      </motion.section>

      {/* Conclusion */}
      <motion.section
        className="text-center"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-indigo-700">
          🚀 Conclusion
        </h2>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
          The <strong>Financial Accounting Module</strong> delivers total
          control over institutional finances — from daily transactions to
          strategic reporting. It combines automation, flexibility, and
          compliance to ensure a robust, transparent, and future-ready financial
          system for educational institutions.
        </p>
      </motion.section>
    </div>
    <Footer />
    </>
  );
};

export default Accounting;
