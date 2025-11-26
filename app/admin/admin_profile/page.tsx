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
  BookOpen,
  CheckCircle,
  X
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
    subjects: [] as string[],
    profile_picture: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab ] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // ✅ Load admin data from live API when page opens
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Get email from localStorage.userInfo (parse as JSON)
        let email = "";
        try {
          const userInfoRaw = localStorage.getItem("userInfo");
          if (userInfoRaw) {
            const userInfo = JSON.parse(userInfoRaw);
            if (userInfo?.email) email = userInfo.email;
          }
        } catch (err) {
          // Ignore parse error, fallback to empty email
        }
        if (!email) {
          console.warn("No admin email found in localStorage.userInfo. Cannot load profile.");
          setIsLoading(false);
          return;
        }
        const response = await fetch(`https://school.globaltechsoftwaresolutions.cloud/api/admins/${email}/`);
        if (!response.ok) throw new Error("Failed to fetch admin data");
        const data = await response.json();
        // Format joinDate as YYYY-MM-DD if possible
        let joinDate = "";
        if (data.user_details?.created_at) {
          // Try to parse and format as YYYY-MM-DD
          const dt = new Date(data.user_details.created_at);
          if (!isNaN(dt.getTime())) {
            // ISO string is yyyy-mm-ddTHH:MM:SSZ, so take substring
            joinDate = dt.toISOString().slice(0, 10);
          } else if (typeof data.user_details.created_at === "string" && data.user_details.created_at.includes(" ")) {
            // fallback to split by space
            joinDate = data.user_details.created_at.split(" ")[0];
          }
        }
        setFormData({
          name: data.fullname || data.user_details?.email?.split("@")[0] || "",
          email: data.email || data.user_details?.email || "",
          phone: data.phone || "",
          role: data.user_details?.role || "Admin",
          department: data.department || "School Administration",
          joinDate: joinDate,
          address: data.office_address || "",
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
          profile_picture: data.profile_picture || "/default-avatar.png"
        });
      } catch (err) {
        console.error("Error loading admin profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  // ✅ Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle profile picture change: upload directly to PATCH endpoint with FormData
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    // Show instant local preview
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, profile_picture: previewUrl }));

    try {
      setIsLoading(true);
      const formDataPatch = new FormData();
      formDataPatch.append("profile_picture", file);
      // Optionally, send other fields if backend requires (here, only picture for this change)
      const response = await fetch(`https://school.globaltechsoftwaresolutions.cloud/api/admins/${formData.email}/`, {
        method: "PATCH",
        body: formDataPatch,
      });
      if (!response.ok) throw new Error("Failed to upload profile picture");
      const updatedData = await response.json();
      setFormData((prev) => ({
        ...prev,
        profile_picture: updatedData.profile_picture || prev.profile_picture,
        // Optionally update other fields if returned
        name: updatedData.fullname || prev.name,
        phone: updatedData.phone || prev.phone,
        address: updatedData.office_address || prev.address
      }));
      // Show success notification
      const event = new CustomEvent('notification', {
        detail: {
          type: 'success',
          message: 'Profile picture updated successfully!'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Save updated data using PATCH and FormData (not JSON)
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullname", formData.name);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("office_address", formData.address);
      formDataToSend.append("department", formData.department);

      // Only append profile_picture if it's a file (not just a URL string)
      const fileInput = document.querySelector('input[type="file"][accept^="image"]') as HTMLInputElement | null;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formDataToSend.append("profile_picture", fileInput.files[0]);
      }

      const response = await fetch(`https://school.globaltechsoftwaresolutions.cloud/api/admins/${formData.email}/`, {
        method: "PATCH",
        body: formDataToSend,
      });
      if (!response.ok) throw new Error("Failed to update profile");
      const updatedData = await response.json();
      setFormData((prev) => ({
        ...prev,
        name: updatedData.fullname || prev.name,
        phone: updatedData.phone || prev.phone,
        address: updatedData.office_address || prev.address,
        department: updatedData.department || prev.department,
        profile_picture: updatedData.profile_picture || prev.profile_picture
      }));
      setIsEditing(false);
      setShowSuccessPopup(true);
      
      // Auto-close popup after 3 seconds
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 right-6 z-50"
          >
            <div className="bg-white rounded-lg shadow-lg border-l-4 border-green-500 p-4 w-96 flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Profile Updated!</h3>
                <p className="text-sm text-gray-600 mt-1">Your profile has been successfully updated.</p>
              </div>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <div className="space-y-6">
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
                        {/* Profile Picture with clickable overlay and hidden input */}
                        <div className="flex justify-center mb-6 flex-col items-center">
                          <label className="relative cursor-pointer group">
                            <img
                              src={formData.profile_picture || "/default-avatar.png"}
                              alt="Profile Picture"
                              className="rounded-full w-24 h-24 object-cover border-2 border-gray-200 group-hover:opacity-80 transition"
                            />
                            {isEditing && (
                              <>
                                <span className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md group-hover:bg-blue-600 transition group-hover:text-white">
                                  <Edit className="w-5 h-5 text-blue-600 group-hover:text-white" />
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleProfilePictureChange}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  tabIndex={-1}
                                />
                              </>
                            )}
                          </label>
                        </div>

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

                        {/* Save Button */}
                        {isEditing && (
                          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 transition-all duration-200">
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
                          </div>
                        )}
                      </div>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}