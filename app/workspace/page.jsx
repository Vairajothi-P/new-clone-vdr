"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaCog, FaPlus, FaTimes, FaShieldAlt, FaCheck, FaDatabase } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import WorkspaceModal from "@/components/workspaces/WorkspaceModal";

export default function WorkspacePage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState("Loading...");
  const [userRole, setUserRole] = useState("User");
  const [workspaces, setWorkspaces] = useState([]);
  
  useEffect(() => {
    const fetchCompanyData = async () => {
      const sessionData = localStorage.getItem('vdr_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        setUserRole(session.role || "User");
        
        if (session.company_id) {
          try {
            const res = await fetch(`/api/companies/${session.company_id}`);
            const data = await res.json();
            if (data.company) {
              setCompanyName(data.company.name);
            } else {
              setCompanyName("My Workspace");
            }
          } catch (err) {
            console.error("Failed to fetch company", err);
            setCompanyName("My Workspace");
          }
        }
      }
    };
    fetchCompanyData();
  }, []);

  const handleCreateWorkspace = (data) => {
    console.log("Workspace Created:", data);
    setWorkspaces((prev) => [...prev, { id: Date.now(), ...data }]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 flex flex-col items-center">
      
      {/* Main App Container */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 bg-white border-b border-gray-100">
          
          {/* Left: Organization Name & Badge */}
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              {companyName}
            </h1>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
              {userRole}
            </span>
          </div>

          {/* Right: Controls & Storage */}
          <div className="flex flex-wrap items-center gap-6 md:gap-8 w-full md:w-auto justify-between md:justify-end">
            
            {/* Status Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm min-w-[110px] justify-between"
              >
                <span>{selectedStatus}</span>
                <FiChevronDown className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                  <button 
                    onClick={() => { setSelectedStatus("Active"); setIsDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    Active
                    {selectedStatus === "Active" && <FaCheck className="text-emerald-500 text-xs" />}
                  </button>
                  <button 
                    onClick={() => { setSelectedStatus("Inactive"); setIsDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    Inactive
                    {selectedStatus === "Inactive" && <FaCheck className="text-emerald-500 text-xs" />}
                  </button>
                </div>
              )}
            </div>

            {/* Storage Info Area */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 shadow-sm border border-blue-100/50">
                <FaDatabase size={18} />
              </div>
              <div className="flex flex-col w-48">
                <div className="flex justify-between items-center text-xs font-medium mb-1.5 text-gray-600">
                  <span>0 KB / 50 GB</span>
                  <span className="text-gray-400">(0%)</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>

            {/* Settings Icon */}
            <button className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100">
              <FaCog size={20} />
            </button>

          </div>
        </div>

        {/* Content Section: Workspaces Grid */}
        <div className="p-6 md:p-8 bg-slate-50/50 min-h-[400px]">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* 1. Add New Workspace Card */}
            <button onClick={() => setIsModalOpen(true)} className="group w-full h-full text-left focus:outline-none">
              <div className="h-48 border-2 border-dashed border-gray-300 rounded-xl bg-transparent hover:bg-white hover:border-[var(--brand)] hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center cursor-pointer">
                <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[var(--brand)] group-hover:scale-110 transition-all duration-300 shadow-md">
                  <FaPlus size={24} />
                </div>
                <span className="text-gray-500 font-medium group-hover:text-slate-800 transition-colors">
                  Add new workspace
                </span>
              </div>
            </button>

            {/* Render Created Workspaces */}
            {workspaces.map((ws) => (
              <Link href="/documents" key={ws.id} className="group">
                <div className="h-48 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col relative">
                  {/* Top Row: Badge & Close */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase tracking-wider">
                      Active
                    </span>
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); // Prevent Link navigation
                        setWorkspaces(workspaces.filter(w => w.id !== ws.id)) 
                      }} 
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                  
                  {/* Center Icon & Title */}
                  <div className="flex-1 flex flex-col items-center justify-center -mt-2">
                    <div className="text-slate-800 mb-3 opacity-90 group-hover:opacity-100 transition-opacity">
                      <FaShieldAlt size={40} className="text-[var(--brand)]/80" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm text-center line-clamp-2">
                      {ws.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}

          </div>
        </div>
      </div>

      <WorkspaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateWorkspace} 
      />
    </div>
  );
}
