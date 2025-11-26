'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Dialog } from '@headlessui/react';
import { Eye, EyeOff, User, Lock, Mail, School, Sparkles, BookOpen, GraduationCap } from 'lucide-react';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dialog, setDialog] = useState({ open: false, title: '', message: '' });

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper: show dialog
  const showDialog = (title: string, message: string) => {
    setDialog({ open: true, title, message });
  };

  // Helper function to handle successful login
  const handleSuccessfulLogin = async (userData: any, tokenData: any) => {
    // Validate that user has the expected role or is approved
    if (!userData.role) {
      userData.role = role;
    }

    // Check if user is approved/has access
    if (userData.is_active === false) {
      showDialog("Account Inactive", "Your account is inactive. Please contact administrator.");
      setLoading(false);
      return;
    }

    if (userData.is_approved === false) {
      showDialog("Approval Pending", "Your account is pending approval. Please contact administrator.");
      setLoading(false);
      return;
    }

    // Check if role matches (case-insensitive)
    if (userData.role.toLowerCase() !== role.toLowerCase()) {
      showDialog("Role Mismatch", `Your account is registered as ${userData.role}. Please select the correct role.`);
      setLoading(false);
      return;
    }

    // Store user info
 const userInfo = {
  email: userData.email,
  role: userData.role,
  is_active: userData.is_active,
  is_approved: userData.is_approved,
  name: email.split('@')[0]   // fallback username
};


    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userEmail', userData.email || email);

    setLoading(false);

    // Redirect based on verified role
    const userRole = userInfo.role.toLowerCase();

    const redirectPaths = {
      'admin': '/admin',
      'teacher': '/teachers', 
      'student': '/students',
      'management': '/management',
      'principal': '/principal',
      'parent': '/parents'
    };

    const redirectPath = redirectPaths[userRole as keyof typeof redirectPaths] || '/students';    
    router.push(redirectPath);
  };

  const login = async () => {
    if (!email || !password) {
      showDialog("Invalid Input", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Get JWT token and user data from token endpoint
      const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

      const tokenRes = await fetch('https://school.globaltechsoftwaresolutions.cloud/api/token/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          role: formattedRole  // Capitalize role for backend compatibility
        })
      });

      if (!tokenRes.ok) {
        setLoading(false);
        if (tokenRes.status === 401) {
          showDialog("Invalid Credentials", "Invalid email or password.");
        } else if (tokenRes.status === 400) {
          showDialog("Invalid Input", "Please check your email, password or role.");
        } else {
          showDialog("Login Failed", "Login failed. Please try again.");
        }
        return;
      }

      const tokenData = await tokenRes.json();

      // Store the tokens
      localStorage.setItem('accessToken', tokenData.access);
      localStorage.setItem('refreshToken', tokenData.refresh);
      localStorage.setItem('authToken', tokenData.access);

      // ✅ Directly handle login with token data (no extra /login call)
   const userData = {
  email: tokenData.email,
  role: tokenData.role,
  is_active: tokenData.is_active,
  is_approved: tokenData.is_approved
};


      await handleSuccessfulLogin(userData, tokenData);
    } catch (error) {
      setLoading(false);
      showDialog("Network Error", "Please check your internet connection and try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      login();
    }
  };

  // Debug function to check storage
  const checkStorage = () => {
    // Storage check logic here (logging removed for production)
  };

  // Clear storage for testing
  const clearStorage = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('refreshToken');
    showDialog("Storage Cleared", "Storage cleared for testing.");
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
              <span>Two-step authentication security</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-900 mb-3">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Role-based access control</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-900">
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
              <span>Real-time verification system</span>
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
                  <option value="management">🏢 Management</option>
                  <option value="principal">👨‍💼 Principal</option>
                  <option value="parent">👨‍👩‍👧 Parent</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-900 pointer-events-none">▼</div>
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
                  required
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
                  required
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
                  type="button"
                  onClick={() => router.push('/signup')}
                  className="flex-1 py-4 rounded-2xl text-purple-800 border-2 border-purple-800 font-semibold hover:bg-purple-100 transition-all duration-300 transform hover:scale-105"
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center">
              <a href="/forgot_password" className="text-sm text-purple-800 hover:text-purple-900 font-medium transition-colors duration-200">
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

      {/* Modal Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <Dialog.Panel className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center">
          <Dialog.Title className="text-lg font-bold text-purple-800 mb-2">{dialog.title}</Dialog.Title>
          <Dialog.Description className="text-gray-800 mb-4">{dialog.message}</Dialog.Description>
          <button onClick={() => setDialog({ ...dialog, open: false })} className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition-all duration-200">OK</button>
        </Dialog.Panel>
      </Dialog>

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