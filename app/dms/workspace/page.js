"use client";

import { useState, useEffect } from "react";
import { FaPowerOff, FaCog, FaDatabase, FaPlus, FaEllipsisV, FaShieldAlt, FaBell } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WorkspaceDashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('dms_projects');
    if (saved) {
      try {
        setWorkspaces(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse projects", e);
      }
    }
  }, []);

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (projectName.trim()) {
      const updatedWorkspaces = [...workspaces, { name: projectName, status: "ACTIVE" }];
      setWorkspaces(updatedWorkspaces);
      localStorage.setItem('dms_projects', JSON.stringify(updatedWorkspaces));
      setIsModalOpen(false);
      setProjectName("");
      setProjectDesc("");
    }
  };

  const handleDeleteProject = (name) => {
    const updatedWorkspaces = workspaces.filter(ws => ws.name !== name);
    setWorkspaces(updatedWorkspaces);
    localStorage.setItem('dms_projects', JSON.stringify(updatedWorkspaces));
    
    // Remove related teasers from the marketplace
    const marketTeasers = JSON.parse(localStorage.getItem('dms_market_teasers') || '[]');
    const updatedTeasers = marketTeasers.filter(teaser => teaser.projectName !== name);
    localStorage.setItem('dms_market_teasers', JSON.stringify(updatedTeasers));
    
    setOpenDropdownId(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative p-8 md:p-16 flex justify-center items-start font-sans">
      
      {/* Top Right Buttons */}
      <div className="absolute top-8 right-8 flex items-center gap-3">
        <Link href="/dms/login">
          <button className="w-10 h-10 rounded-full border border-red-200 bg-white text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm">
            <FaPowerOff className="text-sm" />
          </button>
        </Link>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl min-h-[60vh] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-12 flex flex-col">
        
        {/* Header Row */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Vishwa Tech</h1>
            <span className="px-3 py-1 bg-[#e6fbf2] text-[#00c875] text-xs font-bold rounded-full tracking-wide">Seller</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded pl-3 pr-8 py-1.5 outline-none hover:border-gray-300 transition-colors cursor-pointer shadow-sm">
                <option>Active</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f0f7f8] text-[#337a85] flex items-center justify-center">
                <FaDatabase className="text-sm" />
              </div>
              <div className="flex flex-col w-32">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold mb-1">
                  <span>0 KB / 50 GB</span>
                  <span>[0%]</span>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#337a85] w-0"></div>
                </div>
              </div>
            </div>

            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <FaCog className="text-lg" />
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-8 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* Add New Workspace Card */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="h-44 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-gray-400 hover:bg-gray-50 transition-all group"
            >
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
                <FaPlus />
              </div>
              <span className="text-[13px] text-gray-500 font-medium">Add New Project</span>
            </button>

            {/* Existing Workspaces */}
            {workspaces.map((workspace, index) => (
              <div 
                onClick={() => router.push(`/dms/deal?project=${encodeURIComponent(workspace.name)}`)} 
                key={index} 
                className="block cursor-pointer"
              >
                <div className="h-44 bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] p-4 relative flex flex-col hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-auto">
                    <span className="px-2 py-0.5 bg-[#e6fbf2] text-[#00c875] text-[9px] font-bold rounded">
                      {workspace.status}
                    </span>
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === workspace.name ? null : workspace.name);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 opacity-60 hover:opacity-100"
                      >
                        <FaEllipsisV className="text-[11px]" />
                      </button>
                      
                      {openDropdownId === workspace.name && (
                        <div className="absolute right-0 mt-1 w-24 bg-white rounded-md shadow-lg border border-gray-100 z-10 overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(workspace.name);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center flex-1 gap-2 pb-2">
                    <FaShieldAlt className="text-4xl text-[#65a3ab] group-hover:scale-105 transition-transform" />
                    <span className="font-bold text-gray-800 text-sm mt-1">{workspace.name}</span>
                  </div>
                </div>
              </div>
            ))}
            
          </div>
        </div>
      </div>

      {/* Bottom Left Logo */}
      <div className="fixed bottom-6 left-6 w-8 h-8 rounded-full bg-[#303030] text-white flex items-center justify-center shadow-lg font-serif italic text-sm">
        N
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Project Name</label>
                <input 
                  type="text" 
                  required 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875]"
                  placeholder="Enter project name..."
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Project Description</label>
                <textarea 
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c875]"
                  rows="3"
                  placeholder="Enter project description..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#00c875] hover:bg-[#00a863] text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
