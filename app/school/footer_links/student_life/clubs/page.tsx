"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  Users,
  Trophy,
  Megaphone,
  Image,
  BarChart3,
  Star,
  Settings,
  School,
} from "lucide-react";

const Club = () => {
  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20 text-black bg-gradient-to-b from-purple-50 to-white py-12 px-6">
      <motion.div
        className="max-w-6xl mx-auto text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-purple-700 mb-4">
          🏫 SchoolERP System – Clubs & Organizations (Student Life Module)
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          A digital hub that manages and promotes all student clubs and
          organizations — fostering leadership, teamwork, and creativity within
          the school community.
        </p>
      </motion.div>

      <motion.section
        className="max-w-6xl mx-auto mt-10 grid gap-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        {/* Overview */}
        <AnimatedCard
          icon={<School className="text-purple-600" size={30} />}
          title="📘 Overview"
          content="The Clubs & Organizations Module promotes holistic student development by managing extracurricular activities and collaboration across all clubs — connecting academics with creativity and leadership."
        />

        {/* Objectives */}
        <AnimatedCard
          icon={<Settings className="text-indigo-600" size={30} />}
          title="🎯 Objectives"
          list={[
            "Centralize management of all student clubs.",
            "Encourage active participation in campus life.",
            "Record and showcase student achievements.",
            "Enhance communication between faculty and members.",
            "Digitally manage memberships, events, and announcements.",
          ]}
        />

        {/* Features */}
        <AnimatedCard
          icon={<Star className="text-yellow-500" size={30} />}
          title="🧩 Key Features"
          list={[
            "🏛️ Club Directory – categorized academic, cultural, and social clubs.",
            "🪪 Membership Management – apply, approve, and assign roles.",
            "📅 Event & Activity Management – organize workshops and competitions.",
            "🏆 Achievements & Recognition – highlight top-performing members.",
            "📢 Announcements & Communication – post updates and reminders.",
            "📷 Media Gallery – upload event photos and videos.",
            "🧑‍🏫 Faculty Advisor Panel – oversee club operations and approvals.",
            "🧾 Reports & Analytics – analyze participation and trends.",
          ]}
        />

        {/* Roles */}
        <AnimatedCard
          icon={<Users className="text-green-600" size={30} />}
          title="👥 User Roles & Access"
        >
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border border-gray-200 text-left text-sm">
              <thead className="bg-purple-100">
                <tr>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Access Level</th>
                  <th className="px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">Student</td>
                  <td className="border px-4 py-2">Join / View</td>
                  <td className="border px-4 py-2">
                    Apply for clubs, join events, view updates.
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Club Head</td>
                  <td className="border px-4 py-2">Manage / Approve</td>
                  <td className="border px-4 py-2">
                    Approve memberships, create events, post updates.
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Faculty Advisor</td>
                  <td className="border px-4 py-2">Supervise / Report</td>
                  <td className="border px-4 py-2">
                    Oversee club operations and generate reports.
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Admin</td>
                  <td className="border px-4 py-2">Full Access</td>
                  <td className="border px-4 py-2">
                    Create clubs, assign faculty, monitor analytics.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AnimatedCard>

        {/* Integration */}
        <AnimatedCard
          icon={<BarChart3 className="text-blue-600" size={30} />}
          title="⚙️ Integration with SchoolERP Modules"
          list={[
            "Student Portal – Displays club memberships & events.",
            "Admin Dashboard – Monitors all club operations.",
            "Help Center – Manages support for club queries.",
            "Academic Management – Syncs schedules with academics.",
            "Event Calendar – Adds approved club events automatically.",
          ]}
        />

        {/* Gallery */}
        <AnimatedCard
          icon={<Image className="text-pink-600" size={30} />}
          title="📷 Media Gallery"
          list={[
            "Upload event photos, videos, and posters.",
            "Categorize albums by club and event.",
            "Integrate with school’s website and social media.",
            "Enhance visibility of student-led activities.",
          ]}
        />

        {/* Benefits */}
        <AnimatedCard
          icon={<Trophy className="text-orange-600" size={30} />}
          title="🚀 Benefits"
          list={[
            "Enhances student engagement & leadership.",
            "Simplifies administration & reporting.",
            "Encourages creativity & teamwork.",
            "Balances academics and extracurricular growth.",
            "Provides measurable participation analytics.",
          ]}
        />

        {/* Future Enhancements */}
        <AnimatedCard
          icon={<Megaphone className="text-red-600" size={30} />}
          title="🔮 Future Enhancements"
          list={[
            "Gamified participation system with badges.",
            "AI-based club suggestions for students.",
            "Integration with alumni mentorship programs.",
            "Event livestreaming via school media.",
            "Mobile app notifications for real-time updates.",
          ]}
        />

        {/* Conclusion */}
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">
            🧠 Conclusion
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The Clubs & Organizations Module enriches campus life by digitizing
            extracurricular management and encouraging collaboration. It builds
            a vibrant, connected student community — empowering creativity,
            leadership, and teamwork across the school.
          </p>
        </motion.div>
      </motion.section>
    </div>
    <Footer />
    </>
  );
};

export default Club;

// 🔁 Reusable Animated Card
const AnimatedCard = ({
  icon,
  title,
  content,
  list,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  content?: string;
  list?: string[];
  children?: React.ReactNode;
}) => {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      {content && <p className="text-gray-600 mb-3">{content}</p>}
      {list && (
        <ul className="list-disc pl-6 text-gray-600 space-y-1">
          {list.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
      {children}
    </motion.div>
  );
};
