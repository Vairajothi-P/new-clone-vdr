"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function DMSLogin() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate login and redirect to workspace
    setTimeout(() => {
      router.push('/dms/workspace');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Left Panel */}
      <div className="md:w-[45%] bg-[#0b1120] text-white p-10 md:p-16 flex flex-col justify-between">
        <div>
          <Link href="/dms" className="flex items-center text-gray-400 hover:text-white transition-colors group mb-12 w-fit">
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to DMS</span>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Welcome Back</h1>
          <p className="text-gray-400 text-lg mb-12 leading-relaxed">
            Sign in to your Secure DMS account to access your confidential data rooms, manage deals, and review NDAs in one unified environment.
          </p>
          
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                <i className="fas fa-lock text-[#eab308] text-lg"></i>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Secure Access</h4>
                <p className="text-gray-400 leading-relaxed">Multi-factor authentication and enterprise-grade encryption keeps your data safe.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                <i className="fas fa-briefcase text-[#eab308] text-lg"></i>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Deal Continuity</h4>
                <p className="text-gray-400 leading-relaxed">Pick up right where you left off on your active acquisitions and due diligence processes.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3">
            <i className="fas fa-shield-alt text-[#3b82f6] text-2xl"></i>
            <span className="font-bold text-2xl tracking-tight">Secure DMS</span>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="md:w-[55%] flex items-center justify-center p-8 md:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Sign in</h2>
            <p className="text-gray-500 text-lg">Don't have an account? <Link href="/dms/register" className="text-[#3b82f6] font-semibold hover:underline">Create one</Link></p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Work Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all bg-gray-50 focus:bg-white" placeholder="john@company.com" required disabled={isSubmitting} />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-sm font-medium text-[#3b82f6] hover:underline">Forgot password?</a>
              </div>
              <input type="password" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all bg-gray-50 focus:bg-white" placeholder="••••••••" required disabled={isSubmitting} />
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#3b82f6] hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg transition-colors mt-8 shadow-md hover:shadow-lg text-lg flex justify-center items-center h-[60px]"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
