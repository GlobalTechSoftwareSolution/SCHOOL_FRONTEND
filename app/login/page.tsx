'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Eye, EyeOff, User, Lock, Mail, School, Sparkles, BookOpen, GraduationCap } from 'lucide-react';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const login = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Get tokens
      const tokenRes = await fetch('https://globaltechsoftwaresolutions.cloud/school-api/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!tokenRes.ok) {
        setLoading(false);
        alert('Invalid credentials or unapproved user');
        return;
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access;
      const refreshToken = tokenData.refresh;

      // Save tokens locally
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Step 2: Fetch user info using access token
      const userRes = await fetch('https://globaltechsoftwaresolutions.cloud/school-api/api/login/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      setLoading(false);

      if (!userRes.ok) {
        alert('Unable to fetch user details. Try again.');
        return;
      }

      const userData = await userRes.json();
      localStorage.setItem('userData', JSON.stringify(userData));

      // Step 3: Redirect based on role
      switch (userData.role?.toLowerCase()) {
        case 'admin':
          router.push('/admin');
          break;
        case 'teacher':
          router.push('/teachers');
          break;
        case 'student':
        default:
          router.push('/students');
          break;
      }

    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      login();
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 text-black">
        <div className="animate-pulse text-2xl text-purple-800">Loading...</div>
      </div>
    );
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden text-black">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          
          {/* Floating Icons */}
          <div className="absolute top-1/4 left-1/6 animate-float">
            <BookOpen className="text-gray-900 w-8 h-8" />
          </div>
          <div className="absolute top-1/3 right-1/5 animate-float animation-delay-1000">
            <GraduationCap className="text-gray-900 w-10 h-10" />
          </div>
          <div className="absolute bottom-1/4 right-1/6 animate-float animation-delay-2000">
            <School className="text-gray-900 w-9 h-9" />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl mx-4">
          {/* Left Side - Hero Section */}
          <div className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0 lg:pr-12">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-purple-800 mb-2" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-800 to-blue-800 bg-clip-text text-transparent ml-3">
                Smart School Portal
              </h1>
            </div>
            <p className="text-xl lg:text-2xl text-gray-900 mb-4 font-light">
              Welcome back to your
            </p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              Learning <span className="text-purple-800">Adventure</span> 🚀
            </p>
            <div className="hidden lg:block">
              <div className="flex items-center space-x-4 text-gray-900 mb-3">
                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                <span>Connect with educators worldwide</span>
              </div>
              <div className="flex items-center space-x-4 text-gray-900 mb-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Access exclusive learning resources</span>
              </div>
              <div className="flex items-center space-x-4 text-gray-900">
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                <span>Track your progress in real-time</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="relative lg:w-1/2 max-w-md w-full text-black">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-400 p-8 lg:p-10 transform hover:scale-[1.02] transition-all duration-300">
              {/* Decorative Elements */}
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-purple-800 rounded-full"></div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-blue-800 rounded-full"></div>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-2">
                Welcome Back!
              </h2>
              <p className="text-center text-gray-800 mb-8">
                Continue your educational journey
              </p>

              <div className="space-y-6">
                {/* Role Selector */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900">
                    <User className="w-5 h-5" />
                  </div>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-transparent bg-white/90 backdrop-blur-sm transition-all duration-200 appearance-none cursor-pointer text-gray-900"
                  >
                    <option value="student">🎓 Student</option>
                    <option value="teacher">👨‍🏫 Teacher</option>
                    <option value="admin">⚡ Admin</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-900 pointer-events-none">
                    ▼
                  </div>
                </div>

                {/* Email Input */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-4 border border-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent bg-white/90 backdrop-blur-sm transition-all duration-200 placeholder-gray-700 text-gray-900"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-12 py-4 border border-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent bg-white/90 backdrop-blur-sm transition-all duration-200 placeholder-gray-700 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-900 hover:text-gray-700 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={login}
                    disabled={loading}
                    className={`flex-1 py-4 rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105 ${
                      loading 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-800 to-blue-800 hover:from-purple-900 hover:to-blue-900 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <button
                    onClick={() => router.push('/signup')}
                    className="flex-1 py-4 rounded-2xl text-purple-800 border-2 border-purple-800 font-semibold hover:bg-purple-100 transition-all duration-300 transform hover:scale-105"
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {/* Footer Links */}
              <div className="mt-8 text-center">
                <a href="/forgot-password" className="text-sm text-purple-800 hover:text-purple-900 font-medium transition-colors duration-200">
                  Forgot your password?
                </a>
                
                <p className="text-sm text-gray-800 mt-4">
                  New to EduPortal?{' '}
                  <a href="/signup" className="text-purple-800 hover:text-purple-900 font-medium transition-colors duration-200">
                    Start your journey here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-purple-800 text-xl">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}