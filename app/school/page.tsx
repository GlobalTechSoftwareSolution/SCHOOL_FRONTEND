"use client";

import React from "react";
import Navbar from "./components/Navbar"; 
import Hero from "./components/Hero";
import Erpmodules from "./components/Erpmodules";
import Faqs from './components/Faqs'
import Personalizedportals from  './components/Personalizedportals'
import Featuresshowcase from './featuresshowcase/page'
import Whatsappbutton from './components/Whatsappbutton'
import Footer from "./components/Footer";

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
