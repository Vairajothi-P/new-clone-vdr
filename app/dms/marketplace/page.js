"use client";

import Link from "next/link";
import { FaArrowLeft, FaSearch, FaCheck, FaShieldAlt, FaLink, FaArrowRight, FaLock, FaBriefcase } from "react-icons/fa";

export default function Marketplace() {
  return (
    <main className="min-h-screen bg-[#0b1120] text-white">
      {/* Custom Header for Marketplace */}
      <nav className="fixed top-0 left-0 w-full bg-[#0b1120]/95 backdrop-blur-md z-50 py-5 px-4 md:px-12 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center">
          <Link href="/dms" className="flex items-center text-gray-400 hover:text-white transition-colors group py-2">
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors font-medium py-2">How It Works</a>
          <Link href="#" className="text-gray-400 hover:text-white transition-colors font-medium py-2">For Sellers</Link>
          <a href="#for-buyers" className="text-gray-400 hover:text-white transition-colors font-medium py-2">For Buyers</a>
          <Link href="#" className="text-gray-400 hover:text-white transition-colors font-medium py-2">Resources</Link>
        </div>
        
        {/* Right side - Auth */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/dms/login" className="text-white hover:text-[#eab308] border border-white/30 hover:border-[#eab308] px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap">
            Sign In
          </Link>
          <Link href="/dms/register" className="text-white hover:text-[#eab308] border border-white/30 hover:border-[#eab308] px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-8 md:px-24">
        <div className="max-w-4xl">
          <p className="text-[#eab308] text-xs font-bold tracking-[0.2em] uppercase mb-6">
            Private Markets &middot; Live
          </p>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white">
            Deal Marketplace
          </h1>
          
          <p className="text-[#9ca3af] text-lg md:text-xl leading-relaxed max-w-2xl">
            A focused view of anonymous acquisition opportunities for qualified buyers, corporate development teams, and investment professionals.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 md:px-12 lg:px-24 bg-gray-50 text-gray-900 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Card 1 */}
            <div className="bg-white p-8 border border-gray-200 flex flex-col justify-between group hover:shadow-lg transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-4xl font-bold text-[#b48629]">01</span>
                  <FaSearch className="text-gray-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Discover</h3>
                <p className="text-gray-500 leading-relaxed mb-8 text-sm md:text-base">
                  Browse confidential acquisition opportunities across a focused set of industries, geographies, and deal types.
                </p>
              </div>
              <FaArrowRight className="text-[#b48629]" />
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 border border-gray-200 flex flex-col justify-between group hover:shadow-lg transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-4xl font-bold text-[#b48629]">02</span>
                  <FaCheck className="text-gray-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Review</h3>
                <p className="text-gray-500 leading-relaxed mb-8 text-sm md:text-base">
                  Explore anonymous company teasers, financial highlights, and the opportunity's stated transaction context.
                </p>
              </div>
              <FaArrowRight className="text-[#b48629]" />
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 border border-gray-200 flex flex-col justify-between group hover:shadow-lg transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-4xl font-bold text-[#b48629]">03</span>
                  <FaShieldAlt className="text-gray-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Request Access</h3>
                <p className="text-gray-500 leading-relaxed mb-8 text-sm md:text-base">
                  Share your credentials and investment mandate so the seller can evaluate a thoughtful access request.
                </p>
              </div>
              <FaArrowRight className="text-[#b48629]" />
            </div>

            {/* Card 4 */}
            <div className="bg-white p-8 border border-gray-200 flex flex-col justify-between group hover:shadow-lg transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-4xl font-bold text-[#b48629]">04</span>
                  <FaLink className="text-gray-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Connect</h3>
                <p className="text-gray-500 leading-relaxed mb-8 text-sm md:text-base">
                  Once approved, continue into a secure transaction process with the right information at the right time.
                </p>
              </div>
              <FaArrowRight className="text-[#b48629]" />
            </div>
          </div>

          {/* Callout */}
          <div className="bg-white p-6 border-l-4 border-l-[#b48629] shadow-sm">
            <p className="text-gray-800 font-medium text-sm md:text-base">
              More advanced transaction workflows will be introduced in future versions, including secure VDR, NDA, Q&A, and transaction workflows.
            </p>
          </div>
        </div>
      </section>

      {/* For Buyers Section */}
      <section id="for-buyers" className="py-24 px-4 md:px-12 lg:px-24 bg-[#f8fafc] text-gray-900 scroll-mt-24 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-200 shadow-sm mb-20">
            {/* Card 1 */}
            <div className="p-10 border-b md:border-r border-gray-200">
              <div className="w-12 h-12 bg-[#0b1120] rounded mb-6 flex items-center justify-center border border-gray-700 shadow-sm">
                <FaSearch className="text-[#eab308] text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Browse efficiently</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Use clear financial, industry, geography, and transaction filters to focus your search.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="p-10 border-b border-gray-200">
              <div className="w-12 h-12 bg-[#0b1120] rounded mb-6 flex items-center justify-center border border-gray-700 shadow-sm">
                <FaLock className="text-[#eab308] text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Stay confidential</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Company identities remain protected while you assess fit and submit your credentials.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="p-10 border-b md:border-b-0 md:border-r border-gray-200">
              <div className="w-12 h-12 bg-[#0b1120] rounded mb-6 flex items-center justify-center border border-gray-700 shadow-sm">
                <FaShieldAlt className="text-[#eab308] text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Request thoughtfully</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Give sellers the context they need to make an informed access decision.
              </p>
            </div>
            
            {/* Card 4 */}
            <div className="p-10">
              <div className="w-12 h-12 bg-[#0b1120] rounded mb-6 flex items-center justify-center border border-gray-700 shadow-sm">
                <FaBriefcase className="text-[#eab308] text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Move with intent</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Keep your early-stage deal sourcing focused on opportunities aligned with your mandate.
              </p>
            </div>
          </div>

          {/* Your buyer journey */}
          <div>
            <h2 className="text-3xl font-bold mb-10 text-gray-900">Your buyer journey</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="border-t-[3px] border-[#d4af37] pt-4">
                <p className="text-[#b48629] font-bold text-sm mb-2">01</p>
                <p className="font-bold text-sm">Browse deals</p>
              </div>
              <div className="border-t-[3px] border-[#d4af37] pt-4">
                <p className="text-[#b48629] font-bold text-sm mb-2">02</p>
                <p className="font-bold text-sm">Open a teaser</p>
              </div>
              <div className="border-t-[3px] border-[#d4af37] pt-4">
                <p className="text-[#b48629] font-bold text-sm mb-2">03</p>
                <p className="font-bold text-sm">Request access</p>
              </div>
              <div className="border-t-[3px] border-[#d4af37] pt-4">
                <p className="text-[#b48629] font-bold text-sm mb-2">04</p>
                <p className="font-bold text-sm">Access pending</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
