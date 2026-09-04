"use client";

import Link from "next/link";
import { FaFolder, FaFolderOpen, FaFileAlt, FaSearch, FaBell, FaCog, FaSignOutAlt, FaChartBar, FaUsers, FaPlus, FaEllipsisV } from "react-icons/fa";

export default function Workspace() {
  const folders = [
    { name: "Due Diligence (Project Alpha)", files: 142, size: "1.2 GB", date: "Today, 10:30 AM", color: "text-blue-500" },
    { name: "Financial Statements 2023", files: 24, size: "145 MB", date: "Yesterday", color: "text-green-500" },
    { name: "Legal & Compliance", files: 89, size: "450 MB", date: "Sep 1, 2023", color: "text-yellow-500" },
    { name: "HR & Employee Records", files: 312, size: "890 MB", date: "Aug 28, 2023", color: "text-purple-500" },
    { name: "Intellectual Property", files: 15, size: "56 MB", date: "Aug 15, 2023", color: "text-red-500" },
    { name: "Board Minutes", files: 42, size: "112 MB", date: "Jul 30, 2023", color: "text-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0b1120] text-gray-300 flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2 text-white">
            <i className="fas fa-shield-alt text-[#3b82f6] text-xl"></i>
            <span className="font-bold text-xl tracking-tight">Secure DMS</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Menu</p>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-[#3b82f6]/10 text-white rounded-lg transition-colors">
            <FaFolderOpen className="text-[#3b82f6]" /> 
            <span className="font-medium">My Workspace</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
            <FaChartBar /> 
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
            <FaUsers /> 
            <span className="font-medium">Shared with Me</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
            <FaFileAlt /> 
            <span className="font-medium">Recent Files</span>
          </a>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg transition-colors mb-2">
            <FaCog /> 
            <span className="font-medium">Settings</span>
          </a>
          <Link href="/dms" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-red-400 rounded-lg transition-colors">
            <FaSignOutAlt /> 
            <span className="font-medium">Log out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="text-xl font-bold text-gray-800">My Workspace</div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search files, folders..." className="pl-10 pr-4 py-2 w-64 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-[#3b82f6] outline-none text-sm transition-all focus:w-80" />
            </div>
            
            <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
              <FaBell className="text-xl" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Corporate Development</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#0b1120] text-white flex items-center justify-center font-bold">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Area */}
        <div className="p-8 flex-1 overflow-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Folders</h2>
            <button className="bg-[#3b82f6] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
              <FaPlus /> New Folder
            </button>
          </div>

          {/* Folder Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {folders.map((folder, index) => (
              <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-[#3b82f6]/50 group cursor-pointer relative">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaEllipsisV />
                </button>
                <FaFolder className={`text-5xl ${folder.color} mb-4 group-hover:scale-105 transition-transform`} />
                <h3 className="font-bold text-gray-800 mb-1 truncate">{folder.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{folder.files} files &bull; {folder.size}</p>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Modified: {folder.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                  <FaFileAlt />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800">Q3_Financial_Report.pdf</h4>
                  <p className="text-xs text-gray-500">Uploaded to Due Diligence (Project Alpha)</p>
                </div>
                <div className="text-xs text-gray-400">10 mins ago</div>
              </div>
              <div className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center text-green-600">
                  <FaFileAlt />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800">NDA_ProjectAlpha_Signed.pdf</h4>
                  <p className="text-xs text-gray-500">Uploaded to Due Diligence (Project Alpha)</p>
                </div>
                <div className="text-xs text-gray-400">2 hours ago</div>
              </div>
              <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <FaFolder />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800">Legal & Compliance</h4>
                  <p className="text-xs text-gray-500">Folder created by John Doe</p>
                </div>
                <div className="text-xs text-gray-400">Yesterday</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
