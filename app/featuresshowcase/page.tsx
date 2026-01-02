"use client";

import React from "react";
import Slider from "react-slick";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Zap,
  CheckCircle
} from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slides = [
  {
    title: "Admissions Management",
    description: "Collect and organize admission-related data and documents in the cloud. Monitor student and staff intake by department, or automate administrative tasks like generating ID numbers, segmenting classes, and more.",
    image: "/features/admissions.jpg",
    stats: "98% Efficiency Gain",
    features: ["Online Applications", "Document Management", "Automated ID Generation", "Class Segmentation"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Course Planning",
    description: "Generate customized timetables for staff and students. Use online forms to collect course preferences, map daily slots with courses, and assign faculty based on availability.",
    image: "/features/course-planning.jpg",
    stats: "70% Time Saved",
    features: ["Smart Timetabling", "Faculty Allocation", "Preference Collection", "Conflict Resolution"],
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Attendance System",
    description: "Go paperless with an online attendance system. Automatically notify parents or students about absences and daily updates.",
    image: "/features/attendance.jpg",
    stats: "100% Paperless",
    features: ["Real-time Tracking", "Parent Notifications", "Automated Reports", "Biometric Integration"],
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Exams & Grading",
    description: "Easily manage grading and assessment reports. Track student progress and identify learning gaps using visual reports.",
    image: "/features/exams.jpg",
    stats: "AI-Powered Analytics",
    features: ["Automated Grading", "Progress Tracking", "Performance Analytics", "Gap Identification"],
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Event Management",
    description: "Plan and organize school events with ease. Collect registrations, manage volunteers, and send automated updates to participants.",
    image: "/features/events.jpg",
    stats: "Seamless Coordination",
    features: ["Event Planning", "Volunteer Management", "Automated Updates", "Registration Tracking"],
    color: "from-teal-500 to-cyan-500"
  },
  {
    title: "Accounting Suite",
    description: "Handle fee collections and salary payments securely. Integrate with your payment gateway and manage all transactions in one place.",
    image: "/features/accounting.jpg",
    stats: "Zero Errors",
    features: ["Fee Management", "Salary Processing", "Payment Gateway", "Financial Reports"],
    color: "from-indigo-500 to-blue-500"
  },
  {
    title: "Communication Hub",
    description: "Send instant notifications, newsletters, and updates to parents, students, and staff through automated channels.",
    image: "/features/communication.jpg",
    stats: "Instant Delivery",
    features: ["Multi-channel Messaging", "Automated Alerts", "Newsletter System", "Parent Portal"],
    color: "from-violet-500 to-purple-500"
  },
];

interface CustomArrowProps {
  onClick?: () => void;
  direction: 'prev' | 'next';
  className?: string;
}

const CustomArrow = ({ onClick, direction, className }: CustomArrowProps) => (
  <motion.button
    whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-300 z-10 ${className}`}
  >
    {direction === 'prev' ? (
      <ArrowLeft className="w-6 h-6 text-blue-600" />
    ) : (
      <ArrowRight className="w-6 h-6 text-blue-600" />
    )}
  </motion.button>
);

export default function SchoolFeaturesSlider() {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const sliderRef = React.useRef<Slider | null>(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    mobileFirst: true,
    autoplay: isPlaying,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: false,
    nextArrow: <CustomArrow direction="next" className="hidden md:flex" />,
    prevArrow: <CustomArrow direction="prev" className="hidden md:flex" />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: true
        }
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true
        }
      }
    ],
    appendDots: (dots: React.ReactNode) => (
      <div className="absolute -bottom-10">
        <ul className="flex justify-center space-x-2">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-3 h-3 bg-gray-300 rounded-full transition-all duration-300 hover:bg-blue-400" />
    ),
  };

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      sliderRef.current?.slickPlay();
    } else {
      sliderRef.current?.slickPause();
    }
  };

  return (
    <>
      {/* <Navbar /> */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 md:py-20 px-4 sm:px-6 lg:px-0 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-0 -left-40 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white rounded-full shadow-lg mb-4 md:mb-6 border border-gray-100">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm font-semibold text-gray-700">FEATURES SHOWCASE</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 md:mb-6 leading-tight">
              Comprehensive School Management
            </h1>

            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6 md:mb-8 px-2">
              Discover our powerful suite of tools designed to streamline every aspect of educational institution management.
            </p>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAutoplay}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Play</span>
                  </>
                )}
              </motion.button>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Interactive Carousel</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Slider Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <Slider ref={sliderRef} {...settings}>
              {slides.map((slide, index) => (
                <div key={index} className="px-2 md:px-3 pb-8 md:pb-12 h-full">
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full"
                  >
                    {/* Image Section */}
                    <div className="relative w-full h-40 md:h-48 overflow-hidden flex-shrink-0">
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${slide.color} opacity-20`} />

                      {/* Stats Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 md:px-3 shadow-lg">
                          <span className="text-[10px] md:text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {slide.stats}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 md:p-6 flex flex-col flex-grow">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3 leading-tight">
                        {slide.title}
                      </h3>

                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4 flex-grow">
                        {slide.description}
                      </p>

                      {/* Features List */}
                      <div className="space-y-2 mt-auto">
                        {slide.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
                            <span className="text-[10px] md:text-xs text-gray-600 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hover Gradient Effect */}
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${slide.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`} />
                  </motion.div>
                </div>
              ))}
            </Slider>
          </motion.div>
        </div>
      </section>
      {/* <Footer /> */}
    </>
  );
}
