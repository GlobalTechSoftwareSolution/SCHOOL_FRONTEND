"use client";
import DashboardLayout from "../../components/DashboardLayout";
import React, { useEffect, useState, useCallback } from "react";

interface User {
  email: string;
  role: string;
  is_staff: boolean;
  is_superuser?: boolean;
  is_active: boolean;
  is_approved: boolean;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

const Approvalpage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://globaltechsoftwaresolutions.cloud/school-api/";

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Missing authentication token");

      const response = await fetch(`${apiBase}api/users/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok)
        throw new Error(`Server error: ${response.status} ${response.statusText}`);

      const data: User[] = await response.json();
      const rejected = JSON.parse(localStorage.getItem("rejectedUsers") || "[]");
      const filtered = data.filter(u => !rejected.includes(u.email));
      setUsers(filtered);
    } catch (err: unknown) {
      setUsers([]);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  const handleApprove = async (email: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${apiBase}api/users/${encodeURIComponent(email)}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_approved: true }),
      });
      await response.json();

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleReject = async (email: string) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) throw new Error("Missing authentication token");

      const response = await fetch(`${apiBase}api/users/${encodeURIComponent(email)}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        setUsers((prev) => prev.filter((u) => u.email !== email));
      } else {
        await response.text();
        alert(`Failed to reject user (${response.status}).`);
      }
    } catch (err) {
      alert("Error rejecting user. Check console for details.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const pendingUsers = users.filter((u) => !u.is_approved);
  const approvedUsers = users.filter((u) => u.is_approved);

  return (
    <DashboardLayout role="admin">
      <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-800 text-center underline break-words">
          User Management
        </h1>

        {loading && <p className="text-gray-600 text-center">Loading users...</p>}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && users.length === 0 && !error && (
          <p className="text-gray-600 text-center">No users found.</p>
        )}

        {/* Pending Approval */}
        <section className="mt-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-yellow-700">
            Pending Approval
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {pendingUsers.length === 0 && (
              <p className="text-gray-500 col-span-full text-center">
                No users pending approval.
              </p>
            )}
            {pendingUsers.map((user, index) => (
              <div
                key={`pending-${index}`}
                className="bg-white border border-gray-200 rounded-lg shadow-md p-4 md:p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 text-sm sm:text-base break-words"
              >
                <div className="space-y-1">
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Role:</span> {user.role}</p>
                  <p><span className="font-medium">Staff:</span> {user.is_staff ? "Yes" : "No"}</p>
                  <p><span className="font-medium">Active:</span> {user.is_active ? "Yes" : "No"}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <button
                    onClick={() => handleApprove(user.email)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(user.email)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Approved Users */}
        <section className="mt-10 mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-5 text-green-700">
            Approved Users
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {approvedUsers.length === 0 && (
              <p className="text-gray-500 col-span-full text-center">No approved users.</p>
            )}
            {approvedUsers.map((user, index) => (
              <div
                key={`approved-${index}`}
                className="bg-white border border-gray-200 rounded-lg shadow-md p-4 md:p-6 flex flex-col justify-between text-sm sm:text-base break-words"
              >
                <div className="space-y-1">
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Role:</span> {user.role}</p>
                  <p><span className="font-medium">Staff:</span> {user.is_staff ? "Yes" : "No"}</p>
                  <p><span className="font-medium">Active:</span> {user.is_active ? "Yes" : "No"}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Approvalpage;