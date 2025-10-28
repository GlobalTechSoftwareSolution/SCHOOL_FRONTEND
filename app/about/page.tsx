"use client";

import { motion } from "framer-motion";
import { Users, Target, Lightbulb, ShieldCheck, Zap } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AboutUsPage = () => {
  return (
    <>
    <Navbar />
    <main className="bg-gradient-to-b from-white via-blue-50 to-indigo-100 text-gray-800">
      {/* Hero Section */}
      <section className="text-center px-6 py-24">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-blue-800 mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600">Smart School ERP</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Smart School ERP is an all-in-one digital platform designed to simplify and modernize school operations — connecting students, teachers, and administrators seamlessly through technology.
        </motion.p>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-16 px-6 md:px-20">
        <div className="grid md:grid-cols-3 gap-10 text-center">
          <motion.div
            className="bg-white rounded-2xl shadow-md hover:shadow-xl p-8 transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Target className="mx-auto text-blue-600 w-12 h-12 mb-4" />
            <h3 className="text-2xl font-semibold mb-3 text-blue-700">Our Mission</h3>
            <p className="text-gray-600">
              To empower educational institutions with smart digital tools that enhance learning, streamline operations, and foster transparent communication between stakeholders.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-md hover:shadow-xl p-8 transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Lightbulb className="mx-auto text-yellow-500 w-12 h-12 mb-4" />
            <h3 className="text-2xl font-semibold mb-3 text-blue-700">Our Vision</h3>
            <p className="text-gray-600">
              To revolutionize education management by bringing automation, innovation, and intelligence into every classroom and office.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-md hover:shadow-xl p-8 transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <ShieldCheck className="mx-auto text-green-600 w-12 h-12 mb-4" />
            <h3 className="text-2xl font-semibold mb-3 text-blue-700">Our Values</h3>
            <p className="text-gray-600">
              We believe in integrity, innovation, and inclusivity — ensuring that technology benefits every learner and educator equally.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-blue-700 text-white py-20 px-6 md:px-20 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold mb-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Why Choose Smart School ERP?
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <motion.div
            className="bg-white/10 backdrop-blur-md p-8 rounded-2xl hover:bg-white/20 transition"
            whileHover={{ scale: 1.05 }}
          >
            <Users className="mx-auto mb-4 w-10 h-10 text-yellow-300" />
            <h4 className="text-2xl font-semibold mb-3">Seamless Collaboration</h4>
            <p className="text-white/80">
              Connect teachers, students, and parents with real-time updates and transparent communication.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-md p-8 rounded-2xl hover:bg-white/20 transition"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="mx-auto mb-4 w-10 h-10 text-yellow-300" />
            <h4 className="text-2xl font-semibold mb-3">Automation & Efficiency</h4>
            <p className="text-white/80">
              Manage attendance, grades, payroll, and reports effortlessly with our smart automation tools.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-md p-8 rounded-2xl hover:bg-white/20 transition"
            whileHover={{ scale: 1.05 }}
          >
            <ShieldCheck className="mx-auto mb-4 w-10 h-10 text-yellow-300" />
            <h4 className="text-2xl font-semibold mb-3">Data Security</h4>
            <p className="text-white/80">
              Built with enterprise-grade security to protect sensitive school and student data.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Closing */}
      <section className="text-center py-16 px-6">
        <motion.h3
          className="text-3xl font-bold text-blue-800 mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Empowering Schools. Empowering the Future.
        </motion.h3>
        <motion.p
          className="text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Join hundreds of institutions already transforming their workflows with Smart School ERP.
        </motion.p>
      </section>
    </main>
    <Footer />
    </>
  );
};

export default AboutUsPage;
