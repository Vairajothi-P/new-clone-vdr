"use client";

import { useEffect, useState } from 'react';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const isGroupsActive = pathname?.startsWith('/groups');

  // 🔥 Check the session when the sidebar loads
  useEffect(() => {
    const rawSession = localStorage.getItem('vdr_session');
    if (rawSession) {
      const session = JSON.parse(rawSession);
      // Only set to true if the role is exactly 'admin'
      setIsAdmin(session.role === 'admin');
    }
  }, []);

  return (
    <aside className="w-16 md:w-20 h-screen bg-white border-r border-slate-200 flex flex-col items-center py-6 shrink-0 z-50">

      {/* Top Logo / App Icon */}
      <Link href="/dashboard" className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center mb-8 hover:opacity-80 transition-opacity shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </Link>

      {/* Standard Nav Items (Visible to everyone) */}
      <div className="flex flex-col gap-4">
        <Link
          href="/documents"
          className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${pathname.startsWith('/settings')
            ? 'bg-slate-900 text-white shadow-md'
            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            }`}
          title="Documents"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </Link>
      </div>
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
          Groups
        </span>
      </Link>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-4">

        {/* 🔥 SETTINGS BUTTON: ONLY RENDERS IF isAdmin is TRUE */}
        {isAdmin && (
          <Link
            href="/settings"
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${pathname.startsWith('/settings')
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={pathname.startsWith('/settings') ? 'animate-[spin_4s_linear_infinite]' : ''}>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </Link>
        )}
      </div>

      {/* Profile / Logout Button (Visible to everyone) */}
      <div className="mt-auto flex flex-col items-center gap-4">
        <button
          onClick={() => {
            localStorage.removeItem('vdr_session');
            window.location.href = '/login';
          }}
          className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 mt-2"
          title="Sign Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>

      </div>
    </aside >
  );
}




// "use client";

// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   FaCog,
//   FaShieldAlt,
//   FaHome,
//   FaUsers
// } from "react-icons/fa";

// import {
//   FiShield,
//   FiFolder,
//   FiSettings,
//   FiHome
// } from "react-icons/fi";

// export default function MainSidebar() {
//   const pathname = usePathname();
//   const [user, setUser] = useState(null);
//   const [isMounted, setIsMounted] = useState(false);

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         if (typeof window !== 'undefined') {
//           const storedUser = localStorage.getItem('user');
//           if (storedUser) {
//             const parsedUser = JSON.parse(storedUser);
//             // Validate that parsedUser has required fields
//             if (parsedUser && typeof parsedUser === 'object' && parsedUser.name && parsedUser.role) {
//               setUser(parsedUser);
//             } else {
//               // Clear invalid user data
//               localStorage.removeItem('users');
//               setUser(null);
//             }
//           }
//         }
//       } catch (error) {
//         console.error('Error loading user from localStorage:', error);
//         // Clear corrupted data
//         if (typeof window !== 'undefined') {
//           localStorage.removeItem('user');
//         }
//         setUser(null);
//       } finally {
//         setIsMounted(true);
//       }
//     };

//     loadUser();
//   }, []);

//   // Get initials from user name
//   const getInitials = (name) => {
//     if (!name || typeof name !== 'string') return 'U';
//     return name
//       .split(' ')
//       .map(word => word.charAt(0))
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const isDocumentsActive = pathname?.startsWith('/documents');
//   const isSettingsActive = pathname?.startsWith('/settings');
//   const isGroupsActive = pathname?.startsWith('/groups');

//   return (
//     <aside className="w-16 md:w-20 bg-white border-r border-gray-200 flex flex-col justify-between items-center py-6 h-full shrink-0 select-none z-50 shadow-sm">
//       <div className="flex flex-col items-center gap-8 w-full">
//         <Link href="/" className="group relative flex items-center justify-center">
//           <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-900 to-slate-800 flex items-center justify-center shadow-md shadow-gray-950/10 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
//             <FiShield className="text-white text-lg" strokeWidth={2.8} />
//           </div>
//           <span className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
//             SecureVDR Home
//           </span>
//         </Link>
//         <div className="w-8 h-[1px] bg-gray-200" />
//         <nav className="flex flex-col items-center gap-4 w-full px-2">
//           <Link
//             href="/documents"
//             className="group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300"
//           >
//             {isDocumentsActive && (
//               <div className="absolute left-0 w-1 h-8 bg-gray-900 rounded-r-md" />
//             )}
//             <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isDocumentsActive
//               ? 'bg-gray-100 text-gray-900 shadow-inner font-semibold'
//               : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
//               }`}>
//               <FiFolder className="text-lg md:text-xl transition-transform duration-300 group-hover:scale-110" strokeWidth={2.8} />
//             </div>
//             <span className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
//               Documents Vault
//             </span>
//           </Link>
//           <Link
//             href="/groups"
//             className="group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300"
//           >
//             {isGroupsActive && (
//               <div className="absolute left-0 w-1 h-8 bg-gray-900 rounded-r-md" />
//             )}

//             <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isGroupsActive
//                 ? 'bg-gray-100 text-gray-900 shadow-inner font-semibold'
//                 : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
//               }`}>
//               <FaUsers className="text-lg md:text-xl transition-transform duration-300 group-hover:scale-110" />
//             </div>
//             <span className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
//               VDR Groups
//             </span>
//           </Link>
//           <Link
//             href="/settings"
//             className="group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300"
//           >
//             {isSettingsActive && (
//               <div className="absolute left-0 w-1 h-8 bg-gray-900 rounded-r-md" />
//             )}

//             <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isSettingsActive
//               ? 'bg-gray-100 text-gray-900 shadow-inner font-semibold'
//               : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
//               }`}>
//               <FiSettings className="text-lg md:text-xl transition-transform duration-300 group-hover:scale-110" strokeWidth={2.8} />
//             </div>
//             <span className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
//               VDR Settings
//             </span>
//           </Link>
//         </nav>
//       </div>

//       <div className="flex flex-col items-center gap-4 w-full">
//         <Link
//           href="/"
//           className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
//         >
//           <FiHome className="text-lg" strokeWidth={2.8} />
//           <span className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
//             Exit to Landing
//           </span>
//         </Link>

//         {/* Dynamic User Profile */}
//         {isMounted && (
//           <div className="group relative w-10 h-10 flex items-center justify-center cursor-pointer">
//             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-slate-900 flex items-center justify-center text-white text-xs font-bold border-2 border-gray-200 shadow-sm hover:border-gray-400 transition-all duration-300">
//               {user ? getInitials(user.name) : 'U'}
//             </div>
//             <span className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
//               {user ? `${user.name} (${user.role})` : 'User'}
//             </span>
//           </div>
//         )}
//       </div>
//     </aside>
//   );
// }