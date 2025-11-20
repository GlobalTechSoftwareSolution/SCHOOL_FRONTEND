'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const router = useRouter();
  
  // States for different stages of the process
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stage, setStage] = useState<'request' | 'instructions' | 'success'>('request'); // request -> instructions -> success

  // Handle password reset request (send email)
  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Sending password reset request for email:', email);
      
      // Try different possible endpoints
      const endpoints = [
        'https://globaltechsoftwaresolutions.cloud/school-api/api/password_reset/',
        'https://globaltechsoftwaresolutions.cloud/school-api/api/auth/password_reset/'
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
            body: JSON.stringify({ email }),
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
          body: JSON.stringify({ email }),
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
        throw new Error(errorData.detail || 'Failed to send reset email');
      }

      const data = await res.json();
      console.log('Password reset success response:', data);
      setSuccess('Password reset instructions sent successfully. Please check your email for the reset link.');
      setStage('instructions');
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-black flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto bg-gradient-to-r from-purple-600 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              {stage === 'request' && <Mail className="text-white w-8 h-8" />}
              {stage === 'instructions' && <Mail className="text-white w-8 h-8" />}
              {stage === 'success' && <CheckCircle className="text-white w-8 h-8" />}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {stage === 'request' && 'Forgot Password?'}
              {stage === 'instructions' && 'Check Your Email'}
              {stage === 'success' && 'Success!'}
            </h1>
            <p className="text-gray-600">
              {stage === 'request' && 'Enter your email to receive reset instructions'}
              {stage === 'instructions' && 'Follow the instructions in your email to reset your password'}
              {stage === 'success' && 'Your password has been reset successfully'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Request Reset Form */}
          {stage === 'request' && (
            <form onSubmit={handleResetRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="you@example.com"
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
                    Sending...
                  </div>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>
          )}

          {/* Instructions State */}
          {stage === 'instructions' && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="text-blue-600 w-8 h-8" />
              </div>
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to <strong>{email}</strong>. 
                Please check your email and click the reset link to set a new password.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mb-6">
                <p className="font-medium mb-1">Didn't receive the email?</p>
                <p>Check your spam folder or try again in a few minutes.</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setStage('request')}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Resend Email
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {stage === 'success' && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-green-600 w-8 h-8" />
              </div>
              <p className="text-gray-600 mb-6">
                You will be redirected to the login page shortly.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all"
              >
                Go to Login Now
              </button>
            </div>
          )}

          {/* Back to Login */}
          {stage !== 'instructions' && (
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;