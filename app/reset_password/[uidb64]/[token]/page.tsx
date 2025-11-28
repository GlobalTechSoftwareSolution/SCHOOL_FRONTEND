"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();

  const uidb64 = params.uidb64 as string;
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("error:Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `https://school.globaltechsoftwaresolutions.cloud/api/password_reset_confirm/${uidb64}/${token}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            new_password: password,
            new_password2: confirmPassword,
            token: token,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("success:Password reset successful! Redirecting...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage("error:" + (data.error || JSON.stringify(data)));
      }
    } catch (err) {
      setMessage("error:Network error. Try again.");
    }

    setLoading(false);
  };

  const getType = () =>
    message.startsWith("success:")
      ? "success"
      : message.startsWith("error:")
      ? "error"
      : "info";

  const getText = () =>
    message.replace(/^(success:|error:)/, "");

  return (
    <div
      className="min-h-screen flex items-center text-black justify-center px-4 py-10 bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1584697964190-2385f1a6a0c7?auto=format&fit=crop&w=1200&q=80')",
      }}
    >
      <div className="bg-white/95 shadow-2xl backdrop-blur-md max-w-md w-full rounded-2xl p-8 border border-gray-200">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-2.586l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
        </div>

        {/* Header */}
        <h2 className="text-3xl text-center font-bold text-gray-900">
          Reset Password
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter and confirm your new password
        </p>

        {/* Form */}
        <form onSubmit={handleReset} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="text-gray-700 text-sm mb-2 inline-block">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter new password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-gray-700 text-sm mb-2 inline-block">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Confirm new password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-40"
          >
            {loading ? "Updating…" : "Reset Password"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-lg text-sm ${
              getType() === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {getText()}
          </div>
        )}

        {/* Back to Login */}
        <p className="text-center mt-6 text-sm">
          <a
            href="/login"
            className="text-green-600 hover:text-green-700 underline"
          >
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
}
