"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { CheckCircle, XCircle, Upload, Edit3, Save, X } from "lucide-react";

const API_BASE_URL = "https://school.globaltechsoftwaresolutions.cloud/api/teachers/";

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
  description: string;
}

interface Teacher {
  email: string;
  fullname: string;
  teacher_id: string;
  department_name: string;
  role: string;
  qualification: string;
  experience_years: number;
  phone: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  blood_group: string;
  date_joined: string;
  residential_address: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_no: string;
  profile_picture: string;
  subject_list: Subject[];
}

const TeacherProfilePage = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<Partial<Teacher>>({});
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // ✅ Fetch from localStorage and API
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const { email } = JSON.parse(storedUser);
      if (email) fetchTeacher(email);
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ Show popup with auto-hide
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
    }, 3000);
  };

  // ✅ Fetch teacher details
  const fetchTeacher = async (email: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}${email}/`);
      setTeacher(res.data);
      setFormData(res.data);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      showPopup('error', "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle profile picture selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileFile(e.target.files[0]);
    }
  };

  // ✅ Save updates (PATCH)
  const handleSave = async () => {
    try {
      const email = formData.email;

      if (profileFile) {
        // If profile picture changed, prepare FormData for upload
        const uploadData = new FormData();
        uploadData.append("profile_picture", profileFile);
        
        // Add only changed fields, skip undefined values
        const fieldsToUpdate: (keyof Teacher)[] = [
          "fullname",
          "department_name",
          "qualification",
          "experience_years",
          "phone",
          "date_of_birth",
          "gender",
          "nationality",
          "blood_group",
          "date_joined",
          "residential_address",
          "emergency_contact_name",
          "emergency_contact_relationship",
          "emergency_contact_no"
        ];

        fieldsToUpdate.forEach((key) => {
          const value = formData[key];
          if (value !== undefined && value !== null && value !== "") {
            uploadData.append(key, String(value));
          }
        });

        const res = await axios.patch(`${API_BASE_URL}${email}/`, uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setTeacher(res.data);
        setFormData(res.data);
      } else {
        // Just text updates, no file upload
        const res = await axios.patch(`${API_BASE_URL}${email}/`, formData);
        setTeacher(res.data);
        setFormData(res.data);
      }

      setIsEditing(false);
      setProfileFile(null);
      showPopup('success', "Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || "Failed to update profile";
      showPopup('error', errorMessage);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!teacher) {
    return (
      <DashboardLayout role="teachers">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No teacher found</h3>
            <p className="mt-1 text-sm text-gray-500">Please check your account information.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teachers">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-80">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">Success</p>
              <p className="text-green-700 text-sm">{popupMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-80">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{popupMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden">
                <img
                  src={
                    profileFile
                      ? URL.createObjectURL(profileFile)
                      : teacher.profile_picture || "https://via.placeholder.com/150"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="h-6 w-6 text-white" />
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
              <h1 className="text-3xl font-bold mb-2">{teacher.fullname}</h1>
              <p className="text-blue-100 text-lg mb-1">{teacher.department_name}</p>
              <p className="text-blue-200">{teacher.role}</p>
            </div>

            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 border border-white/30"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(teacher);
                      setProfileFile(null);
                    }}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 border border-white/30"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <InputField label="Full Name" name="fullname" value={formData.fullname || ""} onChange={handleChange} disabled={!isEditing} />
                <InputField label="Teacher ID" name="teacher_id" value={formData.teacher_id || ""} disabled />
                <InputField label="Department" name="department_name" value={formData.department_name || ""} onChange={handleChange} disabled={!isEditing} />
                <InputField label="Qualification" name="qualification" value={formData.qualification || ""} onChange={handleChange} disabled={!isEditing} />
                <InputField label="Experience (Years)" name="experience_years" value={formData.experience_years || ""} onChange={handleChange} disabled={!isEditing} />
                <InputField label="Phone" name="phone" value={formData.phone || ""} onChange={handleChange} disabled={!isEditing} />
                <InputField label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth || ""} onChange={handleChange} disabled={!isEditing} />
                <InputField label="Gender" name="gender" value={formData.gender || ""} onChange={handleChange} disabled={!isEditing} />
                <InputField label="Nationality" name="nationality" value={formData.nationality || ""} onChange={handleChange} disabled={!isEditing} />
                <InputField label="Blood Group" name="blood_group" value={formData.blood_group || ""} onChange={handleChange} disabled={!isEditing} />
                <InputField label="Date Joined" name="date_joined" type="date" value={formData.date_joined || ""} onChange={handleChange} disabled={!isEditing} />
              </div>
            </div>

            {/* Address & Emergency Contact */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Address Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Residential Address</h3>
                <textarea
                  name="residential_address"
                  value={formData.residential_address || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  className={`w-full border rounded-xl p-3 resize-none transition-all ${
                    isEditing 
                      ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                      : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              {/* Emergency Contact Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
                <div className="space-y-4">
                  <InputField label="Contact Name" name="emergency_contact_name" value={formData.emergency_contact_name || ""} onChange={handleChange} disabled={!isEditing} />
                  <InputField label="Relationship" name="emergency_contact_relationship" value={formData.emergency_contact_relationship || ""} onChange={handleChange} disabled={!isEditing} />
                  <InputField label="Contact Number" name="emergency_contact_no" value={formData.emergency_contact_no || ""} onChange={handleChange} disabled={!isEditing} />
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Sidebar */}
          <div className="space-y-8">
            {/* Subjects Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Assigned Subjects</h3>
              <div className="space-y-4">
                {teacher.subject_list?.length ? (
                  teacher.subject_list.map((subject) => (
                    <div key={subject.id} className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors bg-gray-50/50">
                      <h4 className="font-semibold text-gray-800 mb-1">{subject.subject_name}</h4>
                      <p className="text-sm text-gray-600 mb-2">Code: {subject.subject_code}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{subject.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No subjects assigned</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Status Card */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Profile Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${teacher.fullname ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={teacher.fullname ? 'text-green-700' : 'text-gray-500'}>
                    Personal Information {teacher.fullname ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${teacher.phone ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={teacher.phone ? 'text-green-700' : 'text-gray-500'}>
                    Contact Details {teacher.phone ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${teacher.subject_list?.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={teacher.subject_list?.length ? 'text-green-700' : 'text-gray-500'}>
                    Subjects Assigned {teacher.subject_list?.length ? `(${teacher.subject_list.length})` : '(None)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// ✅ Enhanced Input Field Component
const InputField = ({ label, name, value, onChange, disabled = false, type = "text" }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border rounded-xl px-4 py-3 transition-all ${
        disabled 
          ? "bg-gray-50 border-gray-200 text-gray-500" 
          : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400"
      }`}
    />
  </div>
);

export default TeacherProfilePage;