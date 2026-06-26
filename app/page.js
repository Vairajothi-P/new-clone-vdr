"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";
import { FaFolderOpen } from "react-icons/fa";

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      once: false,
      mirror: false,
      offset: 30,
      easing: 'ease-out-quad'
    });

    const dashboard = document.querySelector('.dashboard-mock');
    if (dashboard) {
      const handleMouseEnter = () => {
        dashboard.style.transform = 'scale(1.01)';
      };
      const handleMouseLeave = () => {
        dashboard.style.transform = 'scale(1)';
      };
      
      dashboard.addEventListener('mouseenter', handleMouseEnter);
      dashboard.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        dashboard.removeEventListener('mouseenter', handleMouseEnter);
        dashboard.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  useEffect(() => {
    const scrollBtn = document.getElementById('scrollTopBtn');

    const handleScroll = () => {
      if (window.scrollY > 500 && scrollBtn) {
        scrollBtn.classList.add('show');
      } else if (scrollBtn) {
        scrollBtn.classList.remove('show');
      }
    };

    const handleClick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (scrollBtn) {
      window.addEventListener('scroll', handleScroll);
      scrollBtn.addEventListener('click', handleClick);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        scrollBtn.removeEventListener('click', handleClick);
      };
    }
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-50 py-4 px-8 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800">
          <i className="fas fa-shield-alt text-[var(--brand)] mr-2"></i> SecureVDR
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/documents" className="px-5 py-2 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-secondary)] text-white rounded-full font-semibold shadow-md shadow-[var(--brand)]/25 hover:from-[var(--brand-dark)] hover:to-[var(--brand-secondary)] hover:shadow-lg hover:shadow-[var(--brand)]/35 hover:scale-102 transition-all duration-300 flex items-center gap-2">
            <i className="fas fa-chart-line"></i> Dashboard
          </Link>
          <a href="/login" className="px-5 py-2 border-2 border-[var(--brand)] text-[var(--brand)] rounded-full font-semibold hover:bg-[var(--brand)]/10 transition-all duration-300">Login</a>
          <Link href="/register" className="px-5 py-2 border-2 border-[var(--brand)] text-[var(--brand)] rounded-full font-semibold hover:bg-[var(--brand)]/10 transition-all duration-300">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col md:flex-row items-center justify-between px-8 md:px-16 pt-32 pb-16 bg-gradient-to-br from-[var(--brand)]/10 to-[var(--brand-secondary)]/10">
        <div className="flex-1 max-w-xl" data-aos="fade-right" data-aos-duration="800">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-6">Secure Your Business Data with Smart VDR Platform</h1>
          <p className="text-xl text-gray-600 mb-8">IPO, Due Diligence, Legal Docs — All in One Place. Enterprise-grade security meets intelligent collaboration.</p>
          <div className="flex gap-4">
            <Link href="/documents" className="px-8 py-3 bg-[var(--brand)] text-white rounded-full font-semibold shadow-lg hover:bg-[var(--brand-dark)] hover:shadow-xl hover:scale-102 transition-all duration-300 flex items-center gap-2">Get Started <i className="fas fa-arrow-right"></i></Link>
            <button className="px-8 py-3 border-2 border-[var(--brand)] text-[var(--brand)] rounded-full font-semibold hover:bg-[var(--brand)]/10 transition-all duration-300 flex items-center gap-2">Request Demo <i className="fas fa-play"></i></button>
          </div>
        </div>
        <div className="flex-1 flex justify-center mt-12 md:mt-0" data-aos="fade-left" data-aos-duration="800">
          <div className="relative w-80 h-80">
            <div className="absolute top-0 left-0 bg-white p-5 rounded-2xl shadow-xl flex flex-col items-center gap-2 animate-float">
              <FaFolderOpen className="text-4xl text-[var(--brand)]" />
              <p className="font-semibold text-gray-700">Due Diligence</p>
            </div>
            <div className="absolute top-20 right-0 bg-white p-5 rounded-2xl shadow-xl flex flex-col items-center gap-2 animate-float-delayed">
              <i className="fas fa-lock text-4xl text-green-500"></i>
              <p className="font-semibold text-gray-700">Watermark Active</p>
            </div>
            <div className="absolute bottom-0 left-10 bg-white p-5 rounded-2xl shadow-xl flex flex-col items-center gap-2 animate-float">
              <i className="fas fa-chart-line text-4xl text-purple-500"></i>
              <p className="font-semibold text-gray-700">Analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 md:px-16 bg-white" data-aos="fade-up">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12">Powerful Features for Modern Data Rooms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center" data-aos="zoom-in" data-aos-delay="50">
            <i className="fas fa-fingerprint text-5xl text-brand mb-4"></i>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">🔐 Secure Authentication</h3>
            <p className="text-gray-600">SSO, MFA & granular access.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center" data-aos="zoom-in" data-aos-delay="100">
            <i className="fas fa-folder-tree text-5xl text-brand mb-4"></i>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">📁 Data Rooms</h3>
            <p className="text-gray-600">Organize files with drag & drop.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center" data-aos="zoom-in" data-aos-delay="150">
            <i className="fas fa-users-cog text-5xl text-brand mb-4"></i>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">👥 User Permissions</h3>
            <p className="text-gray-600">Role-based, fine-grained controls.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center" data-aos="zoom-in" data-aos-delay="200">
            <i className="fas fa-chart-pie text-5xl text-brand mb-4"></i>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">📊 Analytics Dashboard</h3>
            <p className="text-gray-600">Track views, downloads & heatmaps.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center" data-aos="zoom-in" data-aos-delay="250">
            <i className="fas fa-history text-5xl text-brand mb-4"></i>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">🧾 Audit Logs</h3>
            <p className="text-gray-600">Complete traceability & compliance.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center" data-aos="zoom-in" data-aos-delay="300">
            <i className="fas fa-comments text-5xl text-brand mb-4"></i>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">💬 Q&A Collaboration</h3>
            <p className="text-gray-600">Secure internal Q&A module.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-8 md:px-16 bg-gray-50">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12">How It Works — Simple 5 Steps</h2>
        <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md w-48 text-center" data-aos="flip-up" data-aos-delay="0">
            <div className="w-12 h-12 bg-[var(--brand)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
            <h4 className="font-semibold text-lg text-gray-800">Register Company</h4>
            <p className="text-gray-500 text-sm">Sign up & verify business</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md w-48 text-center" data-aos="flip-up" data-aos-delay="100">
            <div className="w-12 h-12 bg-[var(--brand)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
            <h4 className="font-semibold text-lg text-gray-800">Get Approval</h4>
            <p className="text-gray-500 text-sm">Fast KYC & onboarding</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md w-48 text-center" data-aos="flip-up" data-aos-delay="200">
            <div className="w-12 h-12 bg-[var(--brand)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
            <h4 className="font-semibold text-lg text-gray-800">Create Data Room</h4>
            <p className="text-gray-500 text-sm">Upload & organize</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md w-48 text-center" data-aos="flip-up" data-aos-delay="300">
            <div className="w-12 h-12 bg-[var(--brand)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
            <h4 className="font-semibold text-lg text-gray-800">Invite Users</h4>
            <p className="text-gray-500 text-sm">Add investors, admins</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md w-48 text-center" data-aos="flip-up" data-aos-delay="400">
            <div className="w-12 h-12 bg-[var(--brand)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">5</div>
            <h4 className="font-semibold text-lg text-gray-800">Securely Share</h4>
            <p className="text-gray-500 text-sm">Watermarked & expirable</p>
          </div>
        </div>
      </section>

      {/* Dashboard Mock */}
      <section className="py-20 px-8 md:px-16 bg-white" data-aos="fade-up" data-aos-offset="100">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12">Real-Time Analytics Dashboard</h2>
        <div className="dashboard-mock max-w-4xl mx-auto bg-gray-800 rounded-2xl p-6 shadow-xl transition-transform duration-300">
          <div className="flex justify-between text-white mb-6">
            <span><i className="fas fa-chart-simple mr-2"></i> Data Room Insights</span>
            <span><i className="fas fa-download mr-2"></i> Export logs</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-xl text-white" data-aos="fade-right" data-aos-delay="80">
              <i className="fas fa-eye mr-2"></i> <strong>1,284</strong> <span className="text-sm">views</span>
              <div className="h-2 bg-gray-600 rounded-full mt-2"><div className="h-2 bg-[var(--brand)]/70 rounded-full w-[70%]"></div></div>
            </div>
            <div className="bg-gray-700 p-4 rounded-xl text-white" data-aos="fade-up" data-aos-delay="150">
              <i className="fas fa-user-check mr-2"></i> <strong>42</strong> active users
            </div>
            <div className="bg-gray-700 p-4 rounded-xl text-white" data-aos="fade-left" data-aos-delay="220">
              <i className="fas fa-file-alt mr-2"></i> <strong>2.3k</strong> documents
            </div>
          </div>
          <div className="mt-5 bg-indigo-900/50 rounded-xl p-3 text-center text-gray-300" data-aos="zoom-in">
            <i className="fas fa-chart-line mr-2"></i> Document activity heatmap | Watermarked previews active
          </div>
          <div className="mt-4 text-xs text-center text-gray-400" data-aos="fade-up">
            Live audit trail & permission matrix
          </div>
        </div>
      </section>

      {/* Roles Cards */}
      <section className="py-20 px-8 md:px-16 bg-gray-50">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12">Granular Roles & Access Control</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center" data-aos="flip-left" data-aos-delay="0">
            <i className="fas fa-building text-5xl text-[var(--brand)] mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800">Company Owner</h3>
            <p className="text-gray-500">Full governance & master keys</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center" data-aos="flip-left" data-aos-delay="100">
            <i className="fas fa-crown text-5xl text-[var(--brand)] mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800">Super Admin</h3>
            <p className="text-gray-500">Platform-wide settings, audit</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center" data-aos="flip-left" data-aos-delay="200">
            <i className="fas fa-user-tie text-5xl text-[var(--brand)] mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800">Admin</h3>
            <p className="text-gray-500">Manage rooms & users</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center" data-aos="flip-left" data-aos-delay="300">
            <i className="fas fa-user-friends text-5xl text-[var(--brand)] mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800">External User</h3>
            <p className="text-gray-500">View-only + watermark</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-8 md:px-16 bg-white">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-50 p-6 rounded-xl shadow-md" data-aos="fade-right" data-aos-duration="600">
            <div className="flex gap-1 text-yellow-400 mb-4">
              <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
            </div>
            <p className="text-gray-700 italic">SecureVDR reduced our M&A document prep time by 50%. The watermarking and audit logs are unmatched.</p>
            <h4 className="font-semibold mt-4 text-gray-800">— Jessica Wu, VP at Meridian</h4>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow-md" data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            <div className="flex gap-1 text-yellow-400 mb-4">
              <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
            </div>
            <p className="text-gray-700 italic">Finally a VDR that combines enterprise security with a modern UI. Our legal team loves the Q&A module.</p>
            <h4 className="font-semibold mt-4 text-gray-800">— David O&#39;Brian, General Counsel
</h4>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow-md" data-aos="fade-left" data-aos-duration="600" data-aos-delay="200">
            <div className="flex gap-1 text-yellow-400 mb-4">
              <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
            </div>
            <p className="text-gray-700 italic">Best decision for our Series B fundraising. Real-time analytics helped us track investor interest.</p>
            <h4 className="font-semibold mt-4 text-gray-800">— Priya Mehta, CFO at StellarTech</h4>
          </div>
        </div>
      </section>

      {/* Security Stack */}
      <section className="py-20 px-8 md:px-16 bg-gray-50">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12">Military‑Grade Security Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center" data-aos="zoom-in-right">
            <i className="fas fa-fingerprint text-5xl text-brand mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800">🔒 Dynamic Watermarking</h3>
            <p className="text-gray-500">Prevent leaks with user-specific watermarks</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center" data-aos="zoom-in">
            <i className="fas fa-list-ul text-5xl text-brand mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800">📋 Activity Tracking</h3>
            <p className="text-gray-500">Every view, print, download logged</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center" data-aos="zoom-in-left">
            <i className="fas fa-shield-virus text-5xl text-brand mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800">🔐 End‑to‑End Encryption</h3>
            <p className="text-gray-500">AES-256 + TLS 1.3, secure vaults</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center" data-aos="zoom-in-left">
            <i className="fas fa-file-signature text-5xl text-brand mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800">📄 NDA enforcement</h3>
            <p className="text-gray-500">Customizable legal agreements</p>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="py-20 px-8 md:px-16 bg-white">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12">Trusted & Compliant Worldwide</h2>
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto" data-aos="fade-up">
          <div className="bg-gray-100 px-6 py-3 rounded-full flex items-center gap-2 font-semibold text-gray-700 shadow-sm" data-aos="flip-down" data-aos-delay="0">
            <i className="fas fa-shield-alt"></i> SOC 2 Type II
          </div>
          <div className="bg-gray-100 px-6 py-3 rounded-full flex items-center gap-2 font-semibold text-gray-700 shadow-sm" data-aos="flip-down" data-aos-delay="100">
            <i className="fas fa-euro-sign"></i> GDPR Compliant
          </div>
          <div className="bg-gray-100 px-6 py-3 rounded-full flex items-center gap-2 font-semibold text-gray-700 shadow-sm" data-aos="flip-down" data-aos-delay="200">
            <i className="fas fa-laptop-code"></i> ISO 27001
          </div>
          <div className="bg-gray-100 px-6 py-3 rounded-full flex items-center gap-2 font-semibold text-gray-700 shadow-sm" data-aos="flip-down" data-aos-delay="300">
            <i className="fas fa-cloud-upload-alt"></i> HIPAA Ready
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-8 md:px-16 bg-gray-50">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12">Flexible Plans for Every Business</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center" data-aos="fade-up" data-aos-delay="0">
            <h3 className="text-2xl font-bold text-gray-800">Basic</h3>
            <div className="text-5xl font-bold text-gray-800 mt-4">$249</div>
            <p className="text-gray-500">/month</p>
            <ul className="mt-6 space-y-2 text-left text-gray-600">
              <li><i className="fas fa-check-circle text-green-500 mr-2"></i> Up to 5 users</li>
              <li><i className="fas fa-check-circle text-green-500 mr-2"></i> 50 GB storage</li>
              <li><i className="fas fa-check-circle text-green-500 mr-2"></i> Basic analytics</li>
            </ul>
            <button className="mt-6 w-full py-2 border-2 border-[var(--brand)] text-[var(--brand)] rounded-full font-semibold hover:bg-[var(--brand)]/10 transition-all duration-300">Get Basic</button>
          </div>
          <div className="bg-[var(--brand)] text-white p-6 rounded-2xl shadow-xl scale-105 relative" data-aos="fade-up" data-aos-delay="150">
            <span className="absolute top-0 right-0 bg-yellow-400 text-gray-800 text-xs px-3 py-1 rounded-bl-xl rounded-tr-xl font-bold">Popular</span>
            <h3 className="text-2xl font-bold">Pro</h3>
            <div className="text-5xl font-bold mt-4">$599</div>
            <p className="text-[var(--brand)]/20">/month</p>
            <ul className="mt-6 space-y-2 text-left">
              <li><i className="fas fa-check-circle mr-2"></i> Unlimited users</li>
              <li><i className="fas fa-check-circle mr-2"></i> 500 GB + advanced logs</li>
              <li><i className="fas fa-check-circle mr-2"></i> Audit & watermarks</li>
            </ul>
            <button className="mt-6 w-full py-2 bg-white text-[var(--brand)] rounded-full font-semibold hover:bg-gray-100 transition-all duration-300">Start Pro</button>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center" data-aos="fade-up" data-aos-delay="300">
            <h3 className="text-2xl font-bold text-gray-800">Enterprise</h3>
            <div className="text-5xl font-bold text-gray-800 mt-4">Custom</div>
            <p className="text-gray-500">Tailored solutions</p>
            <ul className="mt-6 space-y-2 text-left text-gray-600">
              <li><i className="fas fa-check-circle text-green-500 mr-2"></i> SSO + API access</li>
              <li><i className="fas fa-check-circle text-green-500 mr-2"></i> Dedicated support</li>
              <li><i className="fas fa-check-circle text-green-500 mr-2"></i> Compliance (GDPR/SOC2)</li>
            </ul>
            <button className="mt-6 w-full py-2 border-2 border-[var(--brand)] text-[var(--brand)] rounded-full font-semibold hover:bg-[var(--brand)]/10 transition-all duration-300">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-8 md:px-16">
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

      {/* Scroll to Top Button */}
      <div id="scrollTopBtn" className="fixed bottom-6 right-6 bg-[var(--brand)] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer opacity-0 invisible transition-all duration-300 hover:bg-[var(--brand-dark)] z-50 show:opacity-100 show:visible">
        <i className="fas fa-arrow-up"></i>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4.5s ease-in-out infinite;
        }
        #scrollTopBtn.show {
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>
    </>
  );
}