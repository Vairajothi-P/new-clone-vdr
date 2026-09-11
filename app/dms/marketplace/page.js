"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaArrowLeft, FaSearch, FaCheck, FaShieldAlt, FaLink, FaArrowRight, FaLock, FaBriefcase, FaPowerOff, FaEllipsisV, FaMapMarkerAlt, FaRegBookmark, FaFilter, FaChevronDown, FaRedoAlt } from "react-icons/fa";

export default function Marketplace() {
  const [userRole, setUserRole] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setUserRole(localStorage.getItem('userRole'));
    const savedTeasers = localStorage.getItem('dms_market_teasers');
    if (savedTeasers) {
      try {
        setOpportunities(JSON.parse(savedTeasers));
      } catch (e) {}
    }
  }, []);

  if (!isMounted) return null;

  return (
    <main className={`min-h-screen ${userRole ? 'bg-[#f4f7f9] text-gray-900' : 'bg-[#0b1120] text-white'}`}>
      {/* Custom Header for Marketplace */}
      <nav className="fixed top-0 left-0 w-full bg-[#0b1120]/95 backdrop-blur-md z-50 py-5 px-4 md:px-12 flex justify-between items-center border-b border-white/10 text-white">
        <div className="flex items-center">
          {!userRole ? (
            <Link href="/dms" className="flex items-center text-gray-400 hover:text-white transition-colors group py-2">
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </Link>
          ) : (
            <span className="text-xl font-bold text-white tracking-wide">Marketplace</span>
          )}
        </div>
        

        
        {/* Right side - Auth */}
        <div className="hidden md:flex items-center gap-4">
          {userRole ? (
            <Link href="/dms/login">
              <button 
                onClick={() => localStorage.removeItem('userRole')}
                className="text-white hover:text-red-400 border border-white/30 hover:border-red-400 px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <FaPowerOff /> Logout
              </button>
            </Link>
          ) : (
            <>
              <Link href="/dms/login" className="text-white hover:text-[#eab308] border border-white/30 hover:border-[#eab308] px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap">
                Sign In
              </Link>
              <Link href="/dms/register" className="text-white hover:text-[#eab308] border border-white/30 hover:border-[#eab308] px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      {!userRole && (
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
      )}

      {/* Logged-in Dashboard View */}
      {userRole && (
        <div className="pt-32 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto pb-24">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <p className="text-[#b48629] text-xs font-bold tracking-[0.15em] uppercase mb-2">Live Marketplace</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Explore Active Opportunities</h1>
            </div>
            <div className="text-sm text-gray-500 mt-4 md:mt-0">
              11 matching opportunities &middot; updated 4m ago
            </div>
          </div>
          
          {/* Search Bar Area */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by industry, business model, or keyword" 
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#b48629] focus:ring-1 focus:ring-[#b48629] transition-all"
              />
            </div>
            <div className="relative w-full md:w-48">
              <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-3 pl-4 pr-10 text-sm focus:outline-none focus:border-[#b48629] text-gray-700 cursor-pointer">
                <option>Sort: Newest</option>
                <option>Sort: Revenue (High to Low)</option>
                <option>Sort: EBITDA (High to Low)</option>
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold tracking-widest text-gray-900">FILTERS</h3>
                  <button className="text-gray-500 hover:text-gray-900 text-xs flex items-center gap-1 transition-colors">
                    <FaRedoAlt className="text-[10px]" /> Reset
                  </button>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Industry</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-200 rounded-md py-2.5 pl-3 pr-8 text-sm focus:outline-none focus:border-[#b48629] text-gray-700 cursor-pointer">
                        <option>All Industries</option>
                        <option>Technology / SaaS</option>
                        <option>Healthcare</option>
                        <option>Manufacturing</option>
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Location</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-200 rounded-md py-2.5 pl-3 pr-8 text-sm focus:outline-none focus:border-[#b48629] text-gray-700 cursor-pointer">
                        <option>All Locations</option>
                        <option>North America</option>
                        <option>Europe</option>
                        <option>Asia Pacific</option>
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Deal Type</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-200 rounded-md py-2.5 pl-3 pr-8 text-sm focus:outline-none focus:border-[#b48629] text-gray-700 cursor-pointer">
                        <option>All Deal Types</option>
                        <option>Majority Acquisition</option>
                        <option>Minority Investment</option>
                        <option>Asset Sale</option>
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    All opportunities are presented anonymously. Detailed information is shared only after seller approval.
                  </p>
                </div>
              </div>
            </div>

            {/* Projects Area */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <FaFilter className="text-gray-400 text-xs" />
                <span>Showing <strong>{opportunities.length}</strong> opportunities</span>
              </div>

              {opportunities.length === 0 ? (
                <div className="w-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 bg-white border border-gray-200 rounded-lg">
                  <FaSearch className="text-4xl mb-4 opacity-40" />
                  <p className="text-xl font-medium">No opportunities found</p>
                  <p className="text-sm mt-2">Check back later or adjust your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {opportunities.map((opp, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 flex flex-col group relative overflow-hidden hover:shadow-md transition-shadow">
                      
                      <div className="p-5 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                          <span className={`px-3 py-1 text-white text-[10px] font-bold tracking-wide rounded-sm uppercase ${opp.status === 'Active' ? 'bg-[#b48629]' : 'bg-green-700'}`}>
                            {opp.status || 'Active'}
                          </span>
                          <button className="text-gray-400 hover:text-gray-900 transition-colors">
                            <FaRegBookmark />
                          </button>
                        </div>
                        
                        <div className="mb-6">
                          <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">{opp.projectName}</p>
                          <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3">{opp.name}</h3>
                          <div className="flex items-center text-xs text-[#b48629] font-medium">
                            <FaMapMarkerAlt className="mr-1.5" /> {opp.sector || 'Sector'} &middot; {opp.geography || 'Global'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-8 mt-auto">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Revenue</p>
                            <p className="font-bold text-gray-900">{opp.revenue || 'TBD'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">EBITDA</p>
                            <p className="font-bold text-gray-900">{opp.ebitda || 'TBD'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Growth</p>
                            <p className="font-bold text-gray-400">{opp.growth || '--'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Employees</p>
                            <p className="font-bold text-gray-400">{opp.employees || '--'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4">
                          <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Opportunity</span>
                          <span className="text-[10px] text-gray-500 italic">Anonymous</span>
                        </div>
                        <Link href={`/dms/teaser?project=${encodeURIComponent(opp.projectName)}`} className="block w-full">
                          <button className="w-full py-3 bg-[#0b1120] hover:bg-gray-800 text-white text-sm font-bold rounded transition-colors">
                            View Teaser
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!userRole && (
        <>
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
        </>
      )}
    </main>
  );
}
