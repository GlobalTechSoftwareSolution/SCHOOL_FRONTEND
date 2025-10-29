"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

const TermsPage = () => {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 px-6 py-20 md:px-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-5xl mx-auto"
      >
        {/* Back Button */}
        <motion.button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors duration-200 group"
          whileHover={{ x: -4 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ChevronLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Previous Page
        </motion.button>

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-700 via-purple-600 to-blue-500 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-center text-gray-500 text-lg max-w-3xl mx-auto leading-relaxed">
            Welcome to Smart School Portal. These Terms & Conditions govern your use of our educational 
            management platform. Please read them carefully before accessing or using our services.
          </p>
          <motion.div
            className="mt-6 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </motion.div>
        </motion.div>

        {/* Terms Content */}
        <motion.div
          className="space-y-12 leading-relaxed text-lg bg-white/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-100 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 mb-3">
              By accessing or using the Smart School ERP Portal ("Service"), you acknowledge that you have read, 
              understood, and agree to be bound by these Terms & Conditions. These terms constitute a legally 
              binding agreement between you and GlobalTech Software Solutions.
            </p>
            <p className="text-gray-700">
              If you are accessing the portal on behalf of an educational institution, you represent and warrant 
              that you have the authority to bind that institution to these terms. If you disagree with any part 
              of these terms, you may not access the service.
            </p>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              2. User Responsibilities
            </h2>
            <p className="text-gray-700 mb-3">
              You are responsible for maintaining the confidentiality and security of your login credentials 
              and for all activities that occur under your account. You must immediately notify us of any 
              unauthorized use of your account or any other security breaches.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the platform only for lawful educational purposes</li>
              <li>Maintain accurate and complete account information</li>
              <li>Not share your login credentials with others</li>
              <li>Not attempt to gain unauthorized access to other users' data</li>
              <li>Not use the service to transmit malicious software</li>
            </ul>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              3. Data Privacy and Security
            </h2>
            <p className="text-gray-700 mb-3">
              Smart School ERP is committed to protecting the privacy and security of all user data. We comply 
              with applicable data protection laws including FERPA, GDPR, and other educational data privacy regulations.
            </p>
            <p className="text-gray-700 mb-3">
              We implement appropriate technical and organizational measures to ensure a level of security 
              appropriate to the risk, including encryption, access controls, and regular security assessments.
            </p>
            <p className="text-gray-700">
              By using this portal, you consent to our data collection and processing practices as described 
              in our <Link href="/privacy-policy" className="text-blue-600 underline hover:text-purple-600 font-medium">Privacy Policy</Link>.
            </p>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              4. Intellectual Property Rights
            </h2>
            <p className="text-gray-700 mb-3">
              All materials contained in this platform, including but not limited to the platform design, 
              logos, graphics, software, documentation, and content are the intellectual property of 
              GlobalTech Software Solutions or our licensors and are protected by copyright and other laws.
            </p>
            <p className="text-gray-700">
              You are granted a limited, non-exclusive, non-transferable license to use the platform for 
              its intended educational purposes. Unauthorized copying, redistribution, modification, or 
              reverse engineering of any platform component is strictly prohibited.
            </p>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              5. Limitation of Liability
            </h2>
            <p className="text-gray-700 mb-3">
              To the fullest extent permitted by law, Smart School Portal and its developers shall not be 
              held liable for any direct, indirect, incidental, special, consequential, or punitive damages 
              arising from:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Your use or inability to use the service</li>
              <li>Any unauthorized access to or alteration of your transmissions or data</li>
              <li>Statements or conduct of any third party on the service</li>
              <li>Any other matter relating to the service</li>
            </ul>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              6. Service Modifications and Availability
            </h2>
            <p className="text-gray-700 mb-3">
              We reserve the right to modify, suspend, or discontinue any aspect of the service at any time, 
              including the availability of any feature, database, or content. We may also impose limits on 
              certain features and services or restrict your access to parts or all of the service without 
              notice or liability.
            </p>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              7. Modifications to Terms
            </h2>
            <p className="text-gray-700 mb-3">
              We reserve the right to modify or replace these Terms at any time at our sole discretion. 
              If we make material changes, we will provide notice through the platform or via email at 
              least 30 days before the changes take effect.
            </p>
            <p className="text-gray-700">
              By continuing to access or use our service after any revisions become effective, you agree 
              to be bound by the updated terms. If you do not agree to the new terms, you must stop using 
              the service.
            </p>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              8. Termination and Suspension
            </h2>
            <p className="text-gray-700 mb-3">
              We may suspend or terminate your access to the portal immediately, without prior notice or 
              liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
            <p className="text-gray-700">
              Upon termination, your right to use the service will cease immediately. All provisions of 
              these Terms which by their nature should survive termination shall survive, including ownership 
              provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              9. Governing Law and Dispute Resolution
            </h2>
            <p className="text-gray-700 mb-3">
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction 
              where GlobalTech Software Solutions is headquartered, without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-700">
              Any disputes arising from these Terms or your use of the service shall be resolved through 
              binding arbitration in accordance with the rules of the American Arbitration Association, 
              rather than in court.
            </p>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              10. Contact Information
            </h2>
            <p className="text-gray-700 mb-3">
              For any questions, concerns, or notices regarding these Terms & Conditions, please contact us through:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="mb-2">
                📧 Email:{" "}
                <a 
                  href="mailto:tech@globaltechsoftwaresolutions.com" 
                  className="text-blue-600 underline hover:text-purple-600 font-medium"
                >
                  tech@globaltechsoftwaresolutions.com
                </a>
              </p>
              <p className="mb-2">
                🌐 Website:{" "}
                <Link 
                  href="/contact" 
                  className="text-blue-600 underline hover:text-purple-600 font-medium"
                >
                  Our Contact Page
                </Link>
              </p>
              <p className="mb-2">
                📞 Phone: +91 9844281875
              </p>
              <p>
                📍 Address: No 10, 4th Floor, Gaduniya Complex, Ramaiah Layout, Vidyaranyapura, Bangalore - 560097  
              </p>
            </div>
          </section>
        </motion.div>

        {/* Acceptance Section */}
        <motion.div
          className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Acknowledgement
          </h3>
          <p className="text-gray-700 mb-6">
            By using Smart School Portal, you acknowledge that you have read, understood, and agree to be bound 
            by these Terms & Conditions and our Privacy Policy.
          </p>
          <div className="text-sm text-gray-500">
            Effective Date: January 1, 2024 | Version: 2.1
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default TermsPage;