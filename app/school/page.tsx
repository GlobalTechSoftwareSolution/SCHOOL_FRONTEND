"use client";

import React from "react";
import Navbar from "@/app/school/components/Navbar"; 
import Hero from "@/app/school/components/Hero";
import Erpmodules from "@/app/school/components/Erpmodules";
import Faqs from '@/app/school/components/Faqs'
import Personalizedportals from  '@/app/school/components/Personalizedportals'
import Featuresshowcase from '@/app/school/featuresshowcase/page'
import Whatsappbutton from '@/app/school/components/Whatsappbutton'
import Footer from "@/app/school/components/Footer";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <Erpmodules />
      <Personalizedportals />
      <Featuresshowcase />
      <Faqs />
      <Whatsappbutton />
      <Footer />
    </div>
  );
}
