"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import axios from "axios";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building,
  Calendar,
  Edit3,
  Save,
  X,
  Shield,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Key,
  Camera
} from "lucide-react";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

const ManagementProfilePage = () => {
  const [management, setManagement] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.email) {
        fetchManagementProfile(parsed.email);
      }
    }
  }, []);

  const fetchManagementProfile = async (email: string) => {
    try {
      const res = await axios.get(`${API_BASE}/management/`);
      const allManagers = res.data || [];

      const profile = allManagers.find(
        (m: any) => m.email === email || m.user_details?.email === email
      );

      if (profile) {
        setManagement(profile);
        // Set profile photo if available
        if (profile.profile_picture) {
          setProfilePhoto(profile.profile_picture);
        }
        setFormData({
          fullname: profile.fullname || "",
          email: profile.email || profile.user_details?.email || "",
          designation: profile.designation || "",
          phone: profile.phone || "",
          department: profile.department || "",
          address: profile.address || "",
          qualification: profile.qualification || "",
          ...profile
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
  };

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

    setUploadingPhoto(true);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePhoto(result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      // Backend uses `profile_picture` like other roles
      formData.append('profile_picture', file);
      const email = management?.email || management?.user_details?.email;
      if (!email) {
        showError('No valid email found for this management user');
        return;
      }
      formData.append('email', email);

      // Use the same detail endpoint as other profile updates: /management/{email}/
      const response = await axios.patch(`${API_BASE}/management/${encodeURIComponent(email)}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update management data with new photo URL
      if (response.data?.profile_picture) {
        setManagement((prev: any) => ({
          ...prev,
          profile_picture: response.data.profile_picture
        }));
        setProfilePhoto(response.data.profile_picture);
        showSuccess();
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      showError('Failed to upload profile photo');
      // Reset to original photo on error
      setProfilePhoto(null);
    } finally {
      setUploadingPhoto(false);
    }
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
      const email = management.email || management.user_details?.email;
      if (!email) {
        showError("No valid email found for management record");
        return;
      }

      // Prepare update data
      const updateData = {
        fullname: formData.fullname,
        designation: formData.designation,
        phone: formData.phone,
        department: formData.department,
        address: formData.address,
        qualification: formData.qualification
      };

      // Remove empty fields
      Object.keys(updateData).forEach((key: string) => {
        if (!updateData[key as keyof typeof updateData]) delete updateData[key as keyof typeof updateData];
      });

      const response = await axios.patch(`${API_BASE}/management/${email}/`, updateData);

      showSuccess();
      setManagement(response.data);
      setEditing(false);
      
      // Update form data with new values
      setFormData({
        ...formData,
        ...response.data
      });
    } catch (error: any) {
      console.error("Error updating management profile:", error);
      if (error.response?.status === 404) {
        try {
          const email = management.email || management.user_details?.email;
          const updateData = {
            fullname: formData.fullname,
            designation: formData.designation,
            phone: formData.phone,
            department: formData.department,
            address: formData.address,
            qualification: formData.qualification,
            email: email
          };
          
          const response = await axios.put(`${API_BASE}/management/${email}/`, updateData);
          showSuccess();
          setManagement(response.data);
          setEditing(false);
        } catch (putError) {
          showError("Failed to update profile. Please try again.");
        }
      } else {
        showError("Failed to update profile. Please try again.");
      }
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
      address: management?.address || "",
      qualification: management?.qualification || "",
      ...management
    });
    setEditing(false);
  };

  // Success Popup Component
  const SuccessPopup = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl transform transition-all">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Success!</h3>
        <p className="text-gray-600 text-center mb-6">Profile updated successfully</p>
        <button
          onClick={() => setShowSuccessPopup(false)}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Error Popup Component
  const ErrorPopup = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl transform transition-all">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <X className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Error</h3>
        <p className="text-gray-600 text-center mb-6">{errorMessage}</p>
        <button
          onClick={() => setShowErrorPopup(false)}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
        >
          Try Again
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Management Profile
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Manage your professional information and administrative details
            </p>
          </div>

          {management ? (
            <div className="space-y-6">
              {/* Profile Overview Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-white/20 rounded-2xl border-4 border-white/30 shadow-lg flex items-center justify-center relative overflow-hidden">
                        {profilePhoto || management?.profile_picture ? (
                          <img 
                            src={profilePhoto || management?.profile_picture} 
                            alt="Profile" 
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <User className="w-12 h-12 text-white" />
                        )}
                        <button 
                          onClick={triggerFileInput}
                          disabled={uploadingPhoto}
                          className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full border-2 border-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {uploadingPhoto ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                          ) : (
                            <Camera className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                      <input
                        id="profile-photo-input"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="flex-1 text-center lg:text-left">
                      <h1 className="text-2xl font-bold mb-2">{management.fullname || "Management User"}</h1>
                      <p className="text-blue-100 text-lg mb-3 font-medium">
                        {management.designation || "Management Staff"}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 justify-center lg:justify-start">
                          <Mail className="w-4 h-4 text-blue-200" />
                          <span>{management.email || management.user_details?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center lg:justify-start">
                          <Building className="w-4 h-4 text-blue-200" />
                          <span>{management.department || "Administration"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {editing ? (
                        <>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-50"
                          >
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {saving ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        Personal Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              value={formData.fullname || ""}
                              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                              disabled={!editing}
                              className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all ${
                                editing 
                                  ? "border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                  : "border-gray-300 bg-gray-50"
                              }`}
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="email"
                              value={formData.email || ""}
                              disabled
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="tel"
                              value={formData.phone || ""}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              disabled={!editing}
                              className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all ${
                                editing 
                                  ? "border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                  : "border-gray-300 bg-gray-50"
                              }`}
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <textarea
                              value={formData.address || ""}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              disabled={!editing}
                              rows={3}
                              className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all resize-none ${
                                editing 
                                  ? "border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                  : "border-gray-300 bg-gray-50"
                              }`}
                              placeholder="Enter your address"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-xl">
                          <Briefcase className="w-5 h-5 text-green-600" />
                        </div>
                        Professional Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Designation
                          </label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              value={formData.designation || ""}
                              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                              disabled={!editing}
                              className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all ${
                                editing 
                                  ? "border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                  : "border-gray-300 bg-gray-50"
                              }`}
                              placeholder="Enter your designation"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department
                          </label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              value={formData.department || ""}
                              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                              disabled={!editing}
                              className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all ${
                                editing 
                                  ? "border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                  : "border-gray-300 bg-gray-50"
                              }`}
                              placeholder="Enter your department"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Qualification
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              value={formData.qualification || ""}
                              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                              disabled={!editing}
                              className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all ${
                                editing 
                                  ? "border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                  : "border-gray-300 bg-gray-50"
                              }`}
                              placeholder="Enter your qualification"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role
                          </label>
                          <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              value={management.user_details?.role || "Management"}
                              disabled
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm mt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      Account Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                        <div className={`p-2 rounded-lg ${
                          management.user_details?.is_active 
                            ? "bg-green-100 text-green-600" 
                            : "bg-red-100 text-red-600"
                        }`}>
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Status</div>
                          <div className="font-semibold">
                            {management.user_details?.is_active ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                        <div className={`p-2 rounded-lg ${
                          management.user_details?.is_approved 
                            ? "bg-green-100 text-green-600" 
                            : "bg-yellow-100 text-yellow-600"
                        }`}>
                          {management.user_details?.is_approved ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Approval</div>
                          <div className="font-semibold">
                            {management.user_details?.is_approved ? "Approved" : "Pending"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Member Since</div>
                          <div className="font-semibold">
                            {management.user_details?.created_at 
                              ? new Date(management.user_details.created_at).toLocaleDateString()
                              : "N/A"
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-lg border border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-gray-700 font-semibold text-lg mb-2">Profile Not Found</h3>
                <p className="text-gray-500 mb-4">No management profile found for your account.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popup Modals */}
      {showSuccessPopup && <SuccessPopup />}
      {showErrorPopup && <ErrorPopup />}
      {showPasswordModal && <PasswordChangeModal />}
    </DashboardLayout>
  );
};

// Password Change Modal Component
const PasswordChangeModal = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const email = userData.email || userData.user_details?.email;
      
      const response = await axios.patch(`${API_BASE}/management/change-password/`, {
        email: email,
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });

      alert("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      // Close modal - you'll need to pass this function as props
    } catch (error: any) {
      console.error("Error changing password:", error);
      alert(error.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-6 text-white">
          <h2 className="text-2xl font-bold">Change Password</h2>
        </div>
        
        <form onSubmit={handlePasswordChange} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                // You'll need to pass this function as props or use a global state
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: ""
                });
              }}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagementProfilePage;