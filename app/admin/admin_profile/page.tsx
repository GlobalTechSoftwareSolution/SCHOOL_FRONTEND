"use client";

import React, { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Save, 
  Edit, 
  Calendar,
  MapPin,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";

export default function Admin_ProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    joinDate: "",
    address: "",
    bio: "",
    subjects: [] as string[]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab ] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Load realistic dummy data when page opens
  useEffect(() => {
    const loadUserData = () => {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const sampleUser = {
          name: "Dr. Mani Kumar",
          email: "mani.kumar@greenwood.edu",
          phone: "+91 98442 81875",
          role: "Administrator",
          department: "School Administration",
          joinDate: "2022-08-15",
          address: "Greenwood International School, Sector 45, Chennai - 600045",
          bio: "Dedicated administrator with 8+ years of experience in educational management. Passionate about leveraging technology to enhance learning experiences.",
          subjects: ["School Management", "Academic Planning", "Staff Coordination"]
        };
        setFormData(sampleUser);
        setIsLoading(false);
      }, 1000);
    };

    loadUserData();
  }, []);

  // ✅ Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save updated data
  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("userProfile", JSON.stringify(formData));
      setIsEditing(false);
      setIsLoading(false);
      
      // Show success notification
      const event = new CustomEvent('notification', {
        detail: { 
          type: 'success', 
          message: 'Profile updated successfully!' 
        }
      });
      window.dispatchEvent(event);
    }, 800);
  };

  // ✅ Cancel editing
  const handleCancel = () => {
    // Reload original data
    const originalData = JSON.parse(localStorage.getItem("userProfile") || "{}");
    if (Object.keys(originalData).length > 0) {
      setFormData(originalData);
    }
    setIsEditing(false);
  };
  
  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Main Content */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-bold text-white">Profile Information</h2>
                          <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span>Full Name</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span>Email Address</span>
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>Phone Number</span>
                            </label>
                            <input
                              type="text"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                              <Briefcase className="w-4 h-4" />
                              <span>Role</span>
                            </label>
                            <select
                              name="role"
                              value={formData.role}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                            >
                              <option value="Administrator">Administrator</option>
                              <option value="Principal">Principal</option>
                              <option value="Teacher">Teacher</option>
                              <option value="Staff">Staff</option>
                              <option value="Management">Management</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                              <BookOpen className="w-4 h-4" />
                              <span>Department</span>
                            </label>
                            <input
                              type="text"
                              name="department"
                              value={formData.department}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>Join Date</span>
                            </label>
                            <input
                              type="date"
                              name="joinDate"
                              value={formData.joinDate}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>Address</span>
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                          />
                        </div>

                        {/* Bio */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors resize-none"
                          />
                        </div>

                        {/* Save Button */}
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-end space-x-3 pt-4 border-t border-gray-200"
                          >
                            <button
                              onClick={handleCancel}
                              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSave}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                              <Save className="w-4 h-4" />
                              <span>Save Changes</span>
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}