"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Eye } from "lucide-react";

const API_URL = "https://globaltechsoftwaresolutions.cloud/school-api/api/students/";

interface Student {
  email: string;
  fullname: string;
  student_id: string;
  class_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  admission_date: string;
  profile_picture: string | null;
  residential_address?: string | null;
  nationality?: string | null;
  blood_group?: string | null;
  parent?: string | null;
  user_details?: {
    role: string;
    is_active: boolean;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
  };
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  // ✅ Fetch all students
  const fetchStudents = async () => {
    try {
      const res = await axios.get(API_URL);
      setStudents(res.data);
    } catch (error) {
      console.error("❌ Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ Handle Edit button
  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditing(true);
  };

  // ✅ Handle View button
  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsEditing(false);
  };

  // ✅ Handle Save updates
  const handleSave = async () => {
    if (!selectedStudent) return;

    const formData = new FormData();
    Object.entries(selectedStudent).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });

    if (profileImageFile) {
      formData.append("profile_picture", profileImageFile);
    }

    try {
      await axios.patch(`${API_URL}${selectedStudent.email}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Student details updated successfully!");
      setIsEditing(false);
      setSelectedStudent(null);
      fetchStudents(); // refresh list
    } catch (error) {
      console.error("❌ Error updating student:", error);
      alert("Failed to update student details.");
    }
  };

  // ✅ Handle input changes
  const handleInputChange = (field: keyof Student, value: string) => {
    if (!selectedStudent) return;
    setSelectedStudent({ ...selectedStudent, [field]: value });
  };

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">
        🎓 Student Management
      </h1>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border shadow-md">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Profile</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Class</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Phone</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {students.map((student) => (
              <tr key={student.email}>
                <td className="px-4 py-2">
                  <img
                    src={
                      student.profile_picture
                        ? `https://globaltechsoftwaresolutions.cloud${student.profile_picture}`
                        : "/default-avatar.png"
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">{student.fullname}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{student.class_name}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{student.email}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{student.phone}</td>
                <td className="px-4 py-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleView(student)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    onClick={() => handleEdit(student)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for View/Edit */}
      {selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {isEditing ? "✏️ Edit Student Details" : "👁️ View Student Details"}
            </h2>

            {/* Profile Image */}
            <div className="flex flex-col items-center mb-4">
              <img
                src={
                  selectedStudent.profile_picture
                    ? `https://globaltechsoftwaresolutions.cloud${selectedStudent.profile_picture}`
                    : "/default-avatar.png"
                }
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover mb-3"
              />
              {isEditing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProfileImageFile(e.target.files?.[0] || null)
                  }
                  className="text-sm"
                />
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(selectedStudent).map(([key, value]) => {
                if (
                  ["profile_picture", "user_details"].includes(key)
                )
                  return null;

                return (
                  <div key={key} className="flex flex-col">
                    <label className="text-sm text-gray-600 capitalize">
                      {key.replace("_", " ")}
                    </label>
                    {isEditing ? (
                      <input
                        value={value ?? ""}
                        onChange={(e) => handleInputChange(key as keyof Student, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{value ?? "-"}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Close
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
