"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  CalendarDays,
  Users,
  Trophy,
  Bell,
  Image,
  BarChart3,
  Star,
  Settings,
} from "lucide-react";

const Event = () => {
  return (
    <>
    <Navbar />
    <div className="min-h-screen mt-20 bg-gradient-to-b from-blue-50 to-white py-12 px-6">
      <motion.div
        className="max-w-6xl mx-auto text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4">
          🎉 SchoolERP System – Events & Activities (Student Life Module)
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Manage and showcase all school-wide events, activities, and
          celebrations in one centralized digital platform.
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
        {/* Overview Section */}
        <AnimatedCard
          icon={<Star className="text-yellow-500" size={30} />}
          title="📘 Overview"
          content="The Events & Activities Module helps schools manage all academic, cultural, and social events digitally — ensuring seamless planning, participation, and archiving within the ERP ecosystem."
        />

        {/* Objectives Section */}
        <AnimatedCard
          icon={<Settings className="text-indigo-600" size={30} />}
          title="🎯 Objectives"
          list={[
            "Simplify the planning and execution of events.",
            "Encourage student participation.",
            "Provide real-time event updates.",
            "Digitally record achievements.",
            "Integrate with other ERP modules.",
          ]}
        />

        {/* Features Section */}
        <AnimatedCard
          icon={<CalendarDays className="text-blue-600" size={30} />}
          title="🧩 Key Features"
          content=""
          list={[
            "Dynamic Event Calendar with filters & color codes.",
            "Event creation & approval workflows.",
            "Online registration with QR-based check-in.",
            "Result announcements with certificate uploads.",
            "Real-time notifications & reminders.",
            "Event gallery with photos & videos.",
            "Faculty & organizer dashboards.",
            "Post-event feedback system.",
            "Comprehensive analytics & reports.",
          ]}
        />

        {/* Roles & Access */}
        <AnimatedCard
          icon={<Users className="text-green-600" size={30} />}
          title="👥 User Roles & Access"
          content="Different stakeholders have tailored access to manage and view events effectively."
        >
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border border-gray-200 text-left text-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Access Level</th>
                  <th className="px-4 py-2">Key Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">Student</td>
                  <td className="border px-4 py-2">View & Register</td>
                  <td className="border px-4 py-2">
                    Participate and give feedback
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Faculty / Coordinator</td>
                  <td className="border px-4 py-2">Create & Manage</td>
                  <td className="border px-4 py-2">
                    Approve events & upload results
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Admin</td>
                  <td className="border px-4 py-2">Full Access</td>
                  <td className="border px-4 py-2">
                    Approve, edit, and delete events
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Parent (Optional)</td>
                  <td className="border px-4 py-2">Read-only</td>
                  <td className="border px-4 py-2">
                    View upcoming events & participation
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AnimatedCard>

        {/* Integration */}
        <AnimatedCard
          icon={<BarChart3 className="text-purple-600" size={30} />}
          title="⚙️ Integration with Other Modules"
          list={[
            "Student Portal – Displays event updates.",
            "Faculty Hub – Event coordination.",
            "Admin Dashboard – Monitoring and analytics.",
            "Clubs & Organizations – Club-hosted events.",
            "Help Center – Feedback and support.",
          ]}
        />

        {/* Gallery */}
        <AnimatedCard
          icon={<Image className="text-pink-600" size={30} />} // eslint-disable-line jsx-a11y/alt-text
          title="📸 Event Gallery & Highlights"
          list={[
            "Upload and view event media.",
            "Categorize by department or club.",
            "Integration with school website.",
            "Tag students in photos.",
            "Auto ‘Year in Review’ reels.",
          ]}
        />

        {/* Benefits */}
        <AnimatedCard
          icon={<Trophy className="text-orange-600" size={30} />}
          title="🚀 Benefits"
          list={[
            "Centralized digital management of events.",
            "Boosts engagement & participation.",
            "Streamlined inter-department coordination.",
            "Data-driven analytics and reports.",
            "Creates a vibrant and connected campus life.",
          ]}
        />

        {/* Future Enhancements */}
        <AnimatedCard
          icon={<Bell className="text-red-600" size={30} />}
          title="🔮 Future Enhancements"
          list={[
            "AI Event Suggestions.",
            "Live Event Streaming.",
            "Volunteer Management with Badges.",
            "Event Budgeting Tools.",
            "Integration with Attendance System.",
          ]}
        />

        {/* Conclusion */}
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            🧠 Conclusion
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The Events & Activities Module enhances student life by
            digitalizing event management and encouraging participation.
            By integrating creativity, collaboration, and innovation, this
            system transforms how schools celebrate achievements and build
            campus spirit.
          </p>
        </motion.div>
      </motion.section>
    </div>
    <Footer />
    </>
  );
};

export default Event;

// ✨ Reusable AnimatedCard Component
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
      className="bg-white text-black rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all"
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
