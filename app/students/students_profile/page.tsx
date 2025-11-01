"use client";

import React, { useEffect, useState, useCallback } from "react";
import { User, Mail, Phone, Calendar, MapPin, Save, Edit, Camera, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";

// Memoized InputField component with proper typing
type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  icon?: React.ElementType;
  type?: string;
  disabled?: boolean;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

const InputField: React.FC<InputFieldProps> = React.memo(
  ({
    label,
    name,
    value,
    icon: Icon,
    type = "text",
    disabled = false,
    className = "",
    onChange,
  }) => {
    return (
      <div className={className}>
        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-blue-600" />}
          <span>{label}</span>
        </label>
        {type === "select" ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white disabled:bg-gray-100 disabled:text-gray-500"
          />
        )}
      </div>
    );
  }
);

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
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const loadStudentData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const email = localStorage.getItem("userEmail");
        
        if (!token && !email) {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return;
        }
        
        if (!email) return;

        const apiUrl = `https://globaltechsoftwaresolutions.cloud/school-api/api/students/${email}/`;
        const res = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch student info");
        }

        const data = await res.json();

        const processed = {
          student_id: data.student_id ?? "",
          fullname: data.fullname ?? "",
          email: data.email ?? data.user_details?.email ?? "",
          phone: data.phone ?? "",
          class_name: data.class_name ?? "",
          admission_date: data.admission_date ?? "",
          date_of_birth: data.date_of_birth ?? "",
          gender: data.gender ?? "",
          profile_picture: data.profile_picture || "/default-avatar.png",
          parent: data.parent_name && data.parent_name.trim() !== "" ? data.parent_name : data.parent ?? "",
          address: data.residential_address ?? "",
          nationality: data.nationality ?? "",
          blood_group: data.blood_group ?? "",
          emergency_contact_name: data.emergency_contact_name ?? "",
          emergency_contact_no: data.emergency_contact_no ?? "",
          emergency_contact_relationship: data.emergency_contact_relationship ?? "",
          residential_address: data.residential_address ?? "",
          class_enrolled: data.class_name ?? "",
        };
        setFormData(processed);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentData();
  }, []);

  // Simplified handleChange without useCallback to avoid stale closures
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const previewUrl = URL.createObjectURL(file);
    setUploadingImage(true);
    
    setFormData(prev => ({ ...prev, profile_picture: previewUrl }));

    try {
      const formDataPatch = new FormData();
      formDataPatch.append("profile_picture", file);
      const email = localStorage.getItem("userEmail") || formData.email;
      const apiUrl = `https://globaltechsoftwaresolutions.cloud/school-api/api/students/${email}/`;
      
      const response = await fetch(apiUrl, {
        method: "PATCH",
        body: formDataPatch,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload profile picture");
      }
      
      const updated = await response.json();
      setFormData(prev => ({
        ...prev,
        profile_picture: updated.profile_picture || prev.profile_picture,
      }));
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
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

      const email = localStorage.getItem("userEmail") || formData.email;
      const apiUrl = `https://globaltechsoftwaresolutions.cloud/school-api/api/students/${email}/`;
      
      const res = await fetch(apiUrl, {
        method: "PATCH",
        body: formDataToSend,
      });
      
      if (!res.ok) {
        throw new Error("Failed to update student data");
      }
      
      const updated = await res.json();
      setFormData(prev => ({
        ...prev,
        ...updated,
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving data:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-lg">Loading student profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
              Student Profile
            </h1>
            <p className="text-gray-600 text-lg">Manage your personal information and preferences</p>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{formData.fullname}</h2>
                  <p className="text-blue-100">{formData.student_id} • {formData.class_name}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 font-semibold flex items-center space-x-2 shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
                </motion.button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <div className="relative">
                    <img
                      src={formData.profile_picture}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-blue-600 bg-opacity-50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:scale-110">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  )}
                </motion.div>
                <div className="text-center mt-4">
                  <h3 className="text-xl font-semibold text-gray-800">{formData.fullname}</h3>
                  <p className="text-gray-600">{formData.email}</p>
                </div>
              </div>

              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                  
                  <InputField
                    label="Student ID"
                    name="student_id"
                    value={formData.student_id}
                    icon={User}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                  
                  <InputField
                    label="Full Name"
                    name="fullname"
                    value={formData.fullname}
                    icon={User}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                  
                  <InputField
                    label="Email"
                    name="email"
                    value={formData.email}
                    icon={Mail}
                    disabled={true}
                    onChange={handleChange}
                  />
                  
                  <InputField
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    icon={Phone}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                  
                  <InputField
                    label="Date of Birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    icon={Calendar}
                    type="date"
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                  
                  <InputField
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    type="select"
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Academic Information</h3>
                  
                  <InputField
                    label="Class Name"
                    name="class_name"
                    value={formData.class_name}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                  
                  <InputField
                    label="Class Enrolled"
                    name="class_enrolled"
                    value={formData.class_enrolled}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                  
                  <InputField
                    label="Admission Date"
                    name="admission_date"
                    value={formData.admission_date}
                    icon={Calendar}
                    type="date"
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                  
                  <InputField
                    label="Nationality"
                    name="nationality"
                    value={formData.nationality}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                  
                  <InputField
                    label="Blood Group"
                    name="blood_group"
                    value={formData.blood_group}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Address Information</h3>
                
                <InputField
                  label="Address"
                  name="address"
                  value={formData.address}
                  icon={MapPin}
                  disabled={!isEditing}
                  onChange={handleChange}
                />
                
                <InputField
                  label="Residential Address"
                  name="residential_address"
                  value={formData.residential_address}
                  disabled={!isEditing}
                  onChange={handleChange}
                />
              </div>

              {/* Emergency Contact */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Emergency Contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="Contact Name"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    icon={User}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                  
                  <InputField
                    label="Relationship"
                    name="emergency_contact_relationship"
                    value={formData.emergency_contact_relationship}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                  
                  <InputField
                    label="Contact Number"
                    name="emergency_contact_no"
                    value={formData.emergency_contact_no}
                    icon={Phone}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Parent Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Parent Information</h3>
                
                <InputField
                  label="Parent/Guardian"
                  name="parent"
                  value={formData.parent}
                  icon={User}
                  disabled={!isEditing}
                  onChange={handleChange}
                />
              </div>

              {/* Save Button */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-end space-x-4 border-t border-gray-200 pt-6 flex-wrap gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-semibold flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                    </motion.button>
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