"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  User,
  Edit3,
  Save,
  X,
  Camera,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Users,
  CheckCircle,
  XCircle
} from "lucide-react";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

interface Child {
  name?: string;
  email?: string;
  class?: string;
}

interface ParentData {
  email: string;
  fullname?: string;
  phone?: string;
  occupation?: string;
  residential_address?: string;
  relationship_to_student?: string;
  profile_picture?: string;
  children_list?: Child[];
}

const ParentProfilePage = () => {
  const [parentEmail, setParentEmail] = useState("");

  const [parentData, setParentData] = useState<ParentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // ✅ Fetch parent info (email from localStorage)
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      setParentEmail(parsed.email);
      fetchParentDetails(parsed.email);
    }
  }, []);

  // ✅ Fetch parent data from API
  const fetchParentDetails = async (email: string) => {
    try {
      const res = await axios.get<ParentData[]>(`${API_BASE}/parents/`);
      const foundParent = res.data.find((p: ParentData) => p.email === email);
      if (foundParent) {
        setParentData(foundParent);
      } else {
        console.error("Parent not found for email:", email);
      }
    } catch (err) {
      console.error("Error fetching parent details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setParentData((prev) => prev ? {
      ...prev,
      [e.target.name]: e.target.value,
    } : null);
  };

  // ✅ Handle profile picture upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileFile(e.target.files[0]);
    }
  };

  // ✅ Show popup
  const showPopup = (type: 'success' | 'error', message: string) => {
    setPopupMessage(message);
    if (type === 'success') {
      setShowSuccessPopup(true);
    } else {
      setShowErrorPopup(true);
    }
    setTimeout(() => {
      setShowSuccessPopup(false);
      setShowErrorPopup(false);
    }, 4000);
  };

  // ✅ Update parent profile
  const handleUpdate = async () => {
    if (!parentData || !parentData.email) {
      showPopup('error', "Parent email not found — cannot update profile!");
      return;
    }

    setSaving(true);
    try {
      const sanitizedBase = API_BASE.replace(/\/$/, "");
      const encodedEmail = encodeURIComponent(parentData.email);

      const updatedData: Record<string, string> = {
        fullname: parentData.fullname || "",
        phone: parentData.phone || "",
        occupation: parentData.occupation || "",
        residential_address: parentData.residential_address || "",
        relationship_to_student: parentData.relationship_to_student || "",
      };

      // If profile picture changed, prepare FormData for upload
      if (profileFile) {
        const uploadData = new FormData();
        uploadData.append("profile_picture", profileFile);
        Object.keys(updatedData).forEach((key) => {
          uploadData.append(key, updatedData[key]);
        });

        const res = await axios.patch(`${sanitizedBase}/parents/${encodedEmail}/`, uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setParentData(res.data);
      } else {
        const res = await axios.patch(`${sanitizedBase}/parents/${encodedEmail}/`, updatedData);
        setParentData(res.data);
      }

      showPopup('success', "Profile updated successfully!");
      setIsEditing(false);
      setProfileFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      showPopup('error', "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setProfileFile(null);
    fetchParentDetails(parentEmail); // Reset to original data
  };

  if (loading) {
    return (
      <DashboardLayout role="parents">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!parentData) {
    return (
      <DashboardLayout role="parents">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Parent Not Found</h3>
            <p className="text-gray-600">Unable to load parent profile data.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parents">
      <div className="min-h-screen bg-gray-50/30 p-6">
        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-80">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-800 font-medium">Success</p>
                <p className="text-green-700 text-sm">{popupMessage}</p>
              </div>
              <button onClick={() => setShowSuccessPopup(false)} className="text-green-600 hover:text-green-800">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error Popup */}
        {showErrorPopup && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-80">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{popupMessage}</p>
              </div>
              <button onClick={() => setShowErrorPopup(false)} className="text-red-600 hover:text-red-800">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Parent Profile</h1>
            <p className="text-gray-600 mt-2">Manage your personal information and profile settings</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-8 text-white">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white relative">
                    {profileFile ? (
                      <Image
                        src={URL.createObjectURL(profileFile)}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={parentData.profile_picture || "/default-profile.png"}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="h-6 w-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="text-center md:text-left flex-1">
                  <h2 className="text-2xl font-bold mb-2">{parentData.fullname || "Parent"}</h2>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <Mail className="h-4 w-4 text-blue-200" />
                    <p className="text-blue-100">{parentData.email}</p>
                  </div>
                  <p className="text-blue-200">{parentData.occupation || "Parent"}</p>
                </div>

                <div className="flex gap-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 border border-white/30"
                    >
                      <Edit3 className="h-5 w-5" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 border border-white/30"
                      >
                        <X className="h-5 w-5" />
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg disabled:opacity-50"
                      >
                        <Save className="h-5 w-5" />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                    Personal Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullname"
                        value={parentData.fullname || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-xl transition-colors ${isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                          }`}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={parentData.email || ""}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={parentData.phone || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-xl transition-colors ${isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                          }`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional & Contact Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                    Additional Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        Occupation
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={parentData.occupation || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-xl transition-colors ${isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                          }`}
                        placeholder="Enter your occupation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        Relationship to Student
                      </label>
                      <input
                        type="text"
                        name="relationship_to_student"
                        value={parentData.relationship_to_student || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-xl transition-colors ${isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                          }`}
                        placeholder="e.g., Father, Mother, Guardian"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        Residential Address
                      </label>
                      <textarea
                        name="residential_address"
                        value={parentData.residential_address || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-xl resize-none transition-colors ${isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                          }`}
                        placeholder="Enter your residential address"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Children Information (Read-only) */}
              {parentData.children_list && parentData.children_list.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Your Children ({parentData.children_list.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parentData.children_list.map((child: Child, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{child.name || "Child"}</h4>
                            <p className="text-sm text-gray-600">{child.email || "No email"}</p>
                            <p className="text-xs text-gray-500">{child.class || "No class info"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentProfilePage;