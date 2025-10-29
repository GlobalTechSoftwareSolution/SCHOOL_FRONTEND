"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Shield, 
  Lock, 
  UserCheck, 
  Database, 
  Globe, 
  Eye,
  Download,
  Cookie,
  Server,
  ChevronLeftIcon
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-6 md:px-20">
      <div className="max-w-5xl mx-auto">
        
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
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed mb-4">
            At <span className="font-semibold text-blue-600">GlobalTech School ERP</span>,
            we are committed to safeguarding your privacy and ensuring that your
            personal information remains secure and confidential.
          </p>
          <motion.div
            className="text-sm text-gray-400"
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

        {/* Privacy Policy Content */}
        <motion.div
          className="space-y-12 bg-white/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-100 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Section 1 */}
          <motion.div 
            className="flex items-start gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-blue-100 p-3 rounded-xl">
              <Shield className="text-blue-600 w-8 h-8 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                1. Information We Collect
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We collect various types of information to provide and improve our educational management services:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Personal Information</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Full name and contact details</li>
                    <li>Email address and phone number</li>
                    <li>Student ID and academic records</li>
                    <li>Parent/guardian information</li>
                    <li>Emergency contact details</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Usage Data</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Login credentials and activity</li>
                    <li>System usage patterns</li>
                    <li>Device information and IP address</li>
                    <li>Browser type and version</li>
                    <li>Academic performance data</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 2 */}
          <motion.div 
            className="flex items-start gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-blue-100 p-3 rounded-xl">
              <Lock className="text-blue-600 w-8 h-8 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your data helps us deliver a seamless educational experience while maintaining the highest security standards:
              </p>
              <div className="grid gap-3 text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Account Management:</strong> Create and maintain user accounts, authenticate logins, and manage user permissions</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Academic Operations:</strong> Process student records, manage grades, track attendance, and facilitate communication</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>System Improvement:</strong> Analyze usage patterns to enhance platform performance and user experience</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Communication:</strong> Send important notifications, academic updates, and security alerts</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Legal Compliance:</strong> Meet educational regulatory requirements and institutional obligations</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 3 */}
          <motion.div 
            className="flex items-start gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-blue-100 p-3 rounded-xl">
              <UserCheck className="text-blue-600 w-8 h-8 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                3. Data Sharing & Disclosure
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We maintain strict confidentiality and only share data under specific circumstances:
              </p>
              <div className="space-y-4 text-gray-600">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Authorized Sharing</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>With school administrators, teachers, and authorized staff for educational purposes</li>
                    <li>Trusted service providers under strict confidentiality agreements</li>
                    <li>Parents/guardians for student-related information (as appropriate)</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Legal Requirements</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>When required by law, court order, or government request</li>
                    <li>To protect our rights, property, or safety of our users</li>
                    <li>During business transfers, mergers, or acquisitions</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500 italic">
                  We never sell, trade, or rent personal user data to third parties for marketing purposes.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Section 4 */}
          <motion.div 
            className="flex items-start gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="bg-blue-100 p-3 rounded-xl">
              <Database className="text-blue-600 w-8 h-8 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                4. Data Security
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement comprehensive security measures to protect your information:
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Technical Safeguards</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      End-to-end encryption for data transmission
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Secure socket layer (SSL) technology
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Regular security audits and penetration testing
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Multi-factor authentication options
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Administrative Controls</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Role-based access control systems
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Regular employee security training
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Strict data handling policies
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      24/7 system monitoring and intrusion detection
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 5 */}
          <motion.div 
            className="flex items-start gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="bg-blue-100 p-3 rounded-xl">
              <Eye className="text-blue-600 w-8 h-8 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                5. Your Privacy Rights
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have control over your personal information with the following rights:
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Access & Control</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Access your personal data</li>
                    <li>✅ Correct inaccurate information</li>
                    <li>✅ Request data deletion</li>
                    <li>✅ Export your data</li>
                    <li>✅ Restrict processing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Preferences</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Opt-out of communications</li>
                    <li>✅ Manage cookie preferences</li>
                    <li>✅ Withdraw consent</li>
                    <li>✅ Object to processing</li>
                    <li>✅ File complaints</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 6 */}
          <motion.div 
            className="flex items-start gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="bg-blue-100 p-3 rounded-xl">
              <Cookie className="text-blue-600 w-8 h-8 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                6. Cookies & Tracking
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <div className="space-y-3 text-gray-600 text-sm">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Essential Cookies</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Required</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Performance Cookies</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Optional</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Functional Cookies</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Optional</span>
                </div>
                <p className="text-gray-500 italic">
                  You can manage your cookie preferences through your browser settings or our privacy dashboard.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Section 7 */}
          <motion.div 
            className="flex items-start gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
          >
            <div className="bg-blue-100 p-3 rounded-xl">
              <Server className="text-blue-600 w-8 h-8 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                7. Data Retention
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy, 
                unless a longer retention period is required or permitted by law. Student records are typically maintained 
                according to educational institution requirements and legal obligations.
              </p>
            </div>
          </motion.div>

          {/* Section 8 */}
          <motion.div 
            className="flex items-start gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="bg-blue-100 p-3 rounded-xl">
              <Globe className="text-blue-600 w-8 h-8 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                8. Contact Information
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                For privacy-related inquiries, data requests, or concerns about how we handle your information:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="mb-2 text-black">
                  📧 Email:{" "}
                  <a
                    href="mailto:tech@globaltechsoftwaresolutions.com"
                    className="text-blue-600 underline font-medium"
                  >
                    tech@globaltechsoftwaresolutions.com
                  </a>
                </p>
                <p className="mb-2 text-black">
                📞 Contact:{" "}
                <a
                    href="tel:+919844281875"
                    className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200"
                >
                    +91 98442 81875
                </a>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Compliance Notice */}
        <motion.div
          className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <h3 className="font-bold text-gray-800 mb-2">Compliance Standards</h3>
          <p className="text-gray-600 text-sm">
            GlobalTech School ERP complies with major privacy regulations including FERPA (Family Educational Rights and Privacy Act), 
            GDPR (General Data Protection Regulation), COPPA (Children's Online Privacy Protection Act), and other applicable 
            educational data protection laws.
          </p>
        </motion.div>
      </div>
    </section>
  );
}