"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

const API_BASE = "https://globaltechsoftwaresolutions.cloud/school-api/api";

interface Notice {
  id?: number;
  title: string;
  message: string;
  posted_date?: string;
  notice_by_email?: string | null;
  notice_by_name?: string | null;
  notice_to_email?: string | null;
  notice_to_name?: string | null;
}

interface Student {
  email: string;
  name: string;
  class_name?: string;
  section?: string;
}

const TeacherNoticePage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [newNotice, setNewNotice] = useState({
    title: "",
    message: "",
    notice_to_email: "",
  });
  const [user, setUser] = useState<any>(null);

  // Fetch teacher info from localStorage
  useEffect(() => {
    console.log("📦 Checking localStorage for userData...");
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      console.log("✅ Found user in localStorage:", parsed);
      setUser(parsed);
    } else {
      console.error("❌ No user found in localStorage");
    }
  }, []);

  // Fetch all notices
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        console.log("📡 Fetching all notices from API:", `${API_BASE}/notices/`);
        const res = await axios.get(`${API_BASE}/notices/`);
        console.log("✅ Notices fetched:", res.data);
        setNotices(res.data);
      } catch (err) {
        console.error("❌ Error fetching notices:", err);
      }
    };
    fetchNotices();
  }, []);

  // Fetch all students for dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log("🎓 Fetching all students...");
        const res = await axios.get(`${API_BASE}/students/`);
        console.log("✅ Students fetched:", res.data);
        setStudents(res.data);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
      }
    };
    fetchStudents();
  }, []);

  // Handle new notice field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewNotice({ ...newNotice, [e.target.name]: e.target.value });
  };

  // Submit new notice
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error("❌ No logged-in user found");
      return;
    }

    const selectedStudent = students.find(
      (s) => s.email === newNotice.notice_to_email
    );

    const noticePayload = {
      title: newNotice.title,
      message: newNotice.message,
      notice_by_email: user.email,
      notice_by_name: user.name,
      notice_to_email: selectedStudent?.email || null,
      notice_to_name: selectedStudent?.name || null,
    };

    console.log("📝 Creating new notice with payload:", noticePayload);

    try {
      const res = await axios.post(`${API_BASE}/notices/`, noticePayload);
      console.log("✅ Notice created successfully:", res.data);
      setNotices([...notices, res.data]);
      setNewNotice({ title: "", message: "", notice_to_email: "" });
    } catch (err) {
      console.error("❌ Error creating notice:", err);
    }
  };

  return (
    <DashboardLayout role='teachers'>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">
          🧾 Teacher Notices
        </h1>

        {/* Create New Notice Form */}
        <form
          onSubmit={handleAddNotice}
          className="bg-white p-4 rounded-2xl shadow-md mb-6"
        >
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            ➕ Add New Notice
          </h2>

          <input
            type="text"
            name="title"
            placeholder="Enter Notice Title"
            value={newNotice.title}
            onChange={handleChange}
            className="w-full p-2 border rounded-md mb-3"
            required
          />

          <textarea
            name="message"
            placeholder="Enter Notice Message"
            value={newNotice.message}
            onChange={handleChange}
            className="w-full p-2 border rounded-md mb-3"
            rows={3}
            required
          />

          {/* Select Student Dropdown */}
          <select
            name="notice_to_email"
            value={newNotice.notice_to_email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md mb-3"
            required
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.email} value={student.email}>
                {student.name} ({student.email})
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Notice
          </button>
        </form>

        {/* Notices List */}
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            📋 All Notices
          </h2>
          {notices.length > 0 ? (
            <ul className="space-y-2">
              {notices.map((n) => (
                <li
                  key={n.id}
                  className="border-b border-gray-200 pb-2 text-gray-700"
                >
                  <strong>{n.title}</strong> — {n.message} <br />
                  <span className="text-sm text-gray-500">
                    To: {n.notice_to_name || "All"} | By:{" "}
                    {n.notice_by_name || "Unknown"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No notices found.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherNoticePage;
