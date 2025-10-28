"use client";

import React from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slides = [
  {
    title: "Admissions",
    description:
      "Collect and organize admission-related data and documents in the cloud. Monitor student and staff intake by department, or automate administrative tasks like generating ID numbers, segmenting classes, and more.",
    image: "/assets/features/admissions.jpg",
  },
  {
    title: "Course Planning",
    description:
      "Generate customized timetables for staff and students. Use online forms to collect course preferences, map daily slots with courses, and assign faculty based on availability.",
    image: "/assets/features/course-planning.jpg",
  },
  {
    title: "Attendance",
    description:
      "Go paperless with an online attendance system. Automatically notify parents or students about absences and daily updates.",
    image: "/assets/features/attendance.jpg",
  },
  {
    title: "Exams & Grading",
    description:
      "Easily manage grading and assessment reports. Track student progress and identify learning gaps using visual reports.",
    image: "/assets/features/exams.jpg",
  },
  {
    title: "Event Management",
    description:
      "Plan and organize school events with ease. Collect registrations, manage volunteers, and send automated updates to participants.",
    image: "/assets/features/events.jpg",
  },
  {
    title: "Accounting",
    description:
      "Handle fee collections and salary payments securely. Integrate with your payment gateway and manage all transactions in one place.",
    image: "/assets/features/accounting.jpg",
  },
  {
    title: "Communication",
    description:
      "Send instant notifications, newsletters, and updates to parents, students, and staff through automated channels.",
    image: "/assets/features/communication.jpg",
  },
];

export default function SchoolFeaturesSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-blue-700">
          School Management Features
        </h2>
        <Slider {...settings}>
          {slides.map((item, index) => (
            <div key={index} className="px-4">
              <div className="bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative w-full h-60">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}