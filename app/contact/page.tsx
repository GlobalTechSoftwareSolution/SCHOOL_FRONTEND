"use client";

import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Phone, 
  User, 
  MessageSquare, 
  X, 
  Send,
  MapPin,
  Clock,
  CheckCircle,
  Building,
  GraduationCap,
  Shield
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    from_name: "",
    from_email: "",
    phone: "",
    subject: "",
    message: "",
    institution: "",
    department: ""
  });

  const [showPopup, setShowPopup] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
        formData,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ""
      )
      .then(
        () => {
          setSending(false);
          setShowPopup(true);
          setFormData({
            from_name: "",
            from_email: "",
            phone: "",
            subject: "",
            message: "",
            institution: "",
            department: ""
          });
        },
        (error) => {
          console.error("EmailJS Error:", error);
          setSending(false);
          alert("❌ Failed to send message. Please try again later.");
        }
      );
  };

  const contactFeatures = [
    {
      icon: Clock,
      title: "Quick Response",
      description: "Typically within 2 hours"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade encryption"
    },
    {
      icon: GraduationCap,
      title: "Expert Support",
      description: "Education specialists"
    }
  ];

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mt-10 px-4 py-2 bg-white rounded-full shadow-lg mb-6 border border-gray-100">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">CONTACT OUR TEAM</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Get In Touch
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ready to transform your educational institution? Our experts are here to help 
            you get started with our comprehensive school management platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Contact Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-100">Email Us</h4>
                    <p className="text-white font-medium">tech@globaltechsoftwaresolutions.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-100">Call Us</h4>
                    <p className="text-white font-medium">+91 9844282875</p>
                    <p className="text-blue-200 text-sm">Mon-Sat, 10AM-6PM </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-100">Visit Office</h4>
                    <p className="text-white font-medium">No 10, 4th Floor, Gaduniya Complex, Ramaiah Layout, Vidyaranyapura, Bangalore - 560097</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-4">Why Choose Us?</h4>
              <div className="space-y-4">
                {contactFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{feature.title}</p>
                        <p className="text-gray-500 text-xs">{feature.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">Send us a Message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="relative"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className={`relative transition-all duration-300 ${
                      activeField === 'from_name' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    } rounded-xl`}>
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="from_name"
                        value={formData.from_name}
                        onChange={handleChange}
                        onFocus={() => setActiveField('from_name')}
                        onBlur={() => setActiveField(null)}
                        required
                        placeholder="Enter your full name"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400"
                      />
                    </div>
                  </motion.div>

                  {/* Email Field */}
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="relative"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className={`relative transition-all duration-300 ${
                      activeField === 'from_email' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    } rounded-xl`}>
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="from_email"
                        value={formData.from_email}
                        onChange={handleChange}
                        onFocus={() => setActiveField('from_email')}
                        onBlur={() => setActiveField(null)}
                        required
                        placeholder="your@email.com"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400"
                      />
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone Field */}
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="relative"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className={`relative transition-all duration-300 ${
                      activeField === 'phone' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    } rounded-xl`}>
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={() => setActiveField('phone')}
                        onBlur={() => setActiveField(null)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400"
                      />
                    </div>
                  </motion.div>

                  {/* Institution Field */}
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="relative"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Institution
                    </label>
                    <div className={`relative transition-all duration-300 ${
                      activeField === 'institution' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    } rounded-xl`}>
                      <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="institution"
                        value={formData.institution}
                        onChange={handleChange}
                        onFocus={() => setActiveField('institution')}
                        onBlur={() => setActiveField(null)}
                        placeholder="Your school/institution"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Subject Field */}
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="relative"
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <div className={`relative transition-all duration-300 ${
                    activeField === 'subject' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  } rounded-xl`}>
                    <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setActiveField('subject')}
                      onBlur={() => setActiveField(null)}
                      required
                      placeholder="What would you like to discuss?"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </motion.div>

                {/* Message Field */}
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  className="relative"
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <div className={`relative transition-all duration-300 ${
                    activeField === 'message' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  } rounded-xl`}>
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setActiveField('message')}
                      onBlur={() => setActiveField(null)}
                      required
                      rows={6}
                      placeholder="Please describe your inquiry in detail..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400 resize-none"
                    />
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={{ scale: sending ? 1 : 1.02 }}
                  whileTap={{ scale: sending ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Your Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      Send Message
                    </>
                  )}
                </motion.button>

                <p className="text-center text-sm text-gray-500">
                  We respect your privacy and will never share your information
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Success Popup */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => setShowPopup(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Message Sent Successfully!
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Thank you for reaching out. Our team will review your message and get back to you 
                within 2 business hours. We look forward to assisting you.
              </p>

              <div className="flex gap-3 justify-center">
                <motion.button
                  onClick={() => setShowPopup(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    setShowPopup(false);
                    window.location.href = '/';
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Back to Home
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    <Footer />
    </>
  );
}