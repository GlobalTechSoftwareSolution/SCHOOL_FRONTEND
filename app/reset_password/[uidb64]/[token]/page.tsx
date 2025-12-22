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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    } catch {
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

  const getText = () => message.replace(/^(success:|error:)/, "");

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
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.74 5.74L11 17H9v2H7v2H4v-2.59l5.96-5.96A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <h2 className="text-3xl text-center font-bold text-gray-900">Reset Password</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter and confirm your new password
        </p>

        {/* FORM */}
        <form onSubmit={handleReset} className="space-y-6">
          
          {/* NEW PASSWORD FIELD */}
          <div>
            <label className="text-gray-700 text-sm mb-2 inline-block">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12
                focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter new password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Show/Hide Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  /* Eye Off Icon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.48 0-8.27-2.94-9.54-7a9.96 9.96 0 011.55-3.01M9.88 9.88a3 3 0 104.24 4.24M9.88 9.88L4 4m5.88 5.88l5.66 5.66M6.59 6.59l3.29 3.29m9.02 9.02l-3.29-3.29" />
                  </svg>
                ) : (
                  /* Eye Icon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.46 12C3.73 7.94 7.52 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-5.06 7-9.54 7s-8.27-2.94-9.54-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD FIELD */}
          <div>
            <label className="text-gray-700 text-sm mb-2 inline-block">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12
                focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Confirm new password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {/* Eye Toggle */}
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? (
                  /* Eye Off */
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.48 0-8.27-2.94-9.54-7a9.96 9.96 0 011.55-3.01M9.88 9.88a3 3 0 104.24 4.24M9.88 9.88L4 4m5.88 5.88l5.66 5.66M6.59 6.59l3.29 3.29m9.02 9.02l-3.29-3.29" />
                  </svg>
                ) : (
                  /* Eye */
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.46 12C3.73 7.94 7.52 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-5.06 7-9.54 7s-8.27-2.94-9.54-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-40"
          >
            {loading ? "Updating…" : "Reset Password"}
          </button>
        </form>

        {/* MESSAGE */}
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

        <p className="text-center mt-6 text-sm">
          <a href="/login" className="text-green-600 hover:text-green-700 underline">
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
}
