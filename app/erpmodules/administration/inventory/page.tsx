"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShieldCheck,
  Activity,
  Database,
  Bell,
  BarChart,
  MonitorSmartphone,
  Layers,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Inventory = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20 bg-gradient-to-br from-amber-50 via-white to-yellow-100 px-6 md:px-20 py-16 text-gray-900">
      {/* Header */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center text-yellow-700 mb-4"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        📦 SchoolERP System – Inventory Management Module
      </motion.h1>

      <motion.p
        className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        The <strong>Inventory Management Module</strong> ensures seamless control
        over all school assets — from lab equipment and library materials to IT
        devices and furniture. With real-time updates, theft prevention, and
        automated reports, it keeps your institution’s resources organized and
        secure.
      </motion.p>

      {/* Features Section */}
      <motion.section
        className="grid md:grid-cols-2 gap-8 mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            icon: <Package className="text-yellow-600" size={28} />,
            title: "Asset Tracking",
            desc: "Track every asset in real-time with unique identification codes and location mapping. Easily view ownership, allocation, and movement history.",
          },
          {
            icon: <Database className="text-yellow-600" size={28} />,
            title: "Stock Management",
            desc: "Maintain optimal stock levels for consumables such as stationery, lab materials, and uniforms. Get alerts for low stock or overstock conditions.",
          },
          {
            icon: <ShieldCheck className="text-yellow-600" size={28} />,
            title: "Theft Prevention",
            desc: "Integrate security measures such as barcode scanning and RFID-based tracking to prevent theft or misplacement of valuable assets.",
          },
          {
            icon: <Activity className="text-yellow-600" size={28} />,
            title: "Real-time Updates",
            desc: "Monitor asset status and location instantly. Any changes — transfers, returns, or disposals — are reflected across all linked departments.",
          },
          {
            icon: <BarChart className="text-yellow-600" size={28} />,
            title: "Automated Reports",
            desc: "Generate dynamic reports showing asset utilization, depreciation, and department-wise distribution for audit and compliance purposes.",
          },
          {
            icon: <Bell className="text-yellow-600" size={28} />,
            title: "Alerts & Notifications",
            desc: "Receive instant notifications for missing items, stock shortages, or upcoming maintenance schedules via email or dashboard alerts.",
          },
          {
            icon: <Layers className="text-yellow-600" size={28} />,
            title: "Multi-Department Integration",
            desc: "Synchronize data across all departments — from administration to labs — ensuring complete visibility into every item’s lifecycle.",
          },
          {
            icon: <MonitorSmartphone className="text-yellow-600" size={28} />,
            title: "Mobile Access",
            desc: "Access and manage inventory records through the mobile app. Scan barcodes and update asset data on the go for quick auditing.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center gap-3 mb-3">
              {item.icon}
              <h3 className="text-lg font-semibold text-yellow-700">
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
        <h2 className="text-2xl font-semibold mb-4 text-yellow-800">
          🔗 Integration with Other Modules
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Linked with the Accounts module for financial tracking of assets.</li>
          <li>Syncs with Maintenance for periodic servicing and replacements.</li>
          <li>Works with Security and Access Control modules for theft monitoring.</li>
          <li>Enables automated inventory updates after purchase orders are approved.</li>
        </ul>
      </motion.section>

      {/* Benefits */}
      <motion.section
        className="mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-yellow-800">
          ✅ Key Benefits
        </h2>
        <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-gray-700">
          <li>Prevents loss or theft through real-time tracking.</li>
          <li>Optimizes inventory usage across departments.</li>
          <li>Reduces manual recordkeeping and human errors.</li>
          <li>Improves audit readiness with accurate reports.</li>
          <li>Ensures transparency and accountability.</li>
        </ul>
      </motion.section>

      {/* Example Use Case */}
      <motion.section
        className="bg-yellow-50 p-6 rounded-2xl shadow-md border border-gray-100 mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-3 text-yellow-800">
          🏫 Example Use Case
        </h2>
        <p className="text-gray-700 leading-relaxed">
          - <strong>Admin</strong> adds new lab equipment into the system with barcode tags.  <br />
          - <strong>Teachers</strong> request specific assets for practical sessions.  <br />
          - <strong>System</strong> tracks usage, location, and maintenance history.  <br />
          - <strong>Alerts</strong> are sent if equipment is unreturned or damaged.  <br />
          - <strong>Reports</strong> are generated monthly for audits and stock analysis.
        </p>
      </motion.section>

      {/* Conclusion */}
      <motion.section
        className="text-center"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-yellow-700">
          🚀 Conclusion
        </h2>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
          The <strong>Inventory Management Module</strong> simplifies resource
          tracking and enhances accountability within the institution. Its
          integration with security, accounts, and maintenance modules ensures
          complete transparency and long-term asset optimization.
        </p>
      </motion.section>
    </div>
    <Footer />
    </>
  );
};

export default Inventory;
