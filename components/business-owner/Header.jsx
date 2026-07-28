"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  FaBars,
  FaSearch,
  FaUserShield,
  FaSignOutAlt,
  FaCog,
} from 'react-icons/fa';

export default function Header({ onOpenSidebar }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('vdr_session');
    if (raw) {
      try {
        setSession(JSON.parse(raw));
      } catch (err) {
        console.error('Failed to parse session:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vdr_session');
    document.cookie = "vdr_super_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    router.push('/business-owner/login');
  };

  const getPageTitle = () => {
    if (pathname === '/business-owner') return 'System Overview';
    if (pathname?.startsWith('/business-owner/organizations')) return 'Organizations';
    if (pathname?.startsWith('/business-owner/storage')) return 'Storage & Quotas';
    if (pathname?.startsWith('/business-owner/plans')) return 'Subscription Plans';
    if (pathname?.startsWith('/business-owner/email-templates')) return 'Email Templates';
    if (pathname?.startsWith('/business-owner/settings')) return 'Settings';
    return 'Business Owner Portal';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block w-64">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">
            <FaSearch />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search organizations..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all"
          />
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--brand)] flex items-center justify-center text-white text-sm font-bold shadow-2xs">
              <FaUserShield />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-[13.5px] font-semibold text-slate-900 block leading-none">
                {session?.name || 'Anushiya Selvaraj'}
              </span>
              <span className="text-xs text-[var(--brand)] font-medium block mt-0.5">
                Business Owner
              </span>
            </div>
          </button>

          {/* Dropdown Card */}
          {showDropdown && (
            <>
              <div
                onClick={() => setShowDropdown(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-slate-700">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900">
                    {session?.name || 'Anushiya Selvaraj'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {session?.email || 'owner@pibivdr.com'}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/business-owner/settings"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors font-medium"
                  >
                    <FaCog className="text-slate-400" />
                    <span>Profile &amp; Settings</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors font-medium text-left"
                  >
                    <FaSignOutAlt className="text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
