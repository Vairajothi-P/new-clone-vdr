"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaCog,
  FaShieldAlt,
  FaHome,
  FaUsers
} from "react-icons/fa";

import {
  FiShield,
  FiFolder,
  FiSettings,
  FiHome
} from "react-icons/fi";

export default function MainSidebar() {
  const pathname = usePathname();

  const isDocumentsActive = pathname?.startsWith('/documents');
  const isSettingsActive = pathname?.startsWith('/settings');
  const isGroupsActive = pathname?.startsWith('/groups');

  return (
    <aside className="w-16 md:w-20 bg-white border-r border-gray-200 flex flex-col justify-between items-center py-6 h-full shrink-0 select-none z-50 shadow-sm">
      <div className="flex flex-col items-center gap-8 w-full">
        <Link href="/" className="group relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-900 to-slate-800 flex items-center justify-center shadow-md shadow-gray-950/10 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            <FiShield className="text-white text-lg" strokeWidth={2.8} />
          </div>
          <span className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
            SecureVDR Home
          </span>
        </Link>
        <div className="w-8 h-[1px] bg-gray-200" />
        <nav className="flex flex-col items-center gap-4 w-full px-2">
          <Link
            href="/documents"
            className="group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300"
          >
            {isDocumentsActive && (
              <div className="absolute left-0 w-1 h-8 bg-gray-900 rounded-r-md" />
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isDocumentsActive
              ? 'bg-gray-100 text-gray-900 shadow-inner font-semibold'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              <FiFolder className="text-lg md:text-xl transition-transform duration-300 group-hover:scale-110" strokeWidth={2.8} />
            </div>
            <span className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
              Documents Vault
            </span>
          </Link>
          <Link
            href="/groups"
            className="group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300"
          >
            {isGroupsActive && (
              <div className="absolute left-0 w-1 h-8 bg-gray-900 rounded-r-md" />
            )}

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isGroupsActive
                ? 'bg-gray-100 text-gray-900 shadow-inner font-semibold'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              <FaUsers className="text-lg md:text-xl transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
              VDR Groups
            </span>
          </Link>
          <Link
            href="/settings"
            className="group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300"
          >
            {isSettingsActive && (
              <div className="absolute left-0 w-1 h-8 bg-gray-900 rounded-r-md" />
            )}

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isSettingsActive
              ? 'bg-gray-100 text-gray-900 shadow-inner font-semibold'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              <FiSettings className="text-lg md:text-xl transition-transform duration-300 group-hover:scale-110" strokeWidth={2.8} />
            </div>
            <span className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
              VDR Settings
            </span>
          </Link>
        </nav>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <Link
          href="/"
          className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
        >
          <FiHome className="text-lg" strokeWidth={2.8} />
          <span className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
            Exit to Landing
          </span>
        </Link>
        <div className="group relative w-10 h-10 flex items-center justify-center cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-slate-900 flex items-center justify-center text-white text-xs font-bold border-2 border-gray-200 shadow-sm hover:border-gray-400 transition-all duration-300">
            AS
          </div>
          <span className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
            Anushiya S. (Admin)
          </span>
        </div>
      </div>
    </aside>
  );
}
