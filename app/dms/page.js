"use client";

import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";
import { FaBars, FaTimes, FaUserTie, FaBuilding, FaHandshake, FaChartLine, FaShieldAlt, FaFileContract, FaKey, FaSearch, FaChevronDown, FaServer, FaBriefcase } from "react-icons/fa";

export default function DMSLanding() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 700,
      once: false,
      mirror: false,
      offset: 30,
      easing: 'ease-out-quad'
    });
  }, []);

  return (
    <main className="overflow-x-hidden relative w-full bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-50 py-4 px-4 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-16 lg:gap-24 flex-1">
          <div className="text-xl md:text-2xl font-bold text-gray-800 flex-shrink-0">
            <Link href="/"><i className="fas fa-shield-alt text-[var(--brand)] mr-2"></i> Secure DMS</Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <div className="relative group">
              <button className="flex items-center gap-2 font-semibold text-gray-700 hover:text-[var(--brand)] transition-colors text-lg py-2">
                Products
                <FaChevronDown className="text-sm transition-transform duration-300 group-hover:rotate-180" />
              </button>
              
              <div className="absolute top-10 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 w-72">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-full">
                  <Link href="/" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors group/item">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform">
                      <FaServer />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 group-hover/item:text-[var(--brand)]">Virtual Data Room</div>
                      <div className="text-xs text-gray-500">Secure document sharing</div>
                    </div>
                  </Link>
                  <Link href="/dms" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-50 group/item">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform">
                      <FaBriefcase />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 group-hover/item:text-[var(--brand)]">Deal Management System</div>
                      <div className="text-xs text-gray-500">End-to-end deal workflow</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            <Link href="/dms/marketplace" className="font-semibold text-gray-700 hover:text-[var(--brand)] transition-colors text-lg py-2">
              Marketplace
            </Link>
          </div>
        </div>
        
        <div className="hidden md:flex gap-4 items-center justify-end">
          <Link href="/login" className="btn-bo-hover px-5 py-2 border-2 border-[var(--brand)] text-[var(--brand)] rounded-full font-semibold transition-all duration-700 whitespace-nowrap">Sign In</Link>
          <Link href="/register" className="btn-bo-hover px-5 py-2 border-2 border-[var(--brand)] text-[var(--brand)] rounded-full font-semibold transition-all duration-700 whitespace-nowrap bg-[var(--brand)]/5">Sign Up</Link>
        </div>
        
        <button 
          className="md:hidden text-2xl text-[var(--brand)] focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-[68px] left-0 w-full bg-white shadow-md z-40 flex flex-col p-6 md:hidden gap-4 border-t border-gray-100 animate-fade-in">
          <div className="flex flex-col gap-2">
            <button className="flex justify-between items-center w-full px-5 py-3 font-semibold text-gray-700 bg-gray-50 rounded-lg">
              Products
              <FaChevronDown className="transition-transform duration-300" />
            </button>
            <div className="flex flex-col gap-2 pl-4 animate-fade-in">
              <Link href="/" className="flex items-center px-5 py-2 text-gray-600 hover:text-[var(--brand)] font-medium">
                <FaServer className="mr-3 text-[var(--brand)]" /> Virtual Data Room
              </Link>
              <Link href="/dms" className="flex items-center px-5 py-2 text-gray-600 hover:text-[var(--brand)] font-medium">
                <FaBriefcase className="mr-3 text-[var(--brand)]" /> Deal Management System
              </Link>
            </div>
            
            <Link href="/dms/marketplace" className="w-full px-5 py-3 font-semibold text-gray-700 bg-gray-50 rounded-lg hover:text-[var(--brand)] transition-colors">
              Marketplace
            </Link>
          </div>
          <Link href="/login" className="btn-bo-hover w-full text-center px-5 py-3 border-2 border-[var(--brand)] text-[var(--brand)] rounded-full font-semibold transition-all duration-700" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
          <Link href="/register" className="btn-bo-hover w-full text-center px-5 py-3 border-2 border-[var(--brand)] text-[var(--brand)] rounded-full font-semibold transition-all duration-700 bg-[var(--brand)]/5" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-16 bg-gradient-to-br from-indigo-900 via-blue-900 to-[var(--brand)] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center relative z-10">
          <div className="flex-1 md:pr-10 text-center md:text-left" data-aos="fade-right">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-semibold mb-6 border border-white/20">🚀 End-to-End M&A Platform</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">Master Your Deals From <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-200">Start to Close</span></h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto md:mx-0">Empowering Sellers and Buyers with a unified ecosystem for project creation, marketplace discovery, rigorous due diligence, and digital closings.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/business-owner/login" className="px-8 py-3 bg-white text-indigo-900 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2">Sell Your Business <FaBuilding /></Link>
              <Link href="/register" className="px-8 py-3 bg-transparent border-2 border-white/50 text-white rounded-full font-bold hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2">Join as Investor <FaChartLine /></Link>
            </div>
          </div>
          <div className="flex-1 mt-16 md:mt-0 w-full" data-aos="fade-left">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl relative">
              <div className="absolute -top-6 -right-6 bg-teal-400 text-teal-900 p-4 rounded-xl shadow-lg font-bold flex flex-col items-center animate-bounce">
                <FaHandshake className="text-3xl mb-1" /> Deal Closed!
              </div>
              <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center"><FaUserTie className="text-xl" /></div>
                <div>
                  <div className="font-bold">Project Alpha</div>
                  <div className="text-sm text-blue-200">SaaS Startup • $10M Revenue</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg"><span>1. VDR Setup</span><FaShieldAlt className="text-green-400" /></div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg"><span>2. NDA Signed</span><FaKey className="text-green-400" /></div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg"><span>3. Due Diligence</span><FaSearch className="text-green-400" /></div>
                <div className="flex justify-between items-center bg-blue-500 p-3 rounded-lg font-semibold shadow-inner"><span>4. SPA Closing</span><FaFileContract className="text-white" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Seller's Journey */}
      <section className="py-24 px-4 md:px-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">The Seller's Journey</h2>
            <p className="text-xl text-gray-500">A seamless pathway to list, market, and sell your company.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-indigo-100 -z-10 hidden lg:block transform -translate-y-1/2"></div>
            
            {/* Step 1 & 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow group" data-aos="fade-up" data-aos-delay="0">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">01</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Onboarding & Project Creation</h3>
              <p className="text-gray-600">Sign up and access your dashboard. Create a new confidential project by inputting industry and revenue metrics—completely hidden from the public.</p>
            </div>

            {/* Step 3 & 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow group" data-aos="fade-up" data-aos-delay="100">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">02</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">VDR Setup & Teaser Publishing</h3>
              <p className="text-gray-600">Upload structured documents (Financials, Legal) into the VDR. Generate an anonymous 'Teaser' and publish it live to the Buyer Marketplace.</p>
            </div>

            {/* Step 5, 6, 7 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow group" data-aos="fade-up" data-aos-delay="200">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">03</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Monitor, Q&A & Close</h3>
              <p className="text-gray-600">Approve buyers, enforce NDAs, and manage isolated Workspaces. Monitor audit logs, answer Q&As, review bids, and digitally sign the SPA.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Buyer's Journey */}
      <section className="py-24 px-4 md:px-16 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1" data-aos="fade-left">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">The Buyer's Journey</h2>
              <p className="text-xl text-gray-500 mb-8">Discover, analyze, and acquire premium businesses with confidence.</p>
              
              <div className="space-y-6">
                <div className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xl flex-shrink-0"><FaSearch /></div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">Explore Marketplace</h4>
                    <p className="text-gray-600">Browse anonymous teasers on our Deal Marketplace to find the perfect acquisition target.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl flex-shrink-0"><FaKey /></div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">Request Access & Sign NDA</h4>
                    <p className="text-gray-600">Express interest and instantly sign a digital e-Signature NDA upon Seller approval.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl flex-shrink-0"><FaShieldAlt /></div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">Due Diligence in Private Workspace</h4>
                    <p className="text-gray-600">Enter your secure VDR. Unveil the CIM, review classified documents, and ask direct questions via the Q&A module.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl flex-shrink-0"><FaHandshake /></div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">Submit Bid & Sign SPA</h4>
                    <p className="text-gray-600">Confidently submit your Letter of Intent (LOI). If accepted, sign the final SPA digitally to close the deal.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full" data-aos="fade-right">
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-inner relative">
                {/* Mockup UI of Buyer Dashboard */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-700">Deal Marketplace</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Live</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-100 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                      <div className="text-sm text-gray-400 mb-1">Teaser ID: #9042</div>
                      <div className="font-bold text-lg mb-2">Profitable SaaS Startup</div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">$10M Revenue</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Tech</span>
                      </div>
                      <button className="mt-4 w-full py-2 bg-indigo-600 text-white rounded font-medium text-sm hover:bg-indigo-700 transition-colors">Request NDA & Access</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Diagram Section */}
      <section className="py-24 px-4 md:px-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6" data-aos="fade-up">Where Journeys Intersect</h2>
          <p className="text-xl text-gray-500 mb-16 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">Our platform orchestrates the complex dance between Sellers and Buyers securely in real-time.</p>
          
          <div className="relative" data-aos="zoom-in" data-aos-delay="200">
            {/* Custom Visual Timeline */}
            <div className="flex flex-col md:flex-row items-center justify-between relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              {/* Connector line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-indigo-300 to-teal-200 hidden md:block -translate-y-1/2"></div>
              
              <div className="relative z-10 flex flex-col items-center bg-white p-4 rounded-xl w-48 mb-8 md:mb-0">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-4 border-4 border-white shadow-md"><FaBuilding /></div>
                <h4 className="font-bold text-gray-800">1. Publish Teaser</h4>
                <p className="text-xs text-gray-500 mt-2">Seller lists company</p>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-white p-4 rounded-xl w-48 mb-8 md:mb-0">
                <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl mb-4 border-4 border-white shadow-md"><FaKey /></div>
                <h4 className="font-bold text-gray-800">2. NDA & Access</h4>
                <p className="text-xs text-gray-500 mt-2">Buyer requests, Seller approves</p>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-white p-4 rounded-xl w-48 mb-8 md:mb-0">
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl mb-4 border-4 border-white shadow-md"><FaShieldAlt /></div>
                <h4 className="font-bold text-gray-800">3. Isolated VDR</h4>
                <p className="text-xs text-gray-500 mt-2">Due Diligence & Q&A phase</p>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-white p-4 rounded-xl w-48">
                <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-2xl mb-4 border-4 border-white shadow-md"><FaFileContract /></div>
                <h4 className="font-bold text-gray-800">4. SPA Closing</h4>
                <p className="text-xs text-gray-500 mt-2">Bid accepted, deal signed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-16 bg-indigo-900 text-center">
        <div className="max-w-3xl mx-auto" data-aos="zoom-in">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Streamline Your Next M&A Deal?</h2>
          <p className="text-indigo-200 text-lg mb-10">Join thousands of sellers and investors who trust our secure Deal Management System.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="px-8 py-4 bg-[var(--brand)] text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform duration-300">Create Your Account Today</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-xl font-bold"><i className="fas fa-shield-alt mr-2"></i> SecureVDR</h3>
              <p className="mt-3">Enterprise Data Rooms <br/>with next-gen security.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <p className="hover:text-white cursor-pointer transition-colors">Features</p>
              <p className="hover:text-white cursor-pointer transition-colors mt-2">Security</p>
              <p className="hover:text-white cursor-pointer transition-colors mt-2">Pricing</p>
              <p className="hover:text-white cursor-pointer transition-colors mt-2">API</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Resources</h4>
              <p className="hover:text-white cursor-pointer transition-colors">Help Center</p>
              <p className="hover:text-white cursor-pointer transition-colors mt-2">Webinars</p>
              <p className="hover:text-white cursor-pointer transition-colors mt-2">Compliance</p>
              <p className="hover:text-white cursor-pointer transition-colors mt-2">Blog</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contact</h4>
              <p><i className="fas fa-envelope mr-2"></i> hello@securevdr.com</p>
              <p className="mt-2"><i className="fas fa-phone-alt mr-2"></i> +1 (888) 452-8637</p>
              <div className="flex gap-4 mt-4 text-xl">
                <i className="fab fa-linkedin hover:text-white cursor-pointer transition-colors"></i>
                <i className="fab fa-twitter hover:text-white cursor-pointer transition-colors"></i>
                <i className="fab fa-github hover:text-white cursor-pointer transition-colors"></i>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
            &copy; 2026 SecureVDR — All rights reserved. Data protection at its core.
          </div>
        </div>
      </footer>

      {/* Custom styles */}
      <style jsx global>{`
        .btn-bo-hover {
          position: relative;
          z-index: 1;
        }
        .btn-bo-hover::before {
          content: "";
          position: absolute;
          top: -2px; bottom: -2px; left: -2px; right: -2px;
          border-radius: inherit;
          background: linear-gradient(to right, var(--brand), var(--brand-secondary, #3b82f6));
          z-index: -1;
          transition: clip-path 0.8s ease-out;
          clip-path: circle(0% at 50% 100%);
        }
        .btn-bo-hover:hover::before {
          clip-path: circle(150% at 50% 100%);
        }
        .btn-bo-hover:hover {
          color: white !important;
          border-color: transparent !important;
        }
        .btn-bo-hover:hover i {
          color: white !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
