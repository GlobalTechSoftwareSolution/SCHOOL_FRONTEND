'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  BookOpen,
  GraduationCap,
  School,
  Users,
  Sparkles,
  ArrowRight,
  UserCog,
  Briefcase,
  Crown
} from "lucide-react";


export default function SignupPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    password2: '', // Changed from confirmPassword to password2
    role: 'Student', // Changed to match API format
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (form.password !== form.password2) {
      alert('Passwords do not match!');
      return;
    }

    if (form.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: form.email,
        password: form.password,
        password2: form.password2,
        role: form.role,
      };

      const res = await fetch('https://globaltechsoftwaresolutions.cloud/school-api/api/signup/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Registration successful! Please check your email for verification.');
        // Redirect to login page
        window.location.href = '/login';
      } else {
        // Handle different error cases
        if (data.email) {
          alert(`Email error: ${data.email[0]}`);
        } else if (data.password) {
          alert(`Password error: ${data.password[0]}`);
        } else if (data.non_field_errors) {
          alert(`Error: ${data.non_field_errors[0]}`);
        } else {
          alert('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!form.email || !form.email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
    }
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getRoleIcon = () => {
    switch (form.role) {
      case 'Student': return <GraduationCap className="w-6 h-6" />;
      case 'Teacher': return <School className="w-6 h-6" />;
      case 'Admin': return <UserCog  className="w-6 h-6" />;
      case 'Management': return <Briefcase  className="w-6 h-6" />;
      case 'Principal': return <Crown  className="w-6 h-6" />;
      case 'Parent': return <Users  className="w-6 h-6" />;
      default: return <User className="w-6 h-6" />;
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-pulse text-2xl text-purple-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <BookOpen className="text-blue-400 w-8 h-8" />
        </div>
        <div className="absolute top-40 right-20 animate-float animation-delay-1000">
          <GraduationCap className="text-purple-400 w-10 h-10" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float animation-delay-2000">
          <School className="text-pink-400 w-9 h-9" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center justify-center gap-8">
          {/* Left Side - Hero Section */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-purple-600 mb-2" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-3">
                EduPortal
              </h1>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Start Your <span className="text-purple-600">Learning Journey</span> 🎯
            </h2>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Join thousands of students and educators in our innovative learning platform. 
              Create your account and unlock a world of knowledge and opportunities.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Interactive learning materials</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Expert-led courses and guidance</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Progress tracking and analytics</span>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="lg:w-1/2 w-full max-w-lg">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 p-8 transform hover:scale-[1.02] transition-all duration-300">
              {/* Progress Steps */}
              <div className="flex justify-between items-center mb-8">
                {[1, 2].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      step === currentStep 
                        ? 'bg-purple-600 text-white scale-110' 
                        : step < currentStep 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step < currentStep ? '✓' : step}
                    </div>
                    <span className="text-xs mt-2 text-gray-700 font-medium">
                      {step === 1 ? 'Account' : 'Complete'}
                    </span>
                  </div>
                ))}
              </div>

              <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Create Your Account
              </h3>
              <p className="text-center text-gray-600 mb-8">
                Join our educational community today
              </p>

              <div className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200 placeholder-gray-500 text-gray-800"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200 placeholder-gray-500 text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        name="password2"
                        type={showConfirm ? 'text' : 'password'}
                        value={form.password2}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200 placeholder-gray-500 text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </>
                )}

                {/* Step 2: Role Selection */}
                {currentStep === 2 && (
                  <>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {getRoleIcon()}
                      </div>
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all duration-200 text-gray-800 cursor-pointer"
                      >
                        <option value="Student" className="text-gray-800">🎓 Student</option>
                        <option value="Teacher" className="text-gray-800">👨‍🏫 Teacher</option>
                        <option value="Admin" className="text-gray-800">⚡ Admin</option>
                        <option value="management" className="text-gray-800">🏢 Management</option>
                        <option value="principal" className="text-gray-800">👨‍💼 Principal</option>
                        <option value="Parent" className="text-gray-800">👨‍👩‍👧‍👦 Parent</option>
                      </select>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        {form.role} Account
                      </h4>
                      <p className="text-blue-700 text-sm">
                        {form.role === 'Student' && 'Get access to courses, assignments, and learning materials.'}
                        {form.role === 'Teacher' && 'Create courses, manage students, and track progress.'}
                        {form.role === 'Admin' && 'Manage the platform, users, and system settings.'}
                      </p>
                    </div>
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <button
                      onClick={prevStep}
                      className="flex-1 py-4 rounded-2xl text-gray-700 border-2 border-gray-400 font-semibold hover:bg-gray-50 hover:border-gray-500 transition-all duration-300 transform hover:scale-105"
                    >
                      Back
                    </button>
                  )}
                  
                  {currentStep < 2 ? (
                    <button
                      onClick={nextStep}
                      className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`flex-1 py-4 rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105 ${
                        loading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Footer Links */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-700">
                  Already have an account?{' '}
                  <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200">
                    Sign in here
                  </Link>
                </p>
              </div>
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