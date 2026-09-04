"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function DMSRegister() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Starting...");

  useEffect(() => {
    if (!isSubmitting) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 200); 

    return () => clearInterval(interval);
  }, [isSubmitting]);

  useEffect(() => {
    if (progress >= 0 && progress < 30) {
      setLoadingText("Initializing setup...");
    } else if (progress >= 30 && progress < 50) {
      setLoadingText("Creating your account...");
    } else if (progress >= 50 && progress < 90) {
      setLoadingText("Almost ready your account...");
    } else if (progress >= 90 && progress < 100) {
      setLoadingText("Ready your account...");
    } else if (progress === 100) {
      setLoadingText("Account created! Redirecting to workspace...");
      
      const timeout = setTimeout(() => {
        router.push('/dms/workspace');
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [progress, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
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
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Join Secure DMS</h1>
          <p className="text-gray-400 text-lg mb-12 leading-relaxed">
            Create an account to browse confidential acquisition opportunities, execute NDAs, and manage end-to-end deal workflows in a single secure environment.
          </p>
          
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                <i className="fas fa-search text-[#eab308] text-lg"></i>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Discover Deals</h4>
                <p className="text-gray-400 leading-relaxed">Access exclusive private market opportunities tailored to your investment mandate.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                <i className="fas fa-shield-alt text-[#eab308] text-lg"></i>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Bank-grade Security</h4>
                <p className="text-gray-400 leading-relaxed">Your identity and confidential documents are protected by enterprise-level encryption.</p>
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
        <div className="w-full max-w-lg">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Create an account</h2>
            <p className="text-gray-500 text-lg">Already have an account? <Link href="/dms/login" className="text-[#3b82f6] font-semibold hover:underline">Sign in</Link></p>
          </div>
          
          {isSubmitting ? (
            <div className="py-20 flex flex-col justify-center h-full min-h-[400px] animate-fade-in">
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-[#3b82f6] mb-3 transition-all duration-300">{loadingText}</h3>
                <p className="text-gray-500 text-lg">Please wait while we provision your secure environment.</p>
              </div>
              
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-[#3b82f6] transition-all duration-1000 ease-linear relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="mt-4 text-right font-bold text-gray-400 text-lg">
                {progress}%
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all bg-gray-50 focus:bg-white" placeholder="John" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Doe" required />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all bg-gray-50 focus:bg-white" placeholder="john@company.com" required />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input type="password" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all bg-gray-50 focus:bg-white" placeholder="••••••••" required minLength={8} />
                <p className="text-xs text-gray-500 mt-2">Must be at least 8 characters long.</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company Type</label>
                <select defaultValue="" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all bg-gray-50 focus:bg-white appearance-none">
                  <option value="" disabled>Select your company type...</option>
                  <option>Corporate Development</option>
                  <option>Private Equity</option>
                  <option>Investment Bank</option>
                  <option>Law Firm</option>
                  <option>Advisor</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div className="flex items-start gap-3 pt-2">
                <input type="checkbox" id="terms" required className="mt-1 w-5 h-5 text-[#3b82f6] border-gray-300 rounded focus:ring-[#3b82f6] cursor-pointer" />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                  I agree to the <a href="#" className="text-[#3b82f6] font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-[#3b82f6] font-medium hover:underline">Privacy Policy</a>.
                </label>
              </div>
              
              <button type="submit" className="w-full bg-[#3b82f6] hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg transition-colors mt-8 shadow-md hover:shadow-lg text-lg">
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
