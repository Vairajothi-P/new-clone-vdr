"use client";

import { useState } from 'react';

export default function BrandingPage() {
  const [activeTheme, setActiveTheme] = useState(1);
  const [brandName, setBrandName] = useState('Acme Corp');

  // Modernized color palette with rich gradients
  const themes = [
    { id: 0, label: 'Sunset Glow', colors: ['bg-gradient-to-tr from-amber-400 to-orange-500', 'bg-orange-600'] },
    { id: 1, label: 'Deep Ocean', colors: ['bg-gradient-to-tr from-blue-500 to-cyan-400', 'bg-blue-600'] },
    { id: 2, label: 'Neon Forest', colors: ['bg-gradient-to-tr from-emerald-400 to-teal-500', 'bg-teal-700'] },
    { id: 3, label: 'Cyber Berry', colors: ['bg-gradient-to-tr from-fuchsia-500 to-purple-600', 'bg-purple-700'] },
    { id: 4, label: 'Midnight AI', colors: ['bg-gradient-to-tr from-slate-700 to-slate-900', 'bg-black'] },
    { id: 5, label: 'Rose Gold', colors: ['bg-gradient-to-tr from-rose-400 to-pink-500', 'bg-rose-700'] },
  ];

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>
      
      <div className="relative p-4 md:p-6 max-w-5xl mx-auto w-full space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-700">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Branding & Identity</h1>
            <p className="text-gray-500 mt-2 text-[15px]">Design a workspace that feels native to your clients and partners.</p>
          </div>
          <button className="px-6 py-2.5 bg-gradient-to-r from-gray-900 to-black text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-gray-900/20 hover:-translate-y-0.5 focus:ring-4 focus:ring-gray-200 transition-all duration-300">
            Publish Changes
          </button>
        </div>

        {/* User Profile Card - Glassmorphism */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-gray-300 transition-all duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-800 text-xl font-bold shadow-sm ring-4 ring-white">
                JD
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">John Doe</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[14px] text-gray-500 mt-1.5 font-medium">
                <span className="flex items-center gap-2 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  admin@company.com
                </span>
                <span className="flex items-center gap-2 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  +1 (555) 123-4567
                </span>
              </div>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Brand Details Card */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100/60 bg-gradient-to-r from-gray-50/50 to-white">
              <h3 className="text-lg font-bold text-gray-900">Brand Assets</h3>
              <p className="text-[13px] text-gray-500 mt-1">Configure your main workspace identifiers.</p>
            </div>
            <div className="p-6 space-y-5 flex-1">
              
              {/* Logo Upload */}
              <div>
                <label className="block text-[14px] font-bold text-gray-800 mb-3">Workspace Logo</label>
                <div className="flex items-start gap-4">
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <div className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-gray-400 group-hover:border-blue-500 group-hover:bg-blue-50/50 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-blue-500 transition-colors mb-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                      <span className="text-[10px] font-bold tracking-wider uppercase group-hover:text-blue-600 transition-colors">Upload</span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-[14px] text-gray-600 leading-relaxed">This logo will be featured on your login screen, shared links, and all outgoing email notifications.</p>
                    <p className="text-[12px] font-medium text-gray-400 mt-3 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      SVG or PNG • 512x512px • Max 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Brand Name Input */}
              <div className="pt-2">
                <label htmlFor="brandName" className="block text-[14px] font-bold text-gray-800 mb-2 flex items-center justify-between">
                  Display Name
                  <span className="text-[11px] font-normal text-gray-400 uppercase tracking-wider">Required</span>
                </label>
                <div className="relative">
                  <input 
                    id="brandName"
                    type="text" 
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 text-[15px] font-medium text-gray-900 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder-gray-400 shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 bg-green-50 p-1 rounded-md opacity-0 transition-opacity" style={{ opacity: brandName.length > 0 ? 1 : 0 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Settings Card */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100/60 bg-gradient-to-r from-gray-50/50 to-white">
              <h3 className="text-lg font-bold text-gray-900">Workspace Theme</h3>
              <p className="text-[13px] text-gray-500 mt-1">Select a primary color palette.</p>
            </div>
            <div className="p-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme.id)}
                    className={`group relative flex flex-col items-start gap-2 p-3 rounded-2xl border transition-all duration-300 ${
                      activeTheme === theme.id 
                        ? 'border-blue-500 bg-blue-50/30 shadow-md ring-1 ring-blue-500 scale-[1.02]' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="w-full h-10 rounded-xl flex overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                      <div className={`w-2/3 h-full ${theme.colors[0]}`}></div>
                      <div className={`w-1/3 h-full ${theme.colors[1]}`}></div>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[13px] font-bold ${activeTheme === theme.id ? 'text-blue-700' : 'text-gray-700'}`}>
                        {theme.label}
                      </span>
                      {activeTheme === theme.id && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
