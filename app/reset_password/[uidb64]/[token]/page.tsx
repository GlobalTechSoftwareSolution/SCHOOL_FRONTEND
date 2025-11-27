"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();

  // Auto-read from URL
  const uidb64 = params?.uidb64 as string | undefined;
  const token  = params?.token  as string | undefined;

  console.log("DEBUG PARAMS:", uidb64, token);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uidb64 || !token) {
      setMessage("Invalid or expired reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
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
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset successful! Redirecting...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleReset}>
      <input 
        type="password" 
        placeholder="New Password"
        required 
        onChange={(e) => setPassword(e.target.value)}
      />

      <input 
        type="password" 
        placeholder="Confirm New Password"
        required 
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Reset Password"}
      </button>

      <p>{message}</p>
    </form>
  );
}
