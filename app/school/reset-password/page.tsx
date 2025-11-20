'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';

// Create a client-only component to handle search params
const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Extract email and token from URL parameters
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlToken = searchParams.get('token');
    const urlUid = searchParams.get('uid') || searchParams.get('uidb64');

    if (urlEmail) {
      setEmail(urlEmail);
    }

    if (urlUid) {
      setUid(urlUid);

      if (!urlEmail) {
        try {
          const decoded = atob(urlUid.replace(/-/g, '+').replace(/_/g, '/'));
          setEmail(decoded);
        } catch {
          // Ignore decode errors; backend might not be using base64 email
        }
      }
    }

    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    const identifier = (uid || email).trim();

    if (!identifier || !token) {
      setError('Invalid or expired password reset link');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending password reset with identifier:', identifier);
      console.log('Email (decoded if available):', email);
      console.log('Token:', token);
      console.log('New password length:', newPassword.length);
      
      // Try different possible endpoints
      const endpoints = [
        `https://globaltechsoftwaresolutions.cloud/school-api/api/password_reset_confirm/${identifier}/${token}/`,
        `https://globaltechsoftwaresolutions.cloud/school-api/api/password-reset-confirm/${identifier}/${token}/`,
        `https://globaltechsoftwaresolutions.cloud/school-api/api/auth/password_reset_confirm/${identifier}/${token}/`,
        `https://globaltechsoftwaresolutions.cloud/school-api/api/auth/password-reset-confirm/${identifier}/${token}/`
      ];
      
      let res;
      let lastError;
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              new_password: newPassword,
              new_password2: confirmPassword
            }),
          });
          
          // Check if this endpoint works (not 404)
          if (res.status !== 404) {
            console.log('Found working endpoint:', endpoint);
            break;
          }
        } catch (err) {
          lastError = err;
          console.log('Endpoint failed:', endpoint, err);
        }
      }
      
      // If all endpoints failed with 404, use the first one for the error message
      if (!res || res.status === 404) {
        res = await fetch(endpoints[0], {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_password: newPassword,
            new_password2: confirmPassword
          }),
        });
      }

      console.log('Password reset response status:', res.status);
      console.log('Password reset response headers:', [...res.headers.entries()]);
      
      // Check if response is HTML (error page)
      const contentType = res.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      if (contentType && contentType.includes('text/html')) {
        const text = await res.text();
        console.error('Received HTML response instead of JSON:', text.substring(0, 500));
        throw new Error('Server returned an HTML page instead of JSON. Check if the endpoint is correct.');
      }

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Password reset error response:', errorData);
        throw new Error(errorData.detail || 'Failed to reset password');
      }

      const data = await res.json();
      console.log('Password reset success response:', data);
      setSuccess(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-green-600 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Success!</h1>
            <p className="text-gray-600 mb-6">
              Your password has been reset successfully. You will be redirected to the login page shortly.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all"
            >
              Go to Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black  flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto bg-gradient-to-r from-purple-600 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Lock className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              Enter your new password below to reset your account password
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-100"
                placeholder="you@example.com"
                required
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reset Token
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-100"
                placeholder="Reset token"
                required
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Suspense } from 'react';

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;