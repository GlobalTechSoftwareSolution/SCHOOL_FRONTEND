'use client';

import DashboardLayout from "@/app/components/DashboardLayout";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface Student {
    email: string;
    parent_name: string | null;
    fullname: string;
    student_id: string | null;
    phone: string | null;
    date_of_birth: string | null;
    gender: string | null;
    admission_date: string | null;
    profile_picture: string | null;
    residential_address: string | null;
    emergency_contact_name: string | null;
    emergency_contact_relationship: string | null;
    emergency_contact_no: string | null;
    nationality: string | null;
    father_name: string | null;
    mother_name: string | null;
    blood_group: string | null;
    class_id: string | null;
    parent: string | null;
    section: string | null;  // Will be populated from classes API
}

interface ClassInfo {
    id: number;
    class_name: string;
    sec: string;
}

interface ValidationErrors {
    [key: string]: string;
}

interface ApiError {
    message?: string;
}

const StudentProfile = () => {
    const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/students/`;
    const CLASSES_API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/`;

    const [student, setStudent] = useState<Student | null>(null);
    const [originalStudent, setOriginalStudent] = useState<Student | null>(null);
    const [, _setClassInfo] = useState<ClassInfo | null>(null);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'emergency'>('personal');

    /** Get logged-in student email from localStorage */
    const getLoggedEmail = useCallback(() => {
        try {
            const userData = localStorage.getItem("userData");
            if (!userData) return null;
            const parsed = JSON.parse(userData);
            return parsed.email;
        } catch {
            return null;
        }
    }, []);

    /** Validate form fields */
    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!student?.fullname?.trim()) {
            errors.fullname = "Full name is required";
        }

        if (student?.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(student.phone.replace(/\s/g, ''))) {
            errors.phone = "Please enter a valid phone number";
        }

        if (student?.emergency_contact_no && !/^[\+]?[1-9][\d]{0,15}$/.test(student.emergency_contact_no.replace(/\s/g, ''))) {
            errors.emergency_contact_no = "Please enter a valid emergency contact number";
        }

        if (student?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
            errors.email = "Please enter a valid email address";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /** GET student details using email */
    const fetchStudent = useCallback(async () => {
        const email = getLoggedEmail();
        if (!email) {
            setError("Student email not found in localStorage");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const res = await fetch(API_BASE + email + "/");
            if (!res.ok) throw new Error("Failed to fetch student");

            const data = await res.json();
            setStudent(data);
            setOriginalStudent(data);

            // Fetch class information if class_id exists
            if (data.class_id) {
                try {
                    const classRes = await fetch(CLASSES_API_BASE + data.class_id + "/");
                    if (classRes.ok) {
                        const classData = await classRes.json();
                        _setClassInfo(classData);

                        // Update student with class name and section from API for display purposes
                        setStudent(prev => prev ? {
                            ...prev,
                            class_id: classData.class_name, // Display class name instead of ID
                            section: classData.sec
                        } : null);

                        // Keep original student with class ID for API calls
                        setOriginalStudent(prev => prev ? {
                            ...prev,
                            class_id: classData.class_name, // Display class name instead of ID
                            section: classData.sec
                        } : null);
                    }
                } catch {
                    // Silently fail if class info can't be fetched
                }
            }

            if (data.profile_picture) {
                setPreviewUrl(data.profile_picture.startsWith('http') ? data.profile_picture : `${process.env.NEXT_PUBLIC_API_BASE_URL}${data.profile_picture}`);
            }
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [getLoggedEmail, API_BASE, CLASSES_API_BASE]);

    useEffect(() => {
        fetchStudent();
    }, [fetchStudent]);

    /** Handle profile picture file selection */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError("File size must be less than 5MB");
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError("Please select an image file");
                return;
            }

            setProfileFile(file);
            setError("");

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setPreviewUrl(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    /** Check if form has changes */
    const hasChanges = (): boolean => {
        if (!student || !originalStudent) return false;

        if (profileFile) return true;

        return JSON.stringify(student) !== JSON.stringify(originalStudent);
    };

    /** PATCH update only changed fields */
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student || !validateForm()) return;

        setIsSaving(true);
        setError("");

        try {
            const formData = new FormData();

            // Add profile picture if selected
            if (profileFile) {
                formData.append("profile_picture", profileFile);
            }

            // Add only changed fields
            if (student.fullname !== originalStudent?.fullname) {
                formData.append("fullname", student.fullname);
            }
            if (student.phone !== originalStudent?.phone) {
                formData.append("phone", student.phone ?? "");
            }
            if (student.date_of_birth !== originalStudent?.date_of_birth) {
                formData.append("date_of_birth", student.date_of_birth ?? "");
            }
            if (student.gender !== originalStudent?.gender) {
                formData.append("gender", student.gender ?? "");
            }
            if (student.nationality !== originalStudent?.nationality) {
                formData.append("nationality", student.nationality ?? "");
            }
            if (student.blood_group !== originalStudent?.blood_group) {
                formData.append("blood_group", student.blood_group ?? "");
            }
            if (student.father_name !== originalStudent?.father_name) {
                formData.append("father_name", student.father_name ?? "");
            }
            if (student.mother_name !== originalStudent?.mother_name) {
                formData.append("mother_name", student.mother_name ?? "");
            }
            if (student.residential_address !== originalStudent?.residential_address) {
                formData.append("residential_address", student.residential_address ?? "");
            }
            if (student.emergency_contact_name !== originalStudent?.emergency_contact_name) {
                formData.append("emergency_contact_name", student.emergency_contact_name ?? "");
            }
            if (student.emergency_contact_relationship !== originalStudent?.emergency_contact_relationship) {
                formData.append("emergency_contact_relationship", student.emergency_contact_relationship ?? "");
            }
            if (student.emergency_contact_no !== originalStudent?.emergency_contact_no) {
                formData.append("emergency_contact_no", student.emergency_contact_no ?? "");
            }

            const res = await fetch(API_BASE + student.email + "/", {
                method: "PATCH",
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to update student: ${res.status} ${res.statusText}. ${errorText}`);
            }

            const updatedStudent = await res.json();
            setStudent(updatedStudent);
            setOriginalStudent(updatedStudent);

            if (profileFile && updatedStudent.profile_picture) {
                setPreviewUrl(updatedStudent.profile_picture.startsWith('http') ? updatedStudent.profile_picture : `${process.env.NEXT_PUBLIC_API_BASE_URL}${updatedStudent.profile_picture}`);
            }

            setShowSuccessPopup(true);
            setTimeout(() => setShowSuccessPopup(false), 3000);
            setIsEditing(false);
            setProfileFile(null);

        } catch (err: unknown) {
            const apiError = err as ApiError;
            console.error("Save error:", apiError);
            setError(apiError.message || "An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const onChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        if (!student) return;

        setStudent({
            ...student,
            [e.target.name]: e.target.value,
        });

        // Clear validation error for this field
        if (validationErrors[e.target.name]) {
            setValidationErrors({
                ...validationErrors,
                [e.target.name]: ""
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setProfileFile(null);
        setValidationErrors({});
        if (originalStudent) {
            setStudent(originalStudent);
            if (originalStudent.profile_picture) {
                setPreviewUrl(originalStudent.profile_picture.startsWith('http') ? originalStudent.profile_picture : `${process.env.NEXT_PUBLIC_API_BASE_URL}${originalStudent.profile_picture}`);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <DashboardLayout role="students">
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading student profile...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!student) {
        return (
            <DashboardLayout role="students">
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
                        <p className="text-gray-600 mb-4">Unable to load student profile.</p>
                        <button
                            onClick={fetchStudent}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="students">
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
                        <p className="text-gray-600 mt-2">Manage your personal information and settings</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Popup */}
                    {showSuccessPopup && (
                        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Profile updated successfully!</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar - Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Profile Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                                    <div className="flex flex-col items-center">
                                        <div className="relative">
                                            {previewUrl ? (
                                                <Image
                                                    src={previewUrl.startsWith('http') ? previewUrl : `${process.env.NEXT_PUBLIC_API_BASE_URL}${previewUrl}`}
                                                    width={96}
                                                    height={96}
                                                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                                                    alt="Profile"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 border-4 border-white border-opacity-30 flex items-center justify-center">
                                                    <svg className="w-12 h-12 text-white opacity-70" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            {isEditing && (
                                                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold mt-4 text-center">{student.fullname || "Unnamed Student"}</h2>
                                        <p className="text-blue-100 text-sm mt-1">{student.email || "No email provided"}</p>
                                        <div className="mt-2 px-3 py-1 bg-white bg-opacity-20 text-black rounded-full text-xs">
                                            ID: {student.student_id || "Not assigned"}
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Stats */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm">Class</span>
                                            <span className="font-semibold text-gray-900">{student.class_id || "Not assigned"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm">Section</span>
                                            <span className="font-semibold text-gray-900">{student.section || "Not assigned"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm">Admission Date</span>
                                            <span className="font-semibold text-gray-900">{formatDate(student.admission_date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm">Status</span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </div>
                                    </div>

                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <div className="mt-6 space-y-3">
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving || !hasChanges()}
                                                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={isSaving}
                                                className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-semibold transition-colors disabled:bg-gray-400 flex items-center justify-center"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Tabs */}
                                <div className="border-b border-gray-200">
                                    <nav className="flex -mb-px">
                                        <button
                                            onClick={() => setActiveTab('personal')}
                                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            Personal Information
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('family')}
                                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'family'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            Family Details
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('emergency')}
                                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'emergency'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            Emergency Contact
                                        </button>
                                    </nav>
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    <form onSubmit={handleSave}>
                                        {/* Personal Information Tab */}
                                        {activeTab === 'personal' && (
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Full Name *
                                                        </label>
                                                        <input
                                                            name="fullname"
                                                            value={student.fullname || ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing
                                                                    ? 'bg-gray-50 text-gray-500'
                                                                    : validationErrors.fullname
                                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                        {validationErrors.fullname && (
                                                            <p className="mt-1 text-sm text-red-600">{validationErrors.fullname}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Student ID
                                                        </label>
                                                        <input
                                                            value={student.student_id ?? ""}
                                                            className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 text-gray-500"
                                                            readOnly
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Email Address
                                                        </label>
                                                        <input
                                                            name="email"
                                                            value={student.email || ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing
                                                                    ? 'bg-gray-50 text-gray-500'
                                                                    : validationErrors.email
                                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                        {validationErrors.email && (
                                                            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Phone Number
                                                        </label>
                                                        <input
                                                            name="phone"
                                                            value={student.phone ?? ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing
                                                                    ? 'bg-gray-50 text-gray-500'
                                                                    : validationErrors.phone
                                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                        {validationErrors.phone && (
                                                            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Date of Birth
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="date_of_birth"
                                                            value={student.date_of_birth ?? ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing ? 'bg-gray-50 text-gray-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Gender
                                                        </label>
                                                        {isEditing ? (
                                                            <select
                                                                name="gender"
                                                                value={student.gender ?? ""}
                                                                onChange={onChange}
                                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                                                            >
                                                                <option value="">Select Gender</option>
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        ) : (
                                                            <input
                                                                value={student.gender ?? "Not specified"}
                                                                className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 text-gray-500"
                                                                readOnly
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Nationality
                                                        </label>
                                                        <input
                                                            name="nationality"
                                                            value={student.nationality ?? ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing ? 'bg-gray-50 text-gray-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Blood Group
                                                        </label>
                                                        <input
                                                            name="blood_group"
                                                            value={student.blood_group ?? ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing ? 'bg-gray-50 text-gray-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Section
                                                        </label>
                                                        <input
                                                            value={student.section ?? "Not assigned"}
                                                            className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 text-gray-500"
                                                            readOnly
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Residential Address
                                                    </label>
                                                    <textarea
                                                        name="residential_address"
                                                        value={student.residential_address ?? ""}
                                                        onChange={onChange}
                                                        rows={3}
                                                        className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing ? 'bg-gray-50 text-gray-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                            }`}
                                                        readOnly={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Family Details Tab */}
                                        {activeTab === 'family' && (
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900">Family Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Father&apos;s Name
                                                        </label>
                                                        <input
                                                            name="father_name"
                                                            value={student.father_name ?? ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing ? 'bg-gray-50 text-gray-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Mother&apos;s Name
                                                        </label>
                                                        <input
                                                            name="mother_name"
                                                            value={student.mother_name ?? ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing ? 'bg-gray-50 text-gray-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Parent/Guardian Name
                                                        </label>
                                                        <input
                                                            name="parent_name"
                                                            value={student.parent_name ?? ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing ? 'bg-gray-50 text-gray-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Parent Contact
                                                        </label>
                                                        <input
                                                            name="parent"
                                                            value={student.parent ?? ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing ? 'bg-gray-50 text-gray-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Emergency Contact Tab */}
                                        {activeTab === 'emergency' && (
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Contact Name
                                                        </label>
                                                        <input
                                                            name="emergency_contact_name"
                                                            value={student.emergency_contact_name ?? ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing ? 'bg-gray-50 text-gray-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Relationship
                                                        </label>
                                                        <input
                                                            name="emergency_contact_relationship"
                                                            value={student.emergency_contact_relationship ?? ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing ? 'bg-gray-50 text-gray-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Contact Number *
                                                        </label>
                                                        <input
                                                            name="emergency_contact_no"
                                                            value={student.emergency_contact_no ?? ""}
                                                            onChange={onChange}
                                                            className={`w-full border rounded-lg px-4 py-3 transition-colors ${!isEditing
                                                                    ? 'bg-gray-50 text-gray-500'
                                                                    : validationErrors.emergency_contact_no
                                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            readOnly={!isEditing}
                                                        />
                                                        {validationErrors.emergency_contact_no && (
                                                            <p className="mt-1 text-sm text-red-600">{validationErrors.emergency_contact_no}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentProfile;