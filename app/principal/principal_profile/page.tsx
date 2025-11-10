"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import axios from "axios";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

interface Principal {
  email: string;
  fullname: string;
  phone: string;
  qualification: string;
  total_experience: string;
  bio: string;
  office_address: string;
  date_of_birth: string;
  date_joined: string;
  profile_picture: string;
}

const PrincipalProfilePage = () => {
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // ✅ Get principal email from localStorage safely
  const getPrincipalEmail = (): string => {
    if (typeof window === "undefined") return "";
    try {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData)?.email : "";
    } catch (error) {
      console.error("Error parsing userData:", error);
      return "";
    }
  };

  const email = getPrincipalEmail();

  // ✅ Fetch principal info by email
  useEffect(() => {
    if (!email) {
      setError("No email found in localStorage");
      return;
    }

    const fetchPrincipal = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/principals/?email=${encodeURIComponent(email)}`);
        if (res.data?.length > 0) {
          const principalData = res.data[0];
          setPrincipal(principalData);
          setPreviewImage(principalData.profile_picture || "/default-avatar.png");
        } else {
          setError("Principal not found");
        }
      } catch (error) {
        console.error("❌ Error fetching principal:", error);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrincipal();
  }, [email]);

  // ✅ Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPrincipal(prev => prev ? { ...prev, [name]: value } : null);
  };

  // ✅ Image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }
      
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setError("");
    }
  };

  // ✅ Save changes
  const handleSave = async () => {
    if (!principal?.email) {
      setError("Principal email missing, cannot update.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      
      // Append only changed fields or all required fields
      const fields: (keyof Principal)[] = [
        'fullname', 'phone', 'qualification', 'total_experience', 
        'bio', 'office_address', 'date_of_birth', 'date_joined'
      ];
      
      fields.forEach(field => {
        formData.append(field, principal[field] || "");
      });

      if (selectedImage) {
        formData.append("profile_picture", selectedImage);
      }

      await axios.patch(
        `${API_BASE}/principals/${encodeURIComponent(principal.email)}/`, 
        formData, 
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // 🔄 Refresh data after save
      const refreshed = await axios.get(`${API_BASE}/principals/?email=${encodeURIComponent(email)}`);
      if (refreshed.data?.length > 0) {
        setPrincipal(refreshed.data[0]);
        setPreviewImage(refreshed.data[0].profile_picture || "/default-avatar.png");
      }

      setIsEditing(false);
      setSelectedImage(null);
      setError("");
      
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setSelectedImage(null);
    setError("");
    
    // Reset preview image to original
    if (principal?.profile_picture) {
      setPreviewImage(principal.profile_picture);
    }
  };

  if (isLoading && !principal) {
    return (
      <DashboardLayout role="principal">
        <div className="p-6 flex justify-center items-center h-64">
          <div className="text-lg">Loading principal profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!principal && error) {
    return (
      <DashboardLayout role="principal">
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!principal) {
    return (
      <DashboardLayout role="principal">
        <div className="p-6">
          <div className="text-center">No principal data found.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="principal">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Principal Profile</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <img
              src={previewImage || "/default-avatar.png"}
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover border-2 border-gray-200"
            />
            {isEditing && (
              <div className="text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm mb-2"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>

          {/* Info Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={principal.fullname || ""}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={principal.phone || ""}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={principal.qualification || ""}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Total Experience
                </label>
                <input
                  type="text"
                  name="total_experience"
                  value={principal.total_experience || ""}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Office Address
                </label>
                <input
                  type="text"
                  name="office_address"
                  value={principal.office_address || ""}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={principal.date_of_birth || ""}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Date Joined
                </label>
                <input
                  type="date"
                  name="date_joined"
                  value={principal.date_joined || ""}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Bio
              </label>
              <input
                type="text"
                name="bio"
                value={principal.bio || ""}
                onChange={handleChange}
                disabled={!isEditing || isLoading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrincipalProfilePage;