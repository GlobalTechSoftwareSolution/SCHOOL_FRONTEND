'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock, Phone, BookOpen, GraduationCap, School, Users, Sparkles, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    name: '',
    phone: '',
    gradeId: '',
    sectionId: '',
    roll: '',
    subject: '',
    parent: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    let payload: any = {
      email: form.email,
      password: form.password,
      role: form.role,
      name: form.name,
      phone: form.phone,
    };

    if (form.role === 'STUDENT') {
      payload.sectionId = form.sectionId;
      payload.roll = form.roll;
      payload.parent = form.parent;
      payload.createdByAdmin = true;
    } else if (form.role === 'TEACHER') {
      payload.subject = form.subject;
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    alert(data.message || data.error);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getRoleIcon = () => {
    switch (form.role) {
      case 'STUDENT': return <GraduationCap className="w-6 h-6" />;
      case 'TEACHER': return <School className="w-6 h-6" />;
      case 'ADMIN': return <Users className="w-6 h-6" />;
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
          <BookOpen className="text-blue-300 w-8 h-8" />
        </div>
        <div className="absolute top-40 right-20 animate-float animation-delay-1000">
          <GraduationCap className="text-purple-300 w-10 h-10" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float animation-delay-2000">
          <School className="text-pink-300 w-9 h-9" />
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
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join thousands of students and educators in our innovative learning platform. 
              Create your account and unlock a world of knowledge and opportunities.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Interactive learning materials</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Expert-led courses and guidance</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Progress tracking and analytics</span>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="lg:w-1/2 w-full max-w-lg">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
              {/* Progress Steps */}
              <div className="flex justify-between items-center mb-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      step === currentStep 
                        ? 'bg-purple-600 text-white scale-110' 
                        : step < currentStep 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step < currentStep ? '✓' : step}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">
                      {step === 1 ? 'Account' : step === 2 ? 'Profile' : 'Complete'}
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
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        name="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </>
                )}

                {/* Step 2: Role & Personal Info */}
                {currentStep === 2 && (
                  <>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {getRoleIcon()}
                      </div>
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 appearance-none cursor-pointer"
                      >
                        <option value="STUDENT">🎓 Student</option>
                        <option value="TEACHER">👨‍🏫 Teacher</option>
                        <option value="ADMIN">⚡ Admin</option>
                      </select>
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Full name"
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Phone number"
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                      />
                    </div>
                  </>
                )}

                {/* Step 3: Role-specific Details */}
                {currentStep === 3 && (
                  <>
                    {form.role === 'STUDENT' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="relative">
                            <input
                              name="gradeId"
                              value={form.gradeId}
                              onChange={handleChange}
                              placeholder="Grade"
                              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                            />
                          </div>
                          <div className="relative">
                            <input
                              name="sectionId"
                              value={form.sectionId}
                              onChange={handleChange}
                              placeholder="Section"
                              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="relative">
                            <input
                              name="roll"
                              value={form.roll}
                              onChange={handleChange}
                              placeholder="Roll Number"
                              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                            />
                          </div>
                          <div className="relative">
                            <input
                              name="parent"
                              value={form.parent}
                              onChange={handleChange}
                              placeholder="Parent Name"
                              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {form.role === 'TEACHER' && (
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <input
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          placeholder="Subject you teach"
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <button
                      onClick={prevStep}
                      className="flex-1 py-4 rounded-2xl text-gray-600 border-2 border-gray-300 font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                    >
                      Back
                    </button>
                  )}
                  
                  {currentStep < 3 ? (
                    <button
                      onClick={nextStep}
                      className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold hover:from-green-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Create Account
                    </button>
                  )}
                </div>
              </div>

              {/* Footer Links */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
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