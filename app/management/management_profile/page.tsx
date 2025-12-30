"use client";
import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import axios from "axios";
import Image from "next/image";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiEdit2,
  FiSave,
  FiX,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiCamera,
  FiAward,
  FiFileText,
  FiUpload
} from "react-icons/fi";
import { MdWorkHistory, MdEmail } from "react-icons/md";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://school.globaltechsoftwaresolutions.cloud/api";

interface ApiError {
  response?: {
    data?: {
      message?: string;
      detail?: string;
    };
    status?: number;
  };
  message?: string;
}

interface ManagementUser {
  id?: number | string;
  pk?: number | string;
  fullname?: string;
  email?: string;
  designation?: string;
  phone?: string;
  department?: string;
  department_name?: string;
  address?: string;
  office_address?: string;
  qualification?: string;
  date_of_birth?: string;
  date_joined?: string;
  profile_picture?: string;
  user_details?: {
    id?: number | string;
    email?: string;
    role?: string;
    is_active?: boolean;
    is_approved?: boolean;
    created_at?: string;
  };
}

interface FormData {
  fullname: string;
  email: string;
  designation: string;
  phone: string;
  department: string;
  address: string;
  office_address: string;
  qualification: string;
  date_of_birth: string;
  date_joined: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const ManagementProfilePage = () => {
  const [management, setManagement] = useState<ManagementUser | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullname: "",
    email: "",
    designation: "",
    phone: "",
    department: "",
    department_name: "",
    address: "",
    office_address: "",
    qualification: "",
    date_of_birth: "",
    date_joined: ""
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [identifier, setIdentifier] = useState<string | number | null>(null);

  // ✅ Resolve Image URL
  const resolveImageUrl = (path: string | null | undefined, addTimestamp = false): string => {
    if (!path) return "/default-avatar.png";

    let resolvedUrl = path;
    if (!path.startsWith("http")) {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://school.globaltechsoftwaresolutions.cloud";
      const cleanBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      resolvedUrl = `${cleanBase}${cleanPath}`;
    }

    if (addTimestamp) {
      return `${resolvedUrl}${resolvedUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }
    return resolvedUrl;
  };

  const fetchManagementProfile = useCallback(async (email: string) => {
    try {
      setLoading(true);
      let profile: ManagementUser | null = null;

      // ✅ Get token for authentication if available
      const token = typeof window !== 'undefined' ? (localStorage.getItem("accessToken") || localStorage.getItem("token")) : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // ✅ Strategy 1: Try to fetch individual profile by email (singular, no trailing slash)
      try {
        console.log(`[PROFILE FETCH] Trying Strategy 1: ${API_BASE}/management/${email}`);
        const response = await axios.get(`${API_BASE}/management/${email}`, { headers });
        if (response.data) {
          profile = response.data;
          console.log("Fetched management profile by email:", profile);
        }
      } catch (e) {
        console.warn("Individual profile fetch by email failed, falling back to Strategy 2 (list search)", e);
      }

      // ✅ Strategy 2: Fallback to list search if detail fetch failed
      if (!profile) {
        try {
          const res = await axios.get(`${API_BASE}/management/`, { headers });
          const allManagers = res.data || [];
          const profileData = allManagers.find((m: any) => m.email === email || m.user_details?.email === email);
          if (profileData) {
            profile = profileData;
            console.log("Found profile in list search:", profile);
          } else {
            console.warn("Profile not found in management list", { email, count: allManagers.length });
          }
        } catch (err) {
          console.error("Management list search failed:", err);
        }
      }

      if (profile) {
        // Use a non-nullable local variable to satisfy TypeScript after await calls
        let activeProfile: ManagementUser = profile;
        console.log("COMPLETED PROFILE OBJECT:", activeProfile);
        console.log("PROFILE FIELDS:", Object.keys(activeProfile));

        // Detailed ID detection
        let detectedId = (activeProfile as any).id || (activeProfile as any).pk || (activeProfile as any).management_id || (activeProfile as any).user_details?.id;

        // Strategy 2b: If Strategy 1 succeeded but ID is missing, try to find it in the list search
        if (!detectedId) {
          console.warn("Detail fetch worked but ID missing. Searching list for ID...");
          try {
            const listRes = await axios.get(`${API_BASE}/management/`, { headers });
            const allManagers = listRes.data || [];
            const listProfile = allManagers.find((m: any) => m.email === email || m.user_details?.email === email);
            if (listProfile) {
              detectedId = listProfile.id || listProfile.pk || listProfile.management_id || listProfile.user_details?.id;
              console.log("Found ID in list search:", detectedId);
              // Merge any missing fields from list profile if necessary
              activeProfile = { ...listProfile, ...activeProfile };
              profile = activeProfile;
            }
          } catch (listErr) {
            console.error("Failsafe list search failed:", listErr);
          }
        }

        console.log("DETECTED ID FOR UPDATE:", detectedId);

        if (detectedId) {
          setIdentifier(detectedId);
        } else {
          setIdentifier(email);
        }
        setManagement(activeProfile);
        // Set profile photo if available
        if (activeProfile.profile_picture) {
          setProfilePhoto(resolveImageUrl(activeProfile.profile_picture));
        }
        setFormData({
          fullname: activeProfile.fullname || "",
          email: activeProfile.email || activeProfile.user_details?.email || "",
          designation: activeProfile.designation || "",
          phone: activeProfile.phone || "",
          department: activeProfile.department || "",
          department_name: activeProfile.department_name || "",
          address: activeProfile.address || "",
          office_address: activeProfile.office_address || "",
          qualification: activeProfile.qualification || "",
          date_of_birth: activeProfile.date_of_birth || "",
          date_joined: activeProfile.date_joined || "",
          ...activeProfile
        });
      } else {
        showError("No management record found for this email");
      }
    } catch (error) {
      console.error("Error fetching management data:", error);
      showError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.email) {
        fetchManagementProfile(parsed.email);
      }
    }
  }, [fetchManagementProfile]);

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorPopup(true);
  };

  const showSuccess = () => {
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 3000);
  };

  // Profile photo handling functions
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size should be less than 5MB');
      return;
    }

    // ✅ Only preview locally, don't upload yet
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfilePhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('profile-photo-input') as HTMLInputElement;
    fileInput?.click();
  };

  const handleSave = async () => {
    if (!management) {
      showError("No management record found to update");
      return;
    }

    setSaving(true);
    try {
      if (!identifier) {
        showError("Management identifier (ID or Email) missing. Cannot update.");
        return;
      }

      // ✅ Use FormData to support image upload and regular fields together
      const saveFormData = new FormData();

      // ✅ Helper to append and sanitize data (prevent "null" strings)
      const appendSanitized = (key: string, value: any) => {
        if (value === null || value === undefined || value === "null" || value === "undefined") {
          // Send empty string or omit for ForeignKey fields if backend allows null
          saveFormData.append(key, "");
        } else {
          saveFormData.append(key, String(value));
        }
      };

      appendSanitized("fullname", formData.fullname);
      appendSanitized("designation", formData.designation);
      appendSanitized("phone", formData.phone);
      appendSanitized("department", formData.department);
      appendSanitized("department_name", formData.department_name || formData.department);
      appendSanitized("address", formData.address);
      appendSanitized("office_address", formData.office_address || formData.address);
      appendSanitized("qualification", formData.qualification);
      appendSanitized("date_of_birth", formData.date_of_birth);
      appendSanitized("date_joined", formData.date_joined);

      if (selectedImage) {
        saveFormData.append("profile_picture", selectedImage);
      }

      const identifierStr = String(identifier);
      const token = typeof window !== 'undefined' ? (localStorage.getItem("accessToken") || localStorage.getItem("token")) : null;
      const patchHeaders: Record<string, string> = {};
      if (token) {
        patchHeaders['Authorization'] = `Bearer ${token}`;
      }

      console.log(`Sending PATCH request to: ${API_BASE}/management/${identifierStr}`);
      console.log("PATCH PAYLOAD:", Object.fromEntries((saveFormData as any).entries()));

      const response = await axios.patch(
        `${API_BASE}/management/${identifierStr}`,
        saveFormData,
        {
          headers: patchHeaders,
        }
      );

      setManagement(response.data);
      console.log("Successfully updated management profile:", response.data);
      showSuccess();
      setEditing(false);
      setSelectedImage(null);

      // Update form data with new values
      setFormData({
        ...formData,
        ...response.data
      });

      if (response.data.profile_picture) {
        setProfilePhoto(resolveImageUrl(response.data.profile_picture, true));
      }
    } catch (error: any) {
      console.error("Error updating management profile:", error);

      let errorMsg = "Failed to update profile. Please try again.";
      if (error.response?.data) {
        // Extract error details if available (common in DRF)
        const details = error.response.data;
        if (typeof details === 'object') {
          const errors = Object.entries(details)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
            .join(" | ");
          if (errors) errorMsg = `Update failed: ${errors}`;
        } else if (typeof details === 'string') {
          errorMsg = details;
        }
      }
      showError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullname: management?.fullname || "",
      email: management?.email || management?.user_details?.email || "",
      designation: management?.designation || "",
      phone: management?.phone || "",
      department: management?.department || "",
      department_name: management?.department_name || "",
      address: management?.address || "",
      office_address: management?.office_address || "",
      qualification: management?.qualification || "",
      date_of_birth: management?.date_of_birth || "",
      date_joined: management?.date_joined || "",
      ...management
    });
    setEditing(false);
  };

  // Success Notification
  const SuccessNotification = () => (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-lg px-6 py-4 flex items-center space-x-3 max-w-sm">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <FiCheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800">Profile Updated Successfully</p>
          <p className="text-xs text-green-700 mt-0.5">Your changes have been saved.</p>
        </div>
        <button
          onClick={() => setShowSuccessPopup(false)}
          className="text-green-500 hover:text-green-700 text-sm font-medium px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Error Notification
  const ErrorNotification = () => (
    <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 shadow-sm animate-shake">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <FiX className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-red-800">Update Error</p>
          <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
        </div>
        <button onClick={() => setShowErrorPopup(false)} className="text-red-400 hover:text-red-600">
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );


  if (loading) {
    return (
      <DashboardLayout role="management">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="management">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Notifications */}
          {showSuccessPopup && <SuccessNotification />}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Management Profile</h1>
            <p className="text-gray-600 mt-2">Manage your professional information and administrative details</p>
          </div>

          {/* Error Message */}
          {showErrorPopup && <ErrorNotification />}

          {management ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100 sticky top-6">
                  <div className="flex flex-col items-center text-center">
                    {/* Profile Image */}
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-4 border-white shadow-xl mb-6 group">
                      <Image
                        src={profilePhoto || "/default-avatar.png"}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="192px"
                        priority
                        unoptimized
                      />
                      {editing && (
                        <button
                          onClick={triggerFileInput}
                          className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiCamera className="w-10 h-10 text-white" />
                        </button>
                      )}
                      <input
                        id="profile-photo-input"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{management.fullname || "Management staff"}</h2>
                    <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4 max-w-full">
                      <MdEmail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{management.email || management.user_details?.email}</span>
                    </div>

                    <div className="w-full space-y-3">
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center justify-center space-x-2 mb-1 text-indigo-700">
                          <FiAward className="w-5 h-5" />
                          <span className="font-semibold">Designation</span>
                        </div>
                        <p className="text-gray-700 text-sm font-medium">{management.designation || "Administrative Officer"}</p>
                      </div>

                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <FiBriefcase className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">{management.department || management.department_name || "Administration Dept."}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                      <p className="text-gray-500 text-sm mt-1">Manage your basic profile details</p>
                    </div>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        <span className="font-medium">Edit Profile</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <FiUser className="w-4 h-4" />
                        <span>Full Name</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullname || ""}
                        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                        disabled={!editing}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <FiPhone className="w-4 h-4" />
                        <span>Phone Number</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!editing}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <FiCalendar className="w-4 h-4" />
                        <span>Date of Birth</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_birth || ""}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        disabled={!editing}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <FiBriefcase className="w-4 h-4" />
                        <span>Date Joined</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date_joined || ""}
                        onChange={(e) => setFormData({ ...formData, date_joined: e.target.value })}
                        disabled={!editing}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Professional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <FiAward className="w-4 h-4" />
                        <span>Qualification</span>
                      </label>
                      <input
                        type="text"
                        value={formData.qualification || ""}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        disabled={!editing}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter qualification"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <FiShield className="w-4 h-4" />
                        <span>Account Role</span>
                      </label>
                      <input
                        type="text"
                        value={management.user_details?.role || "Management"}
                        disabled
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <FiMapPin className="w-4 h-4" />
                        <span>Office Address</span>
                      </label>
                      <textarea
                        value={formData.office_address || formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, office_address: e.target.value, address: e.target.value })}
                        disabled={!editing}
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                        placeholder="Enter office address"
                      />
                    </div>
                  </div>

                  {editing && (
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-6 border-t border-gray-100">
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all border-dashed"
                      >
                        <FiX className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiSave className="w-4 h-4" />
                        )}
                        <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <FiShield className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h3>
              <p className="text-gray-500">We couldn't locate a management record for this account.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </DashboardLayout>
  );
};

export default ManagementProfilePage;
