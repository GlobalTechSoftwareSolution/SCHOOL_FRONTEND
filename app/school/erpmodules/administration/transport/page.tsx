"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Bus,
  Shield,
  Bell,
  Route,
  BarChart3,
  Clock,
  Users,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Transport = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
   <>
   <Navbar />
    <div className="min-h-screen mt-20 bg-gradient-to-br from-yellow-50 via-white to-amber-100 px-6 md:px-20 py-16 text-gray-900">
      {/* Header */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center text-amber-700 mb-4"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        🚌 SchoolERP System – Transport Management Module
      </motion.h1>

      <motion.p
        className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        The <strong>Transport Management Module</strong> ensures safe and
        efficient school transport operations by digitally managing routes,
        vehicle tracking, driver assignments, and student safety monitoring.
        With real-time GPS data, optimized routes, and instant parent
        notifications — it guarantees peace of mind for everyone.
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
            icon: <Route className="text-amber-600" size={28} />,
            title: "Route Optimization",
            desc: "Automatically plan and optimize routes based on student locations and bus capacity. Save time and fuel while covering all stops efficiently.",
          },
          {
            icon: <Bus className="text-amber-600" size={28} />,
            title: "Fleet & Vehicle Management",
            desc: "Keep records of all school buses, including vehicle details, maintenance schedules, driver assignments, and route history.",
          },
          {
            icon: <MapPin className="text-amber-600" size={28} />,
            title: "GPS Tracking",
            desc: "Track buses in real time using GPS integration. View live location, speed, and route progress from the SchoolERP dashboard.",
          },
          {
            icon: <Shield className="text-amber-600" size={28} />,
            title: "Safety Monitoring",
            desc: "Monitor safety metrics like speed limits, emergency stops, and route deviations. Get instant alerts for any safety breach.",
          },
          {
            icon: <Bell className="text-amber-600" size={28} />,
            title: "Parent Alerts",
            desc: "Send automated notifications to parents when the bus is near pickup/drop points or in case of delays and emergencies.",
          },
          {
            icon: <Users className="text-amber-600" size={28} />,
            title: "Student Attendance Sync",
            desc: "Integrate transport logs with attendance systems for auto-marking when students board or leave the bus.",
          },
          {
            icon: <BarChart3 className="text-amber-600" size={28} />,
            title: "Performance Analytics",
            desc: "Visualize route efficiency, bus utilization, and occupancy rates through graphs and dashboards.",
          },
          {
            icon: <Clock className="text-amber-600" size={28} />,
            title: "Real-Time Updates",
            desc: "Get live data for bus arrival/departure, idle times, and route changes. Keep admins, drivers, and parents informed at all times.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center gap-3 mb-3">
              {item.icon}
              <h3 className="text-lg font-semibold text-amber-700">
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
        <h2 className="text-2xl font-semibold mb-4 text-amber-800">
          🔗 Integration with Other Modules
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            Integrated with the <strong>Student Information System</strong> for
            managing pickup and drop-off details.
          </li>
          <li>
            Linked with the <strong>Attendance Module</strong> to record
            transport-based student attendance automatically.
          </li>
          <li>
            Connected to the <strong>Parent Portal</strong> for live bus
            tracking and instant alerts.
          </li>
          <li>
            Integrated with the <strong>Admin Dashboard</strong> for monitoring
            fleet performance and route optimization analytics.
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
        <h2 className="text-2xl font-semibold mb-4 text-amber-800">
          ✅ Key Benefits
        </h2>
        <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-gray-700">
          <li>Improved student safety with real-time tracking.</li>
          <li>Automated alerts reduce communication gaps.</li>
          <li>Optimized routes save fuel and travel time.</li>
          <li>Centralized bus and driver management system.</li>
          <li>Instant access to reports and performance analytics.</li>
        </ul>
      </motion.section>

      {/* Example Use Case */}
      <motion.section
        className="bg-amber-50 p-6 rounded-2xl shadow-md border border-gray-100 mb-12"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-3 text-amber-800">
          🏫 Example Use Case
        </h2>
        <p className="text-gray-700 leading-relaxed">
          - <strong>Admin</strong> adds a new route and assigns a driver.  <br />
          - <strong>Students</strong> are mapped to their respective stops.  <br />
          - <strong>Parents</strong> receive live notifications when the bus is nearby.  <br />
          - <strong>System</strong> tracks the route, detects deviations, and
          generates performance reports.
        </p>
      </motion.section>

      {/* Conclusion */}
      <motion.section
        className="text-center"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-amber-700">
          🚀 Conclusion
        </h2>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
          The <strong>Transport Management Module</strong> ensures safe, smart,
          and transparent school transport operations. It strengthens trust
          among parents, boosts operational efficiency, and makes daily commute
          tracking effortless.
        </p>
      </motion.section>
    </div>
   <Footer />
   </>
  );
};

export default Transport;
