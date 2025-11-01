"use client";

import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, MapPin, Save, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";

export default function Student_ProfilePage() {
  const [formData, setFormData] = useState({
    student_id: "",
    fullname: "",
    email: "",
    phone: "",
    class_name: "",
    class_enrolled: "",
    date_of_birth: "",
    admission_date: "",
    gender: "",
    address: "",
    profile_picture: "/default-avatar.png",
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_no: "",
    nationality: "",
    blood_group: "",
    parent: "",
    residential_address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      setIsLoading(true);
      try {
        const userInfoRaw = localStorage.getItem("userInfo");
        let email = "";
        if (userInfoRaw) {
          const userInfo = JSON.parse(userInfoRaw);
          email = userInfo?.email || "";
        }
        if (!email) return;

        const res = await fetch(`https://globaltechsoftwaresolutions.cloud/school-api/api/students/${email}/`);
        if (!res.ok) throw new Error("Failed to fetch student data");
        const data = await res.json();

        setFormData({
          student_id: data.student_id || "",
          fullname: data.fullname || data.user_details?.email?.split("@")[0] || "",
          email: data.email || data.user_details?.email || "",
          phone: data.phone || "",
          class_name: data.class_name || "",
          // ✅ Handle missing backend fields gracefully
          class_enrolled: data.class_enrolled || data.class_name || "",
          date_of_birth: data.date_of_birth || "",
          admission_date: data.admission_date || "",
          gender: data.gender || "",
          address: data.address || data.residential_address || "",
          profile_picture: data.profile_picture || "/default-avatar.png",
          emergency_contact_name: data.emergency_contact_name || "",
          emergency_contact_relationship: data.emergency_contact_relationship || "",
          emergency_contact_no: data.emergency_contact_no || "",
          nationality: data.nationality || "",
          blood_group: data.blood_group || "",
          parent: data.parent || "",
          residential_address: data.residential_address || "",
        });
      } catch (error) {
        console.error("Error loading student data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStudentData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, profile_picture: previewUrl }));

    try {
      const formDataPatch = new FormData();
      formDataPatch.append("profile_picture", file);
      const response = await fetch(`https://globaltechsoftwaresolutions.cloud/school-api/api/students/${formData.email}/`, {
        method: "PATCH",
        body: formDataPatch,
      });
      if (!response.ok) throw new Error("Failed to upload profile picture");
      const updated = await response.json();
      setFormData((prev) => ({
        ...prev,
        profile_picture: updated.profile_picture || prev.profile_picture,
      }));
    } catch (err) {
      console.error("Profile picture upload failed:", err);
    }
  };

  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("student_id", formData.student_id);
      formDataToSend.append("fullname", formData.fullname);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("date_of_birth", formData.date_of_birth);
      formDataToSend.append("class_name", formData.class_name);
      formDataToSend.append("class_enrolled", formData.class_enrolled);
      formDataToSend.append("admission_date", formData.admission_date);
      formDataToSend.append("emergency_contact_name", formData.emergency_contact_name);
      formDataToSend.append("emergency_contact_relationship", formData.emergency_contact_relationship);
      formDataToSend.append("emergency_contact_no", formData.emergency_contact_no);
      formDataToSend.append("nationality", formData.nationality);
      formDataToSend.append("blood_group", formData.blood_group);
      formDataToSend.append("parent", formData.parent);
      formDataToSend.append("residential_address", formData.residential_address);

      const res = await fetch(`https://globaltechsoftwaresolutions.cloud/school-api/api/students/${formData.email}/`, {
        method: "PATCH",
        body: formDataToSend,
      });
      if (!res.ok) throw new Error("Failed to update student data");
      const updated = await res.json();
      setFormData((prev) => ({
        ...prev,
        ...updated,
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="students">
        <div className="flex justify-center items-center h-screen text-gray-600">Loading student profile...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <motion.h1 className="text-3xl font-bold mb-4">Student Profile</motion.h1>

          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
              </button>
            </div>

            <div className="flex flex-col items-center">
              <label className="relative group cursor-pointer">
                <img
                  src={formData.profile_picture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 group-hover:opacity-80 transition"
                />
                {isEditing && (
                  <>
                    <span className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md group-hover:bg-blue-600 group-hover:text-white transition">
                      <Edit className="w-4 h-4 text-blue-600 group-hover:text-white" />
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Student ID</span>
                </label>
                <input
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
                </label>
                <input
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </label>
                <input
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone</span>
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Date of Birth</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Admission Date</span>
                </label>
                <input
                  type="date"
                  name="admission_date"
                  value={formData.admission_date}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <span>Class Name</span>
                </label>
                <input
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <span>Class Enrolled</span>
                </label>
                <input
                  name="class_enrolled"
                  value={formData.class_enrolled}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <span>Gender</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <span>Nationality</span>
                </label>
                <input
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <span>Blood Group</span>
                </label>
                <input
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Address</span>
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                <span>Residential Address</span>
              </label>
              <input
                name="residential_address"
                value={formData.residential_address}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Emergency Contact Name</span>
                </label>
                <input
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <span>Emergency Contact Relationship</span>
                </label>
                <input
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Emergency Contact Number</span>
                </label>
                <input
                  name="emergency_contact_no"
                  value={formData.emergency_contact_no}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Parent</span>
              </label>
              <input
                name="parent"
                value={formData.parent}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
              />
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
