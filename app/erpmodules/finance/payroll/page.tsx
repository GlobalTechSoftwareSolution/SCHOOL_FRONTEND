"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  FileSpreadsheet,
  Wallet,
  FileText,
  TrendingUp,
  ShieldCheck,
  Clock,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Payroll = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const features = [
    {
      icon: <Calculator className="text-blue-600" size={26} />,
      title: "Salary Processing",
      desc: "Handle staff payroll with precision by automating calculations for earnings, deductions, and net pay. Supports different pay structures for teaching and non-teaching staff.",
      image: "/erpmodules/salary_processing.png",
    },
    {
      icon: <FileSpreadsheet className="text-blue-600" size={26} />,
      title: "Component Management",
      desc: "Configure multiple components such as Basic Pay, HRA, Allowances, Deductions, Incentives, and Overtime for each employee category.",
      image: "/erpmodules/Components.png",
    },
    {
      icon: <Wallet className="text-blue-600" size={26} />,
      title: "Tax Calculation",
      desc: "Automatically compute TDS, PF, ESI, and other statutory deductions. Generate tax summary reports and ensure regulatory compliance.",
      image: "/erpmodules/income_tax.png",
    },
    {
      icon: <FileText className="text-blue-600" size={26} />,
      title: "Payslip Generation",
      desc: "Generate digital payslips instantly with detailed breakdowns of salary components. Export in PDF or email directly to employees.",
      image: "/erpmodules/salary_slip.webp",
    },
    {
      icon: <TrendingUp className="text-blue-600" size={26} />,
      title: "Incentive & Bonus Management",
      desc: "Easily define performance-based bonuses, arrears, and one-time adjustments — fully integrated into monthly payroll cycles.",
      image: "/erpmodules/bonus.png",
    },
    {
      icon: <Clock className="text-blue-600" size={26} />,
      title: "Attendance Integration",
      desc: "Syncs with the Attendance Module to adjust salary based on attendance, leave, and overtime records in real-time.",
      image: "/erpmodules/attendance.png",
    },
    {
      icon: <ShieldCheck className="text-blue-600" size={26} />,
      title: "Data Security & Compliance",
      desc: "All payroll data is encrypted, role-restricted, and compliant with institutional and governmental data privacy standards.",
      image: "/erpmodules/data_security.jpg",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen mt-20 bg-white text-gray-900 px-6 md:px-20 py-16 transition-all duration-300">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-3">
            💰 SchoolERP – Payroll Management Module
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            The <strong>Payroll Management Module</strong> automates the entire
            payroll cycle — ensuring accurate salary processing, tax compliance,
            and error-free employee compensation through a secure and efficient
            digital workflow.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.section
          className="grid md:grid-cols-2 gap-8 mb-16"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl border border-gray-200 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
             <div className="overflow-hidden rounded-xl mb-4 bg-white">
  <motion.img
    src={feature.image}
    alt={feature.title}
    className={`w-full h-48 rounded-lg border border-gray-100 shadow-sm transition-transform duration-300 ease-in-out
      ${feature.title === "Salary Processing" ? "object-[50%_40%]" :
        feature.title === "Component Management" ? "object-[40%_60%]" :
        feature.title === "Tax Calculation" ? "object-[50%_60%]" :
        feature.title === "Payslip Generation" ? "object-top" :
        feature.title === "Incentive & Bonus Management" ? "object-[40%_50%]" :
        feature.title === "Attendance Integration" ? "object-center" :
        "object-center"} object-contain`}
    initial={{ scale: 0.9, opacity: 0.95 }}
    whileHover={{ scale: 1.05, opacity: 1 }}
    transition={{ duration: 0.4 }}
  />
</div>

              <div className="flex items-center gap-3 mb-3">
                {feature.icon}
                <h3 className="text-lg font-semibold text-blue-700">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Integration Section */}
        <motion.section
          className="bg-gray-50 p-8 rounded-2xl shadow-md border border-gray-200 mb-16"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            🔗 Integration with Other Modules
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-800">
            <li>
              Connected with the <strong>Attendance Module</strong> to
              automatically calculate working days and leaves.
            </li>
            <li>
              Integrated with <strong>Accounting Module</strong> for seamless
              salary expense posting and ledger updates.
            </li>
            <li>
              Supports integration with <strong>Bank APIs</strong> for direct
              salary disbursement.
            </li>
          </ul>
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          className="mb-16"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            ✅ Key Benefits
          </h2>
          <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-gray-800">
            <li>100% accurate salary computation with zero manual errors.</li>
            <li>
              Automated payslip and tax computation saves administrative time.
            </li>
            <li>Supports multiple salary structures and components.</li>
            <li>Enhances transparency and employee satisfaction.</li>
            <li>Ensures compliance with all payroll and tax regulations.</li>
          </ul>
        </motion.section>

        {/* Example Use Case */}
        <motion.section
          className="bg-blue-50 p-6 rounded-2xl shadow-md border border-gray-200 mb-12"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-semibold mb-3 text-blue-700">
            🧾 Example Use Case
          </h2>
          <p className="text-gray-800 leading-relaxed">
            - <strong>HR</strong> sets up employee salary structures. <br />
            - <strong>Payroll Admin</strong> processes monthly salary with
            deductions and bonuses. <br />
            - <strong>System</strong> auto-generates payslips and updates
            accounts. <br />
            - <strong>Employees</strong> download payslips and view tax
            summaries in the ERP portal.
          </p>
        </motion.section>

        {/* Conclusion */}
        <motion.section
          className="text-center"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            🚀 Conclusion
          </h2>
          <p className="max-w-3xl mx-auto text-gray-800 leading-relaxed">
            The <strong>Payroll Management Module</strong> ensures accurate,
            compliant, and transparent salary operations — automating the entire
            payroll process while reducing administrative burden and improving
            staff satisfaction.
          </p>
        </motion.section>
      </div>
      <Footer />
    </>
  );
};

export default Payroll;
