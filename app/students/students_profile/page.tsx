"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Edit, Save, Camera, Phone, Calendar, MapPin, User, Mail, Globe, Heart, Shield, Home } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { motion } from "framer-motion";

type Student = {
  email: string;
  fullname: string;
  student_id: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  admission_date: string;
  class_name: string;
  section: string;
  profile_picture: string;
  residential_address: string | null;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_no: string;
  nationality: string;
  blood_group: string;
  parent: string;
};

export default function Student_Profile() {
  const [student, setStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/students/";

  // ✅ Fetch student details
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        // Get email from multiple localStorage sources
        const userInfo = localStorage.getItem("userInfo");
        const userData = localStorage.getItem("userData");
        
        let email = "";
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          email = parsed.email;
        } else if (userData) {
          const parsed = JSON.parse(userData);
          email = parsed.email;
        }

        if (!email) {
          console.error("No email found in localStorage");
          return;
        }

        // Fetch student and classes data in parallel
        const [studentRes, classesRes] = await Promise.all([
          fetch(`${API_URL}${email}/`),
          fetch("https://globaltechsoftwaresolutions.cloud/school-api/api/classes/")
        ]);

        if (!studentRes.ok) throw new Error("Failed to fetch student");

        const data = await studentRes.json();
        const classesData = await classesRes.json();

        // Find class details for this student
        const classDetail = classesData.find(
          (c: any) => c.id === data.class_id
        );

        // Enrich student with class information
        const enrichedStudent = {
          ...data,
          section: classDetail?.sec ,
          class_name: classDetail?.class_name,
        };

        setStudent(enrichedStudent);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, []);

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!student) return;
    const { name, value } = e.target;
    setStudent({ ...student, [name]: value });
  };

  // ✅ Handle profile picture upload
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!student || !e.target.files?.length) return;

    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("profile_picture", file);

      const res = await fetch(`${API_URL}${student.email}/`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Image upload failed");
      }

      const updated = await res.json();
      setStudent((prev) => (prev ? { ...prev, profile_picture: updated.profile_picture } : null));
      
      // Show success popup
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (err) {
      console.error("Profile picture upload error:", err);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // ✅ Save edits (PATCH request)
  const handleSave = async () => {
    if (!student) return;
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}${student.email}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });

      if (!res.ok) throw new Error("Failed to update student");

      const updated = await res.json();
      setStudent(updated);
      setIsEditing(false);
      
      // Show success popup
      setShowSuccessPopup(true);
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
      
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            </motion.div>
            <p className="text-gray-600 text-lg">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout role="students">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600">Unable to load student profile. Please try again.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Profile</h1>
            <p className="text-gray-600">Manage your personal and academic information</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Profile Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                {/* Profile Image */}
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 p-1.5">
                    <img
                      src={student.profile_picture || "/default-avatar.png"}
                      alt="Profile"
                      className="w-full h-full rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  {isEditing && (
                    <motion.label 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
                    </motion.label>
                  )}
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{student.fullname}</h2>
                <p className="text-gray-500 text-sm mb-4">ID: {student.student_id}</p>
                
                {/* Academic Badge */}
                <div className=" text-black rounded-xl p-3 mb-4">
                  <div className="text-sm font-medium">Class Name:{student.class_name}</div>
                  <div className="text-xs opacity-90">Section: {student.section}</div>
                </div>

                {/* Edit Toggle Button */}
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                ) : (
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? "Saving..." : "Save Changes"}
                    </motion.button>
                    <button
                      onClick={handleCancel}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Profile Details */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                
                {/* Section 1: Personal Information */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EnhancedInputField label="Full Name" name="fullname" value={student.fullname} disabled={!isEditing} onChange={handleChange} />
                    <EnhancedInputField label="Email" name="email" icon={Mail} value={student.email} disabled onChange={handleChange} />
                    <EnhancedInputField label="Phone" name="phone" icon={Phone} value={student.phone} disabled={!isEditing} onChange={handleChange} />
                    <EnhancedInputField label="Date of Birth" name="date_of_birth" type="date" value={student.date_of_birth} disabled={!isEditing} onChange={handleChange} />
                    <EnhancedInputField label="Gender" name="gender" value={student.gender} disabled={!isEditing} onChange={handleChange} />
                    <EnhancedInputField label="Nationality" name="nationality" icon={Globe} value={student.nationality} disabled={!isEditing} onChange={handleChange} />
                  </div>
                </div>

                {/* Section 2: Academic Information */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Academic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EnhancedInputField label="Student ID" name="student_id" value={student.student_id} disabled onChange={handleChange} />
                    <EnhancedInputField label="Class" name="class_name" value={student.class_name} disabled onChange={handleChange} />
                    <EnhancedInputField label="Section" name="section" value={student.section} disabled onChange={handleChange} />
                    <EnhancedInputField label="Admission Date" name="admission_date" type="date" value={student.admission_date} disabled onChange={handleChange} />
                  </div>
                </div>

                {/* Section 3: Additional Details */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Additional Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EnhancedInputField label="Blood Group" name="blood_group" value={student.blood_group} disabled={!isEditing} onChange={handleChange} />
                    <EnhancedInputField label="Parent/Guardian" name="parent" value={student.parent} disabled={!isEditing} onChange={handleChange} />
                  </div>
                </div>

                {/* Section 4: Address & Emergency Contact */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Home className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Address & Emergency Contact</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <EnhancedInputField label="Residential Address" name="residential_address" icon={MapPin} value={student.residential_address || ""} disabled={!isEditing} onChange={handleChange} fullWidth />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <EnhancedInputField label="Emergency Contact Name" name="emergency_contact_name" value={student.emergency_contact_name} disabled={!isEditing} onChange={handleChange} />
                      <EnhancedInputField label="Relationship" name="emergency_contact_relationship" value={student.emergency_contact_relationship} disabled={!isEditing} onChange={handleChange} />
                      <EnhancedInputField label="Contact Number" name="emergency_contact_no" value={student.emergency_contact_no} disabled={!isEditing} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Success Popup */}
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center"
            >
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Success Message */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Profile Updated Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Your changes have been saved successfully.
              </p>

              {/* Close Button */}
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

type EnhancedInputProps = {
  label: string;
  name: string;
  icon?: React.ElementType;
  value: string;
  type?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

const EnhancedInputField: React.FC<EnhancedInputProps> = ({ 
  label, 
  name, 
  icon: Icon, 
  value, 
  type = "text", 
  disabled = false, 
  fullWidth = false,
  onChange 
}) => (
  <motion.div 
    whileHover={{ scale: 1.01 }}
    className={`${fullWidth ? 'col-span-full' : ''}`}
  >
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value || ""}
        disabled={disabled}
        onChange={onChange}
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
          disabled 
            ? "bg-gray-50 text-gray-500 cursor-not-allowed" 
            : "bg-white text-gray-900 hover:border-gray-400"
        } ${Icon ? 'pl-10' : ''}`}
      />
    </div>
  </motion.div>
);