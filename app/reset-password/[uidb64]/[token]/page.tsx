"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";

interface ResetPasswordPageProps {
  params: {
    uidb64: string;
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const router = useRouter();
  const { uidb64, token } = params;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Log params when page loads
  useEffect(() => {
    console.log("=== RESET PASSWORD PAGE LOADED ===");
    console.log("UIDB64 from URL:", uidb64);
    console.log("Token from URL:", token);
    console.log("=================================");
  }, [uidb64, token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    console.log("🔐 Submitting password reset...");
    console.log("Entered new password length:", password.length);
    console.log("Entered confirm password length:", confirm.length);

    if (password !== confirm) {
      console.log("❌ Password mismatch");
      setError("Passwords do not match");
      return;
    }

    const endpoint = `https://globaltechsoftwaresolutions.cloud/school-api/api/password_reset_confirm/${uidb64}/${token}/`;

    console.log("📡 API Endpoint:", endpoint);

    try {
      console.log("➡ Sending POST request to backend...");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: password }),
      });

      console.log("📥 Response Status:", res.status);
      console.log("📥 Response Headers:", Object.fromEntries(res.headers.entries()));

      const data = await res.json();
      console.log("📥 Response Body:", data);

      if (!res.ok) {
        console.log("❌ Backend Error:", data);
        setError(data.error || "Invalid or expired reset link");
        return;
      }

      console.log("✅ Password reset successful!");
      setSuccess("Password reset successful! Redirecting...");

      setTimeout(() => {
        console.log("➡ Redirecting user to login page...");
        router.push("/login");
      }, 2000);

    } catch (err) {
      console.log("🔥 Network / Fetch Error:", err);
      setError("Network error — please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>

        {error && (
          <p className="bg-red-100 text-red-600 p-2 rounded mb-3">{error}</p>
        )}

        {success && (
          <p className="bg-green-100 text-green-600 p-2 rounded mb-3">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 border rounded"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-3 rounded"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
